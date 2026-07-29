/**
 * Shared Airtable read cache for api/*.js — one module-scope entry per
 * (table, filter) combination, reused across all read endpoints. Two
 * problems this solves at once:
 *
 * 1. get-hamper.js and get-featured-hampers.js both need the full list of
 *    Published Products (one for its "related products" algorithm, one for
 *    the homepage/explore grid) but used to fetch it independently on every
 *    request. Since both call getCachedTable('Products', SAME_FILTER, ...),
 *    they now transparently share one cached fetch.
 * 2. Every warm Vercel serverless instance keeps its own copy of this cache,
 *    so repeat/concurrent requests hitting the same warm instance stop
 *    re-fetching Airtable within the TTL window -- a major contributor to
 *    the 429 (rate-limit) outages this base has hit, since Airtable's 5
 *    requests/second cap is base-wide, not per-caller.
 *
 * Also fixes a latent correctness bug: Airtable caps each *page* of a list
 * request at 100 records regardless of maxRecords -- maxRecords only bounds
 * a multi-page fetch, it doesn't make a single page return more than 100.
 * fetchAllRecords() below follows the `offset` pagination token across
 * pages instead, so a table that grows past 100 published rows won't
 * silently truncate.
 *
 * Files/folders prefixed with "_" are ignored by Vercel's filesystem
 * routing, so this is a plain module, not its own endpoint (same
 * convention as _lib/cors.js).
 */

var AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
var BASE_ID = process.env.AIRTABLE_BASE_ID;
// ~13 months: every Airtable change triggers an immediate refresh via
// webhook, and the daily Vercel Cron acts as a safety net. This cache
// entry is therefore refreshed on every data change, and the TTL only
// matters if *both* refresh paths fail simultaneously for weeks. This
// makes the TTL effectively "lasts until the next Airtable ping" in
// normal operation, while still bounding the worst-case stale-read
// window to a safe fallback.
var DEFAULT_TTL_MS = 400 * 24 * 60 * 60 * 1000;
var MAX_PAGES = 10; // 1000-record ceiling; generous for this catalog's scale

// Optional durable cross-instance buffer (Upstash Redis, plain REST calls --
// no SDK, no package.json). Purely opt-in: if these env vars are absent,
// this module behaves exactly like the in-memory-only Layer 1/2 cache. If
// KV is enabled, the Redis buffer is authoritative and durable: keys are
// written without expiry, and a missing/unreadable KV entry is treated as a
// hard error rather than silently falling back to live Airtable.
//
// Two naming conventions are accepted: UPSTASH_REDIS_REST_URL/TOKEN (what
// you get copying values directly from Upstash's own dashboard) and
// KV_REST_API_URL/TOKEN (what Vercel auto-generates when you attach Upstash
// via its native Storage integration instead). KV_REST_API_TOKEN is the
// read-write token -- KV_REST_API_READ_ONLY_TOKEN is intentionally not used
// here, since this module both reads and writes the buffer.
var UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
var UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
var KV_ENABLED = !!(UPSTASH_URL && UPSTASH_TOKEN);

var cacheStore = {}; // key -> { records, fetchedAt, inFlight }

// Issues one Redis command via Upstash's generic REST passthrough (POST a
// JSON array mirroring the raw command, e.g. ["SET","key","value","EX","60"])
// rather than path-segment-encoded commands -- avoids any URL-encoding
// ambiguity for values that may contain special characters.
async function kvCommand(args) {
  var response = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + UPSTASH_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  if (!response.ok) {
    throw new Error('Upstash command failed: ' + response.status);
  }
  var data = await response.json();
  if (data.error) throw new Error('Upstash error: ' + data.error);
  return data.result;
}

// Fails open (returns null, i.e. "treat as cache miss") on any KV error so a
// KV outage/misconfiguration falls through to Airtable rather than erroring.
async function kvGet(key) {
  if (!KV_ENABLED) return null;
  try {
    var raw = await kvCommand(['GET', key]);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    throw new Error('airtableCache: KV get failed for ' + key + ': ' + error.message);
  }
}

// Writes without expiry into the durable KV buffer. When KV is enabled,
// failures are treated as fatal so updates are only accepted when the
// underlying durable buffer write actually succeeds.
async function kvSet(key, value) {
  if (!KV_ENABLED) return;
  try {
    await kvCommand(['SET', key, JSON.stringify(value)]);
  } catch (error) {
    throw new Error('airtableCache: KV set failed for ' + key + ': ' + error.message);
  }
}

// Raw (non-JSON, no TTL) get/set for permanent small metadata values -- e.g.
// api/register-airtable-webhook.js storing the registered Airtable webhook
// id, and api/cron/refresh-cache.js's attachment-id -> Blob-URL mirror map.
// Exported so those callers share one KV implementation/env-var resolution
// instead of each rolling their own.
async function kvGetRaw(key) {
  if (!KV_ENABLED) return null;
  try {
    return await kvCommand(['GET', key]);
  } catch (error) {
    console.error('airtableCache: KV get failed for ' + key + ':', error.message);
    return null;
  }
}

async function kvSetRaw(key, value) {
  if (!KV_ENABLED) return;
  try {
    await kvCommand(['SET', key, value]);
  } catch (error) {
    console.error('airtableCache: KV set failed for ' + key + ':', error.message);
  }
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

// Fetches one page, retrying once on a 429 (respecting Retry-After when
// Airtable sends it) instead of immediately giving up or hammering again.
async function fetchOnePage(tableName, filterFormula, extraParams, offset) {
  var params = 'filterByFormula=' + encodeURIComponent(filterFormula);
  if (extraParams) params += '&' + extraParams;
  if (offset) params += '&offset=' + offset;
  var url = 'https://api.airtable.com/v0/' + BASE_ID + '/' + encodeURIComponent(tableName) + '?' + params;

  var response = await fetch(url, { headers: { Authorization: 'Bearer ' + AIRTABLE_API_KEY } });

  if (response.status === 429) {
    var retryAfterHeader = response.headers.get('Retry-After');
    var retryAfterMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 1000;
    if (!retryAfterMs || retryAfterMs <= 0) retryAfterMs = 1000;
    await sleep(retryAfterMs);
    response = await fetch(url, { headers: { Authorization: 'Bearer ' + AIRTABLE_API_KEY } });
  }

  if (!response.ok) {
    var err = new Error('Airtable connection failed: ' + response.status);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

// Fetches every page of a filtered table list, following Airtable's
// `offset` token until it stops returning one (or MAX_PAGES is hit).
async function fetchAllRecords(tableName, filterFormula, extraParams) {
  var allRecords = [];
  var offset = null;
  var pageCount = 0;

  do {
    var data = await fetchOnePage(tableName, filterFormula, extraParams, offset);
    allRecords = allRecords.concat(data.records || []);
    offset = data.offset || null;
    pageCount++;
  } while (offset && pageCount < MAX_PAGES);

  return allRecords;
}

// Returns cached records for (tableName, filterFormula[, extraParams]):
// - fresh cache hit -> resolves immediately, no network call
// - stale/missing, no fetch in flight -> starts one, caches the result
// - stale/missing, fetch already in flight (e.g. two endpoints on the same
//   warm instance both asked at once) -> both callers share that one promise
// - fetch fails but a previous successful result exists -> serves that
//   stale result instead of throwing, so a transient Airtable outage/429
//   becomes invisible staleness rather than a user-visible 500
function getCachedTable(tableName, filterFormula, opts) {
  opts = opts || {};
  var ttlMs = opts.ttlMs || DEFAULT_TTL_MS;
  var extraParams = opts.extraParams || null;
  var key = tableName + '::' + filterFormula + '::' + (extraParams || '');
  var entry = cacheStore[key];
  var now = Date.now();

  if (entry && entry.records && (now - entry.fetchedAt) < ttlMs) {
    return Promise.resolve(entry.records);
  }

  if (entry && entry.inFlight) {
    return entry.inFlight;
  }

  if (!entry) {
    entry = cacheStore[key] = { records: null, fetchedAt: 0, inFlight: null };
  }

  var fetchPromise = resolveRecords(key, tableName, filterFormula, extraParams, ttlMs)
    .then(function (records) {
      entry.records = records;
      entry.fetchedAt = Date.now();
      entry.inFlight = null;
      return records;
    })
    .catch(function (error) {
      entry.inFlight = null;
      if (entry.records) {
        console.error('airtableCache: refresh failed for ' + key + ', serving stale data:', error.message);
        return entry.records;
      }
      throw error;
    });

  entry.inFlight = fetchPromise;
  return fetchPromise;
}

// Cache-aside behavior when KV is disabled. When KV is enabled, the
// durable buffer is authoritative: a missing or unreadable key is a hard
// error, not a fallback to live Airtable.
async function resolveRecords(key, tableName, filterFormula, extraParams, ttlMs) {
  var buffered = await kvGet(key);
  if (buffered) return buffered;
  if (KV_ENABLED) {
    throw new Error('Durable KV buffer enabled and key missing for ' + key);
  }

  var records = await fetchAllRecords(tableName, filterFormula, extraParams);
  await kvSet(key, records);
  return records;
}

// Forces a fresh Airtable fetch (bypassing the in-memory TTL and any KV
// buffer read) and writes the result into both -- used by the Layer 4 push
// sync (api/cron/refresh-cache.js) so readers' getCachedTable() calls find
// an already-warm entry instead of triggering their own Airtable fetch.
async function refreshTable(tableName, filterFormula, extraParams, ttlMs) {
  ttlMs = ttlMs || DEFAULT_TTL_MS;
  var key = tableName + '::' + filterFormula + '::' + (extraParams || '');
  var records = await fetchAllRecords(tableName, filterFormula, extraParams);

  await kvSet(key, records);

  var entry = cacheStore[key] || (cacheStore[key] = { records: null, fetchedAt: 0, inFlight: null });
  entry.records = records;
  entry.fetchedAt = Date.now();
  return records;
}

// Writes an already-fetched records array directly into the in-memory cache
// and KV buffer, with no Airtable call of its own. Used by the Layer 4/5
// sync (api/cron/refresh-cache.js), which needs to mirror image attachments
// (Layer 5) into the records *before* they're cached -- fetchAllRecords()
// and setTable() are the two halves refreshTable() composes for callers
// that don't need to transform records in between.
async function setTable(tableName, filterFormula, extraParams, records, ttlMs) {
  ttlMs = ttlMs || DEFAULT_TTL_MS;
  var key = tableName + '::' + filterFormula + '::' + (extraParams || '');
  await kvSet(key, records);
  var entry = cacheStore[key] || (cacheStore[key] = { records: null, fetchedAt: 0, inFlight: null });
  entry.records = records;
  entry.fetchedAt = Date.now();
}

module.exports = {
  fetchAllRecords: fetchAllRecords,
  getCachedTable: getCachedTable,
  refreshTable: refreshTable,
  setTable: setTable,
  kvGetRaw: kvGetRaw,
  kvSetRaw: kvSetRaw,
  isKvEnabled: function () { return KV_ENABLED; }
};

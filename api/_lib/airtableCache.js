/**
 * Durable content-buffer access for api/*.js. Upstash KV is the website's
 * authoritative middle database: catalog records have no expiry and every
 * visitor-facing read comes from it. Airtable is contacted only by the
 * protected change-sync endpoint after Airtable signals a content change.
 *
 * Files/folders prefixed with "_" are ignored by Vercel's filesystem
 * routing, so this is a plain module, not its own endpoint.
 */

var AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
var BASE_ID = process.env.AIRTABLE_BASE_ID;
var MAX_PAGES = 10; // 1000-record ceiling; generous for this catalog's scale

// Durable cross-instance buffer (Upstash Redis, plain REST calls -- no SDK,
// no package.json). The production site requires these variables: it has no
// direct Airtable fallback for visitor requests.
// Two naming conventions are accepted: UPSTASH_REDIS_REST_URL/TOKEN (what
// you get copying values directly from Upstash's own dashboard) and
// KV_REST_API_URL/TOKEN (what Vercel auto-generates when you attach Upstash
// via its native Storage integration instead). KV_REST_API_TOKEN is the
// read-write token -- KV_REST_API_READ_ONLY_TOKEN is intentionally not used
// here, since this module both reads and writes the buffer.
var UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
var UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
var KV_ENABLED = !!(UPSTASH_URL && UPSTASH_TOKEN);
var inFlightReads = {}; // key -> Promise, used only to coalesce concurrent KV reads

// Issues one Redis command via Upstash's generic REST passthrough (POST a
// JSON array mirroring the raw command, e.g. ["SET","key","value"])
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

// Fails closed for website reads: callers return an error instead of querying
// Airtable or substituting an unknown source of truth.
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
  if (!KV_ENABLED) throw new Error('Content buffer is not configured');
  try {
    await kvCommand(['SET', key, JSON.stringify(value)]);
  } catch (error) {
    console.error('airtableCache: KV set failed for ' + key + ':', error.message);
    throw error;
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

// Returns the authoritative buffered records. There is deliberately no
// process-local TTL cache: an Airtable change can update the durable state on
// a different serverless instance, and the next read must see that update.
function getCachedTable(tableName, filterFormula, opts) {
  opts = opts || {};
  var extraParams = opts.extraParams || null;
  var key = tableName + '::' + filterFormula + '::' + (extraParams || '');
  if (inFlightReads[key]) return inFlightReads[key];

  var fetchPromise = resolveRecords(key, tableName, filterFormula, extraParams)
    .finally(function () { delete inFlightReads[key]; });

  inFlightReads[key] = fetchPromise;
  return fetchPromise;
}

// Read the durable KV snapshot. Visitor requests intentionally do not fall
// back to Airtable: a cache miss must be visible as an operational error,
// rather than silently creating unbounded Airtable traffic. Airtable reads
// happen only in refreshTable()/fetchAllRecords(), invoked by the protected
// change-sync endpoint after Airtable reports a content change.
async function resolveRecords(key, tableName, filterFormula, extraParams) {
  var buffered = await kvGet(key);
  if (buffered) return buffered;
  throw new Error('Content buffer has no snapshot for ' + key);
}

// Forces a fresh Airtable fetch (bypassing the in-memory TTL and any KV
// buffer read) and writes the result into both -- used by the Layer 4 push
// sync (api/cron/refresh-cache.js) so readers' getCachedTable() calls find
// an already-warm entry instead of triggering their own Airtable fetch.
async function refreshTable(tableName, filterFormula, extraParams) {
  var key = tableName + '::' + filterFormula + '::' + (extraParams || '');
  var records = await fetchAllRecords(tableName, filterFormula, extraParams);

  await kvSet(key, records);
  return records;
}

// Writes an already-fetched records array directly into the in-memory cache
// and KV buffer, with no Airtable call of its own. Used by the Layer 4/5
// sync (api/cron/refresh-cache.js), which needs to mirror image attachments
// (Layer 5) into the records *before* they're cached -- fetchAllRecords()
// and setTable() are the two halves refreshTable() composes for callers
// that don't need to transform records in between.
async function setTable(tableName, filterFormula, extraParams, records) {
  var key = tableName + '::' + filterFormula + '::' + (extraParams || '');
  await kvSet(key, records);
}

module.exports = {
  fetchAllRecords: fetchAllRecords,
  getCachedTable: getCachedTable,
  refreshTable: refreshTable,
  setTable: setTable,
  kvGetRaw: kvGetRaw,
  kvSetRaw: kvSetRaw,
  isKvEnabled: function () { return KV_ENABLED; },
  hasContentSource: function () { return KV_ENABLED; }
};
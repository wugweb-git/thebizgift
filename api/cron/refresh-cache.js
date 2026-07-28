/**
 * api/cron/refresh-cache.js — Vercel Serverless Function
 *
 * Layers 4-5 of the caching architecture (see CLAUDE.md): proactively
 * refreshes every table's cache/KV-buffer entry -- and mirrors Airtable's
 * image attachments into Vercel Blob storage along the way -- so read
 * requests (get-categories.js, get-hamper.js, etc.) almost always find an
 * already-warm, Airtable-independent entry instead of triggering their own
 * live Airtable fetch or hotlinking Airtable's attachment URLs.
 *
 * Two trusted triggers call this (Layer 4):
 *
 * 1. An Airtable Automation, configured directly in the client's Airtable
 *    base (Products/Category/Occasions/Collections tables, "record created
 *    or updated" trigger -> call this URL as a webhook), sending a custom
 *    header `X-Webhook-Secret: <WEBHOOK_SECRET>`. This is the primary,
 *    near-real-time refresh path. It must be configured by hand in
 *    Airtable's own UI -- it does not travel with a git clone of this repo,
 *    and needs re-creating if the base is ever duplicated.
 * 2. Vercel's own Cron scheduler (see the "crons" entry in vercel.json),
 *    which Vercel authenticates by auto-adding `Authorization: Bearer
 *    <CRON_SECRET>` to the request when a CRON_SECRET env var is set. This
 *    is a coarse daily safety net, not the primary freshness mechanism --
 *    Vercel Cron frequency is plan-tier-gated (Hobby has historically
 *    capped it at once/day), so this must not be relied on for real-time
 *    updates.
 *
 * If neither secret is configured, every request is rejected -- an
 * unauthenticated cache-invalidation endpoint should never be exposed by
 * accident.
 *
 * Image mirroring (Layer 5) is opt-in via BLOB_READ_WRITE_TOKEN -- if unset,
 * mirrorImages() is a no-op and records keep Airtable's own attachment URLs
 * (identical to today's behavior), so this degrades gracefully exactly like
 * the KV buffer (Layer 3) does.
 */

const { put } = require('@vercel/blob');
const airtableCache = require('../_lib/airtableCache');

const TABLES = [
  { name: 'Products', filter: '{Published}=TRUE()' },
  { name: 'Category', filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Name&sort%5B0%5D%5Bdirection%5D=asc' },
  { name: 'Occasions', filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc' },
  { name: 'Collections', filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc' }
];

// Which attachment fields on each table get mirrored to Blob storage.
// Collections has no image field today (get-collections.js renders icon
// chips, not photography) so it's absent -- mirrorImages() is a no-op for
// any table not listed here.
const MIRROR_FIELDS = {
  Products: ['Product Images'],
  Category: ['Image'],
  Occasions: ['Hero Image']
};

var BLOB_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN;

// Raw string KV get/set for the attachment-id -> Blob-URL map. Deliberately
// separate from airtableCache.js's JSON-array-of-records cache: this is a
// permanent mapping (Airtable attachment ids are stable, so no TTL/eviction
// needed), not a refreshable table snapshot. Fails open exactly like
// airtableCache.js's own KV helpers -- any error just means "mirror again",
// never a hard failure.
// Accepts either Upstash's own naming or Vercel's native Storage-integration
// naming (KV_REST_API_*) -- see the matching comment in airtableCache.js.
var UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
var UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
var KV_ENABLED = !!(UPSTASH_URL && UPSTASH_TOKEN);

async function kvCommand(args) {
  var response = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + UPSTASH_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  if (!response.ok) throw new Error('Upstash command failed: ' + response.status);
  var data = await response.json();
  if (data.error) throw new Error('Upstash error: ' + data.error);
  return data.result;
}

async function getBlobMapping(attachmentId) {
  if (!KV_ENABLED) return null;
  try {
    return await kvCommand(['GET', 'blobmap::' + attachmentId]);
  } catch (error) {
    console.error('refresh-cache: blob-map GET failed for ' + attachmentId + ':', error.message);
    return null;
  }
}

async function setBlobMapping(attachmentId, blobUrl) {
  if (!KV_ENABLED) return;
  try {
    await kvCommand(['SET', 'blobmap::' + attachmentId, blobUrl]);
  } catch (error) {
    console.error('refresh-cache: blob-map SET failed for ' + attachmentId + ':', error.message);
  }
}

// Mirrors one Airtable attachment into Vercel Blob storage, idempotently --
// if this attachment's id has already been mirrored, the existing Blob URL
// is reused with no re-download/re-upload. Keyed by attachment id (not
// record id), which stays stable even if the parent record's other fields
// change.
async function mirrorAttachment(attachment) {
  var existing = await getBlobMapping(attachment.id);
  if (existing) return existing;

  var imageResponse = await fetch(attachment.url);
  if (!imageResponse.ok) {
    throw new Error('Failed to download Airtable attachment ' + attachment.id + ': ' + imageResponse.status);
  }
  var buffer = Buffer.from(await imageResponse.arrayBuffer());
  var ext = (attachment.filename && attachment.filename.indexOf('.') !== -1)
    ? attachment.filename.split('.').pop()
    : 'jpg';

  var blob = await put('airtable-mirror/' + attachment.id + '.' + ext, buffer, {
    access: 'public',
    contentType: attachment.type || undefined,
    addRandomSuffix: false
  });

  await setBlobMapping(attachment.id, blob.url);
  return blob.url;
}

// Walks the attachment fields this table exposes (MIRROR_FIELDS) and
// replaces each attachment's `url` with its mirrored Vercel Blob URL,
// leaving every other property (filename, id, type, etc.) intact so
// downstream code (get-hamper.js etc., which just reads `.url`) needs no
// changes. If Blob isn't configured, or this table has no mirrored fields,
// this is a no-op and records keep Airtable's own URLs.
async function mirrorImages(tableName, records) {
  var fields = MIRROR_FIELDS[tableName];
  if (!BLOB_ENABLED || !fields || fields.length === 0) return records;

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    for (var j = 0; j < fields.length; j++) {
      var fieldName = fields[j];
      var attachments = record.fields && record.fields[fieldName];
      if (!Array.isArray(attachments) || attachments.length === 0) continue;

      for (var k = 0; k < attachments.length; k++) {
        try {
          var mirroredUrl = await mirrorAttachment(attachments[k]);
          attachments[k] = Object.assign({}, attachments[k], { url: mirroredUrl });
        } catch (error) {
          // Fail open per-attachment: keep the original Airtable URL for
          // this one image rather than failing the whole sync run over it.
          console.error('refresh-cache: mirroring failed for attachment ' + attachments[k].id + ', keeping Airtable URL:', error.message);
        }
      }
    }
  }

  return records;
}

function isAuthorized(req) {
  var webhookSecret = process.env.WEBHOOK_SECRET;
  var cronSecret = process.env.CRON_SECRET;

  if (webhookSecret && req.headers['x-webhook-secret'] === webhookSecret) return true;
  // Fallback for Airtable plans/UIs whose Automation "Send webhook" action
  // doesn't expose custom headers -- only a plain URL. Less ideal (the
  // secret can end up in logs/history) but the only option available on
  // those plans; the header check above still wins when it's usable.
  if (webhookSecret && req.query && req.query.secret === webhookSecret) return true;
  if (cronSecret && req.headers['authorization'] === 'Bearer ' + cronSecret) return true;
  return false;
}

async function handler(req, res) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  var results = {};
  var hadError = false;

  for (var i = 0; i < TABLES.length; i++) {
    var t = TABLES[i];
    try {
      var rawRecords = await airtableCache.fetchAllRecords(t.name, t.filter, t.extraParams);
      var mirroredRecords = await mirrorImages(t.name, rawRecords);
      await airtableCache.setTable(t.name, t.filter, t.extraParams, mirroredRecords);
      results[t.name] = { ok: true, count: mirroredRecords.length };
    } catch (error) {
      hadError = true;
      results[t.name] = { ok: false, error: error.message };
      console.error('refresh-cache: failed to refresh ' + t.name + ':', error.message);
    }
  }

  res.status(hadError ? 207 : 200).json({ refreshedAt: new Date().toISOString(), results: results });
}

// Vercel needs module.exports to be the callable handler directly -- but a
// function is still an object, so mirrorImages can ride along as a property
// for scripts/seed-products-from-csv.js to reuse (same idempotent
// download-once/mirror-once logic, no duplication) without affecting how
// Vercel invokes this as a serverless function.
module.exports = handler;
module.exports.mirrorImages = mirrorImages;

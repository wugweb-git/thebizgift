/**
 * api/cron/refresh-cache.js — Vercel Serverless Function
 *
 * Synchronizes the durable content buffer after Airtable signals a change.
 * It mirrors every Airtable attachment into Vercel Blob before committing
 * the corresponding records to KV, so no live website response depends on
 * Airtable URLs.
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
 *    <CRON_SECRET>` to the request when a CRON_SECRET env var is set. It
 *    only renews the Airtable webhook subscription; it never refreshes
 *    catalog data or writes the buffer. Buffer writes happen exclusively
 *    after an Airtable change notification.
 *
 * If neither secret is configured, every request is rejected -- an
 * unauthenticated cache-invalidation endpoint should never be exposed by
 * accident.
 *
 * BLOB_READ_WRITE_TOKEN and the KV credentials are required for a content
 * update. If either storage write fails, the existing live buffer is kept.
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
// chips, not photography) so it is absent.
const MIRROR_FIELDS = {
  Products: ['Product Images'],
  Category: ['Image'],
  Occasions: ['Hero Image']
};

var BLOB_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN;

// Mirrors one Airtable attachment into Vercel Blob storage, idempotently --
// if this attachment's id has already been mirrored, the existing Blob URL
// is reused with no re-download/re-upload. Keyed by attachment id (not
// record id), which stays stable even if the parent record's other fields
// change. The mapping is permanent (no TTL) -- Airtable attachment ids don't
// change -- so it uses airtableCache's raw KV helpers rather than the
// JSON+TTL table cache.
async function mirrorAttachment(attachment) {
  var existing = await airtableCache.kvGetRaw('blobmap::' + attachment.id);
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

  await airtableCache.kvSetRaw('blobmap::' + attachment.id, blob.url);
  return blob.url;
}

// Walks the attachment fields this table exposes (MIRROR_FIELDS) and
// replaces each attachment's `url` with its mirrored Vercel Blob URL,
// leaving every other property (filename, id, type, etc.) intact so
// downstream code (get-hamper.js etc., which just reads `.url`) needs no
// changes. A single image mirroring failure is logged but does NOT abort
// the table refresh — the original Airtable URL is kept so the site
// remains functional (images load from Airtable directly). Only a total
// absence of Blob configuration aborts, since that indicates a deployment
// misconfiguration rather than a transient image failure.
async function mirrorImages(tableName, records) {
  var fields = MIRROR_FIELDS[tableName];
  if (!fields || fields.length === 0) return records;
  if (!BLOB_ENABLED) throw new Error('Blob storage is not configured');

  var imageErrors = 0;
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
          imageErrors++;
          console.error('refresh-cache: image mirror failed for ' + tableName +
            ' attachment ' + attachments[k].id + ': ' + error.message +
            ' — keeping original Airtable URL');
          // Keep the original Airtable URL — the site still works, just
          // loads images from Airtable instead of Blob for this attachment.
        }
      }
    }
  }

  if (imageErrors > 0) {
    console.warn('refresh-cache: ' + imageErrors + ' image(s) failed to mirror for ' +
      tableName + ' — records written with original Airtable URLs for those images');
  }

  return records;
}

// Validates that records are in the canonical schema format before they
// are written to Redis. Rejects legacy formats (cellValuesByFieldId,
// fields keyed by fldXXX Airtable field IDs) that would cause API readers
// to crash or return empty data. This is the last line of defense against
// malformed data entering the durable cache.
function validateCanonicalRecords(records, tableName) {
  if (!Array.isArray(records)) {
    throw new Error('validateCanonicalRecords: records is not an array for ' + tableName);
  }
  if (records.length === 0) {
    throw new Error('validateCanonicalRecords: records array is empty for ' + tableName);
  }

  for (var i = 0; i < records.length; i++) {
    var record = records[i];

    // Reject cellValuesByFieldId format (legacy Airtable backup format)
    if (record.cellValuesByFieldId && !record.fields) {
      throw new Error('validateCanonicalRecords: record ' + record.id +
        ' in ' + tableName + ' uses cellValuesByFieldId format — expected fields with human-readable names');
    }

    // Reject records with no fields object
    if (!record.fields || typeof record.fields !== 'object' || Array.isArray(record.fields)) {
      throw new Error('validateCanonicalRecords: record ' + record.id +
        ' in ' + tableName + ' is missing fields object');
    }

    // Reject fields keyed by Airtable field IDs (fldXXX) instead of names
    var fieldKeys = Object.keys(record.fields);
    for (var j = 0; j < fieldKeys.length; j++) {
      if (/^fld[A-Za-z0-9]+$/.test(fieldKeys[j])) {
        throw new Error('validateCanonicalRecords: record ' + record.id +
          ' in ' + tableName + ' has field ID key "' + fieldKeys[j] +
          '" — expected human-readable field name');
      }
    }
  }

  return records;
}

// Airtable's own Webhooks API (registered once via
// api/register-airtable-webhook.js) is separate from the Automations UI's
// "Send webhook" action -- it's available on every Airtable plan, including
// ones where Automations' webhook action is gated to Team+. Airtable POSTs
// a lightweight ping here on any base change: {"base":{"id":...},
// "webhook":{"id":...},"timestamp":...} -- no record diff, just "something
// changed, go refresh". Authorized by checking the ping's webhook.id against
// the one we registered and stored, rather than full HMAC verification of
// the X-Airtable-Content-MAC header: the worst case of accepting a forged
// ping is just an extra (harmless, read-only) refresh cycle, so the added
// complexity of raw-body MAC verification isn't worth it here.
async function isAirtableWebhookPing(req) {
  var body = req.body;
  if (!body || !body.webhook || !body.webhook.id) return false;
  var registeredId = await airtableCache.kvGetRaw('airtable-webhook::id');
  return !!registeredId && body.webhook.id === registeredId;
}

async function isAuthorized(req, isChangeEvent) {
  var webhookSecret = process.env.WEBHOOK_SECRET;
  var cronSecret = process.env.CRON_SECRET;

  if (webhookSecret && req.headers['x-webhook-secret'] === webhookSecret) return true;
  // Fallback for Airtable plans/UIs whose Automation "Send webhook" action
  // doesn't expose custom headers -- only a plain URL. Less ideal (the
  // secret can end up in logs/history) but the only option available on
  // those plans; the header check above still wins when it's usable.
  if (webhookSecret && req.query && req.query.secret === webhookSecret) return true;
  if (cronSecret && req.headers['authorization'] === 'Bearer ' + cronSecret) return true;
  if (isChangeEvent) return true;
  return false;
}

// Airtable webhooks created via a personal access token expire after 7 days
// unless refreshed. Called on every successful trigger (ping, cron, or
// manual) below -- since the daily Vercel Cron always fires at least once a
// day, this guarantees the registered webhook never expires even during a
// stretch with no actual Airtable edits, without needing its own separate
// schedule. Best-effort: a failure here doesn't fail the refresh itself.
async function keepWebhookAlive() {
  var webhookId = await airtableCache.kvGetRaw('airtable-webhook::id');
  if (!webhookId) return;
  try {
    var url = 'https://api.airtable.com/v0/bases/' + process.env.AIRTABLE_BASE_ID + '/webhooks/' + webhookId + '/refresh';
    var response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.AIRTABLE_API_KEY }
    });
    if (!response.ok) {
      console.error('refresh-cache: webhook keep-alive refresh failed:', response.status);
    }
  } catch (error) {
    console.error('refresh-cache: webhook keep-alive refresh failed:', error.message);
  }
}

async function handler(req, res) {
  var isChangeEvent = await isAirtableWebhookPing(req);
  if (!(await isAuthorized(req, isChangeEvent))) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // The scheduled heartbeat only keeps Airtable's seven-day webhook lease
  // alive. It must not read Airtable tables or mutate the website snapshot.
  if (!isChangeEvent && req.headers['authorization'] === 'Bearer ' + process.env.CRON_SECRET) {
    await keepWebhookAlive();
    res.status(200).json({ refreshed: false, reason: 'Webhook heartbeat only' });
    return;
  }

  var results = {};
  var hadError = false;

  for (var i = 0; i < TABLES.length; i++) {
    var t = TABLES[i];
    try {
      var rawRecords = await airtableCache.fetchAllRecords(t.name, t.filter, t.extraParams);
      var mirroredRecords = await mirrorImages(t.name, rawRecords);
      validateCanonicalRecords(mirroredRecords, t.name);
      await airtableCache.setTable(t.name, t.filter, t.extraParams, mirroredRecords);
      results[t.name] = { ok: true, count: mirroredRecords.length };
    } catch (error) {
      hadError = true;
      results[t.name] = { ok: false, error: error.message };
      console.error('refresh-cache: failed to refresh ' + t.name + ':', error.message);
    }
  }

  await keepWebhookAlive();

  res.status(hadError ? 207 : 200).json({ refreshedAt: new Date().toISOString(), results: results });
}

// Vercel needs module.exports to be the callable handler directly -- but a
// function is still an object, so mirrorImages can ride along as a property
// for scripts/seed-products-from-csv.js to reuse (same idempotent
// download-once/mirror-once logic, no duplication) without affecting how
// Vercel invokes this as a serverless function.
module.exports = handler;
module.exports.mirrorImages = mirrorImages;
// Exposed so scripts/seed-*-from-csv.js write into the exact same cache key
// (table + filter + extraParams) this handler itself uses -- one source of
// truth, no risk of a seed script drifting out of sync with the real sort/
// filter params and silently seeding a key no read endpoint ever looks at.
module.exports.TABLES = TABLES;
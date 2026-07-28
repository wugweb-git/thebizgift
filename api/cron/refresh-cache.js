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

async function isAuthorized(req) {
  var webhookSecret = process.env.WEBHOOK_SECRET;
  var cronSecret = process.env.CRON_SECRET;

  if (webhookSecret && req.headers['x-webhook-secret'] === webhookSecret) return true;
  // Fallback for Airtable plans/UIs whose Automation "Send webhook" action
  // doesn't expose custom headers -- only a plain URL. Less ideal (the
  // secret can end up in logs/history) but the only option available on
  // those plans; the header check above still wins when it's usable.
  if (webhookSecret && req.query && req.query.secret === webhookSecret) return true;
  if (cronSecret && req.headers['authorization'] === 'Bearer ' + cronSecret) return true;
  if (await isAirtableWebhookPing(req)) return true;
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
  if (!(await isAuthorized(req))) {
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

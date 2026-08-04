/**
 * api/_lib/leadsQueue.js
 *
 * Durable write-side buffer for lead submissions, mirroring the read-side
 * KV buffer in airtableCache.js. Today's failure mode (before this existed):
 * api/submit-lead.js wrote straight to Airtable, so any Airtable outage,
 * rate-limit, or credential rotation (see: this project's AIRTABLE_API_KEY
 * incident) silently dropped the lead -- the visitor saw an error and had
 * to resubmit or fall back to WhatsApp, with no record of what they typed.
 *
 * The fix follows the exact same shape as the read path: buffer first,
 * write to Airtable second. A lead is RPUSHed onto a Redis list *before*
 * Airtable is ever contacted; if the Airtable write then fails, the lead
 * is already durable and gets delivered later by flushPending(), which
 * api/cron/refresh-cache.js calls on every webhook ping and the daily Cron
 * heartbeat -- the same trusted triggers that already keep the read cache
 * warm. The visitor-facing effect: a lead submitted during an outage still
 * shows a success message, because it genuinely has been captured.
 *
 * Trade-off, stated plainly: if Airtable's write succeeds but the
 * subsequent dequeue() (removing it from the list) fails, the next
 * reconciliation pass will submit that lead to Airtable a second time,
 * producing a duplicate row. This is intentional -- an occasional duplicate
 * lead a human can merge in seconds is a far cheaper failure than a lead
 * that silently vanished. There is no id column in the Leads table to
 * dedupe against server-side (see submit-lead.js's schema comment).
 */

const airtableCache = require('./airtableCache');

const QUEUE_KEY = 'leads:queue';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || 'Leads';

function makeLeadId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

// Posts one lead's fields to the Airtable Leads table. Shared by
// submit-lead.js's live path and flushPending()'s retry path so the
// request shape only exists in one place.
async function postToAirtable(fields) {
  var url = 'https://api.airtable.com/v0/' + BASE_ID + '/' + encodeURIComponent(LEADS_TABLE);
  var response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + AIRTABLE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records: [{ fields: fields }], typecast: true })
  });
  if (!response.ok) {
    var detail = await response.text();
    console.error('leadsQueue: Airtable write failed:', response.status, detail);
    return false;
  }
  return true;
}

// Buffers a lead durably before Airtable is contacted. Best-effort -- if the
// KV buffer itself is unreachable, `buffered` comes back false and the
// caller falls back to today's direct-write-only behavior (no false
// promises of durability it can't actually back up).
async function enqueue(fields, type) {
  var record = { id: makeLeadId(), type: type, fields: fields, submittedAt: new Date().toISOString() };
  var serialized = JSON.stringify(record);
  var buffered = await airtableCache.kvListPush(QUEUE_KEY, serialized);
  return { id: record.id, serialized: serialized, buffered: buffered };
}

// Removes a lead from the queue once Airtable actually has it.
async function dequeue(serialized) {
  await airtableCache.kvListRemove(QUEUE_KEY, serialized);
}

// Retries every buffered lead against Airtable. Called by
// api/cron/refresh-cache.js on each trigger -- webhook ping, daily Cron, or
// manual -- so a lead buffered during an outage gets delivered on the very
// next Airtable change notification, not just once a day.
async function flushPending() {
  if (!airtableCache.isKvEnabled() || !AIRTABLE_API_KEY || !BASE_ID) {
    return { attempted: 0, synced: 0, failed: 0 };
  }

  var pending = await airtableCache.kvListRange(QUEUE_KEY);
  var synced = 0;
  var failed = 0;

  for (var i = 0; i < pending.length; i++) {
    var serialized = pending[i];
    var record;
    try {
      record = JSON.parse(serialized);
    } catch (error) {
      console.error('leadsQueue: dropping malformed queue entry:', error.message);
      await dequeue(serialized);
      failed++;
      continue;
    }

    var ok = false;
    try {
      ok = await postToAirtable(record.fields);
    } catch (error) {
      console.error('leadsQueue: retry failed for lead ' + record.id + ':', error.message);
    }

    if (ok) {
      await dequeue(serialized);
      synced++;
    } else {
      failed++;
    }
  }

  return { attempted: pending.length, synced: synced, failed: failed };
}

module.exports = {
  postToAirtable: postToAirtable,
  enqueue: enqueue,
  dequeue: dequeue,
  flushPending: flushPending
};

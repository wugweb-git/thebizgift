#!/usr/bin/env node
/**
 * scripts/seed-collections-from-csv.js
 *
 * Same one-time bridge pattern as seed-products-from-csv.js (see that file
 * for the full rationale), scoped to the Collections table. Seeds directly
 * from a CSV export (Airtable's Collections "Grid view" -> Download CSV)
 * without calling Airtable's rate-limited REST API. Collections render as
 * icon-based chips on the site (no photography, see get-collections.js),
 * so no image field is read/mirrored here.
 *
 * Usage:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   (or KV_REST_API_URL=... KV_REST_API_TOKEN=..., Vercel's native naming) \
 *   node scripts/seed-collections-from-csv.js "/path/to/export.csv"
 */

const airtableCache = require('../api/_lib/airtableCache');
const refreshCache = require('../api/cron/refresh-cache');
const csvUtils = require('./_lib/csvSeedUtils');

// See seed-products-from-csv.js for why this is much longer than the
// cache's normal 5-minute default -- this is a bridge/outage-recovery
// seed, not a steady sync cycle.
// Use a longer TTL so restored buffer state stays live until Airtable or
// cron/webhook refreshes it, instead of expiring in one day.
var SEED_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function rowToRecord(row) {
  return {
    id: 'csvseed-' + csvUtils.slugify(row['Slug'] || row['Name'] || Math.random().toString(36).slice(2)),
    fields: {
      'Name': row['Name'] || '',
      'Slug': row['Slug'] || csvUtils.slugify(row['Name']),
      'Description': row['Description'] || '',
      'Published': csvUtils.isChecked(row['Published']),
      'Order': row['Order'] ? Number(row['Order']) : null
    }
  };
}

async function main() {
  var csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scripts/seed-collections-from-csv.js <path-to-csv>');
    process.exit(1);
  }

  var rows = csvUtils.readCsvRows(csvPath);
  var records = rows.map(rowToRecord).filter(function (r) { return r.fields['Published'] === true; });
  // get-collections.js relies entirely on Airtable's server-side sort param
  // (by Order ascending) -- replicate that here since we're bypassing the
  // live API call that would normally apply it.
  records.sort(function (a, b) {
    var ao = a.fields['Order'], bo = b.fields['Order'];
    if (ao === null && bo === null) return 0;
    if (ao === null) return 1;
    if (bo === null) return -1;
    return ao - bo;
  });

  console.log('Parsed ' + rows.length + ' CSV rows -> ' + records.length + ' Published.');

  var tableConfig = refreshCache.TABLES.filter(function (t) { return t.name === 'Collections'; })[0];
  await airtableCache.setTable('Collections', tableConfig.filter, tableConfig.extraParams, records, SEED_TTL_MS);

  console.log('Seeded ' + records.length + ' collections into the cache/KV buffer.');
}

main().catch(function (err) {
  console.error('seed-collections-from-csv failed:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * scripts/seed-categories-from-csv.js
 *
 * Same one-time bridge pattern as seed-products-from-csv.js (see that file
 * for the full rationale), scoped to the Category table. Seeds directly
 * from a CSV export (Airtable's Category "Grid view" -> Download CSV)
 * without calling Airtable's rate-limited REST API.
 *
 * Usage:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   (or KV_REST_API_URL=... KV_REST_API_TOKEN=..., Vercel's native naming) \
 *   BLOB_READ_WRITE_TOKEN=... \
 *   node scripts/seed-categories-from-csv.js "/path/to/export.csv"
 */

const airtableCache = require('../api/_lib/airtableCache');
const refreshCache = require('../api/cron/refresh-cache');
const csvUtils = require('./_lib/csvSeedUtils');

function rowToRecord(row) {
  return {
    id: 'csvseed-' + csvUtils.slugify(row['Slug'] || row['Name'] || Math.random().toString(36).slice(2)),
    fields: {
      'Name': row['Name'] || '',
      'Slug': row['Slug'] || csvUtils.slugify(row['Name']),
      'Description': row['Description'] || '',
      'Image': csvUtils.parseAttachments(row['Image']),
      'Published': csvUtils.isChecked(row['Published'])
    }
  };
}

async function main() {
  var csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scripts/seed-categories-from-csv.js <path-to-csv>');
    process.exit(1);
  }

  var rows = csvUtils.readCsvRows(csvPath);
  var records = rows.map(rowToRecord).filter(function (r) { return r.fields['Published'] === true; });
  // get-categories.js re-sorts "more" to the end itself on every request
  // regardless of cache order, but alphabetical-by-Name is what Airtable's
  // own sort param would have given everything else -- replicate it here
  // so category order looks right even before that "more"-last pass runs.
  records.sort(function (a, b) { return String(a.fields['Name']).localeCompare(String(b.fields['Name'])); });

  console.log('Parsed ' + rows.length + ' CSV rows -> ' + records.length + ' Published.');

  var mirrored = await refreshCache.mirrorImages('Category', records);

  var tableConfig = refreshCache.TABLES.filter(function (t) { return t.name === 'Category'; })[0];
  await airtableCache.setTable('Category', tableConfig.filter, tableConfig.extraParams, mirrored);

  console.log('Seeded ' + mirrored.length + ' categories into the cache/KV buffer.');
}

main().catch(function (err) {
  console.error('seed-categories-from-csv failed:', err);
  process.exit(1);
});

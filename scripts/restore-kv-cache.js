var fs = require('fs');
var path = require('path');

if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
  console.error('KV env vars missing — nothing to restore into.');
  process.exit(1);
}

var airtableCache = require('../api/_lib/airtableCache');

var TABLES = [
  { name: 'Products', filter: '{Published}=TRUE()' },
  { name: 'Category', filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Name&sort%5B0%5D%5Bdirection%5D=asc' },
  { name: 'Occasions', filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc' },
  { name: 'Collections', filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc' }
];

var BACKUP_FILES = {
  Products: 'docs/backups/airtable-products-backup-2026-07-12.json',
  Category: 'docs/backups/airtable-category-backup-2026-07-12.json',
  Occasions: 'docs/backups/batch_0.json',
  Collections: 'docs/backups/products_link_updates.json'
};

// Use a very long TTL so restored backups last until the next Airtable
// webhook/cron refresh overwrites them. Cache freshness is maintained by
// refresh-cache.js, not by this script.
var DEFAULT_TTL_MS = 400 * 24 * 60 * 60 * 1000;

function loadRecords(tableName) {
  var filePath = path.join(__dirname, '..', BACKUP_FILES[tableName]);
  if (!fs.existsSync(filePath)) {
    console.warn('Missing backup:', filePath);
    return [];
  }
  var parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return Array.isArray(parsed) ? parsed : (parsed.records || []);
}

(async function main() {
  for (var t = 0; t < TABLES.length; t++) {
    var tbl = TABLES[t];
    var key = tbl.name + '::' + tbl.filter + '::' + (tbl.extraParams || '');
    var records = loadRecords(tbl.name);
    console.log('Restoring', tbl.name, '—', records.length, 'records into', key);
    await airtableCache.setTable(tbl.name, tbl.filter, tbl.extraParams || null, records, DEFAULT_TTL_MS);
  }
  console.log('KV cache restored from backups.');
})().catch(function (err) {
  console.error('Restore failed:', err);
  process.exit(1);
});
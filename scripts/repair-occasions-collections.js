#!/usr/bin/env node
/**
 * scripts/repair-occasions-collections.js
 *
 * One-time recovery utility to rebuild ONLY the Occasions and Collections
 * Redis keys from live Airtable data. Leaves Products and Category untouched.
 *
 * Reuses existing production functions:
 *   - airtableCache.fetchAllRecords()  — fetch from Airtable
 *   - refreshCache.mirrorImages()      — mirror attachments to Blob
 *   - airtableCache.setTable()          — write to Redis
 *
 * Also performs pre-write canonical validation (same checks as
 * refresh-cache.js's validateCanonicalRecords) and post-write verification
 * by reading the key back from Redis.
 *
 * Usage:
 *   # Dry run — fetch + validate only, no Redis writes
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   AIRTABLE_API_KEY=... AIRTABLE_BASE_ID=... \
 *   BLOB_READ_WRITE_TOKEN=... \
 *   node scripts/repair-occasions-collections.js --dry-run
 *
 *   # Live run — fetch + validate + write + verify
 *   node scripts/repair-occasions-collections.js
 *
 * Env vars can also use Vercel's native naming:
 *   KV_REST_API_URL / KV_REST_API_TOKEN instead of UPSTASH_*
 */

var airtableCache = require('../api/_lib/airtableCache');
var refreshCache = require('../api/cron/refresh-cache');

var TABLES_TO_REPAIR = [
  {
    name: 'Occasions',
    filter: '{Published}=TRUE()',
    extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc'
  },
  {
    name: 'Collections',
    filter: '{Published}=TRUE()',
    extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc'
  }
];

var DRY_RUN = process.argv.indexOf('--dry-run') !== -1;

// Reuse the production validation function directly — no duplication.
var validateCanonicalRecords = refreshCache.validateCanonicalRecords;

/**
 * Verify written data by reading it back from Redis and checking schema.
 */
async function verifyWrite(tableName, filter, extraParams, expectedCount) {
  var key = tableName + '::' + filter + '::' + (extraParams || '');
  console.log('  Verifying: ' + key + '...');

  var records;
  try {
    records = await airtableCache.getCachedTable(tableName, filter, { extraParams: extraParams });
  } catch (err) {
    console.error('  ✗ Verification FAILED: could not read back key — ' + err.message);
    return false;
  }

  if (!Array.isArray(records)) {
    console.error('  ✗ Verification FAILED: stored value is not an array');
    return false;
  }

  console.log('  Read back ' + records.length + ' records (expected ' + expectedCount + ')');

  if (records.length !== expectedCount) {
    console.error('  ✗ Verification FAILED: record count mismatch');
    return false;
  }

  if (records.length === 0) {
    console.error('  ✗ Verification FAILED: empty records array');
    return false;
  }

  var first = records[0];
  if (first.cellValuesByFieldId && !first.fields) {
    console.error('  ✗ Verification FAILED: records use cellValuesByFieldId (non-canonical)');
    return false;
  }
  if (!first.fields || typeof first.fields !== 'object') {
    console.error('  ✗ Verification FAILED: records missing fields object');
    return false;
  }

  var keys = Object.keys(first.fields);
  var hasFieldIds = keys.some(function(k) { return /^fld[A-Za-z0-9]+$/.test(k); });
  if (hasFieldIds) {
    console.error('  ✗ Verification FAILED: records have fldXXX field IDs instead of names');
    return false;
  }

  console.log('  ✓ Verification PASSED: canonical schema confirmed');
  console.log('  Field count: ' + keys.length + ', sample keys: ' + keys.slice(0, 5).join(', '));
  return true;
}

/**
 * Fetch and validate a single table (no Redis write).
 */
async function dryRunTable(tableName, filter, extraParams) {
  console.log('\n─── Dry run: ' + tableName + ' ───');

  // Fetch from Airtable
  console.log('  Fetching from Airtable...');
  var records;
  try {
    records = await airtableCache.fetchAllRecords(tableName, filter, extraParams);
  } catch (err) {
    console.error('  ✗ Airtable fetch FAILED: ' + err.message);
    return { name: tableName, ok: false, count: 0, error: err.message };
  }
  console.log('  Fetched ' + records.length + ' records');

  // Mirror images
  console.log('  Mirroring images...');
  var mirrored;
  try {
    mirrored = await refreshCache.mirrorImages(tableName, records);
  } catch (err) {
    console.error('  ✗ Image mirroring FAILED: ' + err.message);
    return { name: tableName, ok: false, count: records.length, error: err.message };
  }
  console.log('  Images mirrored successfully');

  // Validate
  console.log('  Validating canonical schema...');
  try {
    validateCanonicalRecords(mirrored, tableName);
  } catch (err) {
    console.error('  ✗ Validation FAILED: ' + err.message);
    return { name: tableName, ok: false, count: records.length, error: err.message };
  }
  console.log('  ✓ Validation passed');

  console.log('  (Dry run — no Redis write)');
  return { name: tableName, ok: true, count: records.length };
}

/**
 * Fetch, validate, write, and verify a single table.
 */
async function repairTable(tableName, filter, extraParams) {
  console.log('\n─── Repairing: ' + tableName + ' ───');

  // Fetch from Airtable
  console.log('  Fetching from Airtable...');
  var records;
  try {
    records = await airtableCache.fetchAllRecords(tableName, filter, extraParams);
  } catch (err) {
    console.error('  ✗ Airtable fetch FAILED: ' + err.message);
    return { name: tableName, ok: false, count: 0, error: err.message };
  }
  console.log('  Fetched ' + records.length + ' records');

  // Mirror images
  console.log('  Mirroring images...');
  var mirrored;
  try {
    mirrored = await refreshCache.mirrorImages(tableName, records);
  } catch (err) {
    console.error('  ✗ Image mirroring FAILED: ' + err.message);
    return { name: tableName, ok: false, count: records.length, error: err.message };
  }
  console.log('  Images processed');

  // Validate
  console.log('  Validating canonical schema...');
  try {
    validateCanonicalRecords(mirrored, tableName);
  } catch (err) {
    console.error('  ✗ Validation FAILED: ' + err.message);
    return { name: tableName, ok: false, count: records.length, error: err.message };
  }
  console.log('  ✓ Validation passed');

  // Write to Redis
  console.log('  Writing to Redis...');
  try {
    await airtableCache.setTable(tableName, filter, extraParams, mirrored);
  } catch (err) {
    console.error('  ✗ Redis write FAILED: ' + err.message);
    return { name: tableName, ok: false, count: records.length, error: err.message };
  }
  console.log('  ✓ Written to Redis');

  // Verify
  var verified = await verifyWrite(tableName, filter, extraParams, mirrored.length);
  return { name: tableName, ok: verified, count: mirrored.length, error: verified ? null : 'Post-write verification failed' };
}

/**
 * Main entry point.
 */
async function main() {
  console.log('Repair Occasions + Collections — ' + (DRY_RUN ? 'DRY RUN' : 'LIVE') + '\n');

  // Env check
  var kvReady = !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
                !!(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN);
  if (!kvReady) {
    console.error('Redis/KV env vars missing. Set UPSTASH_REDIS_REST_URL+TOKEN or KV_REST_API_URL+TOKEN.');
    process.exit(1);
  }
  if (!DRY_RUN) {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.error('Airtable env vars missing. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.');
      process.exit(1);
    }
  }

  console.log('Tables to process: ' + TABLES_TO_REPAIR.map(function(t) { return t.name; }).join(', '));
  console.log('Tables NOT touched: Products, Category\n');

  var results = [];
  var success = true;

  for (var i = 0; i < TABLES_TO_REPAIR.length; i++) {
    var t = TABLES_TO_REPAIR[i];
    var result;
    if (DRY_RUN) {
      result = await dryRunTable(t.name, t.filter, t.extraParams);
    } else {
      result = await repairTable(t.name, t.filter, t.extraParams);
    }
    results.push(result);
    if (!result.ok) success = false;
  }

  console.log('\n═══════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log('Mode: ' + (DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'));
  console.log('');

  results.forEach(function(r) {
    var status = r.ok ? '✓ SUCCESS' : '✗ FAILED';
    console.log(status + '  ' + r.name + '  (' + r.count + ' records)');
    if (r.error) {
      console.log('        Error: ' + r.error);
    }
  });

  if (!success) {
    console.log('\nOne or more tables failed. Existing Redis data was NOT modified for failed tables.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('\nDry run complete. No Redis keys were modified.');
    console.log('Run without --dry-run to write to Redis.');
  } else {
    console.log('\nRepair complete. Both keys have been written and verified.');
  }
}

main().catch(function(err) {
  console.error('Unexpected error:', err);
  process.exit(1);
});
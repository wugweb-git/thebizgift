#!/usr/bin/env node
/**
 * scripts/restore-kv-cache.js
 *
 * Restores the Redis cache from self-describing backup files.
 *
 * This script does NOT depend on Airtable at runtime.
 * Legacy backups must be migrated first using:
 *   node scripts/migrate-backup.js <backup.json> <tableName>
 *
 * Self-describing backup format:
 * {
 *   "schemaVersion": 2,
 *   "baseId": "appXXXXXXXX",
 *   "tableId": "tblXXXXXXXX",
 *   "tableName": "Products",
 *   "generatedAt": "2026-07-12T00:00:00.000Z",
 *   "fieldMap": { "fldXXXXX": "Name", ... },
 *   "records": [...]
 * }
 *
 * Usage:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   (or KV_REST_API_URL=... KV_REST_API_TOKEN=...) \
 *   node scripts/restore-kv-cache.js
 */

var fs = require('fs');
var path = require('path');
var airtableCache = require('../api/_lib/airtableCache');
var backupValidator = require('./lib/backupValidator');
var canonicalSchema = require('./lib/canonicalSchema');

if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
  console.error('KV env vars missing — nothing to restore into.');
  process.exit(1);
}

// Map table names to their self-describing backup files.
// All files MUST be in the self-describing format (schemaVersion: 2).
var BACKUP_FILES = {
  Products: 'docs/backups/airtable-products-backup-2026-07-12.json',
  Category: 'docs/backups/airtable-category-backup-2026-07-12.json',
  Occasions: 'docs/backups/batch_0.json',
  Collections: 'docs/backups/products_link_updates.json'
};

// Airtable table filter configurations (must match api/cron/refresh-cache.js)
var TABLE_CONFIGS = {
  Products: { filter: '{Published}=TRUE()', extraParams: null },
  Category: { filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Name&sort%5B0%5D%5Bdirection%5D=asc' },
  Occasions: { filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc' },
  Collections: { filter: '{Published}=TRUE()', extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc' }
};

/**
 * Load and validate a backup file.
 *
 * @param {string} tableName - The table name
 * @param {string} filePath - Path to the backup file
 * @returns {object|null} { tableName, fieldMap, records, schemaVersion } or null if file is missing
 */
function loadAndValidateBackup(tableName, filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('Missing backup:', filePath);
    return null;
  }

  var raw = fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '');
  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error('Failed to parse JSON in ' + filePath + ': ' + err.message);
  }

  // Validate the backup
  var result = backupValidator.validateBackup(parsed);

  if (!result.valid) {
    var errorMsg = 'Backup validation failed for ' + tableName + ' (' + filePath + '):\n';
    result.errors.forEach(function(err) {
      errorMsg += '  - ' + err + '\n';
    });
    errorMsg += '\nTo fix: run node scripts/migrate-backup.js ' + filePath + ' ' + tableName;
    throw new Error(errorMsg);
  }

  console.log('  Validated: schemaVersion=' + result.schemaVersion + ', ' + result.records.length + ' records, ' + Object.keys(result.fieldMap).length + ' fields mapped');

  return {
    tableName: result.tableName,
    fieldMap: result.fieldMap,
    records: result.records,
    schemaVersion: result.schemaVersion
  };
}

/**
 * Restore all tables from backups.
 */
async function restoreAll() {
  var tables = Object.keys(BACKUP_FILES);
  var restored = 0;

  for (var i = 0; i < tables.length; i++) {
    var tableName = tables[i];
    var filePath = path.join(__dirname, '..', BACKUP_FILES[tableName]);
    var config = TABLE_CONFIGS[tableName];

    console.log('Restoring ' + tableName + ' from ' + BACKUP_FILES[tableName] + '...');

    var backup = loadAndValidateBackup(tableName, filePath);
    if (!backup) {
      continue;
    }

    // Normalize records into the canonical schema
    var normalization = canonicalSchema.normalizeRecords(backup.records, backup.fieldMap, tableName);

    if (normalization.errors.length > 0) {
      console.error('Normalization errors for ' + tableName + ':');
      normalization.errors.forEach(function(err) {
        console.error('  - Record ' + (err.recordId || err.recordIndex) + ': ' + err.error + (err.field ? ' (field: ' + err.field + ')' : ''));
      });
      console.error('Skipping ' + tableName + ' due to normalization errors.');
      continue;
    }

    // Write canonical records to Redis
    await airtableCache.setTable(tableName, config.filter, config.extraParams, normalization.records);
    console.log('  Restored ' + normalization.records.length + ' canonical records into Redis.');
    restored++;
  }

  console.log('\nRestore complete. ' + restored + ' tables restored.');
}

restoreAll().catch(function(err) {
  console.error('Restore failed:', err.message);
  process.exit(1);
});
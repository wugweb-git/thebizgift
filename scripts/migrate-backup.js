#!/usr/bin/env node
/**
 * scripts/migrate-backup.js
 *
 * Offline migration tool: converts legacy Airtable backup files into
 * the self-describing backup format.
 *
 * This tool MAY use the Airtable Metadata API because it is an offline
 * migration utility — NOT part of the runtime restore pipeline.
 *
 * Usage:
 *   AIRTABLE_API_KEY=... AIRTABLE_BASE_ID=... \
 *   node scripts/migrate-backup.js <legacy-backup.json> <tableName> [output.json]
 *
 * Example:
 *   AIRTABLE_API_KEY=key123 AIRTABLE_BASE_ID=appXXX \
 *   node scripts/migrate-backup.js docs/backups/airtable-category-backup-2026-07-12.json Category docs/backups/category-v2.json
 */

var fs = require('fs');
var path = require('path');
var backupValidator = require('./lib/backupValidator');
var canonicalSchema = require('./lib/canonicalSchema');

var AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
var AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

/**
 * Fetch the Airtable table schema and build a field ID → name map.
 *
 * @param {string} baseId - The Airtable base ID
 * @param {string} tableName - The table name
 * @returns {Promise<object>} { fieldMap: { fldXXX: "Name" }, tableId: "tblXXX" }
 */
async function fetchFieldMap(baseId, tableName) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables are required for migration');
  }

  var url = 'https://api.airtable.com/v0/meta/bases/' + baseId + '/tables';
  var response = await fetch(url, {
    headers: { Authorization: 'Bearer ' + AIRTABLE_API_KEY }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Airtable schema: ' + response.status + ' ' + response.statusText);
  }

  var schema = await response.json();
  var tables = schema.tables || [];

  var table = tables.find(function(t) {
    return t.name === tableName || t.id === tableName;
  });

  if (!table) {
    throw new Error('Table "' + tableName + '" not found in Airtable base. Available tables: ' + tables.map(function(t) { return t.name; }).join(', '));
  }

  var fieldMap = {};
  (table.fields || []).forEach(function(field) {
    fieldMap[field.id] = field.name;
  });

  return { fieldMap: fieldMap, tableId: table.id };
}

/**
 * Extract records from a legacy backup in any format.
 *
 * @param {object} parsed - The parsed legacy backup
 * @returns {Array} Array of records
 */
function extractRecords(parsed) {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && Array.isArray(parsed.records)) {
    return parsed.records;
  }
  return [];
}

/**
 * Migrate a legacy backup to the self-describing format.
 *
 * @param {string} inputPath - Path to the legacy backup file
 * @param {string} tableName - The Airtable table name
 * @param {string} outputPath - Path to write the migrated backup
 */
async function migrate(inputPath, tableName, outputPath) {
  console.log('Migrating:', inputPath);
  console.log('Table:', tableName);

  // Read and parse the legacy backup
  var raw = fs.readFileSync(inputPath, 'utf8').replace(/^﻿/, '');
  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error('Failed to parse JSON: ' + err.message);
  }

  // Detect the legacy format
  var format = backupValidator.detectFormat(parsed);
  console.log('Detected format:', format);

  if (format === 'self-describing') {
    console.log('Backup is already self-describing. No migration needed.');
    return;
  }

  if (format === 'unknown') {
    throw new Error('Cannot detect backup format. Unable to migrate.');
  }

  // Fetch the field map from Airtable
  console.log('Fetching field map from Airtable...');
  var schemaInfo = await fetchFieldMap(AIRTABLE_BASE_ID, tableName);
  console.log('Found', Object.keys(schemaInfo.fieldMap).length, 'fields for table', tableName);

  // Extract records
  var records = extractRecords(parsed);
  console.log('Extracted', records.length, 'records');

  // Build the self-describing backup
  var migrated = {
    schemaVersion: canonicalSchema.CURRENT_SCHEMA_VERSION,
    baseId: AIRTABLE_BASE_ID,
    tableId: schemaInfo.tableId,
    tableName: tableName,
    generatedAt: new Date().toISOString(),
    fieldMap: schemaInfo.fieldMap,
    records: records
  };

  // Write the migrated backup
  var outPath = outputPath || inputPath.replace(/\.json$/, '-v' + canonicalSchema.CURRENT_SCHEMA_VERSION + '.json');
  fs.writeFileSync(outPath, JSON.stringify(migrated, null, 2));
  console.log('Migrated backup written to:', outPath);
  console.log('Done. This backup can now be restored without Airtable access.');
}

// CLI entry point
var args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/migrate-backup.js <legacy-backup.json> <tableName> [output.json]');
  console.error('');
  console.error('Environment variables:');
  console.error('  AIRTABLE_API_KEY  - Your Airtable personal access token');
  console.error('  AIRTABLE_BASE_ID  - The Airtable base ID');
  process.exit(1);
}

migrate(args[0], args[1], args[2]).catch(function(err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
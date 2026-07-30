/**
 * scripts/lib/backupValidator.js
 *
 * Validates backup files against the self-describing backup format.
 *
 * Self-describing backup format:
 * {
 *   "schemaVersion": 2,
 *   "baseId": "appXXXXXXXX",
 *   "tableId": "tblXXXXXXXX",
 *   "tableName": "Products",
 *   "generatedAt": "2026-07-12T00:00:00.000Z",
 *   "fieldMap": {
 *     "fldXXXXX": "Name",
 *     "fldYYYYY": "Slug"
 *   },
 *   "records": [...]
 * }
 *
 * Legacy backups (without metadata) are detected and rejected
 * with a descriptive error directing the user to migrate them first.
 */

var canonicalSchema = require('./canonicalSchema');

var SUPPORTED_SCHEMA_VERSIONS = [2];

/**
 * Detect the format of a parsed backup object.
 *
 * @param {object} parsed - The parsed JSON backup
 * @returns {string} One of: 'self-describing', 'legacy-cellValuesByFieldId', 'legacy-fields-with-ids', 'legacy-fields-with-names', 'unknown'
 */
function detectFormat(parsed) {
  // Self-describing backup
  if (parsed && parsed.schemaVersion && parsed.tableName && parsed.fieldMap && Array.isArray(parsed.records)) {
    return 'self-describing';
  }

  // Legacy: { records: [{ id, cellValuesByFieldId: {...} }] }
  if (parsed && parsed.records && Array.isArray(parsed.records) && parsed.records.length > 0) {
    var first = parsed.records[0];
    if (first && first.cellValuesByFieldId) {
      return 'legacy-cellValuesByFieldId';
    }
    if (first && first.fields && typeof first.fields === 'object') {
      var keys = Object.keys(first.fields);
      if (keys.length > 0 && keys.every(function(k) { return /^fld[A-Za-z0-9]+$/.test(k); })) {
        return 'legacy-fields-with-ids';
      }
      return 'legacy-fields-with-names';
    }
  }

  // Legacy: [{ id, fields: {...} }] or [{ id, cellValuesByFieldId: {...} }]
  if (Array.isArray(parsed) && parsed.length > 0) {
    var first = parsed[0];
    if (first && first.cellValuesByFieldId) {
      return 'legacy-cellValuesByFieldId';
    }
    if (first && first.fields && typeof first.fields === 'object') {
      var keys = Object.keys(first.fields);
      if (keys.length > 0 && keys.every(function(k) { return /^fld[A-Za-z0-9]+$/.test(k); })) {
        return 'legacy-fields-with-ids';
      }
      return 'legacy-fields-with-names';
    }
  }

  return 'unknown';
}

/**
 * Validate a self-describing backup.
 *
 * @param {object} parsed - The parsed JSON backup
 * @returns {object} { valid: boolean, errors: string[], tableName: string, fieldMap: object, records: array }
 */
function validateBackup(parsed) {
  var errors = [];

  // Detect format
  var format = detectFormat(parsed);

  if (format === 'unknown') {
    return {
      valid: false,
      errors: ['Unrecognized backup format. Expected a self-describing backup with schemaVersion, tableName, fieldMap, and records.'],
      format: format
    };
  }

  // Reject legacy formats — must be migrated first
  if (format !== 'self-describing') {
    var legacyMessages = {
      'legacy-cellValuesByFieldId': 'Backup uses cellValuesByFieldId format without fieldMap. Run: node scripts/migrate-backup.js <backup-file>',
      'legacy-fields-with-ids': 'Backup uses fields with Airtable field ID keys without fieldMap. Run: node scripts/migrate-backup.js <backup-file>',
      'legacy-fields-with-names': 'Backup uses fields with human-readable names but no schemaVersion. Run: node scripts/migrate-backup.js <backup-file>'
    };

    return {
      valid: false,
      errors: [legacyMessages[format] || 'Legacy backup format detected. Run: node scripts/migrate-backup.js <backup-file>'],
      format: format
    };
  }

  // Validate schemaVersion
  var schemaVersion = parsed.schemaVersion;
  if (typeof schemaVersion !== 'number') {
    errors.push('schemaVersion must be a number, got: ' + typeof schemaVersion);
  } else if (SUPPORTED_SCHEMA_VERSIONS.indexOf(schemaVersion) === -1) {
    errors.push('Unsupported schemaVersion: ' + schemaVersion + '. Supported versions: ' + SUPPORTED_SCHEMA_VERSIONS.join(', '));
  }

  // Validate required metadata fields
  var requiredFields = ['schemaVersion', 'baseId', 'tableId', 'tableName', 'generatedAt', 'fieldMap', 'records'];
  requiredFields.forEach(function(field) {
    if (parsed[field] === undefined || parsed[field] === null) {
      errors.push('Missing required field: ' + field);
    }
  });

  // Validate tableName is a known table
  if (parsed.tableName && !canonicalSchema.CANONICAL_SCHEMA[parsed.tableName]) {
    errors.push('Unknown tableName: ' + parsed.tableName + '. Known tables: ' + Object.keys(canonicalSchema.CANONICAL_SCHEMA).join(', '));
  }

  // Validate fieldMap is an object
  if (parsed.fieldMap && typeof parsed.fieldMap !== 'object') {
    errors.push('fieldMap must be an object');
  }

  // Validate records is an array
  if (parsed.records && !Array.isArray(parsed.records)) {
    errors.push('records must be an array');
  }

  // Validate each record has an id
  if (Array.isArray(parsed.records)) {
    parsed.records.forEach(function(record, index) {
      if (!record || !record.id) {
        errors.push('Record at index ' + index + ' is missing id');
      }
    });
  }

  // Validate generatedAt is a valid date
  if (parsed.generatedAt) {
    var date = new Date(parsed.generatedAt);
    if (isNaN(date.getTime())) {
      errors.push('generatedAt is not a valid date: ' + parsed.generatedAt);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    format: format,
    tableName: parsed.tableName,
    fieldMap: parsed.fieldMap,
    records: parsed.records,
    schemaVersion: parsed.schemaVersion
  };
}

module.exports = {
  detectFormat: detectFormat,
  validateBackup: validateBackup,
  SUPPORTED_SCHEMA_VERSIONS: SUPPORTED_SCHEMA_VERSIONS
};
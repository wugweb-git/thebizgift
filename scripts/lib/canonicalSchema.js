/**
 * scripts/lib/canonicalSchema.js
 *
 * Canonical schema definition and normalization layer.
 *
 * This module is the SINGLE source of truth for the data shape that enters Redis.
 * Every data source (Airtable sync, CSV seed, JSON backup restore) must pass
 * through normalizeRecords() before writing to Redis.
 *
 * Canonical record shape:
 *   {
 *     id: "recXXXXXXXX",
 *     fields: {
 *       "Human Readable Name": value,
 *       ...
 *     }
 *   }
 *
 * Nothing outside this module should know about:
 * - Airtable field IDs (fldXXXXX)
 * - cellValuesByFieldId format
 * - Airtable API response structures
 */

// Canonical field definitions per table
var CANONICAL_SCHEMA = {
  Products: {
    required: ['website URL Slug', 'Product Website Name', 'Product Images'],
    optional: [
      'Product Website Description', 'SEO Title', 'SEO Description',
      'Website Image Alt Text', 'TBG Product Code', 'MOQ', 'Material',
      'Branding Option', 'Featured on Homepage', 'Published',
      'Category Name (from Category)', 'Category Slug (from Category)',
      'Name (from Occasion)', 'Slug (from Occasion)',
      'Name (from Collections)', 'Slug (from Collections)',
      'Category', 'Occasion', 'Collections', 'Product Tags',
      'USP', 'Product Type', 'Priority', 'Sub Category Name (from Sub Category)'
    ]
  },
  Category: {
    required: ['Name', 'Slug'],
    optional: ['Description', 'Image', 'Published', 'Order', 'Sub Categories', 'Products', 'Products 2']
  },
  Occasions: {
    required: ['Name', 'Slug'],
    optional: ['Description', 'Hero Image', 'Published', 'Order', 'Featured', 'Products', 'Products 2']
  },
  Collections: {
    required: ['Name', 'Slug'],
    optional: ['Description', 'Published', 'Order', 'Products', 'Products 2']
  }
};

var CURRENT_SCHEMA_VERSION = 2;

function normalizeRecord(record, fieldMap, tableName) {
  if (!record || typeof record !== 'object') {
    throw new Error('normalizeRecord: record is not an object');
  }
  if (!record.id) {
    throw new Error('normalizeRecord: record is missing id');
  }

  var fields = {};
  var schema = CANONICAL_SCHEMA[tableName];
  var allExpectedFields = schema ? schema.required.concat(schema.optional) : [];

  var sourceFields = null;

  if (record.fields && typeof record.fields === 'object') {
    var keys = Object.keys(record.fields);
    var hasFieldIds = keys.some(function(k) { return /^fld[A-Za-z0-9]+$/.test(k); });
    var hasReadableNames = keys.some(function(k) { return !/^fld[A-Za-z0-9]+$/.test(k); });

    if (hasFieldIds && !hasReadableNames) {
      sourceFields = record.fields;
    } else if (hasReadableNames) {
      sourceFields = record.fields;
    }
  }

  if (!sourceFields && record.cellValuesByFieldId && typeof record.cellValuesByFieldId === 'object') {
    sourceFields = record.cellValuesByFieldId;
  }

  if (!sourceFields) {
    allExpectedFields.forEach(function(fieldName) {
      fields[fieldName] = null;
    });
    return { id: record.id, fields: fields };
  }

  Object.keys(sourceFields).forEach(function(key) {
    var value = sourceFields[key];
    var readableName = key;

    if (/^fld[A-Za-z0-9]+$/.test(key) && fieldMap && fieldMap[key]) {
      readableName = fieldMap[key];
    }

    if (allExpectedFields.indexOf(readableName) !== -1) {
      fields[readableName] = value;
    }
  });

  allExpectedFields.forEach(function(fieldName) {
    if (!(fieldName in fields)) {
      fields[fieldName] = null;
    }
  });

  return { id: record.id, fields: fields };
}

function normalizeRecords(records, fieldMap, tableName) {
  if (!Array.isArray(records)) {
    throw new Error('normalizeRecords: records is not an array');
  }

  var normalized = [];
  var errors = [];

  records.forEach(function(record, index) {
    try {
      var canonical = normalizeRecord(record, fieldMap, tableName);

      var schema = CANONICAL_SCHEMA[tableName];
      if (schema) {
        schema.required.forEach(function(reqField) {
          if (canonical.fields[reqField] === null || canonical.fields[reqField] === undefined) {
            errors.push({
              recordId: record.id || 'unknown',
              field: reqField,
              error: 'Required field is missing or null'
            });
          }
        });
      }

      normalized.push(canonical);
    } catch (err) {
      errors.push({
        recordIndex: index,
        recordId: record.id || 'unknown',
        error: err.message
      });
    }
  });

  return { records: normalized, errors: errors };
}

function isCanonicalRecord(record) {
  return record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    record.fields &&
    typeof record.fields === 'object' &&
    !Array.isArray(record.fields);
}

module.exports = {
  CANONICAL_SCHEMA: CANONICAL_SCHEMA,
  CURRENT_SCHEMA_VERSION: CURRENT_SCHEMA_VERSION,
  normalizeRecord: normalizeRecord,
  normalizeRecords: normalizeRecords,
  isCanonicalRecord: isCanonicalRecord
};
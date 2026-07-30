/**
 * api/_lib/compatFields.js
 *
 * Compatibility field accessor for the production Redis buffer.
 *
 * The production Redis cache currently contains records in three different
 * formats (legacy from a backup restore that bypassed normalization):
 *
 *   A) { id, fields: { "Name": value, ... } }        — canonical (ideal)
 *   B) { id, fields: { fldXXXXX: value, ... } }       — field IDs as keys
 *   C) { id, cellValuesByFieldId: { fldXXXXX: ... } } — legacy Airtable format
 *
 * This module provides a safe accessor that never throws, so API routes
 * can render whatever data is available without crashing.
 *
 * When a field cannot be resolved (wrong format, missing key, null value)
 * the accessor returns `null` — the caller is responsible for applying
 * its own default/fallback logic, which every API route already has.
 *
 * This is a TEMPORARY compatibility shim. Once the Redis buffer is
 * repopulated with canonical data (via refresh-cache.js), this module
 * can be removed and routes can read record.fields directly again.
 */

/**
 * Safely read a field from a record regardless of the underlying storage
 * format. Returns the field value if found, or `null` if the record is
 * malformed or the field is missing.
 *
 * @param {object} record - A record from the Redis buffer
 * @param {string} fieldName - The human-readable field name to look up
 * @returns {*} The field value, or null if not found
 */
function getField(record, fieldName) {
  if (!record || typeof record !== 'object') return null;

  // Format A: canonical { id, fields: { "Name": ... } }
  if (record.fields && typeof record.fields === 'object' && !Array.isArray(record.fields)) {
    // Check if this is a human-readable key (not fldXXX)
    var keys = Object.keys(record.fields);
    if (keys.length > 0 && !/^fld[A-Za-z0-9]+$/.test(keys[0])) {
      // Human-readable keys — direct lookup
      return record.fields[fieldName] !== undefined ? record.fields[fieldName] : null;
    }
    // Format B: fields with fldXXX keys — cannot resolve without a fieldMap
    return null;
  }

  // Format C: { id, cellValuesByFieldId: { fldXXXXX: ... } }
  // Cannot resolve without a fieldMap — return null
  return null;
}

/**
 * Safely read an attachment array from a record. Handles the same three
 * formats as getField(), but returns an empty array instead of null when
 * the field is missing, since callers iterate over the result.
 *
 * @param {object} record - A record from the Redis buffer
 * @param {string} fieldName - The human-readable field name to look up
 * @returns {Array} The attachment array, or empty array if not found
 */
function getAttachments(record, fieldName) {
  var value = getField(record, fieldName);
  if (Array.isArray(value)) return value;
  return [];
}

/**
 * Extract the first image URL from an attachment field. Returns null if
 * no image is available.
 *
 * @param {object} record - A record from the Redis buffer
 * @param {string} fieldName - The attachment field name
 * @returns {string|null} The first image URL, or null
 */
function getFirstImageUrl(record, fieldName) {
  var attachments = getAttachments(record, fieldName);
  if (attachments.length > 0 && attachments[0].url) {
    return attachments[0].url;
  }
  return null;
}

module.exports = {
  getField: getField,
  getAttachments: getAttachments,
  getFirstImageUrl: getFirstImageUrl
};
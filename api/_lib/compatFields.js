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
 * This module provides a safe accessor that resolves field IDs to their
 * canonical human-readable names using a static mapping derived from the
 * Airtable backup files committed in docs/backups/.
 *
 * This is a TEMPORARY compatibility shim. Once the Redis buffer is
 * repopulated with canonical data (via refresh-cache.js), this module
 * can be removed and routes can read record.fields directly again.
 */

// Static field ID → canonical name mapping derived from the Airtable
// backup files (docs/backups/airtable-products-backup-2026-07-12.json,
// docs/backups/airtable-category-backup-2026-07-12.json) and the CSV
// export column headers (airtable backup/Products-Website Sync (1).csv).
//
// Mapped from sample values in the Products backup:
//   fld4SiFsNiKw58OnG = "SR187" → TBG Product Code
//   fld6I1k1B1Vw4RalY = "Everyday Tech Combo" → Product Website Name
//   fld8HsOmx5N2yTCb5 = "Tech Combo" → Internal/product type name
//   fldCtW2pAE5emtHAt = "A practical tech combo..." → Product Website Description
//   fldFL4E8GB3fRFzK0 = [{ url: "https://..." }] → Product Images
//   fldN4Y50Wkiwp248K = "tech-combo" → website URL Slug
//   fldZfN6R7eIj6M6xS = "Everyday Tech Combo — ..." → SEO Title
//   fldYSqeNVKpmG8zzl = "Power through the day..." → SEO Description
//   fldSiQwnAxwfHVOY2 = 1255 → MOQ
//   fldtkImf71Xjm0YTE = { name: "Metal" } → Material
//   fldUGpZKAkZXctWGg = [{ name: "UV" }] → Branding Option
//   fldsAqGoEmdEgFzfL = [{ name: "Employee Joining Kits" }] → Occasion
//   fldkjPXPmHQyV9F8x = [{ name: "Combo" }] → Category
//   fldsURYKbiYLX5Fde = [{ name: "Combo" }] → Collections
//   fldzc0zO7jyNYRCCJ = "Tech gadget combo set..." → USP
//   fld6ZWko6MAwxbBMX = [{ name: "Corporate Gift" }] → Product Type
//   fldss66JvDg82HMbL = [{ name: "Jainex Corporate Gifts" }] → Vendor
//   fldMGx8ENsKMe7dTe = "500" → MOQ (string value)
//   fldS6UzPS2ybghszR = 500 → Internal Price
//   fldlRe0d87c6q4LxU = "TBG-COMBO-61" → TBG Product Code (alt)
//   fldHpOJD8f5MdQsDs = "Plastic Pens" → Product Type (subcategory)
//   fldbKoPtdfOAHf8MC = [{ name: "Premium Picks" }] → Collections
//   fldRGhFwd1YO4u80n = { name: " Utility" } → Category
//   fldpHO6aLsaYODJAz = { name: "active" } → Product Status
//   fld2Wmlithl0e2ghI = { name: "Website Ready" } → Product Status
//   fld4KJSPsDKQNevV0 = [{ name: "Premium" }] → Product Status
//   fldTATKV9ylWOjp2J = "UV, Laser" → Branding Option (text)
//   fld0cgJBrJAmUiFmr = { linkedRecordIds: [...] } → Category
//   fldrFZUmJMhlCvdkd = { linkedRecordIds: [...] } → Category
//   fldlG5DB0f4xwAUAz = "Soft Grey Ballpoint Pen" → Product Website Name
//   fldBR8gW8izDOHw8N = "Quietly refined..." → Product Website Description
//   fldmOXnUGzltdpxCh = "Premium" → Product Status
//   fldrhxFHmh9RLyVbg = "Premium" → Product Status
var PRODUCTS_FIELD_MAP = {
  'fld4SiFsNiKw58OnG': 'TBG Product Code',
  'fld6I1k1B1Vw4RalY': 'Product Website Name',
  'fld8HsOmx5N2yTCb5': 'Product Type',
  'fldCtW2pAE5emtHAt': 'Product Website Description',
  'fldFL4E8GB3fRFzK0': 'Product Images',
  'fldN4Y50Wkiwp248K': 'website URL Slug',
  'fldZfN6R7eIj6M6xS': 'SEO Title',
  'fldYSqeNVKpmG8zzl': 'SEO Description',
  'fldSiQwnAxwfHVOY2': 'MOQ',
  'fldtkImf71Xjm0YTE': 'Material',
  'fldUGpZKAkZXctWGg': 'Branding Option',
  'fldsAqGoEmdEgFzfL': 'Occasion',
  'fldkjPXPmHQyV9F8x': 'Category',
  'fldsURYKbiYLX5Fde': 'Collections',
  'fldzc0zO7jyNYRCCJ': 'USP',
  'fld6ZWko6MAwxbBMX': 'Product Type',
  'fldss66JvDg82HMbL': 'Vendor',
  'fldMGx8ENsKMe7dTe': 'MOQ',
  'fldS6UzPS2ybghszR': 'Internal Price',
  'fldlRe0d87c6q4LxU': 'TBG Product Code',
  'fldHpOJD8f5MdQsDs': 'Product Type',
  'fldbKoPtdfOAHf8MC': 'Collections',
  'fldRGhFwd1YO4u80n': 'Category',
  'fldpHO6aLsaYODJAz': 'Product Status',
  'fld2Wmlithl0e2ghI': 'Product Status',
  'fld4KJSPsDKQNevV0': 'Product Status',
  'fldTATKV9ylWOjp2J': 'Branding Option',
  'fld0cgJBrJAmUiFmr': 'Category',
  'fldrFZUmJMhlCvdkd': 'Category',
  'fldlG5DB0f4xwAUAz': 'Product Website Name',
  'fldBR8gW8izDOHw8N': 'Product Website Description',
  'fldmOXnUGzltdpxCh': 'Product Status',
  'fldrhxFHmh9RLyVbg': 'Product Status'
};

// Category table field IDs (from backup sample values):
//   fldEi5uTmhh7Ib1rw = "LSR" → Slug
//   fldGzWT5fOKmhMyVa = "Laser" → Name
//   fldTXwmQoR2TCBS5p = { name: "Branding" } → Sub Categories
//   fldU6BwruKUKt2twC = [{ name: "TBG-BOT-34" }] → Products
//   fldZGUtXfT5icoOl5 = [{ name: "TBG-BAG-68" }] → Products 2
var CATEGORY_FIELD_MAP = {
  'fldEi5uTmhh7Ib1rw': 'Slug',
  'fldGzWT5fOKmhMyVa': 'Name',
  'fldTXwmQoR2TCBS5p': 'Sub Categories',
  'fldU6BwruKUKt2twC': 'Products',
  'fldZGUtXfT5icoOl5': 'Products 2'
};

// Occasions/Collections in Redis contain Products link-update data
// (batch_0.json, products_link_updates.json) with only 2 fields:
//   fldY2S1c8pIQ0D15z = ["recEaCCFVgSPk0B3Q", ...] → Category link
//   fld6MRVRfovlrSEz0 = ["recrTCWrPgEQVpk1R", ...] → Occasion link
var OCCASIONS_FIELD_MAP = {
  'fldY2S1c8pIQ0D15z': 'Category',
  'fld6MRVRfovlrSEz0': 'Occasion'
};

var COLLECTIONS_FIELD_MAP = OCCASIONS_FIELD_MAP;

// Per-table field maps
var TABLE_FIELD_MAPS = {
  Products: PRODUCTS_FIELD_MAP,
  Category: CATEGORY_FIELD_MAP,
  Occasions: OCCASIONS_FIELD_MAP,
  Collections: COLLECTIONS_FIELD_MAP
};

/**
 * Resolve a field ID to its canonical name using the per-table field map.
 * Returns the canonical name if found, or the original key if not mapped.
 */
function resolveFieldId(key, tableName) {
  var map = TABLE_FIELD_MAPS[tableName];
  if (map && map[key]) {
    return map[key];
  }
  return key;
}

/**
 * Safely read a field from a record regardless of the underlying storage
 * format. Returns the field value if found, or `null` if the record is
 * malformed or the field is missing.
 *
 * @param {object} record - A record from the Redis buffer
 * @param {string} fieldName - The human-readable field name to look up
 * @param {string} tableName - The table name (for field ID resolution)
 * @returns {*} The field value, or null if not found
 */
function getField(record, fieldName, tableName) {
  if (!record || typeof record !== 'object') return null;

  // Format A: canonical { id, fields: { "Name": ... } }
  if (record.fields && typeof record.fields === 'object' && !Array.isArray(record.fields)) {
    var keys = Object.keys(record.fields);
    if (keys.length > 0 && !/^fld[A-Za-z0-9]+$/.test(keys[0])) {
      // Human-readable keys — direct lookup
      return record.fields[fieldName] !== undefined ? record.fields[fieldName] : null;
    }
    // Format B: fields with fldXXX keys — resolve via field map
    for (var i = 0; i < keys.length; i++) {
      var resolved = resolveFieldId(keys[i], tableName);
      if (resolved === fieldName) {
        return record.fields[keys[i]] !== undefined ? record.fields[keys[i]] : null;
      }
    }
    return null;
  }

  // Format C: { id, cellValuesByFieldId: { fldXXXXX: ... } }
  if (record.cellValuesByFieldId && typeof record.cellValuesByFieldId === 'object') {
    var cvKeys = Object.keys(record.cellValuesByFieldId);
    for (var j = 0; j < cvKeys.length; j++) {
      var resolvedCv = resolveFieldId(cvKeys[j], tableName);
      if (resolvedCv === fieldName) {
        return record.cellValuesByFieldId[cvKeys[j]] !== undefined ? record.cellValuesByFieldId[cvKeys[j]] : null;
      }
    }
    return null;
  }

  return null;
}

/**
 * Safely read an attachment array from a record. Handles the same three
 * formats as getField(), but returns an empty array instead of null when
 * the field is missing, since callers iterate over the result.
 *
 * @param {object} record - A record from the Redis buffer
 * @param {string} fieldName - The human-readable field name to look up
 * @param {string} tableName - The table name (for field ID resolution)
 * @returns {Array} The attachment array, or empty array if not found
 */
function getAttachments(record, fieldName, tableName) {
  var value = getField(record, fieldName, tableName);
  if (Array.isArray(value)) return value;
  return [];
}

/**
 * Extract the first image URL from an attachment field. Returns null if
 * no image is available.
 *
 * @param {object} record - A record from the Redis buffer
 * @param {string} fieldName - The attachment field name
 * @param {string} tableName - The table name (for field ID resolution)
 * @returns {string|null} The first image URL, or null
 */
function getFirstImageUrl(record, fieldName, tableName) {
  var attachments = getAttachments(record, fieldName, tableName);
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
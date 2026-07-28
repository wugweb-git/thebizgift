/**
 * scripts/_lib/csvSeedUtils.js
 *
 * Shared helpers for the scripts/seed-*-from-csv.js one-time bridge
 * scripts (see scripts/seed-products-from-csv.js for the full rationale).
 * Kept separate from api/_lib/ since these are manual/local-only tools,
 * never deployed as part of the Vercel functions.
 */

const fs = require('fs');
const crypto = require('crypto');
const { parse } = require('csv-parse/sync');

function readCsvRows(csvPath) {
  var raw = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, ''); // strip BOM
  return parse(raw, { columns: true, skip_empty_lines: true });
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitMulti(value) {
  return String(value || '')
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

function isChecked(value) {
  return String(value || '').trim() === 'checked';
}

// Airtable's CSV attachment cells look like "filename.jpg (https://...),
// other.jpg (https://...)" -- match each self-contained "text (url)" pair
// rather than splitting on comma (which breaks on cells with 2+ images,
// since the separator between pairs is also a comma). The url group
// specifically requires an http(s):// prefix -- filenames can themselves
// contain parens (e.g. Airtable's own "BCC Hamper (2).png" duplicate-file
// naming), and without this constraint a non-greedy filename match stops
// at that embedded "(2)" instead of the real URL that follows it.
function parseAttachments(cell) {
  if (!cell) return [];
  var re = /([^,]+?)\s*\((https?:\/\/[^()]+)\)/g;
  var out = [];
  var match;
  while ((match = re.exec(cell)) !== null) {
    var filename = match[1].trim();
    var url = match[2].trim();
    // Deterministic id from the URL so re-running a seed script (or later
    // the real Airtable-backed sync) recognizes the same attachment and
    // skips re-mirroring it.
    var id = 'csvseed-' + crypto.createHash('md5').update(url).digest('hex').slice(0, 16);
    out.push({ id: id, url: url, filename: filename });
  }
  return out;
}

module.exports = {
  readCsvRows: readCsvRows,
  slugify: slugify,
  splitMulti: splitMulti,
  isChecked: isChecked,
  parseAttachments: parseAttachments
};

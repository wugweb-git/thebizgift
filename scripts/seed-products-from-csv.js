#!/usr/bin/env node
/**
 * scripts/seed-products-from-csv.js
 *
 * One-time/manual bridge for when Airtable's REST API is rate-limited (or
 * you just want to seed fast): loads the Products cache/KV buffer directly
 * from a CSV export (Airtable's "Website Sync" view -> Download CSV),
 * without ever calling api.airtable.com. Image attachments referenced in
 * the CSV are downloaded from Airtable's attachment CDN
 * (v5.airtableusercontent.com) -- a different domain from api.airtable.com,
 * NOT subject to Airtable's 5 requests/second REST API cap -- and mirrored
 * into Vercel Blob storage using the exact same idempotent logic
 * api/cron/refresh-cache.js uses for live syncs (same attachment-id ->
 * Blob-URL map, so running this and the real sync later won't re-upload
 * anything already mirrored).
 *
 * CAVEAT: Airtable's CSV-exported attachment URLs are signed/time-limited.
 * Run this soon after exporting the CSV, not days later, or the image
 * downloads will start failing (mirrorImages() fails open per-attachment,
 * so a few expired URLs won't break the whole run -- but that product's
 * image will silently keep pointing at Airtable's now-dead URL).
 *
 * Only seeds the Products table. Category/Occasions/Collections still read
 * from Airtable normally -- export and adapt this script for those tables
 * too if they hit the same rate-limit wall (their tables are much smaller,
 * so less likely to).
 *
 * Usage:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   BLOB_READ_WRITE_TOKEN=... \
 *   node scripts/seed-products-from-csv.js "/path/to/export.csv"
 *
 * (No AIRTABLE_API_KEY/AIRTABLE_BASE_ID needed -- this script never calls
 * Airtable's REST API. Pull the Upstash/Blob values from the Vercel
 * project's environment variables, e.g. via `vercel env pull`, so this
 * seeds the SAME buffer the live site reads from.)
 */

const fs = require('fs');
const crypto = require('crypto');
const { parse } = require('csv-parse/sync');
const airtableCache = require('../api/_lib/airtableCache');
const refreshCache = require('../api/cron/refresh-cache');

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

// Airtable's CSV attachment cells look like "filename.jpg (https://...),
// other.jpg (https://...)" -- match each self-contained "text (url)" pair
// rather than splitting on comma (which would break on cells with 2+
// attachments, since the separator between pairs is also a comma).
function parseAttachments(cell) {
  if (!cell) return [];
  var re = /([^,()]+?)\s*\(([^()]+)\)/g;
  var out = [];
  var match;
  while ((match = re.exec(cell)) !== null) {
    var filename = match[1].trim();
    var url = match[2].trim();
    // Deterministic id from the URL so re-running this script (or later
    // running the real Airtable-backed sync once the API is healthy again)
    // recognizes the same attachment and skips re-mirroring it.
    var id = 'csvseed-' + crypto.createHash('md5').update(url).digest('hex').slice(0, 16);
    out.push({ id: id, url: url, filename: filename });
  }
  return out;
}

function rowToRecord(row) {
  var categoryName = (row['Category'] || '').trim();
  var occasionNames = splitMulti(row['Occasion']);
  var collectionNames = splitMulti(row['Collections']);
  var collectionSlugsRaw = splitMulti(row['Slug (from Collections)']);
  // Only trust the CSV's own slug column if it lines up 1:1 with the names
  // -- otherwise fall back to deriving slugs the same way Category/Occasion
  // do below, rather than risk a misaligned mapping.
  var collectionSlugs = (collectionSlugsRaw.length === collectionNames.length)
    ? collectionSlugsRaw
    : collectionNames.map(slugify);

  return {
    id: 'csvseed-' + slugify(row['website URL Slug'] || row['TBG Product Code'] || Math.random().toString(36).slice(2)),
    fields: {
      'website URL Slug': row['website URL Slug'] || '',
      'Product Website Name': row['Product Website Name'] || '',
      'Product Website Description': row['Product Website Description'] || '',
      'SEO Title': row['SEO Title'] || '',
      'SEO Description': row['SEO Description'] || '',
      'Website Image Alt Text': row['Website Image Alt Text'] || '',
      'TBG Product Code': row['TBG Product Code'] || '',
      'MOQ': row['MOQ'] || '',
      'USP': row['USP'] || '',
      'Material': row['Material'] || '',
      'Product Type': row['Product Type'] || '',
      'Published': row['Published'] === 'checked',
      'Featured on Homepage': row['Featured on Homepage'] === 'checked',
      'Product Tags': splitMulti(row['Product Tags']),
      'Branding Option': splitMulti(row['Branding Option']),
      'Category Name (from Category)': categoryName ? [categoryName] : [],
      'Category Slug (from Category)': categoryName ? [slugify(categoryName)] : [],
      'Sub Category Name (from Sub Category)': row['Sub Category'] ? [row['Sub Category']] : [],
      'Name (from Occasion)': occasionNames,
      'Slug (from Occasion)': occasionNames.map(slugify),
      'Name (from Collections)': collectionNames,
      'Slug (from Collections)': collectionSlugs,
      // get-hamper.js's related-products algorithm scores on these RAW
      // fields (Airtable's actual linked-record ids in a real API
      // response), not the "Name (from X)" lookup fields above -- this CSV
      // has no record ids, so the resolved display names stand in for them.
      // Two products sharing the same name here are treated as sharing
      // that Category/Occasion/Collection, which is exactly what the
      // scoring needs (it only does exact-value array-overlap checks, it
      // never dereferences these as real ids).
      'Category': categoryName ? [categoryName] : [],
      'Occasion': occasionNames,
      'Collections': collectionNames,
      'Product Images': parseAttachments(row['Product Images'])
      // Deliberately not present in this CSV export, and left absent here
      // (formatProduct()/get-featured-hampers.js already fall back to
      // sensible defaults for all of these): Editorial Title/Paragraphs/
      // Image, Product Contents, FAQ, CTA Title/Description/Image/
      // Background/Button Label, Lead Time, Delivery, Response Time,
      // Production Workflow, Category/Collection/Occasion Image (from
      // linked taxonomy records), Priority.
    }
  };
}

async function main() {
  var csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scripts/seed-products-from-csv.js <path-to-csv>');
    process.exit(1);
  }

  var raw = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, ''); // strip BOM
  var rows = parse(raw, { columns: true, skip_empty_lines: true });

  var allRecords = rows.map(rowToRecord);
  var published = allRecords.filter(function (r) { return r.fields['Published'] === true; });

  console.log('Parsed ' + rows.length + ' CSV rows -> ' + published.length + ' Published.');

  console.log('Mirroring images to Vercel Blob (skipped if BLOB_READ_WRITE_TOKEN is unset)...');
  var mirrored = await refreshCache.mirrorImages('Products', published);

  await airtableCache.setTable('Products', '{Published}=TRUE()', undefined, mirrored);

  var withImages = mirrored.filter(function (r) {
    return r.fields['Product Images'] && r.fields['Product Images'].length > 0;
  }).length;
  var mirroredCount = mirrored.filter(function (r) {
    var imgs = r.fields['Product Images'] || [];
    return imgs.some(function (img) { return img.url.indexOf('blob.vercel-storage.com') !== -1; });
  }).length;

  console.log('Seeded ' + mirrored.length + ' products into the cache/KV buffer.');
  console.log(withImages + ' have at least one image; ' + mirroredCount + ' have at least one image on Vercel Blob (rest still point at Airtable\'s CDN if Blob is unconfigured or a download failed).');
  console.log('Done. Read endpoints (get-featured-hampers.js, get-hamper.js) will now serve this seeded data until its TTL expires or a real sync overwrites it.');
}

main().catch(function (err) {
  console.error('seed-products-from-csv failed:', err);
  process.exit(1);
});

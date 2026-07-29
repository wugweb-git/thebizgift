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
 * Only seeds the Products table -- see seed-categories-from-csv.js,
 * seed-occasions-from-csv.js, and seed-collections-from-csv.js for the
 * equivalent taxonomy-table scripts (same pattern, same shared utils).
 *
 * Usage:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   (or KV_REST_API_URL=... KV_REST_API_TOKEN=..., Vercel's native naming) \
 *   BLOB_READ_WRITE_TOKEN=... \
 *   node scripts/seed-products-from-csv.js "/path/to/export.csv"
 *
 * (No AIRTABLE_API_KEY/AIRTABLE_BASE_ID needed -- this script never calls
 * Airtable's REST API. Pull the Upstash/Blob values from the Vercel
 * project's environment variables, e.g. via `vercel env pull`, so this
 * seeds the SAME buffer the live site reads from.)
 */

const airtableCache = require('../api/_lib/airtableCache');
const refreshCache = require('../api/cron/refresh-cache');
const csvUtils = require('./_lib/csvSeedUtils');

// This is a bridge/outage-recovery seed, not a steady sync cycle -- the
// normal 5-minute default TTL (tuned for "refresh often, stay fresh" once a
// real sync is running) would expire long before anything else refreshes
// it, since the webhook is blocked on this Airtable plan and the daily
// cron is the only other writer. 24h gives enough runway to actually fix
// the underlying issue without the seed silently vanishing mid-diagnosis.
var SEED_TTL_MS = 24 * 60 * 60 * 1000;

function rowToRecord(row) {
  var categoryName = (row['Category'] || '').trim();
  var occasionNames = csvUtils.splitMulti(row['Occasion']);
  var collectionNames = csvUtils.splitMulti(row['Collections']);
  var collectionSlugsRaw = csvUtils.splitMulti(row['Slug (from Collections)']);
  // Only trust the CSV's own slug column if it lines up 1:1 with the names
  // -- otherwise fall back to deriving slugs the same way Category/Occasion
  // do below, rather than risk a misaligned mapping.
  var collectionSlugs = (collectionSlugsRaw.length === collectionNames.length)
    ? collectionSlugsRaw
    : collectionNames.map(csvUtils.slugify);

  return {
    id: 'csvseed-' + csvUtils.slugify(row['website URL Slug'] || row['TBG Product Code'] || Math.random().toString(36).slice(2)),
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
      'Published': csvUtils.isChecked(row['Published']),
      'Featured on Homepage': csvUtils.isChecked(row['Featured on Homepage']),
      'Product Tags': csvUtils.splitMulti(row['Product Tags']),
      'Branding Option': csvUtils.splitMulti(row['Branding Option']),
      'Category Name (from Category)': categoryName ? [categoryName] : [],
      'Category Slug (from Category)': categoryName ? [csvUtils.slugify(categoryName)] : [],
      'Sub Category Name (from Sub Category)': row['Sub Category'] ? [row['Sub Category']] : [],
      'Name (from Occasion)': occasionNames,
      'Slug (from Occasion)': occasionNames.map(csvUtils.slugify),
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
      'Product Images': csvUtils.parseAttachments(row['Product Images'])
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

  var rows = csvUtils.readCsvRows(csvPath);
  var published = rows.map(rowToRecord).filter(function (r) { return r.fields['Published'] === true; });

  console.log('Parsed ' + rows.length + ' CSV rows -> ' + published.length + ' Published.');

  console.log('Mirroring images to Vercel Blob (skipped if BLOB_READ_WRITE_TOKEN is unset)...');
  var mirrored = await refreshCache.mirrorImages('Products', published);

  var tableConfig = refreshCache.TABLES.filter(function (t) { return t.name === 'Products'; })[0];
  await airtableCache.setTable('Products', tableConfig.filter, tableConfig.extraParams, mirrored, SEED_TTL_MS);

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

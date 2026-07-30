const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const applyCors = require('./_lib/cors').applyCors;
const airtableCache = require('./_lib/airtableCache');
const compatFields = require('./_lib/compatFields');

// Published is the source of truth for live visibility (Website Ready is a
// stricter completeness gate that under-counts otherwise-complete products).
// Shared key with get-hamper.js's own Products fetch -- see airtableCache.js.
var TABLE_NAME = 'Products';
var FILTER = '{Published}=TRUE()';

module.exports = async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!airtableCache.hasContentSource()) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    // 1. Get the (possibly cached, possibly shared with get-hamper.js) records
    var records = await airtableCache.getCachedTable(TABLE_NAME, FILTER);

    // 2. Map the messy Airtable payload into clean, frontend-ready JSON
    var formattedHampers = records.map(function (record) {
      return {
        id: record.id,
        slug: compatFields.getField(record, 'website URL Slug', 'Products') || 'unknown-product',
        name: compatFields.getField(record, 'Product Website Name', 'Products') || 'Curated Hamper',
        description: compatFields.getField(record, 'Product Website Description', 'Products') || '',
        // Category/Occasion/Collections are linked-record fields — Airtable's
        // REST API returns bare record IDs for these, so names are read from
        // their paired lookup fields instead. A product can have several of
        // each (many-to-many linked records), so all are kept as arrays.
        categories: compatFields.getField(record, 'Category Name (from Category)', 'Products') || [],
        occasions: compatFields.getField(record, 'Name (from Occasion)', 'Products') || [],
        collections: compatFields.getField(record, 'Name (from Collections)', 'Products') || [],
        // Slug arrays, index-aligned with the name arrays above, for exact
        // client-side filtering that's immune to display-name drift (same
        // lookup fields already read by get-hamper.js's zipTaxonomy()).
        categorySlugs: compatFields.getField(record, 'Category Slug (from Category)', 'Products') || [],
        occasionSlugs: compatFields.getField(record, 'Slug (from Occasion)', 'Products') || [],
        collectionSlugs: compatFields.getField(record, 'Slug (from Collections)', 'Products') || [],
        moq: compatFields.getField(record, 'MOQ', 'Products') || '50',
        material: compatFields.getField(record, 'Material', 'Products') || 'Mixed',
        branding: compatFields.getField(record, 'Branding Option', 'Products') || [],
        seoTitle: compatFields.getField(record, 'SEO Title', 'Products') || '',
        seoDesc: compatFields.getField(record, 'SEO Description', 'Products') || '',
        productCode: compatFields.getField(record, 'TBG Product Code', 'Products') || '',
        featured: !!compatFields.getField(record, 'Featured on Homepage', 'Products'),
        // Manual display-order hint set by the site owner in Airtable;
        // absent for most products (sorted below).
        priority: (typeof compatFields.getField(record, 'Priority', 'Products') === 'number') ? compatFields.getField(record, 'Priority', 'Products') : null,
        // Extract the first image URL safely; Website Image Alt Text is a
        // single field covering the primary image, other filenames are ignored here.
        image: compatFields.getFirstImageUrl(record, 'Product Images', 'Products') || '/image/placeholder.png',
        imageAlt: compatFields.getField(record, 'Website Image Alt Text', 'Products') || compatFields.getField(record, 'Product Website Name', 'Products') || 'Product image'
      };
    });

    // 3. Manual Priority (ascending; Priority=1 shows first). Blank-priority
    // products sort after all prioritized ones and keep their original
    // Airtable order among themselves -- Array.prototype.sort is stable.
    formattedHampers.sort(function (a, b) {
      var aHas = a.priority !== null;
      var bHas = b.priority !== null;
      if (aHas && bHas) return a.priority - b.priority;
      if (aHas) return -1;
      if (bHas) return 1;
      return 0;
    });

    // 4. Send the clean data back to your HTML frontend
    res.status(200).json(formattedHampers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch catalog data securely.' });
  }
};

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const applyCors = require('./_lib/cors').applyCors;

module.exports = async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Published is the source of truth for live visibility (Website Ready is a
  // stricter completeness gate that under-counts otherwise-complete products).
  var TABLE_NAME = 'Products';
  var FILTER = encodeURIComponent('{Published}=TRUE()');

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    // 1. Make the secure request to Airtable
    var response = await fetch('https://api.airtable.com/v0/' + BASE_ID + '/' + TABLE_NAME + '?filterByFormula=' + FILTER, {
      headers: {
        Authorization: 'Bearer ' + AIRTABLE_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Airtable connection failed');
    }

    var data = await response.json();

    // 2. Map the messy Airtable payload into clean, frontend-ready JSON
    var formattedHampers = data.records.map(function (record) {
      return {
        id: record.id,
        slug: record.fields['website URL Slug'] || 'unknown-product',
        name: record.fields['Product Website Name'] || 'Curated Hamper',
        description: record.fields['Product Website Description'] || '',
        // Category/Occasion/Collections are linked-record fields — Airtable's
        // REST API returns bare record IDs for these, so names are read from
        // their paired lookup fields instead. A product can have several of
        // each (many-to-many linked records), so all are kept as arrays.
        categories: record.fields['Category Name (from Category)'] || [],
        occasions: record.fields['Name (from Occasion)'] || [],
        collections: record.fields['Name (from Collections)'] || [],
        // Slug arrays, index-aligned with the name arrays above, for exact
        // client-side filtering that's immune to display-name drift (same
        // lookup fields already read by get-hamper.js's zipTaxonomy()).
        categorySlugs: record.fields['Category Slug (from Category)'] || [],
        occasionSlugs: record.fields['Slug (from Occasion)'] || [],
        collectionSlugs: record.fields['Slug (from Collections)'] || [],
        moq: record.fields['MOQ'] || '50',
        material: record.fields['Material'] || 'Mixed',
        branding: record.fields['Branding Option'] || [],
        seoTitle: record.fields['SEO Title'] || '',
        seoDesc: record.fields['SEO Description'] || '',
        productCode: record.fields['TBG Product Code'] || '',
        featured: !!record.fields['Featured on Homepage'],
        // Manual display-order hint set by the site owner in Airtable;
        // absent for most products (sorted below).
        priority: (typeof record.fields['Priority'] === 'number') ? record.fields['Priority'] : null,
        // Extract the first image URL safely; Website Image Alt Text is a
        // single field covering the primary image, other filenames are ignored here.
        image: (record.fields['Product Images'] && record.fields['Product Images'].length > 0)
               ? record.fields['Product Images'][0].url
               : '/image/placeholder.png',
        imageAlt: record.fields['Website Image Alt Text'] || record.fields['Product Website Name'] || 'Product image'
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

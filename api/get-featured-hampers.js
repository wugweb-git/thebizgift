export default async function handler(req, res) {
  // These keys live safely in your Vercel dashboard, NOT in your code
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  
  // URL encoding the filter to only pull products the client marked as ready
  const TABLE_NAME = 'Products'; 
  const FILTER = encodeURIComponent('{Website Ready}=TRUE()');

  try {
    // 1. Make the secure request to Airtable
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${FILTER}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Airtable connection failed');
    }

    const data = await response.json();
    
    // 2. Map the messy Airtable payload into clean, frontend-ready JSON
    const formattedHampers = data.records.map(record => ({
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
      moq: record.fields['MOQ'] || '50',
      material: record.fields['Material'] || 'Mixed',
      branding: record.fields['Branding Option'] || [],
      seoTitle: record.fields['SEO Title'] || '',
      seoDesc: record.fields['SEO Description'] || '',
      productCode: record.fields['TBG Product Code'] || '',
      // Extract the first image URL safely; Website Image Alt Text is a
      // single field covering the primary image, other filenames are ignored here.
      image: (record.fields['Product Images'] && record.fields['Product Images'].length > 0)
             ? record.fields['Product Images'][0].url
             : '/image/placeholder.svg',
      imageAlt: record.fields['Website Image Alt Text'] || record.fields['Product Website Name'] || 'Product image'
    }));

    // 3. Send the clean data back to your HTML frontend
    res.status(200).json(formattedHampers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch catalog data securely.' });
  }
}
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
      slug: record.fields['URL Slug'] || 'unknown-product',
      name: record.fields['Website Product Name'] || 'Curated Hamper',
      description: record.fields['Website Description'] || '',
      category: record.fields['Category'] || [],
      occasion: record.fields['Occasion Tags'] || [],
      curationTag: record.fields['Curated Gift Tags'] ? record.fields['Curated Gift Tags'][0] : 'Curated',
      moq: record.fields['MOQ'] || '50',
      material: record.fields['Material'] || 'Mixed',
      branding: record.fields['Branding Option'] || [],
      seoTitle: record.fields['SEO Title'] || '',
      seoDesc: record.fields['SEO Description'] || '',
      // Extract the first image URL safely
      image: (record.fields['Product Images'] && record.fields['Product Images'].length > 0) 
             ? record.fields['Product Images'][0].url 
             : 'image/placeholder-blank.jpg'
    }));

    // 3. Send the clean data back to your HTML frontend
    res.status(200).json(formattedHampers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch catalog data securely.' });
  }
}
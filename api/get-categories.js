/**
 * get-categories.js — Vercel Serverless Function
 *
 * Fetches Published categories from Airtable for the explore page's
 * "Product Type" scroller. Mirrors get-featured-hampers.js's shape and
 * error handling.
 *
 * Required Airtable "Category" table fields:
 *   Name, Slug, Description, Image, Published
 *
 * Note: unlike Occasions/Collections, the Category table has no Order
 * field — sorted alphabetically by Name instead.
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const applyCors = require('./_lib/cors').applyCors;

module.exports = async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const TABLE_NAME = 'Category';
  const FILTER = encodeURIComponent('{Published}=TRUE()');

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const url = 'https://api.airtable.com/v0/' + BASE_ID + '/' + TABLE_NAME +
      '?filterByFormula=' + FILTER + '&sort%5B0%5D%5Bfield%5D=Name&sort%5B0%5D%5Bdirection%5D=asc';

    const response = await fetch(url, {
      headers: { Authorization: 'Bearer ' + AIRTABLE_API_KEY }
    });

    if (!response.ok) {
      throw new Error('Airtable connection failed');
    }

    const data = await response.json();

    const categories = data.records.map(function (record) {
      const images = record.fields['Image'];
      return {
        id: record.id,
        slug: record.fields['Slug'] || '',
        name: record.fields['Name'] || 'Category',
        description: record.fields['Description'] || '',
        image: (images && images.length > 0) ? images[0].url : null
      };
    });

    // "More" is a catch-all category and should always render last,
    // regardless of where it falls alphabetically. Stable sort preserves
    // the existing alphabetical order for everything else.
    categories.sort(function (a, b) {
      var aMore = a.slug === 'more';
      var bMore = b.slug === 'more';
      if (aMore === bMore) return 0;
      return aMore ? 1 : -1;
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

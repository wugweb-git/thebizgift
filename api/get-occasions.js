/**
 * get-occasions.js — Vercel Serverless Function
 *
 * Fetches Published occasion tags from Airtable for the explore page's
 * "Start With The Occasion" section. Mirrors get-featured-hampers.js's
 * shape and error handling.
 *
 * Required Airtable "Occasions" table fields:
 *   Name, Slug, Description, Hero Image, Published, Order
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

  const TABLE_NAME = 'Occasions';
  const FILTER = encodeURIComponent('{Published}=TRUE()');

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const url = 'https://api.airtable.com/v0/' + BASE_ID + '/' + TABLE_NAME +
      '?filterByFormula=' + FILTER + '&sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc';

    const response = await fetch(url, {
      headers: { Authorization: 'Bearer ' + AIRTABLE_API_KEY }
    });

    if (!response.ok) {
      throw new Error('Airtable connection failed');
    }

    const data = await response.json();

    const occasions = data.records.map(function (record) {
      const images = record.fields['Hero Image'];
      return {
        id: record.id,
        slug: record.fields['Slug'] || '',
        name: record.fields['Name'] || 'Occasion',
        description: record.fields['Description'] || '',
        image: (images && images.length > 0) ? images[0].url : '/image/placeholder.png'
      };
    });

    res.status(200).json(occasions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch occasions.' });
  }
};

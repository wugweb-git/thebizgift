/**
 * get-collections.js — Vercel Serverless Function
 *
 * Fetches Published collections from Airtable for the explore page's
 * sidebar filter and the header mega menu. Collections render as
 * icon-based chips (no photography), so no image field is exposed.
 * Mirrors get-featured-hampers.js's shape and error handling.
 *
 * Required Airtable "Collections" table fields:
 *   Name, Slug, Description, Published, Order
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const applyCors = require('./_lib/cors').applyCors;
const airtableCache = require('./_lib/airtableCache');

module.exports = async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const TABLE_NAME = 'Collections';
  const FILTER = '{Published}=TRUE()';

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const records = await airtableCache.getCachedTable(TABLE_NAME, FILTER, {
      extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc'
    });

    const collections = records.map(function (record) {
      return {
        id: record.id,
        slug: record.fields['Slug'] || '',
        name: record.fields['Name'] || 'Collection',
        description: record.fields['Description'] || ''
      };
    });

    res.status(200).json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch collections.' });
  }
};

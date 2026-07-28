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
const airtableCache = require('./_lib/airtableCache');

// No Occasion record in Airtable has a Hero Image uploaded yet -- the site's
// real per-occasion photography instead lives as static files in
// image/occasion/ (already used as header.html's static mega-menu fallback,
// see components.js). Without this map, once Airtable is actually reachable
// this endpoint would silently regress every occasion to the generic
// /image/placeholder.png the moment live data loads. Extensions vary, so
// this is a real filename map, not a guessed pattern -- keep it in sync
// with image/occasion/ if a slug is renamed or a new occasion is published.
const STATIC_OCCASION_IMAGES = {
  'employee-joining-kits': '/image/occasion/employee-joining-kits.png',
  'event-giveaways': '/image/occasion/event-giveaways.png',
  'client-appreciation-gifts': '/image/occasion/client-appreciation-gifts.jpeg',
  'festive-corporate-gifting': '/image/occasion/festive-corporate-gifting.png',
  'festive-gifting': '/image/occasion/festive-gifting.png',
  'wedding-gifting': '/image/occasion/wedding-gifting.png'
};

module.exports = async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const TABLE_NAME = 'Occasions';
  const FILTER = '{Published}=TRUE()';

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const records = await airtableCache.getCachedTable(TABLE_NAME, FILTER, {
      extraParams: 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc'
    });

    const occasions = records.map(function (record) {
      const images = record.fields['Hero Image'];
      const slug = record.fields['Slug'] || '';
      return {
        id: record.id,
        slug: slug,
        name: record.fields['Name'] || 'Occasion',
        description: record.fields['Description'] || '',
        image: (images && images.length > 0)
          ? images[0].url
          : (STATIC_OCCASION_IMAGES[slug] || '/image/placeholder.png')
      };
    });

    res.status(200).json(occasions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch occasions.' });
  }
};

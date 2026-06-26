/**
 * submit-lead.js — Vercel Serverless Function
 *
 * Single write endpoint for every lead-capture form on the site:
 *   - Quote form        (/quote.html)              type: "quote"
 *   - Product proposal  (hamper detail pages)      type: "proposal"
 *   - Newsletter signup  (site-wide footer block)  type: "newsletter"
 *
 * Writes a row to the Airtable "Leads" table. All three forms are normalised
 * into one common schema so the sales team has a single inbox.
 *
 * Required env vars (set in Vercel dashboard, never in code):
 *   AIRTABLE_API_KEY      Airtable personal access token
 *   AIRTABLE_BASE_ID      Base id (same base as the Products table)
 *   AIRTABLE_LEADS_TABLE  Optional, defaults to "Leads"
 *
 * Required Airtable "Leads" table columns (create these exactly):
 *   Type (single select), Name, Company, Email, Phone, Quantity, Budget,
 *   Occasion, Required By, Branding, Message, Product, Product URL,
 *   Collection, Category, Source Page
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || 'Leads';

const TYPE_LABELS = {
  quote: 'Quote Request',
  proposal: 'Product Proposal',
  newsletter: 'Newsletter'
};

function firstNonEmpty() {
  for (var i = 0; i < arguments.length; i++) {
    var v = arguments[i];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Map any of the three form payloads into the common Airtable schema.
// Only non-empty values are returned so we never send blank cells.
function buildFields(body) {
  var type = (body.type || '').toLowerCase();

  var mapped = {
    Type: TYPE_LABELS[type] || 'Quote Request',
    Name: firstNonEmpty(body.name, body.fullName),
    Company: firstNonEmpty(body.company, body.companyName),
    Email: firstNonEmpty(body.email, body.workEmail),
    Phone: firstNonEmpty(body.phone, body.phoneNumber),
    Quantity: firstNonEmpty(body.quantity),
    Budget: firstNonEmpty(body.budget),
    Occasion: firstNonEmpty(body.occasion),
    'Required By': firstNonEmpty(body.requiredDate, body.requiredByDate),
    Branding: firstNonEmpty(body.branding),
    Message: firstNonEmpty(body.message),
    Product: firstNonEmpty(body.productName, body.sourceProduct),
    'Product URL': firstNonEmpty(body.productUrl),
    Collection: firstNonEmpty(body.collectionName),
    Category: firstNonEmpty(body.category),
    'Source Page': firstNonEmpty(body.sourcePage)
  };

  // Strip empty fields so Airtable only receives populated columns.
  var fields = {};
  Object.keys(mapped).forEach(function (key) {
    if (mapped[key] !== '') fields[key] = mapped[key];
  });
  return fields;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Parse body (Vercel parses JSON automatically, but guard for raw strings).
  var body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch (e) { res.status(400).json({ error: 'Invalid JSON body' }); return; }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Missing request body' });
    return;
  }

  var fields = buildFields(body);

  // Minimum viable lead: a valid email address.
  if (!fields.Email || !isValidEmail(fields.Email)) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    var url = 'https://api.airtable.com/v0/' + BASE_ID + '/' + encodeURIComponent(LEADS_TABLE);
    var response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + AIRTABLE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{ fields: fields }],
        typecast: true
      })
    });

    if (!response.ok) {
      var detail = await response.text();
      console.error('Airtable write failed:', response.status, detail);
      res.status(502).json({ error: 'Could not save your request. Please try again.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('submit-lead error:', error);
    res.status(500).json({ error: 'Failed to submit. Please try again or reach us on WhatsApp.' });
  }
};

/**
 * submit-lead.js — Vercel Serverless Function
 *
 * Single write endpoint for every lead-capture form on the site:
 *   - Quote form        (/quote.html)              type: "quote"
 *   - Product proposal  (hamper detail pages)      type: "proposal"
 *
 * Writes a row to the Airtable "Leads" table. Both forms are normalised
 * into one common schema so the sales team has a single inbox.
 *
 * Every submission is buffered into a durable KV queue (api/_lib/leadsQueue.js)
 * before Airtable is contacted, and retried by api/cron/refresh-cache.js if
 * the direct write fails -- see that module's header comment for why.
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
const applyCors = require('./_lib/cors').applyCors;
const leadsQueue = require('./_lib/leadsQueue');

// Best-effort per-IP rate limit: 5 submissions/hour. Held in module-scope memory,
// so it only holds across warm invocations of the same lambda instance (resets on
// cold start) — not a hard guarantee, but blocks basic scripted abuse without
// requiring an external store.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const submissionsByIp = new Map();

function isRateLimited(ip) {
  var now = Date.now();
  var timestamps = (submissionsByIp.get(ip) || []).filter(function (t) { return now - t < RATE_LIMIT_WINDOW_MS; });
  if (timestamps.length >= RATE_LIMIT_MAX) {
    submissionsByIp.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return false;
}

function getClientIp(req) {
  var forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

const TYPE_LABELS = {
  quote: 'Quote Request',
  proposal: 'Product Proposal'
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
  applyCors(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (isRateLimited(getClientIp(req))) {
    res.status(429).json({ error: 'Too many submissions. Please try again later.' });
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
  var type = (body.type || '').toLowerCase();

  // Required fields mirror each form's own client-side validation:
  //  - quote.html requires fullName, companyName, phoneNumber, workEmail
  //  - the hamper PDP proposal form requires name, company, email but leaves phone optional
  if (!fields.Name) {
    res.status(400).json({ error: 'Your name is required.' });
    return;
  }
  if (!fields.Company) {
    res.status(400).json({ error: 'Company name is required.' });
    return;
  }
  if (type === 'quote' && !fields.Phone) {
    res.status(400).json({ error: 'A phone number is required.' });
    return;
  }
  if (!fields.Email || !isValidEmail(fields.Email)) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  // Buffer first, write to Airtable second -- see leadsQueue.js for why.
  // This happens even before the config check below: a lead buffered while
  // the server is misconfigured still gets delivered once someone fixes the
  // env vars and the next reconciliation pass runs.
  var buffered = await leadsQueue.enqueue(fields, type);

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    if (buffered.buffered) {
      res.status(200).json({ ok: true, buffered: true });
      return;
    }
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    var ok = await leadsQueue.postToAirtable(fields);

    if (!ok) {
      // Airtable rejected/errored, but the lead is safely durable -- tell
      // the visitor it succeeded rather than asking them to resubmit.
      // api/cron/refresh-cache.js retries it automatically.
      if (buffered.buffered) {
        res.status(200).json({ ok: true, buffered: true });
        return;
      }
      res.status(502).json({ error: 'Could not save your request. Please try again.' });
      return;
    }

    await leadsQueue.dequeue(buffered.serialized);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('submit-lead error:', error);
    if (buffered.buffered) {
      res.status(200).json({ ok: true, buffered: true });
      return;
    }
    res.status(500).json({ error: 'Failed to submit. Please try again or reach us on WhatsApp.' });
  }
};

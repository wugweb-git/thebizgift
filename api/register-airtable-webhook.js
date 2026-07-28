/**
 * api/register-airtable-webhook.js — Vercel Serverless Function (one-time-use)
 *
 * Registers a webhook subscription with Airtable's native Webhooks API --
 * a REST API feature available on every Airtable plan (distinct from the
 * Automations UI's "Send webhook" action, which is gated to Team plan and
 * above). Once registered, Airtable POSTs a lightweight ping to
 * api/cron/refresh-cache.js on any base change, giving genuine event-driven
 * "refresh only when Airtable actually changes" behavior with no
 * third-party service (Zapier/Make) and no Airtable plan requirement beyond
 * what's already in use.
 *
 * Uses the server's own AIRTABLE_API_KEY (already set in Vercel) -- nobody
 * needs to see or handle that credential to run this. Requires the PAT to
 * have the `webhook:manage` scope; if it doesn't, Airtable's API will
 * return a permissions error and the fix is to add that scope to the
 * existing token (or issue a new one) in Airtable's token settings.
 *
 * Run this ONCE after deploying (protected by WEBHOOK_SECRET, same as
 * refresh-cache.js):
 *   curl -X POST "https://<domain>/api/register-airtable-webhook" \
 *     -H "X-Webhook-Secret: <WEBHOOK_SECRET>"
 *
 * The returned webhook id and MAC secret are stored in the KV buffer
 * (airtable-webhook::id / airtable-webhook::macSecret) -- re-running this
 * creates a NEW webhook rather than updating the old one, so don't run it
 * repeatedly without a reason (e.g. only if the stored id is ever lost).
 * The registered webhook is kept alive indefinitely by
 * api/cron/refresh-cache.js's keepWebhookAlive(), called on every trigger.
 */

const airtableCache = require('./_lib/airtableCache');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed, use POST' });
    return;
  }

  var webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret || req.headers['x-webhook-secret'] !== webhookSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  var apiKey = process.env.AIRTABLE_API_KEY;
  var baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  var host = req.headers['x-forwarded-host'] || req.headers.host;
  var protocol = req.headers['x-forwarded-proto'] || 'https';
  var notificationUrl = protocol + '://' + host + '/api/cron/refresh-cache';

  try {
    var response = await fetch('https://api.airtable.com/v0/bases/' + baseId + '/webhooks', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationUrl: notificationUrl,
        specification: {
          options: {
            filters: {
              dataTypes: ['tableData']
            }
          }
        }
      })
    });

    var data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        error: 'Airtable rejected the webhook registration',
        details: data,
        hint: 'If this is a permissions error, the AIRTABLE_API_KEY token needs the webhook:manage scope added in Airtable\'s token settings.'
      });
      return;
    }

    await airtableCache.kvSetRaw('airtable-webhook::id', data.id);
    if (data.macSecretBase64) {
      await airtableCache.kvSetRaw('airtable-webhook::macSecret', data.macSecretBase64);
    }

    res.status(200).json({
      registered: true,
      webhookId: data.id,
      notificationUrl: notificationUrl,
      expirationTime: data.expirationTime || null,
      note: 'Airtable will now ping ' + notificationUrl + ' whenever base data changes. Kept alive indefinitely by refresh-cache.js\'s daily keep-alive call.'
    });
  } catch (error) {
    console.error('register-airtable-webhook failed:', error);
    res.status(500).json({ error: 'Failed to register webhook', details: error.message });
  }
};

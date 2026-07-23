/**
 * Shared CORS allowlist for api/*.js — replaces a blanket "Access-Control-Allow-Origin: *"
 * with a check against known site origins (production + Vercel previews + local dev).
 * Files/folders prefixed with "_" are ignored by Vercel's filesystem routing, so this
 * is a plain module, not its own endpoint.
 */

var ALLOWED_ORIGIN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;
var LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function applyCors(req, res, methods) {
  var origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGIN.test(origin) || LOCAL_ORIGIN.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { applyCors: applyCors };

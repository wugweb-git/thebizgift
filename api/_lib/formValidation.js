/**
 * api/_lib/formValidation.js
 *
 * Server-side counterpart to /form-validation.js -- same rules, enforced
 * again here as defense-in-depth against a direct POST to /api/submit-lead
 * that bypasses the browser's client-side checks entirely.
 */

const MIN_MESSAGE_WORDS = 50;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

function isValidPhone(value) {
  var digits = (value || '').replace(/[\s()-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(digits);
}

function isValidBudget(value) {
  var trimmed = (value || '').trim();
  if (!trimmed) return true;
  var cleaned = trimmed.replace(/^(₹|rs\.?|inr)\s*/i, '').replace(/,/g, '');
  return /^\d+(\.\d{1,2})?$/.test(cleaned) && parseFloat(cleaned) > 0;
}

function wordCount(value) {
  var trimmed = (value || '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function isValidMessage(value) {
  return wordCount(value) >= MIN_MESSAGE_WORDS;
}

module.exports = {
  MIN_MESSAGE_WORDS: MIN_MESSAGE_WORDS,
  isValidEmail: isValidEmail,
  isValidPhone: isValidPhone,
  isValidBudget: isValidBudget,
  wordCount: wordCount,
  isValidMessage: isValidMessage
};

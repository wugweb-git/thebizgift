/**
 * form-validation.js
 *
 * Shared client-side validation rules for every lead-capture form on the
 * site (quote.html, and the PDP proposal form built by hamper/hamper.js).
 * Plain browser globals, no build step -- loaded via a <script> tag before
 * the form's own script runs.
 *
 * Mirrors api/_lib/formValidation.js, which enforces the same rules
 * server-side in api/submit-lead.js. The two can't literally share one file
 * (browser global vs CommonJS, no bundler in this project), so keep them in
 * sync by hand if a rule changes here.
 */

(function (window) {
  'use strict';

  var MIN_MESSAGE_WORDS = 50;

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
  }

  // Requires a leading "+" and country code (ISD code) -- a bare 10-digit
  // number is rejected even though it's a valid Indian mobile number, since
  // the point of this rule is to make the country code mandatory.
  function isValidPhone(value) {
    var digits = (value || '').replace(/[\s()-]/g, '');
    return /^\+[1-9]\d{7,14}$/.test(digits);
  }

  // Budget is optional -- empty is valid. If filled, it must resolve to a
  // plain positive number after stripping an INR prefix/symbol and commas.
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

  window.TBGFormValidation = {
    MIN_MESSAGE_WORDS: MIN_MESSAGE_WORDS,
    isValidEmail: isValidEmail,
    isValidPhone: isValidPhone,
    isValidBudget: isValidBudget,
    wordCount: wordCount,
    isValidMessage: isValidMessage
  };
})(window);

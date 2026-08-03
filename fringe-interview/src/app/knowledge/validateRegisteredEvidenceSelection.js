const { validateEvidenceStore } = require('../../core/evidence');

const ALLOWED_KEYS = ['evidenceStore', 'evidenceIds'];

function validateRegisteredEvidenceSelection(input = {}) {
  const errors = [];
  const warnings = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Registered Evidence Selection input must be an object.'], warnings };
  }

  for (const key of Object.keys(input)) {
    if (!ALLOWED_KEYS.includes(key)) errors.push(`Unknown property: ${key}.`);
  }
  for (const key of ALLOWED_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) errors.push(`Missing property: ${key}.`);
  }

  const storeValidation = validateEvidenceStore(input.evidenceStore);
  if (!storeValidation.isValid) {
    errors.push(...storeValidation.errors.map(error => `evidenceStore: ${error}`));
  }

  if (!Array.isArray(input.evidenceIds)) {
    errors.push('evidenceIds must be an array.');
  } else {
    const seen = new Set();
    input.evidenceIds.forEach((id, index) => {
      if (typeof id !== 'string' || id.length === 0) {
        errors.push(`evidenceIds[${index}] must be a non-empty Evidence ID string.`);
      } else if (seen.has(id)) {
        errors.push(`evidenceIds[${index}] duplicates requested Evidence ID: ${id}.`);
      }
      seen.add(id);
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateRegisteredEvidenceSelection };

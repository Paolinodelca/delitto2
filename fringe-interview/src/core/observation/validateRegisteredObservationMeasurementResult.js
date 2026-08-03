const { validateMeasurementResult } = require('./validateMeasurementResult');
const { normalizeRegisteredObservationMeasurementResult } = require('./normalizeRegisteredObservationMeasurementResult');

function canonical(value) { if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`; if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`; return JSON.stringify(value); }

function validateRegisteredObservationMeasurementResult(result, context = {}) {
  const local = validateMeasurementResult(result), errors = [...local.errors], warnings = [...local.warnings];
  if (local.valid) {
    try {
      const expected = normalizeRegisteredObservationMeasurementResult(context);
      if (canonical(result) !== canonical(expected)) errors.push('MeasurementResult identity/content integrity or contextual causality is invalid.');
    } catch (error) {
      errors.push(`context: ${error.message}`);
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateRegisteredObservationMeasurementResult };

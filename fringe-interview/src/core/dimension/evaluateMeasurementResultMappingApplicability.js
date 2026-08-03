const { validateMeasurementResultMappingApplicabilityContext } = require('./validateMeasurementResultMappingApplicabilityContext');

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function evaluateMeasurementResultMappingApplicability(input = {}) {
  const validation = validateMeasurementResultMappingApplicabilityContext(input);
  if (!validation.valid) {
    const error = new Error(validation.errors.join(' | '));
    error.code = 'INVALID_MEASUREMENT_RESULT_MAPPING_APPLICABILITY';
    error.details = validation;
    throw error;
  }
  if (validation.stopped) return freeze({ status: 'stopped', reason: 'insufficient_data', mapping: null });
  if (!validation.applicable) return freeze({ status: 'not_applicable', reason: validation.reason, mapping: null });
  return freeze({ status: 'applicable', reason: null, mapping: clone(input.mapping) });
}

module.exports = { evaluateMeasurementResultMappingApplicability };

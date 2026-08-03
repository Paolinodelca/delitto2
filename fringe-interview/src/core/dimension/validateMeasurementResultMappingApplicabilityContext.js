const { validateMeasurementResultMappingApplicability } = require('./validateMeasurementResultMappingApplicability');

function validateMeasurementResultMappingApplicabilityContext(input = {}) {
  const local = validateMeasurementResultMappingApplicability(input);
  if (!local.valid) return { ...local, applicable: false, stopped: false, reason: 'invalid_input' };
  if (input.measurementResult.status === 'insufficient_data') return { valid: true, errors: [], warnings: [], applicable: false, stopped: true, reason: 'insufficient_data' };
  if (input.measurementResult.measurementId !== input.mapping.measurementId) return { valid: true, errors: [], warnings: [], applicable: false, stopped: false, reason: 'measurement_id_mismatch' };
  return { valid: true, errors: [], warnings: [], applicable: true, stopped: false, reason: null };
}

module.exports = { validateMeasurementResultMappingApplicabilityContext };

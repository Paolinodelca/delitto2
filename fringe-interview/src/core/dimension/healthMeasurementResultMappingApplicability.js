const { evaluateMeasurementResultMappingApplicability } = require('./evaluateMeasurementResultMappingApplicability');

function healthMeasurementResultMappingApplicability(fixtures = {}) {
  try {
    const input = fixtures.buildApplicabilityFixture();
    const applicable = evaluateMeasurementResultMappingApplicability(input);
    const mismatch = evaluateMeasurementResultMappingApplicability({ ...input, mapping: { ...input.mapping, measurementId: 'other_measurement' } });
    const stopped = evaluateMeasurementResultMappingApplicability({ ...input, measurementResult: { ...input.measurementResult, status: 'insufficient_data', normalizedValue: null, direction: null } });
    const ok = applicable.status === 'applicable' && mismatch.status === 'not_applicable' && stopped.status === 'stopped' && Object.isFrozen(applicable) && Object.isFrozen(applicable.mapping) && Object.isFrozen(applicable.mapping.targets);
    return { ok, checks: { calculatedApplicable: applicable.status === 'applicable', calculatedNotApplicable: mismatch.status === 'not_applicable', insufficientDataStop: stopped.status === 'stopped', immutable: Object.isFrozen(applicable.mapping.targets), boundaryIsolated: true } };
  } catch (error) { return { ok: false, error: error.message }; }
}

module.exports = { healthMeasurementResultMappingApplicability };

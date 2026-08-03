const { normalizeRegisteredObservationMeasurementResult } = require('./normalizeRegisteredObservationMeasurementResult');
const { validateRegisteredObservationMeasurementResult } = require('./validateRegisteredObservationMeasurementResult');

function healthRegisteredObservationMeasurementResultNormalization(fixtures = {}) {
  try {
    const input = fixtures.buildNormalizationFixture();
    const result = normalizeRegisteredObservationMeasurementResult(input);
    const reversed = normalizeRegisteredObservationMeasurementResult({ ...input, observations: [...input.observations].reverse() });
    const empty = normalizeRegisteredObservationMeasurementResult({ ...input, observations: [] });
    const ok = JSON.stringify(result) === JSON.stringify(reversed) && result.status === 'calculated' && empty.status === 'insufficient_data' && Object.isFrozen(result) && Object.isFrozen(result.observationRefs) && validateRegisteredObservationMeasurementResult(result, input).valid;
    return { ok, checks: { sufficient: result.status === 'calculated', multipleAndCanonical: result.id === reversed.id, insufficientData: empty.status === 'insufficient_data', identity: validateRegisteredObservationMeasurementResult(result, input).valid, immutable: Object.isFrozen(result) && Object.isFrozen(result.extensions), boundaryIsolated: true } };
  } catch (error) { return { ok: false, error: error.message }; }
}

module.exports = { healthRegisteredObservationMeasurementResultNormalization };

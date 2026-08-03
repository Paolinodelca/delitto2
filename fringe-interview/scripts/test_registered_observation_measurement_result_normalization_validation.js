const assert = require('assert');
const api = require('../src/core/observation');
const { buildNormalizationFixture } = require('./registered_observation_measurement_result_normalization_fixture');
function rejected(change) { const input = buildNormalizationFixture(); change(input); assert.throws(() => api.normalizeRegisteredObservationMeasurementResult(input), error => error.code === 'INVALID_REGISTERED_OBSERVATION_MEASUREMENT_RESULT_NORMALIZATION'); }
assert(api.validateRegisteredObservationMeasurementResultNormalization(buildNormalizationFixture()).valid);
rejected(input => { input.extra = true; });
rejected(input => { input.measurement.id = ''; });
rejected(input => { input.observations[0].hidden = true; });
rejected(input => { input.observations[0].measurementId = 'foreign'; });
rejected(input => { input.observations[0].characteristicId = 'foreign'; });
rejected(input => { input.observations.push(input.observations[0]); });
rejected(input => { input.characteristicId = 'not-targeted'; input.observations = []; });
rejected(input => { input.normalization.extra = true; });
rejected(input => { input.normalization.rules.confidence = 'copy_observation_confidence'; });
rejected(input => { input.normalization.rules.value = null; });
rejected(input => { input.normalization.rules.run = () => 1; });
console.log('Registered Observation Measurement Result Normalization validation tests PASSED');

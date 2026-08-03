const assert = require('assert');
const api = require('../src/core/observation');
const fixture = require('./registered_observation_measurement_result_normalization_fixture');
const result = api.healthRegisteredObservationMeasurementResultNormalization(fixture);
assert(result.ok, JSON.stringify(result));
assert(Object.values(result.checks).every(Boolean));
console.log('Registered Observation Measurement Result Normalization health PASSED');

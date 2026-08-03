const assert = require('assert');
(async () => {
  const commonjs = require('../src/core/observation');
  const imported = await import('../src/core/observation/index.js');
  const esm = imported.default || imported;
  for (const name of ['normalizeRegisteredObservationMeasurementResult', 'validateRegisteredObservationMeasurementResultNormalization', 'validateRegisteredObservationMeasurementResultNormalizationContext', 'validateRegisteredObservationMeasurementResult', 'healthRegisteredObservationMeasurementResultNormalization']) {
    assert.equal(typeof commonjs[name], 'function', `${name} CommonJS export`);
    assert.equal(typeof esm[name], 'function', `${name} ESM export`);
  }
  console.log('Registered Observation Measurement Result Normalization public API tests PASSED');
})();

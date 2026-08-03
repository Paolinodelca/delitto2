const assert = require('assert');
(async () => {
  const commonjs = require('../src/core/dimension');
  const imported = await import('../src/core/dimension/index.js');
  const esm = imported.default || imported;
  for (const name of ['evaluateMeasurementResultMappingApplicability', 'validateMeasurementResultMappingApplicability', 'validateMeasurementResultMappingApplicabilityContext', 'healthMeasurementResultMappingApplicability']) assert.equal(typeof commonjs[name], 'function') && assert.equal(typeof esm[name], 'function');
  console.log('Measurement Result Mapping Applicability public API tests PASSED');
})();

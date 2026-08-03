const assert = require('assert');
const { healthMeasurementResultMappingApplicability } = require('../src/core/dimension');
const fixtures = require('./measurement_result_mapping_applicability_fixture');
const result = healthMeasurementResultMappingApplicability(fixtures);
assert.strictEqual(result.ok, true, result.error || JSON.stringify(result));
console.log('Measurement Result Mapping Applicability health PASS');

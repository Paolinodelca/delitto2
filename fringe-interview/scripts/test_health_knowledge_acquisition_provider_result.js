const assert = require('assert');
const { healthKnowledgeAcquisitionProviderResult } = require('../src/infrastructure/knowledge');
const fixture = require('./knowledge_acquisition_invocation_boundary_fixture');
const result = healthKnowledgeAcquisitionProviderResult(fixture);
assert(result.ok, JSON.stringify(result.details));
console.log('Knowledge Acquisition Provider Result health PASSED');

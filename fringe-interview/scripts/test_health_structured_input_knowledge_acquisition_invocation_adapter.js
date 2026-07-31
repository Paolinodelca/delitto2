const assert = require('assert');
const {
  healthStructuredInputKnowledgeAcquisitionInvocationAdapter
} = require('../src/infrastructure/knowledge');
const fixture = require('./knowledge_acquisition_invocation_boundary_fixture');

healthStructuredInputKnowledgeAcquisitionInvocationAdapter(fixture)
  .then(result => {
    assert(result.ok, JSON.stringify(result));
    assert.strictEqual(result.details.providerCalls, 1);
    console.log('Structured Input Knowledge Acquisition Invocation Adapter health PASSED');
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });

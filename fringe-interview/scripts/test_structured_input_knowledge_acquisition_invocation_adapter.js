const assert = require('assert');
const A = require('../src/app/knowledge');
const I = require('../src/infrastructure/knowledge');
const fixture = require('./knowledge_acquisition_invocation_boundary_fixture');
const {
  calculateKnowledgeAcquisitionInvocationInputFingerprint
} = require('../src/app/knowledge/knowledgeAcquisitionInvocationInputIdentity');

(async () => {
  const f = fixture.buildFixture();
  const input = A.buildKnowledgeAcquisitionInvocationInput(f.context);
  const before = JSON.stringify(input);
  const calls = [];
  const provider = {
    acquireKnowledge(value) {
      calls.push(value);
      return Promise.resolve(undefined);
    }
  };
  const adapter = I.createStructuredInputKnowledgeAcquisitionInvocationAdapter({ provider });

  assert(A.validateKnowledgeAcquisitionInvocationPort(adapter).valid);
  assert(Object.isFrozen(adapter));
  assert(I.validateStructuredInputKnowledgeAcquisitionProvider(provider).valid);
  assert(!I.validateStructuredInputKnowledgeAcquisitionProvider({ invoke() {} }).valid);
  assert.throws(
    () => I.createStructuredInputKnowledgeAcquisitionInvocationAdapter({ provider: {} }),
    error => error.code === 'INVALID_STRUCTURED_INPUT_KNOWLEDGE_ACQUISITION_PROVIDER'
  );

  await adapter.invoke(input);
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0], input);
  assert.strictEqual(JSON.stringify(input), before);
  assert(Object.isFrozen(input) && Object.isFrozen(input.operation));

  assert.throws(
    () => adapter.invoke({ ...input, integrityFingerprint: '0'.repeat(64) }),
    error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_INVOCATION_INPUT'
  );
  const unsupported = {
      ...input,
      operation: { ...input.operation, capabilityRef: 'capability:other-v1' }
  };
  unsupported.integrityFingerprint = calculateKnowledgeAcquisitionInvocationInputFingerprint(unsupported);
  assert.throws(
    () => adapter.invoke(unsupported),
    error => error.code === 'UNSUPPORTED_KNOWLEDGE_ACQUISITION_CAPABILITY'
  );
  assert.strictEqual(calls.length, 1);
  assert(!('registry' in adapter) && !('resolve' in adapter) && !('route' in adapter));

  console.log('Structured Input Knowledge Acquisition Invocation Adapter tests PASSED');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

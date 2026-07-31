const assert = require('assert');
const A = require('../src/app/knowledge');
const I = require('../src/infrastructure/knowledge');
const fixture = require('./knowledge_acquisition_invocation_boundary_fixture');
const { calculateKnowledgeAcquisitionProviderResultFingerprint } = require('../src/infrastructure/knowledge/knowledgeAcquisitionProviderResultIdentity');

const input = A.buildKnowledgeAcquisitionInvocationInput(fixture.buildFixture().context);
const payload = { format: 'structured_input', values: [{ text: 'opaque technical value', flags: [true, false] }] };
const result = I.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: input, providerPayload: payload });
assert(I.validateKnowledgeAcquisitionProviderResult(result).valid);
assert(I.validateKnowledgeAcquisitionProviderResultContext({ knowledgeAcquisitionProviderResult: result, knowledgeAcquisitionInvocationInput: input }).valid);
assert.strictEqual(result.status, 'succeeded');
assert.strictEqual(result.capabilityRef, input.operation.capabilityRef);
assert.strictEqual(result.invocationInputFingerprint, input.integrityFingerprint);
assert.strictEqual(result.integrityFingerprint, calculateKnowledgeAcquisitionProviderResultFingerprint(result));
assert(Object.isFrozen(result) && Object.isFrozen(result.providerPayload) && Object.isFrozen(result.providerPayload.values));
assert.notStrictEqual(result.providerPayload, payload);
payload.values[0].text = 'changed';
payload.values.push({ text: 'new' });
assert.strictEqual(result.providerPayload.values.length, 1);
assert.strictEqual(result.providerPayload.values[0].text, 'opaque technical value');
assert(!I.validateKnowledgeAcquisitionProviderResult(JSON.parse(JSON.stringify(result))).valid);
assert(!I.validateKnowledgeAcquisitionProviderResult(Object.freeze({ ...result, extra: true })).valid);
const hiddenExtra = { ...result };
Object.defineProperty(hiddenExtra, 'evidence', { value: { mutable: true }, enumerable: false });
Object.freeze(hiddenExtra);
assert(!I.validateKnowledgeAcquisitionProviderResult(hiddenExtra).valid, 'non-enumerable extra property must be rejected');
const hiddenContractProperty = { ...result };
Object.defineProperty(hiddenContractProperty, 'providerPayload', { value: result.providerPayload, enumerable: false });
Object.freeze(hiddenContractProperty);
assert(!I.validateKnowledgeAcquisitionProviderResult(hiddenContractProperty).valid, 'non-enumerable contract property must be rejected');
const symbolExtra = { ...result, [Symbol('extra')]: true };
Object.freeze(symbolExtra);
assert(!I.validateKnowledgeAcquisitionProviderResult(symbolExtra).valid, 'symbol extra property must be rejected');
for (const status of ['failed', 'rejected', 'unavailable', 'pending']) assert(!I.validateKnowledgeAcquisitionProviderResult(Object.freeze({ ...result, status })).valid);
assert.throws(() => I.buildKnowledgeAcquisitionProviderResult({}), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_INVOCATION_INPUT');
assert.throws(() => I.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: input, providerPayload: { fn() {} } }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_PROVIDER_PAYLOAD');
assert.throws(() => I.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: input, providerPayload: new Date() }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_PROVIDER_PAYLOAD');
const executablePayload = {};
Object.defineProperty(executablePayload, 'value', { enumerable: true, get() { return 'side-effectful'; } });
assert.throws(() => I.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: input, providerPayload: executablePayload }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_PROVIDER_PAYLOAD');
for (const providerPayload of [
  { knowledge: { id: 'core-like' } },
  { nested: { evidence: { id: 'evidence-like' } } },
  { knowledgeUpdate: { changes: [] } },
  { coverage: { ratio: 1 } },
  { personKnowledgeMatrix: { dimensions: [] } }
]) {
  assert.throws(
    () => I.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: input, providerPayload }),
    error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_PROVIDER_RESULT',
    'semantic boundary payload must be rejected'
  );
}
const shared = { technicalValue: 1 };
const sharedResult = I.buildKnowledgeAcquisitionProviderResult({
  knowledgeAcquisitionInvocationInput: input,
  providerPayload: { first: shared, second: shared }
});
assert.deepStrictEqual(sharedResult.providerPayload.first, sharedResult.providerPayload.second);
assert.notStrictEqual(sharedResult.providerPayload.first, sharedResult.providerPayload.second, 'shared input references must be cloned independently');
const cyclic = {};
cyclic.self = cyclic;
assert.throws(
  () => I.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: input, providerPayload: cyclic }),
  error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_PROVIDER_PAYLOAD'
);
const wrongCapability = { ...result, capabilityRef: 'capability:other-v1', integrityFingerprint: '' };
wrongCapability.integrityFingerprint = calculateKnowledgeAcquisitionProviderResultFingerprint(wrongCapability);
Object.freeze(wrongCapability);
assert(!I.validateKnowledgeAcquisitionProviderResultContext({ knowledgeAcquisitionProviderResult: wrongCapability, knowledgeAcquisitionInvocationInput: input }).valid);
const wrongCausality = { ...result, invocationInputFingerprint: '0'.repeat(64), integrityFingerprint: '' };
wrongCausality.integrityFingerprint = calculateKnowledgeAcquisitionProviderResultFingerprint(wrongCausality);
Object.freeze(wrongCausality);
assert(!I.validateKnowledgeAcquisitionProviderResultContext({ knowledgeAcquisitionProviderResult: wrongCausality, knowledgeAcquisitionInvocationInput: input }).valid);
for (const forbidden of ['knowledge', 'evidence', 'knowledgeUpdate', 'createdAt', 'lifecycle', 'retry']) assert(!(forbidden in result));
console.log('Knowledge Acquisition Provider Result tests PASSED');

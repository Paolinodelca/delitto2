const assert = require('assert');
const infrastructure = require('../src/infrastructure/knowledge');
const fixture = require('./structured_input_provider_result_evidence_extractor_fixture');

const context = fixture.buildFixture();
const before = JSON.stringify(context);
const evidence = infrastructure.extractEvidenceFromStructuredInputProviderResult(context);
const repeated = infrastructure.extractEvidenceFromStructuredInputProviderResult(context);
assert.deepStrictEqual(evidence, repeated, 'extraction must be deterministic');
assert.strictEqual(JSON.stringify(context), before, 'inputs must not be mutated');
assert.strictEqual(evidence.length, 2);
assert(Object.isFrozen(evidence));
assert(evidence.every(item => Object.isFrozen(item) && Object.isFrozen(item.metadata) && Object.isFrozen(item.extensions) && Object.isFrozen(item.extensions.acquisitionProvenance)));
assert(Object.isFrozen(evidence[0].content) && Object.isFrozen(evidence[0].content.tags));
assert.notStrictEqual(evidence[0].content, context.knowledgeAcquisitionProviderResult.providerPayload.records[0].content);
for (const item of evidence) {
  assert(require('../src/core/evidence').validateEvidence(item).isValid);
  assert.strictEqual(item.confidence, null);
  assert.strictEqual(item.extensions.acquisitionProvenance.providerResultFingerprint, context.knowledgeAcquisitionProviderResult.integrityFingerprint);
  assert.strictEqual(item.extensions.acquisitionProvenance.invocationInputFingerprint, context.knowledgeAcquisitionInvocationInput.integrityFingerprint);
}

const emptyPayload = { schemaVersion: '1.0', format: 'structured_input', records: [] };
const emptyResult = infrastructure.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: context.knowledgeAcquisitionInvocationInput, providerPayload: emptyPayload });
const empty = infrastructure.extractEvidenceFromStructuredInputProviderResult({ ...context, knowledgeAcquisitionProviderResult: emptyResult });
assert.deepStrictEqual(empty, []);
assert(Object.isFrozen(empty));

for (const providerPayload of [
  { schemaVersion: '2.0', format: 'structured_input', records: [] },
  { schemaVersion: '1.0', format: 'generic', records: [] },
  { schemaVersion: '1.0', format: 'structured_input', records: [{ recordId: 'x' }] },
  { schemaVersion: '1.0', format: 'structured_input', records: [context.knowledgeAcquisitionProviderResult.providerPayload.records[0], context.knowledgeAcquisitionProviderResult.providerPayload.records[0]] },
  { schemaVersion: '1.0', format: 'structured_input', records: [], routing: 'forbidden' }
]) {
  const result = infrastructure.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: context.knowledgeAcquisitionInvocationInput, providerPayload });
  assert.throws(() => infrastructure.extractEvidenceFromStructuredInputProviderResult({ ...context, knowledgeAcquisitionProviderResult: result }), error => error.code === 'INVALID_STRUCTURED_INPUT_PROVIDER_RESULT_EVIDENCE_CONTEXT');
}

assert(infrastructure.validateStructuredInputProviderResultEvidenceContext(context).valid);
assert(!infrastructure.validateStructuredInputProviderResultEvidenceContext({}).valid);
assert.throws(() => infrastructure.extractEvidenceFromStructuredInputProviderResult({}), error => error.code === 'INVALID_STRUCTURED_INPUT_PROVIDER_RESULT_EVIDENCE_CONTEXT');
console.log('Structured Input Provider Result Evidence Extractor tests PASSED');

const { buildKnowledgeAcquisitionInvocationInput } = require('../../app/knowledge');
const { buildKnowledgeAcquisitionProviderResult } = require('./buildKnowledgeAcquisitionProviderResult');
const { validateKnowledgeAcquisitionProviderResult } = require('./validateKnowledgeAcquisitionProviderResult');
const { validateKnowledgeAcquisitionProviderResultContext } = require('./validateKnowledgeAcquisitionProviderResultContext');

function healthKnowledgeAcquisitionProviderResult(fixtures) {
  if (!fixtures || typeof fixtures.buildFixture !== 'function') return { ok: false, details: { reason: 'Fixture factory is required.' } };
  try {
    const input = buildKnowledgeAcquisitionInvocationInput(fixtures.buildFixture().context);
    const sourcePayload = { format: 'structured_input', items: [{ value: 'technical' }] };
    const result = buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput: input, providerPayload: sourcePayload });
    sourcePayload.items[0].value = 'mutated';
    const structural = validateKnowledgeAcquisitionProviderResult(result);
    const contextual = validateKnowledgeAcquisitionProviderResultContext({ knowledgeAcquisitionProviderResult: result, knowledgeAcquisitionInvocationInput: input });
    return {
      ok: structural.valid && contextual.valid && result.providerPayload.items[0].value === 'technical' && Object.isFrozen(result) && Object.isFrozen(result.providerPayload.items),
      details: { status: result.status, capabilityRef: result.capabilityRef, causalityPreserved: result.invocationInputFingerprint === input.integrityFingerprint, deeplyImmutable: Object.isFrozen(result.providerPayload.items[0]) }
    };
  } catch (error) {
    return { ok: false, details: { error: error.message, code: error.code } };
  }
}

module.exports = { healthKnowledgeAcquisitionProviderResult };

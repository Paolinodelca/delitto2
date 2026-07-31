const { buildKnowledgeAcquisitionInvocationInput } = require('../../app/knowledge');
const {
  createStructuredInputKnowledgeAcquisitionInvocationAdapter
} = require('./createStructuredInputKnowledgeAcquisitionInvocationAdapter');
const { buildKnowledgeAcquisitionProviderResult } = require('./buildKnowledgeAcquisitionProviderResult');

async function healthStructuredInputKnowledgeAcquisitionInvocationAdapter(fixtures) {
  if (!fixtures || typeof fixtures.buildFixture !== 'function') {
    return { ok: false, details: { reason: 'Fixture factory is required.' } };
  }

  try {
    const fixture = fixtures.buildFixture();
    const input = buildKnowledgeAcquisitionInvocationInput(fixture.context);
    let received = null;
    const provider = {
      acquireKnowledge(value) {
        received = value;
        return buildKnowledgeAcquisitionProviderResult({
          knowledgeAcquisitionInvocationInput: value,
          providerPayload: { format: 'structured_input', itemCount: 0 }
        });
      }
    };
    const adapter = createStructuredInputKnowledgeAcquisitionInvocationAdapter({ provider });
    const result = await adapter.invoke(input);

    return {
      ok: received === input && Object.isFrozen(input) && Object.isFrozen(adapter) &&
        result.invocationInputFingerprint === input.integrityFingerprint,
      details: {
        capabilityRef: input.operation.capabilityRef,
        providerCalls: received === null ? 0 : 1,
        sideEffectBoundary: 'provider_stub'
      }
    };
  } catch (error) {
    return { ok: false, details: { error: error.message, code: error.code } };
  }
}

module.exports = { healthStructuredInputKnowledgeAcquisitionInvocationAdapter };

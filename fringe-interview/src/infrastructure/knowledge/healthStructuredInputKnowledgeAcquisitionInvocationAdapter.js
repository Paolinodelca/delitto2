const { buildKnowledgeAcquisitionInvocationInput } = require('../../app/knowledge');
const {
  createStructuredInputKnowledgeAcquisitionInvocationAdapter
} = require('./createStructuredInputKnowledgeAcquisitionInvocationAdapter');

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
      }
    };
    const adapter = createStructuredInputKnowledgeAcquisitionInvocationAdapter({ provider });
    await adapter.invoke(input);

    return {
      ok: received === input && Object.isFrozen(input) && Object.isFrozen(adapter),
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

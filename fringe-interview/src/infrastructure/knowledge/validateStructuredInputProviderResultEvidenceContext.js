const { validateKnowledgeAcquisitionProviderResultContext } = require('./validateKnowledgeAcquisitionProviderResultContext');
const { validateStructuredInputProviderResultEvidencePayload } = require('./validateStructuredInputProviderResultEvidencePayload');

const CAPABILITY_REF = 'capability:structured-input-v1';

function validateStructuredInputProviderResultEvidenceContext({
  knowledgeAcquisitionProviderResult,
  knowledgeAcquisitionInvocationInput
} = {}) {
  const errors = [];
  const warnings = [];
  const context = validateKnowledgeAcquisitionProviderResultContext({ knowledgeAcquisitionProviderResult, knowledgeAcquisitionInvocationInput });
  if (!context.valid) errors.push(...context.errors);
  if (context.valid && knowledgeAcquisitionProviderResult.capabilityRef !== CAPABILITY_REF) {
    errors.push(`Only ${CAPABILITY_REF} is supported.`);
  }
  if (context.valid) {
    const payload = validateStructuredInputProviderResultEvidencePayload(knowledgeAcquisitionProviderResult.providerPayload);
    if (!payload.valid) errors.push(...payload.errors);
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateStructuredInputProviderResultEvidenceContext, CAPABILITY_REF };

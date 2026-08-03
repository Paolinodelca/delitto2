const crypto = require('crypto');
const { stableStringify } = require('./knowledgeAcquisitionProviderResultIdentity');

function calculateStructuredInputEvidenceIdentity({
  knowledgeAcquisitionProviderResult,
  record
} = {}) {
  const canonical = {
    extractor: 'structured_input_provider_result_evidence_v1',
    capabilityRef: knowledgeAcquisitionProviderResult?.capabilityRef,
    invocationInputFingerprint: knowledgeAcquisitionProviderResult?.invocationInputFingerprint,
    providerResultFingerprint: knowledgeAcquisitionProviderResult?.integrityFingerprint,
    record
  };
  return `evidence_${crypto.createHash('sha256').update(stableStringify(canonical)).digest('hex')}`;
}

module.exports = { calculateStructuredInputEvidenceIdentity };

const { buildEvidence, validateEvidence } = require('../../core/evidence');
const { calculateStructuredInputEvidenceIdentity } = require('./structuredInputProviderResultEvidenceIdentity');
const { validateStructuredInputProviderResultEvidenceContext } = require('./validateStructuredInputProviderResultEvidenceContext');

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function fail(code, validation) {
  const error = new Error(validation.errors.join(' | '));
  error.code = code;
  error.validation = validation;
  throw error;
}

function extractEvidenceFromStructuredInputProviderResult({
  knowledgeAcquisitionProviderResult,
  knowledgeAcquisitionInvocationInput
} = {}) {
  const validation = validateStructuredInputProviderResultEvidenceContext({ knowledgeAcquisitionProviderResult, knowledgeAcquisitionInvocationInput });
  if (!validation.valid) fail('INVALID_STRUCTURED_INPUT_PROVIDER_RESULT_EVIDENCE_CONTEXT', validation);
  const evidence = knowledgeAcquisitionProviderResult.providerPayload.records.map(record => {
    const extractedAt = record.extractedAt;
    const item = buildEvidence({
      id: calculateStructuredInputEvidenceIdentity({ knowledgeAcquisitionProviderResult, record }),
      type: record.type,
      description: record.description ?? null,
      content: clone(record.content),
      sourceId: record.source.id,
      sourceType: record.source.type,
      sourceRole: record.source.role,
      confidence: null,
      extractedBy: 'structured_input_provider_result_evidence_extractor_v1',
      extractedAt,
      metadata: { version: '1.0', createdAt: extractedAt, updatedAt: extractedAt },
      extensions: {
        acquisitionProvenance: {
          capabilityRef: knowledgeAcquisitionProviderResult.capabilityRef,
          invocationInputFingerprint: knowledgeAcquisitionProviderResult.invocationInputFingerprint,
          providerResultFingerprint: knowledgeAcquisitionProviderResult.integrityFingerprint,
          providerRecordId: record.recordId
        }
      }
    });
    deepFreeze(item);
    const evidenceValidation = validateEvidence(item);
    if (!evidenceValidation.isValid) fail('INVALID_EXTRACTED_EVIDENCE', { valid: false, errors: evidenceValidation.errors, warnings: [] });
    return item;
  });
  return deepFreeze(evidence);
}

module.exports = { extractEvidenceFromStructuredInputProviderResult };

const { validateKnowledgeAcquisitionInvocationInput } = require('../../app/knowledge');
const {
  validateKnowledgeAcquisitionProviderResult
} = require('./validateKnowledgeAcquisitionProviderResult');

function validateKnowledgeAcquisitionProviderResultContext({
  knowledgeAcquisitionProviderResult,
  knowledgeAcquisitionInvocationInput
} = {}) {
  const errors = [];
  const warnings = [];
  const resultValidation = validateKnowledgeAcquisitionProviderResult(knowledgeAcquisitionProviderResult);
  const inputValidation = validateKnowledgeAcquisitionInvocationInput(knowledgeAcquisitionInvocationInput);
  if (!resultValidation.valid) errors.push(...resultValidation.errors.map(error => `knowledgeAcquisitionProviderResult: ${error}`));
  if (!inputValidation.valid) errors.push(...inputValidation.errors.map(error => `knowledgeAcquisitionInvocationInput: ${error}`));
  if (errors.length === 0) {
    if (knowledgeAcquisitionProviderResult.capabilityRef !== knowledgeAcquisitionInvocationInput.operation.capabilityRef) {
      errors.push('Provider Result capability does not match Invocation Input.');
    }
    if (knowledgeAcquisitionProviderResult.invocationInputFingerprint !== knowledgeAcquisitionInvocationInput.integrityFingerprint) {
      errors.push('Provider Result causality does not match Invocation Input fingerprint.');
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionProviderResultContext };

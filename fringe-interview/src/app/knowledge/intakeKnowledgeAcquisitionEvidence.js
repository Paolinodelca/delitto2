const { validateEvidenceStore } = require('../../core/evidence');
const { validateKnowledgeAcquisitionEvidenceIntakeContext } = require('./validateKnowledgeAcquisitionEvidenceIntakeContext');

function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function fail(code, message, details) { const error = new Error(message); error.code = code; error.details = details; throw error; }

function intakeKnowledgeAcquisitionEvidence(input = {}) {
  const context = validateKnowledgeAcquisitionEvidenceIntakeContext(input);
  if (!context.valid) fail('INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE', context.errors.join(' | '), context);
  const evidence = [...input.evidenceStore.evidence, ...input.evidence]
    .map(clone)
    .sort((left, right) => left.id.localeCompare(right.id));
  const result = clone(input.evidenceStore);
  result.evidence = evidence;
  result.statistics.totalEvidence = evidence.length;
  const validation = validateEvidenceStore(result);
  if (!validation.isValid) fail('INVALID_RESULTING_EVIDENCE_STORE', validation.errors.join(' | '), validation);
  return freeze(result);
}

module.exports = { intakeKnowledgeAcquisitionEvidence };

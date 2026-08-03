const { validateRegisteredEvidenceSelectionContext } = require('./validateRegisteredEvidenceSelectionContext');

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  }
  return value;
}

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function fail(validation) {
  const error = new Error(validation.errors.join(' | '));
  error.code = 'INVALID_REGISTERED_EVIDENCE_SELECTION';
  error.details = validation;
  throw error;
}

function selectRegisteredKnowledgeAcquisitionEvidence(input = {}) {
  const validation = validateRegisteredEvidenceSelectionContext(input);
  if (!validation.valid) fail(validation);

  const requestedIds = new Set(input.evidenceIds);
  const selected = input.evidenceStore.evidence
    .filter(evidence => requestedIds.has(evidence.id))
    .map(clone)
    .sort((left, right) => left.id.localeCompare(right.id));

  if (selected.length !== input.evidenceIds.length) {
    fail({ valid: false, errors: ['Registered Evidence Selection cardinality is inconsistent.'], warnings: [] });
  }

  return freeze(selected);
}

module.exports = { selectRegisteredKnowledgeAcquisitionEvidence };

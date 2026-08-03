const { validateRegisteredEvidenceSelection } = require('./validateRegisteredEvidenceSelection');

function validateRegisteredEvidenceSelectionContext(input = {}) {
  const validation = validateRegisteredEvidenceSelection(input);
  if (!validation.valid) return validation;

  const errors = [];
  const warnings = [];
  const registered = new Map();

  input.evidenceStore.evidence.forEach((evidence, index) => {
    if (registered.has(evidence.id)) {
      errors.push(`evidenceStore.evidence[${index}].id is ambiguous because it duplicates registered Evidence ID: ${evidence.id}.`);
    }
    registered.set(evidence.id, evidence);
  });

  input.evidenceIds.forEach((id, index) => {
    if (!registered.has(id)) errors.push(`evidenceIds[${index}] is not registered in evidenceStore: ${id}.`);
  });

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateRegisteredEvidenceSelectionContext };

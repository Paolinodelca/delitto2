const { validateEvidenceStore, validateEvidence } = require('../../core/evidence');

function validateCloneTree(value, path, ancestors = new Set(), seen = new Set()) {
  const errors = [];
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') return [`${path} contains a non-value member.`];
  if (!value || typeof value !== 'object') return errors;
  if (ancestors.has(value)) return [`${path} contains a cyclic reference.`];
  if (seen.has(value)) return [`${path} contains a shared object alias.`];
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return [`${path} contains a non-plain object.`];
  const nextAncestors = new Set(ancestors).add(value);
  seen.add(value);
  Object.entries(value).forEach(([key, item]) => errors.push(...validateCloneTree(item, `${path}.${key}`, nextAncestors, seen)));
  return errors;
}

function validateKnowledgeAcquisitionEvidenceIntake(input = {}) {
  const errors = [];
  const warnings = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Knowledge Acquisition Evidence Intake input must be an object.'], warnings };
  }
  const storeValidation = validateEvidenceStore(input.evidenceStore);
  if (!storeValidation.isValid) errors.push(...storeValidation.errors.map(error => `evidenceStore: ${error}`));
  else errors.push(...validateCloneTree(input.evidenceStore, 'evidenceStore'));
  if (!Array.isArray(input.evidence)) errors.push('evidence must be an array.');
  else input.evidence.forEach((item, index) => {
    const validation = validateEvidence(item);
    if (!validation.isValid) errors.push(...validation.errors.map(error => `evidence[${index}].${error}`));
    else errors.push(...validateCloneTree(item, `evidence[${index}]`));
  });
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionEvidenceIntake };

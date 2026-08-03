const { validateKnowledgeAcquisitionEvidenceIntake } = require('./validateKnowledgeAcquisitionEvidenceIntake');

function validateKnowledgeAcquisitionEvidenceIntakeContext(input = {}) {
  const validation = validateKnowledgeAcquisitionEvidenceIntake(input);
  if (!validation.valid) return validation;
  const errors = [];
  const warnings = [];
  const storeIds = new Set();
  input.evidenceStore.evidence.forEach((item, index) => {
    if (storeIds.has(item.id)) errors.push(`evidenceStore.evidence[${index}].id duplicates an existing Store Evidence ID: ${item.id}.`);
    storeIds.add(item.id);
  });
  const batchIds = new Set();
  input.evidence.forEach((item, index) => {
    if (batchIds.has(item.id)) errors.push(`evidence[${index}].id duplicates another batch Evidence ID: ${item.id}.`);
    if (storeIds.has(item.id)) errors.push(`evidence[${index}].id collides with EvidenceStore ID: ${item.id}.`);
    batchIds.add(item.id);
  });
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionEvidenceIntakeContext };

const { validateObservationConstruction } = require('./validateObservationConstruction');

function validateObservationConstructionContext(input = {}) {
  const validation = validateObservationConstruction(input);
  if (!validation.valid) return validation;
  const errors = [], warnings = [];
  const { evidence, measurement, construction } = input;
  const ids = new Set();
  evidence.forEach((item, index) => {
    if (ids.has(item.id)) errors.push(`evidence[${index}].id duplicates selected Evidence ID: ${item.id}.`);
    ids.add(item.id);
    if (!measurement.sourceRefs.some(ref => ref.type === item.sourceType && ref.id === item.sourceId)) errors.push(`evidence[${index}] source is not authorized by measurement.sourceRefs.`);
  });
  if (measurement.method.id !== construction.measurementMethod.id || measurement.method.version !== construction.measurementMethod.version) errors.push('construction.measurementMethod must exactly match measurement.method.');
  construction.rules.forEach((rule, index) => {
    if (!measurement.targetIds.includes(rule.characteristicId)) errors.push(`construction.rules[${index}].characteristicId is not targeted by the Measurement.`);
  });
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateObservationConstructionContext };

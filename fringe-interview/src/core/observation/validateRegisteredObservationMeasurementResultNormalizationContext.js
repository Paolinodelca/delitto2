const { isObject, cleanString, unknownKeys, validDate } = require('./shared');

const CONTEXT_KEYS = ['id', 'version', 'producerId', 'calculatedAt', 'rules'];
const RULE_KEYS = ['minimumIndependentObservedSignals', 'expectedIndependentSignals', 'neutralThreshold', 'value', 'confidence', 'evidenceQuality', 'sourceReliability', 'dependency', 'consistency', 'insufficientData'];
const INSUFFICIENT_KEYS = ['confidence', 'coverage', 'evidenceQuality', 'sourceReliability', 'independence', 'consistency'];
const FORMULAS = Object.freeze({
  value: 'weighted_direction_strength_v1',
  confidence: 'mean_confidence_x_mean_quality_x_coverage_factor_v1',
  evidenceQuality: 'mean_observed_evidence_quality_v1',
  sourceReliability: 'mean_observed_source_reliability_v1',
  dependency: 'max_weight_per_independence_group_v1',
  consistency: 'one_minus_population_standard_deviation_v1'
});

function unit(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1; }
function executable(value) {
  if (typeof value === 'function') return true;
  if (Array.isArray(value)) return value.some(executable);
  return isObject(value) && Object.values(value).some(executable);
}

function validateRegisteredObservationMeasurementResultNormalizationContext(normalization = {}) {
  const errors = [], warnings = [];
  if (!isObject(normalization)) return { valid: false, errors: ['normalization must be an object.'], warnings };
  unknownKeys(normalization, CONTEXT_KEYS, 'normalization', errors);
  for (const key of ['id', 'version', 'producerId']) if (!cleanString(normalization[key])) errors.push(`normalization.${key} is required.`);
  if (!validDate(normalization.calculatedAt)) errors.push('normalization.calculatedAt must be a valid timestamp.');
  const rules = normalization.rules;
  if (!isObject(rules)) errors.push('normalization.rules must be an object.');
  else {
    unknownKeys(rules, RULE_KEYS, 'normalization.rules', errors);
    if (!Number.isInteger(rules.minimumIndependentObservedSignals) || rules.minimumIndependentObservedSignals < 1) errors.push('normalization.rules.minimumIndependentObservedSignals must be a positive integer.');
    if (!Number.isInteger(rules.expectedIndependentSignals) || rules.expectedIndependentSignals < 1) errors.push('normalization.rules.expectedIndependentSignals must be a positive integer.');
    if (unit(rules.neutralThreshold) === false) errors.push('normalization.rules.neutralThreshold must be between 0 and 1.');
    for (const [field, formula] of Object.entries(FORMULAS)) if (rules[field] !== formula) errors.push(`normalization.rules.${field} must equal ${formula}.`);
    if (!isObject(rules.insufficientData)) errors.push('normalization.rules.insufficientData must be an object.');
    else {
      unknownKeys(rules.insufficientData, INSUFFICIENT_KEYS, 'normalization.rules.insufficientData', errors);
      for (const key of INSUFFICIENT_KEYS) if (!unit(rules.insufficientData[key])) errors.push(`normalization.rules.insufficientData.${key} must be between 0 and 1.`);
    }
  }
  if (executable(normalization)) errors.push('normalization must not contain executable values.');
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateRegisteredObservationMeasurementResultNormalizationContext, REGISTERED_OBSERVATION_NORMALIZATION_FORMULAS: FORMULAS };

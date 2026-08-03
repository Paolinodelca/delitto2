const { validateMeasurementResult } = require('../observation/validateMeasurementResult');
const { validateMeasurementDimensionMapping } = require('./validateMeasurementDimensionMapping');

const INPUT_KEYS = ['measurementResult', 'mapping'];

function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function unexpectedOwnKeys(value, path, errors, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  const enumerable = new Set(Object.keys(value));
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    if (typeof key === 'symbol' || !enumerable.has(key)) errors.push(`${path} contains a hidden property.`);
  }
  if (Array.isArray(value)) value.forEach((item, index) => unexpectedOwnKeys(item, `${path}[${index}]`, errors, seen));
  else Object.entries(value).forEach(([key, item]) => unexpectedOwnKeys(item, `${path}.${key}`, errors, seen));
}

function validateMeasurementResultMappingApplicability(input = {}) {
  const errors = [], warnings = [];
  if (!isObject(input)) return { valid: false, errors: ['Applicability input must be an object.'], warnings };
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key === 'symbol' || !Object.prototype.propertyIsEnumerable.call(input, key)) errors.push('input contains a hidden property.');
    else if (!INPUT_KEYS.includes(key)) errors.push(`input.${key} is not allowed.`);
  }
  for (const key of INPUT_KEYS) if (!Object.prototype.hasOwnProperty.call(input, key)) errors.push(`${key} is required.`);
  if (Array.isArray(input.measurementResult)) errors.push('measurementResult must be exactly one MeasurementResult, not an array.');
  if (Array.isArray(input.mapping)) errors.push('mapping must be exactly one MeasurementDimensionMapping, not an array.');
  const resultValidation = validateMeasurementResult(input.measurementResult);
  if (!resultValidation.valid) errors.push(...resultValidation.errors.map(error => `measurementResult: ${error}`));
  const mappingValidation = validateMeasurementDimensionMapping(input.mapping);
  if (!mappingValidation.valid) errors.push(...mappingValidation.errors.map(error => `mapping: ${error}`));
  unexpectedOwnKeys(input.measurementResult, 'measurementResult', errors);
  unexpectedOwnKeys(input.mapping, 'mapping', errors);
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateMeasurementResultMappingApplicability };

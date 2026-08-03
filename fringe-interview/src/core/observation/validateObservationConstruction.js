const { validateEvidence } = require('../evidence');
const { validateMeasurement } = require('./validateMeasurement');
const { isObject, cleanString, unknownKeys, validDate } = require('./shared');

const INPUT_KEYS = ['evidence', 'measurement', 'construction'];
const CONSTRUCTION_KEYS = ['id', 'version', 'producerId', 'observedAt', 'measurementMethod', 'rules'];
const METHOD_KEYS = ['id', 'version'];
const RULE_KEYS = ['id', 'evidenceType', 'match', 'characteristicId', 'signalType', 'observationStatus', 'direction', 'strength', 'confidence', 'evidenceQuality', 'sourceReliability', 'locationRef', 'independenceGroup', 'evidenceFingerprint'];
const MATCH_KEYS = ['field', 'operator', 'value'];

function unit(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1; }

function validateObservationConstruction(input = {}) {
  const errors = [], warnings = [];
  if (!isObject(input)) return { valid: false, errors: ['Observation Construction input must be an object.'], warnings };
  unknownKeys(input, INPUT_KEYS, 'input', errors);
  INPUT_KEYS.forEach(key => { if (!Object.prototype.hasOwnProperty.call(input, key)) errors.push(`${key} is required.`); });

  if (!Array.isArray(input.evidence)) errors.push('evidence must be an array.');
  else input.evidence.forEach((item, index) => {
    const result = validateEvidence(item);
    if (!result.isValid) errors.push(...result.errors.map(error => `evidence[${index}]: ${error}`));
  });
  const measurementValidation = validateMeasurement(input.measurement);
  if (!measurementValidation.valid) errors.push(...measurementValidation.errors.map(error => `measurement: ${error}`));

  const construction = input.construction;
  if (!isObject(construction)) errors.push('construction must be an object.');
  else {
    unknownKeys(construction, CONSTRUCTION_KEYS, 'construction', errors);
    for (const key of ['id', 'version', 'producerId']) if (!cleanString(construction[key])) errors.push(`construction.${key} is required.`);
    if (!validDate(construction.observedAt)) errors.push('construction.observedAt must be a valid explicit timestamp.');
    if (!isObject(construction.measurementMethod)) errors.push('construction.measurementMethod must be an object.');
    else {
      unknownKeys(construction.measurementMethod, METHOD_KEYS, 'construction.measurementMethod', errors);
      for (const key of METHOD_KEYS) if (!cleanString(construction.measurementMethod[key])) errors.push(`construction.measurementMethod.${key} is required.`);
    }
    if (!Array.isArray(construction.rules)) errors.push('construction.rules must be an array.');
    else {
      const ids = new Set();
      construction.rules.forEach((rule, index) => {
        const path = `construction.rules[${index}]`;
        if (!isObject(rule)) { errors.push(`${path} must be an object.`); return; }
        unknownKeys(rule, RULE_KEYS, path, errors);
        for (const key of ['id', 'evidenceType', 'characteristicId', 'signalType']) if (!cleanString(rule[key])) errors.push(`${path}.${key} is required.`);
        if (cleanString(rule.id) && ids.has(rule.id)) errors.push(`${path}.id duplicates rule ID: ${rule.id}.`);
        ids.add(rule.id);
        if (!isObject(rule.match)) errors.push(`${path}.match must be an object.`);
        else {
          unknownKeys(rule.match, MATCH_KEYS, `${path}.match`, errors);
          if (rule.match.field !== 'content') errors.push(`${path}.match.field must be content.`);
          if (rule.match.operator !== 'equals') errors.push(`${path}.match.operator must be equals.`);
          if (!Object.prototype.hasOwnProperty.call(rule.match, 'value')) errors.push(`${path}.match.value is required.`);
        }
        if (!['observed', 'not_observed'].includes(rule.observationStatus)) errors.push(`${path}.observationStatus is invalid.`);
        if (rule.observationStatus === 'not_observed') {
          if (rule.direction !== null || rule.strength !== null) errors.push(`${path} not_observed requires null direction and strength.`);
        } else {
          if (!['positive', 'negative', 'neutral', 'mixed'].includes(rule.direction)) errors.push(`${path}.direction is invalid.`);
          if (!unit(rule.strength)) errors.push(`${path}.strength must be between 0 and 1.`);
        }
        for (const key of ['confidence', 'evidenceQuality', 'sourceReliability']) if (!unit(rule[key])) errors.push(`${path}.${key} must be between 0 and 1.`);
        if (rule.locationRef !== null && rule.locationRef !== undefined) {
          if (!isObject(rule.locationRef) || !cleanString(rule.locationRef.type) || !cleanString(rule.locationRef.id)) errors.push(`${path}.locationRef must be null or a valid reference.`);
          else unknownKeys(rule.locationRef, ['type', 'id'], `${path}.locationRef`, errors);
        }
        for (const key of ['independenceGroup', 'evidenceFingerprint']) if (rule[key] !== null && rule[key] !== undefined && !cleanString(rule[key])) errors.push(`${path}.${key} must be null or a non-empty string.`);
      });
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateObservationConstruction };

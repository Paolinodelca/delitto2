const crypto = require('crypto');
const { buildMeasurementResult } = require('./buildMeasurementResult');
const { validateMeasurementResult } = require('./validateMeasurementResult');
const { validateRegisteredObservationMeasurementResultNormalization } = require('./validateRegisteredObservationMeasurementResultNormalization');

const DIRECTION = Object.freeze({ positive: 1, negative: -1, neutral: 0, mixed: 0 });
function canonical(value) { if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`; if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`; return JSON.stringify(value); }
function clone(value) { if (Array.isArray(value)) return value.map(clone); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])); return value; }
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function round(value) { return Math.round(value * 10000) / 10000; }
function hash(value) { return crypto.createHash('sha256').update(canonical(value)).digest('hex'); }
function groupKey(observation) { return observation.independenceGroup || [observation.sourceRef?.type, observation.sourceRef?.id, observation.locationRef?.type, observation.locationRef?.id, observation.characteristicId, observation.signalType, observation.evidenceFingerprint].map(value => value || '').join('|'); }
function fail(validation) { const error = new Error(validation.errors.join(' | ')); error.code = 'INVALID_REGISTERED_OBSERVATION_MEASUREMENT_RESULT_NORMALIZATION'; error.details = validation; throw error; }

function normalizeRegisteredObservationMeasurementResult(input = {}) {
  const validation = validateRegisteredObservationMeasurementResultNormalization(input);
  if (!validation.valid) fail(validation);
  const observations = [...input.observations].sort((left, right) => left.id.localeCompare(right.id));
  const observed = observations.filter(item => item.observationStatus === 'observed');
  const groups = new Map();
  for (const observation of observed) {
    const weight = observation.confidence * observation.evidenceQuality * observation.sourceReliability;
    const key = groupKey(observation), previous = groups.get(key);
    if (!previous || weight > previous.weight || (weight === previous.weight && observation.id.localeCompare(previous.observation.id) < 0)) groups.set(key, { observation, weight });
  }
  const independent = [...groups.values()].sort((left, right) => left.observation.id.localeCompare(right.observation.id));
  const rules = input.normalization.rules;
  const effectiveWeight = independent.reduce((sum, item) => sum + item.weight, 0);
  const insufficient = independent.length < rules.minimumIndependentObservedSignals || effectiveWeight === 0;
  const refs = observations.map(item => ({ type: 'observation', id: item.id }));
  let fields;
  if (insufficient) fields = { normalizedValue: null, direction: null, status: 'insufficient_data', ...rules.insufficientData };
  else {
    const mean = field => round(independent.reduce((sum, item) => sum + item.observation[field], 0) / independent.length);
    const normalizedValue = round(independent.reduce((sum, item) => sum + DIRECTION[item.observation.direction] * item.observation.strength * item.weight, 0) / effectiveWeight);
    const coverage = round(Math.min(1, independent.length / rules.expectedIndependentSignals));
    const scores = independent.map(item => DIRECTION[item.observation.direction] * item.observation.strength);
    const scoreMean = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    const variance = scores.reduce((sum, value) => sum + (value - scoreMean) ** 2, 0) / scores.length;
    fields = {
      normalizedValue,
      direction: Math.abs(normalizedValue) <= rules.neutralThreshold ? 'neutral' : normalizedValue > 0 ? 'positive' : 'negative',
      confidence: round(mean('confidence') * mean('evidenceQuality') * (0.5 + 0.5 * coverage)),
      coverage,
      evidenceQuality: mean('evidenceQuality'),
      sourceReliability: mean('sourceReliability'),
      independence: round(observed.length ? independent.length / observed.length : 1),
      consistency: round(Math.max(0, 1 - Math.sqrt(variance))),
      status: 'calculated'
    };
  }
  const normalizationRef = { id: input.normalization.id, version: input.normalization.version, rulesFingerprint: `sha256:${hash(rules)}` };
  const semantic = { contractVersion: '1.0', measurementId: input.measurement.id, characteristicId: input.characteristicId, observations: observations.map(clone), normalization: clone(input.normalization), fields };
  const id = `measurement_result:${hash(semantic)}`;
  const result = buildMeasurementResult({ id, measurementId: input.measurement.id, characteristicId: input.characteristicId, observationRefs: refs, ...fields, calculatedAt: input.normalization.calculatedAt, calculatedBy: input.normalization.producerId, metadata: { version: '1.0', createdAt: input.normalization.calculatedAt }, extensions: { normalization: normalizationRef } });
  const resultValidation = validateMeasurementResult(result);
  if (!resultValidation.valid) fail(resultValidation);
  return freeze(clone(result));
}

module.exports = { normalizeRegisteredObservationMeasurementResult };

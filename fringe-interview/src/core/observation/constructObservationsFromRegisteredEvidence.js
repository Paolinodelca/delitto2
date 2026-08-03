const crypto = require('crypto');
const { buildObservation } = require('./buildObservation');
const { validateObservation } = require('./validateObservation');
const { validateObservationConstructionContext } = require('./validateObservationConstructionContext');

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function deepEqual(left, right) { return canonical(left) === canonical(right); }
function clone(value) { if (Array.isArray(value)) return value.map(clone); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])); return value; }
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function identity(parts) { return `observation:${crypto.createHash('sha256').update(parts.join('\u001f')).digest('hex')}`; }
function fail(validation) { const error = new Error(validation.errors.join(' | ')); error.code = 'INVALID_OBSERVATION_CONSTRUCTION'; error.details = validation; throw error; }

function constructObservationsFromRegisteredEvidence(input = {}) {
  const validation = validateObservationConstructionContext(input);
  if (!validation.valid) fail(validation);
  const observations = [];
  for (const evidence of input.evidence) {
    for (const rule of input.construction.rules) {
      if (rule.evidenceType !== evidence.type || !deepEqual(evidence.content, rule.match.value)) continue;
      const observation = buildObservation({
        id: identity([input.measurement.id, evidence.id, canonical(evidence.content), rule.characteristicId, rule.signalType, rule.observationStatus, input.construction.id, input.construction.version, rule.id]),
        measurementId: input.measurement.id,
        sourceRef: { type: evidence.sourceType, id: evidence.sourceId },
        locationRef: rule.locationRef ?? null,
        characteristicId: rule.characteristicId,
        signalType: rule.signalType,
        observationStatus: rule.observationStatus,
        direction: rule.direction,
        strength: rule.strength,
        confidence: rule.confidence,
        evidenceQuality: rule.evidenceQuality,
        sourceReliability: rule.sourceReliability,
        contentRef: { type: 'evidence', id: evidence.id },
        independenceGroup: rule.independenceGroup ?? null,
        evidenceFingerprint: rule.evidenceFingerprint ?? null,
        observedAt: input.construction.observedAt,
        extractedBy: input.construction.producerId,
        metadata: { version: '1.0', createdAt: input.construction.observedAt },
        extensions: { constructionRule: { ruleSetId: input.construction.id, ruleSetVersion: input.construction.version, ruleId: rule.id } }
      });
      const result = validateObservation(observation);
      if (!result.valid) fail({ valid: false, errors: result.errors.map(error => `constructed Observation: ${error}`), warnings: result.warnings });
      observations.push(observation);
    }
  }
  observations.sort((left, right) => left.id.localeCompare(right.id));
  if (new Set(observations.map(item => item.id)).size !== observations.length) fail({ valid: false, errors: ['Construction produced ambiguous duplicate Observation identities.'], warnings: [] });
  return freeze(observations.map(clone));
}

module.exports = { constructObservationsFromRegisteredEvidence };

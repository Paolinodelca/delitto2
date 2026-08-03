const observation = require('../src/core/observation');
const dimension = require('../src/core/dimension');

function buildApplicabilityFixture() {
  const at = '2026-08-03T12:00:00.000Z';
  return {
    measurementResult: observation.buildMeasurementResult({ id: 'result_1', measurementId: 'measurement_1', characteristicId: 'signal', observationRefs: [{ type: 'observation', id: 'observation_1' }], normalizedValue: 0.8, direction: 'positive', confidence: 0.7, coverage: 0.6, evidenceQuality: 0.8, sourceReliability: 0.9, independence: 1, consistency: 0.9, status: 'calculated', calculatedAt: at, calculatedBy: 'fixture' }),
    mapping: dimension.buildMeasurementDimensionMapping({ id: 'mapping_1', measurementId: 'measurement_1', targets: [{ dimensionId: 'ownership', contributionType: 'supporting', weight: 0.5, confidenceFactor: 0.8 }], metadata: { createdAt: at, updatedAt: at } }, { now: at })
  };
}
module.exports = { buildApplicabilityFixture };

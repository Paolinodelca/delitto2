const { buildEvidence } = require('../src/core/evidence');
const { buildMeasurement } = require('../src/core/observation');

const at = '2026-08-03T10:00:00.000Z';
function buildFixture() {
  const evidence = [
    buildEvidence({ id: 'evidence:coordination', type: 'structured_statement', content: 'coordinated-shift', sourceId: 'answer:1', sourceType: 'structured_input', extractedBy: 'fixture', extractedAt: at, metadata: { version: '1.0', createdAt: at, updatedAt: at } }),
    buildEvidence({ id: 'evidence:unmatched', type: 'structured_statement', content: 'unrelated', sourceId: 'answer:2', sourceType: 'structured_input', extractedBy: 'fixture', extractedAt: at, metadata: { version: '1.0', createdAt: at, updatedAt: at } })
  ];
  const measurement = buildMeasurement({ id: 'measurement:coordination', type: 'registered_evidence_analysis', sourceRefs: evidence.map(item => ({ type: item.sourceType, id: item.sourceId })), scope: { type: 'selected_registered_evidence' }, targetIds: ['coordination'], method: { id: 'exact-content-baseline', version: '1.0' }, status: 'planned', createdAt: at });
  const construction = {
    id: 'registered-evidence-observation-baseline', version: '1.0', producerId: 'core:registered-evidence-observation-construction-v1', observedAt: at,
    measurementMethod: { id: 'exact-content-baseline', version: '1.0' },
    rules: [
      { id: 'coordination-positive', evidenceType: 'structured_statement', match: { field: 'content', operator: 'equals', value: 'coordinated-shift' }, characteristicId: 'coordination', signalType: 'explicit_coordination', observationStatus: 'observed', direction: 'positive', strength: 0.8, confidence: 0.75, evidenceQuality: 0.7, sourceReliability: 0.65, locationRef: null, independenceGroup: null, evidenceFingerprint: null },
      { id: 'coordination-secondary', evidenceType: 'structured_statement', match: { field: 'content', operator: 'equals', value: 'coordinated-shift' }, characteristicId: 'coordination', signalType: 'shared_execution', observationStatus: 'observed', direction: 'positive', strength: 0.6, confidence: 0.7, evidenceQuality: 0.7, sourceReliability: 0.65, locationRef: null, independenceGroup: null, evidenceFingerprint: null }
    ]
  };
  return { evidence, measurement, construction };
}
module.exports = { buildFixture };

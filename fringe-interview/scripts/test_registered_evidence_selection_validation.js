const assert = require('assert');
const api = require('../src/app/knowledge');
const fixture = require('./registered_evidence_selection_fixture');

const { populatedStore } = fixture.buildFixture();
const id = populatedStore.evidence[0].id;
const invalidCases = [
  null,
  {},
  { evidenceStore: null, evidenceIds: [] },
  { evidenceStore: populatedStore, evidenceIds: 'not-an-array' },
  { evidenceStore: populatedStore, evidenceIds: [null] },
  { evidenceStore: populatedStore, evidenceIds: [''] },
  { evidenceStore: populatedStore, evidenceIds: [id, id] },
  { evidenceStore: populatedStore, evidenceIds: ['evidence:missing'] },
  { evidenceStore: populatedStore, evidenceIds: [], extra: true }
];

for (const input of invalidCases) {
  assert.throws(
    () => api.selectRegisteredKnowledgeAcquisitionEvidence(input),
    error => error.code === 'INVALID_REGISTERED_EVIDENCE_SELECTION'
  );
}

const ambiguousStore = {
  ...populatedStore,
  evidence: [populatedStore.evidence[0], populatedStore.evidence[0]],
  statistics: { ...populatedStore.statistics, totalEvidence: 2 }
};
assert.throws(
  () => api.selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: ambiguousStore, evidenceIds: [id] }),
  error => error.code === 'INVALID_REGISTERED_EVIDENCE_SELECTION'
);
assert.strictEqual(api.validateRegisteredEvidenceSelection({ evidenceStore: populatedStore, evidenceIds: [id] }).valid, true);
assert.strictEqual(api.validateRegisteredEvidenceSelectionContext({ evidenceStore: populatedStore, evidenceIds: [id] }).valid, true);
console.log('Registered Evidence Selection validation tests PASSED');

const assert = require('assert');
const api = require('../src/app/knowledge');
const fixture = require('./knowledge_acquisition_evidence_intake_fixture');

const f = fixture.buildFixture();
const populated = api.intakeKnowledgeAcquisitionEvidence({ evidenceStore: f.store, evidence: [f.evidence[0]] });
const before = JSON.stringify(populated);
assert.throws(() => api.intakeKnowledgeAcquisitionEvidence({ evidenceStore: populated, evidence: [f.evidence[1], f.evidence[0]] }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE');
assert.throws(() => api.intakeKnowledgeAcquisitionEvidence({ evidenceStore: f.store, evidence: [f.evidence[0], f.evidence[0]] }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE');
const invalid = { ...f.evidence[0], id: 'invalid', content: null };
for (const batch of [[invalid, f.evidence[1]], [f.evidence[1], invalid]]) {
  assert.throws(() => api.intakeKnowledgeAcquisitionEvidence({ evidenceStore: f.store, evidence: batch }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE');
}
assert.strictEqual(JSON.stringify(populated), before);
assert.strictEqual(populated.evidence.length, 1);
const aliased = { ...f.evidence[1], id: 'aliased', content: { value: {} } };
aliased.content.alias = aliased.content.value;
assert.throws(() => api.intakeKnowledgeAcquisitionEvidence({ evidenceStore: f.store, evidence: [aliased] }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE');
const duplicateStore = { ...f.store, evidence: [f.evidence[0], f.evidence[0]], statistics: { totalEvidence: 2, sourceCount: 0 } };
assert.throws(() => api.intakeKnowledgeAcquisitionEvidence({ evidenceStore: duplicateStore, evidence: [] }), error => error.code === 'INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE');
console.log('Knowledge Acquisition Evidence Intake atomicity tests PASSED');

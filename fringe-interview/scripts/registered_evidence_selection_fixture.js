const intakeFixture = require('./knowledge_acquisition_evidence_intake_fixture');
const { intakeKnowledgeAcquisitionEvidence } = require('../src/app/knowledge');

function buildFixture() {
  const fixture = intakeFixture.buildFixture();
  const populatedStore = intakeKnowledgeAcquisitionEvidence({ evidenceStore: fixture.store, evidence: fixture.evidence });
  return { ...fixture, populatedStore };
}

module.exports = { buildFixture };

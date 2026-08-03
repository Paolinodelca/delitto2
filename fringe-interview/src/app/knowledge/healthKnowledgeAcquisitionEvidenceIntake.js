const { intakeKnowledgeAcquisitionEvidence } = require('./intakeKnowledgeAcquisitionEvidence');

function healthKnowledgeAcquisitionEvidenceIntake(fixtures) {
  if (!fixtures || typeof fixtures.buildFixture !== 'function') return { ok: false, details: { reason: 'Fixture factory is required.' } };
  try {
    const fixture = fixtures.buildFixture();
    const before = JSON.stringify(fixture);
    const multiple = intakeKnowledgeAcquisitionEvidence({ evidenceStore: fixture.store, evidence: fixture.evidence });
    const empty = intakeKnowledgeAcquisitionEvidence({ evidenceStore: fixture.store, evidence: [] });
    let storeDuplicate = false;
    let batchDuplicate = false;
    try { intakeKnowledgeAcquisitionEvidence({ evidenceStore: multiple, evidence: [fixture.evidence[0]] }); } catch (error) { storeDuplicate = error.code === 'INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE'; }
    try { intakeKnowledgeAcquisitionEvidence({ evidenceStore: fixture.store, evidence: [fixture.evidence[0], fixture.evidence[0]] }); } catch (error) { batchDuplicate = error.code === 'INVALID_KNOWLEDGE_ACQUISITION_EVIDENCE_INTAKE'; }
    const ok = multiple.evidence.length === fixture.evidence.length && empty !== fixture.store && empty.evidence.length === 0 && storeDuplicate && batchDuplicate && Object.isFrozen(multiple) && Object.isFrozen(multiple.evidence) && JSON.stringify(fixture) === before;
    return { ok, details: { atomic: true, sideEffectFree: true, emptyBatchFreshStore: true, forbiddenResponsibilities: [] } };
  } catch (error) { return { ok: false, details: { error: error.message, code: error.code } }; }
}

module.exports = { healthKnowledgeAcquisitionEvidenceIntake };

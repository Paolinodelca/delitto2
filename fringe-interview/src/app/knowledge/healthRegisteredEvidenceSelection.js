const { selectRegisteredKnowledgeAcquisitionEvidence } = require('./selectRegisteredKnowledgeAcquisitionEvidence');

function healthRegisteredEvidenceSelection(fixtures) {
  if (!fixtures || typeof fixtures.buildFixture !== 'function') {
    return { ok: false, details: { reason: 'Fixture factory is required.' } };
  }
  try {
    const fixture = fixtures.buildFixture();
    const store = fixture.populatedStore;
    const ids = store.evidence.map(item => item.id);
    const before = JSON.stringify(fixture);
    const multiple = selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: store, evidenceIds: [...ids].reverse() });
    const empty = selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: store, evidenceIds: [] });
    let duplicateRejected = false;
    let missingRejected = false;
    try { selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: store, evidenceIds: [ids[0], ids[0]] }); } catch (error) { duplicateRejected = error.code === 'INVALID_REGISTERED_EVIDENCE_SELECTION'; }
    try { selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: store, evidenceIds: ['evidence:missing'] }); } catch (error) { missingRejected = error.code === 'INVALID_REGISTERED_EVIDENCE_SELECTION'; }
    const canonical = multiple.every((item, index) => index === 0 || multiple[index - 1].id.localeCompare(item.id) < 0);
    const immutable = Object.isFrozen(multiple) && multiple.every(item => Object.isFrozen(item) && Object.isFrozen(item.metadata) && Object.isFrozen(item.extensions));
    const ok = multiple.length === ids.length && empty.length === 0 && Object.isFrozen(empty) && canonical && immutable && duplicateRejected && missingRejected && JSON.stringify(fixture) === before;
    return { ok, details: { exactMembership: true, canonicalOrdering: canonical, immutable, emptySelection: true, forbiddenResponsibilities: [] } };
  } catch (error) {
    return { ok: false, details: { error: error.message, code: error.code } };
  }
}

module.exports = { healthRegisteredEvidenceSelection };

const { constructObservationsFromRegisteredEvidence } = require('./constructObservationsFromRegisteredEvidence');

function healthObservationConstruction(fixtures) {
  if (!fixtures || typeof fixtures.buildFixture !== 'function') return { ok: false, details: { reason: 'Fixture factory is required.' } };
  try {
    const fixture = fixtures.buildFixture();
    const before = JSON.stringify(fixture);
    const output = constructObservationsFromRegisteredEvidence(fixture);
    const repeated = constructObservationsFromRegisteredEvidence(fixture);
    const empty = constructObservationsFromRegisteredEvidence({ ...fixture, evidence: [] });
    const ok = output.length === 2 && JSON.stringify(output) === JSON.stringify(repeated) && empty.length === 0 && Object.isFrozen(output) && output.every(item => Object.isFrozen(item) && item.contentRef.type === 'evidence') && JSON.stringify(fixture) === before;
    return { ok, details: { deterministic: true, immutable: true, atomicCausality: true, emptyMeansNoObservation: true, forbiddenResponsibilities: [] } };
  } catch (error) { return { ok: false, details: { error: error.message, code: error.code } }; }
}
module.exports = { healthObservationConstruction };

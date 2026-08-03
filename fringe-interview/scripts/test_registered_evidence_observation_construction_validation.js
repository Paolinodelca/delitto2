const assert = require('assert');
const api = require('../src/core/observation');
const fixture = require('./registered_evidence_observation_construction_fixture').buildFixture();
assert(api.validateObservationConstruction(fixture).valid);
assert(api.validateObservationConstructionContext(fixture).valid);
function rejected(input) { assert.throws(() => api.constructObservationsFromRegisteredEvidence(input), error => error.code === 'INVALID_OBSERVATION_CONSTRUCTION'); }
rejected({ ...fixture, extra: true });
rejected({ ...fixture, measurement: { ...fixture.measurement, method: { id: 'other', version: '1.0' } } });
rejected({ ...fixture, evidence: [fixture.evidence[0], fixture.evidence[0]] });
rejected({ ...fixture, evidence: [{ ...fixture.evidence[0], sourceId: 'not-authorized' }] });
rejected({ ...fixture, construction: { ...fixture.construction, rules: [{ ...fixture.construction.rules[0], characteristicId: 'not-targeted' }] } });
rejected({ ...fixture, construction: { ...fixture.construction, rules: [{ ...fixture.construction.rules[0], confidence: null }] } });
rejected({ ...fixture, construction: { ...fixture.construction, rules: [{ ...fixture.construction.rules[0], hiddenPolicy: true }] } });
rejected({ ...fixture, construction: { ...fixture.construction, rules: [{ ...fixture.construction.rules[0], locationRef: { type: 'segment', id: 'one', hidden: true } }] } });
console.log('Registered Evidence Observation Construction validation tests PASSED');

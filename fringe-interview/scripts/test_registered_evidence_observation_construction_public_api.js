const assert = require('assert');
const api = require('../src/core/observation');
for (const name of ['constructObservationsFromRegisteredEvidence', 'validateObservationConstruction', 'validateObservationConstructionContext', 'healthObservationConstruction']) assert.equal(typeof api[name], 'function', `${name} must be public`);
console.log('Registered Evidence Observation Construction public API tests PASSED');

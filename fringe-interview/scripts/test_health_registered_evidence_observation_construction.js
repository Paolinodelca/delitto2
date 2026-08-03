const assert = require('assert');
const api = require('../src/core/observation');
const fixture = require('./registered_evidence_observation_construction_fixture');
const result = api.healthObservationConstruction(fixture);
assert(result.ok, JSON.stringify(result));
console.log('Registered Evidence Observation Construction health PASSED');

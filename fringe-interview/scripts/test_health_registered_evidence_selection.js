const assert = require('assert');
const { healthRegisteredEvidenceSelection } = require('../src/app/knowledge');
const fixture = require('./registered_evidence_selection_fixture');
const health = healthRegisteredEvidenceSelection(fixture);
assert.strictEqual(health.ok, true, JSON.stringify(health));
console.log('Registered Evidence Selection health PASSED');

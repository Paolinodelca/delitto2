const assert = require('assert');
const { healthKnowledgeAcquisitionEvidenceIntake } = require('../src/app/knowledge');
const fixture = require('./knowledge_acquisition_evidence_intake_fixture');
const health = healthKnowledgeAcquisitionEvidenceIntake(fixture);
assert.strictEqual(health.ok, true, JSON.stringify(health));
console.log('Knowledge Acquisition Evidence Intake health PASSED');

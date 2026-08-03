const assert = require('assert');
const fs = require('fs');
const path = require('path');

const files = [
  'selectRegisteredKnowledgeAcquisitionEvidence.js',
  'validateRegisteredEvidenceSelection.js',
  'validateRegisteredEvidenceSelectionContext.js',
  'healthRegisteredEvidenceSelection.js'
];
const source = files.map(file => fs.readFileSync(path.join(__dirname, '../src/app/knowledge', file), 'utf8')).join('\n');
for (const forbidden of ['buildObservation', 'buildMeasurement', 'buildDimensionContribution', 'KnowledgeLedger', 'PersonKnowledgeMatrix', 'fetch(', 'writeFile', 'readFile']) {
  assert(!source.includes(forbidden), `Forbidden responsibility leaked into selection: ${forbidden}`);
}
assert(!source.includes("require('../../infrastructure"));
assert(!source.includes("require('../../runtime"));
console.log('Registered Evidence Selection boundary tests PASSED');

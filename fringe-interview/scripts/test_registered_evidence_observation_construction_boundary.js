const assert = require('assert');
const fs = require('fs');
const path = require('path');
const directory = path.join(__dirname, '..', 'src', 'core', 'observation');
for (const name of ['constructObservationsFromRegisteredEvidence.js', 'validateObservationConstruction.js', 'validateObservationConstructionContext.js']) {
  const source = fs.readFileSync(path.join(directory, name), 'utf8');
  assert(!source.includes('/app/') && !source.includes('/infrastructure/'));
  assert(!/MeasurementResult|Contribution|KnowledgeLedger|KnowledgeSnapshot|Runtime/.test(source));
  assert(!/require\(['"]fs['"]\)|fetch\(|axios|openai/i.test(source));
}
console.log('Registered Evidence Observation Construction boundary tests PASSED');

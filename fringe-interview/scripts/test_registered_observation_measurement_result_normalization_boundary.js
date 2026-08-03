const assert = require('assert');
const fs = require('fs');
const path = require('path');
const directory = path.resolve(__dirname, '../src/core/observation');
const files = ['normalizeRegisteredObservationMeasurementResult.js', 'validateRegisteredObservationMeasurementResultNormalization.js', 'validateRegisteredObservationMeasurementResultNormalizationContext.js', 'validateRegisteredObservationMeasurementResult.js', 'healthRegisteredObservationMeasurementResultNormalization.js'];
const source = files.map(file => fs.readFileSync(path.join(directory, file), 'utf8')).join('\n');
for (const forbidden of ['MeasurementDimensionMapping', 'DimensionContribution', 'KnowledgeLedger', 'KnowledgeSnapshot', 'PersonKnowledgeMatrix', 'Coverage update', 'Requirement satisfaction', '../dimension', '../knowledge', '../app', '../infrastructure', 'fetch(', 'readFile', 'writeFile']) assert(!source.includes(forbidden), `forbidden boundary dependency: ${forbidden}`);
assert(!/Date\.now|new Date|randomUUID|Math\.random/.test(source), 'implicit clock/random identity is forbidden');
console.log('Registered Observation Measurement Result Normalization boundary tests PASSED');

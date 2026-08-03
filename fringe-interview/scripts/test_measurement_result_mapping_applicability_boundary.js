const assert = require('assert');
const fs = require('fs');
const path = require('path');
const directory = path.resolve(__dirname, '../src/core/dimension');
const files = ['evaluateMeasurementResultMappingApplicability.js', 'validateMeasurementResultMappingApplicability.js', 'validateMeasurementResultMappingApplicabilityContext.js', 'healthMeasurementResultMappingApplicability.js'];
const source = files.map(file => fs.readFileSync(path.join(directory, file), 'utf8')).join('\n');
for (const forbidden of ['DimensionContribution', 'mapMeasurementResultToDimensionContributions', 'characteristicId ===', 'KnowledgeLedger', 'KnowledgeSnapshot', 'PersonKnowledgeMatrix', '../app', '../infrastructure', 'fetch(', 'readFile', 'writeFile', 'Date.now', 'new Date', 'randomUUID']) assert(!source.includes(forbidden), `forbidden boundary responsibility: ${forbidden}`);
console.log('Measurement Result Mapping Applicability boundary tests PASSED');

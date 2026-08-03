const assert = require('assert');
const infrastructure = require('../src/infrastructure/knowledge');
const fixture = require('./structured_input_provider_result_evidence_extractor_fixture');

const output = infrastructure.extractEvidenceFromStructuredInputProviderResult(fixture.buildFixture());
const forbidden = ['knowledge', 'observation', 'measurement', 'contribution', 'coverage', 'matrix', 'score', 'finalConfidence'];
for (const item of output) for (const property of forbidden) assert(!(property in item), `${property} leaked into Evidence`);
assert.deepStrictEqual(Object.keys(output[0]).sort(), ['confidence', 'content', 'description', 'extensions', 'extractedAt', 'extractedBy', 'id', 'metadata', 'sourceId', 'sourceRole', 'sourceType', 'type'].sort());
assert.strictEqual(output[0].id, 'evidence_7720f1048e3aa2514e218666f178e946479f3c2f2af7475df9f6939a560c9407');
assert.strictEqual(Object.keys(output[0].extensions).join(','), 'acquisitionProvenance');
console.log('Structured Input Provider Result Evidence Extractor regression PASSED');

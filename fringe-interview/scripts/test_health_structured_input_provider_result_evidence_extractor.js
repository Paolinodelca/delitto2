const assert = require('assert');
const { healthStructuredInputProviderResultEvidenceExtractor } = require('../src/infrastructure/knowledge');
const fixture = require('./structured_input_provider_result_evidence_extractor_fixture');
const result = healthStructuredInputProviderResultEvidenceExtractor(fixture);
assert(result.ok, JSON.stringify(result.details));
assert(result.details.deeplyImmutable && result.details.causalityPreserved);
console.log('Structured Input Provider Result Evidence Extractor health PASSED');

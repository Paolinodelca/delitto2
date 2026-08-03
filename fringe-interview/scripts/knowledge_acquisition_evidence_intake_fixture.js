const infrastructureFixture = require('./structured_input_provider_result_evidence_extractor_fixture');
const infrastructure = require('../src/infrastructure/knowledge');

function buildFixture() {
  const context = infrastructureFixture.buildFixture();
  const evidence = infrastructure.extractEvidenceFromStructuredInputProviderResult(context);
  const store = Object.freeze({
    evidence: Object.freeze([]),
    sources: Object.freeze([]),
    statistics: Object.freeze({ totalEvidence: 0, sourceCount: 0 }),
    metadata: Object.freeze({ version: '1.0', createdAt: '2026-08-03T00:00:00.000Z', inputBundleVersion: null }),
    extensions: Object.freeze({})
  });
  return { store, evidence };
}

module.exports = { buildFixture };

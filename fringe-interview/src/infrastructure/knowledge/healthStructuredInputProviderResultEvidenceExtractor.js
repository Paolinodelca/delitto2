const { extractEvidenceFromStructuredInputProviderResult } = require('./extractEvidenceFromStructuredInputProviderResult');

function healthStructuredInputProviderResultEvidenceExtractor(fixtures) {
  if (!fixtures || typeof fixtures.buildFixture !== 'function') return { ok: false, details: { reason: 'Fixture factory is required.' } };
  try {
    const fixture = fixtures.buildFixture();
    const evidence = extractEvidenceFromStructuredInputProviderResult(fixture);
    return {
      ok: evidence.length === 2 && Object.isFrozen(evidence) && evidence.every(item => Object.isFrozen(item.extensions.acquisitionProvenance)),
      details: { evidenceCount: evidence.length, deeplyImmutable: evidence.every(item => Object.isFrozen(item) && Object.isFrozen(item.content)), causalityPreserved: evidence.every(item => item.extensions.acquisitionProvenance.providerResultFingerprint === fixture.knowledgeAcquisitionProviderResult.integrityFingerprint) }
    };
  } catch (error) {
    return { ok: false, details: { error: error.message, code: error.code } };
  }
}

module.exports = { healthStructuredInputProviderResultEvidenceExtractor };

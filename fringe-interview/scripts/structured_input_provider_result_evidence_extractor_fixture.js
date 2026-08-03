const application = require('../src/app/knowledge');
const infrastructure = require('../src/infrastructure/knowledge');
const invocationFixture = require('./knowledge_acquisition_invocation_boundary_fixture');

function buildFixture() {
  const knowledgeAcquisitionInvocationInput = application.buildKnowledgeAcquisitionInvocationInput(invocationFixture.buildFixture().context);
  const providerPayload = {
    schemaVersion: '1.0',
    format: 'structured_input',
    records: [
      { recordId: 'record-001', type: 'structured_statement', description: 'Explicit structured statement.', content: { text: 'Led a deterministic migration.', tags: ['migration'] }, source: { id: 'structured-source-001', type: 'structured_input', role: 'acquisition_source' }, extractedAt: '2026-07-31T12:00:00.000Z' },
      { recordId: 'record-002', type: 'structured_fact', content: 'Reduced processing time.', source: { id: 'structured-source-001', type: 'structured_input', role: 'acquisition_source' }, extractedAt: '2026-07-31T12:00:01.000Z' }
    ]
  };
  const knowledgeAcquisitionProviderResult = infrastructure.buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput, providerPayload });
  return { knowledgeAcquisitionInvocationInput, knowledgeAcquisitionProviderResult };
}

module.exports = { buildFixture };

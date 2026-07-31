const {
  validateKnowledgeAcquisitionInvocationInput,
  validateKnowledgeAcquisitionInvocationPort
} = require('../../app/knowledge');
const {
  validateStructuredInputKnowledgeAcquisitionProvider
} = require('./validateStructuredInputKnowledgeAcquisitionProvider');

const SUPPORTED_CAPABILITY_REF = 'capability:structured-input-v1';

function fail(code, message, validation) {
  const error = new Error(message);
  error.code = code;
  if (validation) error.validation = validation;
  throw error;
}

function createStructuredInputKnowledgeAcquisitionInvocationAdapter({ provider } = {}) {
  const providerValidation = validateStructuredInputKnowledgeAcquisitionProvider(provider);
  if (!providerValidation.valid) {
    fail(
      'INVALID_STRUCTURED_INPUT_KNOWLEDGE_ACQUISITION_PROVIDER',
      providerValidation.errors.join(' | '),
      providerValidation
    );
  }

  const adapter = {
    invoke(knowledgeAcquisitionInvocationInput) {
      const inputValidation = validateKnowledgeAcquisitionInvocationInput(
        knowledgeAcquisitionInvocationInput
      );
      if (!inputValidation.valid) {
        fail(
          'INVALID_KNOWLEDGE_ACQUISITION_INVOCATION_INPUT',
          inputValidation.errors.join(' | '),
          inputValidation
        );
      }
      if (knowledgeAcquisitionInvocationInput.operation.capabilityRef !== SUPPORTED_CAPABILITY_REF) {
        fail(
          'UNSUPPORTED_KNOWLEDGE_ACQUISITION_CAPABILITY',
          `Structured Input adapter requires capabilityRef ${SUPPORTED_CAPABILITY_REF}.`
        );
      }

      return provider.acquireKnowledge(knowledgeAcquisitionInvocationInput);
    }
  };

  const portValidation = validateKnowledgeAcquisitionInvocationPort(adapter);
  if (!portValidation.valid) {
    fail('INVALID_KNOWLEDGE_ACQUISITION_INVOCATION_ADAPTER', portValidation.errors.join(' | '));
  }

  return Object.freeze(adapter);
}

module.exports = {
  SUPPORTED_CAPABILITY_REF,
  createStructuredInputKnowledgeAcquisitionInvocationAdapter
};

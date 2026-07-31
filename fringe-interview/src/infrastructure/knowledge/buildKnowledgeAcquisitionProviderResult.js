const { validateKnowledgeAcquisitionInvocationInput } = require('../../app/knowledge');
const {
  calculateKnowledgeAcquisitionProviderResultFingerprint
} = require('./knowledgeAcquisitionProviderResultIdentity');
const {
  validateKnowledgeAcquisitionProviderResult
} = require('./validateKnowledgeAcquisitionProviderResult');

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyJsonProperties(value) {
  const ownKeys = Reflect.ownKeys(value);
  if (Array.isArray(value)) {
    const expected = [...Array(value.length).keys()].map(String).concat('length');
    return ownKeys.length === expected.length && ownKeys.every(key => {
      if (!expected.includes(key)) return false;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return key === 'length' || (descriptor.enumerable && Object.prototype.hasOwnProperty.call(descriptor, 'value'));
    });
  }
  const enumerableKeys = Object.keys(value);
  return ownKeys.length === enumerableKeys.length && ownKeys.every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return typeof key === 'string' && enumerableKeys.includes(key) && descriptor.enumerable &&
      Object.prototype.hasOwnProperty.call(descriptor, 'value');
  });
}

function cloneTechnicalValue(value, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || ancestors.has(value) || !hasOnlyJsonProperties(value)) {
    throw new Error('providerPayload is not serializable.');
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    const clone = value.map(item => cloneTechnicalValue(item, ancestors));
    ancestors.delete(value);
    return clone;
  }
  if (!isPlainObject(value)) throw new Error('providerPayload must contain only plain technical values.');
  const clone = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneTechnicalValue(item, ancestors)]));
  ancestors.delete(value);
  return clone;
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function fail(code, message, validation) {
  const error = new Error(message);
  error.code = code;
  if (validation) error.validation = validation;
  throw error;
}

function buildKnowledgeAcquisitionProviderResult({ knowledgeAcquisitionInvocationInput, providerPayload = null } = {}) {
  const inputValidation = validateKnowledgeAcquisitionInvocationInput(knowledgeAcquisitionInvocationInput);
  if (!inputValidation.valid) {
    fail('INVALID_KNOWLEDGE_ACQUISITION_INVOCATION_INPUT', inputValidation.errors.join(' | '), inputValidation);
  }
  let payload;
  try {
    payload = cloneTechnicalValue(providerPayload);
  } catch (error) {
    fail('INVALID_KNOWLEDGE_ACQUISITION_PROVIDER_PAYLOAD', error.message);
  }
  const result = {
    resultVersion: '1.0',
    type: 'knowledge_acquisition_provider_result',
    status: 'succeeded',
    capabilityRef: knowledgeAcquisitionInvocationInput.operation.capabilityRef,
    invocationInputFingerprint: knowledgeAcquisitionInvocationInput.integrityFingerprint,
    providerPayload: payload,
    integrityFingerprint: ''
  };
  result.integrityFingerprint = calculateKnowledgeAcquisitionProviderResultFingerprint(result);
  deepFreeze(result);
  const validation = validateKnowledgeAcquisitionProviderResult(result);
  if (!validation.valid) {
    fail('INVALID_KNOWLEDGE_ACQUISITION_PROVIDER_RESULT', validation.errors.join(' | '), validation);
  }
  return result;
}

module.exports = { buildKnowledgeAcquisitionProviderResult };

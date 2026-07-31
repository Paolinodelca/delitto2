const {
  calculateKnowledgeAcquisitionProviderResultFingerprint
} = require('./knowledgeAcquisitionProviderResultIdentity');

const TOP_LEVEL_PROPERTIES = [
  'resultVersion',
  'type',
  'status',
  'capabilityRef',
  'invocationInputFingerprint',
  'providerPayload',
  'integrityFingerprint'
];
const FORBIDDEN_SEMANTIC_PROPERTIES = new Set([
  'knowledge',
  'evidence',
  'knowledgeupdate',
  'coverage',
  'personknowledgematrix'
]);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyCanonicalEnumerableStringProperties(value) {
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

function isTechnicalPayload(value, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || ancestors.has(value) || !hasOnlyCanonicalEnumerableStringProperties(value)) return false;
  ancestors.add(value);
  let valid;
  if (Array.isArray(value)) {
    valid = Object.keys(value).length === value.length && value.every(item => isTechnicalPayload(item, ancestors));
  } else {
    valid = isPlainObject(value) && Object.keys(value).every(key =>
      !FORBIDDEN_SEMANTIC_PROPERTIES.has(key.toLowerCase()) && isTechnicalPayload(value[key], ancestors)
    );
  }
  ancestors.delete(value);
  return valid;
}

function isDeepFrozen(value, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return true;
  seen.add(value);
  return Object.isFrozen(value) && Reflect.ownKeys(value).every(key => isDeepFrozen(value[key], seen));
}

function validateKnowledgeAcquisitionProviderResult(result) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(result)) {
    return { valid: false, errors: ['KnowledgeAcquisitionProviderResult must be an object.'], warnings };
  }
  for (const property of TOP_LEVEL_PROPERTIES) {
    if (!(property in result)) errors.push(`Missing property: ${property}.`);
  }
  for (const property of Reflect.ownKeys(result)) {
    if (typeof property !== 'string') {
      errors.push('KnowledgeAcquisitionProviderResult symbol properties are not allowed.');
      continue;
    }
    if (!TOP_LEVEL_PROPERTIES.includes(property)) {
      errors.push(`knowledgeAcquisitionProviderResult.${property} is not allowed.`);
    } else {
      const descriptor = Object.getOwnPropertyDescriptor(result, property);
      if (!descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
        errors.push(`knowledgeAcquisitionProviderResult.${property} must be an enumerable data property.`);
      }
    }
  }
  if (result.resultVersion !== '1.0') errors.push('resultVersion is invalid.');
  if (result.type !== 'knowledge_acquisition_provider_result') errors.push('type is invalid.');
  if (result.status !== 'succeeded') errors.push('status is invalid.');
  if (typeof result.capabilityRef !== 'string' || result.capabilityRef.trim().length === 0) {
    errors.push('capabilityRef is invalid.');
  }
  if (!/^[a-f0-9]{64}$/.test(result.invocationInputFingerprint || '')) {
    errors.push('invocationInputFingerprint is invalid.');
  }
  if (!isTechnicalPayload(result.providerPayload)) {
    errors.push('providerPayload must be a serializable technical value.');
  }
  if (!isDeepFrozen(result)) errors.push('KnowledgeAcquisitionProviderResult must be deeply immutable.');
  if (!/^[a-f0-9]{64}$/.test(result.integrityFingerprint || '')) {
    errors.push('integrityFingerprint is invalid.');
  } else {
    try {
      if (result.integrityFingerprint !== calculateKnowledgeAcquisitionProviderResultFingerprint(result)) {
        errors.push('integrityFingerprint does not match the stable result integrity.');
      }
    } catch {
      errors.push('integrityFingerprint cannot be calculated.');
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionProviderResult };

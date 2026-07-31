const crypto = require('crypto');

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function calculateKnowledgeAcquisitionProviderResultFingerprint(result) {
  const canonical = {
    resultVersion: result.resultVersion,
    type: result.type,
    status: result.status,
    capabilityRef: result.capabilityRef,
    invocationInputFingerprint: result.invocationInputFingerprint,
    providerPayload: result.providerPayload
  };
  return crypto.createHash('sha256').update(stableStringify(canonical)).digest('hex');
}

module.exports = { calculateKnowledgeAcquisitionProviderResultFingerprint, stableStringify };

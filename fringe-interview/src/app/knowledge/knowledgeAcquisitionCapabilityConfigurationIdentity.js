const crypto = require('crypto');

function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (object(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function calculateKnowledgeAcquisitionCapabilityConfigurationId(configuration) {
  const { id, configurationVersion, type, ...semantic } = configuration;
  const fingerprint = crypto.createHash('sha256').update(stableStringify({ semantic, configurationVersion })).digest('hex').slice(0, 32);
  return `knowledgeAcquisitionCapabilityConfiguration_${fingerprint}`;
}

module.exports = { calculateKnowledgeAcquisitionCapabilityConfigurationId, stableStringify };

const crypto = require('crypto');

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (isObject(value)) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function compositionDesignSemantic(design) {
  const { id, compositionDesignVersion, type, ...semantic } = design;
  return semantic;
}

function calculateKnowledgeAcquisitionCapabilityCompositionDesignId(design) {
  const fingerprint = crypto.createHash('sha256')
    .update(stableStringify({
      semantic: compositionDesignSemantic(design),
      compositionDesignVersion: design.compositionDesignVersion,
    }))
    .digest('hex')
    .slice(0, 32);
  return `knowledgeAcquisitionCapabilityCompositionDesign_${fingerprint}`;
}

module.exports = {
  calculateKnowledgeAcquisitionCapabilityCompositionDesignId,
  stableStringify,
};

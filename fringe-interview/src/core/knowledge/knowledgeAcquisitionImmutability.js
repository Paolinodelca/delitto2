function deepFreezeKnowledgeAcquisitionArtifact(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreezeKnowledgeAcquisitionArtifact);
  }
  return value;
}

module.exports = { deepFreezeKnowledgeAcquisitionArtifact };

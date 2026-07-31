function validateStructuredInputKnowledgeAcquisitionProvider(provider) {
  const errors = [];
  const warnings = [];

  if (provider === null || typeof provider !== 'object' || Array.isArray(provider)) {
    errors.push('Structured Input Knowledge Acquisition Provider must be an object.');
  } else {
    const keys = Object.keys(provider);
    if (keys.length !== 1 || keys[0] !== 'acquireKnowledge') {
      errors.push('Structured Input Knowledge Acquisition Provider must expose only acquireKnowledge.');
    }
    if (typeof provider.acquireKnowledge !== 'function') {
      errors.push('Structured Input Knowledge Acquisition Provider acquireKnowledge must be callable.');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateStructuredInputKnowledgeAcquisitionProvider };

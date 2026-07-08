function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateEvidence(evidence = {}) {
  const errors = [];

  if (!isObject(evidence)) {
    return {
      isValid: false,
      errors: ["Evidence must be an object."],
    };
  }

  if (!evidence.id) {
    errors.push("id is required.");
  }

  if (!evidence.type) {
    errors.push("type is required.");
  }

  if (!evidence.content) {
    errors.push("content is required.");
  }

  if (!evidence.sourceId) {
    errors.push("sourceId is required.");
  }

  if (!evidence.extractedBy) {
    errors.push("extractedBy is required.");
  }

  if (!evidence.extractedAt) {
    errors.push("extractedAt is required.");
  }

  if (!isObject(evidence.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!evidence.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!evidence.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }

    if (!evidence.metadata.updatedAt) {
      errors.push("metadata.updatedAt is required.");
    }
  }

  if (!isObject(evidence.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateEvidence,
};
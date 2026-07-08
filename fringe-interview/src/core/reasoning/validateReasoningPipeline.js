function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateReasoningPipeline(reasoningPipeline = {}) {
  const errors = [];

  if (!isObject(reasoningPipeline)) {
    return {
      isValid: false,
      errors: ["ReasoningPipeline must be an object."],
    };
  }

  if (!reasoningPipeline.reasoningStatus) {
    errors.push("reasoningStatus is required.");
  }

  if (!isObject(reasoningPipeline.reasoningContext)) {
    errors.push("reasoningContext must be an object.");
  }

  if (!isObject(reasoningPipeline.representationGapReasoning)) {
    errors.push("representationGapReasoning must be an object.");
  }

  if (!isObject(reasoningPipeline.validation)) {
    errors.push("validation must be an object.");
  }

  if (!reasoningPipeline.status) {
    errors.push("status is required.");
  }

  if (!isObject(reasoningPipeline.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!reasoningPipeline.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!reasoningPipeline.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(reasoningPipeline.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateReasoningPipeline,
};
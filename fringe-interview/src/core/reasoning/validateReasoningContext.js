function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateReasoningContext(reasoningContext = {}) {
  const errors = [];

  if (!isObject(reasoningContext)) {
    return {
      isValid: false,
      errors: ["ReasoningContext must be an object."],
    };
  }

  if (!reasoningContext.reasoningStatus) {
    errors.push("reasoningStatus is required.");
  }

  if (!isObject(reasoningContext.inputs)) {
    errors.push("inputs must be an object.");
  } else {
    if (!reasoningContext.inputs.evidenceSummary) {
      errors.push("inputs.evidenceSummary is required.");
    }

    if (!reasoningContext.inputs.professionalIdentityModel) {
      errors.push("inputs.professionalIdentityModel is required.");
    }

    if (!reasoningContext.inputs.representationReadiness) {
      errors.push("inputs.representationReadiness is required.");
    }
  }

  if (!isObject(reasoningContext.reasoningScope)) {
    errors.push("reasoningScope must be an object.");
  }

  if (!isObject(reasoningContext.constraints)) {
    errors.push("constraints must be an object.");
  }

  if (!isObject(reasoningContext.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!reasoningContext.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!reasoningContext.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(reasoningContext.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateReasoningContext,
};
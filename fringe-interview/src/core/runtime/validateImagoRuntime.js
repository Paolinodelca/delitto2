function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateImagoRuntime(imagoRuntime = {}) {
  const errors = [];

  if (!isObject(imagoRuntime)) {
    return {
      isValid: false,
      errors: ["ImagoRuntime must be an object."],
    };
  }

  if (!imagoRuntime.runtimeStatus) {
    errors.push("runtimeStatus is required.");
  }

  if (!isObject(imagoRuntime.identityPipelineResult)) {
    errors.push("identityPipelineResult must be an object.");
  }

  if (!isObject(imagoRuntime.reasoningPipeline)) {
    errors.push("reasoningPipeline must be an object.");
  }

  if (!isObject(imagoRuntime.reasoningSummary)) {
    errors.push("reasoningSummary must be an object.");
  }

  if (!isObject(imagoRuntime.llmPayload)) {
    errors.push("llmPayload must be an object.");
  }

  if (!isObject(imagoRuntime.llmPromptMessages)) {
    errors.push("llmPromptMessages must be an object.");
  }

  if (!isObject(imagoRuntime.validation)) {
    errors.push("validation must be an object.");
  }

  if (!imagoRuntime.status) {
    errors.push("status is required.");
  }

  if (!isObject(imagoRuntime.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!imagoRuntime.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!imagoRuntime.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(imagoRuntime.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateImagoRuntime,
};
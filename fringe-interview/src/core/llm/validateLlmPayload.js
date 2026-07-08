function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateLlmPayload(llmPayload = {}) {
  const errors = [];

  if (!isObject(llmPayload)) {
    return {
      isValid: false,
      errors: ["LlmPayload must be an object."],
    };
  }

  if (!llmPayload.payloadStatus) {
    errors.push("payloadStatus is required.");
  }

  if (!isObject(llmPayload.task)) {
    errors.push("task must be an object.");
  } else {
    if (!llmPayload.task.type) {
      errors.push("task.type is required.");
    }

    if (!llmPayload.task.locale) {
      errors.push("task.locale is required.");
    }

    if (!llmPayload.task.outputMode) {
      errors.push("task.outputMode is required.");
    }
  }

  if (!isObject(llmPayload.inputs)) {
    errors.push("inputs must be an object.");
  }

  if (!isObject(llmPayload.constraints)) {
    errors.push("constraints must be an object.");
  }

  if (!isObject(llmPayload.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!llmPayload.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!llmPayload.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(llmPayload.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateLlmPayload,
};
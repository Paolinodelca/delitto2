function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateProfessionalIdentityModel(model = {}) {
  const errors = [];

  if (!isObject(model)) {
    return {
      isValid: false,
      errors: ["ProfessionalIdentityModel must be an object."],
    };
  }

  if (!model.modelStatus) {
    errors.push("modelStatus is required.");
  }

  if (!isObject(model.sourceDraft)) {
    errors.push("sourceDraft must be an object.");
  }

  if (!isObject(model.technicalProfile)) {
    errors.push("technicalProfile must be an object.");
  }

  if (!isObject(model.readiness)) {
    errors.push("readiness must be an object.");
  } else {
    if (typeof model.readiness.canGenerateNarrative !== "boolean") {
      errors.push("readiness.canGenerateNarrative must be a boolean.");
    }

    if (typeof model.readiness.canGenerateCV !== "boolean") {
      errors.push("readiness.canGenerateCV must be a boolean.");
    }

    if (typeof model.readiness.needsMoreEvidence !== "boolean") {
      errors.push("readiness.needsMoreEvidence must be a boolean.");
    }
  }

  if (!isObject(model.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!model.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!model.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(model.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateProfessionalIdentityModel,
};
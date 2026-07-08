function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateRepresentationStrategy(strategy = {}) {
  const errors = [];

  if (!isObject(strategy)) {
    return {
      isValid: false,
      errors: ["RepresentationStrategy must be an object."],
    };
  }

  if (!strategy.strategyStatus) {
    errors.push("strategyStatus is required.");
  }

  if (!strategy.representationType) {
    errors.push("representationType is required.");
  }

  if (!isObject(strategy.readiness)) {
    errors.push("readiness must be an object.");
  } else {
    if (typeof strategy.readiness.canGenerate !== "boolean") {
      errors.push("readiness.canGenerate must be a boolean.");
    }

    if (!Array.isArray(strategy.readiness.blockers)) {
      errors.push("readiness.blockers must be an array.");
    }

    if (!Array.isArray(strategy.readiness.warnings)) {
      errors.push("readiness.warnings must be an array.");
    }
  }

  if (!Array.isArray(strategy.requiredEvidenceAreas)) {
    errors.push("requiredEvidenceAreas must be an array.");
  }

  if (!Array.isArray(strategy.recommendedFocusAreas)) {
    errors.push("recommendedFocusAreas must be an array.");
  }

  if (!isObject(strategy.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!strategy.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!strategy.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(strategy.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRepresentationStrategy,
};
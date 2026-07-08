function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateRepresentationGapReasoning(representationGapReasoning = {}) {
  const errors = [];

  if (!isObject(representationGapReasoning)) {
    return {
      isValid: false,
      errors: ["RepresentationGapReasoning must be an object."],
    };
  }

  if (!representationGapReasoning.reasoningStatus) {
    errors.push("reasoningStatus is required.");
  }

  if (!isObject(representationGapReasoning.readiness)) {
    errors.push("readiness must be an object.");
  } else {
    if (typeof representationGapReasoning.readiness.canGenerate !== "boolean") {
      errors.push("readiness.canGenerate must be a boolean.");
    }

    if (typeof representationGapReasoning.readiness.blockerCount !== "number") {
      errors.push("readiness.blockerCount must be a number.");
    }

    if (typeof representationGapReasoning.readiness.warningCount !== "number") {
      errors.push("readiness.warningCount must be a number.");
    }
  }

  if (!isObject(representationGapReasoning.comparisonResult)) {
    errors.push("comparisonResult must be an object.");
  } else {
    if (!isObject(representationGapReasoning.comparisonResult.result)) {
      errors.push("comparisonResult.result must be an object.");
    }

    if (!isObject(representationGapReasoning.comparisonResult.metrics)) {
      errors.push("comparisonResult.metrics must be an object.");
    }
  }

  if (!isObject(representationGapReasoning.metrics)) {
    errors.push("metrics must be an object.");
  } else {
    if (typeof representationGapReasoning.metrics.coverageRatio !== "number") {
      errors.push("metrics.coverageRatio must be a number.");
    }

    if (
      typeof representationGapReasoning.metrics.weightedCoverageRatio !==
      "number"
    ) {
      errors.push("metrics.weightedCoverageRatio must be a number.");
    }

    if (typeof representationGapReasoning.metrics.matchedCount !== "number") {
      errors.push("metrics.matchedCount must be a number.");
    }

    if (typeof representationGapReasoning.metrics.missingCount !== "number") {
      errors.push("metrics.missingCount must be a number.");
    }
  }

  if (!Array.isArray(representationGapReasoning.gaps)) {
    errors.push("gaps must be an array.");
  }

  if (!Array.isArray(representationGapReasoning.opportunities)) {
    errors.push("opportunities must be an array.");
  }

  if (!Array.isArray(representationGapReasoning.priorities)) {
    errors.push("priorities must be an array.");
  }

  if (!isObject(representationGapReasoning.constraints)) {
    errors.push("constraints must be an object.");
  }

  if (!isObject(representationGapReasoning.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!representationGapReasoning.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!representationGapReasoning.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(representationGapReasoning.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRepresentationGapReasoning,
};
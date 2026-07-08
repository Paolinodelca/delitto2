function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateProfessionalVisibilityComparison(
  professionalVisibilityComparison = {}
) {
  const errors = [];

  if (!isObject(professionalVisibilityComparison)) {
    return {
      isValid: false,
      errors: ["ProfessionalVisibilityComparison must be an object."],
    };
  }

  if (!professionalVisibilityComparison.visibilityStatus) {
    errors.push("visibilityStatus is required.");
  }

  if (!Array.isArray(professionalVisibilityComparison.observedAreas)) {
    errors.push("observedAreas must be an array.");
  }

  if (!Array.isArray(professionalVisibilityComparison.targetAreas)) {
    errors.push("targetAreas must be an array.");
  }

  if (!isObject(professionalVisibilityComparison.comparisonResult)) {
    errors.push("comparisonResult must be an object.");
  }

  if (!isObject(professionalVisibilityComparison.visibilityMetrics)) {
    errors.push("visibilityMetrics must be an object.");
  } else {
    if (
      typeof professionalVisibilityComparison.visibilityMetrics.coverageRatio !==
      "number"
    ) {
      errors.push("visibilityMetrics.coverageRatio must be a number.");
    }

    if (
      typeof professionalVisibilityComparison.visibilityMetrics
        .weightedCoverageRatio !== "number"
    ) {
      errors.push(
        "visibilityMetrics.weightedCoverageRatio must be a number."
      );
    }
  }

  if (!isObject(professionalVisibilityComparison.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!professionalVisibilityComparison.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!professionalVisibilityComparison.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(professionalVisibilityComparison.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateProfessionalVisibilityComparison,
};
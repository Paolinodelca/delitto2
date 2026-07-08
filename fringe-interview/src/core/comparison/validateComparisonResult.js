function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateComparisonResult(comparisonResult = {}) {
  const errors = [];

  if (!isObject(comparisonResult)) {
    return {
      isValid: false,
      errors: ["ComparisonResult must be an object."],
    };
  }

  if (!comparisonResult.comparisonStatus) {
    errors.push("comparisonStatus is required.");
  }

  if (!comparisonResult.policyId) {
    errors.push("policyId is required.");
  }

  if (!isObject(comparisonResult.policy)) {
    errors.push("policy must be an object.");
  } else if (!comparisonResult.policy.policyId) {
    errors.push("policy.policyId is required.");
  }

  if (!isObject(comparisonResult.inputs)) {
    errors.push("inputs must be an object.");
  }

  if (!isObject(comparisonResult.result)) {
    errors.push("result must be an object.");
  } else {
    if (!Array.isArray(comparisonResult.result.matched)) {
      errors.push("result.matched must be an array.");
    }

    if (!Array.isArray(comparisonResult.result.missing)) {
      errors.push("result.missing must be an array.");
    }

    if (!Array.isArray(comparisonResult.result.unexpected)) {
      errors.push("result.unexpected must be an array.");
    }

    if (!Array.isArray(comparisonResult.result.differences)) {
      errors.push("result.differences must be an array.");
    }
  }

  if (!isObject(comparisonResult.metrics)) {
    errors.push("metrics must be an object.");
  } else {
    if (typeof comparisonResult.metrics.coverageRatio !== "number") {
      errors.push("metrics.coverageRatio must be a number.");
    }

    if (
      typeof comparisonResult.metrics.weightedReferenceTotal !== "number"
    ) {
      errors.push("metrics.weightedReferenceTotal must be a number.");
    }

    if (typeof comparisonResult.metrics.weightedMatchedTotal !== "number") {
      errors.push("metrics.weightedMatchedTotal must be a number.");
    }

    if (typeof comparisonResult.metrics.weightedCoverageRatio !== "number") {
      errors.push("metrics.weightedCoverageRatio must be a number.");
    }
  }

  if (!isObject(comparisonResult.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!comparisonResult.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!comparisonResult.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(comparisonResult.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateComparisonResult,
};
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateComparisonPolicy(policy = {}) {
  const errors = [];

  if (!isObject(policy)) {
    return {
      isValid: false,
      errors: ["ComparisonPolicy must be an object."],
    };
  }

  if (!policy.policyId) {
    errors.push("policyId is required.");
  }

  if (!policy.label) {
    errors.push("label is required.");
  }

  if (!Array.isArray(policy.dimensions)) {
    errors.push("dimensions must be an array.");
  }

  if (!isObject(policy.matching)) {
    errors.push("matching must be an object.");
  } else {
    if (!policy.matching.mode) {
      errors.push("matching.mode is required.");
    }
  }

  if (!isObject(policy.scoring)) {
    errors.push("scoring must be an object.");
  }

  if (!isObject(policy.weights)) {
    errors.push("weights must be an object.");
  } else {
    if (typeof policy.weights.default !== "number") {
      errors.push("weights.default must be a number.");
    }

    if (!isObject(policy.weights.byValue)) {
      errors.push("weights.byValue must be an object.");
    }
  }

  if (!isObject(policy.resultMapping)) {
    errors.push("resultMapping must be an object.");
  }

  if (!isObject(policy.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!policy.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!policy.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(policy.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateComparisonPolicy,
};
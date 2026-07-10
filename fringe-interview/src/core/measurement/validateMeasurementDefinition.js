function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateMeasurementDefinition(definition = {}) {
  const errors = [];

  if (!isObject(definition)) {
    return {
      isValid: false,
      errors: ["MeasurementDefinition must be an object."],
    };
  }

  if (!definition.dimensionId) {
    errors.push("dimensionId is required.");
  }

  if (!definition.label) {
    errors.push("label is required.");
  }

  if (!Array.isArray(definition.inputSignals)) {
    errors.push("inputSignals must be an array.");
  }

  if (!isObject(definition.scale)) {
    errors.push("scale must be an object.");
  } else {
    if (typeof definition.scale.minimum !== "number") {
      errors.push("scale.minimum must be a number.");
    }

    if (typeof definition.scale.maximum !== "number") {
      errors.push("scale.maximum must be a number.");
    }
  }

  if (!isObject(definition.benchmark)) {
    errors.push("benchmark must be an object.");
  } else {
    if (!definition.benchmark.benchmarkId) {
      errors.push("benchmark.benchmarkId is required.");
    }

    if (!isObject(definition.benchmark.reference)) {
      errors.push("benchmark.reference must be an object.");
    }
  }

  if (!isObject(definition.aggregation)) {
    errors.push("aggregation must be an object.");
  } else {
    if (!definition.aggregation.mode) {
      errors.push("aggregation.mode is required.");
    }

    if (!isObject(definition.aggregation.weights)) {
      errors.push("aggregation.weights must be an object.");
    }
  }

  if (!isObject(definition.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!definition.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!definition.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(definition.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateMeasurementDefinition,
};
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateMeasurementFactorDefinition(definition = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(definition)) {
    return {
      isValid: false,
      errors: ["MeasurementFactorDefinition must be an object."],
      warnings: [],
    };
  }

  if (
    typeof definition.factorId !== "string" ||
    definition.factorId.trim().length === 0
  ) {
    errors.push("factorId must be a non-empty string.");
  }

  if (
    typeof definition.label !== "string" ||
    definition.label.trim().length === 0
  ) {
    errors.push("label must be a non-empty string.");
  }

  if (!Array.isArray(definition.supportedDimensions)) {
    errors.push("supportedDimensions must be an array.");
  }

  if (
    definition.inputField !== null &&
    typeof definition.inputField !== "string"
  ) {
    errors.push("inputField must be a string or null.");
  }

  if (
    typeof definition.valueType !== "string" ||
    definition.valueType.trim().length === 0
  ) {
    errors.push("valueType must be a non-empty string.");
  }

  if (!isObject(definition.scoring)) {
    errors.push("scoring must be an object.");
  } else {
    if (
      typeof definition.scoring.strategy !== "string" ||
      definition.scoring.strategy.trim().length === 0
    ) {
      errors.push("scoring.strategy must be a non-empty string.");
    }

    if (!isObject(definition.scoring.parameters)) {
      errors.push("scoring.parameters must be an object.");
    }
  }

  if (
    typeof definition.defaultWeight !== "number" ||
    !Number.isFinite(definition.defaultWeight) ||
    definition.defaultWeight < 0
  ) {
    errors.push("defaultWeight must be a non-negative number.");
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

  if (definition.label === "Unknown Measurement Factor") {
    warnings.push("Factor definition is unknown.");
  }

  if (
    definition.scoring &&
    definition.scoring.strategy === "unsupported"
  ) {
    warnings.push("Factor scoring strategy is unsupported.");
  }

  if (
    Array.isArray(definition.supportedDimensions) &&
    definition.supportedDimensions.length === 0
  ) {
    warnings.push("supportedDimensions is empty.");
  }

  if (definition.defaultWeight === 0) {
    warnings.push("defaultWeight is 0.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateMeasurementFactorDefinition,
};
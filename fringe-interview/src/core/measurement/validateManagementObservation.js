const ALLOWED_RESPONSIBILITY_TYPES = [
  "direct",
  "shared",
  "indirect",
  "unknown",
];

const ALLOWED_MANAGEMENT_LAYERS = [
  "multi_layer",
  "single_layer",
  "unknown",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateManagementObservation(observation = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(observation)) {
    return {
      isValid: false,
      errors: ["ManagementObservation must be an object."],
      warnings: [],
    };
  }

  if (
    typeof observation.observationId !== "string" ||
    observation.observationId.trim().length === 0
  ) {
    errors.push("observationId must be a non-empty string.");
  }

  if (observation.observationType !== "management_scope") {
    errors.push(
      'observationType must be "management_scope".'
    );
  }

  if (
    typeof observation.teamSize !== "number" ||
    !Number.isFinite(observation.teamSize) ||
    observation.teamSize < 0
  ) {
    errors.push("teamSize must be a non-negative number.");
  }

  if (
    typeof observation.durationYears !== "number" ||
    !Number.isFinite(observation.durationYears) ||
    observation.durationYears < 0
  ) {
    errors.push(
      "durationYears must be a non-negative number."
    );
  }

  if (
    !ALLOWED_RESPONSIBILITY_TYPES.includes(
      observation.responsibilityType
    )
  ) {
    errors.push("responsibilityType is not allowed.");
  }

  if (
    !ALLOWED_MANAGEMENT_LAYERS.includes(
      observation.managementLayer
    )
  ) {
    errors.push("managementLayer is not allowed.");
  }

  if (typeof observation.contextType !== "string") {
    errors.push("contextType must be a string.");
  }

  if (!Array.isArray(observation.evidenceIds)) {
    errors.push("evidenceIds must be an array.");
  }

  if (
    typeof observation.confidence !== "number" ||
    !Number.isFinite(observation.confidence) ||
    observation.confidence < 0 ||
    observation.confidence > 1
  ) {
    errors.push(
      "confidence must be a number between 0 and 1."
    );
  }

  if (!isObject(observation.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!observation.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!observation.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(observation.extensions)) {
    errors.push("extensions must be an object.");
  }

  if (observation.teamSize === 0) {
    warnings.push("teamSize is 0.");
  }

  if (observation.durationYears === 0) {
    warnings.push("durationYears is 0.");
  }

  if (observation.responsibilityType === "unknown") {
    warnings.push("responsibilityType is unknown.");
  }

  if (observation.managementLayer === "unknown") {
    warnings.push("managementLayer is unknown.");
  }

  if (observation.contextType === "unknown") {
    warnings.push("contextType is unknown.");
  }

  if (
    Array.isArray(observation.evidenceIds) &&
    observation.evidenceIds.length === 0
  ) {
    warnings.push("evidenceIds is empty.");
  }

  if (
    typeof observation.confidence === "number" &&
    observation.confidence < 0.5
  ) {
    warnings.push("confidence is below 0.5.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateManagementObservation,
};
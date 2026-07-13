const ALLOWED_DIRECTIONS = [
  "supporting",
  "contradicting",
  "neutral",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isUnitIntervalNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

function validateCapabilityContribution(contribution = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(contribution)) {
    return {
      isValid: false,
      errors: ["CapabilityContribution must be an object."],
      warnings: [],
    };
  }

  if (!isValidString(contribution.contributionId)) {
    errors.push(
      "contributionId must be a non-empty string."
    );
  }

  if (contribution.contributionStatus !== "draft") {
    errors.push(
      'contributionStatus must be "draft".'
    );
  }

  if (!isValidString(contribution.capabilityId)) {
    errors.push(
      "capabilityId must be a non-empty string."
    );
  }

  if (!isObject(contribution.source)) {
    errors.push("source must be an object.");
  } else {
    if (contribution.source.type !== "measure_result") {
      errors.push(
        'source.type must be "measure_result".'
      );
    }

    if (!isValidString(contribution.source.measureId)) {
      errors.push(
        "source.measureId must be a non-empty string."
      );
    }

    if (
      !isUnitIntervalNumber(
        contribution.source.measureValue
      )
    ) {
      errors.push(
        "source.measureValue must be a number between 0 and 1."
      );
    }
  }

  if (!ALLOWED_DIRECTIONS.includes(contribution.direction)) {
    errors.push(
      "direction must be supporting, contradicting, or neutral."
    );
  }

  if (!isObject(contribution.strength)) {
    errors.push("strength must be an object.");
  } else {
    if (
      !isUnitIntervalNumber(
        contribution.strength.rawValue
      )
    ) {
      errors.push(
        "strength.rawValue must be a number between 0 and 1."
      );
    }

    if (
      !isUnitIntervalNumber(
        contribution.strength.relevance
      )
    ) {
      errors.push(
        "strength.relevance must be a number between 0 and 1."
      );
    }

    if (
      !isUnitIntervalNumber(
        contribution.strength.contributionValue
      )
    ) {
      errors.push(
        "strength.contributionValue must be a number between 0 and 1."
      );
    }
  }

  if (
    !isUnitIntervalNumber(
      contribution.inferenceSupport
    )
  ) {
    errors.push(
      "inferenceSupport must be a number between 0 and 1."
    );
  }

  if (!isObject(contribution.context)) {
    errors.push("context must be an object.");
  } else {
    if (
      contribution.context.contextType !== null &&
      typeof contribution.context.contextType !== "string"
    ) {
      errors.push(
        "context.contextType must be a string or null."
      );
    }

    if (
      contribution.context.targetContextType !== null &&
      typeof contribution.context.targetContextType !== "string"
    ) {
      errors.push(
        "context.targetContextType must be a string or null."
      );
    }
  }

  if (!Array.isArray(contribution.evidenceIds)) {
    errors.push("evidenceIds must be an array.");
  }

  if (!Array.isArray(contribution.limitations)) {
    errors.push("limitations must be an array.");
  }

  if (!isObject(contribution.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!contribution.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!contribution.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(contribution.extensions)) {
    errors.push("extensions must be an object.");
  }

  if (contribution.direction === "neutral") {
    warnings.push("Contribution direction is neutral.");
  }

  if (
    isObject(contribution.strength) &&
    contribution.strength.contributionValue === 0
  ) {
    warnings.push("Contribution value is 0.");
  }

  if (
    typeof contribution.inferenceSupport === "number" &&
    contribution.inferenceSupport < 0.5
  ) {
    warnings.push(
      "Contribution inference support is below 0.5."
    );
  }

  if (
    Array.isArray(contribution.evidenceIds) &&
    contribution.evidenceIds.length === 0
  ) {
    warnings.push(
      "Contribution has no linked evidence."
    );
  }

  if (contribution.rationale === null) {
    warnings.push("Contribution rationale is missing.");
  }

  if (
    isObject(contribution.context) &&
    contribution.context.contextType === null &&
    contribution.context.targetContextType === null
  ) {
    warnings.push(
      "Contribution context is not specified."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateCapabilityContribution,
};
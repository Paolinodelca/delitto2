const ALLOWED_RESULT_STATUSES = [
  "draft",
  "partial",
  "insufficient_evidence",
  "invalid",
];

const ALLOWED_CAPABILITY_BANDS = [
  "not_supported",
  "weak",
  "moderate",
  "strong",
  "very_strong",
];

const ALLOWED_MANIFESTATION_STATUSES = [
  "not_observed",
  "weakly_observed",
  "partially_observed",
  "observed",
  "strongly_observed",
];

const ALLOWED_INFERENCE_BANDS = [
  "none",
  "low",
  "moderate",
  "high",
  "very_high",
];

const ALLOWED_DIRECTIONS = [
  "supporting",
  "contradicting",
  "neutral",
];

const ALLOWED_DOMINANT_DIRECTIONS = [
  "supporting",
  "contradicting",
  "balanced",
  "none",
];

const ALLOWED_REQUIREMENT_TYPES = [
  "required",
  "optional",
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

function isSignedUnitIntervalNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -1 &&
    value <= 1
  );
}

function isNonNegativeFiniteNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function validateContributionItem(
  item,
  path,
  errors
) {
  if (!isObject(item)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isValidString(item.contributionId)) {
    errors.push(
      `${path}.contributionId must be a non-empty string.`
    );
  }

  if (!isValidString(item.contributionKey)) {
    errors.push(
      `${path}.contributionKey must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_REQUIREMENT_TYPES.includes(
      item.requirementType
    )
  ) {
    errors.push(
      `${path}.requirementType is invalid.`
    );
  }

  if (!isValidString(item.sourceMeasureId)) {
    errors.push(
      `${path}.sourceMeasureId must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_DIRECTIONS.includes(
      item.direction
    )
  ) {
    errors.push(
      `${path}.direction is invalid.`
    );
  }

  if (
    !isUnitIntervalNumber(
      item.contributionValue
    )
  ) {
    errors.push(
      `${path}.contributionValue must be between 0 and 1.`
    );
  }

  if (
    !isUnitIntervalNumber(
      item.inferenceSupport
    )
  ) {
    errors.push(
      `${path}.inferenceSupport must be between 0 and 1.`
    );
  }

  if (
    !isNonNegativeFiniteNumber(
      item.effectiveWeight
    )
  ) {
    errors.push(
      `${path}.effectiveWeight must be a non-negative number.`
    );
  }

  if (
    !isSignedUnitIntervalNumber(
      item.weightedContributionValue
    )
  ) {
    errors.push(
      `${path}.weightedContributionValue must be between -1 and 1.`
    );
  }

  if (
    !isUnitIntervalNumber(
      item.weightedInferenceSupport
    )
  ) {
    errors.push(
      `${path}.weightedInferenceSupport must be between 0 and 1.`
    );
  }
}

function validateContributionSection(
  contributions,
  errors
) {
  if (!isObject(contributions)) {
    errors.push(
      "contributions must be an object."
    );
    return;
  }

  [
    "used",
    "supporting",
    "contradicting",
    "neutral",
  ].forEach((field) => {
    if (!Array.isArray(contributions[field])) {
      errors.push(
        `contributions.${field} must be an array.`
      );
      return;
    }

    contributions[field].forEach(
      (item, index) => {
        validateContributionItem(
          item,
          `contributions.${field}[${index}]`,
          errors
        );
      }
    );
  });
}

function validateRequirements(
  requirements,
  errors
) {
  if (!isObject(requirements)) {
    errors.push(
      "requirements must be an object."
    );
    return;
  }

  [
    "satisfied",
    "partiallySatisfied",
    "missing",
    "incompatible",
    "excluded",
  ].forEach((field) => {
    if (!Array.isArray(requirements[field])) {
      errors.push(
        `requirements.${field} must be an array.`
      );
    }
  });
}

function validateCapabilityResult(result = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(result)) {
    return {
      isValid: false,
      errors: [
        "CapabilityResult must be an object.",
      ],
      warnings: [],
    };
  }

  if (
    !ALLOWED_RESULT_STATUSES.includes(
      result.resultStatus
    )
  ) {
    errors.push(
      "resultStatus is invalid."
    );
  }

  if (!isValidString(result.capabilityId)) {
    errors.push(
      "capabilityId must be a non-empty string."
    );
  }

  if (!isObject(result.strength)) {
    errors.push(
      "strength must be an object."
    );
  } else {
    [
      "net",
      "supporting",
      "contradicting",
      "absoluteSupport",
    ].forEach((field) => {
      if (
        !isUnitIntervalNumber(
          result.strength[field]
        )
      ) {
        errors.push(
          `strength.${field} must be between 0 and 1.`
        );
      }
    });
  }

  if (!isObject(result.inferenceSupport)) {
    errors.push(
      "inferenceSupport must be an object."
    );
  } else {
    if (
      !isUnitIntervalNumber(
        result.inferenceSupport.value
      )
    ) {
      errors.push(
        "inferenceSupport.value must be between 0 and 1."
      );
    }

    if (
      !ALLOWED_INFERENCE_BANDS.includes(
        result.inferenceSupport.band
      )
    ) {
      errors.push(
        "inferenceSupport.band is invalid."
      );
    }
  }

  if (!isObject(result.coverage)) {
    errors.push(
      "coverage must be an object."
    );
  } else {
    [
      "required",
      "optional",
      "total",
    ].forEach((field) => {
      if (
        !isUnitIntervalNumber(
          result.coverage[field]
        )
      ) {
        errors.push(
          `coverage.${field} must be between 0 and 1.`
        );
      }
    });

    if (
      typeof result.coverage.sufficient !==
      "boolean"
    ) {
      errors.push(
        "coverage.sufficient must be a boolean."
      );
    }
  }

  if (
    !ALLOWED_CAPABILITY_BANDS.includes(
      result.capabilityBand
    )
  ) {
    errors.push(
      "capabilityBand is invalid."
    );
  }

  if (
    !ALLOWED_MANIFESTATION_STATUSES.includes(
      result.manifestationStatus
    )
  ) {
    errors.push(
      "manifestationStatus is invalid."
    );
  }

  validateContributionSection(
    result.contributions,
    errors
  );

  validateRequirements(
    result.requirements,
    errors
  );

  if (!Array.isArray(result.evidenceIds)) {
    errors.push(
      "evidenceIds must be an array."
    );
  }

  if (!isObject(result.explainability)) {
    errors.push(
      "explainability must be an object."
    );
  } else {
    if (
      result.explainability
        .strongestSupportingContributionId !==
        null &&
      !isValidString(
        result.explainability
          .strongestSupportingContributionId
      )
    ) {
      errors.push(
        "explainability.strongestSupportingContributionId must be a string or null."
      );
    }

    if (
      result.explainability
        .strongestContradictingContributionId !==
        null &&
      !isValidString(
        result.explainability
          .strongestContradictingContributionId
      )
    ) {
      errors.push(
        "explainability.strongestContradictingContributionId must be a string or null."
      );
    }

    if (
      !ALLOWED_DOMINANT_DIRECTIONS.includes(
        result.explainability
          .dominantDirection
      )
    ) {
      errors.push(
        "explainability.dominantDirection is invalid."
      );
    }

    if (
      !Array.isArray(
        result.explainability.notes
      )
    ) {
      errors.push(
        "explainability.notes must be an array."
      );
    }
  }

  if (!Array.isArray(result.limitations)) {
    errors.push(
      "limitations must be an array."
    );
  }

  if (!isObject(result.metadata)) {
    errors.push(
      "metadata must be an object."
    );
  } else {
    if (!result.metadata.version) {
      errors.push(
        "metadata.version is required."
      );
    }

    if (!result.metadata.createdAt) {
      errors.push(
        "metadata.createdAt is required."
      );
    }
  }

  if (!isObject(result.extensions)) {
    errors.push(
      "extensions must be an object."
    );
  }

  if (result.resultStatus !== "draft") {
    warnings.push(
      "Capability result is not complete."
    );
  }

  if (
    result.capabilityBand ===
    "not_supported"
  ) {
    warnings.push(
      "Capability is not supported."
    );
  }

  if (
    result.manifestationStatus ===
    "not_observed"
  ) {
    warnings.push(
      "Capability manifestation was not observed."
    );
  }

  if (
    isObject(result.coverage) &&
    result.coverage.sufficient === false
  ) {
    warnings.push(
      "Capability coverage is insufficient."
    );
  }

  if (
    isObject(result.inferenceSupport) &&
    typeof result.inferenceSupport.value ===
      "number" &&
    result.inferenceSupport.value < 0.5
  ) {
    warnings.push(
      "Capability inference support is limited."
    );
  }

  if (
    isObject(result.contributions) &&
    Array.isArray(
      result.contributions.contradicting
    ) &&
    result.contributions.contradicting.length > 0
  ) {
    warnings.push(
      "Contradicting contributions are present."
    );
  }

  if (
    isObject(result.requirements)
  ) {
    if (
      Array.isArray(
        result.requirements
          .partiallySatisfied
      ) &&
      result.requirements
        .partiallySatisfied.length > 0
    ) {
      warnings.push(
        "Partially satisfied requirements are present."
      );
    }

    if (
      Array.isArray(
        result.requirements.missing
      ) &&
      result.requirements.missing.length > 0
    ) {
      warnings.push(
        "Missing requirements are present."
      );
    }

    if (
      Array.isArray(
        result.requirements.incompatible
      ) &&
      result.requirements.incompatible.length > 0
    ) {
      warnings.push(
        "Incompatible requirements are present."
      );
    }

    if (
      Array.isArray(
        result.requirements.excluded
      ) &&
      result.requirements.excluded.length > 0
    ) {
      warnings.push(
        "Excluded requirements are present."
      );
    }
  }

  if (
    Array.isArray(result.limitations) &&
    result.limitations.length > 0
  ) {
    warnings.push(
      "Capability result limitations are present."
    );
  }

  if (
    Array.isArray(result.evidenceIds) &&
    result.evidenceIds.length === 0
  ) {
    warnings.push(
      "Capability result has no evidence."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateCapabilityResult,
};
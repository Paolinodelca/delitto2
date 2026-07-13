const ALLOWED_REQUIREMENT_TYPES = [
  "required",
  "optional",
];

const ALLOWED_ENTRY_STATUSES = [
  "satisfied",
  "partially_satisfied",
];

const ALLOWED_DIRECTIONS = [
  "supporting",
  "contradicting",
  "neutral",
];

const ALLOWED_EXCLUDED_REASONS = [
  "missing",
  "incompatible",
  "partial_not_allowed",
  "best_contribution_not_found",
  "invalid_contribution",
];

const ALLOWED_EXCLUDED_STATUSES = [
  "satisfied",
  "partially_satisfied",
  "missing",
  "incompatible",
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

function isNonNegativeInteger(value) {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
}

function validateAggregationEntry(
  entry,
  path,
  errors
) {
  if (!isObject(entry)) {
    errors.push(
      `${path} must be an object.`
    );
    return;
  }

  if (!isValidString(entry.contributionKey)) {
    errors.push(
      `${path}.contributionKey must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_REQUIREMENT_TYPES.includes(
      entry.requirementType
    )
  ) {
    errors.push(
      `${path}.requirementType is invalid.`
    );
  }

  if (!isValidString(entry.sourceMeasureId)) {
    errors.push(
      `${path}.sourceMeasureId must be a non-empty string.`
    );
  }

  if (
    !isNonNegativeFiniteNumber(
      entry.requirementWeight
    )
  ) {
    errors.push(
      `${path}.requirementWeight must be a non-negative number.`
    );
  }

  if (
    !isNonNegativeFiniteNumber(
      entry.effectiveWeight
    )
  ) {
    errors.push(
      `${path}.effectiveWeight must be a non-negative number.`
    );
  }

  if (
    entry.minimumContribution !==
      null &&
    !isUnitIntervalNumber(
      entry.minimumContribution
    )
  ) {
    errors.push(
      `${path}.minimumContribution must be between 0 and 1 or null.`
    );
  }

  if (
    !ALLOWED_ENTRY_STATUSES.includes(
      entry.matchStatus
    )
  ) {
    errors.push(
      `${path}.matchStatus is invalid.`
    );
  }

  if (!isValidString(entry.contributionId)) {
    errors.push(
      `${path}.contributionId must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_DIRECTIONS.includes(
      entry.direction
    )
  ) {
    errors.push(
      `${path}.direction is invalid.`
    );
  }

  if (
    !isUnitIntervalNumber(
      entry.contributionValue
    )
  ) {
    errors.push(
      `${path}.contributionValue must be between 0 and 1.`
    );
  }

  if (
    !isUnitIntervalNumber(
      entry.inferenceSupport
    )
  ) {
    errors.push(
      `${path}.inferenceSupport must be between 0 and 1.`
    );
  }

  if (
    !isSignedUnitIntervalNumber(
      entry.signedContributionValue
    )
  ) {
    errors.push(
      `${path}.signedContributionValue must be between -1 and 1.`
    );
  }

  if (
    !isSignedUnitIntervalNumber(
      entry.weightedContributionValue
    )
  ) {
    errors.push(
      `${path}.weightedContributionValue must be between -1 and 1.`
    );
  }

  if (
    !isUnitIntervalNumber(
      entry.weightedInferenceSupport
    )
  ) {
    errors.push(
      `${path}.weightedInferenceSupport must be between 0 and 1.`
    );
  }

  if (!Array.isArray(entry.evidenceIds)) {
    errors.push(
      `${path}.evidenceIds must be an array.`
    );
  }

  if (!isObject(entry.context)) {
    errors.push(
      `${path}.context must be an object.`
    );
  }

  if (!Array.isArray(entry.limitations)) {
    errors.push(
      `${path}.limitations must be an array.`
    );
  }
}

function validateExcludedRequirement(
  excludedRequirement,
  path,
  errors
) {
  if (!isObject(excludedRequirement)) {
    errors.push(
      `${path} must be an object.`
    );
    return;
  }

  if (
    !isValidString(
      excludedRequirement.contributionKey
    )
  ) {
    errors.push(
      `${path}.contributionKey must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_REQUIREMENT_TYPES.includes(
      excludedRequirement.requirementType
    )
  ) {
    errors.push(
      `${path}.requirementType is invalid.`
    );
  }

  if (
    !isValidString(
      excludedRequirement.sourceMeasureId
    )
  ) {
    errors.push(
      `${path}.sourceMeasureId must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_EXCLUDED_STATUSES.includes(
      excludedRequirement.status
    )
  ) {
    errors.push(
      `${path}.status is invalid.`
    );
  }

  if (
    !ALLOWED_EXCLUDED_REASONS.includes(
      excludedRequirement.reason
    )
  ) {
    errors.push(
      `${path}.reason is invalid.`
    );
  }
}

function validateCoverage(coverage, errors) {
  if (!isObject(coverage)) {
    errors.push(
      "coverage must be an object."
    );
    return;
  }

  [
    "required",
    "optional",
    "total",
  ].forEach((field) => {
    if (
      !isUnitIntervalNumber(
        coverage[field]
      )
    ) {
      errors.push(
        `coverage.${field} must be between 0 and 1.`
      );
    }
  });

  [
    "requiredSatisfied",
    "requiredTotal",
    "optionalSatisfied",
    "optionalTotal",
  ].forEach((field) => {
    if (
      !isNonNegativeInteger(
        coverage[field]
      )
    ) {
      errors.push(
        `coverage.${field} must be a non-negative integer.`
      );
    }
  });
}

function validatePreparation(
  preparation,
  errors
) {
  if (!isObject(preparation)) {
    errors.push(
      "preparation must be an object."
    );
    return;
  }

  [
    "declaredWeightTotal",
    "availableWeightTotal",
    "effectiveWeightTotal",
  ].forEach((field) => {
    if (
      !isNonNegativeFiniteNumber(
        preparation[field]
      )
    ) {
      errors.push(
        `preparation.${field} must be a non-negative finite number.`
      );
    }
  });

  [
    "supportingEntryCount",
    "contradictingEntryCount",
    "neutralEntryCount",
    "excludedRequirementCount",
  ].forEach((field) => {
    if (
      !isNonNegativeInteger(
        preparation[field]
      )
    ) {
      errors.push(
        `preparation.${field} must be a non-negative integer.`
      );
    }
  });
}

function validateCapabilityAggregationContext(
  context = {}
) {
  const errors = [];
  const warnings = [];

  if (!isObject(context)) {
    return {
      isValid: false,
      errors: [
        "CapabilityAggregationContext must be an object.",
      ],
      warnings: [],
    };
  }

  if (context.contextStatus !== "draft") {
    errors.push(
      'contextStatus must be "draft".'
    );
  }

  if (!isValidString(context.capabilityId)) {
    errors.push(
      "capabilityId must be a non-empty string."
    );
  }

  if (
    context.aggregationStrategy !==
    "weighted_contribution_balance"
  ) {
    errors.push(
      'aggregationStrategy must be "weighted_contribution_balance".'
    );
  }

  if (
    typeof context.normalizeWeights !==
    "boolean"
  ) {
    errors.push(
      "normalizeWeights must be a boolean."
    );
  }

  if (!Array.isArray(context.entries)) {
    errors.push(
      "entries must be an array."
    );
  } else {
    context.entries.forEach(
      (entry, index) => {
        validateAggregationEntry(
          entry,
          `entries[${index}]`,
          errors
        );
      }
    );
  }

  if (
    !Array.isArray(
      context.supportingEntries
    )
  ) {
    errors.push(
      "supportingEntries must be an array."
    );
  }

  if (
    !Array.isArray(
      context.contradictingEntries
    )
  ) {
    errors.push(
      "contradictingEntries must be an array."
    );
  }

  if (
    !Array.isArray(
      context.neutralEntries
    )
  ) {
    errors.push(
      "neutralEntries must be an array."
    );
  }

  if (
    !Array.isArray(
      context.excludedRequirements
    )
  ) {
    errors.push(
      "excludedRequirements must be an array."
    );
  } else {
    context.excludedRequirements.forEach(
      (excludedRequirement, index) => {
        validateExcludedRequirement(
          excludedRequirement,
          `excludedRequirements[${index}]`,
          errors
        );
      }
    );
  }

  validateCoverage(
    context.coverage,
    errors
  );

  validatePreparation(
    context.preparation,
    errors
  );

  if (
    !Array.isArray(
      context.sourceContributionIds
    )
  ) {
    errors.push(
      "sourceContributionIds must be an array."
    );
  }

  if (!Array.isArray(context.limitations)) {
    errors.push(
      "limitations must be an array."
    );
  }

  if (!isObject(context.metadata)) {
    errors.push(
      "metadata must be an object."
    );
  } else {
    if (!context.metadata.version) {
      errors.push(
        "metadata.version is required."
      );
    }

    if (!context.metadata.createdAt) {
      errors.push(
        "metadata.createdAt is required."
      );
    }
  }

  if (!isObject(context.extensions)) {
    errors.push(
      "extensions must be an object."
    );
  }

  /*
   * Un context costruito da definition o match invalidi
   * deve risultare invalido anche se la sua forma esterna
   * è strutturalmente completa.
   */
  const inputValidation =
    isObject(context.extensions)
      ? context.extensions.inputValidation
      : null;

  if (
    isObject(inputValidation) &&
    inputValidation.definition &&
    inputValidation.definition.isValid !== true
  ) {
    errors.push(
      "Input CapabilityDefinition validation failed."
    );
  }

  if (
    isObject(inputValidation) &&
    inputValidation.match &&
    inputValidation.match.isValid !== true
  ) {
    errors.push(
      "Input CapabilityContributionMatch validation failed."
    );
  }

  if (
    Array.isArray(context.entries) &&
    context.entries.length === 0
  ) {
    warnings.push(
      "No aggregation entries are available."
    );
  }

  if (
    Array.isArray(
      context.supportingEntries
    ) &&
    context.supportingEntries.length === 0
  ) {
    warnings.push(
      "supportingEntries is empty."
    );
  }

  if (
    Array.isArray(
      context.contradictingEntries
    ) &&
    context.contradictingEntries.length > 0
  ) {
    warnings.push(
      "Contradicting aggregation entries are present."
    );
  }

  if (
    Array.isArray(
      context.neutralEntries
    ) &&
    context.neutralEntries.length > 0
  ) {
    warnings.push(
      "Neutral aggregation entries are present."
    );
  }

  if (
    Array.isArray(
      context.excludedRequirements
    ) &&
    context.excludedRequirements.length > 0
  ) {
    warnings.push(
      "Excluded capability requirements are present."
    );
  }

  if (
    isObject(context.coverage) &&
    typeof context.coverage.required ===
      "number" &&
    context.coverage.required < 1
  ) {
    warnings.push(
      "Required coverage is below 1."
    );
  }

  if (
    isObject(context.coverage) &&
    typeof context.coverage.total ===
      "number" &&
    context.coverage.total < 1
  ) {
    warnings.push(
      "Total coverage is below 1."
    );
  }

  if (
    context.normalizeWeights === true &&
    Array.isArray(context.entries) &&
    context.entries.length > 0 &&
    isObject(context.preparation) &&
    typeof context.preparation
      .effectiveWeightTotal === "number" &&
    Math.abs(
      context.preparation
        .effectiveWeightTotal - 1
    ) > 0.0001
  ) {
    warnings.push(
      "Effective weight total differs from 1 while normalization is enabled."
    );
  }

  if (
    Array.isArray(context.limitations) &&
    context.limitations.length > 0
  ) {
    warnings.push(
      "Aggregation context limitations are present."
    );
  }

  if (
    Array.isArray(context.entries) &&
    context.entries.some(
      (entry) =>
        entry.inferenceSupport < 0.5
    )
  ) {
    warnings.push(
      "At least one aggregation entry has limited inference support."
    );
  }

  if (
    Array.isArray(context.entries) &&
    context.entries.some(
      (entry) =>
        entry.matchStatus ===
        "partially_satisfied"
    )
  ) {
    warnings.push(
      "At least one partially satisfied contribution is included."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateCapabilityAggregationContext,
};
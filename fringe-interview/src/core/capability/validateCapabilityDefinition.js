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

function validateRequirement(
  requirement,
  path,
  errors,
  warnings,
  isRequired
) {
  if (!isObject(requirement)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isValidString(requirement.contributionKey)) {
    errors.push(`${path}.contributionKey is required.`);
  }

  if (!isValidString(requirement.sourceMeasureId)) {
    errors.push(`${path}.sourceMeasureId is required.`);
  }

  if (
    typeof requirement.weight !== "number" ||
    !Number.isFinite(requirement.weight) ||
    requirement.weight < 0
  ) {
    errors.push(
      `${path}.weight must be a non-negative number.`
    );
  }

  if (
    requirement.minimumContribution !== null &&
    !isUnitIntervalNumber(requirement.minimumContribution)
  ) {
    errors.push(
      `${path}.minimumContribution must be a number between 0 and 1 or null.`
    );
  }

  if (!Array.isArray(requirement.allowedDirections)) {
    errors.push(`${path}.allowedDirections must be an array.`);
  } else {
    requirement.allowedDirections.forEach(
      (direction, directionIndex) => {
        if (!ALLOWED_DIRECTIONS.includes(direction)) {
          errors.push(
            `${path}.allowedDirections[${directionIndex}] is not supported.`
          );
        }
      }
    );
  }

  if (!isObject(requirement.metadata)) {
    errors.push(`${path}.metadata must be an object.`);
  }

  if (!isObject(requirement.extensions)) {
    errors.push(`${path}.extensions must be an object.`);
  }

  if (requirement.weight === 0) {
    warnings.push(`${path}.weight is 0.`);
  }

  if (
    isRequired &&
    requirement.minimumContribution === null
  ) {
    warnings.push(
      `${path}.minimumContribution is null for a required contribution.`
    );
  }
}

function validateAggregationPolicy(policy, errors) {
  if (!isObject(policy)) {
    errors.push("aggregationPolicy must be an object.");
    return;
  }

  if (
    policy.strategy !== "weighted_contribution_balance"
  ) {
    errors.push(
      'aggregationPolicy.strategy must be "weighted_contribution_balance".'
    );
  }

  if (policy.supportingDirection !== "supporting") {
    errors.push(
      'aggregationPolicy.supportingDirection must be "supporting".'
    );
  }

  if (
    policy.contradictingDirection !== "contradicting"
  ) {
    errors.push(
      'aggregationPolicy.contradictingDirection must be "contradicting".'
    );
  }

  if (policy.neutralDirection !== "neutral") {
    errors.push(
      'aggregationPolicy.neutralDirection must be "neutral".'
    );
  }

  if (typeof policy.normalizeWeights !== "boolean") {
    errors.push(
      "aggregationPolicy.normalizeWeights must be a boolean."
    );
  }
}

function validateCoveragePolicy(policy, errors, warnings) {
  if (!isObject(policy)) {
    errors.push("coveragePolicy must be an object.");
    return;
  }

  if (
    !isUnitIntervalNumber(
      policy.minimumRequiredCoverage
    )
  ) {
    errors.push(
      "coveragePolicy.minimumRequiredCoverage must be between 0 and 1."
    );
  }

  if (
    !isUnitIntervalNumber(
      policy.minimumTotalCoverage
    )
  ) {
    errors.push(
      "coveragePolicy.minimumTotalCoverage must be between 0 and 1."
    );
  }

  if (typeof policy.allowPartialResult !== "boolean") {
    errors.push(
      "coveragePolicy.allowPartialResult must be a boolean."
    );
  }

  if (policy.minimumRequiredCoverage === 0) {
    warnings.push(
      "coveragePolicy.minimumRequiredCoverage is 0."
    );
  }

  if (policy.minimumTotalCoverage === 0) {
    warnings.push(
      "coveragePolicy.minimumTotalCoverage is 0."
    );
  }

  if (
    isUnitIntervalNumber(
      policy.minimumRequiredCoverage
    ) &&
    isUnitIntervalNumber(
      policy.minimumTotalCoverage
    ) &&
    policy.minimumRequiredCoverage >
      policy.minimumTotalCoverage
  ) {
    warnings.push(
      "coveragePolicy.minimumRequiredCoverage is greater than minimumTotalCoverage."
    );
  }
}

function validateThresholds(thresholds, errors) {
  if (!isObject(thresholds)) {
    errors.push("thresholds must be an object.");
    return;
  }

  const thresholdNames = [
    "weak",
    "moderate",
    "strong",
    "veryStrong",
  ];

  thresholdNames.forEach((thresholdName) => {
    if (
      !isUnitIntervalNumber(
        thresholds[thresholdName]
      )
    ) {
      errors.push(
        `thresholds.${thresholdName} must be between 0 and 1.`
      );
    }
  });

  const allThresholdsValid = thresholdNames.every(
    (thresholdName) =>
      isUnitIntervalNumber(
        thresholds[thresholdName]
      )
  );

  if (
    allThresholdsValid &&
    !(
      thresholds.weak <
        thresholds.moderate &&
      thresholds.moderate <
        thresholds.strong &&
      thresholds.strong <
        thresholds.veryStrong
    )
  ) {
    errors.push(
      "thresholds must respect weak < moderate < strong < veryStrong."
    );
  }
}

function addSourceMeasureWarnings(
  requiredContributions,
  optionalContributions,
  warnings
) {
  const occurrences = new Map();

  [
    ...requiredContributions,
    ...optionalContributions,
  ].forEach((requirement) => {
    if (
      !isObject(requirement) ||
      !isValidString(requirement.sourceMeasureId)
    ) {
      return;
    }

    const currentCount =
      occurrences.get(
        requirement.sourceMeasureId
      ) || 0;

    occurrences.set(
      requirement.sourceMeasureId,
      currentCount + 1
    );
  });

  occurrences.forEach((count, sourceMeasureId) => {
    if (count > 1) {
      warnings.push(
        `sourceMeasureId "${sourceMeasureId}" is used by multiple contribution requirements.`
      );
    }
  });
}

function validateCapabilityDefinition(definition = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(definition)) {
    return {
      isValid: false,
      errors: ["CapabilityDefinition must be an object."],
      warnings: [],
    };
  }

  if (!isValidString(definition.capabilityId)) {
    errors.push(
      "capabilityId must be a non-empty string."
    );
  }

  if (definition.definitionStatus !== "draft") {
    errors.push(
      'definitionStatus must be "draft".'
    );
  }

  if (!isValidString(definition.label)) {
    errors.push(
      "label must be a non-empty string."
    );
  }

  if (!Array.isArray(definition.requiredContributions)) {
    errors.push(
      "requiredContributions must be an array."
    );
  }

  if (!Array.isArray(definition.optionalContributions)) {
    errors.push(
      "optionalContributions must be an array."
    );
  }

  if (Array.isArray(definition.requiredContributions)) {
    definition.requiredContributions.forEach(
      (requirement, index) => {
        validateRequirement(
          requirement,
          `requiredContributions[${index}]`,
          errors,
          warnings,
          true
        );
      }
    );
  }

  if (Array.isArray(definition.optionalContributions)) {
    definition.optionalContributions.forEach(
      (requirement, index) => {
        validateRequirement(
          requirement,
          `optionalContributions[${index}]`,
          errors,
          warnings,
          false
        );
      }
    );
  }

  validateAggregationPolicy(
    definition.aggregationPolicy,
    errors
  );

  validateCoveragePolicy(
    definition.coveragePolicy,
    errors,
    warnings
  );

  validateThresholds(
    definition.thresholds,
    errors
  );

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

  if (definition.label === "Unnamed Capability") {
    warnings.push(
      "label uses the default value."
    );
  }

  if (definition.description === null) {
    warnings.push("description is missing.");
  }

  if (definition.purpose === null) {
    warnings.push("purpose is missing.");
  }

  if (definition.rationale === null) {
    warnings.push("rationale is missing.");
  }

  if (
    Array.isArray(definition.requiredContributions) &&
    definition.requiredContributions.length === 0
  ) {
    warnings.push(
      "requiredContributions is empty."
    );
  }

  if (
    Array.isArray(definition.optionalContributions) &&
    definition.optionalContributions.length === 0
  ) {
    warnings.push(
      "optionalContributions is empty."
    );
  }

  const allRequirements = [
    ...(Array.isArray(definition.requiredContributions)
      ? definition.requiredContributions
      : []),

    ...(Array.isArray(definition.optionalContributions)
      ? definition.optionalContributions
      : []),
  ];

  const totalWeight = allRequirements.reduce(
    (sum, requirement) => {
      if (
        !isObject(requirement) ||
        typeof requirement.weight !== "number" ||
        !Number.isFinite(requirement.weight)
      ) {
        return sum;
      }

      return sum + requirement.weight;
    },
    0
  );

  const roundedTotalWeight =
    Math.round(totalWeight * 1000000) / 1000000;

  if (roundedTotalWeight === 0) {
    warnings.push(
      "The total contribution weight is 0."
    );
  } else if (roundedTotalWeight !== 1) {
    warnings.push(
      `The total contribution weight is ${roundedTotalWeight}, not 1.`
    );
  }

  addSourceMeasureWarnings(
    Array.isArray(definition.requiredContributions)
      ? definition.requiredContributions
      : [],
    Array.isArray(definition.optionalContributions)
      ? definition.optionalContributions
      : [],
    warnings
  );

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateCapabilityDefinition,
};
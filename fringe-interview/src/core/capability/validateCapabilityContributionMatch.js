const ALLOWED_REQUIREMENT_TYPES = [
  "required",
  "optional",
];

const ALLOWED_MATCH_STATUSES = [
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

function isNonNegativeInteger(value) {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
}

function validateRequirementMatch(
  match,
  path,
  errors
) {
  if (!isObject(match)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isValidString(match.contributionKey)) {
    errors.push(
      `${path}.contributionKey must be a non-empty string.`
    );
  }

  if (!isValidString(match.sourceMeasureId)) {
    errors.push(
      `${path}.sourceMeasureId must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_REQUIREMENT_TYPES.includes(
      match.requirementType
    )
  ) {
    errors.push(
      `${path}.requirementType is invalid.`
    );
  }

  if (
    typeof match.weight !== "number" ||
    !Number.isFinite(match.weight) ||
    match.weight < 0
  ) {
    errors.push(
      `${path}.weight must be a non-negative number.`
    );
  }

  if (
    match.minimumContribution !== null &&
    !isUnitIntervalNumber(
      match.minimumContribution
    )
  ) {
    errors.push(
      `${path}.minimumContribution must be between 0 and 1 or null.`
    );
  }

  if (!Array.isArray(match.allowedDirections)) {
    errors.push(
      `${path}.allowedDirections must be an array.`
    );
  }

  if (
    !ALLOWED_MATCH_STATUSES.includes(
      match.status
    )
  ) {
    errors.push(
      `${path}.status is invalid.`
    );
  }

  if (
    !Array.isArray(
      match.matchedContributionIds
    )
  ) {
    errors.push(
      `${path}.matchedContributionIds must be an array.`
    );
  }

  if (
    !Array.isArray(
      match.compatibleContributionIds
    )
  ) {
    errors.push(
      `${path}.compatibleContributionIds must be an array.`
    );
  }

  if (
    !Array.isArray(
      match.incompatibleContributionIds
    )
  ) {
    errors.push(
      `${path}.incompatibleContributionIds must be an array.`
    );
  }

  if (
    match.bestContributionId !== null &&
    !isValidString(
      match.bestContributionId
    )
  ) {
    errors.push(
      `${path}.bestContributionId must be a string or null.`
    );
  }

  if (
    !isUnitIntervalNumber(
      match.bestContributionValue
    )
  ) {
    errors.push(
      `${path}.bestContributionValue must be between 0 and 1.`
    );
  }

  if (!Array.isArray(match.limitations)) {
    errors.push(
      `${path}.limitations must be an array.`
    );
  }
}

function validateCoverage(
  coverage,
  errors
) {
  if (!isObject(coverage)) {
    errors.push("coverage must be an object.");
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

function validateSummary(
  summary,
  errors
) {
  if (!isObject(summary)) {
    errors.push("summary must be an object.");
    return;
  }

  [
    "satisfied",
    "partiallySatisfied",
    "missing",
    "incompatible",
    "matchedContributionCount",
    "unmatchedContributionCount",
  ].forEach((field) => {
    if (
      !isNonNegativeInteger(
        summary[field]
      )
    ) {
      errors.push(
        `summary.${field} must be a non-negative integer.`
      );
    }
  });
}

function validateCapabilityContributionMatch(
  match = {}
) {
  const errors = [];
  const warnings = [];

  if (!isObject(match)) {
    return {
      isValid: false,
      errors: [
        "CapabilityContributionMatch must be an object.",
      ],
      warnings: [],
    };
  }

  if (match.matchStatus !== "draft") {
    errors.push(
      'matchStatus must be "draft".'
    );
  }

  if (!isValidString(match.capabilityId)) {
    errors.push(
      "capabilityId must be a non-empty string."
    );
  }

  if (
    !Array.isArray(
      match.requiredMatches
    )
  ) {
    errors.push(
      "requiredMatches must be an array."
    );
  } else {
    match.requiredMatches.forEach(
      (requirementMatch, index) => {
        validateRequirementMatch(
          requirementMatch,
          `requiredMatches[${index}]`,
          errors
        );
      }
    );
  }

  if (
    !Array.isArray(
      match.optionalMatches
    )
  ) {
    errors.push(
      "optionalMatches must be an array."
    );
  } else {
    match.optionalMatches.forEach(
      (requirementMatch, index) => {
        validateRequirementMatch(
          requirementMatch,
          `optionalMatches[${index}]`,
          errors
        );
      }
    );
  }

  validateCoverage(
    match.coverage,
    errors
  );

  validateSummary(
    match.summary,
    errors
  );

  if (
    !Array.isArray(
      match.matchedContributionIds
    )
  ) {
    errors.push(
      "matchedContributionIds must be an array."
    );
  }

  if (
    !Array.isArray(
      match.unmatchedContributions
    )
  ) {
    errors.push(
      "unmatchedContributions must be an array."
    );
  }

  if (!Array.isArray(match.limitations)) {
    errors.push(
      "limitations must be an array."
    );
  }

  if (!isObject(match.metadata)) {
    errors.push(
      "metadata must be an object."
    );
  } else {
    if (!match.metadata.version) {
      errors.push(
        "metadata.version is required."
      );
    }

    if (!match.metadata.createdAt) {
      errors.push(
        "metadata.createdAt is required."
      );
    }
  }

  if (!isObject(match.extensions)) {
    errors.push(
      "extensions must be an object."
    );
  }

  if (
    Array.isArray(match.requiredMatches) &&
    match.requiredMatches.length === 0
  ) {
    warnings.push(
      "requiredMatches is empty."
    );
  }

  if (
    Array.isArray(match.optionalMatches) &&
    match.optionalMatches.length === 0
  ) {
    warnings.push(
      "optionalMatches is empty."
    );
  }

  if (
    isObject(match.coverage) &&
    typeof match.coverage.required ===
      "number" &&
    match.coverage.required < 1
  ) {
    warnings.push(
      "Required coverage is below 1."
    );
  }

  if (
    isObject(match.coverage) &&
    typeof match.coverage.total ===
      "number" &&
    match.coverage.total < 1
  ) {
    warnings.push(
      "Total coverage is below 1."
    );
  }

  if (
    Array.isArray(
      match.unmatchedContributions
    ) &&
    match.unmatchedContributions.length > 0
  ) {
    warnings.push(
      "Unmatched contributions are present."
    );
  }

  if (
    Array.isArray(match.limitations) &&
    match.limitations.length > 0
  ) {
    warnings.push(
      "Match limitations are present."
    );
  }

  const allMatches = [
    ...(
      Array.isArray(
        match.requiredMatches
      )
        ? match.requiredMatches
        : []
    ),

    ...(
      Array.isArray(
        match.optionalMatches
      )
        ? match.optionalMatches
        : []
    ),
  ];

  if (
    allMatches.some(
      (requirementMatch) =>
        requirementMatch.status ===
        "partially_satisfied"
    )
  ) {
    warnings.push(
      "At least one requirement is partially satisfied."
    );
  }

  if (
    allMatches.some(
      (requirementMatch) =>
        requirementMatch.status ===
        "missing"
    )
  ) {
    warnings.push(
      "At least one requirement is missing."
    );
  }

  if (
    allMatches.some(
      (requirementMatch) =>
        requirementMatch.status ===
        "incompatible"
    )
  ) {
    warnings.push(
      "At least one requirement is incompatible."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateCapabilityContributionMatch,
};
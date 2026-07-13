const DEFAULT_ALLOWED_DIRECTIONS = [
  "supporting",
  "contradicting",
  "neutral",
];

const ALLOWED_DIRECTIONS = new Set(DEFAULT_ALLOWED_DIRECTIONS);

const DEFAULT_THRESHOLDS = {
  weak: 0.3,
  moderate: 0.5,
  strong: 0.7,
  veryStrong: 0.85,
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeOptionalString(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value;
}

function normalizeCapabilityLabel(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Unnamed Capability";
  }

  return value;
}

function normalizeNonNegativeNumber(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function normalizeUnitIntervalOrNull(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    return null;
  }

  return value;
}

function normalizeUnitIntervalWithDefault(value, defaultValue) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    return defaultValue;
  }

  return value;
}

function normalizeAllowedDirections(value) {
  if (!Array.isArray(value)) {
    return [...DEFAULT_ALLOWED_DIRECTIONS];
  }

  const normalized = Array.from(
    new Set(
      value.filter(
        (direction) =>
          typeof direction === "string" &&
          ALLOWED_DIRECTIONS.has(direction)
      )
    )
  );

  if (normalized.length === 0) {
    return [...DEFAULT_ALLOWED_DIRECTIONS];
  }

  return normalized;
}

function normalizeRequirement(input = {}) {
  const source = isObject(input) ? input : {};

  return {
    contributionKey: normalizeOptionalString(source.contributionKey),

    sourceMeasureId: normalizeOptionalString(source.sourceMeasureId),

    weight: normalizeNonNegativeNumber(source.weight),

    minimumContribution: normalizeUnitIntervalOrNull(
      source.minimumContribution
    ),

    allowedDirections: normalizeAllowedDirections(
      source.allowedDirections
    ),

    metadata: isObject(source.metadata)
      ? { ...source.metadata }
      : {},

    extensions: isObject(source.extensions)
      ? { ...source.extensions }
      : {},
  };
}

function normalizeRequirementArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = [];
  const seenContributionKeys = new Set();

  value.forEach((item) => {
    const requirement = normalizeRequirement(item);
    const contributionKey = requirement.contributionKey;

    if (
      contributionKey !== null &&
      seenContributionKeys.has(contributionKey)
    ) {
      return;
    }

    if (contributionKey !== null) {
      seenContributionKeys.add(contributionKey);
    }

    normalized.push(requirement);
  });

  return normalized;
}

function normalizeAggregationPolicy(value) {
  const source = isObject(value) ? value : {};

  return {
    strategy: "weighted_contribution_balance",
    supportingDirection: "supporting",
    contradictingDirection: "contradicting",
    neutralDirection: "neutral",
    normalizeWeights:
      typeof source.normalizeWeights === "boolean"
        ? source.normalizeWeights
        : true,
  };
}

function normalizeCoveragePolicy(value) {
  const source = isObject(value) ? value : {};

  return {
    minimumRequiredCoverage: normalizeUnitIntervalWithDefault(
      source.minimumRequiredCoverage,
      0
    ),

    minimumTotalCoverage: normalizeUnitIntervalWithDefault(
      source.minimumTotalCoverage,
      0
    ),

    allowPartialResult:
      typeof source.allowPartialResult === "boolean"
        ? source.allowPartialResult
        : true,
  };
}

function normalizeThresholds(value) {
  const source = isObject(value) ? value : {};

  return {
    weak: normalizeUnitIntervalWithDefault(
      source.weak,
      DEFAULT_THRESHOLDS.weak
    ),

    moderate: normalizeUnitIntervalWithDefault(
      source.moderate,
      DEFAULT_THRESHOLDS.moderate
    ),

    strong: normalizeUnitIntervalWithDefault(
      source.strong,
      DEFAULT_THRESHOLDS.strong
    ),

    veryStrong: normalizeUnitIntervalWithDefault(
      source.veryStrong,
      DEFAULT_THRESHOLDS.veryStrong
    ),
  };
}

function removeOptionalRequirementsAlreadyRequired(
  requiredContributions,
  optionalContributions
) {
  const requiredKeys = new Set(
    requiredContributions
      .map((requirement) => requirement.contributionKey)
      .filter((contributionKey) => contributionKey !== null)
  );

  return optionalContributions.filter(
    (requirement) =>
      requirement.contributionKey === null ||
      !requiredKeys.has(requirement.contributionKey)
  );
}

function buildCapabilityDefinition(input = {}) {
  const source = isObject(input) ? input : {};

  const requiredContributions = normalizeRequirementArray(
    source.requiredContributions
  );

  const normalizedOptionalContributions = normalizeRequirementArray(
    source.optionalContributions
  );

  const optionalContributions =
    removeOptionalRequirementsAlreadyRequired(
      requiredContributions,
      normalizedOptionalContributions
    );

  const inputMetadata = isObject(source.metadata)
    ? source.metadata
    : {};

  return {
    capabilityId: normalizeOptionalString(source.capabilityId),

    definitionStatus: "draft",

    label: normalizeCapabilityLabel(source.label),

    description: normalizeOptionalString(source.description),

    purpose: normalizeOptionalString(source.purpose),

    requiredContributions,

    optionalContributions,

    aggregationPolicy: normalizeAggregationPolicy(
      source.aggregationPolicy
    ),

    coveragePolicy: normalizeCoveragePolicy(
      source.coveragePolicy
    ),

    thresholds: normalizeThresholds(source.thresholds),

    rationale: normalizeOptionalString(source.rationale),

    metadata: {
      ...inputMetadata,
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: isObject(source.extensions)
      ? { ...source.extensions }
      : {},
  };
}

module.exports = {
  buildCapabilityDefinition,
};
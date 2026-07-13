const {
  validateCapabilityDefinition,
} = require("./validateCapabilityDefinition");

const {
  validateCapabilityContributionMatch,
} = require("./validateCapabilityContributionMatch");

const {
  validateCapabilityAggregationContext,
} = require("./validateCapabilityAggregationContext");

const ALLOWED_RESULT_STATUSES = [
  "draft",
  "partial",
  "insufficient_evidence",
  "invalid",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function normalizeUnitInterval(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return clamp(value, 0, 1);
}

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function copyRequirementMatch(match) {
  return {
    contributionKey: match.contributionKey,
    sourceMeasureId: match.sourceMeasureId,
    requirementType: match.requirementType,
    status: match.status,
    bestContributionId: match.bestContributionId,
    bestContributionValue: match.bestContributionValue,
  };
}

function copyContributionEntry(entry) {
  return {
    contributionId: entry.contributionId,
    contributionKey: entry.contributionKey,
    requirementType: entry.requirementType,
    sourceMeasureId: entry.sourceMeasureId,
    direction: entry.direction,
    contributionValue: entry.contributionValue,
    inferenceSupport: entry.inferenceSupport,
    effectiveWeight: entry.effectiveWeight,
    weightedContributionValue:
      entry.weightedContributionValue,
    weightedInferenceSupport:
      entry.weightedInferenceSupport,
  };
}

function calculateSupportingStrength(aggregationContext) {
  const total = asArray(
    aggregationContext.supportingEntries
  ).reduce(
    (sum, entry) =>
      sum +
      (
        typeof entry.weightedContributionValue === "number"
          ? entry.weightedContributionValue
          : 0
      ),
    0
  );

  return roundToFourDecimals(
    clamp(total, 0, 1)
  );
}

function calculateContradictingStrength(aggregationContext) {
  const total = Math.abs(
    asArray(
      aggregationContext.contradictingEntries
    ).reduce(
      (sum, entry) =>
        sum +
        (
          typeof entry.weightedContributionValue === "number"
            ? entry.weightedContributionValue
            : 0
        ),
      0
    )
  );

  return roundToFourDecimals(
    clamp(total, 0, 1)
  );
}

function calculateInferenceSupport(aggregationContext) {
  const total = asArray(
    aggregationContext.entries
  ).reduce(
    (sum, entry) =>
      sum +
      (
        typeof entry.weightedInferenceSupport === "number"
          ? entry.weightedInferenceSupport
          : 0
      ),
    0
  );

  return roundToFourDecimals(
    clamp(total, 0, 1)
  );
}

function getInferenceSupportBand(value) {
  if (value === 0) {
    return "none";
  }

  if (value < 0.4) {
    return "low";
  }

  if (value < 0.6) {
    return "moderate";
  }

  if (value < 0.8) {
    return "high";
  }

  return "very_high";
}

function getCapabilityBand(net, thresholds) {
  const weak =
    typeof thresholds.weak === "number"
      ? thresholds.weak
      : 0;

  const moderate =
    typeof thresholds.moderate === "number"
      ? thresholds.moderate
      : 0;

  const strong =
    typeof thresholds.strong === "number"
      ? thresholds.strong
      : 0;

  const veryStrong =
    typeof thresholds.veryStrong === "number"
      ? thresholds.veryStrong
      : 0;

  if (net < weak) {
    return "not_supported";
  }

  if (net < moderate) {
    return "weak";
  }

  if (net < strong) {
    return "moderate";
  }

  if (net < veryStrong) {
    return "strong";
  }

  return "very_strong";
}

function getManifestationStatus({
  net,
  coverageSufficient,
  inferenceSupport,
  entryCount,
  thresholds,
}) {
  if (entryCount === 0 || inferenceSupport === 0) {
    return "not_observed";
  }

  if (net < thresholds.moderate) {
    return "weakly_observed";
  }

  if (
    net >= thresholds.strong &&
    coverageSufficient === true &&
    inferenceSupport >= 0.8
  ) {
    return "strongly_observed";
  }

  if (
    coverageSufficient === false ||
    inferenceSupport < 0.6
  ) {
    return "partially_observed";
  }

  return "observed";
}

function getStrongestEntry(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  return entries.reduce((best, candidate) => {
    if (!best) {
      return candidate;
    }

    const candidateValue = Math.abs(
      candidate.weightedContributionValue
    );

    const bestValue = Math.abs(
      best.weightedContributionValue
    );

    if (candidateValue > bestValue) {
      return candidate;
    }

    if (candidateValue < bestValue) {
      return best;
    }

    if (
      candidate.inferenceSupport >
      best.inferenceSupport
    ) {
      return candidate;
    }

    return best;
  }, null);
}

function getDominantDirection({
  supporting,
  contradicting,
}) {
  const tolerance = 0.0001;

  if (
    supporting === 0 &&
    contradicting === 0
  ) {
    return "none";
  }

  if (
    Math.abs(
      supporting - contradicting
    ) <= tolerance
  ) {
    return "balanced";
  }

  return supporting > contradicting
    ? "supporting"
    : "contradicting";
}

function buildRequirements(match, aggregationContext) {
  const allMatches = [
    ...asArray(match.requiredMatches),
    ...asArray(match.optionalMatches),
  ];

  return {
    satisfied: allMatches
      .filter((item) => item.status === "satisfied")
      .map(copyRequirementMatch),

    partiallySatisfied: allMatches
      .filter(
        (item) =>
          item.status === "partially_satisfied"
      )
      .map(copyRequirementMatch),

    missing: allMatches
      .filter((item) => item.status === "missing")
      .map(copyRequirementMatch),

    incompatible: allMatches
      .filter(
        (item) => item.status === "incompatible"
      )
      .map(copyRequirementMatch),

    excluded: asArray(
      aggregationContext.excludedRequirements
    ).map((item) => ({
      ...item,
    })),
  };
}

function determineResultStatus({
  inputsValid,
  capabilityIdsMatch,
  entryCount,
  coverageSufficient,
  allowPartialResult,
  requirements,
}) {
  if (
    !inputsValid ||
    !capabilityIdsMatch
  ) {
    return "invalid";
  }

  if (
    entryCount === 0 ||
    (
      coverageSufficient === false &&
      allowPartialResult === false
    )
  ) {
    return "insufficient_evidence";
  }

  const hasIncompleteRequirements =
    coverageSufficient === false ||
    requirements.partiallySatisfied.length > 0 ||
    requirements.missing.length > 0 ||
    requirements.incompatible.length > 0 ||
    requirements.excluded.length > 0;

  if (
    hasIncompleteRequirements &&
    allowPartialResult === true
  ) {
    return "partial";
  }

  return "draft";
}

function buildCapabilityResult({
  definition = {},
  match = {},
  aggregationContext = {},
} = {}) {
  const sourceDefinition = isObject(definition)
    ? definition
    : {};

  const sourceMatch = isObject(match)
    ? match
    : {};

  const sourceAggregationContext = isObject(
    aggregationContext
  )
    ? aggregationContext
    : {};

  const definitionValidation =
    validateCapabilityDefinition(
      sourceDefinition
    );

  const matchValidation =
    validateCapabilityContributionMatch(
      sourceMatch
    );

  const aggregationValidation =
    validateCapabilityAggregationContext(
      sourceAggregationContext
    );

  const limitations = [];

  if (
    definitionValidation.isValid !== true ||
    matchValidation.isValid !== true ||
    aggregationValidation.isValid !== true
  ) {
    addUnique(
      limitations,
      "One or more capability inputs were invalid."
    );
  }

  const capabilityIdsMatch =
    sourceDefinition.capabilityId ===
      sourceMatch.capabilityId &&
    sourceDefinition.capabilityId ===
      sourceAggregationContext.capabilityId;

  if (!capabilityIdsMatch) {
    addUnique(
      limitations,
      "Capability inputs refer to different capability identifiers."
    );
  }

  asArray(sourceMatch.limitations).forEach(
    (limitation) => {
      if (typeof limitation === "string") {
        addUnique(limitations, limitation);
      }
    }
  );

  asArray(
    sourceAggregationContext.limitations
  ).forEach((limitation) => {
    if (typeof limitation === "string") {
      addUnique(limitations, limitation);
    }
  });

  const entries = capabilityIdsMatch
    ? asArray(sourceAggregationContext.entries)
    : [];

  const supportingStrength =
    capabilityIdsMatch
      ? calculateSupportingStrength(
          sourceAggregationContext
        )
      : 0;

  const contradictingStrength =
    capabilityIdsMatch
      ? calculateContradictingStrength(
          sourceAggregationContext
        )
      : 0;

  const netStrength = roundToFourDecimals(
    clamp(
      supportingStrength -
        contradictingStrength,
      0,
      1
    )
  );

  const absoluteSupport = roundToFourDecimals(
    clamp(
      supportingStrength +
        contradictingStrength,
      0,
      1
    )
  );

  const inferenceSupportValue =
    capabilityIdsMatch
      ? calculateInferenceSupport(
          sourceAggregationContext
        )
      : 0;

  const coverageSource = isObject(
    sourceMatch.coverage
  )
    ? sourceMatch.coverage
    : {};

  const requiredCoverage =
    normalizeUnitInterval(
      coverageSource.required
    );

  const optionalCoverage =
    normalizeUnitInterval(
      coverageSource.optional
    );

  const totalCoverage =
    normalizeUnitInterval(
      coverageSource.total
    );

  const coveragePolicy = isObject(
    sourceDefinition.coveragePolicy
  )
    ? sourceDefinition.coveragePolicy
    : {};

  const minimumRequiredCoverage =
    normalizeUnitInterval(
      coveragePolicy.minimumRequiredCoverage
    );

  const minimumTotalCoverage =
    normalizeUnitInterval(
      coveragePolicy.minimumTotalCoverage
    );

  const coverageSufficient =
    requiredCoverage >=
      minimumRequiredCoverage &&
    totalCoverage >=
      minimumTotalCoverage;

  if (!coverageSufficient) {
    addUnique(
      limitations,
      "Capability result does not meet configured coverage requirements."
    );
  }

  if (inferenceSupportValue < 0.5) {
    addUnique(
      limitations,
      "Capability result has limited inference support."
    );
  }

  if (contradictingStrength > 0) {
    addUnique(
      limitations,
      "Capability result includes contradicting contributions."
    );
  }

  if (entries.length === 0) {
    addUnique(
      limitations,
      "No capability contributions were available for result construction."
    );
  }

  const thresholds = isObject(
    sourceDefinition.thresholds
  )
    ? sourceDefinition.thresholds
    : {
        weak: 0,
        moderate: 0,
        strong: 0,
        veryStrong: 0,
      };

  const capabilityBand = getCapabilityBand(
    netStrength,
    thresholds
  );

  const manifestationStatus =
    getManifestationStatus({
      net: netStrength,
      coverageSufficient,
      inferenceSupport:
        inferenceSupportValue,
      entryCount: entries.length,
      thresholds,
    });

  const requirements =
    buildRequirements(
      sourceMatch,
      sourceAggregationContext
    );

  const resultStatus =
    determineResultStatus({
      inputsValid:
        definitionValidation.isValid === true &&
        matchValidation.isValid === true &&
        aggregationValidation.isValid === true,

      capabilityIdsMatch,

      entryCount: entries.length,

      coverageSufficient,

      allowPartialResult:
        coveragePolicy.allowPartialResult === true,

      requirements,
    });

  const usedContributions =
    entries.map(copyContributionEntry);

  const supportingContributions =
    usedContributions.filter(
      (item) =>
        item.direction === "supporting"
    );

  const contradictingContributions =
    usedContributions.filter(
      (item) =>
        item.direction === "contradicting"
    );

  const neutralContributions =
    usedContributions.filter(
      (item) =>
        item.direction === "neutral"
    );

  const evidenceIds = Array.from(
    new Set(
      entries.flatMap((entry) =>
        asArray(entry.evidenceIds).filter(
          (evidenceId) =>
            typeof evidenceId === "string" &&
            evidenceId.trim().length > 0
        )
      )
    )
  );

  const strongestSupporting =
    getStrongestEntry(
      asArray(
        sourceAggregationContext.supportingEntries
      )
    );

  const strongestContradicting =
    getStrongestEntry(
      asArray(
        sourceAggregationContext.contradictingEntries
      )
    );

  const dominantDirection =
    getDominantDirection({
      supporting: supportingStrength,
      contradicting:
        contradictingStrength,
    });

  const notes = [];

  if (dominantDirection === "supporting") {
    notes.push(
      "Supporting contributions outweigh contradicting contributions."
    );
  }

  if (dominantDirection === "contradicting") {
    notes.push(
      "Contradicting contributions outweigh supporting contributions."
    );
  }

  if (dominantDirection === "balanced") {
    notes.push(
      "Supporting and contradicting contributions are balanced."
    );
  }

  if (!coverageSufficient) {
    notes.push(
      "Capability coverage is below the configured minimum."
    );
  }

  if (inferenceSupportValue < 0.5) {
    notes.push(
      "Capability inference support is limited."
    );
  }

  if (entries.length === 0) {
    notes.push(
      "No usable capability contributions were available."
    );
  }

  return {
    resultStatus,

    capabilityId:
      sourceDefinition.capabilityId || null,

    definitionStatus:
      sourceDefinition.definitionStatus || null,

    strength: {
      net: netStrength,

      supporting:
        supportingStrength,

      contradicting:
        contradictingStrength,

      absoluteSupport,
    },

    inferenceSupport: {
      value:
        inferenceSupportValue,

      band:
        getInferenceSupportBand(
          inferenceSupportValue
        ),
    },

    coverage: {
      required:
        requiredCoverage,

      optional:
        optionalCoverage,

      total:
        totalCoverage,

      sufficient:
        coverageSufficient,
    },

    capabilityBand,

    manifestationStatus,

    contributions: {
      used:
        usedContributions,

      supporting:
        supportingContributions,

      contradicting:
        contradictingContributions,

      neutral:
        neutralContributions,
    },

    requirements,

    evidenceIds,

    explainability: {
      strongestSupportingContributionId:
        strongestSupporting
          ? strongestSupporting.contributionId
          : null,

      strongestContradictingContributionId:
        strongestContradicting
          ? strongestContradicting.contributionId
          : null,

      dominantDirection,

      notes,
    },

    limitations,

    metadata: {
      version: "1.0",
      createdAt:
        new Date().toISOString(),
    },

    extensions: {
      inputValidation: {
        definition:
          definitionValidation,

        match:
          matchValidation,

        aggregationContext:
          aggregationValidation,
      },
    },
  };
}

module.exports = {
  buildCapabilityResult,
};
const {
  validateCapabilityDefinition,
} = require("./validateCapabilityDefinition");

const {
  validateCapabilityContribution,
} = require("./validateCapabilityContribution");

const {
  validateCapabilityContributionMatch,
} = require("./validateCapabilityContributionMatch");

const USABLE_MATCH_STATUSES = [
  "satisfied",
  "partially_satisfied",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function normalizeNonNegativeNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  )
    ? value
    : 0;
}

function normalizeUnitInterval(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 1);
}

function addUniqueLimitation(limitations, message) {
  if (!limitations.includes(message)) {
    limitations.push(message);
  }
}

function getSignedContributionValue(direction, contributionValue) {
  if (direction === "supporting") {
    return contributionValue;
  }

  if (direction === "contradicting") {
    return -contributionValue;
  }

  return 0;
}

function cloneEntry(entry) {
  return {
    ...entry,

    evidenceIds: [...entry.evidenceIds],

    context: {
      ...entry.context,
    },

    limitations: [...entry.limitations],
  };
}

function buildExcludedRequirement({
  requirementMatch,
  reason,
}) {
  return {
    contributionKey:
      requirementMatch.contributionKey,

    requirementType:
      requirementMatch.requirementType,

    sourceMeasureId:
      requirementMatch.sourceMeasureId,

    status:
      requirementMatch.status,

    reason,
  };
}

function calculateDeclaredWeightTotal(definition) {
  return roundToFourDecimals(
    [
      ...asArray(definition.requiredContributions),
      ...asArray(definition.optionalContributions),
    ].reduce(
      (sum, requirement) =>
        sum +
        normalizeNonNegativeNumber(
          requirement && requirement.weight
        ),
      0
    )
  );
}

function applyEffectiveWeights({
  entries,
  normalizeWeights,
}) {
  const availableWeightTotal = entries.reduce(
    (sum, entry) =>
      sum + entry.requirementWeight,
    0
  );

  if (entries.length === 0) {
    return {
      entries: [],
      availableWeightTotal: 0,
      effectiveWeightTotal: 0,
    };
  }

  if (!normalizeWeights) {
    const weightedEntries = entries.map((entry) => {
      const effectiveWeight =
        entry.requirementWeight;

      return {
        ...entry,

        effectiveWeight,

        weightedContributionValue:
          roundToFourDecimals(
            entry.signedContributionValue *
              effectiveWeight
          ),

        weightedInferenceSupport:
          roundToFourDecimals(
            entry.inferenceSupport *
              effectiveWeight
          ),
      };
    });

    return {
      entries: weightedEntries,

      availableWeightTotal:
        roundToFourDecimals(
          availableWeightTotal
        ),

      effectiveWeightTotal:
        roundToFourDecimals(
          weightedEntries.reduce(
            (sum, entry) =>
              sum + entry.effectiveWeight,
            0
          )
        ),
    };
  }

  if (availableWeightTotal === 0) {
    const zeroWeightEntries = entries.map(
      (entry) => ({
        ...entry,

        effectiveWeight: 0,

        weightedContributionValue: 0,

        weightedInferenceSupport: 0,
      })
    );

    return {
      entries: zeroWeightEntries,
      availableWeightTotal: 0,
      effectiveWeightTotal: 0,
    };
  }

  const weightedEntries = [];

  entries.forEach((entry, index) => {
    const isLastEntry =
      index === entries.length - 1;

    let effectiveWeight;

    if (!isLastEntry) {
      effectiveWeight =
        roundToFourDecimals(
          entry.requirementWeight /
            availableWeightTotal
        );
    } else {
      const alreadyAssigned =
        weightedEntries.reduce(
          (sum, weightedEntry) =>
            sum +
            weightedEntry.effectiveWeight,
          0
        );

      effectiveWeight =
        roundToFourDecimals(
          1 - alreadyAssigned
        );
    }

    weightedEntries.push({
      ...entry,

      effectiveWeight,

      weightedContributionValue:
        roundToFourDecimals(
          entry.signedContributionValue *
            effectiveWeight
        ),

      weightedInferenceSupport:
        roundToFourDecimals(
          entry.inferenceSupport *
            effectiveWeight
        ),
    });
  });

  return {
    entries: weightedEntries,

    availableWeightTotal:
      roundToFourDecimals(
        availableWeightTotal
      ),

    effectiveWeightTotal:
      roundToFourDecimals(
        weightedEntries.reduce(
          (sum, entry) =>
            sum + entry.effectiveWeight,
          0
        )
      ),
  };
}

function buildCapabilityAggregationContext({
  definition = {},
  match = {},
  contributions = [],
} = {}) {
  const sourceDefinition =
    isObject(definition)
      ? definition
      : {};

  const sourceMatch =
    isObject(match)
      ? match
      : {};

  const sourceContributions =
    asArray(contributions);

  const definitionValidation =
    validateCapabilityDefinition(
      sourceDefinition
    );

  const matchValidation =
    validateCapabilityContributionMatch(
      sourceMatch
    );

  const contributionValidations =
    sourceContributions.map(
      (contribution) =>
        validateCapabilityContribution(
          contribution
        )
    );

  const validContributionById =
    new Map();

  sourceContributions.forEach(
    (contribution, index) => {
      const validation =
        contributionValidations[index];

      if (
        validation.isValid === true &&
        typeof contribution.contributionId ===
          "string"
      ) {
        validContributionById.set(
          contribution.contributionId,
          contribution
        );
      }
    }
  );

  const contributionById =
    new Map();

  sourceContributions.forEach(
    (contribution) => {
      if (
        contribution &&
        typeof contribution.contributionId ===
          "string"
      ) {
        contributionById.set(
          contribution.contributionId,
          contribution
        );
      }
    }
  );

  const limitations = [];
  const excludedRequirements = [];
  const provisionalEntries = [];

  const capabilitiesMatch =
    sourceDefinition.capabilityId ===
    sourceMatch.capabilityId;

  if (!capabilitiesMatch) {
    addUniqueLimitation(
      limitations,
      "Capability definition and match refer to different capabilities."
    );
  }

  let unresolvedContributionFound = false;
  let partialContributionExcluded = false;

  const allowPartialResult =
    sourceDefinition.coveragePolicy &&
    sourceDefinition.coveragePolicy
      .allowPartialResult === true;

  const allRequirementMatches = [
    ...asArray(sourceMatch.requiredMatches),
    ...asArray(sourceMatch.optionalMatches),
  ];

  if (capabilitiesMatch) {
    allRequirementMatches.forEach(
      (requirementMatch) => {
        if (
          requirementMatch.status ===
          "missing"
        ) {
          excludedRequirements.push(
            buildExcludedRequirement({
              requirementMatch,
              reason: "missing",
            })
          );

          return;
        }

        if (
          requirementMatch.status ===
          "incompatible"
        ) {
          excludedRequirements.push(
            buildExcludedRequirement({
              requirementMatch,
              reason: "incompatible",
            })
          );

          return;
        }

        if (
          !USABLE_MATCH_STATUSES.includes(
            requirementMatch.status
          )
        ) {
          return;
        }

        if (
          requirementMatch.status ===
            "partially_satisfied" &&
          !allowPartialResult
        ) {
          excludedRequirements.push(
            buildExcludedRequirement({
              requirementMatch,
              reason: "partial_not_allowed",
            })
          );

          partialContributionExcluded = true;
          return;
        }

        const bestContributionId =
          requirementMatch.bestContributionId;

        if (
          typeof bestContributionId !==
            "string" ||
          !contributionById.has(
            bestContributionId
          )
        ) {
          excludedRequirements.push(
            buildExcludedRequirement({
              requirementMatch,
              reason:
                "best_contribution_not_found",
            })
          );

          unresolvedContributionFound = true;
          return;
        }

        if (
          !validContributionById.has(
            bestContributionId
          )
        ) {
          excludedRequirements.push(
            buildExcludedRequirement({
              requirementMatch,
              reason:
                "invalid_contribution",
            })
          );

          return;
        }

        const contribution =
          validContributionById.get(
            bestContributionId
          );

        const contributionValue =
          normalizeUnitInterval(
            contribution.strength &&
              contribution.strength
                .contributionValue
          );

        const inferenceSupport =
          normalizeUnitInterval(
            contribution.inferenceSupport
          );

        const signedContributionValue =
          getSignedContributionValue(
            contribution.direction,
            contributionValue
          );

        const entryLimitations =
          asArray(
            contribution.limitations
          ).filter(
            (limitation) =>
              typeof limitation === "string"
          );

        if (
          requirementMatch.status ===
          "partially_satisfied"
        ) {
          addUniqueLimitation(
            entryLimitations,
            "Contribution did not reach the configured minimum."
          );
        }

        provisionalEntries.push({
          contributionKey:
            requirementMatch.contributionKey,

          requirementType:
            requirementMatch.requirementType,

          sourceMeasureId:
            requirementMatch.sourceMeasureId,

          requirementWeight:
            normalizeNonNegativeNumber(
              requirementMatch.weight
            ),

          effectiveWeight: 0,

          minimumContribution:
            requirementMatch.minimumContribution,

          matchStatus:
            requirementMatch.status,

          contributionId:
            contribution.contributionId,

          direction:
            contribution.direction,

          contributionValue,

          inferenceSupport,

          signedContributionValue,

          weightedContributionValue: 0,

          weightedInferenceSupport: 0,

          evidenceIds:
            asArray(
              contribution.evidenceIds
            ).filter(
              (evidenceId) =>
                typeof evidenceId === "string"
            ),

          context:
            isObject(
              contribution.context
            )
              ? {
                  ...contribution.context,
                }
              : {},

          limitations:
            entryLimitations,
        });
      }
    );
  }

  if (unresolvedContributionFound) {
    addUniqueLimitation(
      limitations,
      "One or more matched contributions could not be resolved."
    );
  }

  if (partialContributionExcluded) {
    addUniqueLimitation(
      limitations,
      "Partial contributions were excluded by the capability definition."
    );
  }

  const normalizeWeights =
    sourceDefinition.aggregationPolicy &&
    typeof sourceDefinition
      .aggregationPolicy
      .normalizeWeights === "boolean"
      ? sourceDefinition
          .aggregationPolicy
          .normalizeWeights
      : false;

  const weightedPreparation =
    applyEffectiveWeights({
      entries: provisionalEntries,
      normalizeWeights,
    });

  const entries =
    weightedPreparation.entries;

  const supportingEntries =
    entries
      .filter(
        (entry) =>
          entry.direction ===
          "supporting"
      )
      .map(cloneEntry);

  const contradictingEntries =
    entries
      .filter(
        (entry) =>
          entry.direction ===
          "contradicting"
      )
      .map(cloneEntry);

  const neutralEntries =
    entries
      .filter(
        (entry) =>
          entry.direction === "neutral"
      )
      .map(cloneEntry);

  const coverage =
    isObject(sourceMatch.coverage)
      ? {
          ...sourceMatch.coverage,
        }
      : {};

  const coveragePolicy =
    isObject(
      sourceDefinition.coveragePolicy
    )
      ? sourceDefinition.coveragePolicy
      : {};

  if (
    typeof coverage.required ===
      "number" &&
    typeof coveragePolicy
      .minimumRequiredCoverage ===
      "number" &&
    coverage.required <
      coveragePolicy.minimumRequiredCoverage
  ) {
    addUniqueLimitation(
      limitations,
      "Required contribution coverage is below the configured minimum."
    );
  }

  if (
    typeof coverage.total === "number" &&
    typeof coveragePolicy
      .minimumTotalCoverage === "number" &&
    coverage.total <
      coveragePolicy.minimumTotalCoverage
  ) {
    addUniqueLimitation(
      limitations,
      "Total contribution coverage is below the configured minimum."
    );
  }

  if (entries.length === 0) {
    addUniqueLimitation(
      limitations,
      "No capability contributions were available for aggregation."
    );
  }

  if (
    weightedPreparation
      .availableWeightTotal === 0
  ) {
    addUniqueLimitation(
      limitations,
      "Available aggregation weights total zero."
    );
  }

  const declaredWeightTotal =
    calculateDeclaredWeightTotal(
      sourceDefinition
    );

  const sourceContributionIds =
    Array.from(
      new Set(
        entries.map(
          (entry) =>
            entry.contributionId
        )
      )
    );

  return {
    contextStatus: "draft",

    capabilityId:
      sourceDefinition.capabilityId ||
      null,

    definitionStatus:
      sourceDefinition.definitionStatus ||
      null,

    matchStatus:
      sourceMatch.matchStatus || null,

    aggregationStrategy:
      sourceDefinition
        .aggregationPolicy &&
      sourceDefinition
        .aggregationPolicy.strategy
        ? sourceDefinition
            .aggregationPolicy.strategy
        : null,

    normalizeWeights,

    entries: entries.map(cloneEntry),

    supportingEntries,

    contradictingEntries,

    neutralEntries,

    excludedRequirements,

    coverage,

    preparation: {
      declaredWeightTotal,

      availableWeightTotal:
        weightedPreparation
          .availableWeightTotal,

      effectiveWeightTotal:
        weightedPreparation
          .effectiveWeightTotal,

      supportingEntryCount:
        supportingEntries.length,

      contradictingEntryCount:
        contradictingEntries.length,

      neutralEntryCount:
        neutralEntries.length,

      excludedRequirementCount:
        excludedRequirements.length,
    },

    sourceContributionIds,

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

        contributions:
          contributionValidations,
      },
    },
  };
}

module.exports = {
  buildCapabilityAggregationContext,
};
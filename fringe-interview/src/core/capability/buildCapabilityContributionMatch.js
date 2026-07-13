const {
  validateCapabilityContribution,
} = require("./validateCapabilityContribution");

const SATISFIED_STATUS = "satisfied";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
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

function getContributionValue(contribution) {
  const value =
    contribution &&
    contribution.strength &&
    contribution.strength.contributionValue;

  return isUnitIntervalNumber(value) ? value : 0;
}

function getInferenceSupport(contribution) {
  const value = contribution && contribution.inferenceSupport;

  return isUnitIntervalNumber(value) ? value : 0;
}

function chooseBestContribution(contributions) {
  if (contributions.length === 0) {
    return null;
  }

  return contributions.reduce((best, candidate) => {
    if (!best) {
      return candidate;
    }

    const candidateValue = getContributionValue(candidate);
    const bestValue = getContributionValue(best);

    if (candidateValue > bestValue) {
      return candidate;
    }

    if (candidateValue < bestValue) {
      return best;
    }

    const candidateInferenceSupport =
      getInferenceSupport(candidate);

    const bestInferenceSupport =
      getInferenceSupport(best);

    if (
      candidateInferenceSupport >
      bestInferenceSupport
    ) {
      return candidate;
    }

    return best;
  }, null);
}

function buildRequirementMatch({
  requirement,
  requirementType,
  validContributions,
}) {
  const sameCapabilityAndMeasure =
    validContributions.filter(
      (contribution) =>
        contribution.source.measureId ===
        requirement.sourceMeasureId
    );

  const compatibleContributions =
    sameCapabilityAndMeasure.filter(
      (contribution) =>
        requirement.allowedDirections.includes(
          contribution.direction
        )
    );

  const incompatibleContributions =
    sameCapabilityAndMeasure.filter(
      (contribution) =>
        !requirement.allowedDirections.includes(
          contribution.direction
        )
    );

  const bestContribution =
    chooseBestContribution(
      compatibleContributions
    );

  const bestContributionValue =
    bestContribution
      ? getContributionValue(bestContribution)
      : 0;

  let status = "missing";
  const limitations = [];

  if (compatibleContributions.length > 0) {
    if (
      requirement.minimumContribution === null ||
      bestContributionValue >=
        requirement.minimumContribution
    ) {
      status = "satisfied";
    } else {
      status = "partially_satisfied";

      limitations.push(
        "Best contribution did not reach the minimum required value."
      );
    }
  } else if (
    sameCapabilityAndMeasure.length > 0
  ) {
    status = "incompatible";

    limitations.push(
      "Available contributions had incompatible directions."
    );
  } else {
    status = "missing";

    limitations.push(
      "No contribution was available for this requirement."
    );
  }

  if (
    bestContribution &&
    getInferenceSupport(bestContribution) < 0.5
  ) {
    limitations.push(
      "Best contribution has limited inference support."
    );
  }

  return {
    contributionKey:
      requirement.contributionKey,

    sourceMeasureId:
      requirement.sourceMeasureId,

    requirementType,

    weight: requirement.weight,

    minimumContribution:
      requirement.minimumContribution,

    allowedDirections: [
      ...requirement.allowedDirections,
    ],

    status,

    matchedContributionIds:
      bestContribution
        ? [bestContribution.contributionId]
        : [],

    compatibleContributionIds:
      compatibleContributions.map(
        (contribution) =>
          contribution.contributionId
      ),

    incompatibleContributionIds:
      incompatibleContributions.map(
        (contribution) =>
          contribution.contributionId
      ),

    bestContributionId:
      bestContribution
        ? bestContribution.contributionId
        : null,

    bestContributionValue,

    limitations,
  };
}

function buildUnmatchedContributions({
  originalContributions,
  contributionValidations,
  definition,
  allRequirementMatches,
}) {
  const unmatched = [];

  const requirementSourceMeasureIds = new Set(
    [
      ...asArray(
        definition.requiredContributions
      ),
      ...asArray(
        definition.optionalContributions
      ),
    ]
      .map(
        (requirement) =>
          requirement.sourceMeasureId
      )
      .filter(isValidString)
  );

  const compatibleIds = new Set(
    allRequirementMatches.flatMap(
      (requirementMatch) =>
        requirementMatch.compatibleContributionIds
    )
  );

  originalContributions.forEach(
    (contribution, index) => {
      const validation =
        contributionValidations[index];

      const contributionId =
        contribution &&
        isValidString(
          contribution.contributionId
        )
          ? contribution.contributionId
          : null;

      if (
        !validation ||
        validation.isValid !== true
      ) {
        unmatched.push({
          contributionId,
          reason: "invalid_contribution",
        });

        return;
      }

      if (
        contribution.capabilityId !==
        definition.capabilityId
      ) {
        unmatched.push({
          contributionId,
          reason: "capability_mismatch",
        });

        return;
      }

      if (
        !requirementSourceMeasureIds.has(
          contribution.source.measureId
        )
      ) {
        unmatched.push({
          contributionId,
          reason:
            "source_measure_not_required",
        });

        return;
      }

      if (
        !compatibleIds.has(
          contribution.contributionId
        )
      ) {
        unmatched.push({
          contributionId,
          reason: "direction_not_allowed",
        });
      }
    }
  );

  return unmatched;
}

function calculateCoverage({
  requiredMatches,
  optionalMatches,
}) {
  const requiredTotal =
    requiredMatches.length;

  const optionalTotal =
    optionalMatches.length;

  const requiredSatisfied =
    requiredMatches.filter(
      (match) =>
        match.status === SATISFIED_STATUS
    ).length;

  const optionalSatisfied =
    optionalMatches.filter(
      (match) =>
        match.status === SATISFIED_STATUS
    ).length;

  const totalRequirements =
    requiredTotal + optionalTotal;

  const totalSatisfied =
    requiredSatisfied + optionalSatisfied;

  return {
    required:
      requiredTotal === 0
        ? 1
        : roundToFourDecimals(
            requiredSatisfied /
              requiredTotal
          ),

    optional:
      optionalTotal === 0
        ? 1
        : roundToFourDecimals(
            optionalSatisfied /
              optionalTotal
          ),

    total:
      totalRequirements === 0
        ? 1
        : roundToFourDecimals(
            totalSatisfied /
              totalRequirements
          ),

    requiredSatisfied,

    requiredTotal,

    optionalSatisfied,

    optionalTotal,
  };
}

function buildSummary({
  requiredMatches,
  optionalMatches,
  matchedContributionIds,
  unmatchedContributions,
}) {
  const allMatches = [
    ...requiredMatches,
    ...optionalMatches,
  ];

  return {
    satisfied: allMatches.filter(
      (match) =>
        match.status === "satisfied"
    ).length,

    partiallySatisfied: allMatches.filter(
      (match) =>
        match.status ===
        "partially_satisfied"
    ).length,

    missing: allMatches.filter(
      (match) =>
        match.status === "missing"
    ).length,

    incompatible: allMatches.filter(
      (match) =>
        match.status === "incompatible"
    ).length,

    matchedContributionCount:
      matchedContributionIds.length,

    unmatchedContributionCount:
      unmatchedContributions.length,
  };
}

function buildRootLimitations({
  definition,
  coverage,
  requiredMatches,
  optionalMatches,
}) {
  const limitations = [];

  const coveragePolicy =
    isObject(definition.coveragePolicy)
      ? definition.coveragePolicy
      : {};

  if (
    typeof coveragePolicy.minimumRequiredCoverage ===
      "number" &&
    coverage.required <
      coveragePolicy.minimumRequiredCoverage
  ) {
    limitations.push(
      "Required contribution coverage is below the configured minimum."
    );
  }

  if (
    typeof coveragePolicy.minimumTotalCoverage ===
      "number" &&
    coverage.total <
      coveragePolicy.minimumTotalCoverage
  ) {
    limitations.push(
      "Total contribution coverage is below the configured minimum."
    );
  }

  const hasUnsatisfiedRequirements = [
    ...requiredMatches,
    ...optionalMatches,
  ].some(
    (match) =>
      match.status !== "satisfied"
  );

  if (
    hasUnsatisfiedRequirements &&
    coveragePolicy.allowPartialResult === false
  ) {
    limitations.push(
      "Partial capability matching is not allowed by the definition."
    );
  }

  if (
    requiredMatches.length === 0 &&
    optionalMatches.length === 0
  ) {
    limitations.push(
      "Capability definition contains no contribution requirements."
    );
  }

  return limitations;
}

function buildCapabilityContributionMatch({
  definition = {},
  contributions = [],
} = {}) {
  const sourceDefinition =
    isObject(definition)
      ? definition
      : {};

  const originalContributions =
    asArray(contributions);

  const contributionValidations =
    originalContributions.map(
      (contribution) =>
        validateCapabilityContribution(
          contribution
        )
    );

  const validContributions =
    originalContributions.filter(
      (contribution, index) =>
        contributionValidations[index]
          .isValid === true &&
        contribution.capabilityId ===
          sourceDefinition.capabilityId
    );

  const requiredMatches = asArray(
    sourceDefinition.requiredContributions
  ).map((requirement) =>
    buildRequirementMatch({
      requirement,
      requirementType: "required",
      validContributions,
    })
  );

  const optionalMatches = asArray(
    sourceDefinition.optionalContributions
  ).map((requirement) =>
    buildRequirementMatch({
      requirement,
      requirementType: "optional",
      validContributions,
    })
  );

  const allRequirementMatches = [
    ...requiredMatches,
    ...optionalMatches,
  ];

  const matchedContributionIds =
    Array.from(
      new Set(
        allRequirementMatches
          .map(
            (requirementMatch) =>
              requirementMatch.bestContributionId
          )
          .filter(isValidString)
      )
    );

  const unmatchedContributions =
    buildUnmatchedContributions({
      originalContributions,
      contributionValidations,
      definition: sourceDefinition,
      allRequirementMatches,
    });

  const coverage = calculateCoverage({
    requiredMatches,
    optionalMatches,
  });

  const summary = buildSummary({
    requiredMatches,
    optionalMatches,
    matchedContributionIds,
    unmatchedContributions,
  });

  const limitations =
    buildRootLimitations({
      definition: sourceDefinition,
      coverage,
      requiredMatches,
      optionalMatches,
    });

  return {
    matchStatus: "draft",

    capabilityId:
      sourceDefinition.capabilityId ||
      null,

    definitionStatus:
      sourceDefinition.definitionStatus ||
      null,

    requiredMatches,

    optionalMatches,

    coverage,

    summary,

    matchedContributionIds,

    unmatchedContributions,

    limitations,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildCapabilityContributionMatch,
};
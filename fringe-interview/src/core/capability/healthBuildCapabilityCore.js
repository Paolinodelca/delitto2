const {
  buildCapabilityDefinition,
} = require("./buildCapabilityDefinition");

const {
  validateCapabilityDefinition,
} = require("./validateCapabilityDefinition");

const {
  buildCapabilityContribution,
} = require("./buildCapabilityContribution");

const {
  validateCapabilityContribution,
} = require("./validateCapabilityContribution");

const {
  buildCapabilityContributionMatch,
} = require("./buildCapabilityContributionMatch");

const {
  validateCapabilityContributionMatch,
} = require("./validateCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("./buildCapabilityAggregationContext");

const {
  validateCapabilityAggregationContext,
} = require("./validateCapabilityAggregationContext");

const {
  buildCapabilityResult,
} = require("./buildCapabilityResult");

const {
  validateCapabilityResult,
} = require("./validateCapabilityResult");

function approximatelyEqual(
  first,
  second,
  tolerance = 0.0001
) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Number.isFinite(first) &&
    Number.isFinite(second) &&
    Math.abs(first - second) <= tolerance
  );
}

function buildHealthDefinition() {
  return buildCapabilityDefinition({
    capabilityId: "leadership_demo",

    label: "Leadership Demo",

    description:
      "Health-check capability used to validate the generic Capability Core.",

    purpose:
      "Verify deterministic capability contribution matching and aggregation.",

    requiredContributions: [
      {
        contributionKey: "management_scope",
        sourceMeasureId: "management_scope",
        weight: 0.5,
        minimumContribution: 0.4,

        allowedDirections: [
          "supporting",
          "contradicting",
          "neutral",
        ],
      },

      {
        contributionKey: "decision_accountability",
        sourceMeasureId: "decision_accountability",
        weight: 0.3,
        minimumContribution: 0.3,

        allowedDirections: [
          "supporting",
          "contradicting",
          "neutral",
        ],
      },
    ],

    optionalContributions: [
      {
        contributionKey: "context_relevance",
        sourceMeasureId: "context_relevance",
        weight: 0.2,
        minimumContribution: null,

        allowedDirections: [
          "supporting",
          "contradicting",
          "neutral",
        ],
      },
    ],

    aggregationPolicy: {
      strategy: "weighted_contribution_balance",
      supportingDirection: "supporting",
      contradictingDirection: "contradicting",
      neutralDirection: "neutral",
      normalizeWeights: true,
    },

    coveragePolicy: {
      minimumRequiredCoverage: 1,
      minimumTotalCoverage: 1,
      allowPartialResult: true,
    },

    thresholds: {
      weak: 0.3,
      moderate: 0.5,
      strong: 0.7,
      veryStrong: 0.85,
    },

    rationale:
      "Health definition for validating the generic Capability Core.",
  });
}

function buildHealthContributions() {
  return [
    buildCapabilityContribution({
      contributionId:
        "capability_health_management_scope",

      capabilityId: "leadership_demo",

      sourceMeasureId: "management_scope",

      sourceMeasureValue: 0.8,

      direction: "supporting",

      relevance: 0.9,

      inferenceSupport: 0.9,

      context: {
        contextType: "production_management",
        targetContextType: "production_management",
      },

      evidenceIds: [
        "ev_health_management_scope",
      ],

      rationale:
        "Observed management scope supports the demo capability.",
    }),

    buildCapabilityContribution({
      contributionId:
        "capability_health_decision_accountability",

      capabilityId: "leadership_demo",

      sourceMeasureId: "decision_accountability",

      sourceMeasureValue: 0.75,

      direction: "supporting",

      relevance: 0.8,

      inferenceSupport: 0.85,

      evidenceIds: [
        "ev_health_decision_accountability",
      ],

      rationale:
        "Observed decision accountability supports the demo capability.",
    }),

    buildCapabilityContribution({
      contributionId:
        "capability_health_context_relevance",

      capabilityId: "leadership_demo",

      sourceMeasureId: "context_relevance",

      sourceMeasureValue: 0.9,

      direction: "supporting",

      relevance: 1,

      inferenceSupport: 0.8,

      evidenceIds: [
        "ev_health_context_relevance",
      ],

      rationale:
        "Observed context is highly relevant to the target context.",
    }),
  ];
}

function healthBuildCapabilityCore() {
  try {
    const definition =
      buildHealthDefinition();

    const contributions =
      buildHealthContributions();

    const definitionValidation =
      validateCapabilityDefinition(
        definition
      );

    const contributionValidations =
      contributions.map(
        (contribution) =>
          validateCapabilityContribution(
            contribution
          )
      );

    const match =
      buildCapabilityContributionMatch({
        definition,
        contributions,
      });

    const matchValidation =
      validateCapabilityContributionMatch(
        match
      );

    const aggregationContext =
      buildCapabilityAggregationContext({
        definition,
        match,
        contributions,
      });

    const aggregationContextValidation =
      validateCapabilityAggregationContext(
        aggregationContext
      );

    const result =
      buildCapabilityResult({
        definition,
        match,
        aggregationContext,
      });

    const resultValidation =
      validateCapabilityResult(result);

    const allContributionsValid =
      contributionValidations.every(
        (validation) =>
          validation.isValid === true
      );

    const healthChecksPass =
      definitionValidation.isValid === true &&
      allContributionsValid &&
      matchValidation.isValid === true &&
      aggregationContextValidation.isValid === true &&
      resultValidation.isValid === true &&
      match.coverage.required === 1 &&
      match.coverage.total === 1 &&
      aggregationContext.entries.length === 3 &&
      aggregationContext.supportingEntries.length === 3 &&
      aggregationContext.contradictingEntries.length === 0 &&
      approximatelyEqual(
        aggregationContext.preparation
          .effectiveWeightTotal,
        1
      ) &&
      result.resultStatus === "draft" &&
      result.strength.net > 0 &&
      result.inferenceSupport.value > 0 &&
      result.coverage.sufficient === true;

    return {
      module: "Capability Core",

      status:
        healthChecksPass
          ? "PASS"
          : "FAIL",

      capabilityId:
        result.capabilityId,

      definitionValidation,

      contributionValidations,

      matchValidation,

      aggregationContextValidation,

      resultValidation,

      match: {
        requiredCoverage:
          match.coverage.required,

        optionalCoverage:
          match.coverage.optional,

        totalCoverage:
          match.coverage.total,

        matchedContributionCount:
          match.summary
            .matchedContributionCount,
      },

      aggregation: {
        entryCount:
          aggregationContext.entries.length,

        supportingEntryCount:
          aggregationContext
            .supportingEntries.length,

        contradictingEntryCount:
          aggregationContext
            .contradictingEntries.length,

        neutralEntryCount:
          aggregationContext
            .neutralEntries.length,

        effectiveWeightTotal:
          aggregationContext.preparation
            .effectiveWeightTotal,
      },

      result: {
        resultStatus:
          result.resultStatus,

        netStrength:
          result.strength.net,

        supportingStrength:
          result.strength.supporting,

        contradictingStrength:
          result.strength.contradicting,

        inferenceSupport:
          result.inferenceSupport.value,

        inferenceSupportBand:
          result.inferenceSupport.band,

        capabilityBand:
          result.capabilityBand,

        manifestationStatus:
          result.manifestationStatus,

        coverageSufficient:
          result.coverage.sufficient,
      },

      metadata: {
        version: "1.0",
        createdAt:
          new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      module: "Capability Core",

      status: "FAIL",

      capabilityId: null,

      definitionValidation: null,

      contributionValidations: [],

      matchValidation: null,

      aggregationContextValidation: null,

      resultValidation: null,

      match: {
        requiredCoverage: 0,
        optionalCoverage: 0,
        totalCoverage: 0,
        matchedContributionCount: 0,
      },

      aggregation: {
        entryCount: 0,
        supportingEntryCount: 0,
        contradictingEntryCount: 0,
        neutralEntryCount: 0,
        effectiveWeightTotal: 0,
      },

      result: {
        resultStatus: "invalid",
        netStrength: 0,
        supportingStrength: 0,
        contradictingStrength: 0,
        inferenceSupport: 0,
        inferenceSupportBand: "none",
        capabilityBand: "not_supported",
        manifestationStatus: "not_observed",
        coverageSufficient: false,
      },

      error: {
        name:
          error &&
          typeof error.name === "string"
            ? error.name
            : "Error",

        message:
          error &&
          typeof error.message === "string"
            ? error.message
            : "Unknown Capability Core health error.",
      },

      metadata: {
        version: "1.0",
        createdAt:
          new Date().toISOString(),
      },
    };
  }
}

module.exports = {
  healthBuildCapabilityCore,
};
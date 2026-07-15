const {
  buildPlantManagerLeadershipCapabilityProjection,
} = require("./buildPlantManagerLeadershipCapabilityProjection");

const {
  buildCapabilityDefinitionFromProjection,
} = require("../buildCapabilityDefinitionFromProjection");

const {
  buildCapabilityContribution,
} = require("../buildCapabilityContribution");

const {
  validateCapabilityContribution,
} = require("../validateCapabilityContribution");

const {
  buildCapabilityContributionMatch,
} = require("../buildCapabilityContributionMatch");

const {
  validateCapabilityContributionMatch,
} = require("../validateCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("../buildCapabilityAggregationContext");

const {
  validateCapabilityAggregationContext,
} = require("../validateCapabilityAggregationContext");

const {
  buildCapabilityResult,
} = require("../buildCapabilityResult");

const {
  validateCapabilityResult,
} = require("../validateCapabilityResult");

const {
  buildDecisionAccountabilityObservation,
} = require("../../measurement/decisionAccountability/buildDecisionAccountabilityObservation");

const {
  buildDecisionAccountabilityMeasureResult,
} = require("../../measurement/decisionAccountability/buildDecisionAccountabilityMeasureResult");

const {
  buildDecisionAccountabilityLeadershipContribution,
} = require("../adapters/buildDecisionAccountabilityLeadershipContribution");

function buildPlantManagerLeadershipDemoContributions(decisionContribution) {
  return [
    buildCapabilityContribution({
      contributionId:
        "leadership_demo_collective_direction",

      capabilityId:
        "leadership",

      sourceMeasureId:
        "collective_direction",

      sourceMeasureValue:
        0.85,

      direction:
        "supporting",

      relevance:
        0.95,

      inferenceSupport:
        0.9,

      context: {
        contextType:
          "industrial_site_transformation",

        targetContextType:
          "industrial_site_transformation",
      },

      evidenceIds: [
        "demo_ev_collective_direction_01",
        "demo_ev_collective_direction_02",
      ],

      rationale:
        "The hypothetical profile repeatedly establishes and sustains a clear transformation direction across multiple management layers.",

      metadata: {
        sourceMode:
          "manual_demo_configuration",
      },
    }),

    buildCapabilityContribution({
      contributionId:
        "leadership_demo_people_mobilization",

      capabilityId:
        "leadership",

      sourceMeasureId:
        "people_mobilization",

      sourceMeasureValue:
        0.8,

      direction:
        "supporting",

      relevance:
        0.9,

      inferenceSupport:
        0.85,

      context: {
        contextType:
          "large_multi_layer_workforce",

        targetContextType:
          "large_multi_layer_workforce",
      },

      evidenceIds: [
        "demo_ev_people_mobilization_01",
        "demo_ev_people_mobilization_02",
      ],

      rationale:
        "The hypothetical profile obtains coordinated adoption across supervisors, managers and production teams without relying only on formal authority.",

      metadata: {
        sourceMode:
          "manual_demo_configuration",
      },
    }),

    decisionContribution,

    buildCapabilityContribution({
      contributionId:
        "leadership_demo_execution_through_others",

      capabilityId:
        "leadership",

      sourceMeasureId:
        "execution_through_others",

      sourceMeasureValue:
        0.9,

      direction:
        "supporting",

      relevance:
        0.95,

      inferenceSupport:
        0.9,

      context: {
        contextType:
          "large_multi_layer_industrial_operation",

        targetContextType:
          "large_multi_layer_industrial_operation",
      },

      evidenceIds: [
        "demo_ev_execution_through_others_01",
        "demo_ev_execution_through_others_02",
      ],

      rationale:
        "The hypothetical profile consistently converts priorities into measurable collective delivery through managers, supervisors and cross-functional teams.",

      metadata: {
        sourceMode:
          "manual_demo_configuration",
      },
    }),

    buildCapabilityContribution({
      contributionId:
        "leadership_demo_people_development",

      capabilityId:
        "leadership",

      sourceMeasureId:
        "people_development",

      sourceMeasureValue:
        0.7,

      direction:
        "supporting",

      relevance:
        0.85,

      inferenceSupport:
        0.75,

      context: {
        contextType:
          "mixed_maturity_management_team",

        targetContextType:
          "mixed_maturity_management_team",
      },

      evidenceIds: [
        "demo_ev_people_development_01",
      ],

      rationale:
        "The hypothetical profile delegates progressively and develops managerial ownership, although the evidence is less extensive than for operational execution.",

      metadata: {
        sourceMode:
          "manual_demo_configuration",
      },
    }),

    buildCapabilityContribution({
      contributionId:
        "leadership_demo_organizational_influence",

      capabilityId:
        "leadership",

      sourceMeasureId:
        "organizational_influence",

      sourceMeasureValue:
        0.5,

      direction:
        "contradicting",

      relevance:
        0.8,

      inferenceSupport:
        0.78,

      context: {
        contextType:
          "corporate_cross_functional_governance",

        targetContextType:
          "corporate_cross_functional_governance",
      },

      evidenceIds: [
        "demo_ev_organizational_influence_01",
      ],

      rationale:
        "The hypothetical profile shows recurring difficulty influencing corporate stakeholders outside direct site authority.",

      metadata: {
        sourceMode:
          "manual_demo_configuration",
      },
    }),

    buildCapabilityContribution({
      contributionId:
        "leadership_demo_direction_under_uncertainty",

      capabilityId:
        "leadership",

      sourceMeasureId:
        "direction_under_uncertainty",

      sourceMeasureValue:
        0.8,

      direction:
        "supporting",

      relevance:
        0.9,

      inferenceSupport:
        0.85,

      context: {
        contextType:
          "organizational_transformation",

        targetContextType:
          "organizational_transformation",
      },

      evidenceIds: [
        "demo_ev_direction_under_uncertainty_01",
        "demo_ev_direction_under_uncertainty_02",
      ],

      rationale:
        "The hypothetical profile preserves priorities and decision coherence while adapting execution during transformation.",

      metadata: {
        sourceMode:
          "manual_demo_configuration",
      },
    }),
  ];
}

function buildPlantManagerLeadershipDemoResult() {
  const projection =
    buildPlantManagerLeadershipCapabilityProjection();

  const definition =
    buildCapabilityDefinitionFromProjection({
      projection,
    });

  const decisionObservation =
    buildDecisionAccountabilityObservation({
      observationId:
        "decision_accountability_obs_demo_001",

      decisionAuthority:
        "final",

      consequenceScope:
        "site",

      accountabilityEvidence:
        "explicit_with_outcomes",

      responsibilityContinuityMonths:
        30,

      context: {
        roleType:
          "plant_manager",

        decisionDomain:
          "industrial_operations",

        organizationType:
          "corporate_industrial",
      },

      evidenceIds: [
        "demo_ev_decision_accountability_01",
        "demo_ev_decision_accountability_02",
      ],

      inferenceSupportInputs: {
        evidenceQuality:
          0.9,

        sourceConvergence:
          0.85,

        consistency:
          0.9,

        coverage:
          0.8,
      },

      metadata: {
        sourceMode:
          "manual_demo_configuration",
      },
    });

  const decisionMeasureResult =
    buildDecisionAccountabilityMeasureResult({
      observation:
        decisionObservation,
    });

  const decisionContribution =
    buildDecisionAccountabilityLeadershipContribution({
      measureResult:
        decisionMeasureResult,

      projection,

      contributionId:
        "leadership_demo_decision_accountability",

      rationale:
        "Observed decision accountability supports Leadership in the Plant Manager transformation target.",
    });

  const contributions =
    buildPlantManagerLeadershipDemoContributions(
      decisionContribution
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
    validateCapabilityResult(
      result
    );

  return {
    scenarioId:
      "plant_manager_leadership_demo_strong_001",

    scenarioStatus:
      "demonstration",

    projection,

    definition,

    contributions,

    match,

    aggregationContext,

    result,

    measurementTraceability: {
      decisionAccountability: {
        observation:
          decisionObservation,

        measureResult:
          decisionMeasureResult,

        contribution:
          decisionContribution,
      },
    },

    scenarioContext: {
      candidateType:
        "hypothetical_professional_profile",

      targetId:
        projection.targetId,

      capabilityId:
        projection.capabilityId,

      interpretation:
        "Strong and broadly supported Leadership manifestation with one limited contradicting contribution in organizational influence.",
    },

    limitations: [
      "The candidate profile is hypothetical.",
      "Six capability contributions remain manually configured; decision accountability is derived from a deterministic measure result.",
      "The decision accountability observation is a demonstration input and was not extracted from CV or interview evidence.",
      "The result is not an empirically validated assessment.",
    ],

    validation: {
      contributions:
        contributionValidations,

      match:
        matchValidation,

      aggregationContext:
        aggregationContextValidation,

      result:
        resultValidation,
    },

    metadata: {
      version:
        "0.2",

      createdAt:
        new Date().toISOString(),
    },
  };
}

module.exports = {
  buildPlantManagerLeadershipDemoResult,
};

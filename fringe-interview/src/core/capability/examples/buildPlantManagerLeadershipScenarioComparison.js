const {
  buildPlantManagerLeadershipCapabilityProjection,
} = require("./buildPlantManagerLeadershipCapabilityProjection");

const {
  buildPlantManagerLeadershipDemoResult,
} = require("./buildPlantManagerLeadershipDemoResult");

const {
  buildCapabilityDefinitionFromProjection,
} = require("../buildCapabilityDefinitionFromProjection");

const {
  buildCapabilityContribution,
} = require("../buildCapabilityContribution");

const {
  buildCapabilityContributionMatch,
} = require("../buildCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("../buildCapabilityAggregationContext");

const {
  buildCapabilityResult,
} = require("../buildCapabilityResult");

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function buildScenario({
  scenarioId,
  label,
  description,
  contributions,
  definition,
  expectedInterpretation,
  limitations = [],
}) {
  const match =
    buildCapabilityContributionMatch({
      definition,
      contributions,
    });

  const aggregationContext =
    buildCapabilityAggregationContext({
      definition,
      match,
      contributions,
    });

  const result =
    buildCapabilityResult({
      definition,
      match,
      aggregationContext,
    });

  return {
    scenarioId,
    label,
    description,
    contributions,
    match,
    aggregationContext,
    result,
    expectedInterpretation,
    limitations: Array.isArray(limitations)
      ? [...limitations]
      : [],
  };
}

function buildEmergingContributions() {
  return [
    buildCapabilityContribution({
      contributionId: "leadership_emerging_collective_direction",
      capabilityId: "leadership",
      sourceMeasureId: "collective_direction",
      sourceMeasureValue: 0.65,
      direction: "supporting",
      relevance: 0.85,
      inferenceSupport: 0.72,
      evidenceIds: ["demo_emerging_collective_direction_01"],
      rationale:
        "The hypothetical profile provides direction in limited team contexts, but evidence across organizational layers is not available.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_emerging_people_mobilization",
      capabilityId: "leadership",
      sourceMeasureId: "people_mobilization",
      sourceMeasureValue: 0.48,
      direction: "supporting",
      relevance: 0.75,
      inferenceSupport: 0.62,
      evidenceIds: ["demo_emerging_people_mobilization_01"],
      rationale:
        "The hypothetical profile coordinates a small team but provides limited evidence of mobilization across a complex workforce.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_emerging_decision_accountability",
      capabilityId: "leadership",
      sourceMeasureId: "decision_accountability",
      sourceMeasureValue: 0.72,
      direction: "supporting",
      relevance: 0.85,
      inferenceSupport: 0.78,
      evidenceIds: [
        "demo_emerging_decision_accountability_01",
        "demo_emerging_decision_accountability_02",
      ],
      rationale:
        "The hypothetical profile assumes responsibility for meaningful operational decisions within a limited scope.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_emerging_execution_through_others",
      capabilityId: "leadership",
      sourceMeasureId: "execution_through_others",
      sourceMeasureValue: 0.52,
      direction: "supporting",
      relevance: 0.75,
      inferenceSupport: 0.65,
      evidenceIds: ["demo_emerging_execution_through_others_01"],
      rationale:
        "The hypothetical profile still relies materially on personal execution and has limited evidence of delivery through a layered organization.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_emerging_direction_under_uncertainty",
      capabilityId: "leadership",
      sourceMeasureId: "direction_under_uncertainty",
      sourceMeasureValue: 0.58,
      direction: "supporting",
      relevance: 0.8,
      inferenceSupport: 0.65,
      evidenceIds: ["demo_emerging_direction_under_uncertainty_01"],
      rationale:
        "The hypothetical profile shows some adaptability, but evidence from sustained transformation contexts is limited.",
    }),
  ];
}

function buildWeakContradictedContributions() {
  return [
    buildCapabilityContribution({
      contributionId: "leadership_weak_collective_direction",
      capabilityId: "leadership",
      sourceMeasureId: "collective_direction",
      sourceMeasureValue: 0.7,
      direction: "contradicting",
      relevance: 0.9,
      inferenceSupport: 0.82,
      evidenceIds: [
        "demo_weak_collective_direction_01",
        "demo_weak_collective_direction_02",
      ],
      rationale:
        "The hypothetical profile repeatedly changes priorities without maintaining a coherent collective direction.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_weak_people_mobilization",
      capabilityId: "leadership",
      sourceMeasureId: "people_mobilization",
      sourceMeasureValue: 0.65,
      direction: "contradicting",
      relevance: 0.9,
      inferenceSupport: 0.8,
      evidenceIds: ["demo_weak_people_mobilization_01"],
      rationale:
        "The hypothetical profile relies mainly on formal authority and produces persistent resistance rather than active alignment.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_weak_decision_accountability",
      capabilityId: "leadership",
      sourceMeasureId: "decision_accountability",
      sourceMeasureValue: 0.68,
      direction: "contradicting",
      relevance: 0.95,
      inferenceSupport: 0.85,
      evidenceIds: [
        "demo_weak_decision_accountability_01",
        "demo_weak_decision_accountability_02",
      ],
      rationale:
        "The hypothetical profile escalates difficult decisions and attributes negative outcomes primarily to other functions.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_weak_execution_through_others",
      capabilityId: "leadership",
      sourceMeasureId: "execution_through_others",
      sourceMeasureValue: 0.6,
      direction: "contradicting",
      relevance: 0.9,
      inferenceSupport: 0.78,
      evidenceIds: ["demo_weak_execution_through_others_01"],
      rationale:
        "The hypothetical profile compensates for weak delegation through direct personal intervention, limiting collective execution.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_weak_people_development",
      capabilityId: "leadership",
      sourceMeasureId: "people_development",
      sourceMeasureValue: 0.45,
      direction: "contradicting",
      relevance: 0.75,
      inferenceSupport: 0.68,
      evidenceIds: ["demo_weak_people_development_01"],
      rationale:
        "The hypothetical profile retains decisions and limits the growth of managerial autonomy.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_weak_organizational_influence",
      capabilityId: "leadership",
      sourceMeasureId: "organizational_influence",
      sourceMeasureValue: 0.55,
      direction: "contradicting",
      relevance: 0.85,
      inferenceSupport: 0.72,
      evidenceIds: ["demo_weak_organizational_influence_01"],
      rationale:
        "The hypothetical profile generates recurring conflict with peer functions and has limited influence outside direct authority.",
    }),

    buildCapabilityContribution({
      contributionId: "leadership_weak_direction_under_uncertainty",
      capabilityId: "leadership",
      sourceMeasureId: "direction_under_uncertainty",
      sourceMeasureValue: 0.6,
      direction: "contradicting",
      relevance: 0.85,
      inferenceSupport: 0.76,
      evidenceIds: ["demo_weak_direction_under_uncertainty_01"],
      rationale:
        "The hypothetical profile becomes reactive and inconsistent when priorities or operating conditions change.",
    }),
  ];
}

function buildPlantManagerLeadershipScenarioComparison() {
  const projection =
    buildPlantManagerLeadershipCapabilityProjection();

  const definition =
    buildCapabilityDefinitionFromProjection({
      projection,
    });

  const strongDemo =
    buildPlantManagerLeadershipDemoResult();

  const strong = {
    scenarioId: "plant_manager_leadership_strong",
    label: "Strong Leadership",
    description:
      "Broadly supported and mature Leadership manifestation with complete coverage and one limited contradicting contribution.",
    contributions: strongDemo.contributions,
    match: strongDemo.match,
    aggregationContext: strongDemo.aggregationContext,
    result: strongDemo.result,
    expectedInterpretation:
      "Strong, broadly supported Leadership manifestation suitable for the target, with a circumscribed limitation in organizational influence.",
    limitations: [...strongDemo.limitations],
  };

  const emerging =
    buildScenario({
      scenarioId: "plant_manager_leadership_emerging",
      label: "Emerging Leadership",
      description:
        "Partially supported Leadership manifestation with incomplete coverage, limited mobilization at scale and continued reliance on personal execution.",
      contributions: buildEmergingContributions(),
      definition,
      expectedInterpretation:
        "Emerging Leadership with meaningful decision accountability and direction, but incomplete coverage and limited evidence of execution through a layered organization.",
      limitations: [
        "The candidate scenario is hypothetical.",
        "People development and organizational influence were not observed.",
      ],
    });

  const weakContradicted =
    buildScenario({
      scenarioId: "plant_manager_leadership_weak_contradicted",
      label: "Weak / Contradicted Leadership",
      description:
        "Broadly observed but consistently contradicting Leadership manifestation across all projected components.",
      contributions: buildWeakContradictedContributions(),
      definition,
      expectedInterpretation:
        "Leadership is contradicted by broad and relatively well-supported evidence rather than being merely unobserved.",
      limitations: [
        "The candidate scenario is hypothetical.",
        "All contributions were configured to represent observed contradiction.",
      ],
    });

  const scenarioOrder = {
    plant_manager_leadership_strong: 0,
    plant_manager_leadership_emerging: 1,
    plant_manager_leadership_weak_contradicted: 2,
  };

  const orderedByNetStrength = [
    strong,
    emerging,
    weakContradicted,
  ]
    .map((scenario) => ({
      scenarioId: scenario.scenarioId,
      netStrength: scenario.result.strength.net,
      capabilityBand: scenario.result.capabilityBand,
      manifestationStatus: scenario.result.manifestationStatus,
      inferenceSupport: scenario.result.inferenceSupport.value,
      coverageTotal: scenario.match.coverage.total,
    }))
    .sort((first, second) => {
      const difference =
        second.netStrength -
        first.netStrength;

      if (Math.abs(difference) > 0.0000001) {
        return difference;
      }

      return (
        scenarioOrder[first.scenarioId] -
        scenarioOrder[second.scenarioId]
      );
    });

  const strongestScenario =
    orderedByNetStrength[0];

  const weakestScenario =
    orderedByNetStrength[
      orderedByNetStrength.length - 1
    ];

  const observations = [];

  if (
    strong.result.strength.net >
      emerging.result.strength.net &&
    emerging.result.strength.net >
      weakContradicted.result.strength.net
  ) {
    observations.push(
      "The shared Leadership model differentiates the three hypothetical profiles by net strength."
    );
  }

  if (
    strong.match.coverage.total === 1 &&
    emerging.match.coverage.total <
      strong.match.coverage.total
  ) {
    observations.push(
      "The emerging scenario has lower coverage than the strong scenario."
    );
  }

  if (
    weakContradicted.result.explainability
      .dominantDirection ===
      "contradicting"
  ) {
    observations.push(
      "The weak scenario is limited by contradicting evidence rather than by missing evidence."
    );
  }

  observations.push(
    "All scenarios were evaluated with the same projected CapabilityDefinition."
  );

  return {
    comparisonId:
      "plant_manager_leadership_scenario_comparison_v1",

    comparisonStatus:
      "demonstration",

    capabilityId:
      "leadership",

    targetId:
      projection.targetId,

    projectionId:
      projection.projectionId,

    definition,

    scenarios: {
      strong,
      emerging,
      weakContradicted,
    },

    comparison: {
      orderedByNetStrength,

      strongestScenarioId:
        strongestScenario
          ? strongestScenario.scenarioId
          : null,

      weakestScenarioId:
        weakestScenario
          ? weakestScenario.scenarioId
          : null,

      netStrengthSpread:
        strongestScenario &&
        weakestScenario
          ? roundToFourDecimals(
              strongestScenario.netStrength -
                weakestScenario.netStrength
            )
          : 0,

      capabilityBands: {
        strong:
          strong.result.capabilityBand,
        emerging:
          emerging.result.capabilityBand,
        weakContradicted:
          weakContradicted.result.capabilityBand,
      },

      manifestationStatuses: {
        strong:
          strong.result.manifestationStatus,
        emerging:
          emerging.result.manifestationStatus,
        weakContradicted:
          weakContradicted.result.manifestationStatus,
      },

      inferenceSupportBands: {
        strong:
          strong.result.inferenceSupport.band,
        emerging:
          emerging.result.inferenceSupport.band,
        weakContradicted:
          weakContradicted.result.inferenceSupport.band,
      },

      coverageSufficiency: {
        strong:
          strong.result.coverage.sufficient,
        emerging:
          emerging.result.coverage.sufficient,
        weakContradicted:
          weakContradicted.result.coverage.sufficient,
      },
    },

    observations,

    limitations: [
      "All candidate scenarios are hypothetical.",
      "Contribution values were configured manually.",
      "No parser, CV or interview evidence was used.",
      "The comparison validates architecture and model behaviour, not empirical accuracy.",
    ],

    metadata: {
      version: "0.1",
      createdAt:
        new Date().toISOString(),
    },
  };
}

module.exports = {
  buildPlantManagerLeadershipScenarioComparison,
};

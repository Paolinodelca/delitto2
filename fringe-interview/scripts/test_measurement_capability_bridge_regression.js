const {
  buildDecisionAccountabilityObservation,
} = require("../src/core/measurement/decisionAccountability/buildDecisionAccountabilityObservation");

const {
  buildDecisionAccountabilityMeasureResult,
} = require("../src/core/measurement/decisionAccountability/buildDecisionAccountabilityMeasureResult");

const {
  buildPlantManagerLeadershipCapabilityProjection,
} = require("../src/core/capability/examples/buildPlantManagerLeadershipCapabilityProjection");

const {
  buildDecisionAccountabilityLeadershipContribution,
} = require("../src/core/capability/adapters/buildDecisionAccountabilityLeadershipContribution");

const {
  buildCapabilityDefinitionFromProjection,
} = require("../src/core/capability/buildCapabilityDefinitionFromProjection");

const {
  buildCapabilityContributionMatch,
} = require("../src/core/capability/buildCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("../src/core/capability/buildCapabilityAggregationContext");

const {
  buildPlantManagerLeadershipDemoResult,
} = require("../src/core/capability/examples/buildPlantManagerLeadershipDemoResult");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function approximatelyEqual(first, second, tolerance = 0.000001) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Math.abs(first - second) <= tolerance
  );
}

function buildSnapshot() {
  const observation =
    buildDecisionAccountabilityObservation({
      observationId:
        "decision_accountability_bridge_health_obs",

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
        "bridge_health_ev_01",
        "bridge_health_ev_02",
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
    });

  const measureResult =
    buildDecisionAccountabilityMeasureResult({
      observation,
    });

  const projection =
    buildPlantManagerLeadershipCapabilityProjection();

  const contribution =
    buildDecisionAccountabilityLeadershipContribution({
      measureResult,
      projection,

      contributionId:
        "leadership_bridge_regression_decision_accountability",
    });

  const definition =
    buildCapabilityDefinitionFromProjection({
      projection,
    });

  const demo =
    buildPlantManagerLeadershipDemoResult();

  const otherContributions =
    demo.contributions.filter(
      (item) =>
        item.source.measureId !==
        "decision_accountability"
    );

  const contributions = [
    ...otherContributions.slice(0, 2),
    contribution,
    ...otherContributions.slice(2),
  ];

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

  const entry =
    aggregationContext.entries.find(
      (item) =>
        item.sourceMeasureId ===
        "decision_accountability"
    );

  return {
    observation: {
      observationType:
        observation.observationType,

      observationStatus:
        observation.observationStatus,

      decisionAuthority:
        observation.decisionAuthority,

      consequenceScope:
        observation.consequenceScope,

      accountabilityEvidence:
        observation.accountabilityEvidence,

      responsibilityContinuityMonths:
        observation.responsibilityContinuityMonths,
    },

    measure: {
      measureId:
        measureResult.measureId,

      resultStatus:
        measureResult.resultStatus,

      score:
        measureResult.score,

      band:
        measureResult.band,

      inferenceSupportValue:
        measureResult.inferenceSupport.value,

      inferenceSupportBand:
        measureResult.inferenceSupport.band,
    },

    contribution: {
      capabilityId:
        contribution.capabilityId,

      sourceMeasureId:
        contribution.source.measureId,

      sourceMeasureValue:
        contribution.source.measureValue,

      contributionValue:
        contribution.strength.contributionValue,

      relevance:
        contribution.strength.relevance,

      inferenceSupport:
        contribution.inferenceSupport,

      direction:
        contribution.direction,

      derivationType:
        contribution.extensions.derivation.derivationType,
    },

    aggregation: {
      requirementWeight:
        entry.requirementWeight,

      weightedContributionValue:
        entry.weightedContributionValue,
    },
  };
}

const first =
  buildSnapshot();

const second =
  buildSnapshot();

expect(
  JSON.stringify(first) ===
    JSON.stringify(second),
  "Snapshots must be identical."
);

expect(
  first.contribution.sourceMeasureValue ===
    first.measure.score,
  "sourceMeasureValue must equal measure score."
);

expect(
  first.contribution.contributionValue ===
    first.measure.score,
  "contributionValue must equal measure score."
);

expect(
  first.contribution.relevance === 1,
  "relevance must equal 1."
);

expect(
  approximatelyEqual(
    first.aggregation.weightedContributionValue,
    first.measure.score *
      first.aggregation.requirementWeight
  ),
  "weightedContributionValue must equal score × requirementWeight."
);

console.log(
  JSON.stringify(
    {
      test:
        "Measurement to Capability Bridge Regression",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      snapshot:
        first,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Measurement to Capability Bridge Regression Test: FAIL"
  );

  console.error(
    JSON.stringify(
      failures,
      null,
      2
    )
  );

  process.exit(1);
}

console.log(
  "Measurement to Capability Bridge Regression Test: PASS"
);

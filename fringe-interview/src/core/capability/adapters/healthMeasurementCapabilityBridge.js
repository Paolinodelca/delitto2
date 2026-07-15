const {
  buildDecisionAccountabilityObservation,
} = require("../../measurement/decisionAccountability/buildDecisionAccountabilityObservation");

const {
  validateDecisionAccountabilityObservation,
} = require("../../measurement/decisionAccountability/validateDecisionAccountabilityObservation");

const {
  buildDecisionAccountabilityMeasureResult,
} = require("../../measurement/decisionAccountability/buildDecisionAccountabilityMeasureResult");

const {
  validateDecisionAccountabilityMeasureResult,
} = require("../../measurement/decisionAccountability/validateDecisionAccountabilityMeasureResult");

const {
  buildPlantManagerLeadershipCapabilityProjection,
} = require("../examples/buildPlantManagerLeadershipCapabilityProjection");

const {
  validateCapabilityProjection,
} = require("../validateCapabilityProjection");

const {
  buildDecisionAccountabilityLeadershipContribution,
} = require("./buildDecisionAccountabilityLeadershipContribution");

const {
  validateCapabilityContribution,
} = require("../validateCapabilityContribution");

const {
  buildCapabilityDefinitionFromProjection,
} = require("../buildCapabilityDefinitionFromProjection");

const {
  validateCapabilityDefinition,
} = require("../validateCapabilityDefinition");

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
  buildPlantManagerLeadershipDemoResult,
} = require("../examples/buildPlantManagerLeadershipDemoResult");

function approximatelyEqual(first, second, tolerance = 0.000001) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Number.isFinite(first) &&
    Number.isFinite(second) &&
    Math.abs(first - second) <= tolerance
  );
}

function includesAll(container, expected) {
  const source = new Set(
    Array.isArray(container)
      ? container
      : []
  );

  return (
    Array.isArray(expected) &&
    expected.every(
      (item) =>
        source.has(item)
    )
  );
}

function buildStrongObservation() {
  return buildDecisionAccountabilityObservation({
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
}

function buildMainPipeline() {
  const observation =
    buildStrongObservation();

  const observationValidation =
    validateDecisionAccountabilityObservation(
      observation
    );

  const measureResult =
    buildDecisionAccountabilityMeasureResult({
      observation,
    });

  const measureResultValidation =
    validateDecisionAccountabilityMeasureResult(
      measureResult
    );

  const projection =
    buildPlantManagerLeadershipCapabilityProjection();

  const projectionValidation =
    validateCapabilityProjection(
      projection
    );

  const contribution =
    buildDecisionAccountabilityLeadershipContribution({
      measureResult,
      projection,

      contributionId:
        "leadership_bridge_health_decision_accountability",
    });

  const contributionValidation =
    validateCapabilityContribution(
      contribution
    );

  const definition =
    buildCapabilityDefinitionFromProjection({
      projection,
    });

  const definitionValidation =
    validateCapabilityDefinition(
      definition
    );

  /*
   * Reuse the six unchanged demo contributions so that all
   * projected weights are available. The bridge contribution
   * replaces only decision_accountability.
   */
  const demo =
    buildPlantManagerLeadershipDemoResult();

  const otherContributions =
    demo.contributions.filter(
      (item) =>
        item &&
        item.source &&
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

  const capabilityResult =
    buildCapabilityResult({
      definition,
      match,
      aggregationContext,
    });

  const capabilityResultValidation =
    validateCapabilityResult(
      capabilityResult
    );

  const aggregationEntry =
    aggregationContext.entries.find(
      (entry) =>
        entry.sourceMeasureId ===
        "decision_accountability"
    ) || null;

  return {
    observation,
    observationValidation,
    measureResult,
    measureResultValidation,
    projection,
    projectionValidation,
    contribution,
    contributionValidation,
    definition,
    definitionValidation,
    match,
    matchValidation,
    aggregationContext,
    aggregationContextValidation,
    capabilityResult,
    capabilityResultValidation,
    aggregationEntry,
  };
}

function buildNotObservedPipeline(projection) {
  const observation =
    buildDecisionAccountabilityObservation({
      observationId:
        "decision_accountability_bridge_not_observed",
    });

  const measureResult =
    buildDecisionAccountabilityMeasureResult({
      observation,
    });

  const contribution =
    buildDecisionAccountabilityLeadershipContribution({
      measureResult,
      projection,

      contributionId:
        "leadership_bridge_not_observed_decision_accountability",
    });

  return {
    observation,
    measureResult,
    contribution,
  };
}

function healthMeasurementCapabilityBridge() {
  const errors = [];
  const warnings = [];

  const checks = {
    observationValid: false,
    measureResultValid: false,
    projectionValid: false,
    contributionValid: false,
    definitionValid: false,
    matchValid: false,
    aggregationContextValid: false,
    capabilityResultValid: false,

    measureScorePreserved: false,
    inferenceSupportPreserved: false,
    noDoubleWeighting: false,
    evidenceTraceabilityPreserved: false,
    notObservedSemanticsPreserved: false,
  };

  const snapshot = {
    measureId: null,
    measureScore: null,
    measureInferenceSupport: null,
    contributionValue: null,
    adapterRelevance: null,
    requirementWeight: null,
    weightedContributionValue: null,
    capabilityId: null,
    capabilityBand: null,
    manifestationStatus: null,
  };

  try {
    const pipeline =
      buildMainPipeline();

    checks.observationValid =
      pipeline.observationValidation.isValid === true;

    checks.measureResultValid =
      pipeline.measureResultValidation.isValid === true;

    checks.projectionValid =
      pipeline.projectionValidation.isValid === true;

    checks.contributionValid =
      pipeline.contributionValidation.isValid === true;

    checks.definitionValid =
      pipeline.definitionValidation.isValid === true;

    checks.matchValid =
      pipeline.matchValidation.isValid === true;

    checks.aggregationContextValid =
      pipeline.aggregationContextValidation.isValid === true;

    checks.capabilityResultValid =
      pipeline.capabilityResultValidation.isValid === true;

    checks.measureScorePreserved =
      approximatelyEqual(
        pipeline.contribution.strength.contributionValue,
        pipeline.measureResult.score
      );

    checks.inferenceSupportPreserved =
      approximatelyEqual(
        pipeline.contribution.inferenceSupport,
        pipeline.measureResult.inferenceSupport.value
      );

    const entry =
      pipeline.aggregationEntry;

    checks.noDoubleWeighting =
      Boolean(entry) &&
      pipeline.contribution.strength.relevance === 1 &&
      approximatelyEqual(
        entry.weightedContributionValue,
        pipeline.measureResult.score *
          entry.requirementWeight
      );

    checks.evidenceTraceabilityPreserved =
      includesAll(
        pipeline.contribution.evidenceIds,
        pipeline.measureResult.evidenceIds
      ) &&
      includesAll(
        pipeline.capabilityResult.evidenceIds,
        pipeline.measureResult.evidenceIds
      );

    const notObserved =
      buildNotObservedPipeline(
        pipeline.projection
      );

    checks.notObservedSemanticsPreserved =
      notObserved.measureResult.resultStatus ===
        "not_observed" &&
      notObserved.measureResult.score === 0 &&
      notObserved.contribution.source.measureValue === 0 &&
      notObserved.contribution.direction ===
        "supporting" &&
      notObserved.contribution.inferenceSupport === 0 &&
      notObserved.contribution.direction !==
        "contradicting";

    snapshot.measureId =
      pipeline.measureResult.measureId;

    snapshot.measureScore =
      pipeline.measureResult.score;

    snapshot.measureInferenceSupport =
      pipeline.measureResult.inferenceSupport.value;

    snapshot.contributionValue =
      pipeline.contribution.strength.contributionValue;

    snapshot.adapterRelevance =
      pipeline.contribution.strength.relevance;

    snapshot.requirementWeight =
      entry
        ? entry.requirementWeight
        : null;

    snapshot.weightedContributionValue =
      entry
        ? entry.weightedContributionValue
        : null;

    snapshot.capabilityId =
      pipeline.capabilityResult.capabilityId;

    snapshot.capabilityBand =
      pipeline.capabilityResult.capabilityBand;

    snapshot.manifestationStatus =
      pipeline.capabilityResult.manifestationStatus;

    [
      pipeline.observationValidation,
      pipeline.measureResultValidation,
      pipeline.projectionValidation,
      pipeline.contributionValidation,
      pipeline.definitionValidation,
      pipeline.matchValidation,
      pipeline.aggregationContextValidation,
      pipeline.capabilityResultValidation,
    ].forEach((validation) => {
      if (
        validation &&
        Array.isArray(validation.warnings)
      ) {
        warnings.push(
          ...validation.warnings
        );
      }
    });

    Object.entries(checks).forEach(
      ([checkName, passed]) => {
        if (passed !== true) {
          errors.push(
            `Bridge check failed: ${checkName}.`
          );
        }
      }
    );
  } catch (error) {
    errors.push(
      error instanceof Error
        ? error.message
        : String(error)
    );
  }

  return {
    healthy:
      Object.values(checks).every(
        (value) =>
          value === true
      ) &&
      errors.length === 0,

    checks,

    snapshot,

    errors,

    warnings:
      Array.from(
        new Set(warnings)
      ),

    metadata: {
      version: "1.0",
      createdAt:
        new Date().toISOString(),
    },
  };
}

module.exports = {
  healthMeasurementCapabilityBridge,
};

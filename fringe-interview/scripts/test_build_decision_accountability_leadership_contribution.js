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
  buildCapabilityDefinitionFromProjection,
} = require("../src/core/capability/buildCapabilityDefinitionFromProjection");

const {
  buildDecisionAccountabilityLeadershipContribution,
} = require("../src/core/capability/adapters/buildDecisionAccountabilityLeadershipContribution");

const {
  validateCapabilityContribution,
} = require("../src/core/capability/validateCapabilityContribution");

const {
  buildCapabilityContributionMatch,
} = require("../src/core/capability/buildCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("../src/core/capability/buildCapabilityAggregationContext");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function approximatelyEqual(first, second, tolerance = 0.0001) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Math.abs(first - second) <= tolerance
  );
}

function sanitizeCreatedAt(value) {
  if (Array.isArray(value)) return value.map(sanitizeCreatedAt);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        key === "createdAt" ? null : sanitizeCreatedAt(nestedValue),
      ])
    );
  }

  return value;
}

function buildStrongMeasureResult() {
  return buildDecisionAccountabilityMeasureResult({
    observation: buildDecisionAccountabilityObservation({
      observationId: "decision_accountability_adapter_test_001",
      decisionAuthority: "final",
      consequenceScope: "site",
      accountabilityEvidence: "explicit_with_outcomes",
      responsibilityContinuityMonths: 30,
      context: {
        contextType: "industrial_operations",
        roleType: "plant_manager",
      },
      evidenceIds: ["adapter_ev_001", "adapter_ev_002"],
      inferenceSupportInputs: {
        evidenceQuality: 0.9,
        sourceConvergence: 0.85,
        consistency: 0.9,
        coverage: 0.8,
      },
    }),
  });
}

const projection = buildPlantManagerLeadershipCapabilityProjection();
const measureResult = buildStrongMeasureResult();

const contribution =
  buildDecisionAccountabilityLeadershipContribution({
    measureResult,
    projection,
    contributionId: "decision_accountability_adapter_test_contribution",
  });

const contributionValidation =
  validateCapabilityContribution(contribution);

/* Scenario A */
expect(contributionValidation.isValid === true, `A: ${contributionValidation.errors.join("; ")}`);
expect(contribution.capabilityId === "leadership", "A: capabilityId");
expect(contribution.source.measureId === "decision_accountability", "A: measureId");
expect(contribution.direction === "supporting", "A: direction");
expect(contribution.source.measureValue === measureResult.score, "A: source value");
expect(contribution.inferenceSupport === measureResult.inferenceSupport.value, "A: inference support");
expect(JSON.stringify(contribution.evidenceIds) === JSON.stringify(measureResult.evidenceIds), "A: evidenceIds");

/* Scenario B */
expect(contribution.metadata.sourceType === "measure_result", "B: sourceType");
expect(contribution.metadata.adapterId === "decision_accountability_to_leadership_v1", "B: adapterId");
expect(contribution.extensions.sourceTraceability.observationId === measureResult.observationId, "B: observationId");
expect(contribution.extensions.projectionTraceability.componentId === "decision_accountability", "B: componentId");
expect(contribution.extensions.derivation.derivationType === "single_measure_result", "B: derivationType");
expect(
  JSON.stringify(contribution.extensions.derivation.sourceMeasureIds) ===
    JSON.stringify(["decision_accountability"]),
  "B: sourceMeasureIds"
);

/* Scenario C — no double weighting */
const definition = buildCapabilityDefinitionFromProjection({ projection });
const match = buildCapabilityContributionMatch({
  definition,
  contributions: [contribution],
});
const aggregationContext = buildCapabilityAggregationContext({
  definition,
  match,
  contributions: [contribution],
});
const entry = aggregationContext.entries.find(
  (item) => item.sourceMeasureId === "decision_accountability"
);

expect(contribution.strength.relevance === 1, "C: adapter relevance must be 1");
expect(contribution.strength.contributionValue === measureResult.score, "C: contributionValue must equal measure score");
expect(entry && entry.requirementWeight === 0.2, "C: requirement weight");
expect(entry && entry.effectiveWeight === 1, "C: normalized effective weight");
expect(
  entry && approximatelyEqual(entry.weightedContributionValue, measureResult.score),
  "C: projection weight must not be applied twice"
);
expect(
  contribution.extensions.projectionTraceability.configuredWeight === 0.2,
  "C: configured projection weight traceability"
);

/* Scenario D — not observed */
const notObservedMeasure = buildDecisionAccountabilityMeasureResult({
  observation: buildDecisionAccountabilityObservation({
    observationId: "decision_accountability_not_observed_adapter",
  }),
});
const notObservedContribution =
  buildDecisionAccountabilityLeadershipContribution({
    measureResult: notObservedMeasure,
    projection,
  });
expect(notObservedContribution.source.measureValue === 0, "D: value");
expect(notObservedContribution.direction === "supporting", "D: direction");
expect(notObservedContribution.inferenceSupport === 0, "D: inference");
expect(notObservedContribution.metadata.derivationStatus === "not_observed", "D: status");

/* Scenario E — invalid measure */
const invalidMeasure = { ...measureResult };
delete invalidMeasure.measureId;
let invalidContribution;
try {
  invalidContribution = buildDecisionAccountabilityLeadershipContribution({
    measureResult: invalidMeasure,
    projection,
  });
} catch (error) {
  failures.push(`E: threw ${error.message}`);
}
expect(invalidContribution && invalidContribution.source.measureValue === 0, "E: value");
expect(invalidContribution && invalidContribution.inferenceSupport === 0, "E: inference");
expect(invalidContribution && invalidContribution.metadata.derivationStatus === "invalid_source_measure", "E: status");
expect(invalidContribution && invalidContribution.extensions.derivationLimitations.length > 0, "E: limitations");

/* Scenario F — projection without component */
const projectionWithoutComponent = {
  ...projection,
  componentProjections: projection.componentProjections.filter(
    (component) => component.componentId !== "decision_accountability"
  ),
};
const invalidProjectionContribution =
  buildDecisionAccountabilityLeadershipContribution({
    measureResult,
    projection: projectionWithoutComponent,
  });
expect(invalidProjectionContribution.source.measureValue === 0, "F: value");
expect(invalidProjectionContribution.strength.relevance === 0, "F: relevance");
expect(invalidProjectionContribution.metadata.derivationStatus === "invalid_projection", "F: status");

/* Scenario G/H — direction override */
const contradictingContribution =
  buildDecisionAccountabilityLeadershipContribution({
    measureResult,
    projection,
    extensions: { directionOverride: "contradicting" },
  });
expect(contradictingContribution.direction === "contradicting", "G: direction");
expect(contradictingContribution.extensions.derivation.directionOverrideApplied === "contradicting", "G: applied");

const neutralOverrideContribution =
  buildDecisionAccountabilityLeadershipContribution({
    measureResult,
    projection,
    extensions: { directionOverride: "neutral" },
  });
expect(neutralOverrideContribution.direction === "supporting", "H: direction");
expect(neutralOverrideContribution.extensions.derivation.directionOverrideApplied === null, "H: ignored");

/* Scenario I — immutability and canonical precedence */
const metadataInput = { customField: "preserved", sourceType: "override" };
const extensionsInput = {
  customExtension: "preserved",
  sourceTraceability: { fake: true },
};
const before = {
  measure: JSON.stringify(measureResult),
  projection: JSON.stringify(projection),
  metadata: JSON.stringify(metadataInput),
  extensions: JSON.stringify(extensionsInput),
};
const immutableContribution =
  buildDecisionAccountabilityLeadershipContribution({
    measureResult,
    projection,
    metadata: metadataInput,
    extensions: extensionsInput,
  });
expect(JSON.stringify(measureResult) === before.measure, "I: measure mutated");
expect(JSON.stringify(projection) === before.projection, "I: projection mutated");
expect(JSON.stringify(metadataInput) === before.metadata, "I: metadata mutated");
expect(JSON.stringify(extensionsInput) === before.extensions, "I: extensions mutated");
expect(immutableContribution.metadata.sourceType === "measure_result", "I: metadata precedence");
expect(immutableContribution.extensions.sourceTraceability.fake === undefined, "I: extensions precedence");

/* Scenario J — determinism */
const first = buildDecisionAccountabilityLeadershipContribution({ measureResult, projection });
const second = buildDecisionAccountabilityLeadershipContribution({ measureResult, projection });
expect(
  JSON.stringify(sanitizeCreatedAt(first)) === JSON.stringify(sanitizeCreatedAt(second)),
  "J: deterministic output"
);

console.log(
  JSON.stringify(
    {
      test: "Decision Accountability to Leadership Adapter v0.1",
      status: failures.length === 0 ? "PASS" : "FAIL",
      measureScore: measureResult.score,
      adapterRelevance: contribution.strength.relevance,
      contributionValue: contribution.strength.contributionValue,
      requirementWeight: entry ? entry.requirementWeight : null,
      effectiveWeight: entry ? entry.effectiveWeight : null,
      weightedContributionValue: entry ? entry.weightedContributionValue : null,
      contributionValidation,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error("Decision Accountability Leadership Contribution Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Decision Accountability Leadership Contribution Test: PASS");

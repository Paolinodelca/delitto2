const {
  buildPlantManagerLeadershipDemoResult,
} = require("../src/core/capability/examples/buildPlantManagerLeadershipDemoResult");

const {
  validateDecisionAccountabilityObservation,
} = require("../src/core/measurement/decisionAccountability/validateDecisionAccountabilityObservation");

const {
  validateDecisionAccountabilityMeasureResult,
} = require("../src/core/measurement/decisionAccountability/validateDecisionAccountabilityMeasureResult");

const {
  validateCapabilityContribution,
} = require("../src/core/capability/validateCapabilityContribution");

const {
  validateCapabilityContributionMatch,
} = require("../src/core/capability/validateCapabilityContributionMatch");

const {
  validateCapabilityAggregationContext,
} = require("../src/core/capability/validateCapabilityAggregationContext");

const {
  validateCapabilityResult,
} = require("../src/core/capability/validateCapabilityResult");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function approximatelyEqual(first, second, tolerance = 0.0002) {
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

const demo = buildPlantManagerLeadershipDemoResult();

expect(demo.scenarioStatus === "demonstration", "A: scenarioStatus");
expect(demo.contributions.length === 7, "A: contribution count");
expect(Boolean(demo.measurementTraceability), "A: measurementTraceability");

const trace = demo.measurementTraceability.decisionAccountability;
expect(Boolean(trace), "B: decisionAccountability traceability");

const observationValidation =
  validateDecisionAccountabilityObservation(trace.observation);
const measureValidation =
  validateDecisionAccountabilityMeasureResult(trace.measureResult);
const contributionValidation =
  validateCapabilityContribution(trace.contribution);

expect(observationValidation.isValid === true, `B observation: ${observationValidation.errors.join("; ")}`);
expect(measureValidation.isValid === true, `B measure: ${measureValidation.errors.join("; ")}`);
expect(contributionValidation.isValid === true, `B contribution: ${contributionValidation.errors.join("; ")}`);

expect(trace.measureResult.score === 0.9625, "B: measure score");
expect(trace.measureResult.inferenceSupport.value === 0.8675, "B: inference support");
expect(trace.contribution.source.measureValue === trace.measureResult.score, "B: contribution source value");
expect(trace.contribution.inferenceSupport === trace.measureResult.inferenceSupport.value, "B: contribution inference support");
expect(trace.contribution.strength.relevance === 1, "B: adapter relevance");
expect(trace.contribution.extensions.projectionTraceability.configuredWeight === 0.2, "B: configured weight traceability");

const decisionContributions = demo.contributions.filter(
  (contribution) => contribution.source.measureId === "decision_accountability"
);
expect(decisionContributions.length === 1, "C: exactly one decision accountability contribution");
expect(decisionContributions[0] === trace.contribution, "C: derived contribution is in array");
expect(decisionContributions[0].metadata.adapterId === "decision_accountability_to_leadership_v1", "C: adapter metadata");
expect(decisionContributions[0].metadata.sourceMode === "deterministic_measure_adapter", "C: sourceMode");

const contributionValidations = demo.contributions.map(validateCapabilityContribution);
contributionValidations.forEach((validation, index) => {
  expect(validation.isValid === true, `D: contribution ${index}: ${validation.errors.join("; ")}`);
});

const matchValidation = validateCapabilityContributionMatch(demo.match);
const aggregationValidation = validateCapabilityAggregationContext(demo.aggregationContext);
const resultValidation = validateCapabilityResult(demo.result);

expect(matchValidation.isValid === true, `D match: ${matchValidation.errors.join("; ")}`);
expect(aggregationValidation.isValid === true, `D aggregation: ${aggregationValidation.errors.join("; ")}`);
expect(resultValidation.isValid === true, `D result: ${resultValidation.errors.join("; ")}`);

expect(demo.match.coverage.required === 1, "E: required coverage");
expect(demo.match.coverage.optional === 1, "E: optional coverage");
expect(demo.match.coverage.total === 1, "E: total coverage");
expect(demo.result.capabilityBand === "strong", "E: capability band");
expect(demo.result.manifestationStatus === "strongly_observed", "E: manifestation status");
expect(demo.result.inferenceSupport.band === "very_high", "E: inference band");

expect(approximatelyEqual(demo.result.strength.supporting, 0.7526), `F: supporting ${demo.result.strength.supporting}`);
expect(approximatelyEqual(demo.result.strength.contradicting, 0.028), `F: contradicting ${demo.result.strength.contradicting}`);
expect(approximatelyEqual(demo.result.strength.net, 0.7246), `F: net ${demo.result.strength.net}`);
expect(approximatelyEqual(demo.result.inferenceSupport.value, 0.8606), `F: inference ${demo.result.inferenceSupport.value}`);

const decisionEntry = demo.aggregationContext.entries.find(
  (entry) => entry.sourceMeasureId === "decision_accountability"
);
expect(Boolean(decisionEntry), "G: decision aggregation entry");
expect(decisionEntry && decisionEntry.requirementWeight === 0.2, "G: requirement weight");
expect(decisionEntry && approximatelyEqual(decisionEntry.contributionValue, 0.9625), "G: contribution value");
expect(decisionEntry && approximatelyEqual(decisionEntry.weightedContributionValue, 0.1925), "G: weighted value");

expect(
  demo.limitations.includes(
    "Six capability contributions remain manually configured; decision accountability is derived from a deterministic measure result."
  ),
  "H: updated limitation"
);

const first = buildPlantManagerLeadershipDemoResult();
const second = buildPlantManagerLeadershipDemoResult();
expect(
  JSON.stringify(sanitizeCreatedAt(first)) === JSON.stringify(sanitizeCreatedAt(second)),
  "I: deterministic output"
);

console.log(
  JSON.stringify(
    {
      test: "Plant Manager Leadership Demo Result v0.2",
      status: failures.length === 0 ? "PASS" : "FAIL",
      contributionCount: demo.contributions.length,
      decisionMeasureScore: trace.measureResult.score,
      decisionAdapterRelevance: trace.contribution.strength.relevance,
      decisionRequirementWeight: decisionEntry ? decisionEntry.requirementWeight : null,
      decisionWeightedContributionValue: decisionEntry ? decisionEntry.weightedContributionValue : null,
      supportingStrength: demo.result.strength.supporting,
      contradictingStrength: demo.result.strength.contradicting,
      netStrength: demo.result.strength.net,
      inferenceSupport: demo.result.inferenceSupport,
      capabilityBand: demo.result.capabilityBand,
      manifestationStatus: demo.result.manifestationStatus,
      observationValidation,
      measureValidation,
      contributionValidation,
      matchValidation,
      aggregationValidation,
      resultValidation,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error("Plant Manager Leadership Demo Result Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Plant Manager Leadership Demo Result Test: PASS");

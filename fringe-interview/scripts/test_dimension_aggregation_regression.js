const assert = require("assert");
const dimension = require("../src/core/dimension");
const at = "2026-07-23T10:00:00.000Z";
function make(id, type, value, confidence) {
  return dimension.buildDimensionContribution({
    id, measurementId: `measurement_${id}`, dimensionId: "decision_clarity",
    contributionType: type, contributionValue: value, confidence,
    provenance: { measurementResultRef: `result_${id}`, sourceRefs: [] },
    metadata: { version: "1.0", createdAt: at, updatedAt: at }, extensions: {},
  }, { now: at });
}
const items = [make("b", "contradicting", 0.4, 0.5), make("a", "supporting", 0.8, 1)];
const state = dimension.aggregateDimensionContributions("decision_clarity", items, { now: at });
assert.deepStrictEqual(Object.keys(state), [
  "dimensionId", "dimensionType", "stateType", "estimate", "direction", "coverage", "confidence", "consistency",
  "stability", "evidenceQuality", "sourceReliability", "measurementCount", "independentMeasurementCount", "resultCount",
  "sourceDiversity", "contextDistribution", "contradictions", "supportingMeasurementResultRefs",
  "supportingCapabilityResultRefs", "derivationTrace", "metadata", "extensions",
]);
assert.strictEqual(state.dimensionType, "elementary");
assert.strictEqual(state.stateType, "observed");
assert.strictEqual(state.estimate, 0.7);
assert.strictEqual(state.confidence, 0.75);
assert.strictEqual(state.coverage, 0.5);
assert.strictEqual(state.direction, "mixed");
assert.deepStrictEqual(state.extensions.aggregation.contributionRefs, [
  "dimensionContribution:a", "dimensionContribution:b",
]);
assert.deepStrictEqual(state.supportingMeasurementResultRefs, ["result_a", "result_b"]);
assert.strictEqual(state.extensions.aggregation.strategy, "confidence_weighted_signed_mean_v1");
assert.strictEqual(typeof state.extensions.aggregation.fingerprint, "string");
assert.strictEqual(state.extensions.aggregation.fingerprint.length, 64);
assert.deepStrictEqual(
  dimension.aggregateDimensionContributions("decision_clarity", [...items].reverse(), { now: at }),
  state,
);
const allowed = new Set([
  "buildDimensionKnowledgeState", "DIMENSION_TYPES", "STATE_TYPES", "DIRECTIONS", "validateDimensionKnowledgeState",
  "healthBuildDimensionKnowledgeState", "buildDimensionContribution", "validateDimensionContribution",
  "buildMeasurementDimensionMapping", "validateMeasurementDimensionMapping", "mapMeasurementResultToDimensionContributions",
  "aggregateDimensionContributions",
  "buildKnowledgeLedger", "validateKnowledgeLedger", "appendDimensionContributions",
  "buildKnowledgeSnapshot", "validateKnowledgeSnapshot",
  "buildDerivedKnowledgeRule", "validateDerivedKnowledgeRule",
  "buildDerivedKnowledgeResult", "validateDerivedKnowledgeResult", "evaluateDerivedKnowledgeRules", "buildDerivedDimensionMapping", "validateDerivedDimensionMapping", "buildDerivedDimensionKnowledgeState", "validateDerivedDimensionKnowledgeState", "buildDerivedDimensionKnowledgeStates",
]);
assert.deepStrictEqual(new Set(Object.keys(dimension)), allowed);
assert.strictEqual(dimension.healthDimensionAggregation, undefined);
console.log("test_dimension_aggregation_regression PASS");

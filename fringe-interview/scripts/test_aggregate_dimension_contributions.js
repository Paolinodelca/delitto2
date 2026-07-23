const assert = require("assert");
const dimension = require("../src/core/dimension");

const at = "2026-07-23T10:00:00.000Z";
function contribution(id, type, value, confidence = 1, measurementId = `measurement_${id}`, dimensionId = "ownership") {
  return dimension.buildDimensionContribution({
    id,
    measurementId,
    dimensionId,
    contributionType: type,
    contributionValue: value,
    confidence,
    provenance: { measurementResultRef: `result_${id}`, sourceRefs: [`mapping:mapping_${id}`] },
    metadata: { version: "1.0", createdAt: at, updatedAt: at },
    extensions: {},
  }, { now: at });
}

const supporting = contribution("supporting_1", "supporting", 0.8);
const supportingState = dimension.aggregateDimensionContributions("ownership", [supporting], { now: at });
assert.strictEqual(supportingState.estimate, 0.9);
assert.strictEqual(supportingState.direction, "supporting");
assert.strictEqual(supportingState.confidence, 1);
assert.strictEqual(supportingState.coverage, 0.5);
assert.strictEqual(dimension.validateDimensionKnowledgeState(supportingState).valid, true);

const contradicting = contribution("contradicting_1", "contradicting", 0.8);
const contradictingState = dimension.aggregateDimensionContributions("ownership", [contradicting], { now: at });
assert.strictEqual(contradictingState.estimate, 0.1);
assert.strictEqual(contradictingState.direction, "contradicting");

const balanced = dimension.aggregateDimensionContributions("ownership", [supporting, contradicting], { now: at });
assert.strictEqual(balanced.estimate, 0.5);
assert.strictEqual(balanced.direction, "mixed");
assert.strictEqual(balanced.consistency, 0);
assert.strictEqual(balanced.contradictions.length, 1);

const lowConfidenceNegative = contribution("negative_low", "contradicting", 1, 0.2);
const weighted = dimension.aggregateDimensionContributions("ownership", [supporting, lowConfidenceNegative], { now: at });
assert.ok(weighted.estimate > 0.5);

const zeroA = contribution("zero_a", "supporting", 1, 0);
const zeroB = contribution("zero_b", "contradicting", 1, 0);
const zeroState = dimension.aggregateDimensionContributions("ownership", [zeroA, zeroB], { now: at });
assert.strictEqual(zeroState.estimate, 0.5);
assert.strictEqual(zeroState.confidence, 0);
assert.strictEqual(zeroState.extensions.aggregation.zeroConfidenceBehavior, "neutral_midpoint");

const orderA = dimension.aggregateDimensionContributions("ownership", [supporting, lowConfidenceNegative], { now: at });
const orderB = dimension.aggregateDimensionContributions("ownership", [lowConfidenceNegative, supporting], { now: at });
assert.deepStrictEqual(orderA, orderB);

const original = JSON.parse(JSON.stringify([supporting, lowConfidenceNegative]));
dimension.aggregateDimensionContributions("ownership", [supporting, lowConfidenceNegative], { now: at });
assert.deepStrictEqual([supporting, lowConfidenceNegative], original);

const empty = dimension.aggregateDimensionContributions("ownership", [], { now: at });
assert.strictEqual(empty.stateType, "unknown");
assert.strictEqual(empty.estimate, null);
assert.strictEqual(empty.coverage, 0);
assert.strictEqual(dimension.validateDimensionKnowledgeState(empty).valid, true);

assert.throws(
  () => dimension.aggregateDimensionContributions("ownership", [supporting, contribution("other", "supporting", 0.5, 1, "m", "leadership")], { now: at }),
  (error) => error.code === "MIXED_DIMENSION_CONTRIBUTIONS",
);
assert.throws(
  () => dimension.aggregateDimensionContributions("ownership", [supporting, supporting], { now: at }),
  (error) => error.code === "DUPLICATE_DIMENSION_CONTRIBUTION",
);
assert.throws(
  () => dimension.aggregateDimensionContributions("ownership", [{ ...supporting, confidence: 2 }], { now: at }),
  (error) => error.code === "INVALID_DIMENSION_CONTRIBUTION",
);
assert.throws(
  () => dimension.aggregateDimensionContributions("ownership", [supporting], {}),
  (error) => error.code === "INVALID_DIMENSION_AGGREGATION_OPTIONS",
);

console.log("test_aggregate_dimension_contributions PASS");

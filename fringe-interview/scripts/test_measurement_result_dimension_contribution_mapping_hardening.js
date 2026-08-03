"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const dimension = require("../src/core/dimension");
const observation = require("../src/core/observation");

const at = "2026-08-03T12:00:00.000Z";

function result(overrides = {}) {
  return observation.buildMeasurementResult({
    id: "hardening_result",
    measurementId: "hardening_measurement",
    characteristicId: "hardening_signal",
    observationRefs: [
      { type: "observation", id: "observation_b" },
      { type: "observation", id: "observation_a" },
    ],
    normalizedValue: -0.8,
    direction: "negative",
    confidence: 0.75,
    coverage: 0.5,
    evidenceQuality: 0.8,
    sourceReliability: 0.9,
    independence: 1,
    consistency: 0.9,
    status: "calculated",
    calculatedAt: at,
    calculatedBy: "hardening_test",
    ...overrides,
  });
}

function mapping(overrides = {}) {
  return dimension.buildMeasurementDimensionMapping({
    id: "hardening_mapping",
    measurementId: "hardening_measurement",
    targets: [
      {
        dimensionId: "ownership",
        contributionType: "contradicting",
        weight: 0.5,
        confidenceFactor: 0.8,
        extensions: { policy: { beta: 2, alpha: 1 } },
      },
      {
        dimensionId: "decision_clarity",
        contributionType: "supporting",
        weight: 0.25,
        confidenceFactor: 1,
        extensions: {},
      },
    ],
    valueStrategy: "direct",
    confidenceStrategy: "inherit",
    metadata: { version: "1.0", createdAt: at, updatedAt: at },
    extensions: { policyOwner: "core" },
    ...overrides,
  }, { now: at });
}

const sourceResult = result();
const sourceMapping = mapping();
const inputSnapshot = JSON.stringify({ sourceResult, sourceMapping });
const output = dimension.mapMeasurementResultToDimensionContributions(sourceResult, sourceMapping);

assert.strictEqual(output.length, 2);
assert.strictEqual(JSON.stringify({ sourceResult, sourceMapping }), inputSnapshot);
assert(Object.isFrozen(output));
for (const contribution of output) {
  assert(Object.isFrozen(contribution));
  assert(Object.isFrozen(contribution.provenance));
  assert(Object.isFrozen(contribution.provenance.sourceRefs));
  assert(Object.isFrozen(contribution.extensions));
  assert(Object.isFrozen(contribution.extensions.mapping));
  assert(Object.isFrozen(contribution.extensions.formula));
  assert(dimension.validateDimensionContribution(contribution).valid);
  assert.strictEqual(contribution.provenance.measurementResultRef, "measurementResult:hardening_result");
  assert.deepStrictEqual(contribution.provenance.sourceRefs, [
    "mapping:hardening_mapping",
    "observation:observation_a",
    "observation:observation_b",
  ]);
  assert.match(contribution.extensions.mapping.policyFingerprint, /^[a-f0-9]{64}$/);
  assert.deepStrictEqual(contribution.extensions.formula, {
    version: "1.0",
    policy: {
      mappingRef: "mapping:hardening_mapping",
      mappingVersion: "1.0",
      policyFingerprint: contribution.extensions.mapping.policyFingerprint,
    },
    value: {
      strategy: "direct",
      expression: "abs(measurementResult.normalizedValue) * mappingTarget.weight",
      operands: {
        normalizedValue: -0.8,
        weight: contribution.dimensionId === "ownership" ? 0.5 : 0.25,
      },
    },
    confidence: {
      strategy: "inherit",
      expression: "measurementResult.confidence * mappingTarget.confidenceFactor",
      operands: {
        confidence: 0.75,
        confidenceFactor: contribution.dimensionId === "ownership" ? 0.8 : 1,
      },
    },
  });
}

const repeat = dimension.mapMeasurementResultToDimensionContributions(sourceResult, sourceMapping);
assert.deepStrictEqual(repeat, output);

const reorderedResult = result({ observationRefs: [...sourceResult.observationRefs].reverse() });
const reorderedMapping = mapping({
  targets: [...sourceMapping.targets]
    .reverse()
    .map((target) => target.dimensionId === "ownership"
      ? { ...target, extensions: { policy: { alpha: 1, beta: 2 } } }
      : target),
  extensions: { policyOwner: "core" },
});
const reordered = dimension.mapMeasurementResultToDimensionContributions(reorderedResult, reorderedMapping);
assert.deepStrictEqual(
  reordered.map((item) => item.id).sort(),
  output.map((item) => item.id).sort()
);

const changedValue = dimension.mapMeasurementResultToDimensionContributions(
  result({ normalizedValue: -0.7 }),
  sourceMapping
);
assert.notStrictEqual(changedValue[0].id, output[0].id);

const changedConfidence = dimension.mapMeasurementResultToDimensionContributions(
  result({ confidence: 0.7 }),
  sourceMapping
);
assert.notStrictEqual(changedConfidence[0].id, output[0].id);

const changedPolicy = mapping({
  targets: sourceMapping.targets.map((target) => target.dimensionId === "ownership"
    ? { ...target, weight: 0.6 }
    : target),
});
const changedPolicyOutput = dimension.mapMeasurementResultToDimensionContributions(sourceResult, changedPolicy);
assert.notStrictEqual(changedPolicyOutput[0].id, output[0].id);
assert.notStrictEqual(
  changedPolicyOutput[0].extensions.mapping.policyFingerprint,
  output[0].extensions.mapping.policyFingerprint
);
assert.strictEqual(
  changedPolicyOutput[0].extensions.formula.policy.policyFingerprint,
  changedPolicyOutput[0].extensions.mapping.policyFingerprint
);

sourceMapping.targets[0].extensions.policy.alpha = 99;
sourceResult.observationRefs[0].id = "mutated";
assert.strictEqual(output[0].extensions.target.policy.alpha, 1);
assert(output[0].provenance.sourceRefs.includes("observation:observation_b"));
assert.throws(() => { output[0].extensions.target.policy.alpha = 100; }, TypeError);
assert.throws(() => output.push({}), TypeError);

assert.throws(
  () => dimension.mapMeasurementResultToDimensionContributions(result({ status: "insufficient_data", normalizedValue: null, direction: null }), mapping()),
  (error) => error.code === "MEASUREMENT_RESULT_NOT_APPLICABLE"
);
assert.throws(
  () => dimension.mapMeasurementResultToDimensionContributions(result(), mapping({ measurementId: "other" })),
  (error) => error.code === "INCOMPATIBLE_MEASUREMENT_MAPPING"
);
assert.throws(
  () => dimension.mapMeasurementResultToDimensionContributions({ ...result(), confidence: 2 }, mapping()),
  (error) => error.code === "INVALID_MEASUREMENT_RESULT"
);
const hiddenMapping = mapping();
Object.defineProperty(hiddenMapping.extensions, "hidden", { value: true, enumerable: false });
assert.throws(
  () => dimension.mapMeasurementResultToDimensionContributions(result(), hiddenMapping),
  (error) => error.code === "INVALID_MEASUREMENT_DIMENSION_MAPPING"
);
assert.throws(
  () => dimension.mapMeasurementResultToDimensionContributions(
    result(),
    mapping({ extensions: { executable: () => true } })
  ),
  (error) => error.code === "INVALID_MEASUREMENT_DIMENSION_MAPPING"
);

const mapperSource = fs.readFileSync(
  path.join(__dirname, "../src/core/dimension/mapMeasurementResultToDimensionContributions.js"),
  "utf8"
);
for (const forbidden of [
  "KnowledgeLedger",
  "KnowledgeSnapshot",
  "PersonKnowledgeMatrix",
  "Coverage",
  "../app",
  "../infrastructure",
  "fetch(",
  "readFile",
  "writeFile",
  "randomUUID",
  "Date.now",
  "new Date",
]) {
  assert(!mapperSource.includes(forbidden), `forbidden mapper responsibility: ${forbidden}`);
}

console.log("Measurement Result Dimension Contribution Mapping Hardening Test: PASS");

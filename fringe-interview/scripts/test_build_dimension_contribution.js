const assert = require("assert");
const { buildDimensionContribution, validateDimensionContribution } = require("../src/core/dimension");

const now = "2026-07-23T10:00:00.000Z";
const input = {
  id: " contribution_001 ",
  measurementId: " measurement_001 ",
  dimensionId: " ownership ",
  contributionType: "supporting",
  contributionValue: 0.8,
  confidence: 0.75,
  provenance: {
    measurementResultRef: " result_001 ",
    sourceRefs: [" source_1 ", "source_1", "source_2"],
  },
  metadata: { version: "1.0", createdAt: now, updatedAt: now },
  extensions: { experiment: { enabled: true } },
};
const snapshot = JSON.parse(JSON.stringify(input));
const built = buildDimensionContribution(input, { now });
assert.deepStrictEqual(input, snapshot);
assert.notStrictEqual(built.provenance, input.provenance);
assert.notStrictEqual(built.provenance.sourceRefs, input.provenance.sourceRefs);
assert.notStrictEqual(built.extensions, input.extensions);
assert.strictEqual(built.id, "contribution_001");
assert.strictEqual(built.measurementId, "measurement_001");
assert.strictEqual(built.dimensionId, "ownership");
assert.deepStrictEqual(built.provenance.sourceRefs, ["source_1", "source_2"]);
assert.strictEqual(validateDimensionContribution(built).valid, true);

const minimal = buildDimensionContribution({
  id: "contribution_min",
  measurementId: "measurement_min",
  dimensionId: "leadership",
  contributionType: "contradicting",
  provenance: { measurementResultRef: "result_min" },
}, { now });
assert.strictEqual(minimal.contributionValue, 0);
assert.strictEqual(minimal.confidence, 0);
assert.deepStrictEqual(minimal.provenance.sourceRefs, []);
assert.strictEqual(validateDimensionContribution(minimal).valid, true);

console.log("test_build_dimension_contribution PASS");

const assert = require("assert");
const api = require("../src/core/dimension");
const { buildDimensionContribution, validateDimensionContribution } = api;
const now = "2026-07-23T10:00:00.000Z";
const valid = buildDimensionContribution({
  id: "contribution_001", measurementId: "measurement_001", dimensionId: "ownership",
  contributionType: "supporting", contributionValue: 0.7, confidence: 0.8,
  provenance: { measurementResultRef: "result_001", sourceRefs: ["source_1"] },
}, { now });

const cases = [
  ["id", { ...valid, id: null }],
  ["measurementId", { ...valid, measurementId: "" }],
  ["dimensionId", { ...valid, dimensionId: null }],
  ["contributionType", { ...valid, contributionType: "neutral" }],
  ["contributionValue", { ...valid, contributionValue: 1.1 }],
  ["confidence", { ...valid, confidence: -0.1 }],
  ["provenance", { ...valid, provenance: null }],
  ["measurementResultRef", { ...valid, provenance: { ...valid.provenance, measurementResultRef: "" } }],
  ["sourceRefs", { ...valid, provenance: { ...valid.provenance, sourceRefs: ["source_1", "source_1"] } }],
  ["metadata", { ...valid, metadata: null }],
  ["createdAt", { ...valid, metadata: { ...valid.metadata, createdAt: "bad" } }],
  ["extensions", { ...valid, extensions: [] }],
  ["not allowed", { ...valid, extra: true }],
  ["raw source payload", { ...valid, extensions: { transcript: "forbidden" } }],
];
for (const [field, value] of cases) {
  const result = validateDimensionContribution(value);
  assert.strictEqual(result.valid, false, `${field} should be invalid`);
  assert.ok(result.errors.some((error) => error.includes(field)), `${field} error missing: ${result.errors.join(" | ")}`);
}

assert.deepStrictEqual(Object.keys(api).filter((key) => key === "buildDimensionContribution" || key === "validateDimensionContribution").sort(), [
  "buildDimensionContribution",
  "validateDimensionContribution",
]);
console.log("test_dimension_contribution_regression PASS");

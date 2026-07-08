const {
  buildComparisonPolicy,
} = require("../src/core/comparison/buildComparisonPolicy");
const {
  validateComparisonPolicy,
} = require("../src/core/comparison/validateComparisonPolicy");

const representationGapPolicy = buildComparisonPolicy("representation_gap");
const representationGapValidation =
  validateComparisonPolicy(representationGapPolicy);

const unknownPolicy = buildComparisonPolicy("unknown_policy");
const unknownValidation = validateComparisonPolicy(unknownPolicy);

console.log(
  JSON.stringify(
    {
      representationGapPolicy,
      representationGapValidation,
      unknownPolicy,
      unknownValidation,
    },
    null,
    2
  )
);

if (!representationGapValidation.isValid) {
  process.exit(1);
}

if (representationGapPolicy.policyId !== "representation_gap") {
  console.error('Expected policyId === "representation_gap".');
  process.exit(1);
}

if (representationGapPolicy.matching.mode !== "exact") {
  console.error('Expected matching.mode === "exact".');
  process.exit(1);
}

if (!Array.isArray(representationGapPolicy.dimensions)) {
  console.error("Expected dimensions array.");
  process.exit(1);
}

if (representationGapPolicy.resultMapping.matched !== "opportunities") {
  console.error('Expected resultMapping.matched === "opportunities".');
  process.exit(1);
}

if (!representationGapPolicy.weights) {
  console.error("Expected weights object.");
  process.exit(1);
}

if (representationGapPolicy.weights.default !== 1) {
  console.error("Expected weights.default === 1.");
  process.exit(1);
}

if (
  !representationGapPolicy.weights.byValue ||
  typeof representationGapPolicy.weights.byValue !== "object"
) {
  console.error("Expected weights.byValue object.");
  process.exit(1);
}

if (!unknownValidation.isValid) {
  process.exit(1);
}

if (unknownPolicy.label !== "Unknown Policy") {
  console.error('Expected unknown policy label === "Unknown Policy".');
  process.exit(1);
}

if (!unknownPolicy.weights) {
  console.error("Expected unknown policy weights object.");
  process.exit(1);
}

console.log("test_build_comparison_policy PASS");
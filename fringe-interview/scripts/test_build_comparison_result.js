const {
  buildComparisonResult,
} = require("../src/core/comparison/buildComparisonResult");
const {
  validateComparisonResult,
} = require("../src/core/comparison/validateComparisonResult");
const {
  buildComparisonPolicy,
} = require("../src/core/comparison/buildComparisonPolicy");

const observed = ["experiences", "skills", "motivations"];
const reference = [
  "experiences",
  "skills",
  "achievements",
  "targetDirections",
];

const comparisonResultFromString = buildComparisonResult({
  observed,
  reference,
  policy: "representation_gap",
});

const validationFromString = validateComparisonResult(
  comparisonResultFromString
);

const policyObject = buildComparisonPolicy("representation_gap");

const comparisonResultFromObject = buildComparisonResult({
  observed: ["Experiences", "Skills"],
  reference: ["experiences", "skills", "achievements"],
  policy: policyObject,
});

const validationFromObject = validateComparisonResult(
  comparisonResultFromObject
);

const weightedPolicy = buildComparisonPolicy("representation_gap");
weightedPolicy.weights = {
  default: 1,
  byValue: {
    skills: 3,
  },
};

const weightedComparisonResult = buildComparisonResult({
  observed: ["experiences"],
  reference: ["experiences", "skills"],
  policy: weightedPolicy,
});

const weightedValidation = validateComparisonResult(weightedComparisonResult);

console.log(
  JSON.stringify(
    {
      comparisonResultFromString,
      validationFromString,
      comparisonResultFromObject,
      validationFromObject,
      weightedComparisonResult,
      weightedValidation,
    },
    null,
    2
  )
);

if (!validationFromString.isValid) {
  process.exit(1);
}

if (!validationFromObject.isValid) {
  process.exit(1);
}

if (!weightedValidation.isValid) {
  process.exit(1);
}

if (comparisonResultFromString.comparisonStatus !== "draft") {
  console.error('Expected comparisonStatus === "draft".');
  process.exit(1);
}

if (comparisonResultFromString.policyId !== "representation_gap") {
  console.error('Expected policyId === "representation_gap".');
  process.exit(1);
}

if (comparisonResultFromString.policy.policyId !== "representation_gap") {
  console.error('Expected policy.policyId === "representation_gap".');
  process.exit(1);
}

if (comparisonResultFromString.result.matched.length !== 2) {
  console.error("Expected matched.length === 2.");
  process.exit(1);
}

if (comparisonResultFromString.result.missing.length !== 2) {
  console.error("Expected missing.length === 2.");
  process.exit(1);
}

if (comparisonResultFromString.result.unexpected.length !== 1) {
  console.error("Expected unexpected.length === 1.");
  process.exit(1);
}

if (comparisonResultFromString.metrics.coverageRatio !== 0.5) {
  console.error("Expected coverageRatio === 0.5.");
  process.exit(1);
}

if (comparisonResultFromObject.policyId !== "representation_gap") {
  console.error('Expected object policyId === "representation_gap".');
  process.exit(1);
}

if (comparisonResultFromObject.policy.policyId !== "representation_gap") {
  console.error('Expected object policy.policyId === "representation_gap".');
  process.exit(1);
}

if (comparisonResultFromObject.result.matched.length !== 2) {
  console.error("Expected case-insensitive matched.length === 2.");
  process.exit(1);
}

if (comparisonResultFromObject.result.missing.length !== 1) {
  console.error("Expected case-insensitive missing.length === 1.");
  process.exit(1);
}

if (weightedComparisonResult.metrics.weightedReferenceTotal !== 4) {
  console.error("Expected weightedReferenceTotal === 4.");
  process.exit(1);
}

if (weightedComparisonResult.metrics.weightedMatchedTotal !== 1) {
  console.error("Expected weightedMatchedTotal === 1.");
  process.exit(1);
}

if (weightedComparisonResult.metrics.weightedCoverageRatio !== 0.25) {
  console.error("Expected weightedCoverageRatio === 0.25.");
  process.exit(1);
}

console.log("test_build_comparison_result PASS");
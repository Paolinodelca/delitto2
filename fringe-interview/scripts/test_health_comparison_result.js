const {
  healthBuildComparisonResult,
} = require("../src/core/comparison/healthBuildComparisonResult");

const result = healthBuildComparisonResult();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

if (result.policyId !== "representation_gap") {
  console.error('Expected policyId === "representation_gap".');
  process.exit(1);
}

if (typeof result.metrics.weightedReferenceTotal !== "number") {
  console.error("Expected metrics.weightedReferenceTotal number.");
  process.exit(1);
}

if (typeof result.metrics.weightedMatchedTotal !== "number") {
  console.error("Expected metrics.weightedMatchedTotal number.");
  process.exit(1);
}

if (typeof result.metrics.weightedCoverageRatio !== "number") {
  console.error("Expected metrics.weightedCoverageRatio number.");
  process.exit(1);
}

console.log("test_health_comparison_result PASS");
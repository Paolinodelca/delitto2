const {
  buildComparisonResult,
} = require("./buildComparisonResult");

const {
  validateComparisonResult,
} = require("./validateComparisonResult");

function healthBuildComparisonResult() {
  const observed = ["experiences", "skills"];
  const reference = ["experiences", "skills", "achievements"];

  const comparisonResult = buildComparisonResult({
    observed,
    reference,
    policy: "representation_gap",
    perspective: "comparison_engine",
    constraints: {
      noLLM: true,
      noNarrative: true,
      noJudgement: true,
    },
  });

  const validation = validateComparisonResult(comparisonResult);

  return {
    module: "Comparison Engine",
    status: validation.isValid ? "PASS" : "FAIL",
    policyId: comparisonResult.policyId,
    metrics: comparisonResult.metrics,
    validation,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildComparisonResult,
};
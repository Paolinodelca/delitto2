const {
  buildComparisonResult,
} = require("../src/core/comparison/buildComparisonResult");
const {
  validateComparisonResult,
} = require("../src/core/comparison/validateComparisonResult");
const {
  buildComparisonPolicy,
} = require("../src/core/comparison/buildComparisonPolicy");

function runScenario({
  name,
  observed,
  reference,
  policy,
  assertions,
}) {
  const comparisonResult = buildComparisonResult({
    observed,
    reference,
    policy,
  });

  const validation = validateComparisonResult(comparisonResult);
  const failures = [];

  if (!validation.isValid) {
    failures.push(
      `Validation failed: ${validation.errors.join("; ")}`
    );
  }

  assertions(comparisonResult, failures);

  const output = {
    scenario: name,
    status: failures.length === 0 ? "PASS" : "FAIL",
    coverageRatio: comparisonResult.metrics.coverageRatio,
    weightedCoverageRatio: comparisonResult.metrics.weightedCoverageRatio,
    matchedCount: comparisonResult.metrics.matchedCount,
    missingCount: comparisonResult.metrics.missingCount,
    unexpectedCount: comparisonResult.metrics.unexpectedCount,
  };

  console.log(JSON.stringify(output, null, 2));

  if (failures.length > 0) {
    console.error(`FAIL: ${name}`);
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  return comparisonResult;
}

runScenario({
  name: "Scenario 1 — Representation Gap",
  observed: ["experiences", "skills", "motivations"],
  reference: ["experiences", "skills", "achievements", "targetDirections"],
  policy: "representation_gap",
  assertions: (comparisonResult, failures) => {
    if (comparisonResult.metrics.matchedCount !== 2) {
      failures.push("Expected matchedCount === 2.");
    }

    if (comparisonResult.metrics.missingCount !== 2) {
      failures.push("Expected missingCount === 2.");
    }

    if (comparisonResult.metrics.unexpectedCount !== 1) {
      failures.push("Expected unexpectedCount === 1.");
    }
  },
});

const weightedPolicy = buildComparisonPolicy("representation_gap");
weightedPolicy.weights = {
  default: 1,
  byValue: {
    achievements: 3,
    targetDirections: 2,
  },
};

runScenario({
  name: "Scenario 2 — Professional Visibility weighted",
  observed: ["experiences", "skills", "motivations"],
  reference: ["experiences", "skills", "achievements", "targetDirections"],
  policy: weightedPolicy,
  assertions: (comparisonResult, failures) => {
    if (typeof comparisonResult.metrics.weightedCoverageRatio !== "number") {
      failures.push("Expected weightedCoverageRatio number.");
    }

    if (
      comparisonResult.metrics.weightedCoverageRatio >=
      comparisonResult.metrics.coverageRatio
    ) {
      failures.push(
        "Expected weightedCoverageRatio < coverageRatio when heavy areas are missing."
      );
    }
  },
});

runScenario({
  name: "Scenario 3 — Case-insensitive matching",
  observed: ["Experiences", "Skills"],
  reference: ["experiences", "skills", "achievements"],
  policy: "representation_gap",
  assertions: (comparisonResult, failures) => {
    if (comparisonResult.metrics.matchedCount !== 2) {
      failures.push("Expected matchedCount === 2.");
    }

    if (comparisonResult.metrics.missingCount !== 1) {
      failures.push("Expected missingCount === 1.");
    }
  },
});

runScenario({
  name: "Scenario 4 — Unknown policy",
  observed: ["experiences", "skills"],
  reference: ["experiences", "achievements"],
  policy: "unknown_policy",
  assertions: (comparisonResult, failures) => {
    if (comparisonResult.policyId !== "unknown_policy") {
      failures.push('Expected policyId === "unknown_policy".');
    }

    if (!comparisonResult.policy) {
      failures.push("Expected policy object.");
      return;
    }

    if (comparisonResult.policy.label !== "Unknown Policy") {
      failures.push('Expected policy.label === "Unknown Policy".');
    }
  },
});

runScenario({
  name: "Scenario 5 — Object-like values serialized",
  observed: ["offer.salary", "offer.remote", "offer.benefits"],
  reference: ["offer.salary", "offer.remote", "offer.growth"],
  policy: "representation_gap",
  assertions: (comparisonResult, failures) => {
    if (comparisonResult.metrics.matchedCount !== 2) {
      failures.push("Expected matchedCount === 2.");
    }

    if (comparisonResult.metrics.missingCount !== 1) {
      failures.push("Expected missingCount === 1.");
    }

    if (comparisonResult.metrics.unexpectedCount !== 1) {
      failures.push("Expected unexpectedCount === 1.");
    }
  },
});

console.log("✅ Comparison Engine generalization test PASSED");
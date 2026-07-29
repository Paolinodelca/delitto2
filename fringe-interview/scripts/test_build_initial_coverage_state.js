const assert = require("assert");

const {
  buildRoleCredibilityMap,
} = require("../src/core/roleEngine/buildRoleCredibilityMap");

const {
  buildEvidenceCollectionPlan,
} = require("../src/core/roleEngine/buildEvidenceCollectionPlan");

async function run() {
  const { buildInitialCoverageState } = await import(
    "../src/core/interview/buildInitialCoverageState.js"
  );

  const { validateCoverageState } = await import(
    "../src/core/interview/validateCoverageState.js"
  );

  const roleCredibilityMap = buildRoleCredibilityMap({
    targetContext: {
      targetRole: "Product Operations Manager",
      roleFamily: "operations_industrial",
      seniorityExpected: "mid/senior",
    },
  });

  const evidenceCollectionPlan = buildEvidenceCollectionPlan(roleCredibilityMap);

  const initialCoverageState = buildInitialCoverageState({
    evidenceCollectionPlan,
  });

  const validation = validateCoverageState(initialCoverageState);

  if (validation.valid !== true) {
    console.error("❌ Initial Coverage State validation failed");
    console.error(
      JSON.stringify(
        {
          errors: validation.errors,
          warnings: validation.warnings,
        },
        null,
        2
      )
    );
  }

  assert.strictEqual(
    validation.valid,
    true,
    "Expected Initial Coverage State to be valid"
  );

  assert.strictEqual(
    initialCoverageState.overallCoverage,
    0,
    "Expected overallCoverage to be 0"
  );

  assert.ok(
    Array.isArray(initialCoverageState.goals),
    "Expected goals to be an array"
  );

  assert.ok(
    initialCoverageState.goals.length > 0,
    "Expected at least one goal"
  );

  initialCoverageState.goals.forEach((goal) => {
    assert.strictEqual(
      goal.status,
      "not_started",
      `Expected goal ${goal.goalId} status to be not_started`
    );

    assert.strictEqual(
      goal.coverage,
      0,
      `Expected goal ${goal.goalId} coverage to be 0`
    );
  });

  assert.ok(
    Array.isArray(initialCoverageState.signals),
    "Expected signals to be an array"
  );

  assert.ok(
    initialCoverageState.signals.length > 0,
    "Expected at least one signal"
  );

  const stakeholderAlignmentSignal = initialCoverageState.signals.find(
    (signal) => signal.signalId === "stakeholder_alignment"
  );

  assert.ok(
    stakeholderAlignmentSignal,
    "Expected signal stakeholder_alignment to exist"
  );

  assert.strictEqual(
    initialCoverageState.nextRecommendation.action,
    "start_collection",
    "Expected nextRecommendation.action to be start_collection"
  );

  console.log("✅ Initial Coverage State test passed");
  console.log(
    JSON.stringify(
      {
        goals: initialCoverageState.goals.length,
        signals: initialCoverageState.signals.length,
        validationWarnings: validation.warnings.length,
        nextRecommendation: initialCoverageState.nextRecommendation,
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error("❌ Initial Coverage State test failed");
  console.error(error);
  process.exit(1);
});
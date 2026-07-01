const assert = require("assert");

const {
  buildRoleCredibilityMap,
} = require("../src/core/roleEngine/buildRoleCredibilityMap");

const {
  buildEvidenceCollectionPlan,
} = require("../src/core/roleEngine/buildEvidenceCollectionPlan");

async function run() {
  const { validateEvidenceCollectionPlan } = await import(
    "../src/core/roleEngine/validateEvidenceCollectionPlan.js"
  );

  const roleCredibilityMap = buildRoleCredibilityMap({
    targetContext: {
      targetRole: "Product Operations Manager",
      roleFamily: "operations_industrial",
      seniorityExpected: "mid/senior",
    },
  });

  const evidenceCollectionPlan = buildEvidenceCollectionPlan(roleCredibilityMap);

  const validation = validateEvidenceCollectionPlan(evidenceCollectionPlan);

  if (validation.valid !== true) {
    console.error("❌ Evidence Collection Plan validation failed");
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
    "Expected Evidence Collection Plan to be valid"
  );

  assert.ok(
    Array.isArray(evidenceCollectionPlan.collectionGoals),
    "Expected collectionGoals to be an array"
  );

  assert.ok(
    evidenceCollectionPlan.collectionGoals.length > 0,
    "Expected at least one collection goal"
  );

  const stakeholderAlignmentGoal = evidenceCollectionPlan.collectionGoals.find(
    (goal) =>
      Array.isArray(goal.targetSignals) &&
      goal.targetSignals.some(
        (targetSignal) =>
          targetSignal.signalId === "stakeholder_alignment" ||
          targetSignal === "stakeholder_alignment"
      )
  );

  assert.ok(
    stakeholderAlignmentGoal,
    "Expected one goal linked to stakeholder_alignment"
  );

  evidenceCollectionPlan.collectionGoals.forEach((goal) => {
    assert.ok(
      Array.isArray(goal.executionModes) && goal.executionModes.length > 0,
      `Expected goal ${goal.id} to have executionModes`
    );

    assert.ok(
      typeof goal.coverageTarget === "number",
      `Expected goal ${goal.id} to have coverageTarget`
    );

    assert.ok(
      Array.isArray(goal.targetSignals) && goal.targetSignals.length > 0,
      `Expected goal ${goal.id} to have targetSignals`
    );
  });

  console.log("✅ Evidence Collection Plan test passed");
  console.log(
    JSON.stringify(
      {
        collectionGoals: evidenceCollectionPlan.collectionGoals.length,
        stakeholderAlignmentGoalId: stakeholderAlignmentGoal.id,
        validationWarnings: validation.warnings.length,
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error("❌ Evidence Collection Plan test crashed");
  console.error(error);
  process.exit(1);
});
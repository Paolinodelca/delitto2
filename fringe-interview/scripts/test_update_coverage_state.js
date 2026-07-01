import assert from "assert";

import { buildRoleCredibilityMap } from "../src/core/roleEngine/buildRoleCredibilityMap.js";
import { buildEvidenceCollectionPlan } from "../src/core/roleEngine/buildEvidenceCollectionPlan.js";
import { buildInitialCoverageState } from "../src/core/interview/buildInitialCoverageState.js";
import { updateCoverageState } from "../src/core/interview/updateCoverageState.js";

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

const targetGoal =
  initialCoverageState.goals.find(
    (goal) =>
      Array.isArray(goal.targetSignals) &&
      goal.targetSignals.some((targetSignal) => {
        if (typeof targetSignal === "string") {
          return targetSignal === "stakeholder_alignment";
        }

        return targetSignal?.signalId === "stakeholder_alignment";
      })
  ) || initialCoverageState.goals[0];

const updatedCoverageState = updateCoverageState({
  coverageState: initialCoverageState,
  collectionResult: {
    goalId: targetGoal.goalId,
    observedSignals: ["stakeholder_alignment"],
    confidence: 0.82,
    evidence: [
      {
        id: "evidence_1",
        summary: "Candidate described stakeholder alignment.",
      },
    ],
  },
});

assert.ok(
  updatedCoverageState.overallCoverage > 0,
  "Expected overallCoverage to be greater than 0"
);

assert.ok(
  updatedCoverageState.goals.some((goal) => goal.status === "covered"),
  "Expected at least one goal to be covered"
);

const stakeholderAlignmentSignal = updatedCoverageState.signals.find(
  (signal) => signal.signalId === "stakeholder_alignment"
);

assert.ok(
  stakeholderAlignmentSignal,
  "Expected stakeholder_alignment signal to exist"
);

assert.strictEqual(
  stakeholderAlignmentSignal.visibility,
  1,
  "Expected stakeholder_alignment visibility to be 1"
);

assert.ok(
  ["continue_collection", "collection_completed"].includes(
    updatedCoverageState.nextRecommendation.action
  ),
  "Expected nextRecommendation.action to be continue_collection or collection_completed"
);

console.log("✅ Update Coverage State test passed");
console.log(
  JSON.stringify(
    {
      overallCoverage: updatedCoverageState.overallCoverage,
      coveredGoals: updatedCoverageState.goals.filter(
        (goal) => goal.status === "covered"
      ).length,
      stakeholderAlignment: {
        visibility: stakeholderAlignmentSignal.visibility,
        confidence: stakeholderAlignmentSignal.confidence,
        evidenceCount: stakeholderAlignmentSignal.evidenceCount,
      },
      nextRecommendation: updatedCoverageState.nextRecommendation,
    },
    null,
    2
  )
);
import assert from "assert";

import { buildRoleCredibilityMap } from "../src/core/roleEngine/buildRoleCredibilityMap.js";
import { buildEvidenceCollectionPlan } from "../src/core/roleEngine/buildEvidenceCollectionPlan.js";
import { buildInitialCoverageState } from "../src/core/interview/buildInitialCoverageState.js";
import { updateCoverageState } from "../src/core/interview/updateCoverageState.js";

function extractSignalId(targetSignal) {
  if (typeof targetSignal === "string") {
    return targetSignal;
  }

  if (
    targetSignal &&
    typeof targetSignal === "object" &&
    typeof targetSignal.signalId === "string"
  ) {
    return targetSignal.signalId;
  }

  return "";
}

const roleCredibilityMap = buildRoleCredibilityMap({
  targetContext: {
    targetRole: "Product Operations Manager",
    roleFamily: "operations_industrial",
    seniorityExpected: "mid/senior",
  },
});

const evidenceCollectionPlan = buildEvidenceCollectionPlan(roleCredibilityMap);

assert.ok(
  Array.isArray(evidenceCollectionPlan.collectionGoals),
  "Expected collectionGoals to be an array"
);

assert.ok(
  evidenceCollectionPlan.collectionGoals.length > 0,
  "Expected at least one collectionGoal"
);

const initialCoverageState = buildInitialCoverageState({
  evidenceCollectionPlan,
});

assert.ok(initialCoverageState, "Expected initial coverage state to exist");

const initialOverallCoverage = initialCoverageState.overallCoverage;

let coverageState = initialCoverageState;

const goalsToSimulate = coverageState.goals.slice(0, 3);

goalsToSimulate.forEach((goal, index) => {
  const observedSignals = Array.isArray(goal.targetSignals)
    ? goal.targetSignals.map(extractSignalId).filter(Boolean)
    : [];

  const collectionResult = {
    goalId: goal.goalId,
    observedSignals,
    evidence: [
      {
        id: `pipeline_evidence_${index + 1}`,
        summary: `Simulated evidence for ${goal.goalId}.`,
        source: "test_collection_pipeline",
      },
    ],
    confidence: 0.8,
  };

  coverageState = updateCoverageState({
    coverageState,
    collectionResult,
  });
});

const coveredGoals = coverageState.goals.filter(
  (goal) => goal.status === "covered"
);

const updatedSignals = coverageState.signals.filter(
  (signal) => signal.visibility > 0
);

assert.ok(
  coverageState.overallCoverage > 0,
  "Expected overallCoverage to be greater than 0 after updates"
);

assert.ok(
  coveredGoals.length > 0,
  "Expected at least one goal to be covered"
);

assert.ok(
  updatedSignals.length > 0,
  "Expected at least one signal to have visibility > 0"
);

assert.ok(
  coverageState.nextRecommendation &&
    coverageState.nextRecommendation.action,
  "Expected nextRecommendation.action to exist"
);

console.log(
  JSON.stringify(
    {
      totalGoals: coverageState.goals.length,
      coveredGoals: coveredGoals.length,
      initialOverallCoverage,
      finalOverallCoverage: coverageState.overallCoverage,
      finalNextRecommendation: coverageState.nextRecommendation,
      firstUpdatedSignals: updatedSignals.slice(0, 5).map((signal) => ({
        signalId: signal.signalId,
        visibility: signal.visibility,
        confidence: signal.confidence,
        evidenceCount: signal.evidenceCount,
      })),
    },
    null,
    2
  )
);

console.log("Collection pipeline simulation passed.");
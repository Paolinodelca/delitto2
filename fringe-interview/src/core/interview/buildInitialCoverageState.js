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

export function buildInitialCoverageState({
  evidenceCollectionPlan = {},
} = {}) {
  const collectionGoals = Array.isArray(evidenceCollectionPlan.collectionGoals)
    ? evidenceCollectionPlan.collectionGoals
    : [];

  const goals = collectionGoals.map((goal) => ({
    goalId: goal.id || "",
    status: "not_started",
    collectedEvidence: [],
    missingEvidence: [],
    followupCount: 0,
    pressureApplied: false,
    recoveryUsed: false,
    confidence: 0,
    coverage: 0,
    targetCoverage:
      typeof goal.coverageTarget === "number" ? goal.coverageTarget : 0,
    targetSignals: Array.isArray(goal.targetSignals)
      ? goal.targetSignals
      : [],
    extensions: {},
  }));

  const signalsById = new Map();

  goals.forEach((goal) => {
    goal.targetSignals.forEach((targetSignal) => {
      const signalId = extractSignalId(targetSignal);

      if (!signalId) {
        return;
      }

      if (!signalsById.has(signalId)) {
        signalsById.set(signalId, {
          signalId,
          evidenceCount: 0,
          visibility: 0,
          confidence: 0,
          observedEvidence: [],
          missingEvidenceReason: "",
          relatedGoals: [],
          extensions: {},
        });
      }

      const signalState = signalsById.get(signalId);

      if (!signalState.relatedGoals.includes(goal.goalId)) {
        signalState.relatedGoals.push(goal.goalId);
      }
    });
  });

  const firstGoalId = goals.length > 0 ? goals[0].goalId : "";

  return {
    overallCoverage: 0,
    dimensions: [],
    goals,
    signals: Array.from(signalsById.values()),
    runtimeSignals: [],
    nextRecommendation:
      goals.length > 0
        ? {
            action: "start_collection",
            goalId: firstGoalId,
            reason:
              "Avviare la raccolta evidenze dal primo Collection Goal disponibile.",
          }
        : {
            action: "no_goals_available",
            goalId: "",
            reason: "Nessun Collection Goal disponibile.",
          },
    confidence: 0,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: "buildInitialCoverageState",
    },
    extensions: {},
  };
}

export default buildInitialCoverageState;
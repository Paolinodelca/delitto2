function cloneCoverageState(coverageState) {
  return {
    ...coverageState,
    dimensions: Array.isArray(coverageState.dimensions)
      ? [...coverageState.dimensions]
      : [],
    goals: Array.isArray(coverageState.goals)
      ? coverageState.goals.map((goal) => ({ ...goal }))
      : [],
    signals: Array.isArray(coverageState.signals)
      ? coverageState.signals.map((signal) => ({
          ...signal,
          observedEvidence: Array.isArray(signal.observedEvidence)
            ? [...signal.observedEvidence]
            : [],
          relatedGoals: Array.isArray(signal.relatedGoals)
            ? [...signal.relatedGoals]
            : [],
        }))
      : [],
    runtimeSignals: Array.isArray(coverageState.runtimeSignals)
      ? [...coverageState.runtimeSignals]
      : [],
    nextRecommendation:
      coverageState.nextRecommendation &&
      typeof coverageState.nextRecommendation === "object"
        ? { ...coverageState.nextRecommendation }
        : {},
    metadata:
      coverageState.metadata && typeof coverageState.metadata === "object"
        ? { ...coverageState.metadata }
        : {},
    extensions:
      coverageState.extensions && typeof coverageState.extensions === "object"
        ? { ...coverageState.extensions }
        : {},
  };
}

function normalizeObservedSignalId(observedSignal) {
  if (typeof observedSignal === "string") {
    return observedSignal;
  }

  if (
    observedSignal &&
    typeof observedSignal === "object" &&
    typeof observedSignal.signalId === "string"
  ) {
    return observedSignal.signalId;
  }

  return "";
}

function calculateOverallCoverage(goals) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return 0;
  }

  const totalCoverage = goals.reduce((sum, goal) => {
    const coverage = typeof goal.coverage === "number" ? goal.coverage : 0;
    return sum + coverage;
  }, 0);

  return totalCoverage / goals.length;
}

function buildNextRecommendation(goals) {
  const nextGoal = goals.find((goal) => goal.status === "not_started");

  if (nextGoal) {
    return {
      action: "continue_collection",
      goalId: nextGoal.goalId,
      reason: "Proseguire con il prossimo Collection Goal.",
    };
  }

  return {
    action: "collection_completed",
    goalId: "",
    reason: "Tutti i Collection Goal risultano coperti.",
  };
}

export function updateCoverageState({
  coverageState = {},
  collectionResult = {},
} = {}) {
  const nextCoverageState = cloneCoverageState(coverageState);

  const goalId = collectionResult.goalId || "";
  const goalIndex = nextCoverageState.goals.findIndex(
    (goal) => goal.goalId === goalId
  );

  if (goalIndex === -1) {
    return coverageState;
  }

  const confidence =
    typeof collectionResult.confidence === "number"
      ? collectionResult.confidence
      : 0;

  const evidence = Array.isArray(collectionResult.evidence)
    ? collectionResult.evidence
    : [];

  const goal = nextCoverageState.goals[goalIndex];

  nextCoverageState.goals[goalIndex] = {
    ...goal,
    status: "covered",
    coverage:
      typeof goal.targetCoverage === "number" ? goal.targetCoverage : 0,
    confidence,
    collectedEvidence: evidence,
  };

  const observedSignals = Array.isArray(collectionResult.observedSignals)
    ? collectionResult.observedSignals
    : [];

  observedSignals.forEach((observedSignal) => {
    const signalId = normalizeObservedSignalId(observedSignal);

    if (!signalId) {
      return;
    }

    const signalIndex = nextCoverageState.signals.findIndex(
      (signal) => signal.signalId === signalId
    );

    if (signalIndex === -1) {
      return;
    }

    const signal = nextCoverageState.signals[signalIndex];
    const observedEvidence = Array.isArray(signal.observedEvidence)
      ? signal.observedEvidence
      : [];

    nextCoverageState.signals[signalIndex] = {
      ...signal,
      visibility: 1,
      confidence,
      evidenceCount:
        typeof signal.evidenceCount === "number"
          ? signal.evidenceCount + 1
          : 1,
      observedEvidence: [...observedEvidence, ...evidence],
    };
  });

  nextCoverageState.overallCoverage = calculateOverallCoverage(
    nextCoverageState.goals
  );

  nextCoverageState.nextRecommendation = buildNextRecommendation(
    nextCoverageState.goals
  );

  return nextCoverageState;
}

export default updateCoverageState;
function normalizeDimensions(roleCredibilityMap) {
  if (!roleCredibilityMap || typeof roleCredibilityMap !== "object") {
    return [];
  }

  if (Array.isArray(roleCredibilityMap.dimensions)) {
    return roleCredibilityMap.dimensions;
  }

  if (
    roleCredibilityMap.dimensions &&
    typeof roleCredibilityMap.dimensions === "object"
  ) {
    return Object.entries(roleCredibilityMap.dimensions).map(([id, dimension]) => ({
      id,
      ...dimension,
    }));
  }

  return [];
}

function normalizeSignals(dimension) {
  if (!dimension || typeof dimension !== "object") {
    return [];
  }

  if (Array.isArray(dimension.signals)) {
    return dimension.signals;
  }

  if (dimension.signals && typeof dimension.signals === "object") {
    return Object.entries(dimension.signals).map(([id, signal]) => ({
      id,
      ...signal,
    }));
  }

  return [];
}

function getPriorityFromImportance(importance) {
  switch (importance) {
    case "high":
      return "high";
    case "medium_high":
      return "medium_high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return "medium";
  }
}

function getCoverageTargetFromImportance(importance) {
  switch (importance) {
    case "high":
      return 0.8;
    case "medium_high":
      return 0.75;
    case "medium":
      return 0.65;
    case "low":
      return 0.5;
    default:
      return 0.65;
  }
}

function buildGoalId(dimensionId, signalId) {
  return `collect_${dimensionId}_${signalId}`;
}

function buildEvidenceCollectionPlan(roleCredibilityMap = {}) {
  const dimensions = normalizeDimensions(roleCredibilityMap);

  const collectionGoals = [];

  dimensions.forEach((dimension) => {
    const dimensionId = dimension.id;
    const signals = normalizeSignals(dimension);

    signals.forEach((signal) => {
      if (!signal || !signal.id) {
        return;
      }

      collectionGoals.push({
        id: buildGoalId(dimensionId, signal.id),
        label: signal.label || signal.id,
        purpose:
          signal.purpose ||
          `Raccogliere evidenze osservabili sul segnale "${signal.label || signal.id}".`,
        priority: getPriorityFromImportance(signal.importance),
        targetSignals: [
          {
            dimensionId,
            signalId: signal.id,
          },
        ],
        preferredQuestionTypes: signal.preferredQuestionTypes || [],
        executionModes: [
          {
            style: "balanced",
            purpose: "Raccogliere una prima evidenza senza pressione.",
          },
          {
            style: "depth",
            purpose: "Approfondire se la prima evidenza è incompleta.",
          },
          {
            style: "pressure",
            purpose:
              "Verificare se il candidato resta chiaro quando la domanda diventa più diretta.",
          },
        ],
        followupPolicy: {
          strategy: signal.followupStrategy || "",
          maxFollowups: 2,
          triggers: [],
          allowedActions: [
            "depth_check",
            "pressure_probe",
            "recovery_prompt",
            "next_goal"
          ]
        },


        stopCondition: signal.stopCondition || null,
        failureInterpretation:
          "Il segnale non viene trattato come assente: viene marcato come non ancora osservato con sufficiente chiarezza.",
        coverageTarget: getCoverageTargetFromImportance(signal.importance),
        extensions: {
          minimumEvidenceCount: signal.minimumEvidenceCount,
        },
      });
    });
  });

  return {
    collectionGoals,
    coverageThresholds: {},
    followupPolicies: collectionGoals.map((goal) => ({
      goalId: goal.id,
      targetSignals: goal.targetSignals,
      followupPolicy: goal.followupPolicy,
      stopCondition: goal.stopCondition,
      minimumEvidenceCount: goal.extensions.minimumEvidenceCount,
    })),
    runtimeSignalsPolicy: {},
    extensions: {},
  };
}

export { buildEvidenceCollectionPlan };

export default buildEvidenceCollectionPlan;
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getTargetSignalKey(targetSignal) {
  if (typeof targetSignal === "string") {
    return targetSignal;
  }

  if (isPlainObject(targetSignal)) {
    return `${targetSignal.dimensionId || ""}:${targetSignal.signalId || ""}`;
  }

  return JSON.stringify(targetSignal);
}

export function validateEvidenceCollectionPlan(plan = {}) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(plan)) {
    return {
      valid: false,
      errors: ["Evidence Collection Plan must be an object."],
      warnings,
    };
  }

  if (!Array.isArray(plan.collectionGoals)) {
    errors.push("Missing or invalid required field: collectionGoals must be an array.");
  }

  if (!isPlainObject(plan.coverageThresholds)) {
    errors.push("Missing or invalid required field: coverageThresholds must be an object.");
  }

  if (!Array.isArray(plan.followupPolicies)) {
    errors.push("Missing or invalid required field: followupPolicies must be an array.");
  }

  if (!isPlainObject(plan.runtimeSignalsPolicy)) {
    errors.push("Missing or invalid required field: runtimeSignalsPolicy must be an object.");
  }

  if (!isPlainObject(plan.extensions)) {
    errors.push("Missing or invalid required field: extensions must be an object.");
  }

  if (Array.isArray(plan.collectionGoals)) {
    plan.collectionGoals.forEach((goal, index) => {
      const prefix = `collectionGoals[${index}]`;

      if (!isPlainObject(goal)) {
        errors.push(`${prefix} must be an object.`);
        return;
      }

      if (!isNonEmptyString(goal.id)) {
        errors.push(`${prefix}.id must be a non-empty string.`);
      }

      if (!isNonEmptyString(goal.label)) {
        errors.push(`${prefix}.label must be a non-empty string.`);
      }

      if (!isNonEmptyString(goal.purpose)) {
        errors.push(`${prefix}.purpose must be a non-empty string.`);
      }

      if (!isNonEmptyString(goal.priority)) {
        errors.push(`${prefix}.priority must be a non-empty string.`);
      }

      if (!Array.isArray(goal.targetSignals) || goal.targetSignals.length === 0) {
        errors.push(`${prefix}.targetSignals must be a non-empty array.`);
      }

      if (!Array.isArray(goal.preferredQuestionTypes)) {
        errors.push(`${prefix}.preferredQuestionTypes must be an array.`);
      }

      if (!Array.isArray(goal.executionModes) || goal.executionModes.length === 0) {
        errors.push(`${prefix}.executionModes must be a non-empty array.`);
      }

      if (!isPlainObject(goal.followupPolicy)) {
        errors.push(`${prefix}.followupPolicy must be an object.`);
      }

      if (!isNonEmptyString(goal.stopCondition)) {
        errors.push(`${prefix}.stopCondition must be a non-empty string.`);
      }

      if (!isNonEmptyString(goal.failureInterpretation)) {
        errors.push(`${prefix}.failureInterpretation must be a non-empty string.`);
      }

      if (
        typeof goal.coverageTarget !== "number" ||
        Number.isNaN(goal.coverageTarget) ||
        goal.coverageTarget < 0 ||
        goal.coverageTarget > 1
      ) {
        errors.push(`${prefix}.coverageTarget must be a number between 0 and 1.`);
      }

      if (!isPlainObject(goal.extensions)) {
        errors.push(`${prefix}.extensions must be an object.`);
      }

      if (Array.isArray(goal.executionModes)) {
        const executionStyles = goal.executionModes
          .map((mode) => (mode && mode.style ? mode.style : null))
          .filter(Boolean);

        if (!executionStyles.includes("balanced")) {
          warnings.push(`${prefix} does not contain execution mode: balanced.`);
        }

        if (!executionStyles.includes("depth")) {
          warnings.push(`${prefix} does not contain execution mode: depth.`);
        }

        if (!executionStyles.includes("pressure")) {
          warnings.push(`${prefix} does not contain execution mode: pressure.`);
        }
      }

      if (typeof goal.coverageTarget === "number" && goal.coverageTarget < 0.5) {
        warnings.push(`${prefix}.coverageTarget is lower than 0.5.`);
      }

      if (Array.isArray(goal.targetSignals)) {
        const seen = new Set();

        goal.targetSignals.forEach((targetSignal) => {
          const key = getTargetSignalKey(targetSignal);

          if (seen.has(key)) {
            warnings.push(`${prefix}.targetSignals contains duplicated value: ${key}.`);
          }

          seen.add(key);
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default validateEvidenceCollectionPlan;
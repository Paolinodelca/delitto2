const ALLOWED_GOAL_STATUSES = [
  "not_started",
  "collecting",
  "partially_covered",
  "covered",
  "suspended",
  "completed",
];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumberBetweenZeroAndOne(value) {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    value >= 0 &&
    value <= 1
  );
}

function isNumberGreaterThanOrEqualToZero(value) {
  return typeof value === "number" && !Number.isNaN(value) && value >= 0;
}

export function validateCoverageState(coverageState = {}) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(coverageState)) {
    return {
      valid: false,
      errors: ["Coverage State must be an object."],
      warnings,
    };
  }

  if (!isNumberBetweenZeroAndOne(coverageState.overallCoverage)) {
    errors.push("overallCoverage must be a number between 0 and 1.");
  }

  if (!Array.isArray(coverageState.dimensions)) {
    errors.push("dimensions must be an array.");
  }

  if (!Array.isArray(coverageState.goals)) {
    errors.push("goals must be an array.");
  }

  if (!Array.isArray(coverageState.signals)) {
    errors.push("signals must be an array.");
  }

  if (!Array.isArray(coverageState.runtimeSignals)) {
    errors.push("runtimeSignals must be an array.");
  }

  if (!isPlainObject(coverageState.nextRecommendation)) {
    errors.push("nextRecommendation must be an object.");
  }

  if (!isNumberBetweenZeroAndOne(coverageState.confidence)) {
    errors.push("confidence must be a number between 0 and 1.");
  }

  if (!isPlainObject(coverageState.metadata)) {
    errors.push("metadata must be an object.");
  }

  if (!isPlainObject(coverageState.extensions)) {
    errors.push("extensions must be an object.");
  }

  if (Array.isArray(coverageState.goals) && coverageState.goals.length === 0) {
    warnings.push("goals is empty.");
  }

  if (
    Array.isArray(coverageState.signals) &&
    coverageState.signals.length === 0
  ) {
    warnings.push("signals is empty.");
  }

  if (
    isPlainObject(coverageState.nextRecommendation) &&
    !coverageState.nextRecommendation.action
  ) {
    warnings.push("nextRecommendation.action is missing.");
  }

  if (Array.isArray(coverageState.goals)) {
    coverageState.goals.forEach((goal, index) => {
      const prefix = `goals[${index}]`;

      if (!isPlainObject(goal)) {
        errors.push(`${prefix} must be an object.`);
        return;
      }

      if (!isNonEmptyString(goal.goalId)) {
        errors.push(`${prefix}.goalId must be a non-empty string.`);
      }

      if (!isNonEmptyString(goal.status)) {
        errors.push(`${prefix}.status must be a non-empty string.`);
      } else if (!ALLOWED_GOAL_STATUSES.includes(goal.status)) {
        errors.push(
          `${prefix}.status must be one of: ${ALLOWED_GOAL_STATUSES.join(", ")}.`
        );
      }

      if (!Array.isArray(goal.collectedEvidence)) {
        errors.push(`${prefix}.collectedEvidence must be an array.`);
      }

      if (!Array.isArray(goal.missingEvidence)) {
        errors.push(`${prefix}.missingEvidence must be an array.`);
      }

      if (!isNumberGreaterThanOrEqualToZero(goal.followupCount)) {
        errors.push(`${prefix}.followupCount must be a number >= 0.`);
      }

      if (typeof goal.pressureApplied !== "boolean") {
        errors.push(`${prefix}.pressureApplied must be a boolean.`);
      }

      if (typeof goal.recoveryUsed !== "boolean") {
        errors.push(`${prefix}.recoveryUsed must be a boolean.`);
      }

      if (!isNumberBetweenZeroAndOne(goal.confidence)) {
        errors.push(`${prefix}.confidence must be a number between 0 and 1.`);
      }

      if (!isNumberBetweenZeroAndOne(goal.coverage)) {
        errors.push(`${prefix}.coverage must be a number between 0 and 1.`);
      }

      if (!isNumberBetweenZeroAndOne(goal.targetCoverage)) {
        errors.push(`${prefix}.targetCoverage must be a number between 0 and 1.`);
      }

      if (!Array.isArray(goal.targetSignals)) {
        errors.push(`${prefix}.targetSignals must be an array.`);
      } else if (goal.targetSignals.length === 0) {
        warnings.push(`${prefix}.targetSignals is empty.`);
      }

      if (!isPlainObject(goal.extensions)) {
        errors.push(`${prefix}.extensions must be an object.`);
      }
    });
  }

  if (Array.isArray(coverageState.signals)) {
    coverageState.signals.forEach((signal, index) => {
      const prefix = `signals[${index}]`;

      if (!isPlainObject(signal)) {
        errors.push(`${prefix} must be an object.`);
        return;
      }

      if (!isNonEmptyString(signal.signalId)) {
        errors.push(`${prefix}.signalId must be a non-empty string.`);
      }

      if (!isNumberGreaterThanOrEqualToZero(signal.evidenceCount)) {
        errors.push(`${prefix}.evidenceCount must be a number >= 0.`);
      }

      if (!isNumberBetweenZeroAndOne(signal.visibility)) {
        errors.push(`${prefix}.visibility must be a number between 0 and 1.`);
      }

      if (!isNumberBetweenZeroAndOne(signal.confidence)) {
        errors.push(`${prefix}.confidence must be a number between 0 and 1.`);
      }

      if (!Array.isArray(signal.observedEvidence)) {
        errors.push(`${prefix}.observedEvidence must be an array.`);
      }

      if (typeof signal.missingEvidenceReason !== "string") {
        errors.push(`${prefix}.missingEvidenceReason must be a string.`);
      }

      if (!Array.isArray(signal.relatedGoals)) {
        errors.push(`${prefix}.relatedGoals must be an array.`);
      } else if (signal.relatedGoals.length === 0) {
        warnings.push(`${prefix}.relatedGoals is empty.`);
      }

      if (!isPlainObject(signal.extensions)) {
        errors.push(`${prefix}.extensions must be an object.`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default validateCoverageState;
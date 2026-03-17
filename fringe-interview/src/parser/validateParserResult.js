const TASK_TOP_LEVEL_MAP = {
  candidateProfile: "candidateProfile",
  roleProfile: "roleProfile",
  jobFitAnalysis: "jobFitAnalysis"
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateParserResult({ task, result }) {
  if (!task || typeof task !== "string") {
    throw new Error("validateParserResult: task is required.");
  }

  if (!isPlainObject(result)) {
    throw new Error("validateParserResult: result must be a JSON object.");
  }

  const expectedTopLevelKey = TASK_TOP_LEVEL_MAP[task];

  if (!expectedTopLevelKey) {
    throw new Error(`validateParserResult: unsupported task "${task}".`);
  }

  if (!(expectedTopLevelKey in result)) {
    throw new Error(
      [
        `validateParserResult: missing expected top-level key "${expectedTopLevelKey}".`,
        `Available keys: ${Object.keys(result).join(", ") || "(none)"}`
      ].join("\n")
    );
  }

  if (!isPlainObject(result[expectedTopLevelKey])) {
    throw new Error(
      `validateParserResult: "${expectedTopLevelKey}" must contain an object.`
    );
  }

  return {
    ok: true,
    topLevelKey: expectedTopLevelKey
  };
}
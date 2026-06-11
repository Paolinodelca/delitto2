function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function ensureObject(value) {
  return isPlainObject(value) ? value : {};
}

function ensureString(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeLocale(value, fallback = "it") {
  const raw = ensureString(value, fallback).toLowerCase();

  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("it")) return "it";

  return fallback;
}

function normalizeScenarioType(value) {
  const raw = ensureString(value, "interview").toLowerCase();

  if (raw === "interview") return "interview";
  if (raw === "negotiation") return "negotiation";

  return "interview";
}

function normalizeInputMode(value) {
  const raw = ensureString(value, "text").toLowerCase();

  if (raw === "voice") return "voice";
  return "text";
}

function normalizeInputSource(value) {
  const raw = ensureString(value, "upload").toLowerCase();

  if (raw === "manual") return "manual";
  if (raw === "upload") return "upload";
  if (raw === "mixed") return "mixed";

  return "upload";
}

function normalizeFrictionType(value) {
  const raw = ensureString(value, "none").toLowerCase();

  if (raw === "light") return "light";
  return "none";
}

function normalizeCvFile(value) {
  if (!isPlainObject(value)) {
    return {
      isProvided: false,
      name: "",
      size: null,
      type: "",
      lastModified: null
    };
  }

  const name = ensureString(value.name, "");
  const type = ensureString(value.type, "");
  const size =
    typeof value.size === "number" && Number.isFinite(value.size)
      ? value.size
      : null;
  const lastModified =
    typeof value.lastModified === "number" && Number.isFinite(value.lastModified)
      ? value.lastModified
      : null;

  return {
    isProvided: !!name,
    name,
    size,
    type,
    lastModified
  };
}

function deriveBaseLocale({ mvp, intakeState, shellOptions }) {
  return normalizeLocale(
    intakeState?.sessionLocale ||
      intakeState?.uiLocale ||
      shellOptions?.sessionLocale ||
      shellOptions?.uiLocale ||
      mvp?.finalCandidateReport?.locale ||
      mvp?.meta?.sessionLocale ||
      mvp?.meta?.locale ||
      "it",
    "it"
  );
}

export function buildInteractiveSessionPayload({
  sessionResult,
  intakeState,
  shellOptions
} = {}) {
  const safeSessionResult = isPlainObject(sessionResult) ? sessionResult : {};
  const mvp = ensureObject(safeSessionResult?.fringeInterviewMVPSession);

  const safeIntakeState = ensureObject(intakeState);
  const safeShellOptions = ensureObject(shellOptions);

  const uiLocale = normalizeLocale(
    safeIntakeState?.uiLocale || safeShellOptions?.uiLocale || "it",
    "it"
  );

  const sessionLocale = deriveBaseLocale({
    mvp,
    intakeState: safeIntakeState,
    shellOptions: safeShellOptions
  });

  const scenarioType = normalizeScenarioType(
    safeIntakeState?.scenarioType || safeShellOptions?.scenarioType || "interview"
  );

  const inputMode = normalizeInputMode(
    safeIntakeState?.inputMode || safeShellOptions?.inputMode || "text"
  );

  const frictionType = normalizeFrictionType(
    safeIntakeState?.frictionType || safeShellOptions?.frictionType || "none"
  );

  const inputSource = normalizeInputSource(
    safeIntakeState?.inputSource || safeShellOptions?.inputSource || "upload"
  );

  const targetRole = ensureString(
    safeIntakeState?.targetRole ||
      mvp?.meta?.targetRole ||
      mvp?.parserResult?.roleProfile?.targetRole ||
      "",
    ""
  );

  const jobDescription = ensureString(
    safeIntakeState?.jobDescription ||
      mvp?.meta?.jobDescription ||
      "",
    ""
  );

  const cvFile = normalizeCvFile(safeIntakeState?.cvFile);

  const existingMeta = clone(mvp?.meta || {}) || {};

  const inputLayer = {
    scenarioType,
    inputMode,
    uiLocale,
    sessionLocale,
    inputSource,
    frictionType,
    targetRole,
    jobDescription,
    cvFile,
    voiceMode: {
      requested: inputMode === "voice",
      isFutureMode: true
    }
  };

  const mergedMeta = {
    ...existingMeta,
    locale: sessionLocale,
    uiLocale,
    sessionLocale,
    scenarioType,
    inputMode,
    inputSource,
    frictionType,
    targetRole,
    hasJobDescription: !!jobDescription,
    hasCvFile: !!cvFile.isProvided
  };

  return {
    interactiveSessionPayload: {
      locale: sessionLocale,
      uiLocale,
      sessionLocale,
      scenarioType,
      inputMode,
      inputSource,
      frictionType,

      inputLayer,

      candidateInput: {
        targetRole,
        jobDescription,
        cvFile
      },

      parserResult: clone(mvp?.parserResult || {}),
      interviewPlan: clone(mvp?.interviewPlan || {}),
      interviewQuestionSet: clone(mvp?.interviewQuestionSet || {}),
      interviewSession: clone(mvp?.interviewSession || {}),
      interviewRuntime: clone(mvp?.interviewRuntime || {}),
      interviewReport: clone(mvp?.interviewReport || {}),
      finalCandidateReport: clone(mvp?.finalCandidateReport || {}),

      meta: mergedMeta
    }
  };
}

export default buildInteractiveSessionPayload;
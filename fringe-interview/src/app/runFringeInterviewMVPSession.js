import { runFringeInterviewMVP } from "./runFringeInterviewMVP.js";
import {
  advanceInterviewRuntime,
  collectInterviewReport,
  buildFinalCandidateReport
} from "../interview/index.js";

import {
  buildBetaRuntimeResumeState,
  completeBetaRuntimeSession,
  createBetaRuntimeSession,
  resumeBetaRuntimeSession,
  syncBetaRuntimeProgress
} from "./betaRuntimeSessionIntegration.js";
function ensureArray(value) {
  return Array.isArray(value) ? value : [];
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
  if (raw === "mixed") return "mixed";
  if (raw === "upload") return "upload";

  return "upload";
}

function normalizeFrictionType(value) {
  const raw = ensureString(value, "none").toLowerCase();

  if (raw === "light") return "light";
  return "none";
}

function buildFallbackJdText({ targetRole, roleNotes }) {
  const safeRole = ensureString(targetRole, "");
  const safeRoleNotes = ensureString(roleNotes, "");

  const lines = [];

  if (safeRole) {
    lines.push(`Target role: ${safeRole}`);
  }

  lines.push(
    "No formal job description was provided. Build the interview using the target role as the main anchor and keep assumptions explicit."
  );

  if (safeRoleNotes) {
    lines.push(`Additional role notes: ${safeRoleNotes}`);
  }

  return lines.join("\n\n");
}

function enrichRuntimeMeta({
  runtime,
  modelAdapter,
  sessionLocale,
  jobFitAnalysis
}) {
  const safeRuntime = runtime || {};

  return {
    ...safeRuntime,
    meta: {
      ...(safeRuntime.meta || {}),
      modelAdapter,
      locale: {
        code: sessionLocale || "it"
      },
      jobFitAnalysis: jobFitAnalysis || null
    }
  };
}

export async function runFringeInterviewMVPSession({
  cvText,
  jdText = "",
  userNotes = "",
  roleNotes = "",
  targetRole = "",
  modelAdapter,
  answers = [],
  interviewLengthMode = "",
  interviewFocusMode = "balanced",
  scenarioType = "interview",
  inputMode = "text",
  uiLocale = "it",
  sessionLocale = "it",
  inputSource = "upload",
  frictionType = "none",
  betaSession = null,
  betaSessionNow = () => new Date(),
  betaSessionIdFactory,
  betaSessionTokenFactory
}) {
  const safeCvText = ensureString(cvText, "");
  const safeJdText = ensureString(jdText, "");
  const safeTargetRole = ensureString(targetRole, "");
  const safeUserNotes = ensureString(userNotes, "");
  const safeRoleNotes = ensureString(roleNotes, "");

  if (!safeCvText) {
    throw new Error("runFringeInterviewMVPSession: cvText is required.");
  }

  if (typeof modelAdapter !== "function") {
    throw new Error("runFringeInterviewMVPSession: modelAdapter must be a function.");
  }

  if (!safeJdText && !safeTargetRole) {
    throw new Error(
      "runFringeInterviewMVPSession: provide jdText or targetRole."
    );
  }

  const resolvedScenarioType = normalizeScenarioType(scenarioType);
  const resolvedInputMode = normalizeInputMode(inputMode);
  const resolvedUiLocale = normalizeLocale(uiLocale, "it");
  const resolvedSessionLocale = normalizeLocale(
    sessionLocale || uiLocale,
    resolvedUiLocale
  );
  const resolvedInputSource = normalizeInputSource(inputSource);
  const resolvedFrictionType = normalizeFrictionType(frictionType);

  const resolvedJdText =
    safeJdText ||
    buildFallbackJdText({
      targetRole: safeTargetRole,
      roleNotes: safeRoleNotes
    });

  const enrichedRoleNotes = [
    safeRoleNotes,
    safeTargetRole ? `Declared target role: ${safeTargetRole}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");

  const mvpResult = await runFringeInterviewMVP({
    cvText: safeCvText,
    jdText: resolvedJdText,
    userNotes: safeUserNotes,
    roleNotes: enrichedRoleNotes,
    modelAdapter,
    interviewLengthMode,
    interviewFocusMode
  });

  const mvp = mvpResult.fringeInterviewMVP;

  let runtime = enrichRuntimeMeta({
    runtime: mvp.interviewRuntime,
    modelAdapter,
    sessionLocale: resolvedSessionLocale,
    jobFitAnalysis: mvp?.parserResult?.jobFitAnalysis || null
  });

  const interviewSession = mvp.interviewSession;

  let betaSessionEnvelope;
  let activeBetaSession;
  if (betaSession) {
    activeBetaSession = resumeBetaRuntimeSession(betaSession, {
      runtime,
      now: betaSessionNow
    });
    betaSessionEnvelope = { session: activeBetaSession, resumeToken: null };
  } else {
    betaSessionEnvelope = createBetaRuntimeSession({
      inputRefs: [
        { type: "candidate_input", id: "cv" },
        { type: "target_input", id: safeJdText ? "job_description" : "target_role" }
      ],
      runtime,
      now: betaSessionNow,
      idFactory: betaSessionIdFactory,
      tokenFactory: betaSessionTokenFactory
    });
    activeBetaSession = betaSessionEnvelope.session;
  }

  for (const answerText of ensureArray(answers)) {
    const stepType = runtime?.currentStep?.stepType;

    if (!stepType) {
      break;
    }

    const advanced = await advanceInterviewRuntime({
      interviewSession,
      interviewRuntime: runtime,
      answerText,
      modelAdapter
    });

    runtime = advanced.interviewRuntime;
    activeBetaSession = syncBetaRuntimeProgress(activeBetaSession, {
      runtime,
      now: betaSessionNow
    });
  }

  const interviewReport = collectInterviewReport({
    interviewRuntime: runtime
  });

  const finalCandidateReport = buildFinalCandidateReport({
    candidateProfile: mvp.parserResult.candidateProfile,
    roleProfile: mvp.parserResult.roleProfile,
    jobFitAnalysis: mvp.parserResult.jobFitAnalysis,
    interviewReport: interviewReport.interviewReport
  });

  if (runtime?.runtimeState?.isCompleted) {
    activeBetaSession = completeBetaRuntimeSession(activeBetaSession, {
      runtime,
      resultRef: {
        type: "final_candidate_report",
        id: `${activeBetaSession.sessionId}_final_candidate_report`
      },
      now: betaSessionNow
    });
  }

  return {
    fringeInterviewMVPSession: {
      rawInput: {
        cvText: safeCvText,
        jdText: safeJdText,
        resolvedJdText,
        userNotes: safeUserNotes,
        roleNotes: safeRoleNotes,
        enrichedRoleNotes,
        targetRole: safeTargetRole
      },
      parserResult: mvp.parserResult,
      interviewPlan: mvp.interviewPlan,
      interviewQuestionSet: mvp.interviewQuestionSet,
      interviewSession: mvp.interviewSession,
      interviewRuntime: runtime,
      interviewReport: interviewReport.interviewReport,
      finalCandidateReport: finalCandidateReport.finalCandidateReport,
      betaSession: activeBetaSession,
      betaSessionResumeState: buildBetaRuntimeResumeState(activeBetaSession),
      resumeToken: betaSessionEnvelope.resumeToken,
      meta: {
        scenarioType: resolvedScenarioType,
        inputMode: resolvedInputMode,
        uiLocale: resolvedUiLocale,
        sessionLocale: resolvedSessionLocale,
        inputSource: resolvedInputSource,
        frictionType: resolvedFrictionType,
        targetRole: safeTargetRole,
        hasCvText: !!safeCvText,
        hasJobDescription: !!safeJdText,
        usedFallbackJobDescription: !safeJdText,
        completed: true,
        answersProvided: ensureArray(answers).length,
        answersRecorded: runtime?.runtimeState?.answers?.length ?? 0,
        sessionCompleted: runtime?.runtimeState?.isCompleted ?? false,
        requestedInterviewLengthMode: interviewLengthMode || "",
        requestedInterviewFocusMode: interviewFocusMode || "balanced",
        resolvedInterviewLengthMode:
          mvp.interviewQuestionSet?.contextualSelection?.questionSelectionStrategy?.interviewLengthMode ||
          ""
      }
    }
  };
}

export default runFringeInterviewMVPSession;
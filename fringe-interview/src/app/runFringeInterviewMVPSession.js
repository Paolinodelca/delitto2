import { runFringeInterviewMVP } from "./runFringeInterviewMVP.js";
import {
  advanceInterviewRuntime,
  collectInterviewReport,
  buildFinalCandidateReport
} from "../interview/index.js";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export async function runFringeInterviewMVPSession({
  cvText,
  jdText,
  userNotes = "",
  roleNotes = "",
  modelAdapter,
  answers = [],
  interviewLengthMode = ""
}) {
  if (typeof cvText !== "string" || !cvText.trim()) {
    throw new Error("runFringeInterviewMVPSession: cvText is required.");
  }

  if (typeof jdText !== "string" || !jdText.trim()) {
    throw new Error("runFringeInterviewMVPSession: jdText is required.");
  }

  if (typeof modelAdapter !== "function") {
    throw new Error("runFringeInterviewMVPSession: modelAdapter must be a function.");
  }

  const mvpResult = await runFringeInterviewMVP({
    cvText,
    jdText,
    userNotes,
    roleNotes,
    modelAdapter,
    interviewLengthMode
  });

  const mvp = mvpResult.fringeInterviewMVP;

  let runtime = mvp.interviewRuntime;
  const interviewSession = mvp.interviewSession;

  for (const answerText of ensureArray(answers)) {
    const stepType = runtime?.currentStep?.stepType;

    if (!stepType) {
      break;
    }

    runtime = advanceInterviewRuntime({
      interviewSession,
      interviewRuntime: runtime,
      answerText
    }).interviewRuntime;
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

  return {
    fringeInterviewMVPSession: {
      parserResult: mvp.parserResult,
      interviewPlan: mvp.interviewPlan,
      interviewQuestionSet: mvp.interviewQuestionSet,
      interviewSession: mvp.interviewSession,
      interviewRuntime: runtime,
      interviewReport: interviewReport.interviewReport,
      finalCandidateReport: finalCandidateReport.finalCandidateReport,
      meta: {
        completed: true,
        answersProvided: ensureArray(answers).length,
        answersRecorded: runtime?.runtimeState?.answers?.length ?? 0,
        sessionCompleted: runtime?.runtimeState?.isCompleted ?? false,
        requestedInterviewLengthMode: interviewLengthMode || "",
        resolvedInterviewLengthMode:
          mvp.interviewQuestionSet?.contextualSelection?.questionSelectionStrategy?.interviewLengthMode ||
          ""
      }
    }
  };
}
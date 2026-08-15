import { runFullParserPipeline } from "../parser/index.js";
import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet,
  composeInterviewSession,
  createInterviewRuntime
} from "../interview/index.js";

export async function runFringeInterviewMVP({
  cvText,
  jdText,
  userNotes = "",
  roleNotes = "",
  modelAdapter,
  interviewLengthMode = "",
  interviewFocusMode = "balanced",
  scenarioType = "interview",
  inputMode = "text",
  uiLocale = "it",
  sessionLocale = "it",
  recentQuestionKeys = [],
  recentQuestionHistory = []
}) {

  if (typeof cvText !== "string" || !cvText.trim()) {
    throw new Error("runFringeInterviewMVP: cvText is required.");
  }

  if (typeof jdText !== "string" || !jdText.trim()) {
    throw new Error("runFringeInterviewMVP: jdText is required.");
  }

  if (typeof modelAdapter !== "function") {
    throw new Error("runFringeInterviewMVP: modelAdapter must be a function.");
  }

  const parserResult = await runFullParserPipeline({
    cvText,
    jdText,
    userNotes,
    roleNotes,
    modelAdapter
  });

  const interviewPlanResult = deriveInterviewPlanFromJobFit({
    candidateProfile: parserResult.candidateProfile,
    roleProfile: parserResult.roleProfile,
    jobFitAnalysis: parserResult.jobFitAnalysis
  });

  const questionSetResult = await buildInterviewQuestionSet({
    interviewPlan: interviewPlanResult.interviewPlan,
    candidateProfile: parserResult.candidateProfile,
    roleProfile: parserResult.roleProfile,
    jobFitAnalysis: parserResult.jobFitAnalysis,
    interviewLengthMode,
    interviewFocusMode,
    recentQuestionKeys,
    recentQuestionHistory
  });

  const interviewSessionResult = composeInterviewSession({
    interviewPlan: interviewPlanResult.interviewPlan,
    interviewQuestionSet: questionSetResult.interviewQuestionSet
  });

  const runtimeResult = createInterviewRuntime({
  interviewSession: interviewSessionResult.interviewSession,
  scenarioType,
  inputMode,
  uiLocale,
  sessionLocale
});

  const runtime = runtimeResult.interviewRuntime;

  runtime.meta = {
  scenarioType,
  inputMode,
  uiLocale,
  sessionLocale
};

  runtime.sessionFollowupBlocks =
    questionSetResult.interviewQuestionSet?.selectedFollowupPacks || [];

  return {
    fringeInterviewMVP: {
      parserResult,
      interviewPlan: interviewPlanResult.interviewPlan,
      interviewQuestionSet: questionSetResult.interviewQuestionSet,
      interviewSession: interviewSessionResult.interviewSession,
      interviewRuntime: runtime,
      meta: {
        completed: true,
        stages: {
          parser: true,
          planning: true,
          questionSelection: true,
          sessionComposition: true,
          runtimeInitialization: true
        },
        requestedInterviewLengthMode: interviewLengthMode || "",
        resolvedInterviewLengthMode:
          questionSetResult.interviewQuestionSet?.contextualSelection?.questionSelectionStrategy?.interviewLengthMode ||
          "",
        requestedInterviewFocusMode: interviewFocusMode || "balanced"
      }
    }
  };
}
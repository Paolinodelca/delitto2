function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function buildInteractiveSessionPayload({ sessionResult }) {
  if (!sessionResult || typeof sessionResult !== "object") {
    throw new Error("buildInteractiveSessionPayload: sessionResult is required.");
  }

  const mvp = sessionResult?.fringeInterviewMVPSession || {};

  return {
    interactiveSessionPayload: {
      locale: mvp?.finalCandidateReport?.locale || "it",
      parserResult: clone(mvp?.parserResult || {}),
      interviewPlan: clone(mvp?.interviewPlan || {}),
      interviewQuestionSet: clone(mvp?.interviewQuestionSet || {}),
      interviewSession: clone(mvp?.interviewSession || {}),
      interviewRuntime: clone(mvp?.interviewRuntime || {}),
      interviewReport: clone(mvp?.interviewReport || {}),
      finalCandidateReport: clone(mvp?.finalCandidateReport || {}),
      meta: clone(mvp?.meta || {})
    }
  };
}
function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasContent(value) {
  return isObject(value) && Object.keys(value).length > 0;
}

function blocker(code, message) {
  return Object.freeze({ code, message });
}

export function assessBetaUserJourney(sessionResult = {}) {
  const session = isObject(sessionResult?.fringeInterviewMVPSession)
    ? sessionResult.fringeInterviewMVPSession
    : sessionResult;
  const betaSession = isObject(session?.betaSession) ? session.betaSession : {};
  const runtime = isObject(session?.interviewRuntime) ? session.interviewRuntime : {};
  const runtimeState = isObject(runtime?.runtimeState) ? runtime.runtimeState : {};

  const stages = {
    started: betaSession.status === "in_progress" || betaSession.status === "completed",
    interviewCompleted: runtimeState.isCompleted === true,
    reportBuilt: hasContent(session?.finalCandidateReport),
    sessionClosed: betaSession.status === "completed"
  };

  const blockers = [];
  if (!stages.started) {
    blockers.push(blocker("BETA_SESSION_NOT_STARTED", "The beta session has not started."));
  }
  if (!stages.interviewCompleted) {
    blockers.push(blocker("INTERVIEW_NOT_COMPLETED", "The interview runtime is not completed."));
  }
  if (!stages.reportBuilt) {
    blockers.push(blocker("FINAL_REPORT_NOT_BUILT", "The final candidate report is not available."));
  }
  if (!stages.sessionClosed) {
    blockers.push(blocker("BETA_SESSION_NOT_CLOSED", "The beta session is not completed."));
  }

  const completed = blockers.length === 0;
  const status = completed
    ? "completed"
    : stages.started
      ? "in_progress"
      : "blocked";

  return Object.freeze({
    status,
    completed,
    reportAvailable: completed && stages.reportBuilt,
    stages: Object.freeze({ ...stages }),
    blockers: Object.freeze(blockers),
    answersRecorded: Array.isArray(runtimeState.answers) ? runtimeState.answers.length : 0
  });
}

export default assessBetaUserJourney;

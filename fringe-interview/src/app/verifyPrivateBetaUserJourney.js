import { runFringeInterviewMVPSession } from "./runFringeInterviewMVPSession.js";

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function freeze(value) {
  if (Array.isArray(value)) {
    value.forEach(freeze);
    return Object.freeze(value);
  }
  if (isObject(value)) {
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }
  return value;
}

function assertCompletedJourney(result) {
  const session = result?.fringeInterviewMVPSession;
  const journey = session?.betaUserJourney;

  if (!isObject(session)) {
    throw new Error("PRIVATE_BETA_E2E_SESSION_OUTPUT_MISSING");
  }
  if (!isObject(journey)) {
    throw new Error("PRIVATE_BETA_E2E_JOURNEY_ASSESSMENT_MISSING");
  }
  if (journey.completed !== true || journey.status !== "completed") {
    const blockerCodes = Array.isArray(journey.blockers)
      ? journey.blockers.map((item) => item?.code).filter(Boolean)
      : [];
    throw new Error(
      `PRIVATE_BETA_E2E_JOURNEY_INCOMPLETE${blockerCodes.length ? `: ${blockerCodes.join(", ")}` : ""}`
    );
  }
  if (journey.reportAvailable !== true || !isObject(session.finalCandidateReport)) {
    throw new Error("PRIVATE_BETA_E2E_FINAL_REPORT_UNAVAILABLE");
  }
  if (session.betaSession?.status !== "completed") {
    throw new Error("PRIVATE_BETA_E2E_SESSION_NOT_CLOSED");
  }
  if (session.interviewRuntime?.runtimeState?.isCompleted !== true) {
    throw new Error("PRIVATE_BETA_E2E_RUNTIME_NOT_COMPLETED");
  }

  return session;
}

export async function verifyPrivateBetaUserJourney({
  sessionInput,
  sessionRunner = runFringeInterviewMVPSession
} = {}) {
  if (!isObject(sessionInput)) {
    throw new Error("verifyPrivateBetaUserJourney: sessionInput is required.");
  }
  if (typeof sessionRunner !== "function") {
    throw new Error("verifyPrivateBetaUserJourney: sessionRunner must be a function.");
  }

  const result = await sessionRunner(sessionInput);
  const session = assertCompletedJourney(result);
  const journey = session.betaUserJourney;

  return freeze({
    status: "passed",
    journeyStatus: journey.status,
    sessionId: session.betaSession?.sessionId || null,
    answersRecorded: journey.answersRecorded,
    reportAvailable: true,
    stages: {
      started: journey.stages?.started === true,
      interviewCompleted: journey.stages?.interviewCompleted === true,
      reportBuilt: journey.stages?.reportBuilt === true,
      sessionClosed: journey.stages?.sessionClosed === true
    }
  });
}

export default verifyPrivateBetaUserJourney;

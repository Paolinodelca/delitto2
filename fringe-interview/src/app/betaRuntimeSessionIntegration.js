import {
  attachBetaSessionResult,
  buildBetaSessionResumeState,
  createBetaSession,
  transitionBetaSession,
  updateBetaSessionProgress,
  validateBetaSession
} from "../session/index.js";

function normalizeStep(runtime, fallback = "interview_in_progress") {
  const step = runtime?.currentStep;
  return String(
    step?.phaseName || step?.stepType || step?.label || fallback
  ).trim() || fallback;
}

function runtimeReference(sessionId) {
  return { type: "interview_runtime", id: `${sessionId}_runtime` };
}

export function createBetaRuntimeSession({
  testerId = "",
  inputRefs = [],
  runtime,
  now = () => new Date(),
  idFactory,
  tokenFactory
} = {}) {
  const created = createBetaSession({ testerId, inputRefs, now, idFactory, tokenFactory });
  const started = transitionBetaSession(created.session, {
    toStatus: "in_progress",
    interviewStatus: "in_progress",
    currentStep: normalizeStep(runtime),
    now
  });
  const session = updateBetaSessionProgress(started, {
    currentStep: normalizeStep(runtime),
    interviewStatus: "in_progress",
    runtimeRef: runtimeReference(started.sessionId),
    now
  });
  return { session, resumeToken: created.resumeToken };
}


export function startBetaRuntimeSession(session, {
  runtime,
  inputRefs = [],
  now = () => new Date()
} = {}) {
  const validation = validateBetaSession(session);
  if (!validation.valid) throw new Error(`Invalid beta session: ${validation.errors.join("; ")}`);
  if (session.status !== "created") {
    throw new Error("Only created beta sessions can be started.");
  }
  const started = transitionBetaSession(session, {
    toStatus: "in_progress",
    interviewStatus: "in_progress",
    currentStep: normalizeStep(runtime),
    now
  });
  return updateBetaSessionProgress(started, {
    currentStep: normalizeStep(runtime),
    inputRefs,
    interviewStatus: "in_progress",
    runtimeRef: runtimeReference(started.sessionId),
    now
  });
}

export function resumeBetaRuntimeSession(session, { runtime, now = () => new Date() } = {}) {
  const validation = validateBetaSession(session);
  if (!validation.valid) throw new Error(`Invalid beta session: ${validation.errors.join("; ")}`);
  if (session.status !== "interrupted") {
    throw new Error("Only interrupted beta sessions can be resumed.");
  }
  const resumed = transitionBetaSession(session, {
    toStatus: "in_progress",
    interviewStatus: "in_progress",
    currentStep: normalizeStep(runtime, session.currentStep),
    now
  });
  return updateBetaSessionProgress(resumed, {
    currentStep: normalizeStep(runtime, session.currentStep),
    interviewStatus: "in_progress",
    runtimeRef: session.interview.runtimeRef || runtimeReference(session.sessionId),
    now
  });
}

export function syncBetaRuntimeProgress(session, { runtime, now = () => new Date() } = {}) {
  if (session.status !== "in_progress") {
    throw new Error("Runtime progress requires an in-progress beta session.");
  }
  return updateBetaSessionProgress(session, {
    currentStep: normalizeStep(runtime),
    interviewStatus: "in_progress",
    runtimeRef: session.interview.runtimeRef || runtimeReference(session.sessionId),
    now
  });
}

export function interruptBetaRuntimeSession(session, { runtime, now = () => new Date() } = {}) {
  const progressed = syncBetaRuntimeProgress(session, { runtime, now });
  return transitionBetaSession(progressed, {
    toStatus: "interrupted",
    interviewStatus: "in_progress",
    currentStep: normalizeStep(runtime, progressed.currentStep),
    now
  });
}

export function completeBetaRuntimeSession(session, {
  runtime,
  resultRef,
  now = () => new Date()
} = {}) {
  if (!runtime?.runtimeState?.isCompleted) {
    throw new Error("Interview runtime must be completed before completing the beta session.");
  }
  const progressed = syncBetaRuntimeProgress(session, { runtime, now });
  const linked = attachBetaSessionResult(progressed, { resultRef, now });
  return transitionBetaSession(linked, {
    toStatus: "completed",
    interviewStatus: "completed",
    currentStep: "interview_completed",
    now
  });
}

export function buildBetaRuntimeResumeState(session) {
  return buildBetaSessionResumeState(session);
}

export default {
  createBetaRuntimeSession,
  startBetaRuntimeSession,
  resumeBetaRuntimeSession,
  syncBetaRuntimeProgress,
  interruptBetaRuntimeSession,
  completeBetaRuntimeSession,
  buildBetaRuntimeResumeState
};

import { clone } from "./shared.js";
import { validateBetaSession } from "./validateBetaSession.js";

export function buildBetaSessionResumeState(session) {
  const validation = validateBetaSession(session);
  if (!validation.valid) {
    throw new Error(`Invalid beta session: ${validation.errors.join("; ")}`);
  }

  return clone({
    sessionId: session.sessionId,
    revision: session.revision,
    testerId: session.testerId,
    status: session.status,
    currentStep: session.currentStep,
    inputRefs: session.inputRefs,
    interview: session.interview,
    resultRef: session.resultRef,
    canResume: session.status === "created" || session.status === "in_progress" || session.status === "interrupted"
  });
}

export default buildBetaSessionResumeState;

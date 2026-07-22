import {
  BETA_SESSION_INITIAL_REVISION,
  BETA_SESSION_SCHEMA_VERSION,
  buildTechnicalId,
  clone,
  createResumeToken,
  hashResumeToken,
  normalizeReferences,
  normalizeString,
  normalizeTimestamp
} from "./shared.js";
import { validateBetaSession } from "./validateBetaSession.js";

export function createBetaSession({ testerId = "", inputRefs = [], now = () => new Date(), idFactory, tokenFactory } = {}) {
  const createdAt = normalizeTimestamp(now());
  const resolvedTesterId = normalizeString(testerId) || buildTechnicalId("tester", idFactory);
  const sessionId = buildTechnicalId("session", idFactory);
  const resumeToken = createResumeToken(tokenFactory);
  const session = {
    schemaVersion: BETA_SESSION_SCHEMA_VERSION,
    revision: BETA_SESSION_INITIAL_REVISION,
    sessionId,
    testerId: resolvedTesterId,
    resumeTokenHash: hashResumeToken(resumeToken),
    status: "created",
    currentStep: "session_created",
    inputRefs: normalizeReferences(inputRefs, "Input reference"),
    interview: { status: "not_started", runtimeRef: null },
    resultRef: null,
    lifecycle: { createdAt, updatedAt: createdAt, interruptedAt: null, completedAt: null }
  };
  const validation = validateBetaSession(session);
  if (!validation.valid) throw new Error(`Invalid beta session: ${validation.errors.join("; ")}`);
  return { session: clone(session), resumeToken };
}
export default createBetaSession;

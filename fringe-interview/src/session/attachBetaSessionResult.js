import { clone, nextRevision, normalizeReference, normalizeUpdateTimestamp } from "./shared.js";
import { validateBetaSession } from "./validateBetaSession.js";
export function attachBetaSessionResult(session, { resultRef, now = () => new Date() } = {}) {
  const sourceValidation = validateBetaSession(session);
  if (!sourceValidation.valid) throw new Error(`Invalid source beta session: ${sourceValidation.errors.join("; ")}`);
  if (session.status !== "in_progress") throw new Error("Results can be attached only to in-progress beta sessions.");
  const updatedAt = normalizeUpdateTimestamp(now(), session);
  if (Date.parse(updatedAt) < Date.parse(session.lifecycle.updatedAt)) throw new Error("Beta session updatedAt cannot move backwards.");
  const next = clone(session);
  next.resultRef = normalizeReference(resultRef, "Result reference");
  next.lifecycle.updatedAt = updatedAt;
  next.revision = nextRevision(session);
  const validation = validateBetaSession(next);
  if (!validation.valid) throw new Error(`Invalid beta session result link: ${validation.errors.join("; ")}`);
  return next;
}
export default attachBetaSessionResult;

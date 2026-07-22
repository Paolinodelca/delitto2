import { clone, nextRevision, normalizeReference, normalizeReferences, normalizeString, normalizeUpdateTimestamp } from "./shared.js";
import { validateBetaSession } from "./validateBetaSession.js";
export function updateBetaSessionProgress(session, { currentStep, inputRefs, interviewStatus, runtimeRef, now = () => new Date() } = {}) {
  const sourceValidation = validateBetaSession(session);
  if (!sourceValidation.valid) throw new Error(`Invalid source beta session: ${sourceValidation.errors.join("; ")}`);
  if (session.status === "completed") throw new Error("Completed beta sessions cannot be updated.");
  const next = clone(session);
  const step = normalizeString(currentStep); if (step) next.currentStep = step;
  if (Array.isArray(inputRefs)) next.inputRefs = normalizeReferences([...next.inputRefs, ...inputRefs], "Input reference");
  if (interviewStatus !== undefined) next.interview.status = normalizeString(interviewStatus);
  if (runtimeRef !== undefined) next.interview.runtimeRef = normalizeReference(runtimeRef, "Runtime reference");
  const updatedAt = normalizeUpdateTimestamp(now(), session);
  if (Date.parse(updatedAt) < Date.parse(session.lifecycle.updatedAt)) throw new Error("Beta session updatedAt cannot move backwards.");
  next.lifecycle.updatedAt = updatedAt;
  next.revision = nextRevision(session);
  const validation = validateBetaSession(next);
  if (!validation.valid) throw new Error(`Invalid updated beta session: ${validation.errors.join("; ")}`);
  return next;
}
export default updateBetaSessionProgress;

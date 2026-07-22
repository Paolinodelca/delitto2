import { clone, nextRevision, normalizeReference, normalizeString, normalizeUpdateTimestamp } from "./shared.js";
import { validateBetaSession } from "./validateBetaSession.js";
const ALLOWED_TRANSITIONS = Object.freeze({ created: ["in_progress", "interrupted"], in_progress: ["interrupted", "completed"], interrupted: ["in_progress"], completed: [] });
export function transitionBetaSession(session, { toStatus, currentStep = "", interviewStatus, resultRef, now = () => new Date() } = {}) {
  const sourceValidation = validateBetaSession(session);
  if (!sourceValidation.valid) throw new Error(`Invalid source beta session: ${sourceValidation.errors.join("; ")}`);
  const target = normalizeString(toStatus);
  if (!(ALLOWED_TRANSITIONS[session.status] || []).includes(target)) throw new Error(`Invalid beta session transition: ${session.status} -> ${target || "(empty)"}.`);
  const updatedAt = normalizeUpdateTimestamp(now(), session);
  if (Date.parse(updatedAt) < Date.parse(session.lifecycle.updatedAt)) throw new Error("Beta session updatedAt cannot move backwards.");
  const next = clone(session);
  next.revision = nextRevision(session);
  next.status = target;
  next.currentStep = normalizeString(currentStep) || next.currentStep;
  next.lifecycle.updatedAt = updatedAt;
  if (interviewStatus !== undefined) next.interview.status = normalizeString(interviewStatus);
  if (resultRef !== undefined) next.resultRef = normalizeReference(resultRef, "Result reference");
  if (target === "interrupted") next.lifecycle.interruptedAt = updatedAt;
  if (target === "in_progress") next.lifecycle.interruptedAt = null;
  if (target === "completed") next.lifecycle.completedAt = updatedAt;
  const validation = validateBetaSession(next);
  if (!validation.valid) throw new Error(`Invalid target beta session: ${validation.errors.join("; ")}`);
  return next;
}
export default transitionBetaSession;

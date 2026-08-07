const OPERATIONAL_EVENT_VERSION = "private-beta-operational-event-1.0";
const MODEL_VERSION = "1.0";

const EVENT_TYPES = Object.freeze(["session_started", "session_completed", "application_error", "session_interrupted"]);
const BOUNDARIES = Object.freeze(["onboarding", "privacy_consent", "material_acquisition", "beta_journey", "report", "professional_identity_snapshot", "feedback", "runtime_session"]);
const OUTCOMES = Object.freeze(["started", "completed", "failed", "interrupted"]);
const FORBIDDEN_FIELDS = Object.freeze([
  "cv", "cvText", "answers", "responses", "report", "finalCandidateReport", "comment", "prompt",
  "token", "secret", "stack", "stackTrace", "professionalIdentity", "representation"
]);

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

function validIso(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

function normalizeIdentifier(value, code) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 120) throw new Error(code);
  return value.trim();
}

function resolveNow(now) {
  const value = now ?? new Date().toISOString();
  if (!validIso(value)) throw new Error("PRIVATE_BETA_OPERATIONAL_EVENT_INVALID_TIMESTAMP");
  return value;
}

function assertAllowed(value, allowed, code) {
  if (!allowed.includes(value)) throw new Error(code);
  return value;
}

export function buildPrivateBetaOperationalEvent({
  eventId,
  sessionId,
  eventType,
  boundary,
  outcome,
  errorCode = null,
  now
} = {}) {
  if (errorCode !== null && (typeof errorCode !== "string" || !/^[A-Z0-9_]{1,80}$/.test(errorCode))) {
    throw new Error("PRIVATE_BETA_OPERATIONAL_EVENT_INVALID_ERROR_CODE");
  }

  return freeze({
    version: MODEL_VERSION,
    type: "private_beta_operational_event",
    formatVersion: OPERATIONAL_EVENT_VERSION,
    eventId: normalizeIdentifier(eventId, "PRIVATE_BETA_OPERATIONAL_EVENT_INVALID_EVENT_ID"),
    sessionId: normalizeIdentifier(sessionId, "PRIVATE_BETA_OPERATIONAL_EVENT_INVALID_SESSION_ID"),
    timestamp: resolveNow(now),
    eventType: assertAllowed(eventType, EVENT_TYPES, "PRIVATE_BETA_OPERATIONAL_EVENT_INVALID_TYPE"),
    boundary: assertAllowed(boundary, BOUNDARIES, "PRIVATE_BETA_OPERATIONAL_EVENT_INVALID_BOUNDARY"),
    outcome: assertAllowed(outcome, OUTCOMES, "PRIVATE_BETA_OPERATIONAL_EVENT_INVALID_OUTCOME"),
    errorCode
  });
}

export async function emitPrivateBetaOperationalEvent(event, sink) {
  if (typeof sink !== "function") return false;
  try {
    await sink(event);
    return true;
  } catch {
    return false;
  }
}

export function createInMemoryPrivateBetaOperationalSink() {
  const events = [];
  const sink = async (event) => {
    events.push(event);
  };
  sink.getEvents = () => Object.freeze([...events]);
  return sink;
}

export async function recordPrivateBetaInterruption({ eventId, sessionId, boundary = "runtime_session", now, sink } = {}) {
  const event = buildPrivateBetaOperationalEvent({
    eventId,
    sessionId,
    eventType: "session_interrupted",
    boundary,
    outcome: "interrupted",
    now
  });
  await emitPrivateBetaOperationalEvent(event, sink);
  return event;
}

export const PRIVATE_BETA_OPERATIONAL_EVENT_VERSION = OPERATIONAL_EVENT_VERSION;
export const PRIVATE_BETA_OPERATIONAL_EVENT_TYPES = EVENT_TYPES;
export const PRIVATE_BETA_OPERATIONAL_BOUNDARIES = BOUNDARIES;
export const PRIVATE_BETA_OPERATIONAL_FORBIDDEN_FIELDS = FORBIDDEN_FIELDS;

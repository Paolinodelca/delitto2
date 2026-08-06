const FEEDBACK_FORMAT_VERSION = "private-beta-feedback-1.0";
const MODEL_VERSION = "1.0";
const COMMENT_MAX_LENGTH = 500;

const ALLOWED = Object.freeze({
  clarity: Object.freeze(["unclear", "partly_clear", "clear"]),
  usefulness: Object.freeze(["not_useful", "partly_useful", "useful"]),
  reportCredibility: Object.freeze(["not_credible", "partly_credible", "credible"]),
  mostValuablePart: Object.freeze([
    "professional_impression",
    "evidence_and_explanations",
    "final_actions",
    "interview_experience",
    "other"
  ]),
  difficulty: Object.freeze(["none", "minor", "significant"]),
  reuse: Object.freeze(["no", "maybe", "yes"]),
  recommend: Object.freeze(["no", "maybe", "yes"])
});

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

function resolveNow(now) {
  const value = now ?? new Date().toISOString();
  if (!validIso(value)) throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_TIMESTAMP");
  return value;
}

function normalizeSessionRef(value) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 120) {
    throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_SESSION_REF");
  }
  return value.trim();
}

function assertFeedbackState(state) {
  if (!isObject(state) || state.version !== MODEL_VERSION || state.type !== "private_beta_feedback") {
    throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_STATE");
  }
  if (!["not_started", "submitted", "skipped"].includes(state.status)) {
    throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_STATE");
  }
  if (state.formatVersion !== FEEDBACK_FORMAT_VERSION || !validIso(state.createdAt)) {
    throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_STATE");
  }
  if (typeof state.sessionRef !== "string" || !state.sessionRef) {
    throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_STATE");
  }
  return state;
}

function assertAllowed(field, value) {
  if (!ALLOWED[field].includes(value)) {
    throw new Error(`PRIVATE_BETA_FEEDBACK_INVALID_${field.toUpperCase()}`);
  }
  return value;
}

function normalizeComment(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_COMMENT");
  const comment = value.trim();
  if (!comment) return null;
  if (comment.length > COMMENT_MAX_LENGTH) throw new Error("PRIVATE_BETA_FEEDBACK_COMMENT_TOO_LONG");
  return comment;
}

export function createPrivateBetaFeedback(sessionRef, { now, formatVersion = FEEDBACK_FORMAT_VERSION } = {}) {
  if (formatVersion !== FEEDBACK_FORMAT_VERSION) {
    throw new Error("PRIVATE_BETA_FEEDBACK_UNSUPPORTED_FORMAT_VERSION");
  }

  return freeze({
    version: MODEL_VERSION,
    type: "private_beta_feedback",
    status: "not_started",
    formatVersion,
    sessionRef: normalizeSessionRef(sessionRef),
    createdAt: resolveNow(now),
    submittedAt: null,
    skippedAt: null,
    responses: null,
    comment: null,
    notice: {
      classification: "PRIVATE_BETA_FEEDBACK",
      title: "Aiutaci a migliorare la Private Beta",
      summary: "Il feedback è facoltativo, richiede pochi passaggi e non modifica la tua Professional Identity."
    }
  });
}

export function submitPrivateBetaFeedback(state, responses, { comment, now } = {}) {
  assertFeedbackState(state);
  if (state.status !== "not_started") throw new Error("PRIVATE_BETA_FEEDBACK_SUBMISSION_NOT_ALLOWED");
  if (!isObject(responses)) throw new Error("PRIVATE_BETA_FEEDBACK_INVALID_RESPONSES");

  const normalized = {
    experience: {
      clarity: assertAllowed("clarity", responses.experience?.clarity),
      usefulness: assertAllowed("usefulness", responses.experience?.usefulness),
      reportCredibility: assertAllowed("reportCredibility", responses.experience?.reportCredibility)
    },
    valueAndDifficulty: {
      mostValuablePart: assertAllowed("mostValuablePart", responses.valueAndDifficulty?.mostValuablePart),
      difficulty: assertAllowed("difficulty", responses.valueAndDifficulty?.difficulty)
    },
    futureIntent: {
      reuse: assertAllowed("reuse", responses.futureIntent?.reuse),
      recommend: assertAllowed("recommend", responses.futureIntent?.recommend)
    }
  };

  return freeze({
    ...state,
    status: "submitted",
    submittedAt: resolveNow(now),
    responses: normalized,
    comment: normalizeComment(comment)
  });
}

export function skipPrivateBetaFeedback(state, { now } = {}) {
  assertFeedbackState(state);
  if (state.status !== "not_started") throw new Error("PRIVATE_BETA_FEEDBACK_SKIP_NOT_ALLOWED");

  return freeze({
    ...state,
    status: "skipped",
    skippedAt: resolveNow(now)
  });
}

export function assertPrivateBetaFeedbackState(state) {
  assertFeedbackState(state);
  return true;
}

export const PRIVATE_BETA_FEEDBACK_FORMAT_VERSION = FEEDBACK_FORMAT_VERSION;
export const PRIVATE_BETA_FEEDBACK_COMMENT_MAX_LENGTH = COMMENT_MAX_LENGTH;
export const PRIVATE_BETA_FEEDBACK_ALLOWED_RESPONSES = ALLOWED;

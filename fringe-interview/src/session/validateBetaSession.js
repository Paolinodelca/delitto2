import { BETA_INTERVIEW_STATUSES, BETA_SESSION_SCHEMA_VERSION, BETA_SESSION_STATUSES, REFERENCE_KEYS, normalizeString } from "./shared.js";

const TOP_LEVEL_KEYS = ["schemaVersion","revision","sessionId","testerId","resumeTokenHash","status","currentStep","inputRefs","interview","resultRef","lifecycle"];
const INTERVIEW_KEYS = ["status","runtimeRef"];
const LIFECYCLE_KEYS = ["createdAt","updatedAt","interruptedAt","completedAt"];
const onlyKeys = (value, allowed) => Object.keys(value).every((key) => allowed.includes(key));
const isIso = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value)) && value === new Date(value).toISOString();
const isRef = (value) => value == null || (value && typeof value === "object" && !Array.isArray(value) && normalizeString(value.type) && normalizeString(value.id) && onlyKeys(value, REFERENCE_KEYS));
const ms = (value) => isIso(value) ? Date.parse(value) : null;

export function validateBetaSession(candidate) {
  const errors = [];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return { valid: false, errors: ["Session must be an object."] };
  if (!onlyKeys(candidate, TOP_LEVEL_KEYS)) errors.push("Session contains unsupported properties.");
  if (candidate.schemaVersion !== BETA_SESSION_SCHEMA_VERSION) errors.push(`schemaVersion must be ${BETA_SESSION_SCHEMA_VERSION}.`);
  if (!Number.isSafeInteger(candidate.revision) || candidate.revision < 1) errors.push("revision must be a positive safe integer.");
  if (!/^[A-Za-z0-9_-]+$/.test(normalizeString(candidate.sessionId))) errors.push("sessionId must be a technical identifier.");
  if (!/^[A-Za-z0-9_-]+$/.test(normalizeString(candidate.testerId))) errors.push("testerId must be a pseudonymous technical identifier.");
  if (!/^[a-f0-9]{64}$/.test(normalizeString(candidate.resumeTokenHash))) errors.push("resumeTokenHash must be a SHA-256 hex digest.");
  if (!BETA_SESSION_STATUSES.includes(candidate.status)) errors.push("status is invalid.");
  if (!normalizeString(candidate.currentStep)) errors.push("currentStep is required.");

  if (!Array.isArray(candidate.inputRefs) || !candidate.inputRefs.every((ref) => ref !== null && isRef(ref))) errors.push("inputRefs must contain valid non-null references.");
  else if (new Set(candidate.inputRefs.map((ref) => `${ref.type}:${ref.id}`)).size !== candidate.inputRefs.length) errors.push("inputRefs must not contain duplicates.");

  if (!candidate.interview || typeof candidate.interview !== "object" || Array.isArray(candidate.interview)) errors.push("interview is required.");
  else {
    if (!onlyKeys(candidate.interview, INTERVIEW_KEYS)) errors.push("interview contains unsupported properties.");
    if (!BETA_INTERVIEW_STATUSES.includes(candidate.interview.status)) errors.push("interview.status is invalid.");
    if (!isRef(candidate.interview.runtimeRef)) errors.push("interview.runtimeRef is invalid.");
  }
  if (!isRef(candidate.resultRef)) errors.push("resultRef is invalid.");

  const lifecycle = candidate.lifecycle;
  if (!lifecycle || typeof lifecycle !== "object" || Array.isArray(lifecycle)) errors.push("lifecycle is required.");
  else {
    if (!onlyKeys(lifecycle, LIFECYCLE_KEYS)) errors.push("lifecycle contains unsupported properties.");
    if (!isIso(lifecycle.createdAt)) errors.push("lifecycle.createdAt is invalid.");
    if (!isIso(lifecycle.updatedAt)) errors.push("lifecycle.updatedAt is invalid.");
    if (lifecycle.interruptedAt != null && !isIso(lifecycle.interruptedAt)) errors.push("lifecycle.interruptedAt is invalid.");
    if (lifecycle.completedAt != null && !isIso(lifecycle.completedAt)) errors.push("lifecycle.completedAt is invalid.");
    const c=ms(lifecycle.createdAt), u=ms(lifecycle.updatedAt), i=lifecycle.interruptedAt==null?null:ms(lifecycle.interruptedAt), d=lifecycle.completedAt==null?null:ms(lifecycle.completedAt);
    if (c!=null && u!=null && u<c) errors.push("lifecycle.updatedAt cannot precede createdAt.");
    if (c!=null && i!=null && i<c) errors.push("lifecycle.interruptedAt cannot precede createdAt.");
    if (c!=null && d!=null && d<c) errors.push("lifecycle.completedAt cannot precede createdAt.");
    if (u!=null && i!=null && i>u) errors.push("lifecycle.interruptedAt cannot follow updatedAt.");
    if (u!=null && d!=null && d>u) errors.push("lifecycle.completedAt cannot follow updatedAt.");
  }

  const combos = { created:["not_started"], in_progress:["in_progress"], interrupted:["not_started","in_progress"], completed:["completed"] };
  if (combos[candidate.status] && candidate.interview?.status && !combos[candidate.status].includes(candidate.interview.status)) errors.push(`status ${candidate.status} is incompatible with interview.status ${candidate.interview.status}.`);
  if (candidate.interview?.status === "not_started" && candidate.interview.runtimeRef != null) errors.push("interview.runtimeRef requires an interview that has started.");
  if (candidate.status === "created" && candidate.resultRef != null) errors.push("Created sessions cannot have resultRef.");
  if (candidate.status === "interrupted" && candidate.lifecycle?.interruptedAt == null) errors.push("Interrupted sessions require interruptedAt.");
  if (candidate.status !== "interrupted" && candidate.lifecycle?.interruptedAt != null) errors.push("Only interrupted sessions may have interruptedAt.");
  if (candidate.status !== "completed" && candidate.lifecycle?.completedAt != null) errors.push("Only completed sessions may have completedAt.");
  if (candidate.status === "completed") {
    if (!candidate.resultRef) errors.push("Completed sessions require resultRef.");
    if (!candidate.lifecycle?.completedAt) errors.push("Completed sessions require completedAt.");
  }
  return { valid: errors.length === 0, errors };
}
export default validateBetaSession;

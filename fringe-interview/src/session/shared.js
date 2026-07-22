import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";

export const BETA_SESSION_SCHEMA_VERSION = "1.1";
export const BETA_SESSION_INITIAL_REVISION = 1;
export const BETA_SESSION_STATUSES = Object.freeze(["created", "in_progress", "interrupted", "completed"]);
export const BETA_INTERVIEW_STATUSES = Object.freeze(["not_started", "in_progress", "completed"]);
export const REFERENCE_KEYS = Object.freeze(["type", "id"]);

export function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
export function normalizeString(value) { return typeof value === "string" ? value.trim() : ""; }
export function buildTechnicalId(prefix, idFactory = randomUUID) {
  const value = normalizeString(idFactory());
  if (!value) throw new Error(`Unable to create ${prefix} identifier.`);
  return `${prefix}_${value}`;
}
export function createResumeToken(tokenFactory = () => randomBytes(32).toString("base64url")) {
  const token = normalizeString(tokenFactory());
  if (token.length < 32) throw new Error("Resume token must contain at least 32 characters.");
  return token;
}
export function hashResumeToken(token) {
  const normalized = normalizeString(token);
  if (!normalized) throw new Error("Resume token is required.");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}
export function resumeTokenMatches(token, expectedHash) {
  let actual;
  try { actual = Buffer.from(hashResumeToken(token), "hex"); } catch { return false; }
  const normalizedHash = normalizeString(expectedHash);
  if (!/^[a-f0-9]{64}$/.test(normalizedHash)) return false;
  const expected = Buffer.from(normalizedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function normalizeTimestamp(value) {
  const raw = value instanceof Date ? value.toISOString() : normalizeString(value);
  if (!raw || Number.isNaN(Date.parse(raw))) throw new Error("A valid ISO timestamp is required.");
  return new Date(raw).toISOString();
}
export function normalizeUpdateTimestamp(value, session) {
  const timestamp = normalizeTimestamp(value);
  if (Date.parse(timestamp) < Date.parse(session.lifecycle.updatedAt)) {
    throw new Error("Domain update timestamp cannot precede the current updatedAt.");
  }
  return timestamp;
}
export function normalizeReference(value, label) {
  if (value == null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  const type = normalizeString(value.type);
  const id = normalizeString(value.id);
  if (!type || !id || Object.keys(value).some((key) => !REFERENCE_KEYS.includes(key))) {
    throw new Error(`${label} must contain only non-empty type and id fields.`);
  }
  return { type, id };
}
export function normalizeReferences(values, label = "Reference") {
  if (!Array.isArray(values)) throw new Error(`${label} list must be an array.`);
  const byKey = new Map();
  values.forEach((value) => {
    const ref = normalizeReference(value, label);
    byKey.set(`${ref.type}:${ref.id}`, ref);
  });
  return [...byKey.values()].sort((a, b) => `${a.type}:${a.id}`.localeCompare(`${b.type}:${b.id}`));
}
export function nextRevision(session) { return session.revision + 1; }

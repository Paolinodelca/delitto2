const crypto = require("crypto");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

function canonicalSort(items) {
  return [...items].sort((left, right) =>
    left.metadata.createdAt.localeCompare(right.metadata.createdAt) || left.id.localeCompare(right.id));
}

function ledgerId(contributions) {
  const content = canonicalSort(contributions).map((contribution) => clone(contribution));
  const digest = crypto.createHash("sha256").update(canonical({
    schema: "knowledge-ledger-content-identity-v2",
    contributions: content,
  })).digest("hex");
  return `knowledgeLedger_${digest.slice(0, 32)}`;
}

function collectIntegrityErrors(value, path, errors, ancestors = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) errors.push(`${path} must contain only finite numbers.`);
    return;
  }
  if (typeof value !== "object") {
    errors.push(`${path} contains a non-canonical value.`);
    return;
  }
  if (ancestors.has(value)) {
    errors.push(`${path} must not contain cyclic references.`);
    return;
  }
  const enumerable = new Set(Object.keys(value));
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === "length") continue;
    if (typeof key === "symbol" || !enumerable.has(key)) errors.push(`${path} contains a hidden property.`);
  }
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    errors.push(`${path} must contain only plain objects.`);
    return;
  }
  ancestors.add(value);
  if (Array.isArray(value)) value.forEach((item, index) => collectIntegrityErrors(item, `${path}[${index}]`, errors, ancestors));
  else Object.entries(value).forEach(([key, item]) => collectIntegrityErrors(item, `${path}.${key}`, errors, ancestors));
  ancestors.delete(value);
}

function canonicalProvenanceErrors(contribution, path) {
  const errors = [];
  if (!contribution || !contribution.provenance || !Array.isArray(contribution.provenance.sourceRefs)) return errors;
  const refs = contribution.provenance.sourceRefs;
  if (!refs.every((ref) => typeof ref === "string")) return errors;
  const canonicalRefs = [...refs].sort((left, right) => left.localeCompare(right));
  if (refs.some((ref, index) => ref !== canonicalRefs[index])) errors.push(`${path}.provenance.sourceRefs must use canonical lexical ordering.`);
  return errors;
}

module.exports = { canonicalSort, clone, collectIntegrityErrors, canonicalProvenanceErrors, deepFreeze, ledgerId };

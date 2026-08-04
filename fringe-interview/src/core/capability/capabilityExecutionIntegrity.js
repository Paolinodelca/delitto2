const crypto = require("crypto");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function semanticDerivedResult(result) {
  const semantic = clone(result);
  delete semantic.derivedAt;
  return semantic;
}

function capabilityExecutionResultId(content) {
  const digest = crypto.createHash("sha256").update(canonical({
    schema: "capability-execution-result-content-identity-v2",
    capabilityId: content.capabilityId,
    recipeRef: content.recipeRef,
    recipeVersion: content.recipeVersion,
    snapshotRef: content.snapshotRef,
    derivedResults: content.derivedResults.map(semanticDerivedResult),
    summary: content.summary,
    dependencyRefs: content.dependencyRefs,
    provenance: content.provenance,
    metadata: content.metadata,
    extensions: content.extensions,
  })).digest("hex");
  return `capabilityExecutionResult_${digest.slice(0, 32)}`;
}

module.exports = { clone, deepFreeze, capabilityExecutionResultId };

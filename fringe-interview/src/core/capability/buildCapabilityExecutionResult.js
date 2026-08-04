const { clone, deepFreeze, capabilityExecutionResultId } = require("./capabilityExecutionIntegrity");

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function string(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }

function buildCapabilityExecutionResult(input = {}, options = {}) {
  const derivedResults = (Array.isArray(input.derivedResults) ? input.derivedResults : [])
    .map(clone)
    .sort((left, right) => left.id.localeCompare(right.id));
  const dependencyRefs = [...new Set((Array.isArray(input.dependencyRefs) ? input.dependencyRefs : []).map(string).filter(Boolean))].sort();
  const summary = {
    ruleCount: input.ruleCount || 0,
    matchedRuleCount: derivedResults.length,
    resultCount: derivedResults.length,
    dependencyCount: dependencyRefs.length,
  };
  const executedAt = string(options.now) || string(input.executedAt) || new Date().toISOString();
  const content = {
    capabilityId: string(input.capabilityId),
    recipeRef: string(input.recipeRef),
    recipeVersion: string(input.recipeVersion),
    snapshotRef: string(input.snapshotRef),
    derivedResults,
    summary,
    dependencyRefs,
    provenance: { type: "capability_recipe_execution", evaluatorVersion: "1.0" },
    metadata: { contractVersion: "1.0" },
    extensions: isObject(input.extensions) ? clone(input.extensions) : {},
  };
  return deepFreeze({ id: capabilityExecutionResultId(content), ...content, executedAt });
}

module.exports = { buildCapabilityExecutionResult };

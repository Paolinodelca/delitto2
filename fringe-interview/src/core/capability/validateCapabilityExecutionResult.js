const { validateDerivedKnowledgeResult } = require("../dimension/validateDerivedKnowledgeResult");
const { capabilityExecutionResultId } = require("./capabilityExecutionIntegrity");

const TOP = ["id", "capabilityId", "recipeRef", "recipeVersion", "snapshotRef", "derivedResults", "summary", "dependencyRefs", "provenance", "executedAt", "metadata", "extensions"];
function object(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function string(value) { return typeof value === "string" && value.trim().length > 0; }
function iso(value) { return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value; }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }

function validateCapabilityExecutionResult(result = {}, context = {}) {
  const errors = [], warnings = [];
  if (!object(result)) return { valid: false, errors: ["CapabilityExecutionResult must be an object."], warnings };
  Object.keys(result).filter(key => !TOP.includes(key)).forEach(key => errors.push(`capabilityExecutionResult.${key} is not allowed.`));
  if (!string(result.id) || !string(result.capabilityId)) errors.push("id and capabilityId are required.");
  if (!string(result.recipeRef) || !result.recipeRef.startsWith("capabilityRecipe:")) errors.push("recipeRef is invalid.");
  if (!string(result.recipeVersion)) errors.push("recipeVersion is required.");
  if (!string(result.snapshotRef) || !result.snapshotRef.startsWith("knowledgeSnapshot:")) errors.push("snapshotRef is invalid.");

  const derivedResults = Array.isArray(result.derivedResults) ? result.derivedResults : [];
  if (!Array.isArray(result.derivedResults)) errors.push("derivedResults must be an array.");
  else {
    const seen = new Set();
    derivedResults.forEach((item, index) => {
      const validation = validateDerivedKnowledgeResult(item);
      if (!validation.valid) errors.push(`derivedResults[${index}] is invalid: ${validation.errors.join(" | ")}`);
      if (seen.has(item.id)) errors.push("derivedResults must be unique.");
      seen.add(item.id);
      if (item.snapshotRef !== result.snapshotRef) errors.push(`derivedResults[${index}].snapshotRef is inconsistent.`);
    });
    if (!same(derivedResults.map(item => item.id), [...derivedResults].sort((a, b) => a.id.localeCompare(b.id)).map(item => item.id))) errors.push("derivedResults must be canonically ordered.");
  }

  const dependencyRefs = Array.isArray(result.dependencyRefs) ? result.dependencyRefs : [];
  if (!Array.isArray(result.dependencyRefs) || new Set(dependencyRefs).size !== dependencyRefs.length || !same(dependencyRefs, [...dependencyRefs].sort()) || dependencyRefs.some(ref => !string(ref))) errors.push("dependencyRefs are invalid.");
  if (!object(result.summary) || !Number.isInteger(result.summary.ruleCount) || result.summary.ruleCount < 0 || result.summary.matchedRuleCount !== derivedResults.length || result.summary.resultCount !== derivedResults.length || result.summary.dependencyCount !== dependencyRefs.length || Object.keys(result.summary).some(key => !["ruleCount", "matchedRuleCount", "resultCount", "dependencyCount"].includes(key))) errors.push("summary is inconsistent.");
  if (!object(result.provenance) || result.provenance.type !== "capability_recipe_execution" || result.provenance.evaluatorVersion !== "1.0" || Object.keys(result.provenance).some(key => !["type", "evaluatorVersion"].includes(key))) errors.push("provenance is invalid.");
  if (!iso(result.executedAt)) errors.push("executedAt is invalid.");
  if (!object(result.metadata) || result.metadata.contractVersion !== "1.0" || Object.keys(result.metadata).some(key => key !== "contractVersion")) errors.push("metadata is invalid.");
  if (!object(result.extensions)) errors.push("extensions must be an object.");

  if (object(context.snapshot) && result.snapshotRef !== `knowledgeSnapshot:${context.snapshot.id}`) errors.push("snapshot context is inconsistent.");
  if (object(context.recipe)) {
    if (result.capabilityId !== context.recipe.capabilityId || result.recipeRef !== `capabilityRecipe:${context.recipe.id}` || result.recipeVersion !== context.recipe.version) errors.push("recipe context is inconsistent.");
    if (object(result.summary) && result.summary.ruleCount !== context.recipe.rules.length) errors.push("summary.ruleCount is inconsistent with Recipe context.");
    const expectedRefs = [result.snapshotRef, result.recipeRef, ...context.recipe.rules.map(rule => `derivedKnowledgeRule:${rule.id}`), ...derivedResults.map(item => `derivedKnowledgeResult:${item.id}`), ...derivedResults.flatMap(item => item.dependencyRefs || [])].filter((ref, index, refs) => refs.indexOf(ref) === index).sort();
    if (!same(dependencyRefs, expectedRefs)) errors.push("dependencyRefs are inconsistent with Recipe context.");
  }

  if (errors.length === 0 && result.id !== capabilityExecutionResultId(result)) errors.push("id does not match canonical execution content.");
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateCapabilityExecutionResult };

const { validateKnowledgeSnapshot } = require("../dimension/validateKnowledgeSnapshot");
const { evaluateDerivedKnowledgeRules } = require("../dimension/evaluateDerivedKnowledgeRules");
const { validateCapabilityRecipe } = require("./validateCapabilityRecipe");
const { buildCapabilityExecutionResult } = require("./buildCapabilityExecutionResult");
const { validateCapabilityExecutionResult } = require("./validateCapabilityExecutionResult");

function object(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function iso(value) { return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value; }
function fail(code, message, details) { const error = new Error(message); error.code = code; if (details !== undefined) error.details = details; throw error; }

function executeCapabilityRecipe(snapshot, recipe, options = {}) {
  if (!object(options) || Object.keys(options).some(key => key !== "now")) fail("INVALID_CAPABILITY_RECIPE_EXECUTION_OPTIONS", "options must contain only now.");
  const snapshotValidation = validateKnowledgeSnapshot(snapshot);
  if (!snapshotValidation.valid) fail("INVALID_KNOWLEDGE_SNAPSHOT", snapshotValidation.errors.join(" | "), snapshotValidation);
  const recipeValidation = validateCapabilityRecipe(recipe);
  if (!recipeValidation.valid) fail("INVALID_CAPABILITY_RECIPE", recipeValidation.errors.join(" | "), recipeValidation);
  const now = options.now || snapshot.metadata.createdAt;
  if (!iso(now)) fail("INVALID_CAPABILITY_RECIPE_EXECUTION_OPTIONS", "options.now must be a valid ISO timestamp.");

  const derivedResults = evaluateDerivedKnowledgeRules(snapshot, recipe.rules, { now });
  const dependencyRefs = [
    `knowledgeSnapshot:${snapshot.id}`,
    `capabilityRecipe:${recipe.id}`,
    ...recipe.rules.map(rule => `derivedKnowledgeRule:${rule.id}`),
    ...derivedResults.map(result => `derivedKnowledgeResult:${result.id}`),
    ...derivedResults.flatMap(result => result.dependencyRefs),
  ].filter((ref, index, refs) => refs.indexOf(ref) === index).sort();
  const result = buildCapabilityExecutionResult({
    capabilityId: recipe.capabilityId,
    recipeRef: `capabilityRecipe:${recipe.id}`,
    recipeVersion: recipe.version,
    snapshotRef: `knowledgeSnapshot:${snapshot.id}`,
    derivedResults,
    dependencyRefs,
    ruleCount: recipe.rules.length,
    extensions: {},
  }, { now });
  const validation = validateCapabilityExecutionResult(result, { snapshot, recipe });
  if (!validation.valid) fail("INVALID_GENERATED_CAPABILITY_EXECUTION_RESULT", validation.errors.join(" | "), validation);
  return result;
}

module.exports = { executeCapabilityRecipe };

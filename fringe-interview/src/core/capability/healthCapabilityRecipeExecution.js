const cap = require("./index");
const dim = require("../dimension");

function healthCapabilityRecipeExecution() {
  try {
    const now = "2026-07-23T12:00:00.000Z";
    const contribution = dim.buildDimensionContribution({ id: "health-cap-recipe-c", measurementId: "health-cap-recipe-m", dimensionId: "health_dimension", contributionType: "supporting", contributionValue: .8, confidence: .8, provenance: { measurementResultRef: "measurementResult:health", sourceRefs: ["mapping:health"] }, metadata: { version: "1.0", createdAt: now, updatedAt: now }, extensions: {} }, { now });
    const ledger = dim.appendDimensionContributions(dim.buildKnowledgeLedger({ metadata: { createdAt: now, updatedAt: now } }, { now }), [contribution], { now });
    const snapshot = dim.buildKnowledgeSnapshot(ledger, { now });
    const rule = dim.buildDerivedKnowledgeRule({ target: { knowledgeType: "derived_signal", knowledgeId: "health" }, conditions: [{ dimensionId: "health_dimension", field: "estimate", operator: "gte", value: .8, minimumConfidence: .5, minimumCoverage: .5, extensions: {} }], conditionStrategy: "all", confidenceStrategy: "minimum", output: { valueType: "boolean", value: true }, metadata: { createdAt: now, updatedAt: now }, extensions: {} }, { now });
    const recipe = cap.buildCapabilityRecipe({ capabilityId: "health_capability", version: "1.0.0", rules: [rule], extensions: {} }, { now });
    const result = cap.executeCapabilityRecipe(snapshot, recipe, { now });
    return { ok: cap.validateCapabilityExecutionResult(result, { snapshot, recipe }).valid && result.derivedResults.length === 1 && Object.isFrozen(result) && Object.isFrozen(result.derivedResults[0]) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

module.exports = { healthCapabilityRecipeExecution };

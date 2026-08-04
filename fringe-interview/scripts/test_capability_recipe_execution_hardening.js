"use strict";
const assert = require("assert");
const cap = require("../src/core/capability");
const dim = require("../src/core/dimension");

const firstNow = "2026-07-23T12:00:00.000Z";
const secondNow = "2026-07-24T12:00:00.000Z";
const contribution = dim.buildDimensionContribution({ id: "e42-c", measurementId: "e42-m", dimensionId: "e42-source", contributionType: "supporting", contributionValue: .9, confidence: .8, provenance: { measurementResultRef: "measurementResult:e42", sourceRefs: ["mapping:e42"] }, metadata: { version: "1.0", createdAt: firstNow, updatedAt: firstNow }, extensions: {} }, { now: firstNow });
const ledger = dim.appendDimensionContributions(dim.buildKnowledgeLedger({ metadata: { createdAt: firstNow, updatedAt: firstNow } }, { now: firstNow }), [contribution], { now: firstNow });
const snapshot = dim.buildKnowledgeSnapshot(ledger, { now: firstNow });
const rule = dim.buildDerivedKnowledgeRule({ target: { knowledgeType: "derived_signal", knowledgeId: "e42-result" }, conditions: [{ dimensionId: "e42-source", field: "estimate", operator: "gte", value: .8, minimumConfidence: .5, minimumCoverage: .5, extensions: {} }], conditionStrategy: "all", confidenceStrategy: "minimum", output: { valueType: "boolean", value: true }, metadata: { createdAt: firstNow, updatedAt: firstNow }, extensions: {} }, { now: firstNow });
const recipe = cap.buildCapabilityRecipe({ capabilityId: "cap:e42", version: "1.0.0", rules: [rule], extensions: {} }, { now: firstNow });
const before = JSON.stringify({ snapshot, recipe });
const first = cap.executeCapabilityRecipe(snapshot, recipe, { now: firstNow });
const second = cap.executeCapabilityRecipe(snapshot, recipe, { now: secondNow });

assert.strictEqual(first.id, second.id, "execution identity must not depend on timestamps");
assert.notStrictEqual(first.executedAt, second.executedAt);
assert(cap.validateCapabilityExecutionResult(first, { snapshot, recipe }).valid);
assert.strictEqual(first.summary.ruleCount, 1);
assert.strictEqual(first.derivedResults.length, 1);
assert(Object.isFrozen(first) && Object.isFrozen(first.summary) && Object.isFrozen(first.derivedResults) && Object.isFrozen(first.derivedResults[0]) && Object.isFrozen(first.derivedResults[0].target));
assert.throws(() => { first.summary.ruleCount = 2; }, TypeError);
assert.strictEqual(JSON.stringify({ snapshot, recipe }), before);

const tamperedResult = { ...first.derivedResults[0], confidence: .1 };
assert(!cap.validateCapabilityExecutionResult({ ...first, derivedResults: [tamperedResult] }).valid);
assert(!cap.validateCapabilityExecutionResult({ ...first, summary: { ...first.summary, ruleCount: 2 } }).valid);
assert(!cap.validateCapabilityExecutionResult({ ...first, snapshotRef: "knowledgeSnapshot:other" }).valid);
assert.throws(() => cap.executeCapabilityRecipe(snapshot, recipe, { now: "not-iso" }), error => error.code === "INVALID_CAPABILITY_RECIPE_EXECUTION_OPTIONS");
assert.throws(() => cap.executeCapabilityRecipe(snapshot, recipe, { now: firstNow, extra: true }), error => error.code === "INVALID_CAPABILITY_RECIPE_EXECUTION_OPTIONS");

const emptyRecipe = cap.buildCapabilityRecipe({ capabilityId: "cap:e42-empty", version: "1.0.0", rules: [], extensions: {} }, { now: firstNow });
const empty = cap.executeCapabilityRecipe(snapshot, emptyRecipe, { now: firstNow });
assert.strictEqual(empty.derivedResults.length, 0);
assert(Object.isFrozen(empty) && Object.isFrozen(empty.derivedResults));
assert(cap.validateCapabilityExecutionResult(empty, { snapshot, recipe: emptyRecipe }).valid);

console.log("Capability Recipe Execution hardening tests PASSED");

const assert = require("assert");
const api = require("../src/core/dimension");

const at = "2026-08-04T10:00:00.000Z";
function contribution(id, overrides = {}) {
  return api.buildDimensionContribution({
    id,
    measurementId: `measurement_${id}`,
    dimensionId: "dimension_a",
    contributionType: "supporting",
    contributionValue: 0.75,
    confidence: 0.8,
    provenance: { measurementResultRef: `measurementResult:${id}`, sourceRefs: ["mapping:a", "observation:z"] },
    metadata: { version: "1.0", createdAt: at, updatedAt: at },
    extensions: { policy: { b: 2, a: 1 } },
    ...overrides,
  }, { now: at });
}

const empty = api.buildKnowledgeLedger({ metadata: { createdAt: at, updatedAt: at }, extensions: {} }, { now: at });
const first = contribution("first");
const second = contribution("second", { dimensionId: "dimension_b" });
const before = JSON.stringify({ empty, first, second });
const left = api.appendDimensionContributions(empty, [second, first], { now: at });
const right = api.appendDimensionContributions(empty, [first, second], { now: at });
assert.deepStrictEqual(left, right);
assert.strictEqual(left.id, right.id);
assert(api.validateKnowledgeLedger(left).valid);
assert(Object.isFrozen(left) && Object.isFrozen(left.contributions) && Object.isFrozen(left.contributions[0].extensions.policy));
assert.notStrictEqual(left.contributions[0], first);
assert.strictEqual(JSON.stringify({ empty, first, second }), before);

const changedContent = contribution("first", { contributionValue: 0.5 });
const changedLedger = api.buildKnowledgeLedger({ contributions: [changedContent, second], metadata: { createdAt: at, updatedAt: at } }, { now: at });
assert.notStrictEqual(changedLedger.id, left.id, "Ledger identity must commit to Contribution content, not IDs alone");
assert(!api.validateKnowledgeLedger({ ...left, contributions: [changedContent, second] }).valid, "stale identity must be rejected");

assert.throws(() => api.appendDimensionContributions(empty, [first, first], { now: at }), error => error.code === "DUPLICATE_LEDGER_CONTRIBUTION");
assert.throws(() => api.appendDimensionContributions(left, [second], { now: at }), error => error.code === "DUPLICATE_LEDGER_CONTRIBUTION");
assert.throws(() => api.appendDimensionContributions(empty, [first, { ...second, confidence: 2 }], { now: at }), error => error.code === "INVALID_DIMENSION_CONTRIBUTION");
assert.strictEqual(JSON.stringify({ empty, first, second }), before, "failed intake must be atomic");

const nonCanonicalRefs = contribution("refs", { provenance: { measurementResultRef: "measurementResult:refs", sourceRefs: ["observation:z", "mapping:a"] } });
assert.throws(() => api.appendDimensionContributions(empty, [nonCanonicalRefs], { now: at }), error => error.code === "INVALID_DIMENSION_CONTRIBUTION");
const hidden = contribution("hidden");
Object.defineProperty(hidden.extensions, "secret", { value: true, enumerable: false });
assert.throws(() => api.appendDimensionContributions(empty, [hidden], { now: at }), error => error.code === "INVALID_DIMENSION_CONTRIBUTION");
const cyclicLedger = { ...empty, extensions: {} };
cyclicLedger.extensions.self = cyclicLedger.extensions;
assert.doesNotThrow(() => api.validateKnowledgeLedger(cyclicLedger));
assert(!api.validateKnowledgeLedger(cyclicLedger).valid);
assert.doesNotThrow(() => api.validateKnowledgeLedger({ ...empty, contributions: [{ id: "bad" }] }));
assert(!api.validateKnowledgeLedger({ ...empty, contributions: [{ id: "bad" }] }).valid);

const emptyResult = api.appendDimensionContributions(empty, [], { now: at });
assert.notStrictEqual(emptyResult, empty);
assert.deepStrictEqual(emptyResult, empty);
assert.strictEqual(emptyResult.id, empty.id);
assert(Object.isFrozen(emptyResult));

console.log("Dimension Contribution Ledger Intake hardening tests PASSED");

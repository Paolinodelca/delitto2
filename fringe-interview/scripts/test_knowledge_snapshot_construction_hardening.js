const assert = require("assert");
const api = require("../src/core/dimension");

const firstAt = "2026-08-04T10:00:00.000Z";
const secondAt = "2026-08-04T11:00:00.000Z";
function contribution(id, dimensionId, type = "supporting") {
  return api.buildDimensionContribution({
    id, measurementId: `measurement_${id}`, dimensionId, contributionType: type,
    contributionValue: 0.75, confidence: 0.8,
    provenance: { measurementResultRef: `measurementResult:${id}`, sourceRefs: ["mapping:a"] },
    metadata: { version: "1.0", createdAt: firstAt, updatedAt: firstAt }, extensions: {},
  }, { now: firstAt });
}

const empty = api.buildKnowledgeLedger({ metadata: { createdAt: firstAt, updatedAt: firstAt } }, { now: firstAt });
const contributions = [contribution("z", "dimension_b"), contribution("a", "dimension_a"), contribution("b", "dimension_a", "contradicting")];
const ledger = api.appendDimensionContributions(empty, contributions, { now: firstAt });
const before = JSON.stringify(ledger);
const first = api.buildKnowledgeSnapshot(ledger, { now: firstAt, extensions: { policy: { b: 2, a: 1 } } });
const second = api.buildKnowledgeSnapshot(ledger, { now: secondAt, extensions: { policy: { b: 2, a: 1 } } });

assert.strictEqual(first.id, second.id, "timestamps must not alter semantic Snapshot identity");
assert.notDeepStrictEqual(first, second);
assert.deepStrictEqual(first.dimensionStates.map(state => state.dimensionId), ["dimension_a", "dimension_b"]);
assert.deepStrictEqual(first.dimensionStates[0].extensions.aggregation.contributionRefs, ["dimensionContribution:a", "dimensionContribution:b"]);
assert.deepStrictEqual(first.dimensionStates[0].supportingMeasurementResultRefs, ["measurementResult:a", "measurementResult:b"]);
assert.strictEqual(first.statistics.contributionCount, ledger.contributions.length);
assert(api.validateKnowledgeSnapshot(first).valid);
assert(Object.isFrozen(first) && Object.isFrozen(first.dimensionStates) && Object.isFrozen(first.dimensionStates[0].extensions.aggregation.contributionRefs));
assert.strictEqual(JSON.stringify(ledger), before);

const stale = { ...first, dimensionStates: first.dimensionStates.map(state => ({ ...state })) };
stale.dimensionStates[0].estimate = 0.25;
assert(!api.validateKnowledgeSnapshot(stale).valid, "identity must commit to complete semantic state content");
const cyclic = { ...first, extensions: {} }; cyclic.extensions.self = cyclic.extensions;
assert.doesNotThrow(() => api.validateKnowledgeSnapshot(cyclic));
assert(!api.validateKnowledgeSnapshot(cyclic).valid);
const cyclicState = { ...first, dimensionStates: [{ ...first.dimensionStates[0], extensions: {} }] };
cyclicState.dimensionStates[0].extensions.self = cyclicState.dimensionStates[0].extensions;
assert.doesNotThrow(() => api.validateKnowledgeSnapshot(cyclicState));
assert(!api.validateKnowledgeSnapshot(cyclicState).valid);
assert.throws(() => api.buildKnowledgeSnapshot(ledger, { now: "invalid" }), error => error.code === "INVALID_KNOWLEDGE_SNAPSHOT_OPTIONS");

const emptySnapshot = api.buildKnowledgeSnapshot(empty, { now: firstAt });
assert.deepStrictEqual(emptySnapshot.dimensionStates, []);
assert(Object.isFrozen(emptySnapshot) && api.validateKnowledgeSnapshot(emptySnapshot).valid);
assert(Object.isFrozen(api.aggregateDimensionContributions("dimension_empty", [], { now: firstAt })));

console.log("Knowledge Snapshot Construction hardening tests PASSED");

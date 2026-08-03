const assert = require('assert');
const api = require('../src/app/knowledge');
const fixture = require('./registered_evidence_selection_fixture');

const { populatedStore } = fixture.buildFixture();
const ids = populatedStore.evidence.map(item => item.id);
const beforeStore = JSON.stringify(populatedStore);
const refs = [ids[1], ids[0]];
const beforeRefs = JSON.stringify(refs);
const selected = api.selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: populatedStore, evidenceIds: refs });
const permuted = api.selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: populatedStore, evidenceIds: [...refs].reverse() });
const partial = api.selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: populatedStore, evidenceIds: [ids[1]] });
const empty = api.selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: populatedStore, evidenceIds: [] });

assert.deepStrictEqual(selected, permuted);
assert.deepStrictEqual(selected.map(item => item.id), [...ids].sort((a, b) => a.localeCompare(b)));
assert.strictEqual(partial.length, 1);
assert.strictEqual(partial[0].id, ids[1]);
assert.strictEqual(empty.length, 0);
assert(Object.isFrozen(empty));
assert.strictEqual(JSON.stringify(populatedStore), beforeStore);
assert.strictEqual(JSON.stringify(refs), beforeRefs);
selected.forEach(item => {
  const original = populatedStore.evidence.find(candidate => candidate.id === item.id);
  assert.deepStrictEqual(item, original);
  assert.notStrictEqual(item, original);
  assert.strictEqual(item.confidence, original.confidence);
  assert.deepStrictEqual(item.extensions, original.extensions);
  assert(Object.isFrozen(item) && Object.isFrozen(item.content) && Object.isFrozen(item.metadata) && Object.isFrozen(item.extensions));
});
assert(Object.isFrozen(selected));
const mutableStore = JSON.parse(JSON.stringify(populatedStore));
const isolated = api.selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore: mutableStore, evidenceIds: [ids[0]] });
mutableStore.evidence[0].content = 'mutated after selection';
mutableStore.evidence[0].extensions.mutated = true;
assert.notStrictEqual(isolated[0].content, 'mutated after selection');
assert.strictEqual(isolated[0].extensions.mutated, undefined);
console.log('Registered Evidence Selection tests PASSED');

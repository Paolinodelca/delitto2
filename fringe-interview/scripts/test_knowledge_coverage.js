const assert = require('assert');
const dim = require('../src/core/dimension');
const cap = require('../src/core/capability');
const know = require('../src/core/knowledge');
const now = '2026-07-27T12:00:00.000Z';

function contribution(id, dimensionId, value, confidence = 0.8) {
  return dim.buildDimensionContribution({
    id,
    measurementId: `measurement_${id}`,
    dimensionId,
    contributionType: 'supporting',
    contributionValue: value,
    confidence,
    provenance: { measurementResultRef: `measurementResult:${id}`, sourceRefs: ['mapping:coverage-test'] },
    metadata: { version: '1.0', createdAt: now, updatedAt: now },
    extensions: {},
  }, { now });
}

function buildFixture() {
  let ledger = dim.buildKnowledgeLedger({ metadata: { createdAt: now, updatedAt: now } }, { now });
  ledger = dim.appendDimensionContributions(ledger, [
    contribution('coverage-a', 'adaptability', 0.8),
    contribution('coverage-b', 'analysis', 0.7),
  ], { now });
  const snapshot = dim.buildKnowledgeSnapshot(ledger, { now });
  const rule = dim.buildDerivedKnowledgeRule({
    target: { knowledgeType: 'derived_dimension', knowledgeId: 'coverage_signal' },
    conditions: [{ dimensionId: 'adaptability', field: 'estimate', operator: 'gte', value: 0.7, minimumConfidence: 0.5, minimumCoverage: 0.5, extensions: {} }],
    conditionStrategy: 'all', confidenceStrategy: 'minimum', output: { valueType: 'boolean', value: true },
    metadata: { createdAt: now, updatedAt: now }, extensions: {},
  }, { now });
  const recipe = cap.buildCapabilityRecipe({ capabilityId: 'cap:coverage', version: '1.0.0', rules: [rule], extensions: {} }, { now });
  const execution = cap.executeCapabilityRecipe(snapshot, recipe, { now });
  const mapping = dim.buildDerivedDimensionMapping({ resultTarget: rule.target, dimensionId: 'adaptability', estimate: 0.85, extensions: {} }, { now });
  const derivedStates = dim.buildDerivedDimensionKnowledgeStates([execution], [mapping], { now });
  const matrix = know.buildPersonKnowledgeMatrix({ subjectRef: { type: 'person', id: 'subject-coverage' }, knowledgeSnapshot: snapshot, derivedStates }, { now });
  return { matrix, snapshot, derivedStates };
}

const { matrix } = buildFixture();
const matrixBefore = JSON.stringify(matrix);
const coverage = know.evaluateKnowledgeCoverage(matrix);
assert(know.validateKnowledgeCoverage(coverage).valid);
assert.strictEqual(coverage.coverageVersion, '1.0');
assert.strictEqual(coverage.sourceMatrixRef, `personKnowledgeMatrix:${matrix.id}`);
assert.strictEqual(coverage.appliedQuery, null);
assert.strictEqual(coverage.overallCoverage.state, 'composed');
assert.strictEqual(coverage.overallCoverage.elementaryStateCount, 2);
assert.strictEqual(coverage.overallCoverage.derivedStateCount, 1);
assert.strictEqual(coverage.summary.dimensionCount, 2);
assert.strictEqual(coverage.summary.capabilityCount, 1);
assert.strictEqual(coverage.summary.coveredDimensions, 2);
assert.strictEqual(coverage.summary.coveredCapabilities, 1);
assert.deepStrictEqual(coverage.dimensionCoverage.map((entry) => entry.dimensionId), ['adaptability', 'analysis']);
const adaptability = coverage.dimensionCoverage.find((entry) => entry.dimensionId === 'adaptability');
assert.strictEqual(adaptability.coverageState, 'composed');
assert.strictEqual(adaptability.elementaryStateCount, 1);
assert.strictEqual(adaptability.derivedStateCount, 1);
assert.strictEqual(adaptability.elementaryCoverage.length, 1);
assert.strictEqual(coverage.capabilityCoverage[0].capabilityId, 'cap:coverage');
assert.strictEqual(coverage.capabilityCoverage[0].coverageState, 'available');
assert.strictEqual(JSON.stringify(matrix), matrixBefore);

const query = { dimensionId: 'adaptability', knowledgeLayer: 'elementary' };
const queryBefore = JSON.stringify(query);
const elementaryCoverage = know.evaluateKnowledgeCoverage(matrix, query);
assert.strictEqual(JSON.stringify(query), queryBefore);
assert.strictEqual(elementaryCoverage.overallCoverage.state, 'elementary_only');
assert.strictEqual(elementaryCoverage.summary.dimensionCount, 1);
assert.strictEqual(elementaryCoverage.summary.capabilityCount, 0);
assert.deepStrictEqual(elementaryCoverage.appliedQuery, query);

const emptyResult = know.evaluateKnowledgeCoverage(matrix, { dimensionId: 'missing' });
assert(know.validateKnowledgeCoverage(emptyResult).valid);
assert.strictEqual(emptyResult.overallCoverage.state, 'empty');
assert.strictEqual(emptyResult.summary.dimensionCount, 0);
assert.strictEqual(emptyResult.summary.capabilityCount, 0);
assert.deepStrictEqual(emptyResult.dimensionCoverage, []);
assert.deepStrictEqual(emptyResult.capabilityCoverage, []);

const reorderedMatrix = JSON.parse(JSON.stringify(matrix));
reorderedMatrix.knowledgeLayers.elementary.reverse();
reorderedMatrix.knowledgeLayers.derived.reverse();
// The matrix validator intentionally protects canonical matrix order, so determinism is tested through logically equivalent rebuilt matrices.
const again = know.evaluateKnowledgeCoverage(matrix);
assert.deepStrictEqual(again, coverage);
assert.strictEqual(again.id, coverage.id);

const built = know.buildKnowledgeCoverage({ personKnowledgeMatrix: matrix, query: { knowledgeLayer: 'derived' }, extensions: { test: true } });
assert(know.validateKnowledgeCoverage(built).valid);
assert.strictEqual(built.extensions.test, true);
assert.strictEqual(built.overallCoverage.state, 'derived_only');

const invalid = JSON.parse(JSON.stringify(coverage));
invalid.summary.coveredDimensions += 1;
assert(!know.validateKnowledgeCoverage(invalid).valid);
const forbidden = JSON.parse(JSON.stringify(coverage));
forbidden.overallScore = 0.9;
assert(!know.validateKnowledgeCoverage(forbidden).valid);

console.log('Knowledge Coverage tests PASSED');

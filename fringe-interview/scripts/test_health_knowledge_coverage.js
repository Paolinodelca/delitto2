const dim = require('../src/core/dimension');
const cap = require('../src/core/capability');
const know = require('../src/core/knowledge');
const { healthKnowledgeCoverage } = require('../src/core/knowledge/healthKnowledgeCoverage');
const now = '2026-07-27T12:30:00.000Z';

const contribution = dim.buildDimensionContribution({
  id: 'health-coverage-contribution', measurementId: 'health-coverage-measurement', dimensionId: 'health_coverage_source',
  contributionType: 'supporting', contributionValue: 0.9, confidence: 0.8,
  provenance: { measurementResultRef: 'measurementResult:health-coverage', sourceRefs: ['mapping:health-coverage'] },
  metadata: { version: '1.0', createdAt: now, updatedAt: now }, extensions: {},
}, { now });
let ledger = dim.buildKnowledgeLedger({ metadata: { createdAt: now, updatedAt: now } }, { now });
ledger = dim.appendDimensionContributions(ledger, [contribution], { now });
const snapshot = dim.buildKnowledgeSnapshot(ledger, { now });
const rule = dim.buildDerivedKnowledgeRule({
  target: { knowledgeType: 'derived_dimension', knowledgeId: 'health_coverage_target' },
  conditions: [{ dimensionId: 'health_coverage_source', field: 'estimate', operator: 'gte', value: 0.7, minimumConfidence: 0.5, minimumCoverage: 0.5, extensions: {} }],
  conditionStrategy: 'all', confidenceStrategy: 'minimum', output: { valueType: 'boolean', value: true },
  metadata: { createdAt: now, updatedAt: now }, extensions: {},
}, { now });
const recipe = cap.buildCapabilityRecipe({ capabilityId: 'cap:health-coverage', version: '1.0.0', rules: [rule], extensions: {} }, { now });
const execution = cap.executeCapabilityRecipe(snapshot, recipe, { now });
const mapping = dim.buildDerivedDimensionMapping({ resultTarget: rule.target, dimensionId: 'health_coverage_derived', estimate: 0.85, extensions: {} }, { now });
const derived = dim.buildDerivedDimensionKnowledgeStates([execution], [mapping], { now });
const matrix = know.buildPersonKnowledgeMatrix({ subjectRef: { type: 'person', id: 'health-coverage-subject' }, knowledgeSnapshot: snapshot, derivedStates: derived }, { now });
const result = healthKnowledgeCoverage(matrix);
if (!result.ok || !know.validateKnowledgeCoverage(result.coverage).valid || result.coverage.summary.dimensionCount < 2 || result.coverage.summary.capabilityCount < 1) throw new Error('Knowledge Coverage health failed.');
console.log('Knowledge Coverage health PASSED');

const assert = require('assert');
const fs = require('fs');
const K = require('../src/core/knowledge');
const expected = require('./fixtures/expected_knowledge_core_exports');
const { buildCoverage } = require('./knowledge_opportunity_fixture');

assert.deepStrictEqual(Object.keys(K).sort(), expected);
const premature = /(Plan|Action|Execution|Orchestrat|Fulfillment|Satisfaction)/i;
assert.deepStrictEqual(Object.keys(K).filter(name => /KnowledgeAcquisition/.test(name) && premature.test(name)), []);

const coverage = buildCoverage();
const opportunities = K.evaluateKnowledgeOpportunities(coverage);
const needs = K.evaluateKnowledgeAcquisitionNeeds(opportunities);
const strategies = K.evaluateKnowledgeAcquisitionStrategies(needs);
const requirements = K.evaluateKnowledgeAcquisitionRequirements(strategies);

assert.strictEqual(opportunities.opportunities.length, needs.needs.length);
assert.strictEqual(needs.needs.length, strategies.strategies.length);
assert.strictEqual(strategies.strategies.length, requirements.requirements.length);

for (const opportunity of opportunities.opportunities) {
  assert.strictEqual(opportunity.sourceCoverageRef, opportunities.sourceCoverageRef);
  const need = needs.needs.find(x => x.sourceOpportunityRef === `knowledgeOpportunity:${opportunity.id}`);
  assert(need);
  const strategy = strategies.strategies.find(x => x.sourceNeedRef === `knowledgeAcquisitionNeed:${need.id}`);
  assert(strategy);
  const requirement = requirements.requirements.find(x => x.sourceStrategyRef === `knowledgeAcquisitionStrategy:${strategy.id}`);
  assert(requirement);
  if (opportunity.opportunityType === 'derived_layer_only') {
    assert.strictEqual(need.needType, 'elementary_knowledge_required');
    assert.strictEqual(strategy.strategyType, 'elementary_knowledge_acquisition');
    assert.strictEqual(requirement.requirementType, 'elementary_knowledge_availability_required');
    assert.strictEqual(requirement.requiredKnowledgeLayer, 'elementary');
  } else {
    assert.strictEqual(need.needType, 'derived_knowledge_required');
    assert.strictEqual(strategy.strategyType, 'derived_knowledge_composition');
    assert.strictEqual(requirement.requirementType, 'derived_knowledge_availability_required');
    assert.strictEqual(requirement.requiredKnowledgeLayer, 'derived');
  }
  for (const forbidden of ['satisfied','isSatisfied','fulfilled','isFulfilled','completed','resolved','met','availableNow','status','state','progress','percentage','priority','rank','score','selected','recommended','method','channel','sourceSelection','question','plan','execution']) {
    assert(!(forbidden in requirement));
  }
}

const queryChecks = [
  [opportunities, K.buildKnowledgeOpportunityQuery({scope:'dimension'}), K.queryKnowledgeOpportunities],
  [needs, K.buildKnowledgeAcquisitionNeedQuery({scope:'dimension'}), K.queryKnowledgeAcquisitionNeeds],
  [strategies, K.buildKnowledgeAcquisitionStrategyQuery({scope:'dimension'}), K.queryKnowledgeAcquisitionStrategies],
  [requirements, K.buildKnowledgeAcquisitionRequirementQuery({scope:'dimension'}), K.queryKnowledgeAcquisitionRequirements]
];
for (const [collection, query, run] of queryChecks) {
  const beforeCollection=JSON.stringify(collection), beforeQuery=JSON.stringify(query);
  const result=run(collection,query);
  assert(result.summary.empty === (result[Object.keys(result).find(k=>Array.isArray(result[k]))].length===0));
  assert.strictEqual(JSON.stringify(collection),beforeCollection);
  assert.strictEqual(JSON.stringify(query),beforeQuery);
  assert.deepStrictEqual(run(collection,query),result);
  assert.doesNotThrow(()=>JSON.stringify(result));
}

const requirementSource=fs.readFileSync('src/core/knowledge/buildKnowledgeAcquisitionRequirement.js','utf8');
assert(!/Math\.random|Date\.now|randomUUID|setTimeout|setInterval/.test(requirementSource));
assert.doesNotThrow(()=>JSON.stringify(requirements));
console.log('Knowledge Acquisition Boundary Freeze tests PASSED');

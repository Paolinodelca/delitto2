const assert = require('assert');
const A = require('../src/app/knowledge');
const { calculateKnowledgeAcquisitionCapabilityCompositionDesignId } = require('../src/app/knowledge/knowledgeAcquisitionCapabilityCompositionDesignIdentity');
const { buildFixture } = require('./knowledge_acquisition_capability_composition_design_fixture');

const clone = value => JSON.parse(JSON.stringify(value));
const fixture = buildFixture();
const build = (input = fixture.input) => A.buildKnowledgeAcquisitionCapabilityCompositionDesign(input);
const valid = build();
function invalidLocal(change, pattern) {
  const value = clone(valid); change(value);
  value.id = calculateKnowledgeAcquisitionCapabilityCompositionDesignId(value);
  const result = A.validateKnowledgeAcquisitionCapabilityCompositionDesign(value);
  assert(!result.valid, `Expected invalid local design: ${JSON.stringify(result)}`);
  if (pattern) assert(result.errors.some(x => pattern.test(x)), JSON.stringify(result.errors));
}

for (const mode of ['single', 'none', 'deferred']) {
  const solutionDecision = A.buildKnowledgeAcquisitionSolutionDecision(fixture.decisionInputs[mode]);
  assert.throws(() => build({ ...fixture.input, solutionDecision }), e => e.code === 'COMPOSITION_DESIGN_NOT_APPLICABLE');
}
for (const decisionMode of [undefined, 'unknown']) {
  const solutionDecision = clone(fixture.solutionDecision);
  if (decisionMode === undefined) delete solutionDecision.decisionMode; else solutionDecision.decisionMode = decisionMode;
  assert.throws(() => build({ ...fixture.input, solutionDecision }), e => e.code === 'INVALID_KNOWLEDGE_ACQUISITION_SOLUTION_DECISION');
}
const insufficient = clone(fixture.solutionDecision); insufficient.selectedCapabilityRefs = insufficient.selectedCapabilityRefs.slice(0, 1);
assert.throws(() => build({ ...fixture.input, solutionDecision: insufficient }), e => e.code === 'INVALID_KNOWLEDGE_ACQUISITION_SOLUTION_DECISION');
assert.throws(() => build({ ...fixture.input, selectedCapabilitySnapshots: [fixture.selectedCapabilitySnapshots[0], fixture.selectedCapabilitySnapshots[0]] }), e => e.code === 'SELECTED_CAPABILITY_SNAPSHOT_MISMATCH');
assert.throws(() => build({ ...fixture.input, selectedCapabilitySnapshots: fixture.selectedCapabilitySnapshots.slice(0, 1) }), e => e.code === 'SELECTED_CAPABILITY_SNAPSHOT_MISMATCH');
assert.throws(() => build({ ...fixture.input, selectedCapabilitySnapshots: [...fixture.selectedCapabilitySnapshots, { capabilityRef: 'capability:not-selected' }] }), e => e.code === 'SELECTED_CAPABILITY_SNAPSHOT_MISMATCH');

invalidLocal(d => { d.logicalDependencies[0].prerequisiteContributionRefs = [d.logicalDependencies[0].dependentContributionRef]; }, /logicalDependencies/);
invalidLocal(d => { d.logicalDependencies.push({ dependentContributionRef: d.logicalDependencies[0].prerequisiteContributionRefs[0], prerequisiteContributionRefs: [d.logicalDependencies[0].dependentContributionRef], dependencyMode: 'all_required' }); }, /cycle/);
invalidLocal(d => {
  const third = 'knowledgeContribution:third';
  d.contributions.push({ contributionRef: third, contributionKind: 'intermediate_knowledge_contribution', producerCapabilityRef: d.selectedCapabilityRefs[0], consumerCapabilityRefs: [d.selectedCapabilityRefs[1]], requiredKnowledgeUnitRefs: [], satisfiesRequirementType: null });
  d.capabilityRoleAssignments[0].contributionRefs.push(third); d.capabilityRoleAssignments[0].contributionRefs.sort();
  d.logicalDependencies = [{ dependentContributionRef: d.contributions[0].contributionRef, prerequisiteContributionRefs: [d.contributions[1].contributionRef], dependencyMode: 'all_required' }, { dependentContributionRef: third, prerequisiteContributionRefs: [d.contributions[0].contributionRef], dependencyMode: 'all_required' }, { dependentContributionRef: d.contributions[1].contributionRef, prerequisiteContributionRefs: [third], dependencyMode: 'all_required' }];
}, /cycle/);
invalidLocal(d => d.compositionConditions[0].subjectRefs.push('capability:dangling'), /compositionConditions/);
invalidLocal(d => d.capabilityRoleAssignments[0].contributionRefs[0] = 'knowledgeContribution:dangling', /contributionRefs/);
invalidLocal(d => d.contributions[0].consumerCapabilityRefs = ['capability:dangling'], /consumerCapabilityRefs/);
invalidLocal(d => { d.logicalDependencies = []; d.contributions[0].consumerCapabilityRefs = []; }, /orphaned/);
invalidLocal(d => { const f = d.contributions.find(x => x.contributionKind === 'final_knowledge_output'); f.producerCapabilityRef = d.selectedCapabilityRefs[0]; d.capabilityRoleAssignments[0].contributionRefs.push(f.contributionRef); d.capabilityRoleAssignments[0].contributionRefs.sort(); d.capabilityRoleAssignments[1].contributionRefs = []; }, /composition_integrator/);
invalidLocal(d => { d.contributions.find(x => x.contributionKind === 'final_knowledge_output').satisfiesRequirementType = null; }, /allowed requirement/);
invalidLocal(d => { d.solutionShapeSatisfaction.capabilityObligationCoverage[0].capabilityRefs = [d.selectedCapabilityRefs[1]]; }, /inconsistent/);
invalidLocal(d => { d.logicalDependencies.push(clone(d.logicalDependencies[0])); }, /duplicates/);

const alteredId = clone(valid); alteredId.id += 'x';
assert(A.validateKnowledgeAcquisitionCapabilityCompositionDesign(alteredId).errors.some(x => x.includes('fingerprint')));
assert.equal(build().id, build().id);
const reordered = { ...fixture.input, selectedCapabilitySnapshots: [...fixture.selectedCapabilitySnapshots].reverse(), compositionDefinition: { ...fixture.compositionDefinition, capabilityRoleAssignments: [...fixture.compositionDefinition.capabilityRoleAssignments].reverse(), contributions: [...fixture.compositionDefinition.contributions].reverse() } };
assert.equal(build().id, build(reordered).id);
const semanticChange = clone(fixture.input); semanticChange.extensions.fixture = 'changed';
assert.notEqual(build().id, build(semanticChange).id);

for (const field of ['provider', 'adapter', 'configuration', 'plan', 'recipe', 'execution', 'runtime', 'orchestration', 'schedule', 'observation', 'result', 'satisfaction', 'knowledgeUpdate', 'persistence']) invalidLocal(d => { d.extensions[field] = {}; }, /forbidden/);
console.log('Knowledge Acquisition Capability Composition Design regression tests PASSED');

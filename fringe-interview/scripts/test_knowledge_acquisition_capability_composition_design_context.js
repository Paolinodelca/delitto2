const assert = require('assert');
const A = require('../src/app/knowledge');
const { calculateKnowledgeAcquisitionCapabilityCompositionDesignId } = require('../src/app/knowledge/knowledgeAcquisitionCapabilityCompositionDesignIdentity');
const { buildFixture } = require('./knowledge_acquisition_capability_composition_design_fixture');
const clone = value => JSON.parse(JSON.stringify(value));
const fixture = buildFixture(), design = A.buildKnowledgeAcquisitionCapabilityCompositionDesign(fixture.input);
const input = { capabilityCompositionDesign: design, knowledgeAcquisitionSolutionDecision: fixture.solutionDecision, knowledgeAcquisitionDesign: fixture.design };
const validate = value => A.validateKnowledgeAcquisitionCapabilityCompositionDesignContext(value);
assert(validate(input).valid);
function contextualMutation(change, pattern) {
  const value = clone(input); change(value);
  value.capabilityCompositionDesign.id = calculateKnowledgeAcquisitionCapabilityCompositionDesignId(value.capabilityCompositionDesign);
  const result = validate(value); assert(!result.valid); assert(result.errors.some(x => pattern.test(x)), JSON.stringify(result.errors));
}
contextualMutation(x => { const old=x.capabilityCompositionDesign.sourceSolutionDecisionRef; x.capabilityCompositionDesign.sourceSolutionDecisionRef='knowledgeAcquisitionSolutionDecision:wrong'; x.capabilityCompositionDesign.dependencyRefs=x.capabilityCompositionDesign.dependencyRefs.map(v=>v===old?x.capabilityCompositionDesign.sourceSolutionDecisionRef:v).sort(); }, /sourceSolutionDecisionRef/);
contextualMutation(x => { const old=x.capabilityCompositionDesign.sourceDesignRef; x.capabilityCompositionDesign.sourceDesignRef='knowledgeAcquisitionDesign:wrong'; x.capabilityCompositionDesign.dependencyRefs=x.capabilityCompositionDesign.dependencyRefs.map(v=>v===old?x.capabilityCompositionDesign.sourceDesignRef:v).sort(); }, /sourceDesignRef/);
contextualMutation(x => x.knowledgeAcquisitionSolutionDecision.selectedCapabilityRefs = [...x.knowledgeAcquisitionSolutionDecision.selectedCapabilityRefs, 'capability:extra'].sort(), /selectedCapabilityRefs|knowledgeAcquisitionSolutionDecision/);
contextualMutation(x => x.capabilityCompositionDesign.solutionShapeSatisfaction.outputTopology = 'other', /solutionShapeSatisfaction/);
contextualMutation(x => x.capabilityCompositionDesign.solutionShapeSatisfaction.contributionRequirements[0].minimumCount++, /solutionShapeSatisfaction/);
contextualMutation(x => x.capabilityCompositionDesign.solutionShapeSatisfaction.prerequisiteTopology.mode = 'all_required', /solutionShapeSatisfaction/);
contextualMutation(x => { const removed=x.capabilityCompositionDesign.capabilityRoleAssignments[0].capabilityObligations[0]; x.capabilityCompositionDesign.capabilityRoleAssignments[0].capabilityObligations=[]; x.capabilityCompositionDesign.solutionShapeSatisfaction.capabilityObligationCoverage=x.capabilityCompositionDesign.solutionShapeSatisfaction.capabilityObligationCoverage.filter(c=>c.obligation!==removed); }, /solutionShapeSatisfaction|obligations/i);
contextualMutation(x => { const ref=x.capabilityCompositionDesign.capabilityRoleAssignments[0].capabilityRef; x.capabilityCompositionDesign.capabilityRoleAssignments[0].capabilityObligations.push('must_support_prerequisite_composition'); x.capabilityCompositionDesign.capabilityRoleAssignments[0].capabilityObligations.sort(); x.capabilityCompositionDesign.solutionShapeSatisfaction.capabilityObligationCoverage.push({obligation:'must_support_prerequisite_composition',capabilityRefs:[ref]}); }, /solutionShapeSatisfaction|obligations/i);
contextualMutation(x => x.capabilityCompositionDesign.traceability.sourceNeedRef = 'knowledgeAcquisitionNeed:wrong', /traceability/);
contextualMutation(x => x.capabilityCompositionDesign.dependencyRefs.push('causal:extra'), /dependencyRefs/);
contextualMutation(x => x.capabilityCompositionDesign.contributions.find(c => c.contributionKind === 'final_knowledge_output').requiredKnowledgeUnitRefs = [], /requiredKnowledgeUnitRefs/);
console.log('Knowledge Acquisition Capability Composition Design context tests PASSED');

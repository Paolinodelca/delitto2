const { validateKnowledgeAcquisitionDesign } = require('../../core/knowledge/validateKnowledgeAcquisitionDesign');
const { validateKnowledgeAcquisitionSolutionDecision } = require('./validateKnowledgeAcquisitionSolutionDecision');
const { validateKnowledgeAcquisitionCapabilityCompositionDesign } = require('./validateKnowledgeAcquisitionCapabilityCompositionDesign');
const { stableStringify } = require('./knowledgeAcquisitionCapabilityCompositionDesignIdentity');

function validateKnowledgeAcquisitionCapabilityCompositionDesignContext(input = {}) {
  const errors = [], warnings = [];
  const capabilityCompositionDesign = input.capabilityCompositionDesign;
  const knowledgeAcquisitionSolutionDecision = input.knowledgeAcquisitionSolutionDecision;
  const knowledgeAcquisitionDesign = input.knowledgeAcquisitionDesign;
  const validations = [
    ['capabilityCompositionDesign', validateKnowledgeAcquisitionCapabilityCompositionDesign(capabilityCompositionDesign)],
    ['knowledgeAcquisitionSolutionDecision', validateKnowledgeAcquisitionSolutionDecision(knowledgeAcquisitionSolutionDecision)],
    ['knowledgeAcquisitionDesign', validateKnowledgeAcquisitionDesign(knowledgeAcquisitionDesign)],
  ];
  for (const [name, validation] of validations) if (!validation.valid) errors.push(...validation.errors.map(error => `${name}: ${error}`));
  if (errors.length) return { valid: false, errors, warnings };

  const decisionRef = `knowledgeAcquisitionSolutionDecision:${knowledgeAcquisitionSolutionDecision.id}`;
  const designRef = `knowledgeAcquisitionDesign:${knowledgeAcquisitionDesign.id}`;
  if (capabilityCompositionDesign.sourceSolutionDecisionRef !== decisionRef) errors.push('sourceSolutionDecisionRef does not match the supplied Solution Decision.');
  if (capabilityCompositionDesign.sourceDesignRef !== designRef || knowledgeAcquisitionSolutionDecision.sourceDesignRef !== designRef) errors.push('sourceDesignRef does not match the supplied Design.');
  if (knowledgeAcquisitionSolutionDecision.decisionMode !== 'composed') errors.push('The supplied Solution Decision must use decisionMode composed.');
  if (stableStringify(capabilityCompositionDesign.selectedCapabilityRefs) !== stableStringify(knowledgeAcquisitionSolutionDecision.selectedCapabilityRefs)) errors.push('selectedCapabilityRefs do not exactly match the Solution Decision.');
  const expectedShape = {
    ...knowledgeAcquisitionDesign.solutionShape,
    capabilityObligationCoverage: knowledgeAcquisitionDesign.capabilityObligations.map(obligation => ({
      obligation,
      capabilityRefs: capabilityCompositionDesign.capabilityRoleAssignments.filter(x => x.capabilityObligations.includes(obligation)).map(x => x.capabilityRef).sort(),
    })),
  };
  if (stableStringify(capabilityCompositionDesign.solutionShapeSatisfaction) !== stableStringify(expectedShape)) errors.push('solutionShapeSatisfaction does not exactly conform to the supplied Design.');
  const assignedObligations = [...new Set(capabilityCompositionDesign.capabilityRoleAssignments.flatMap(x => x.capabilityObligations))].sort();
  if (stableStringify(assignedObligations) !== stableStringify(knowledgeAcquisitionDesign.capabilityObligations)) errors.push('Capability obligations are added or omitted relative to the supplied Design.');
  const expectedTraceability = { sourceRequirementRef: knowledgeAcquisitionDesign.sourceRequirementRef, ...knowledgeAcquisitionDesign.traceability };
  if (stableStringify(capabilityCompositionDesign.traceability) !== stableStringify(expectedTraceability)) errors.push('traceability does not exactly conform to the supplied Design.');
  const expectedDependencies = [...new Set([decisionRef, designRef, ...knowledgeAcquisitionSolutionDecision.selectedCapabilityRefs, ...knowledgeAcquisitionSolutionDecision.dependencyRefs])].sort();
  if (stableStringify(capabilityCompositionDesign.dependencyRefs) !== stableStringify(expectedDependencies)) errors.push('dependencyRefs are not the exact minimal causal references.');
  const finals = capabilityCompositionDesign.contributions.filter(x => x.contributionKind === 'final_knowledge_output');
  if (finals.length === 1 && stableStringify(finals[0].requiredKnowledgeUnitRefs) !== stableStringify(knowledgeAcquisitionDesign.targetKnowledge.knowledgeUnitRefs)) errors.push('Final output requiredKnowledgeUnitRefs do not conform to the supplied Design.');
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionCapabilityCompositionDesignContext };

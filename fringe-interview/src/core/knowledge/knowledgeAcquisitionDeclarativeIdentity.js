const crypto = require('crypto');

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (object(value)) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function fingerprint(prefix, identity) {
  const digest = crypto.createHash('sha256').update(stableStringify(identity)).digest('hex').slice(0, 32);
  return `${prefix}_${digest}`;
}

function calculateKnowledgeAcquisitionNeedId(need) {
  return fingerprint('knowledgeAcquisitionNeed', {
    sourceOpportunityRef: need.sourceOpportunityRef,
    needType: need.needType,
    scope: need.scope,
    scopeRef: need.scopeRef,
    requiredKnowledgeLayer: need.requiredKnowledgeLayer,
    needVersion: need.needVersion,
  });
}

function calculateKnowledgeAcquisitionStrategyId(strategy) {
  return fingerprint('knowledgeAcquisitionStrategy', {
    sourceNeedRef: strategy.sourceNeedRef,
    strategyType: strategy.strategyType,
    scope: strategy.scope,
    scopeRef: strategy.scopeRef,
    targetKnowledgeLayer: strategy.targetKnowledgeLayer,
    strategyVersion: strategy.strategyVersion,
  });
}

function calculateKnowledgeAcquisitionRequirementId(requirement) {
  return fingerprint('knowledgeAcquisitionRequirement', {
    sourceStrategyRef: requirement.sourceStrategyRef,
    requirementType: requirement.requirementType,
    scope: requirement.scope,
    scopeRef: requirement.scopeRef,
    requiredKnowledgeLayer: requirement.requiredKnowledgeLayer,
    requirementVersion: requirement.requirementVersion,
  });
}

function calculateKnowledgeAcquisitionDesignId(design) {
  const identity = {
    sourceRequirementRef: design.sourceRequirementRef,
    designType: design.designType,
    targetKnowledge: design.targetKnowledge,
    solutionShape: design.solutionShape,
    capabilityObligations: design.capabilityObligations,
    designVersion: design.designVersion,
  };
  if (design.semanticPolicyRef !== undefined) identity.semanticPolicyRef = design.semanticPolicyRef;
  return fingerprint('knowledgeAcquisitionDesign', identity);
}

function calculateKnowledgeAcquisitionCapabilityMatchId(match) {
  const semantic = {
    sourceDesignRef:match.sourceDesignRef,
    candidateCapabilityRef:match.candidateCapabilityRef,
    compatibilityState:match.compatibilityState,
    candidateEligibility:match.candidateEligibility,
    obligationCompatibility:match.obligationCompatibility,
    topologyCompatibility:match.topologyCompatibility,
    constraintCompatibility:match.constraintCompatibility,
    reasons:match.reasons,
  };
  return fingerprint('knowledgeAcquisitionCapabilityMatch', { semantic, contractVersion:'1.0' });
}

module.exports = {
  stableStringify,
  calculateKnowledgeAcquisitionNeedId,
  calculateKnowledgeAcquisitionStrategyId,
  calculateKnowledgeAcquisitionRequirementId,
  calculateKnowledgeAcquisitionDesignId,
  calculateKnowledgeAcquisitionCapabilityMatchId,
};

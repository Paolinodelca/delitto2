const crypto = require('crypto');
const { stableStringify } = require('../../core/knowledge/knowledgeAcquisitionDeclarativeIdentity');

function calculateKnowledgeAcquisitionSolutionDecisionId(decision) {
  const { id, decisionVersion, type, ...semantic } = decision;
  const digest = crypto.createHash('sha256')
    .update(stableStringify({ semantic, decisionVersion }))
    .digest('hex')
    .slice(0, 32);
  return `knowledgeAcquisitionSolutionDecision_${digest}`;
}

module.exports = { calculateKnowledgeAcquisitionSolutionDecisionId };

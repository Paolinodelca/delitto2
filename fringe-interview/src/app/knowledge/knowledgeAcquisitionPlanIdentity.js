const crypto=require('crypto');
const {stableStringify}=require('./knowledgeAcquisitionCapabilityConfigurationIdentity');
function calculateKnowledgeAcquisitionPlanId(plan){const {id,planVersion,type,...semantic}=plan;return `knowledgeAcquisitionPlan_${crypto.createHash('sha256').update(stableStringify({semantic,planVersion})).digest('hex').slice(0,32)}`}
module.exports={calculateKnowledgeAcquisitionPlanId};

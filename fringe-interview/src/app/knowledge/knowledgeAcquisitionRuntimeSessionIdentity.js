const crypto=require('crypto');
const {stableStringify}=require('./knowledgeAcquisitionCapabilityConfigurationIdentity');
function calculateKnowledgeAcquisitionRuntimeSessionId(session){
 const semantic={sessionVersion:session.sessionVersion,sourceKnowledgeAcquisitionPlanRef:session.sourceKnowledgeAcquisitionPlanRef,sessionKey:session.sessionKey};
 return `knowledgeAcquisitionRuntimeSession_${crypto.createHash('sha256').update(stableStringify(semantic)).digest('hex').slice(0,32)}`;
}
module.exports={calculateKnowledgeAcquisitionRuntimeSessionId};

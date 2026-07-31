const crypto=require('crypto');
const {stableStringify}=require('./knowledgeAcquisitionCapabilityConfigurationIdentity');
function calculateKnowledgeAcquisitionExecutionId(execution){
 const semantic={executionVersion:execution.executionVersion,sourceRuntimeSessionRef:execution.sourceRuntimeSessionRef,sourcePlanItemRef:execution.sourcePlanItemRef,executionKey:execution.executionKey};
 return `knowledgeAcquisitionExecution_${crypto.createHash('sha256').update(stableStringify(semantic)).digest('hex').slice(0,32)}`;
}
module.exports={calculateKnowledgeAcquisitionExecutionId};

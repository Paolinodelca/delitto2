const crypto=require('crypto');
const {stableStringify}=require('./knowledgeAcquisitionCapabilityConfigurationIdentity');
function calculateKnowledgeAcquisitionInvocationInputFingerprint(input){const semantic={invocationInputVersion:input.invocationInputVersion,sourceExecutionRef:input.sourceExecutionRef,sourceRuntimeSessionRef:input.sourceRuntimeSessionRef,sourcePlanRef:input.sourcePlanRef,sourcePlanItemRef:input.sourcePlanItemRef,operation:input.operation};return crypto.createHash('sha256').update(stableStringify(semantic)).digest('hex')}
module.exports={calculateKnowledgeAcquisitionInvocationInputFingerprint};

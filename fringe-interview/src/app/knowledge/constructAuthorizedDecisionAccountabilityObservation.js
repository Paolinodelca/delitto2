const { buildDecisionAccountabilityObservation, validateDecisionAccountabilityObservation } = require('../../core/measurement/decisionAccountability');
const { validateEvidence } = require('../../core/evidence/validateEvidence');
function constructAuthorizedDecisionAccountabilityObservation({evidence,semanticAuthority,executor}={}){
 if(!validateEvidence(evidence).isValid||semanticAuthority?.resolved!==true||semanticAuthority.semanticPolicyRef!=='professional_semantic_policy:decision_accountability:v1'||typeof executor!=='function')return null;
 let interpreted;try{interpreted=executor({evidence});}catch{return null}
 if(!interpreted||typeof interpreted!=='object'||interpreted.supported!==true)return null;
 const observation=buildDecisionAccountabilityObservation({...interpreted.observation,evidenceIds:[evidence.id],extensions:{...(interpreted.observation?.extensions||{}),semanticProvenance:{semanticPolicyRef:semanticAuthority.semanticPolicyRef,knowledgeAcquisitionDesignRef:semanticAuthority.knowledgeAcquisitionDesignRef,knowledgeAcquisitionExecutionRef:semanticAuthority.knowledgeAcquisitionExecutionRef}}});
 const validation=validateDecisionAccountabilityObservation(observation);
 if(!validation.isValid||observation.observationStatus!=='observed')return null;
 return observation;
}
module.exports={constructAuthorizedDecisionAccountabilityObservation};

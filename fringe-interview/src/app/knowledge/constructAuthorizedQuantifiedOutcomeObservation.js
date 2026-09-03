const {buildQuantifiedOutcomeObservation,validateQuantifiedOutcomeObservation}=require('../../core/measurement/quantifiedOutcome');
const {validateEvidence}=require('../../core/evidence/validateEvidence');
const POLICY='professional_semantic_policy:quantified_outcome:v1';
function constructAuthorizedQuantifiedOutcomeObservation({evidence,semanticAuthority,executor}={}){
 if(!validateEvidence(evidence).isValid||semanticAuthority?.resolved!==true||semanticAuthority.semanticPolicyRef!==POLICY||typeof executor!=='function')return null;
 let interpreted;try{interpreted=executor({evidence});}catch{return null}
 if(!interpreted||typeof interpreted!=='object'||interpreted.supported!==true)return null;
 const observation=buildQuantifiedOutcomeObservation({...interpreted.observation,evidenceIds:[evidence.id],extensions:{...(interpreted.observation?.extensions||{}),semanticProvenance:{semanticPolicyRef:POLICY,knowledgeAcquisitionDesignRef:semanticAuthority.knowledgeAcquisitionDesignRef,knowledgeAcquisitionExecutionRef:semanticAuthority.knowledgeAcquisitionExecutionRef}}});
 const validation=validateQuantifiedOutcomeObservation(observation);if(!validation.isValid||observation.observationStatus!=='observed')return null;return observation;
}
module.exports={constructAuthorizedQuantifiedOutcomeObservation};

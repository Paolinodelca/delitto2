import { createHash } from 'node:crypto';
const text=v=>typeof v==='string'?v.trim():'';
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const STATES=new Set(['shared_non_exclusive','exclusive_sole','unknown_not_established']);
const SUPPORT=new Set(['authorised_source','accepted_acquisition']);
const POLICY='professional_semantic_policy:bounded_professional_responsibility_scope:v1';
const stable=(prefix,value)=>`${prefix}:${createHash('sha256').update(value).digest('hex').slice(0,20)}`;
export function constructBoundedProfessionalResponsibilityScope({sourceId,sourceRole,supportType,sourceRef,exactText,referent,scope,authorityRef=POLICY}={}){
 const sid=text(sourceId),kind=text(supportType),ref=text(sourceRef),quote=text(exactText),activity=text(referent?.activity),state=text(scope);
 if(!sid||!SUPPORT.has(kind)||!ref||!quote||!activity||!STATES.has(state)||authorityRef!==POLICY)return null;
 const referentId=text(referent?.id)||stable('professionalReferent',`${sid}|${activity}|${text(referent?.context)}`);
 const evidence=freeze({type:'professional_responsibility_scope_evidence',version:'1.0',id:stable('responsibilityScopeEvidence',`${sid}|${ref}|${referentId}|${state}`),sourceId:sid,sourceRole:text(sourceRole),supportType:kind,sourceRef:ref,exactText:quote,referent:freeze({id:referentId,activity,context:text(referent?.context)||null})});
 const observation=freeze({type:'observed_bounded_professional_responsibility_scope',version:'1.0',observationId:stable('responsibilityScopeObservation',`${evidence.id}|${state}`),observationStatus:'observed',responsibilityScope:state,referent:evidence.referent,evidenceIds:freeze([evidence.id]),limitations:freeze(['context_bound_responsibility_scope','not_person_characteristic','not_decision_accountability','not_continuing_people_responsibility','not_result_causality']),extensions:freeze({semanticProvenance:freeze({semanticPolicyRef:POLICY,sourceEvidenceRef:evidence.id})})});
 return freeze({semanticType:'professional_responsibility_scope',semanticPolicyRef:POLICY,evidence,observation,responsibilityScope:state,referent:evidence.referent,provenance:freeze({sourceId:sid,sourceRef:ref,evidenceRef:evidence.id,observationRef:observation.observationId,semanticPolicyRef:POLICY})});
}
export { POLICY as PROFESSIONAL_RESPONSIBILITY_SCOPE_POLICY };

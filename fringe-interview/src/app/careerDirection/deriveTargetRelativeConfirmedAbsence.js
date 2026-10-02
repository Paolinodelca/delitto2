const crypto=require('crypto');
function arr(v){return Array.isArray(v)?v:[]}
function obj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function text(v){return typeof v==='string'?v.trim():''}
function stable(v){if(Array.isArray(v))return`[${v.map(stable).join(',')}]`;if(obj(v))return`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;return JSON.stringify(v)}
function hash(v){return crypto.createHash('sha256').update(stable(v)).digest('hex')}
const AUTHORITY='target_relative_confirmed_absence:continuing_people_responsibility:pd072c:v1';
function currentPeopleState(matrix){
 const elementary=arr(matrix?.knowledgeLayers?.elementary).find(x=>x?.state?.dimensionId==='continuing_people_responsibility');
 const detail=matrix?.extensions?.semanticDetails?.continuing_people_responsibility||elementary?.semanticDetail||null;
 return {elementary,detail};
}
function compatibleTarget(authority){return authority?.requirementClass==='formal_continuing_people_responsibility'&&authority?.responsibilityFormality==='formal'&&authority?.continuityRequirement==='continuing'&&authority?.responsibilityScope==='role_ongoing_staff_responsibility'&&text(authority?.authorityRef)}
function compatibleNegative(detail){
 const c=detail?.professionalContext, t=detail?.eventTime;
 return detail?.stateKind==='bounded_non_presence_observed'&&detail?.responsibilityPresence==='contextual_non_responsibility'&&obj(c)&&c.formalReporting===false&&c.scope==='current_role'&&obj(t)&&t.status==='current';
}
function deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis,roleRequirementRef,personKnowledgeMatrix,derivedAt=new Date().toISOString()}={}){
 const authority=careerDirectionHypothesis?.metadata?.roleRequirementAuthorities?.[roleRequirementRef];
 const {elementary,detail}=currentPeopleState(personKnowledgeMatrix);
 if(!compatibleTarget(authority)||!elementary||elementary?.state?.stateType!=='observed'||!compatibleNegative(detail))return null;
 const evidenceRefs=arr(detail?.evidenceIds||detail?.supportingEvidenceRefs);
 const observationRefs=arr(detail?.observationRefs);
 const knowledgeRef=elementary?.stateId||elementary?.state?.id||null;
 const limitations=[...new Set([...arr(detail?.limitations),...arr(authority?.limitations),'Target-relative derived state only; does not establish leadership, capability, readiness, suitability, or career-wide absence.'])];
 const logical={targetRef:careerDirectionHypothesis.directionRef,requirementRef:roleRequirementRef,requirementClass:authority.requirementClass,semanticType:'continuing_people_responsibility',knowledgeRef,absenceScope:detail.absenceScope||detail.professionalContext,temporalScope:detail.eventTime,authorityRef:AUTHORITY};
 return Object.freeze({stateId:`targetRelativeConfirmedAbsence:${hash(logical).slice(0,32)}`,stateKind:'TARGET_RELATIVE_CONFIRMED_ABSENCE',careerDirectionRef:careerDirectionHypothesis.id,targetRef:careerDirectionHypothesis.directionRef,requirementRef:roleRequirementRef,requirementClass:authority.requirementClass,semanticType:'continuing_people_responsibility',supportingKnowledgeRefs:knowledgeRef?[knowledgeRef]:[],supportingEvidenceRefs:evidenceRefs,supportingObservationRefs:observationRefs,absenceScope:detail.absenceScope||detail.professionalContext,contextualScope:detail.professionalContext,temporalScope:detail.eventTime,compatibilityBasis:{personStateKind:detail.stateKind,responsibilityPresence:detail.responsibilityPresence,targetFormality:authority.responsibilityFormality,targetContinuity:authority.continuityRequirement,targetResponsibilityScope:authority.responsibilityScope,scopePolicy:'current_role_to_role_ongoing_staff_responsibility',temporalPolicy:'current_to_continuing_current_requirement'},authorityRef:AUTHORITY,limitations,bridgeEligible:true,derivedAt,fingerprint:hash(logical)});
}
module.exports={deriveTargetRelativeConfirmedAbsence,TARGET_RELATIVE_CONFIRMED_ABSENCE_AUTHORITY:AUTHORITY};

import { createHash } from 'node:crypto';

const PURPOSE='professional_representation_understand';
export const TARGET_INDEPENDENT_REPRESENTATION_RECIPE=Object.freeze({id:'target_independent_professional_representation',version:'2.0'});
export const REPRESENTATION_MATERIALIZATION_RECIPE=Object.freeze({id:'professional_representation_materialization_completion',version:'1.0'});
export const REPRESENTATION_MATERIALIZATION_STATUS=Object.freeze({COMPLETE:'complete',DEGRADED:'degraded',INCOMPLETE:'incomplete'});
const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v;};
const hash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
const relevantKnowledge=items=>arr(items).filter(x=>['decision_accountability','quantified_outcome','continuing_people_responsibility','resource_budget_responsibility_scope','production_planning_scheduling_responsibility_scope'].includes(text(x?.semanticType))).map(x=>{const semanticType=text(x.semanticType);if(semanticType==='continuing_people_responsibility'){const d=x?.specializedMeasurementResult?.semanticDetail||{},c=x?.specializedMeasurementResult?.context||x?.observation?.professionalContext||{};return {semanticType,knowledgeRef:text(x.knowledgeRef||x?.knowledgeSnapshot?.snapshotId||x?.knowledgeSnapshot?.id),semanticPolicyRef:text(x.semanticPolicyRef||x?.semanticAuthority?.semanticPolicyRef),observationStatus:text(x?.observation?.observationStatus),responsibilityPresence:text(d.responsibilityPresence),continuity:text(d.continuity),responsibilityMode:text(d.responsibilityMode),responsibilityKinds:arr(d.responsibilityKinds).map(text).filter(Boolean),peopleScope:d.peopleScope||{kind:'unknown'},professionalContext:c};}return {semanticType,knowledgeRef:text(x.knowledgeRef||x?.knowledgeSnapshot?.snapshotId||x?.knowledgeSnapshot?.id),knowledgeSnapshot:x.knowledgeSnapshot||null,observation:x.observation||null,specializedMeasurementResult:x.specializedMeasurementResult||null,measurementResult:x.measurementResult||null,dimensionContributions:x.dimensionContributions||[],semanticAuthority:x.semanticAuthority||null};});
export function buildTargetIndependentRepresentationSnapshotState({professionalIdentity,professionalSources,reusableKnowledgeResults,authorizationState='accepted',recipe=TARGET_INDEPENDENT_REPRESENTATION_RECIPE}={}){
 const sources=arr(professionalSources).map(x=>({id:text(x.id),type:text(x.type),sourceRole:text(x.sourceRole),content:text(x.content),provenance:x.provenance||null}));
 const knowledge=relevantKnowledge(reusableKnowledgeResults);
 const sourceStateFingerprint=hash(sources),knowledgeStateFingerprint=hash(knowledge),authorizationStateFingerprint=hash({authorizationState});
 const material={personRef:professionalIdentity?.personRef||null,professionalIdentityRef:text(professionalIdentity?.professionalIdentityRef),purpose:PURPOSE,context:'target_independent',sourceStateFingerprint,knowledgeStateFingerprint,authorizationStateFingerprint,recipe};
 return Object.freeze({...material,relevantStateFingerprint:hash(material)});
}
const completionStatus=x=>text(x?.materializationProvenance?.materializationStatus||x?.materializationStatus)||'legacy_unknown';
export function isRepresentationSnapshotReuseEligible(snapshot){return Boolean(snapshot?.representation)&&![REPRESENTATION_MATERIALIZATION_STATUS.INCOMPLETE].includes(completionStatus(snapshot));}
export function findReusableTargetIndependentRepresentationSnapshot({professionalIdentity,state}={}){
 const matches=arr(professionalIdentity?.representationSnapshots).filter(x=>x?.type==='professional_representation_snapshot'&&x?.purpose===PURPOSE&&x?.context==='target_independent'&&x?.relevantStateFingerprint===state?.relevantStateFingerprint&&isRepresentationSnapshotReuseEligible(x));
 const currentRef=professionalIdentity?.currentRepresentationSnapshotRefs?.[PURPOSE];return matches.find(x=>x.snapshotId===currentRef)||matches.slice(-1)[0]||null;
}
export function buildRepresentationMaterializationProvenance({liveSynthesisRequired=false,pd069Status='not_required',pd070Status='not_required',higherOrderSynthesisApplicable=true}={}){
 const pd069Completed=!liveSynthesisRequired||pd069Status==='ok';const pd070Completed=!liveSynthesisRequired||!higherOrderSynthesisApplicable||pd070Status==='ok';const providerFallbackUsed=Boolean(liveSynthesisRequired&&(!pd069Completed||!pd070Completed));const materializationStatus=providerFallbackUsed?REPRESENTATION_MATERIALIZATION_STATUS.DEGRADED:REPRESENTATION_MATERIALIZATION_STATUS.COMPLETE;
 return Object.freeze({version:'1.0',recipe:clone(REPRESENTATION_MATERIALIZATION_RECIPE),materializationStatus,providerFallbackUsed,higherOrderSynthesisCompleted:Boolean(pd070Completed),pd069Completed:Boolean(pd069Completed),pd070Completed:Boolean(pd070Completed),higherOrderSynthesisApplicable:Boolean(higherOrderSynthesisApplicable)});
}
export function classifyRepresentationSnapshotChange({previousSnapshot,state}={}){
 if(!previousSnapshot)return 'initial_materialization';
 if(previousSnapshot.authorizationStateFingerprint!==state.authorizationStateFingerprint)return 'authorization_change';
 if(previousSnapshot.sourceStateFingerprint!==state.sourceStateFingerprint)return 'professional_source_state_change';
 if(previousSnapshot.knowledgeStateFingerprint!==state.knowledgeStateFingerprint)return 'knowledge_observability_change';
 if(previousSnapshot.recipe?.id!==state.recipe?.id||previousSnapshot.recipe?.version!==state.recipe?.version)return 'representation_recipe_change';
 if(previousSnapshot.purpose!==state.purpose||previousSnapshot.context!==state.context)return 'context_or_purpose_change';
 return 'unchanged';
}
export function materializeTargetIndependentRepresentationSnapshot({professionalIdentity,state,representation,materializationProvenance,now}={}){
 const prior=arr(professionalIdentity?.representationSnapshots);const previousSnapshot=prior[prior.length-1]||null;const changeCause=classifyRepresentationSnapshotChange({previousSnapshot,state});
 const snapshotId=`representationSnapshot:${state.relevantStateFingerprint}`;
 const provenanceState=materializationProvenance||buildRepresentationMaterializationProvenance();
 const snapshot=Object.freeze({version:'1.1',type:'professional_representation_snapshot',snapshotId,personRef:clone(state.personRef),professionalIdentityRef:state.professionalIdentityRef,purpose:state.purpose,context:state.context,materializedAt:text(now)||new Date().toISOString(),relevantStateFingerprint:state.relevantStateFingerprint,sourceStateFingerprint:state.sourceStateFingerprint,knowledgeStateFingerprint:state.knowledgeStateFingerprint,authorizationStateFingerprint:state.authorizationStateFingerprint,recipe:clone(state.recipe),changeCause,materializationProvenance:clone(provenanceState),materializationStatus:provenanceState.materializationStatus,providerFallbackUsed:Boolean(provenanceState.providerFallbackUsed),higherOrderSynthesisCompleted:Boolean(provenanceState.higherOrderSynthesisCompleted),representation:clone(representation),provenance:clone(representation?.provenance||{}),limitations:clone(representation?.limitations||[])});
 return snapshot;
}
export function attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity,snapshot}={}){
 const record=clone(professionalIdentity);const history=arr(record?.representationSnapshots);const index=history.findIndex(x=>x.snapshotId===snapshot.snapshotId);
 if(index>=0){const existing=history[index],existingStatus=completionStatus(existing),incomingStatus=completionStatus(snapshot);if(existingStatus===REPRESENTATION_MATERIALIZATION_STATUS.COMPLETE&&incomingStatus!==REPRESENTATION_MATERIALIZATION_STATUS.COMPLETE)return Object.freeze(record);if(existingStatus===incomingStatus&&JSON.stringify(existing)===JSON.stringify(snapshot))return Object.freeze(record);const next=[...history];next[index]=clone(snapshot);record.representationSnapshots=next;}else record.representationSnapshots=[...history,clone(snapshot)];
 record.currentRepresentationSnapshotRefs={...(record.currentRepresentationSnapshotRefs||{}),[PURPOSE]:snapshot.snapshotId};return Object.freeze(record);
}
export function validateRepresentationSnapshots(record){
 for(const x of arr(record?.representationSnapshots)){if(x?.type!=='professional_representation_snapshot'||!text(x.snapshotId)||x?.personRef?.id!==record?.personRef?.id||text(x.professionalIdentityRef)!==text(record?.professionalIdentityRef)||x.purpose!==PURPOSE||x.context!=='target_independent'||!text(x.relevantStateFingerprint)||!x.representation)throw new Error('PRIVATE_BETA_PROFESSIONAL_IDENTITY_INVALID_REPRESENTATION_SNAPSHOT');}
 return true;
}

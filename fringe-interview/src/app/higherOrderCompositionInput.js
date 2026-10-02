const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const unique=v=>[...new Set(arr(v).map(text).filter(Boolean))];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const KNOWLEDGE=new Set(['decision_accountability','quantified_outcome','responsibility_scope','continuing_people_responsibility','resource_budget_responsibility_scope','production_planning_scheduling_responsibility_scope']);
const KNOWLEDGE_CLASS=Object.freeze({
 decision_accountability:'decision_accountability',
 quantified_outcome:'quantified_outcome',
 continuing_people_responsibility:'people_responsibility',
 resource_budget_responsibility_scope:'budget_resource',
 production_planning_scheduling_responsibility_scope:'production_planning'
});
const PATTERN_CLASS=Object.freeze({
 documented_cross_functional_coordination_recurrence:'cross_functional_coordination'
});
function structuredIdentity(classes=[],basis='unestablished'){const values=unique(classes);return freeze({status:values.length?'established':'unestablished',classes:values,basis});}
function relationshipStructuredIdentity(r,descriptorById){
 const carried=unique(arr(r?.semanticClasses).map(text).filter(Boolean));
 if(carried.length)return structuredIdentity(carried,text(r?.semanticClassBasis)||'accepted_relationship_structured_semantics');
 const descriptors=arr(r?.descriptorRefs).map(x=>descriptorById.get(text(x))).filter(Boolean);
 const involvedFunctions=descriptors.filter(d=>text(d?.descriptorRole)==='involved_function');
 const coordinatedParticipation=descriptors.some(d=>text(d?.descriptorRole)==='contribution_participation'&&text(d?.claimShape?.agencyLevel)==='coordinated');
 if(involvedFunctions.length>=2&&coordinatedParticipation)return structuredIdentity(['cross_functional_coordination'],'accepted_descriptor_roles_and_claim_shape');
 return structuredIdentity([],'relationship_structured_identity_unestablished');
}
function episodeStructuredIdentity(e){
 const classes=[];
 if(e?.responsibilityScope&&text(e.responsibilityScope?.state)!=='unknown_not_established'&&text(e.responsibilityScope?.referent?.semanticType)==='continuing_people_responsibility')classes.push('people_responsibility');
 return structuredIdentity(classes,classes.length?'episode_responsibility_scope':'episode_structured_identity_unestablished');
}
const MAX_CONTRIBUTORS=24;
const TYPE_ORDER=['grounded_descriptive_professional_relationship','source_grounded_professional_episode_meaning','supported_pattern','bounded_canonical_knowledge_meaning'];
const stableRef=(a,b)=>text(a.contributorRef).localeCompare(text(b.contributorRef));
function selectDiversityPreservingContributors(values,{maxContributors=MAX_CONTRIBUTORS}={}){
 const byRef=new Map();for(const v of arr(values)){const ref=text(v?.contributorRef);if(ref&&!byRef.has(ref))byRef.set(ref,v)}
 const uniqueValues=[...byRef.values()];if(uniqueValues.length<=maxContributors)return uniqueValues.sort((a,b)=>TYPE_ORDER.indexOf(a.contributorType)-TYPE_ORDER.indexOf(b.contributorType)||stableRef(a,b));
 const buckets=new Map(TYPE_ORDER.map(t=>[t,uniqueValues.filter(v=>v.contributorType===t).sort(stableRef)]));const selected=[];
 // Structural round-robin prevents an earlier class from mechanically starving another present class.
 while(selected.length<maxContributors){let added=false;for(const t of TYPE_ORDER){const bucket=buckets.get(t);if(bucket?.length&&selected.length<maxContributors){selected.push(bucket.shift());added=true}}if(!added)break}
 return selected;
}
export { MAX_CONTRIBUTORS, selectDiversityPreservingContributors };
export function buildHigherOrderCompositionInput({relationships=[],descriptors=[],episodeMeanings=[],supportedPatterns=[],knowledgeContribution=[]}={}){
 const descriptorById=new Map(arr(descriptors).map(d=>[text(d.descriptorId),d]));const canonicalEpisodeIds=new Set(arr(episodeMeanings).map(e=>text(e.episodeMeaningId)).filter(Boolean));const out=[];
 for(const r of arr(relationships)){if(r?.status!=='accepted')continue;const bases=unique(arr(r.descriptorRefs).map(x=>text(descriptorById.get(x)?.episodeRef)));out.push({contributorRef:text(r.relationshipId),contributorType:'grounded_descriptive_professional_relationship',nativeRef:text(r.relationshipId),relationshipId:text(r.relationshipId),kind:'grounded_descriptive_professional_relationship',status:'accepted',semanticContent:{wording:text(r.relationshipWording),basis:text(r.relationshipBasis)},structuredSemanticIdentity:relationshipStructuredIdentity(r,descriptorById),claimShape:r.claimShape||null,materialRefs:unique(r.materialRefs),sourceRefs:unique(r.sourceRefs),professionalBasisRefs:bases,semanticCeiling:'pd069_grounded_relationship'});}
 for(const e of arr(episodeMeanings)){const id=text(e.episodeMeaningId);if(!id)continue;out.push({contributorRef:`episodeMeaning:${id}`,contributorType:'source_grounded_professional_episode_meaning',nativeRef:id,status:'accepted',semanticContent:{description:text(e.description),activity:e.activity||null,object:e.object||null,phases:arr(e.phases),professionalContext:e.professionalContext||null,participation:text(e.participation),responsibilityScope:e.responsibilityScope||null},structuredSemanticIdentity:episodeStructuredIdentity(e),claimShape:null,materialRefs:[id],sourceRefs:unique([e.sourceId]),professionalBasisRefs:[id],semanticCeiling:'pd057_source_grounded_episode_meaning'});}
 for(const [i,p] of arr(supportedPatterns).entries()){const id=`${text(p.kind)}:${text(p.domain)||unique(p.sourceRefs).join('|')||i}`;const cls=PATTERN_CLASS[text(p.kind)];out.push({contributorRef:`pattern:${id}`,contributorType:'supported_pattern',nativeRef:id,status:'accepted',semanticContent:{kind:text(p.kind),domain:text(p.domain),supportCount:Number(p.supportCount)||0},structuredSemanticIdentity:freeze({...structuredIdentity(cls?[cls]:[],cls?'pattern_kind':'pattern_structured_identity_unestablished'),supportStrength:cls&&Number(p.supportCount)>=2?'independent_recurrence':'single'}),claimShape:null,materialRefs:unique(p.sourceRefs),sourceRefs:unique(p.sourceRefs),professionalBasisRefs:unique(p.episodeRefs).filter(x=>canonicalEpisodeIds.has(x)),semanticCeiling:'supported_pattern_representation_only'});}
 for(const [i,k] of arr(knowledgeContribution).entries()){if(!KNOWLEDGE.has(text(k.semanticType)))continue;const native=text(k.sourceRef)||`${text(k.semanticType)}:${i}`;const cls=KNOWLEDGE_CLASS[text(k.semanticType)]||null;out.push({contributorRef:`knowledge:${native}`,contributorType:'bounded_canonical_knowledge_meaning',nativeRef:native,status:'accepted',semanticContent:{semanticType:text(k.semanticType),primaryProfessionalMeaning:k.primaryProfessionalMeaning||null,professionalMeaning:text(k.professionalMeaning)},structuredSemanticIdentity:structuredIdentity(cls?[cls]:[],cls?'knowledge_semantic_type':'knowledge_structured_identity_unestablished'),claimShape:null,materialRefs:[],sourceRefs:unique([k.sourceRef]),professionalBasisRefs:[],semanticCeiling:{authority:text(k.semanticType),limitations:arr(k.limitations)}});}
 return freeze(selectDiversityPreservingContributors(out));
}
export default buildHigherOrderCompositionInput;

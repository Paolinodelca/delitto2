const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const unique=v=>[...new Set(arr(v).map(text).filter(Boolean))];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const ALLOWED_TYPES=new Set(['grounded_descriptive_professional_relationship','source_grounded_professional_episode_meaning','supported_pattern','bounded_canonical_knowledge_meaning']);
const COMPOSITION_CLASSES=new Set([
 'generic_descriptive_combination',
 'cross_functional_coordination',
 'people_responsibility',
 'decision_accountability',
 'quantified_outcome',
 'production_planning',
 'budget_resource',
 'process_performance_improvement',
 'decision_accountability_quantified_outcome'
]);
const CLASS_COMPATIBILITY=Object.freeze({
 cross_functional_coordination:new Set(['cross_functional_coordination']),
 people_responsibility:new Set(['people_responsibility']),
 decision_accountability:new Set(['decision_accountability']),
 quantified_outcome:new Set(['quantified_outcome']),
 production_planning:new Set(['production_planning']),
 budget_resource:new Set(['budget_resource']),
 process_performance_improvement:new Set(['process_performance_improvement']),
 decision_accountability_quantified_outcome:new Set(['decision_accountability','quantified_outcome'])
});
function structuredClasses(contributor){return new Set(arr(contributor?.structuredSemanticIdentity?.classes).map(text).filter(Boolean));}
function resolveCompositionSemanticClass(proposal){
 const value=text(proposal?.compositionSemanticClass);
 if(value&&COMPOSITION_CLASSES.has(value))return value;
 // Backward compatibility for pre-corrective controlled fixtures only.
 // This never authorises a bounded semantic theme: live/provider schema now emits an explicit class.
 return value?'__invalid__':'generic_descriptive_combination';
}
function semanticAlignment(proposal,resolved){
 const compositionClass=resolveCompositionSemanticClass(proposal);
 if(compositionClass==='__invalid__')return {compositionClass,errors:['invalid_composition_semantic_class'],states:[]};
 if(compositionClass==='generic_descriptive_combination')return {compositionClass,errors:[],states:resolved.map(c=>({contributorRef:text(c?.contributorRef||c?.nativeRef),state:'UNESTABLISHED',classes:[...structuredClasses(c)]}))};
 const allowed=CLASS_COMPATIBILITY[compositionClass]||new Set();
 const states=resolved.map(c=>{
  const classes=structuredClasses(c);
  if(!classes.size)return {contributorRef:text(c?.contributorRef||c?.nativeRef),state:'UNESTABLISHED',classes:[]};
  const compatible=[...classes].some(x=>allowed.has(x));
  return {contributorRef:text(c?.contributorRef||c?.nativeRef),state:compatible?'COMPATIBLE':'INCOMPATIBLE',classes:[...classes]};
 });
 const errors=[];
 for(const state of states)if(state.state==='INCOMPATIBLE')errors.push(`contributor_semantic_misalignment:${state.contributorRef}`);
 const compatibleCount=states.filter(x=>x.state==='COMPATIBLE').length;
 const independentlyRecurrentSupport=resolved.some((c,index)=>states[index]?.state==='COMPATIBLE'&&text(c?.contributorType)==='supported_pattern'&&text(c?.structuredSemanticIdentity?.supportStrength)==='independent_recurrence');
 if(compatibleCount<2&&!independentlyRecurrentSupport)errors.push('insufficient_structured_semantic_support_for_composition_class');
 return {compositionClass,errors,states,independentlyRecurrentSupport};
}

function duplicates(items){const c=new Map();for(const x of arr(items)){const r=text(x?.proposalRef);if(r)c.set(r,(c.get(r)||0)+1)}return new Set([...c].filter(([,n])=>n>1).map(([r])=>r));}
function contributorIndex(contributors){return new Map(arr(contributors).map(x=>[text(x.contributorRef||x.relationshipId||x.structureId),x]).filter(([k])=>k));}
function materialRefsFor(c){return unique(c?.materialRefs);}
function professionalBasesFor(c){return unique(c?.professionalBasisRefs);}
function sourcesFor(c){return unique(c?.sourceRefs);}
function validateClaimShape(p,errors){const c=p?.claimShape;if(!c||typeof c!=='object'){errors.push('missing_claim_shape');return}if(text(c.subjectScope)!=='documented_material_structure')errors.push('invalid_subject_scope');if(!['descriptive_combination','recurrence'].includes(text(c.structureClaim)))errors.push('invalid_structure_claim');if(text(c.personPropertyAssertion)!=='none')errors.push('person_property_prohibited');if(text(c.continuityAssertion)!=='none')errors.push('professional_continuity_prohibited');if(text(c.leadershipAssertion)!=='none')errors.push('leadership_strengthening_prohibited');if(text(c.ownershipAssertion)!=='none')errors.push('ownership_strengthening_prohibited');if(text(c.responsibilityAssertion)!=='none')errors.push('responsibility_strengthening_prohibited');if(text(c.generalAutonomyAssertion)!=='none')errors.push('general_autonomy_strengthening_prohibited');if(text(c.resultCausalityAssertion)!=='none')errors.push('result_causality_strengthening_prohibited');if(text(c.targetRelationAssertion)!=='none')errors.push('target_relative_claim_prohibited');}
export function validateHigherOrderStructureProposal(proposal,{contributors=[]}={}){
 const errors=[],byId=contributorIndex(contributors),refs=unique(proposal?.contributorRefs),resolved=refs.map(r=>byId.get(r)).filter(Boolean);
 if(!text(proposal?.proposalRef))errors.push('missing_proposal_ref');if(refs.length<2)errors.push('insufficient_contributors');if(resolved.length!==refs.length)errors.push('missing_or_ambiguous_contributor');
 if(resolved.some(x=>x?.status!=='accepted'||!ALLOWED_TYPES.has(text(x?.contributorType||x?.kind))))errors.push('unauthorised_contributor');
 if(!text(proposal?.structureWording)||!text(proposal?.compositionBasis))errors.push('missing_structure_meaning');
 if(text(proposal?.persistence)!=='representation_only')errors.push('invalid_persistence');if(proposal?.providerAuthority===true)errors.push('provider_self_authorisation_prohibited');
 if(arr(proposal?.targetInputs).some(Boolean))errors.push('target_relative_input_prohibited');
 validateClaimShape(proposal,errors);
 const materialRefs=unique(resolved.flatMap(materialRefsFor)),professionalBases=unique(resolved.flatMap(professionalBasesFor)),sourceRefs=unique(resolved.flatMap(sourcesFor));
 const recurrence=text(proposal?.claimShape?.structureClaim)==='recurrence';
 if(recurrence&&professionalBases.length<2)errors.push('recurrence_requires_independent_professional_bases');
 const claimedBases=unique(proposal?.independenceBasis?.professionalBasisRefs);if(recurrence&&(!claimedBases.length||claimedBases.some(x=>!professionalBases.includes(x))))errors.push('unreconstructable_independence_basis');
 const required=unique(proposal?.requiredContributorFacts);if(required.some(x=>!refs.includes(x)))errors.push('required_fact_absent_from_contributors');
 const alignment=semanticAlignment(proposal,resolved);errors.push(...alignment.errors);
 if(errors.length)return freeze({status:'rejected',proposalRef:text(proposal?.proposalRef),errors,semanticAlignment:{compositionSemanticClass:alignment.compositionClass,contributorStates:alignment.states}});
 return freeze({status:'accepted',structureId:`higherOrderStructure:${text(proposal.proposalRef)}`,kind:'higher_order_descriptive_professional_structure',contributorRefs:refs,contributorTypes:resolved.map(x=>text(x.contributorType||x.kind)),materialRefs,professionalBasisRefs:professionalBases,sourceRefs,structureWording:text(proposal.structureWording),claimShape:{...proposal.claimShape},compositionBasis:text(proposal.compositionBasis),compositionSemanticClass:alignment.compositionClass,semanticAlignment:{compositionSemanticClass:alignment.compositionClass,contributorStates:alignment.states,semanticSupportContributorRefs:alignment.states.filter(x=>x.state==='COMPATIBLE').map(x=>x.contributorRef),contextContributorRefs:alignment.states.filter(x=>x.state==='UNESTABLISHED').map(x=>x.contributorRef)},independenceBasis:{professionalBasisRefs:claimedBases.length?claimedBases:professionalBases},provenance:{contributorRefs:refs,materialRefs,professionalBasisRefs:professionalBases,sourceRefs},inheritedSemanticProtection:['pd070_representation_only','no_person_level_inference','no_semantic_strengthening','structured_contributor_semantic_alignment'],validation:{status:'accepted',authority:'deterministic'},persistent:false,personPropertyAssertion:'none'});
}
export async function runHigherOrderDescriptiveProfessionalStructureVerticalSlice({contributors=[],proposalProvider,locale='it'}={}){
 if(typeof proposalProvider!=='function')return freeze({structures:[],rejections:[],providerStatus:'not_configured'});
 const proposals=arr(await proposalProvider({contributors:freeze(arr(contributors).map(x=>({...x}))),locale}));const dup=duplicates(proposals);
 const checked=proposals.map(p=>dup.has(text(p?.proposalRef))?freeze({status:'rejected',proposalRef:text(p?.proposalRef),errors:['duplicate_proposal_ref']}):validateHigherOrderStructureProposal(p,{contributors}));
 return freeze({structures:checked.filter(x=>x.status==='accepted'),rejections:checked.filter(x=>x.status==='rejected'),providerStatus:'controlled_boundary'});
}
export default runHigherOrderDescriptiveProfessionalStructureVerticalSlice;

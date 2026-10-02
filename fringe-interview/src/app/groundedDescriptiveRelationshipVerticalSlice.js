const arr=v=>Array.isArray(v)?v:[];
const text=v=>typeof v==='string'?v.trim():'';
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const ROLES=new Set(['situation_context','activity','involved_function','work_phase','problem_object','contribution_participation']);
const SUBJECT_SCOPES=new Set(['source_material','episode','activity']);
const AGENCY_ORDER=['not_established','participated','contributed','coordinated','owned'];
const RESPONSIBILITY_ORDER=['not_established','shared_non_exclusive','exclusive_sole'];
const ASSERTION_ORDER=['none','authorised'];
function supportsForMaterial(m){return [...arr(m?.exactSupports),text(m?.summary),...arr(m?.facts),...arr(m?.sourceFaithfulExperienceExcerpts)].map(text).filter(Boolean);}
function supportEntriesForMaterial(m){const seen=new Set();const structuredByText=new Map(arr(m?.structuredSupports).map(x=>[text(x?.exactText),arr(x?.semanticClasses).map(text).filter(Boolean)]).filter(([k])=>k));return supportsForMaterial(m).filter(x=>{if(seen.has(x))return false;seen.add(x);return true;}).map((exactText,index)=>({supportRef:`${text(m?.materialRef)}:support:${index+1}`,exactText,semanticClasses:[...new Set(structuredByText.get(exactText)||[])]}));}
function duplicateProposalRefs(items=[]){const counts=new Map();for(const item of arr(items)){const ref=text(item?.provenance?.proposalRef);if(ref)counts.set(ref,(counts.get(ref)||0)+1);}return new Set([...counts].filter(([,count])=>count>1).map(([ref])=>ref));}
function rank(value,order){return order.indexOf(text(value));}
function atOrBelow(claim,ceiling,order){const c=rank(claim,order),u=rank(ceiling,order);return c>=0&&u>=0&&c<=u;}
function deriveSemanticCeiling(material={}){
 const supplied=material?.semanticCeiling||{};
 return freeze({
  subjectScopes:arr(supplied.subjectScopes).filter(x=>SUBJECT_SCOPES.has(text(x))).length?arr(supplied.subjectScopes).map(text):[text(material.episodeRef)?'episode':'source_material'],
  agencyLevel:AGENCY_ORDER.includes(text(supplied.agencyLevel))?text(supplied.agencyLevel):'not_established',
  responsibilityScope:RESPONSIBILITY_ORDER.includes(text(supplied.responsibilityScope))?text(supplied.responsibilityScope):'not_established',
  ownershipAssertion:text(supplied.ownershipAssertion)==='authorised'?'authorised':'none',
  decisionAuthorityAssertion:text(supplied.decisionAuthorityAssertion)==='authorised'?'authorised':'none',
  resultCausalityAssertion:text(supplied.resultCausalityAssertion)==='authorised'?'authorised':'none',
  personPropertyAssertion:'none'
 });
}
function validateDescriptorClaimShape(proposal,material,role,errors){
 const claim=proposal?.claimShape,ceiling=material?deriveSemanticCeiling(material):null;
 if(!claim||typeof claim!=='object'){errors.push('missing_claim_shape');return null;}
 const scope=text(claim.subjectScope),claimRole=text(claim.descriptiveRole),agency=text(claim.agencyLevel),responsibility=text(claim.responsibilityScope),ownership=text(claim.ownershipAssertion),decision=text(claim.decisionAuthorityAssertion),causality=text(claim.resultCausalityAssertion),personProperty=text(claim.personPropertyAssertion);
 if(!SUBJECT_SCOPES.has(scope)||!ceiling?.subjectScopes.includes(scope))errors.push('claim_scope_exceeds_authority');
 if(claimRole!==role||!ROLES.has(claimRole))errors.push('claim_role_mismatch');
 if(!atOrBelow(agency,ceiling?.agencyLevel,AGENCY_ORDER))errors.push('agency_exceeds_authority');
 if(!atOrBelow(responsibility,ceiling?.responsibilityScope,RESPONSIBILITY_ORDER))errors.push('responsibility_exceeds_authority');
 if(!atOrBelow(ownership,ceiling?.ownershipAssertion,ASSERTION_ORDER))errors.push('ownership_exceeds_authority');
 if(!atOrBelow(decision,ceiling?.decisionAuthorityAssertion,ASSERTION_ORDER))errors.push('decision_authority_exceeds_authority');
 if(!atOrBelow(causality,ceiling?.resultCausalityAssertion,ASSERTION_ORDER))errors.push('causality_exceeds_authority');
 if(personProperty!=='none')errors.push('person_property_prohibited');
 return ceiling;
}
export function validateDescriptorProposal(proposal,{materials=[]}={}){
 const material=arr(materials).find(x=>text(x?.materialRef)===text(proposal?.materialRef));
 const proposedExactText=text(proposal?.grounding?.exactText),supportRef=text(proposal?.grounding?.supportRef),role=text(proposal?.descriptorRole),value=text(proposal?.descriptiveValue),provenance=proposal?.provenance;
 const errors=[];
 if(!material)errors.push('unknown_material');
 if(!ROLES.has(role))errors.push('unsupported_role');
 if(!value)errors.push('missing_value');
 const supportEntry=material?supportEntriesForMaterial(material).find(x=>x.supportRef===supportRef):null;
 if(!supportRef)errors.push('missing_support_identity');
 else if(!supportEntry)errors.push('unknown_or_cross_material_support_ref');
 if(supportEntry&&proposedExactText&&proposedExactText!==supportEntry.exactText)errors.push('support_text_mismatch');
 if(!supportEntry)errors.push('unreconstructable_grounding');
 if(!text(provenance?.providerRef)||!text(provenance?.proposalRef))errors.push('insufficient_provenance');
 const semanticCeiling=validateDescriptorClaimShape(proposal,material,role,errors);
 if(text(proposal?.persistence)!=='representation_only')errors.push('invalid_persistence');
 if(errors.length)return freeze({status:'rejected',errors,proposalRef:text(provenance?.proposalRef)});
 return freeze({status:'accepted',descriptorId:`descriptor:${text(provenance.proposalRef)}`,descriptorRole:role,descriptiveValue:value,materialRef:text(material.materialRef),sourceId:text(material.sourceId),grounding:{exactText:supportEntry.exactText,supportRef:supportEntry.supportRef},episodeRef:text(material.episodeRef)||null,activityRef:text(material.activityRef)||null,semanticClasses:[...new Set(arr(supportEntry.semanticClasses).map(text).filter(Boolean))],claimShape:{...proposal.claimShape},authorisedSemanticCeiling:semanticCeiling,providerMetadata:proposal?.semanticBoundary?{semanticBoundary:{...proposal.semanticBoundary}}:null,provenance:{...provenance},extractionStatus:'accepted',persistent:false});
}
function validateRelationshipClaimShape(hypothesis,contributors,errors){
 const claim=hypothesis?.claimShape;
 if(!claim||typeof claim!=='object'){errors.push('missing_relationship_claim_shape');return;}
 if(text(claim.subjectScope)!=='material_relationship')errors.push('relationship_scope_invalid');
 if(!['descriptive_relationship','recurrence'].includes(text(claim.relationshipClaim)))errors.push('relationship_claim_invalid');
 if(claim.personPropertyAssertion!=='none')errors.push('relationship_person_property_prohibited');
 if(claim.capabilityAssertion!=='none')errors.push('relationship_capability_prohibited');
 if(claim.ownershipAssertion!=='none')errors.push('relationship_ownership_prohibited');
 if(claim.responsibilityAssertion!=='none')errors.push('relationship_responsibility_prohibited');
 if(claim.causalityAssertion!=='none')errors.push('relationship_causality_prohibited');
 if(claim.fitReadinessAssertion!=='none')errors.push('relationship_fit_readiness_prohibited');
 if(claim.sameEpisodeAssertion!=='none')errors.push('relationship_same_episode_prohibited');
 if(claim.continuityAssertion!=='none')errors.push('relationship_continuity_prohibited');
 if(text(claim.relationshipClaim)==='recurrence'&&new Set(contributors.map(x=>x.materialRef)).size<2)errors.push('recurrence_requires_independent_materials');
}
export function validateRelationshipHypothesis(hypothesis,{acceptedDescriptors=[]}={}){
 const byId=new Map(arr(acceptedDescriptors).filter(x=>x?.status==='accepted').map(x=>[x.descriptorId,x]));
 const refs=[...new Set(arr(hypothesis?.descriptorRefs).map(text).filter(Boolean))],contributors=refs.map(x=>byId.get(x)).filter(Boolean),errors=[];
 if(refs.length<2)errors.push('insufficient_contributors');
 if(contributors.length!==refs.length)errors.push('missing_or_rejected_descriptor');
 const materials=new Set(contributors.map(x=>x.materialRef));if(materials.size<2)errors.push('non_independent_materials');
 if(!text(hypothesis?.relationshipWording)||!text(hypothesis?.relationshipBasis))errors.push('missing_relationship_meaning');
 if(!text(hypothesis?.provenance?.providerRef)||!text(hypothesis?.provenance?.proposalRef))errors.push('insufficient_provenance');
 validateRelationshipClaimShape(hypothesis,contributors,errors);
 if(text(hypothesis?.persistence)!=='representation_only')errors.push('invalid_persistence');
 if(errors.length)return freeze({status:'rejected',errors,proposalRef:text(hypothesis?.provenance?.proposalRef)});
 const semanticClassSupport=new Map();for(const contributor of contributors)for(const semanticClass of arr(contributor?.semanticClasses).map(text).filter(Boolean)){if(!semanticClassSupport.has(semanticClass))semanticClassSupport.set(semanticClass,new Set());semanticClassSupport.get(semanticClass).add(text(contributor.materialRef));}
 const semanticClasses=[...semanticClassSupport.entries()].filter(([,materialSet])=>materialSet.size>=2).map(([semanticClass])=>semanticClass).sort();
 return freeze({status:'accepted',relationshipId:`groundedRelationship:${text(hypothesis.provenance.proposalRef)}`,kind:'grounded_descriptive_professional_relationship',relationshipWording:text(hypothesis.relationshipWording),relationshipBasis:text(hypothesis.relationshipBasis),descriptorRefs:refs,materialRefs:[...materials],sourceRefs:[...new Set(contributors.map(x=>x.sourceId).filter(Boolean))],semanticClasses,semanticClassBasis:semanticClasses.length?'accepted_descriptor_grounding_semantics_across_independent_materials':'unestablished',descriptorValues:contributors.map(x=>({descriptorId:x.descriptorId,descriptorRole:x.descriptorRole,descriptiveValue:x.descriptiveValue,semanticClasses:[...new Set(arr(x.semanticClasses).map(text).filter(Boolean))]})),support:contributors.map(x=>({descriptorId:x.descriptorId,materialRef:x.materialRef,sourceId:x.sourceId,grounding:x.grounding,semanticClasses:[...new Set(arr(x.semanticClasses).map(text).filter(Boolean))]})),claimShape:{...hypothesis.claimShape},providerMetadata:hypothesis?.semanticBoundary?{semanticBoundary:{...hypothesis.semanticBoundary}}:null,provenance:{...hypothesis.provenance},admissibilityStatus:'accepted',persistent:false});
}
export async function runGroundedDescriptiveRelationshipVerticalSlice({materials=[],descriptorProposalProvider,relationshipHypothesisProvider,locale='it'}={}){
 if(typeof descriptorProposalProvider!=='function'||typeof relationshipHypothesisProvider!=='function')return freeze({descriptors:[],descriptorRejections:[],relationships:[],relationshipRejections:[],providerStatus:'not_configured'});
 const proposals=arr(await descriptorProposalProvider({materials:freeze(materials.map(x=>({...x}))),locale}));
 const duplicateDescriptorRefs=duplicateProposalRefs(proposals);
 const checked=proposals.map(p=>duplicateDescriptorRefs.has(text(p?.provenance?.proposalRef))?freeze({status:'rejected',errors:['duplicate_descriptor_proposal_ref'],proposalRef:text(p?.provenance?.proposalRef)}):validateDescriptorProposal(p,{materials}));const descriptors=checked.filter(x=>x.status==='accepted'),descriptorRejections=checked.filter(x=>x.status==='rejected');
 const hypotheses=arr(await relationshipHypothesisProvider({descriptors,materials:freeze(materials.map(x=>({...x}))),locale}));
 const duplicateRelationshipRefs=duplicateProposalRefs(hypotheses);
 const related=hypotheses.map(h=>duplicateRelationshipRefs.has(text(h?.provenance?.proposalRef))?freeze({status:'rejected',errors:['duplicate_relationship_proposal_ref'],proposalRef:text(h?.provenance?.proposalRef)}):validateRelationshipHypothesis(h,{acceptedDescriptors:descriptors}));
 return freeze({descriptors,descriptorRejections,relationships:related.filter(x=>x.status==='accepted'),relationshipRejections:related.filter(x=>x.status==='rejected'),providerStatus:'controlled_boundary'});
}
export default runGroundedDescriptiveRelationshipVerticalSlice;

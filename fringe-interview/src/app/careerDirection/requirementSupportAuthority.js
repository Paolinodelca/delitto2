const arr=v=>Array.isArray(v)?v:[];
const text=v=>typeof v==='string'?v.trim():'';
const unique=v=>[...new Set(arr(v).map(text).filter(Boolean))];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const AGENCY=['not_established','participated','contributed','coordinated','owned'];
function rank(v){return AGENCY.indexOf(text(v));}
function descriptorIndex(pm){return new Map(arr(pm?.groundedDescriptiveDescriptors).filter(x=>x?.status==='accepted').map(x=>[text(x.descriptorId),x]));}
function relationshipIndex(pm){return new Map(arr(pm?.groundedDescriptiveRelationships).filter(x=>x?.status==='accepted').map(x=>[text(x.relationshipId),x]));}
export function buildCareerDirectionRequirementSupportContributorInventory(pm={}){
 const out=[];
 arr(pm.supportedPatterns).forEach((p,i)=>out.push({contributorType:'supported_pattern',contributorRef:`pattern:${text(p.kind)}:${i}`,value:p,professionalBasisRefs:unique(p.episodeRefs),materialRefs:unique(p.sourceRefs),sourceRefs:unique(p.sourceRefs),semanticProtection:['existing_pattern_authority']}));
 arr(pm.knowledgeContribution).forEach((k,i)=>out.push({contributorType:'bounded_canonical_knowledge_meaning',contributorRef:text(k?.sourceRef)||`knowledge:${i}`,value:k,professionalBasisRefs:unique([k?.sourceRef]),materialRefs:unique([k?.sourceRef]),sourceRefs:unique([k?.lineage?.sourceEvidenceRef,k?.sourceRef]),semanticProtection:unique(k?.limitations)}));
 arr(pm.groundedDescriptiveRelationships).filter(x=>x?.status==='accepted').forEach(r=>out.push({contributorType:'grounded_descriptive_professional_relationship',contributorRef:text(r.relationshipId),value:r,professionalBasisRefs:[],materialRefs:unique(r.materialRefs),sourceRefs:unique(r.sourceRefs),semanticProtection:['pd069_representation_only','no_person_level_inference','no_semantic_strengthening']}));
 arr(pm.higherOrderDescriptiveProfessionalStructures).filter(x=>x?.status==='accepted').forEach(h=>out.push({contributorType:'higher_order_descriptive_professional_structure',contributorRef:text(h.structureId),value:h,professionalBasisRefs:unique(h.professionalBasisRefs),materialRefs:unique(h.materialRefs),sourceRefs:unique(h.sourceRefs),semanticProtection:unique(h.inheritedSemanticProtection)}));
 return out;
}
function coordinationAuthorised(c,pm){
 const descriptors=descriptorIndex(pm),relationships=relationshipIndex(pm);
 const descriptorSupports=r=>unique(r?.descriptorRefs).map(x=>descriptors.get(x)).filter(Boolean).some(d=>['activity','involved_function'].includes(text(d.descriptorRole))&&rank(d?.claimShape?.agencyLevel)>=rank('coordinated'));
 if(c.contributorType==='grounded_descriptive_professional_relationship')return descriptorSupports(c.value);
 if(c.contributorType==='higher_order_descriptive_professional_structure')return unique(c.value?.contributorRefs).map(x=>relationships.get(x)).filter(Boolean).some(descriptorSupports);
 return false;
}
function semanticCompatibility(c,req,pm){
 if(req?.semanticKey==='cross_functional_coordination'&&['grounded_descriptive_professional_relationship','higher_order_descriptive_professional_structure'].includes(c.contributorType))return coordinationAuthorised(c,pm);
 return false;
}
function robustness(c){
 if(c.contributorType==='higher_order_descriptive_professional_structure'&&unique(c.professionalBasisRefs).length>=2)return 'COMPOSED_HIGHER_ORDER_BASIS';
 if(c.contributorType==='supported_pattern'&&unique(c.professionalBasisRefs).length>=2)return 'INDEPENDENT_RECURRENT_BASIS';
 return 'SINGLE_GROUNDED_BASIS';
}
export function validateCareerDirectionRequirementSupportProposal(proposal,{professionalMeaning={},role}={}){
 const contributors=buildCareerDirectionRequirementSupportContributorInventory(professionalMeaning),c=contributors.find(x=>x.contributorType===text(proposal?.contributorType)&&x.contributorRef===text(proposal?.contributorRef));
 const req=arr(role?.requirements).find(x=>x.id===text(proposal?.targetRequirementRef));const errors=[];
 if(!c)errors.push('unknown_or_unauthorised_contributor');
 if(!req||!req.material)errors.push('unknown_or_nonmaterial_target_requirement');
 if(text(proposal?.targetDirectionRef)!==text(role?.id))errors.push('target_direction_mismatch');
 if(!text(proposal?.relationBasis))errors.push('missing_relation_basis');
 if(!text(proposal?.provenance?.providerRef)||!text(proposal?.provenance?.proposalRef))errors.push('insufficient_proposal_provenance');
 if(c&&req&&!semanticCompatibility(c,req,professionalMeaning))errors.push('semantic_ceiling_or_requirement_relevance_not_authorised');
 if(proposal?.acceptanceState==='accepted'||proposal?.providerAuthority===true)errors.push('provider_self_authorisation_prohibited');
 if(errors.length)return freeze({status:'rejected',errors,proposalRef:text(proposal?.provenance?.proposalRef)});
 return freeze({status:'accepted',relationId:`careerDirectionRequirementSupport:${text(role.id)}:${text(req.id)}:${text(c.contributorRef)}`,targetDirectionRef:text(role.id),targetRequirementRef:text(req.id),targetRequirementSemanticKey:text(req.semanticKey),contributorType:c.contributorType,contributorRef:c.contributorRef,professionalBasisRefs:unique(c.professionalBasisRefs),materialRefs:unique(c.materialRefs),sourceRefs:unique(c.sourceRefs),relationBasis:text(proposal.relationBasis),semanticProtection:unique([...c.semanticProtection,'target_relative_only','no_person_truth_writeback','no_semantic_strengthening']),acceptanceState:'accepted',derivedTargetRelative:true,persistent:false,provenance:{proposal:{...proposal.provenance},contributorRef:c.contributorRef,targetRequirementRef:req.id},robustnessClass:robustness(c)});
}
export function buildCareerDirectionRequirementSupportProjection({professionalMeaning={},role,proposals=[]}={}){
 const checked=arr(proposals).filter(p=>text(p?.targetDirectionRef)===text(role?.id)).map(p=>validateCareerDirectionRequirementSupportProposal(p,{professionalMeaning,role}));
 const accepted=checked.filter(x=>x.status==='accepted'),rejected=checked.filter(x=>x.status==='rejected');
 const byReq=new Map();for(const r of accepted){const a=byReq.get(r.targetRequirementRef)||[];a.push(r);byReq.set(r.targetRequirementRef,a)}
 const aggregates=[...byReq.entries()].map(([targetRequirementRef,relations])=>{const order={SINGLE_GROUNDED_BASIS:1,INDEPENDENT_RECURRENT_BASIS:2,COMPOSED_HIGHER_ORDER_BASIS:3};const strongest=[...relations].sort((a,b)=>order[b.robustnessClass]-order[a.robustnessClass])[0];return freeze({targetRequirementRef,supported:true,acceptedContributorRefs:relations.map(x=>x.contributorRef),acceptedContributorTypes:relations.map(x=>x.contributorType),professionalBasisRefs:unique(relations.flatMap(x=>x.professionalBasisRefs)),materialRefs:unique(relations.flatMap(x=>x.materialRefs)),sourceRefs:unique(relations.flatMap(x=>x.sourceRefs)),robustnessClass:strongest.robustnessClass,relations});});
 return freeze({relations:accepted,rejections:rejected,aggregates});
}
export function buildRequirementSupportDiagnostic(projection){return freeze({requirements:arr(projection?.aggregates).map(x=>({targetRequirementRef:x.targetRequirementRef,acceptedContributorRefs:[...x.acceptedContributorRefs],acceptedContributorTypes:[...x.acceptedContributorTypes],professionalBasisRefs:[...x.professionalBasisRefs],robustnessClass:x.robustnessClass,semanticCeilingsPreserved:x.relations.every(r=>r.semanticProtection.includes('no_semantic_strengthening'))}))});}

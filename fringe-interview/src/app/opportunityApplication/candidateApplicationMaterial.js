import { unknownPresentationLanguageBasis } from './presentationLanguageBasis.js';
import { createHash } from 'node:crypto';
const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const id=v=>`applicationMaterial:${createHash('sha256').update(String(v)).digest('hex').slice(0,20)}`;
const latestRepresentation=identity=>{const s=arr(identity?.representationSnapshots).filter(x=>x?.representation?.type==='target_independent_professional_representation');return s.length?s[s.length-1].representation:null};
const protection=(state,dimensions=[],provenance=[])=>freeze({state,dimensions:freeze(dimensions),protectionProvenance:freeze(provenance)});
function episodeProtection(e){
 const dimensions=[];
 if(text(e?.participation))dimensions.push(freeze({dimension:'agency',value:text(e.participation)}));
 if(e?.responsibilityScope?.state)dimensions.push(freeze({dimension:'responsibility_scope',value:text(e.responsibilityScope.state),referentId:text(e.responsibilityScope?.referent?.id)}));
 const limitations=arr(e?.limitations);
 if(limitations.includes('participation_not_ownership_or_management'))dimensions.push(freeze({dimension:'epistemic',value:'episode_fact_not_person_capability'}));
 if(limitations.includes('objective_or_support_not_outcome'))dimensions.push(freeze({dimension:'result_attribution',value:'objective_or_support_not_candidate_outcome'}));
 if(limitations.includes('supporting_analysis_not_investment_authority'))dimensions.push(freeze({dimension:'responsibility_scope',value:'support_not_investment_authority'}));
 return protection(dimensions.length?'established':'no_additional_protection_needed',dimensions,[text(e?.episodeMeaningId),...arr(e?.support).map(x=>text(x?.evidenceRef)).filter(Boolean)]);
}
export function buildCandidateApplicationMaterials({professionalIdentity}={}){
 const rep=latestRepresentation(professionalIdentity),out=[];
 for(const r of arr(rep?.roleHistory)){
  if(!text(r?.role))continue;
  out.push(freeze({id:id(`role|${r.sourceId}|${r.role}|${r.status}`),type:'candidate_application_material_item',materialKind:'professional_role',experienceAssociation:freeze({sourceId:text(r.sourceId),role:text(r.role),status:text(r.status)}),authorisedPayload:freeze({role:text(r.role),status:text(r.status)}),sourceRef:text(r.sourceId),provenance:freeze({authority:'target_independent_professional_representation.roleHistory'}),semanticProtection:protection('no_additional_protection_needed',[],['target_independent_professional_representation.roleHistory']),sameLanguageDocumentEligibility:'eligible',presentationLanguageBasis:unknownPresentationLanguageBasis(),languageTransformationEligibility:'eligible'}));
 }
 for(const e of arr(rep?.episodeMeanings)){
  if(!text(e?.episodeMeaningId)||!text(e?.description))continue;
  const p=episodeProtection(e);
  out.push(freeze({id:id(`episode|${e.episodeMeaningId}`),type:'candidate_application_material_item',materialKind:'source_grounded_episode_meaning',experienceAssociation:freeze({sourceId:text(e.sourceId),role:null,status:null}),authorisedPayload:freeze({description:text(e.description),participation:text(e.participation),activity:text(e.activity),object:text(e.object),professionalContext:text(e.professionalContext),responsibilityScope:e.responsibilityScope||null,limitations:freeze(arr(e.limitations))}),sourceRef:text(e.sourceId),provenance:freeze({authority:'source_grounded_professional_episode_meaning',episodeMeaningRef:text(e.episodeMeaningId),supportRefs:freeze(arr(e.support).map(x=>text(x?.evidenceRef)).filter(Boolean))}),semanticProtection:p,sameLanguageDocumentEligibility:'eligible',presentationLanguageBasis:unknownPresentationLanguageBasis(),languageTransformationEligibility:p.state==='insufficiently_established'?'not_eligible':'eligible'}));
 }
 for(const k of arr(rep?.professionalMeaning?.knowledgeContribution)){
  if(text(k?.semanticType)!=='quantified_outcome')continue;
  const q=k?.authorisedSemanticPayload;
  const value=q?.quantitativeValue;
  if(!q||!text(q.measurableOutcome)||typeof value?.value!=='number'||!text(value?.unit)||!text(q.contributionRelationship)||!['contribution_only','sole_causality_established'].includes(text(q.causalityBoundary)))continue;
  const dimensions=[freeze({dimension:'agency',value:text(q.contributionRelationship)}),freeze({dimension:'result_attribution',value:text(q.causalityBoundary)})];
  if(value.approximate===true)dimensions.push(freeze({dimension:'epistemic',value:'approximate_quantitative_value'}));
  const refs=[text(q.sourceRef),text(q.observationId),...arr(q.evidenceIds).map(text)].filter(Boolean);
  out.push(freeze({id:id(`quantified_outcome|${refs.join('|')}|${q.measurableOutcome}|${value.value}|${value.unit}|${q.contributionRelationship}|${q.causalityBoundary}`),type:'candidate_application_material_item',materialKind:'canonical_quantified_outcome',experienceAssociation:null,authorisedPayload:freeze({representationText:text(k.professionalMeaning),measurableOutcome:text(q.measurableOutcome),quantitativeValue:freeze({...value}),context:freeze({...q.context}),contributionRelationship:text(q.contributionRelationship),causalityBoundary:text(q.causalityBoundary),limitations:freeze(arr(q.limitations))}),sourceRef:text(q.sourceRef),provenance:freeze({authority:'professional_semantic_policy:quantified_outcome:v1',representationAuthority:'target_independent_professional_representation.professionalMeaning.knowledgeContribution',observationRef:text(q.observationId),evidenceRefs:freeze(arr(q.evidenceIds).map(text).filter(Boolean))}),semanticProtection:protection('established',dimensions,refs),sameLanguageDocumentEligibility:'eligible',presentationLanguageBasis:unknownPresentationLanguageBasis(),languageTransformationEligibility:'eligible'}));
 }
 const representedSources=new Set(out.map(x=>x.sourceRef).filter(Boolean));
 for(const s of arr(professionalIdentity?.professionalSources)){
  if(!['current_cv','previous_cv','professional_declaration'].includes(text(s?.sourceRole))||!text(s?.content))continue;
  out.push(freeze({id:id(`raw|${s.id}|${s.content}`),type:'candidate_application_material_item',materialKind:'raw_legacy_source',experienceAssociation:null,authorisedPayload:freeze({sourceText:text(s.content)}),sourceRef:text(s.id),provenance:freeze({authority:'professional_source',representedByStructuredMaterial:representedSources.has(text(s.id))}),semanticProtection:protection('insufficiently_established',[],[]),sameLanguageDocumentEligibility:'bounded_verbatim_only',presentationLanguageBasis:unknownPresentationLanguageBasis({reason:'legacy_raw_material'}),languageTransformationEligibility:'not_eligible'}));
 }
 return freeze(out);
}
export function applicationMaterialDiagnostics(items=[]){return freeze(arr(items).map(x=>freeze({id:x.id,materialKind:x.materialKind,sourceRef:x.sourceRef,applicationEligibility:x.sameLanguageDocumentEligibility,presentationLanguageBasis:x.presentationLanguageBasis,pd064State:x.semanticProtection?.state,protectionProvenance:freeze(arr(x.semanticProtection?.protectionProvenance)),languageTransformationEligibility:x.languageTransformationEligibility})));}

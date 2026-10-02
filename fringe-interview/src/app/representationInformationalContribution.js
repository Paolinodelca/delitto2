const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const forbidden=['importance','importanceScore','salience','salienceScore','prestige','strength','seniorityWeight','capability','fit','readiness'];
const stableKey=v=>text(v).toLocaleLowerCase().replace(/\s+/g,' ');
function unit({id,kind,label,supportRefs=[]}){return freeze({unitId:id,kind,label,supportRefs:arr(supportRefs).map(text).filter(Boolean)});}
export function buildEpisodeMeaningInformationalUnits(meaning={}){
 const id=text(meaning.episodeMeaningId),refs=arr(meaning.support).map(x=>text(x?.evidenceRef)).filter(Boolean);if(!id)return freeze([]);
 const out=[];
 if(text(meaning.activity))out.push(unit({id:`${id}:activity`,kind:'activity_context',label:text(meaning.activity),supportRefs:refs}));
 if(text(meaning.object))out.push(unit({id:`${id}:object`,kind:'professional_object',label:text(meaning.object),supportRefs:refs}));
 for(const phase of arr(meaning.phases).map(text).filter(Boolean))out.push(unit({id:`${id}:phase:${stableKey(phase)}`,kind:'professional_phase',label:phase,supportRefs:refs}));
 if(text(meaning.temporalContext))out.push(unit({id:`${id}:temporal`,kind:'temporal_context',label:text(meaning.temporalContext),supportRefs:refs}));
 if(text(meaning.professionalContext))out.push(unit({id:`${id}:context`,kind:'professional_context',label:text(meaning.professionalContext),supportRefs:refs}));
 if(text(meaning.participation))out.push(unit({id:`${id}:participation`,kind:'participation_boundary',label:text(meaning.participation),supportRefs:refs}));
 return freeze(out);
}
function representedByPattern(meaning,patterns){
 const description=stableKey(meaning?.description),activity=stableKey(meaning?.activity),context=stableKey(meaning?.professionalContext);
 return arr(patterns).some(p=>p?.kind==='documented_cross_functional_coordination_recurrence'&&arr(p.supports).some(s=>{const excerpt=stableKey(s?.supportExcerpt);return excerpt&&(description.includes(excerpt)||excerpt.includes('engineering')&&description.includes('engineering')||activity.includes('cross-functional')||context.includes('cross-functional'));}));
}
export function deriveRepresentationInformationalContribution({episodeMeaning,professionalMeaning}={}){
 for(const key of forbidden)if(episodeMeaning?.[key]!=null)throw new Error('REPRESENTATION_CONTRIBUTION_FORBIDDEN_EVALUATIVE_INPUT');
 const units=buildEpisodeMeaningInformationalUnits(episodeMeaning),crossFunctionalRepresented=representedByPattern(episodeMeaning,professionalMeaning?.supportedPatterns);
 const relations=units.map(u=>{
  const collaborationLike=u.kind==='professional_context'&&/cross[- ]functional|engineering|production|quality|system|verification/i.test(u.label);
  const status=crossFunctionalRepresented&&collaborationLike?'supporting_already_represented':'adds_distinct_supported_information';
  return freeze({unitRef:u.unitId,status,basis:status==='supporting_already_represented'?'authorised_pattern_materially_expresses_cross_functional_aspect':'source_grounded_unit_not_materially_expressed_by_current_composition'});
 });
 const distinct=relations.filter(r=>r.status==='adds_distinct_supported_information').map(r=>r.unitRef);
 return freeze({type:'representation_informational_contribution',version:'1.0',episodeMeaningRef:text(episodeMeaning?.episodeMeaningId),representationRelative:true,persistent:false,relations,distinctUnitRefs:distinct,semanticallyExhausted:units.length>0&&distinct.length===0,limitations:['composition_relation_not_person_evaluation','non_foregrounding_has_no_negative_person_meaning']});
}
export function deriveRepresentationInformationalContributions({episodeMeanings=[],professionalMeaning}={}){return freeze(arr(episodeMeanings).map(x=>deriveRepresentationInformationalContribution({episodeMeaning:x,professionalMeaning})).filter(x=>x.distinctUnitRefs.length));}
export default deriveRepresentationInformationalContributions;

const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const freeze=v=>Object.freeze(clone(v));
const assert=(c,m)=>{if(!c)throw new Error(m);};

export const PROFESSIONAL_MATERIAL_RELEVANCE_PURPOSES=Object.freeze(['professional_direction_explore']);
export const PROFESSIONAL_MATERIAL_RELEVANCE_TYPES=Object.freeze(['supported_relevance']);

export function createProfessionalMaterialRelevanceRelation(x={}){
 assert(text(x.id),'PROFESSIONAL_MATERIAL_RELEVANCE_ID_REQUIRED');
 assert(PROFESSIONAL_MATERIAL_RELEVANCE_PURPOSES.includes(x.purpose),'PROFESSIONAL_MATERIAL_RELEVANCE_PURPOSE_INVALID');
 assert(text(x.personMaterialRef)&&text(x.contextRef)&&text(x.externalRequirementRef),'PROFESSIONAL_MATERIAL_RELEVANCE_REFS_REQUIRED');
 assert(PROFESSIONAL_MATERIAL_RELEVANCE_TYPES.includes(x.relationType),'PROFESSIONAL_MATERIAL_RELEVANCE_TYPE_INVALID');
 assert(text(x.explanationBasis),'PROFESSIONAL_MATERIAL_RELEVANCE_EXPLANATION_REQUIRED');
 assert(x.provenance&&x.provenance.personSupport!=null&&arr(x.provenance.externalSupport).length,'PROFESSIONAL_MATERIAL_RELEVANCE_PROVENANCE_REQUIRED');
 for(const forbidden of ['fitScore','readinessScore','capabilityScore','matchScore','recommendedRank'])assert(!(forbidden in x),'PROFESSIONAL_MATERIAL_RELEVANCE_SCORE_FORBIDDEN');
 return freeze({type:'professional_material_relevance_relation',...x,limitations:arr(x.limitations),metadata:x.metadata||{}});
}

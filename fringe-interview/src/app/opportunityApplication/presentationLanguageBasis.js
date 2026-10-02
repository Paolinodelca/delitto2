const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const supported=new Set(['it','en']);
export function unknownPresentationLanguageBasis({reason='not_established'}={}){
 return freeze({state:'unknown',language:null,establishedBy:null,provenance:freeze({reason:text(reason)||'not_established'})});
}
export function establishedPresentationLanguageBasis({language,establishedBy,provenance={}}={}){
 const l=text(language).toLowerCase(),by=text(establishedBy);
 if(!supported.has(l)||!by)throw new Error('presentation_language_basis_not_established');
 return freeze({state:'established',language:l,establishedBy:by,provenance:freeze({...provenance})});
}
export function normalizePresentationLanguageBasis(value){
 if(value?.state==='established'&&supported.has(text(value.language).toLowerCase())&&text(value.establishedBy))return establishedPresentationLanguageBasis({language:value.language,establishedBy:value.establishedBy,provenance:value.provenance||{}});
 return unknownPresentationLanguageBasis({reason:value?'invalid_or_incomplete_basis':'legacy_missing_basis'});
}
export function establishApplicationMaterialPresentationLanguage(material,{language,authority,provenance={}}={}){
 if(!material?.id)throw new Error('candidate_application_material_identity_required');
 return freeze({...material,presentationLanguageBasis:establishedPresentationLanguageBasis({language,establishedBy:text(authority),provenance:{...provenance,materialRef:material.id}})});
}
export function deriveValidatedPresentationRealization({material,language,validationStatus,transformedText,materializationRef}={}){
 if(!material?.id)throw new Error('candidate_application_material_identity_required');
 if(text(validationStatus)!=='VALID')return freeze({materialRef:material.id,language:text(language).toLowerCase(),status:text(validationStatus)||'UNSUPPORTED',presentationLanguageBasis:unknownPresentationLanguageBasis({reason:'cq05_not_valid'})});
 const l=text(language).toLowerCase(); if(!supported.has(l)||!text(transformedText)||!text(materializationRef))throw new Error('validated_presentation_realization_incomplete');
 return freeze({materialRef:material.id,language:l,status:'VALID',transformedText:text(transformedText),materializationRef:text(materializationRef),presentationLanguageBasis:establishedPresentationLanguageBasis({language:l,establishedBy:'cq05_validated_materialization',provenance:{materialRef:material.id,materializationRef:text(materializationRef)}})});
}
export function isDirectlyUsableInLanguage(material,language){const b=normalizePresentationLanguageBasis(material?.presentationLanguageBasis);return material?.sameLanguageDocumentEligibility==='eligible'&&b.state==='established'&&b.language===text(language).toLowerCase();}

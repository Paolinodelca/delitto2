export const PRIVATE_BETA_PRODUCT_PURPOSES=Object.freeze({
 BUILD_ENRICH:'professional_identity_build_enrich',
 UNDERSTAND:'professional_representation_understand',
 OPPORTUNITY_APPLICATION:'opportunity_application',
 DIRECTION_EXPLORE:'professional_direction_explore',
 INTERVIEW_PRACTICE:'interview_practice'
});
const allowed=new Set(Object.values(PRIVATE_BETA_PRODUCT_PURPOSES));
export function normalizePrivateBetaProductPurpose(value,{hasExistingIdentity=false}={}){
 const v=typeof value==='string'?value.trim():'';
 if(v&&allowed.has(v))return v;
 return PRIVATE_BETA_PRODUCT_PURPOSES.INTERVIEW_PRACTICE;
}
export function assertPrivateBetaProductPurpose(value){if(!allowed.has(value))throw new Error('PRIVATE_BETA_PRODUCT_PURPOSE_INVALID');return value;}

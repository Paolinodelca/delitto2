import { PRIVATE_BETA_PRODUCT_PURPOSES } from './privateBetaProductPurpose.js';

export const INTERVIEW_ANSWER_AUTHORITIES=Object.freeze({
 TRAINING:'training',
 ACQUISITION:'acquisition',
 UNKNOWN:'unknown'
});

export function resolveInterviewAnswerAuthority(productPurpose){
 if(productPurpose===PRIVATE_BETA_PRODUCT_PURPOSES.INTERVIEW_PRACTICE)return INTERVIEW_ANSWER_AUTHORITIES.TRAINING;
 if(productPurpose===PRIVATE_BETA_PRODUCT_PURPOSES.BUILD_ENRICH)return INTERVIEW_ANSWER_AUTHORITIES.ACQUISITION;
 return INTERVIEW_ANSWER_AUTHORITIES.UNKNOWN;
}

export function mayWriteAcceptedAnswerEvidence(productPurpose){
 return resolveInterviewAnswerAuthority(productPurpose)===INTERVIEW_ANSWER_AUTHORITIES.ACQUISITION;
}

export function assertAcceptedAnswerEvidenceAuthority(productPurpose){
 if(!mayWriteAcceptedAnswerEvidence(productPurpose)){
  const error=new Error('ACCEPTED_RUNTIME_ANSWER_EVIDENCE_AUTHORITY_NOT_ESTABLISHED');
  error.code='ACCEPTED_RUNTIME_ANSWER_EVIDENCE_AUTHORITY_NOT_ESTABLISHED';
  throw error;
 }
 return true;
}

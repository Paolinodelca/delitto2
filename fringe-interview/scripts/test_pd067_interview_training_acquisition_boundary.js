import assert from 'node:assert/strict';
import {PRIVATE_BETA_PRODUCT_PURPOSES as P} from '../src/app/privateBetaProductPurpose.js';
import {buildAcceptedRuntimeAnswerEvidenceStore} from '../src/app/registerAcceptedRuntimeAnswerEvidence.js';
import {resolveInterviewAnswerAuthority,mayWriteAcceptedAnswerEvidence,assertAcceptedAnswerEvidenceAuthority,INTERVIEW_ANSWER_AUTHORITIES as A} from '../src/app/interviewTrainingAcquisitionBoundary.js';
assert.equal(resolveInterviewAnswerAuthority(P.INTERVIEW_PRACTICE),A.TRAINING);
assert.equal(mayWriteAcceptedAnswerEvidence(P.INTERVIEW_PRACTICE),false);
assert.equal(resolveInterviewAnswerAuthority(P.BUILD_ENRICH),A.ACQUISITION);
assert.equal(mayWriteAcceptedAnswerEvidence(P.BUILD_ENRICH),true);
assert.equal(resolveInterviewAnswerAuthority(undefined),A.UNKNOWN);
assert.equal(mayWriteAcceptedAnswerEvidence(undefined),false);
assert.throws(()=>assertAcceptedAnswerEvidenceAuthority(P.INTERVIEW_PRACTICE),e=>e.code==='ACCEPTED_RUNTIME_ANSWER_EVIDENCE_AUTHORITY_NOT_ESTABLISHED');
assert.equal(assertAcceptedAnswerEvidenceAuthority(P.BUILD_ENRICH),true);
assert.equal(mayWriteAcceptedAnswerEvidence('Allenami per un colloquio'),false);
assert.equal(mayWriteAcceptedAnswerEvidence('Practice interview'),false);
// Legitimate acquisition remains intact once structured acquisition authority is established.
assertAcceptedAnswerEvidenceAuthority(P.BUILD_ENRICH);
const acquisition=buildAcceptedRuntimeAnswerEvidenceStore({betaSessionId:'pd067-build',interviewSessionId:'pd067-build',answers:[{answerText:'Nel mio ruolo coordinavo 12 persone.',questionContext:{questionKey:'people_scope'},stepType:'answer',phaseName:'acquisition',timestamp:'2026-09-21T13:00:00.000Z'}]});
assert.equal(acquisition.evidence.length,1);
console.log('PD-067 structured training/acquisition authority tests passed.');

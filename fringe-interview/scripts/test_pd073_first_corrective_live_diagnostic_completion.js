import assert from 'node:assert/strict';
import {evaluateCareerDirections} from '../src/app/careerDirection/evaluateCareerDirections.js';
import {startDirectionPeopleResponsibilityProductionAcquisition,answerDirectionPeopleResponsibilityProductionAcquisition} from '../src/app/careerDirection/directionKnowledgeAcquisition.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
const now='2026-09-28T14:00:00.000Z',subjectRef={type:'person',id:'marco'};
const rep={professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence'}],professionalSynthesis:{hasDocumentedRoleContinuity:true,currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['production']},knowledgeContribution:[{primaryProfessionalMeaning:{kind:'bounded_decision_accountability'}},{primaryProfessionalMeaning:{kind:'bounded_measurable_outcome_contribution'}}]}};
const evaluation=evaluateCareerDirections({professionalRepresentation:rep,professionalRepresentationRef:'professionalRepresentation:marco',now}),ops=evaluation.hypotheses.find(x=>x.metadata.roleFamilyRef==='operations_management');
const identity={type:'private_beta_professional_identity_continuity',personRef:subjectRef,professionalSources:[{id:'source:cv',sourceRole:'current_cv',content:'Responsabile continuativamente di 5 persone in officina; assegno attività e priorità.'}],reusableKnowledgeResults:[]};
// A/B: question preparation is deterministic and provider-free even when reusable source material exists.
let providerCalls=0;
const started=Date.now();
let state=await startDirectionPeopleResponsibilityProductionAcquisition({careerDirectionEvaluation:evaluation,selectedDirectionRef:ops.id,userAction:'deepen_career_direction',professionalIdentity:identity,subjectRef,professionalRepresentationRef:'professionalRepresentation:marco',now,semanticExecutor:async()=>{providerCalls++;throw new Error('MUST_NOT_RUN_BEFORE_QUESTION')}});
assert.equal(state.status,'awaiting_answer');assert.equal(state.questionRequired,true);assert.equal(providerCalls,0);assert.equal(state.operatorDiagnostic.providerCallBeforeQuestion,false);assert(Date.now()-started<1000);
// G: retry context visibly preserves the exact current question + technical error + both controls.
const providerDiagnostic={failureKind:'rate_limit',status:429,providerCode:'rate_limit_exceeded',providerType:'tokens',model:'openai/gpt-oss-120b',outputMode:'json_schema',structuredOutput:true,elapsedMs:1234};
const failed=await answerDirectionPeopleResponsibilityProductionAcquisition({state,answer:'Ho gestito continuativamente circa 5 persone di officina, assegnando le attività e definendo le priorità di lavoro.',careerDirectionEvaluation:evaluation,subjectRef,now,semanticExecutor:async()=>{throw Object.assign(new Error('provider failure'),{providerDiagnostic})}});
assert.equal(failed.status,'awaiting_answer');assert.equal(failed.result.personKnowledgeMatrix,null);
assert.equal(failed.operationalFailure.providerDiagnostic.failureKind,'rate_limit');
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_acquisition',sessionRef:'direction:pd073fc',directionAcquisition:failed}});
assert(html.includes('direction-acquisition-retry-context'));
assert(html.includes('hai una responsabilità continuativa o ricorrente su persone?'));
assert(html.includes('Non sono riuscito a interpretare la risposta per un problema tecnico.'));
assert(html.includes('Invia risposta'));assert(html.includes('Preferisco fermarmi qui'));
// D/F: non-authorized provider failure remains operational and creates no Knowledge.
assert(!failed.knowledgeResult);assert.equal(providerCalls,0);
console.log('PD-073 first corrective latency/diagnostic/retry-context tests passed.');

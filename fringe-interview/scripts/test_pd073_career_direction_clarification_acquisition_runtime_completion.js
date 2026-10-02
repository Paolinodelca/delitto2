import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {evaluateCareerDirections} from '../src/app/careerDirection/evaluateCareerDirections.js';
import {startDirectionPeopleResponsibilityProductionAcquisition,answerDirectionPeopleResponsibilityProductionAcquisition} from '../src/app/careerDirection/directionKnowledgeAcquisition.js';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {buildGroqRequestBody,DEFAULT_GROQ_MODEL} from '../src/infrastructure/groq/groqModelCompatibility.js';
const require=createRequire(import.meta.url);const {buildEvidence}=require('../src/core/evidence/buildEvidence');
const now='2026-09-28T13:00:00.000Z',subjectRef={type:'person',id:'marco'};
const rep={professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence'}],professionalSynthesis:{hasDocumentedRoleContinuity:true,currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['production']},knowledgeContribution:[{primaryProfessionalMeaning:{kind:'bounded_decision_accountability'}},{primaryProfessionalMeaning:{kind:'bounded_measurable_outcome_contribution'}}]}};
const evaluation=evaluateCareerDirections({professionalRepresentation:rep,professionalRepresentationRef:'professionalRepresentation:marco',now}),ops=evaluation.hypotheses.find(x=>x.metadata.roleFamilyRef==='operations_management');
const identity={type:'private_beta_professional_identity_continuity',personRef:subjectRef,professionalSources:[],reusableKnowledgeResults:[]};
const accepted='Da circa tre anni, in officina, gestisco direttamente circa 5 persone: assegno le attività e definisco le priorità di lavoro.';
const candidate={interpretationStatus:'SUPPORTED',responsibilityPresence:'supported',continuity:'continuing',responsibilityMode:'informal_operational',responsibilityKinds:['work_assignment_or_priority_setting'],peopleScope:{kind:'category',value:'circa 5 persone',min:null,max:null},professionalContext:{description:'in officina',current:true},eventTime:{description:'Da circa tre anni'},support:{presence:'gestisco direttamente circa 5 persone',continuity:'Da circa tre anni',mode:'gestisco direttamente',peopleScope:'circa 5 persone',professionalContext:'in officina',responsibilityKinds:['assegno le attività e definisco le priorità di lavoro']},limitations:['formal reporting authority not established']};
function structuredError(){return Object.assign(new Error('schema rejected'),{providerDiagnostic:{failureKind:'structured_output_rejected'}})}
// First failing boundary recovery: strict JSON-schema rejection -> bounded json_object recovery -> same validators.
let calls=0,recoveryArgs;
const evidence=buildEvidence({sourceType:'runtime_answer',sourceRef:'runtime:pd073',content:{answerText:accepted},provenance:{capturedAt:now},metadata:{version:'1.0'}});
let semantic=await runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence,completionRunner:async args=>{calls++;if(calls===1)throw structuredError();recoveryArgs=args;return{content:JSON.stringify(candidate),model:'mock',outputMode:'json_object'};}});
assert.equal(calls,2);assert.equal(semantic.supported,true);assert.equal(semantic.provider.initialStructuredOutputRecoveryAttempted,true);assert.equal(recoveryArgs.strictSchemaCompatible,false);
const prepared=buildGroqRequestBody({task:recoveryArgs.task,model:DEFAULT_GROQ_MODEL,systemText:recoveryArgs.systemText,userText:recoveryArgs.userText,jsonSchema:recoveryArgs.jsonSchema,strictSchemaCompatible:recoveryArgs.strictSchemaCompatible});assert.equal(prepared.contract.mode,'json_object');
// Real Career Direction path: answer -> accepted Evidence -> semantic adapter -> canonical Knowledge -> recomputation.
let state=await startDirectionPeopleResponsibilityProductionAcquisition({careerDirectionEvaluation:evaluation,selectedDirectionRef:ops.id,userAction:'deepen_career_direction',professionalIdentity:identity,subjectRef,professionalRepresentationRef:'professionalRepresentation:marco',now});
assert.equal(state.status,'awaiting_answer');calls=0;
const semanticExecutor=async ({evidence})=>runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence,completionRunner:async()=>{calls++;if(calls===1)throw structuredError();return{content:JSON.stringify(candidate),model:'mock',outputMode:'json_object'};}});
const done=await answerDirectionPeopleResponsibilityProductionAcquisition({state,answer:accepted,careerDirectionEvaluation:evaluation,subjectRef,now,semanticExecutor});
assert.equal(done.status,'resolved');assert(done.knowledgeResult?.personKnowledgeMatrix);assert(done.resolutions.some(x=>x.resolutionState==='resolved_by_current_authorised_state'));
// Insufficient / number-only / coordination-only remain fail-closed: semantic insufficiency cannot create Knowledge.
const unsupported={interpretationStatus:'UNSUPPORTED',responsibilityPresence:'insufficient',continuity:'insufficient',responsibilityMode:'insufficient',responsibilityKinds:[],peopleScope:{kind:'unknown',value:null,min:null,max:null},professionalContext:{description:null,current:null},eventTime:{description:null},support:{presence:null,continuity:null,mode:null,peopleScope:null,professionalContext:null,responsibilityKinds:[]},limitations:['insufficient explicit evidence']};
for(const answer of ['A volte ho aiutato a coordinare alcune persone.','Ho gestito 5 persone.','Coordino attività con alcuni colleghi.']){
 state=await startDirectionPeopleResponsibilityProductionAcquisition({careerDirectionEvaluation:evaluation,selectedDirectionRef:ops.id,userAction:'deepen_career_direction',professionalIdentity:identity,subjectRef,professionalRepresentationRef:'professionalRepresentation:marco',now});
 const unresolved=await answerDirectionPeopleResponsibilityProductionAcquisition({state,answer,careerDirectionEvaluation:evaluation,subjectRef,now,semanticExecutor:async()=>({supported:false,reason:'unsupported_semantics',diagnostic:{category:'legitimate_unsupported_semantics'}})});
 assert.equal(unresolved.status,'awaiting_answer');assert.equal(unresolved.questionRequired,true);assert.equal(unresolved.result.personKnowledgeMatrix,null);
}
// Non-structured provider failures remain operational failures and never create Knowledge.
state=await startDirectionPeopleResponsibilityProductionAcquisition({careerDirectionEvaluation:evaluation,selectedDirectionRef:ops.id,userAction:'deepen_career_direction',professionalIdentity:identity,subjectRef,professionalRepresentationRef:'professionalRepresentation:marco',now});
const failed=await answerDirectionPeopleResponsibilityProductionAcquisition({state,answer:accepted,careerDirectionEvaluation:evaluation,subjectRef,now,semanticExecutor:async()=>{throw Object.assign(new Error('timeout'),{providerDiagnostic:{failureKind:'timeout'}})}});assert.equal(failed.status,'awaiting_answer');assert.equal(failed.operationalFailure.category,'provider_technical_failure');assert.equal(failed.result.personKnowledgeMatrix,null);
console.log('PD-073 Career Direction clarification acquisition runtime completion tests passed.');

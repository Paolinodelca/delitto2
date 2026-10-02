import assert from 'node:assert/strict';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {startPd086ProfessionalResponsibilityAcquisition,PD086_RESOURCE_BUDGET_ACTION} from '../src/app/careerDirection/pendingProfessionalResponsibilityAcquisition.js';
import {runPd086ProductionSemanticExecutor} from '../src/app/knowledge/pd086ProfessionalResponsibility.js';

const now='2026-10-02T14:07:07.000Z';
const personRef={type:'person',id:'pd096-fourth'};
const evaluation={type:'career_direction_evaluation',professionalRepresentationRef:'rep:pd096-fourth',hypotheses:[{id:'ops',directionRef:'operations_manager',metadata:{roleLabel:'Operations Manager'},conditionsToVerify:[{id:'budget-condition',reason:'broader_resource_budget_scope',roleRequirementRef:'budget-role-requirement'}]}]};
const identity={type:'private_beta_professional_identity_continuity',professionalIdentityRef:'professionalIdentity:pd096-fourth',personRef,professionalSources:[],reusableKnowledgeResults:[],authorizedMaterials:{},applicationState:{}};
const acquisition=startPd086ProfessionalResponsibilityAcquisition({careerDirectionEvaluation:evaluation,selectedDirectionRef:'ops',conditionRef:'budget-condition',actionIdentity:PD086_RESOURCE_BUDGET_ACTION,professionalIdentity:identity,subjectRef:personRef,professionalRepresentationRef:'rep:pd096-fourth',now});
assert.equal(acquisition.status,'awaiting_answer');
const sessionRef='pd096-fourth-route';
const sessionStore=new Map([[sessionRef,{type:'direction_explore_state',personRef,careerDirectionEvaluation:evaluation,directionAcquisition:acquisition,reusableProfessionalIdentity:identity}]]);
const answer='Nel progetto controllavo i costi del reparto, ma non avevo autorità di allocazione o approvazione del budget.';
const invalid={interpretationStatus:'SUPPORTED',semanticType:'resource_budget_responsibility_scope',responsibilityStrength:'direct_bounded_responsibility',directness:'direct',scope:'reparto',continuity:'recurring',allocationAuthority:false,approvalAuthority:false,monitoringControl:false,amountRange:null,participationType:null,directScheduleCreationChange:null,prioritisationAuthority:null,productionScope:null,timeHorizon:null,affectedScope:null,professionalContext:{description:'reparto',current:true},eventTime:{description:null},support:{primary:'controllavo i costi del reparto',scope:'reparto',continuity:null,amount:null},limitations:[]};
let calls=[];
const semanticExecutor=({authority,evidence})=>runPd086ProductionSemanticExecutor({authority,evidence,completionRunner:async opts=>{calls.push({task:opts.task,strictSchemaCompatible:opts.strictSchemaCompatible});return {structured:invalid,model:'controlled-pd096-fourth',outputMode:opts.strictSchemaCompatible?'json_schema':'json_object'};}});
const logs=[];const prior=console.error;console.error=(...parts)=>logs.push(parts.join(' '));
const server=createPrivateBetaUiServer({operatorDiagnosticsEnabled:true,sessionStore,locale:'it',journeyOptions:{pd086ProfessionalResponsibilitySemanticExecutor:semanticExecutor}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 const port=server.address().port;
 const response=await fetch(`http://127.0.0.1:${port}/private-beta/direction/answer`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({sessionRef,answer})});
 const html=await response.text();assert.equal(response.status,200);assert.match(html,/Non sono riuscito a interpretare la risposta per un problema tecnico/);
 const traceResponse=await fetch(`http://127.0.0.1:${port}/private-beta/operator/semantic-trace?sessionRef=${sessionRef}`);assert.equal(traceResponse.status,200);const payload=await traceResponse.json();
 const diagnostic=payload.semanticExecutionTraces.find(x=>x.boundary==='career_direction_people_responsibility_acquisition');assert(diagnostic);
 assert.equal(diagnostic.stage,'semantic_candidate');assert.equal(diagnostic.category,'invalid_provider_candidate');assert.equal(diagnostic.reasonCode,'invalid_provider_output');
 assert.equal(diagnostic.pd073Recovery.attempted,true);assert.equal(diagnostic.pd073Recovery.succeeded,false);assert.equal(diagnostic.pd073Recovery.mode,'json_object');assert.equal(diagnostic.pd073Recovery.notApplicableReason,null);
 assert.equal(diagnostic.semanticExecutionEntered,true);assert.equal(diagnostic.semanticValidationStage,'deterministic_validation');assert.equal(diagnostic.recoveryDecisionEntered,true);assert.equal(diagnostic.recoveryAttempted,true);assert.equal(diagnostic.finalFailureProducer,'runPd086ProductionSemanticExecutor');assert.equal(diagnostic.finalFailureCategory,'invalid_provider_candidate');
 assert.equal(calls.length,2);assert.equal(calls[0].strictSchemaCompatible,true);assert.equal(calls[1].strictSchemaCompatible,false);
 assert(!(diagnostic.pd073Recovery.attempted===false&&diagnostic.pd073Recovery.notApplicableReason==null));
 assert(logs.some(x=>x.startsWith('[IMAGO operator career direction acquisition diagnostic]')));
 assert(!JSON.stringify({diagnostic,logs}).includes(answer));
}finally{console.error=prior;await new Promise(r=>server.close(r));}
console.log('PD-096 Fourth Corrective exact live exit-path route-level test: PASS');

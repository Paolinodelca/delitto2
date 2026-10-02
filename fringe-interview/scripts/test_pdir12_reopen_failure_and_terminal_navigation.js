import assert from 'node:assert/strict';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {startDirectionPeopleResponsibilityAcquisition} from '../src/app/careerDirection/directionKnowledgeAcquisition.js';

const people={id:'condition:people',reason:'people_responsibility_scope',roleRequirementRef:'req:people'};
const budget={id:'condition:budget',reason:'broader_resource_budget_scope',roleRequirementRef:'req:budget'};
const evaluation={hypotheses:[{id:'direction:ops',directionRef:'operations_management',whyWorthExploring:'broader_operational_coordination_and_decision_contexts',supportBasis:[],conditionsToVerify:[people,budget],metadata:{roleLabel:'Operations Manager',roleRequirementSemanticKeys:{'req:people':'people_responsibility','req:budget':'budget_resource_scope'},roleRequirementSources:{'req:people':[],'req:budget':[]},personSupportKinds:[]}}]};
const personRef={type:'person',id:'marco'};
const identity={professionalSources:[],reusableKnowledgeResults:[]};
const start=()=>startDirectionPeopleResponsibilityAcquisition({careerDirectionEvaluation:evaluation,selectedDirectionRef:'direction:ops',userAction:'deepen_career_direction',professionalIdentity:identity,subjectRef:personRef,professionalRepresentationRef:'representation:marco',now:'2026-09-14T08:00:00.000Z'});
const state=(sessionRef)=>({type:'direction_explore_state',sessionRef,careerDirectionEvaluation:evaluation,directionAcquisition:start(),personRef,reusableProfessionalIdentity:identity});
const post=async(base,path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body)});return {status:r.status,html:await r.text()};};

// Retryable technical failure: retry and stop both remain available; no Knowledge/success feedback.
const failureSession='direction:pdir12:failure';
const failureStore=new Map([[failureSession,state(failureSession)]]);
const failureExecutor=async()=>{throw Object.assign(new Error('controlled provider timeout'),{providerDiagnostic:{failureKind:'timeout'}})};
const failureServer=createPrivateBetaUiServer({locale:'it',sessionStore:failureStore,journeyOptions:{directionPeopleResponsibilitySemanticExecutor:failureExecutor}});
await new Promise(r=>failureServer.listen(0,'127.0.0.1',r));
try{
 const base=`http://127.0.0.1:${failureServer.address().port}`;
 const failed=await post(base,'/private-beta/direction/answer',{sessionRef:failureSession,answer:'Marco controlled answer'});
 assert.equal(failed.status,200,failed.html);
 assert.match(failed.html,/Non sono riuscito a interpretare la risposta per un problema tecnico/);
 assert.match(failed.html,/action="\/private-beta\/direction\/answer"/);
 assert.match(failed.html,/action="\/private-beta\/direction\/stop"/);
 assert.doesNotMatch(failed.html,/Cosa abbiamo capito meglio/);
 assert.equal(failureStore.get(failureSession).directionAcquisition.knowledgeResult,undefined);
 assert.equal(failureStore.get(failureSession).directionAcquisition.operationalFailure.category,'provider_technical_failure');
 const stopped=await post(base,'/private-beta/direction/stop',{sessionRef:failureSession});
 assert.equal(stopped.status,200,stopped.html);
 assert.match(stopped.html,/id="career-directions"/);
 assert.match(stopped.html,/resta(?:no)? da chiarire/);
 assert.doesNotMatch(stopped.html,/Cosa abbiamo capito meglio/);
 assert.equal(failureStore.get(failureSession).directionAcquisition.status,'stopped_unresolved');
 assert.equal(failureStore.get(failureSession).directionAcquisition.knowledgeResult,undefined);
} finally {await new Promise(r=>failureServer.close(r));}

// Direct stop before any answer: unresolved state returns to Directions and creates no Knowledge.
const directSession='direction:pdir12:direct-stop';
const directStore=new Map([[directSession,state(directSession)]]);
const directServer=createPrivateBetaUiServer({locale:'it',sessionStore:directStore});
await new Promise(r=>directServer.listen(0,'127.0.0.1',r));
try{
 const base=`http://127.0.0.1:${directServer.address().port}`;
 const stopped=await post(base,'/private-beta/direction/stop',{sessionRef:directSession});
 assert.equal(stopped.status,200,stopped.html);
 assert.match(stopped.html,/id="career-directions"/);
 assert.match(stopped.html,/resta(?:no)? da chiarire/);
 assert.doesNotMatch(stopped.html,/Cosa abbiamo capito meglio/);
 assert.equal(directStore.get(directSession).directionAcquisition.status,'stopped_unresolved');
 assert.equal(directStore.get(directSession).directionAcquisition.knowledgeResult,undefined);
} finally {await new Promise(r=>directServer.close(r));}

// Semantic insufficiency keeps existing clarification flow; no premature return.
const insufficientSession='direction:pdir12:insufficient';
const insufficientStore=new Map([[insufficientSession,state(insufficientSession)]]);
const insufficientExecutor=async()=>({supported:false,reason:'unsupported_semantics',diagnostic:{category:'legitimate_unsupported_semantics'}});
const insufficientServer=createPrivateBetaUiServer({locale:'it',sessionStore:insufficientStore,journeyOptions:{directionPeopleResponsibilitySemanticExecutor:insufficientExecutor}});
await new Promise(r=>insufficientServer.listen(0,'127.0.0.1',r));
try{
 const base=`http://127.0.0.1:${insufficientServer.address().port}`;
 const insufficient=await post(base,'/private-beta/direction/answer',{sessionRef:insufficientSession,answer:'Sì, coordino persone.'});
 assert.equal(insufficient.status,200,insufficient.html);
 assert.match(insufficient.html,/Mi manca ancora un dettaglio/);
 assert.match(insufficient.html,/id="direction-acquisition"/);
 assert.doesNotMatch(insufficient.html,/id="career-directions"/);
 assert.doesNotMatch(insufficient.html,/Cosa abbiamo capito meglio/);
 assert.equal(insufficientStore.get(insufficientSession).directionAcquisition.clarificationCount,1);
} finally {await new Promise(r=>insufficientServer.close(r));}

console.log('PDIR-12 reopened failure/retry/stop terminal navigation: PASS');

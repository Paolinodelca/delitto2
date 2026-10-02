import assert from 'node:assert/strict';
import { prepareStagedPrivateBetaJourney } from '../src/app/privateBetaStagedInterviewJourney.js';
import { buildTargetIndependentRepresentationSnapshotState, materializeTargetIndependentRepresentationSnapshot } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';
import { runGroqChatCompletion, projectGroqRateLimitMetadata } from '../src/infrastructure/groq/runGroqChatCompletion.js';
import { createLiveHigherOrderProfessionalSynthesisProvider } from '../src/app/liveHigherOrderProfessionalSynthesisProvider.js';

const at='2026-09-23T14:00:00.000Z';
const personRef={type:'person',id:'private-beta-person:gm02i'};
const source={id:'current_cv',type:'text',sourceRole:'current_cv',content:'Production Supervisor',provenance:{origin:'current_cv',providedBy:'user',collectedAt:at}};
const base={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:source.content,userNotes:''},professionalSources:[source],reusableKnowledgeResults:[],knowledgeRefs:[],revision:1,createdAt:at,updatedAt:at};
const recipe={id:'target_independent_professional_representation',version:'2.0'};
const state=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:base,professionalSources:[source],reusableKnowledgeResults:[],authorizationState:'accepted',recipe});
const representation={type:'target_independent_professional_representation',version:'1.4',professionalMeaning:{professionalThreads:[],level1ProfessionalThreads:[]},provenance:{sourceIds:['current_cv']},limitations:[]};
const snapshot=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:base,state,representation,now:at});
const record={...base,representationSnapshots:[snapshot],currentRepresentationSnapshotRefs:{professional_representation_understand:snapshot.snapshotId}};
const uiInput={identityAction:'recover',workingMode:'independent',productPurpose:'professional_representation_understand',consentDecision:'accept',cvText:'',previousCvText:'',professionalDeclaration:'',userNotes:'',jdText:'',targetRole:'',uiLocale:'it'};
let calls=0;const diagnostics=[];const oldKey=process.env.GROQ_API_KEY;process.env.GROQ_API_KEY='gsk_test_redacted';
const before=JSON.stringify(record);
const reused=await prepareStagedPrivateBetaJourney({uiInput,reusableProfessionalIdentity:record,modelAdapter:async()=>{calls++;throw new Error('model must not run on reuse')},technicalDiagnosticSink:x=>diagnostics.push(x),now:()=>at});
assert.equal(calls,0);assert.equal(reused.publicResult.preInterview.representationSnapshot.reused,true);assert.equal(reused.representationSnapshotUpdate,null);assert(diagnostics.some(x=>x.boundary==='professional_representation_reuse'&&x.reuse===true&&x.modelCallCount===0));assert.equal(JSON.stringify(record),before,'reuse must not mutate Person/PI state');
if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey;

// Fingerprint invalidation remains fail-closed before any reuse decision.
const changedState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:record,professionalSources:[{...source,content:'Production Supervisor changed'}],reusableKnowledgeResults:[],authorizationState:'accepted',recipe});
assert.notEqual(changedState.relevantStateFingerprint,state.relevantStateFingerprint);
const knowledgeState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:record,professionalSources:[source],reusableKnowledgeResults:[{semanticType:'decision_accountability',knowledgeRef:'k1',observation:{observationStatus:'observed'}}],authorizationState:'accepted',recipe});
assert.notEqual(knowledgeState.relevantStateFingerprint,state.relevantStateFingerprint);
const recipeState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:record,professionalSources:[source],reusableKnowledgeResults:[],authorizationState:'accepted',recipe:{...recipe,version:'2.1'}});assert.notEqual(recipeState.relevantStateFingerprint,state.relevantStateFingerprint);

// Same-input 429 retry; numeric Retry-After is honoured without semantic rebuild.
process.env.GROQ_API_KEY='gsk_test_redacted';const realFetch=globalThis.fetch;const bodies=[];let fetchCalls=0;const exec=[];
globalThis.fetch=async(_url,options)=>{bodies.push(options.body);fetchCalls++;if(fetchCalls===1)return new Response(JSON.stringify({error:{message:'rate limit',code:'rate_limit_exceeded',type:'tokens'}}),{status:429,headers:{'retry-after':'0','x-ratelimit-remaining-tokens':'0','x-ratelimit-reset-tokens':'1s'}});return new Response(JSON.stringify({choices:[{message:{content:'ok'}}]}),{status:200,headers:{'x-ratelimit-remaining-tokens':'12','x-ratelimit-reset-tokens':'1s'}})};
const completion=await runGroqChatCompletion({task:'test',systemText:'system',userText:'same semantic input',maxRetries:1,retryDelayMs:1,executionDiagnosticSink:x=>exec.push(x)});
assert.equal(fetchCalls,2);assert.equal(bodies[0],bodies[1]);assert.equal(completion.attemptsUsed,2);assert(exec.some(x=>x.stage==='retry_wait'&&x.rateLimitClassification==='rate_limit'&&x.retryWaitMs===0));

// Provider reset metadata is bounded; malformed metadata cannot create an unbounded wait.
const metadata=projectGroqRateLimitMetadata({headers:new Headers({'x-ratelimit-remaining-tokens':'0','x-ratelimit-reset-tokens':'2s'})});assert.equal(metadata.recommendedWaitMs,2000);
const malformed=projectGroqRateLimitMetadata({headers:new Headers({'x-ratelimit-remaining-tokens':'0','x-ratelimit-reset-tokens':'not-a-duration'})});assert.equal(malformed.recommendedWaitMs,null);
const clamped=projectGroqRateLimitMetadata({headers:new Headers({'x-ratelimit-remaining-tokens':'0','x-ratelimit-reset-tokens':'99m'})});assert.equal(clamped.recommendedWaitMs,10000);
globalThis.fetch=realFetch;if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey;

// Dependent-call pacing is conditional: no metadata => no delay; active bounded reset => bounded delay.
const proposal={proposalRef:'H1',contributorRefs:['relationship:R1','pattern:P1'],structureWording:'Struttura documentata.',compositionBasis:'Contributi autorizzati.',claimShape:{subjectScope:'documented_material_structure',structureClaim:'descriptive_combination',personPropertyAssertion:'none',continuityAssertion:'none',leadershipAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',generalAutonomyAssertion:'none',resultCausalityAssertion:'none',targetRelationAssertion:'none'}};
const contributor=ref=>({contributorRef:ref,contributorType:ref.split(':')[0],semanticContent:{wording:'bounded'},professionalBasisRefs:[]});
let modelRuns=0;const noPace=createLiveHigherOrderProfessionalSynthesisProvider({modelRunner:async()=>{modelRuns++;return {model:'controlled',structured:{structureProposals:[proposal]}}},beforeCallPacing:()=>null});await noPace.proposalProvider({contributors:[contributor('relationship:R1'),contributor('pattern:P1')]});assert.equal(modelRuns,1);
const pacedEvents=[];const paced=createLiveHigherOrderProfessionalSynthesisProvider({modelRunner:async()=>({model:'controlled',structured:{structureProposals:[proposal]}}),beforeCallPacing:()=>({waitMs:1,reason:'provider_reset_metadata'}),diagnosticSink:x=>pacedEvents.push(x)});await paced.proposalProvider({contributors:[contributor('relationship:R1'),contributor('pattern:P1')]});assert(pacedEvents.some(x=>x.stage==='provider_aware_pacing'&&x.waitMs===1));

console.log('GM-02I representation reuse and provider-aware rate-limit resilience: PASS');

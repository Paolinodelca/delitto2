import assert from 'node:assert/strict';
import { prepareStagedPrivateBetaJourney } from '../src/app/privateBetaStagedInterviewJourney.js';
import { buildTargetIndependentRepresentationSnapshotState, materializeTargetIndependentRepresentationSnapshot, findReusableTargetIndependentRepresentationSnapshot, buildRepresentationMaterializationProvenance } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';
import { createPrivateBetaUiServer } from '../src/app/privateBetaUiServer.js';
import { createMemoryPrivateBetaProfessionalIdentityStore } from '../src/app/privateBetaProfessionalIdentityContinuity.js';

const at='2026-09-23T14:00:00.000Z', personRef={type:'person',id:'private-beta-person:gm02v'};
const source={id:'current_cv',type:'text',sourceRole:'current_cv',content:'Production Supervisor',provenance:{origin:'current_cv',providedBy:'user',collectedAt:at}};
const base={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:source.content,userNotes:''},professionalSources:[source],reusableKnowledgeResults:[],knowledgeRefs:[],revision:1,createdAt:at,updatedAt:at};
const state=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:base,professionalSources:[source],reusableKnowledgeResults:[],authorizationState:'accepted'});
const degradedRepresentation={type:'target_independent_professional_representation',version:'1.4',professionalMeaning:{professionalThreads:[],level1ProfessionalThreads:[],pd070Validation:{providerStatus:'failed',rejections:[]}},provenance:{sourceIds:['current_cv']},limitations:[]};
const degradedSnapshot=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:base,state,representation:degradedRepresentation,materializationProvenance:buildRepresentationMaterializationProvenance({liveSynthesisRequired:true,pd069Status:'ok',pd070Status:'failed',higherOrderSynthesisApplicable:true}),now:at});
const record={...base,representationSnapshots:[degradedSnapshot],currentRepresentationSnapshotRefs:{professional_representation_understand:degradedSnapshot.snapshotId}};

// Actual repository behavior: fingerprint-only reuse accepts a snapshot whose embedded Representation records PD-070 failure.
assert.equal(findReusableTargetIndependentRepresentationSnapshot({professionalIdentity:record,state})?.snapshotId,degradedSnapshot.snapshotId);
assert.equal(degradedSnapshot.materializationStatus,'degraded');
assert.equal(degradedSnapshot.providerFallbackUsed,true);
assert.equal(degradedSnapshot.higherOrderSynthesisCompleted,false);

const uiInput={identityAction:'recover',workingMode:'independent',productPurpose:'professional_representation_understand',consentDecision:'accept',cvText:'',previousCvText:'',professionalDeclaration:'',userNotes:'',jdText:'',targetRole:'',uiLocale:'it'};
let reuseCalls=0; const reuseDiag=[];
const reused=await prepareStagedPrivateBetaJourney({uiInput,reusableProfessionalIdentity:record,modelAdapter:async()=>{reuseCalls++;throw new Error('must not run')},technicalDiagnosticSink:x=>reuseDiag.push(x),now:()=>at});
assert.equal(reuseCalls,0); assert.equal(reused.publicResult.preInterview.representationSnapshot.reused,true);
assert(reuseDiag.some(x=>x.reuse===true&&x.snapshotRef===degradedSnapshot.snapshotId&&x.materializationStatus==='degraded'&&x.providerFallbackUsed===true));

// Force-fresh bypasses reuse and executes normal CandidateProfile preparation without changing fingerprint or PI.
let freshCalls=0; const freshDiag=[]; const before=JSON.stringify(record); const oldKey=process.env.GROQ_API_KEY; delete process.env.GROQ_API_KEY;
const adapter=async()=>{freshCalls++;return JSON.stringify({candidateProfile:{summary:'Production Supervisor',senioritySignal:'unknown',skills:[],experienceHighlights:['Production Supervisor']}})};
const fresh=await prepareStagedPrivateBetaJourney({uiInput,reusableProfessionalIdentity:record,modelAdapter:adapter,technicalDiagnosticSink:x=>freshDiag.push(x),forceFreshProfessionalRepresentation:true,now:()=>at});
if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey;
assert.equal(fresh.publicResult.error,undefined); assert(freshCalls>=2,'aggregate + per-source CandidateProfile must execute');
assert.equal(fresh.publicResult.preInterview.representationSnapshot.reused,false);
assert(freshDiag.some(x=>x.forceFreshRequested===true&&x.forceFreshConsumed===true&&x.reuseBypassedForOperatorVerification===true));
assert.equal(fresh.representationSnapshotUpdate.relevantStateFingerprint,degradedSnapshot.relevantStateFingerprint);
assert.equal(JSON.stringify(record),before);

// Operator control is unavailable when diagnostics are disabled and is one-shot when enabled.
async function exercise(enabled){
 const store=createMemoryPrivateBetaProfessionalIdentityStore(); await store.save({record}); const seen=[]; const forceState={pending:false};
 const server=createPrivateBetaUiServer({operatorDiagnosticsEnabled:enabled,professionalIdentityStore:store,contextIdFactory:()=>personRef.id.replace('private-beta-person:',''),forceFreshProfessionalRepresentationState:forceState,stagedPrepare:async args=>{seen.push(Boolean(args.forceFreshProfessionalRepresentation));return {publicResult:{status:'understanding',completed:false,phase:'purpose_understand',preInterview:{}},state:null};}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r)); const baseUrl=`http://127.0.0.1:${server.address().port}`; const cookie='imago_beta_repeat_context=gm02v';
 const force=await fetch(`${baseUrl}/private-beta/operator/force-fresh-professional-representation`,{method:'POST',headers:{cookie}});
 if(enabled){assert.equal(force.status,200); for(let i=0;i<2;i++)await fetch(`${baseUrl}/private-beta/journey`,{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:'identityAction=recover&productPurpose=professional_representation_understand&consentDecision=accept&workingMode=independent'});assert.deepEqual(seen,[true,false]);}
 else {assert.equal(force.status,404);}
 await new Promise(r=>server.close(r));
}
await exercise(false); await exercise(true);

console.log('GM-02V fresh Representation verification and snapshot completion-state review: PASS');

import assert from "assert";
import { createPrivateBetaUiServer } from "../src/app/privateBetaUiServer.js";

const rawSecret="RISPOSTA RAW DA NON ESPORRE";
const sessionStore=new Map([["ot01-session",{session:{fhtSemanticExecutionTraces:[
 {runtimeActionRef:"interviewQuestion:decision_tradeoff_probe",questionKey:"decision_tradeoff_probe",acquisitionPurpose:"decision_accountability",semanticDimension:"decision_accountability",semanticPolicyRef:"professional_semantic_policy:decision_accountability:v1",executionRef:"knowledgeAcquisitionExecution:da-success",evidenceRef:"e-da-success",observationRef:"obs-da",measurementRef:"measurement-da",knowledgeRef:"knowledge-snapshot-da",stage:"knowledge_construction",status:"succeeded",category:"knowledge_produced",reasonCode:"knowledge_snapshot_produced",providerCategory:null,rawAnswer:rawSecret},
 {runtimeActionRef:"interviewQuestion:decision_tradeoffs",questionKey:"decision_tradeoffs",acquisitionPurpose:"decision_accountability",semanticDimension:"decision_accountability",semanticPolicyRef:"professional_semantic_policy:decision_accountability:v1",executionRef:"knowledgeAcquisitionExecution:da-fail",evidenceRef:"e-da-fail",observationRef:null,measurementRef:null,knowledgeRef:null,stage:"observation_construction",status:"failed",category:"observation_validation_failure",reasonCode:"authorized_observation_not_constructed",providerCategory:"candidate_rejected",transcript:rawSecret},
 {runtimeActionRef:"interviewQuestion:achievement_quantification",questionKey:"achievement_quantification",acquisitionPurpose:"quantified_outcome",semanticDimension:"quantified_outcome",semanticPolicyRef:"professional_semantic_policy:quantified_outcome:v1",executionRef:"knowledgeAcquisitionExecution:qo-success",evidenceRef:"e-qo",observationRef:"obs-qo",measurementRef:"measurement-qo",knowledgeRef:"knowledge-snapshot-qo",stage:"knowledge_construction",status:"succeeded",category:"knowledge_produced",reasonCode:"knowledge_snapshot_produced",providerCategory:null}
]}}]]);

async function start(enabled){
 const server=createPrivateBetaUiServer({operatorDiagnosticsEnabled:enabled,sessionStore,locale:"it"});
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 return server;
}
let server=await start(true);
let port=server.address().port;
let res=await fetch(`http://127.0.0.1:${port}/private-beta/operator/semantic-trace?sessionRef=ot01-session`);
assert.equal(res.status,200);
const payload=await res.json();
assert.equal(payload.sessionRef,"ot01-session");
assert.equal(payload.semanticExecutionTraces.length,3);
const daSuccess=payload.semanticExecutionTraces.find(x=>x.executionRef==="knowledgeAcquisitionExecution:da-success");
assert.equal(daSuccess.questionKey,"decision_tradeoff_probe");
assert.equal(daSuccess.semanticDimension,"decision_accountability");
assert.equal(daSuccess.category,"knowledge_produced");
assert.equal(daSuccess.observationRef,"obs-da");
assert.equal(daSuccess.measurementRef,"measurement-da");
assert.equal(daSuccess.knowledgeRef,"knowledge-snapshot-da");
const daFail=payload.semanticExecutionTraces.find(x=>x.executionRef==="knowledgeAcquisitionExecution:da-fail");
assert.equal(daFail.questionKey,"decision_tradeoffs");
assert.equal(daFail.status,"failed");
assert.equal(daFail.category,"observation_validation_failure");
assert.equal(daFail.reasonCode,"authorized_observation_not_constructed");
const qo=payload.semanticExecutionTraces.find(x=>x.semanticDimension==="quantified_outcome");
assert.equal(qo.questionKey,"achievement_quantification");
assert.notEqual(qo.semanticDimension,daSuccess.semanticDimension);
const serialized=JSON.stringify(payload);
assert(!serialized.includes(rawSecret));
assert(!serialized.includes("rawAnswer"));
assert(!serialized.includes("transcript"));

res=await fetch(`http://127.0.0.1:${port}/private-beta`);
assert.equal(res.status,200);
const html=await res.text();
assert(!html.includes("semanticExecutionTraces"));
assert(!html.includes(rawSecret));
await new Promise(r=>server.close(r));

server=await start(false);port=server.address().port;
res=await fetch(`http://127.0.0.1:${port}/private-beta/operator/semantic-trace?sessionRef=ot01-session`);
assert.equal(res.status,404);
await new Promise(r=>server.close(r));

console.log("FHT-OT01 semantic execution trace operator exposure: PASS");

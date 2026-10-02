import assert from "assert";
import { readFile } from "fs/promises";
import { createPrivateBetaUiServer } from "../src/app/privateBetaUiServer.js";
import { answerStagedPrivateBetaJourney } from "../src/app/privateBetaJourneyIntegration.js";
import { createMemoryPrivateBetaProfessionalIdentityStore, privateBetaPersonRefFromContext } from "../src/app/privateBetaProfessionalIdentityContinuity.js";

const load=async n=>JSON.parse(await readFile(new URL(`../fixtures/${n}`,import.meta.url),"utf8"));
const adapter=async({task})=>task==="candidateProfile"?JSON.stringify(await load("expected_candidate_profile_01.json")):task==="roleProfile"?JSON.stringify(await load("expected_role_profile_01.json")):task==="jobFitAnalysis"?JSON.stringify(await load("expected_job_fit_analysis_01.json")):"{}";
const cv=await readFile(new URL("../fixtures/sample_cv_01.txt",import.meta.url),"utf8");
const jd=await readFile(new URL("../fixtures/sample_jd_01.txt",import.meta.url),"utf8");
const store=createMemoryPrivateBetaProfessionalIdentityStore();
const personRef=privateBetaPersonRefFromContext("continuity-person");
let semanticEnabled=true;
const da=({evidence})=>semanticEnabled?{supported:true,observation:{observationId:`da:${evidence.id}`,decisionAuthority:"shared",consequenceScope:"team",accountabilityEvidence:"explicit_with_outcomes",responsibilityContinuityMonths:null,context:{episode:"bounded continuity test"},inferenceSupportInputs:{evidenceQuality:{state:"not_yet_derived"},sourceConvergence:{state:"not_yet_derived"},consistency:{state:"not_yet_derived"},coverage:{state:"not_yet_derived"}},limitations:[],metadata:{createdAt:"2026-09-08T07:00:00.000Z"}}}:{supported:false};
const qo=()=>({supported:false});
const stagedAnswer=args=>answerStagedPrivateBetaJourney({...args,decisionAccountabilityExecutor:da,quantifiedOutcomeExecutor:qo});
const server=createPrivateBetaUiServer({locale:"it",professionalIdentityStore:store,contextIdFactory:()=>"continuity-person",journeyOptions:{modelAdapter:adapter},stagedAnswer});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const port=server.address().port;
let cookie="";
async function get(path="/private-beta"){const r=await fetch(`http://127.0.0.1:${port}${path}`,{headers:cookie?{Cookie:cookie}:{}});const sc=r.headers.get("set-cookie");if(sc)cookie=sc.split(";")[0];return {status:r.status,html:await r.text()};}
async function post(path,data){const r=await fetch(`http://127.0.0.1:${port}${path}`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",...(cookie?{Cookie:cookie}:{})},body:new URLSearchParams(data)});const sc=r.headers.get("set-cookie");if(sc)cookie=sc.split(";")[0];return {status:r.status,html:await r.text()};}
function sessionRef(html){return html.match(/name="sessionRef" value="([^"]+)"/)?.[1]||"";}
async function completeSession({identityAction,targetRole,cvText="",jdText="",answerPrefix="DA_SUPPORTED"}){
 let x=await post("/private-beta/journey",{identityAction,workingMode:"independent",consentDecision:"accept",cvText,jdText,targetRole,uiLocale:"it",sessionLocale:"it"});
 assert.equal(x.status,200,x.html);const ref=sessionRef(x.html);assert(ref);
 x=await post("/private-beta/understanding/continue",{sessionRef:ref,representationAgreement:"continue"});assert.equal(x.status,200);
 let guard=0;while(x.html.includes('action="/private-beta/interview/answer"')){assert(++guard<20,"interview did not complete");x=await post("/private-beta/interview/answer",{sessionRef:ref,answer:`${answerPrefix} risposta ${guard}: ho condiviso una decisione nel mio perimetro e ne ho seguito le conseguenze.`});assert.equal(x.status,200);}
 assert(x.html.includes('action="/private-beta/feedback"'),"feedback phase expected");
 x=await post("/private-beta/feedback",{sessionRef:ref,feedbackAction:"skip"});assert.equal(x.status,200);assert(x.html.includes("professional-identity-saved"));return ref;
}

// CASE 1 — FIRST SAVE, through the real staged/UI lifecycle.
let home=await get();assert(!home.html.includes('value="recover"'));
const sessionA=await completeSession({identityAction:"create",targetRole:"Target A",cvText:cv,jdText:jd});
const afterA=await store.load({personRef});assert(afterA);assert.equal(afterA.owner,"person");assert.equal(afterA.authorizedMaterials.cvText.trim(),cv.trim());assert(afterA.reusableKnowledgeResults.length>0);const revisionA=afterA.revision;const knowledgeA=[...afterA.knowledgeRefs];

// CASE 2 — REOPEN: same browser/person can recover without resupplying CV.
home=await get();assert(home.html.includes('value="recover"'));assert(home.html.includes("Professional Identity salvata"));
let reopen=await post("/private-beta/journey",{identityAction:"recover",workingMode:"independent",consentDecision:"accept",cvText:"",jdText:jd,targetRole:"Target B",uiLocale:"it",sessionLocale:"it"});
assert.equal(reopen.status,200,reopen.html);assert(reopen.html.includes("Professional Identity riaperta"));const sessionBRef=sessionRef(reopen.html);assert(sessionBRef);

// Complete Session B manually from the already-open recovered journey.
let x=await post("/private-beta/understanding/continue",{sessionRef:sessionBRef,representationAgreement:"continue"});let guard=0;
while(x.html.includes('action="/private-beta/interview/answer"')){assert(++guard<20);x=await post("/private-beta/interview/answer",{sessionRef:sessionBRef,answer:`DA_SUPPORTED B ${guard}: ho gestito una scelta reale nel mio perimetro.`});}
assert(x.html.includes('action="/private-beta/feedback"'));x=await post("/private-beta/feedback",{sessionRef:sessionBRef,feedbackAction:"skip"});assert(x.html.includes("professional-identity-saved"));
const afterB=await store.load({personRef});

// CASE 3/4 — REUSE + different target + ENRICH.
assert(afterB.reusableKnowledgeResults.length>afterA.reusableKnowledgeResults.length,"Session B must add newly supported Knowledge");
for(const ref of knowledgeA)assert(afterB.knowledgeRefs.includes(ref),"prior justified Knowledge must be retained");
assert(afterB.revision>revisionA);
assert.equal(JSON.stringify(afterB).includes("Target A"),false);
assert.equal(JSON.stringify(afterB).includes("Target B"),false);
assert.notEqual(sessionA,sessionBRef);
const runtimeSessionsA=new Set(afterA.reusableKnowledgeResults.map(k=>k.sourceRuntimeSessionRef).filter(Boolean));assert(afterB.reusableKnowledgeResults.some(k=>k.sourceRuntimeSessionRef&&!runtimeSessionsA.has(k.sourceRuntimeSessionRef)),"Session B Knowledge must retain distinct acquisition-session lineage");

// CASE 5 — NO FALSE ENRICHMENT.
semanticEnabled=false;
const revisionB=afterB.revision,refsB=[...afterB.knowledgeRefs];
await completeSession({identityAction:"recover",targetRole:"Target C",cvText:"",jdText:jd,answerPrefix:"NO_SUPPORTED_KNOWLEDGE"});
const afterC=await store.load({personRef});assert.equal(afterC.revision,revisionB);assert.deepEqual(afterC.knowledgeRefs,refsB);

// CASE 6/7 — Session and Target remain outside the person-owned continuity record.
assert.equal("target" in afterC,false);assert.equal("session" in afterC,false);assert.equal("jdText" in afterC.authorizedMaterials,false);

// CASE 8 — finalization deleted Session state but continuity remains reopenable.
home=await get();assert(home.html.includes('value="recover"'));
await new Promise(r=>server.close(r));
console.log("POST-FHT-02 Professional Identity continuity production-shaped tests PASSED");

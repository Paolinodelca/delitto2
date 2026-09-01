import assert from 'node:assert/strict';
import {runGroqDecisionAccountabilitySemanticExecutor} from '../src/infrastructure/groq/runGroqDecisionAccountabilitySemanticExecutor.js';
const evidence={content:{answerText:'fixture'}};
async function run(content){return runGroqDecisionAccountabilitySemanticExecutor({evidence,completionRunner:async()=>({content,model:'fixture',outputMode:'json_schema'})});}
const unsupported=await run(JSON.stringify({interpretationStatus:'UNSUPPORTED',decisionAuthority:null,consequenceScope:null,accountabilityEvidence:null,responsibilityContinuity:{state:'unknown',qualification:null,months:null,minimumMonths:null,maximumMonths:null},context:{decision:null,responsibility:null,consequence:null},limitations:[]}));
assert.equal(unsupported.reason,'unsupported_semantics'); assert.equal(unsupported.diagnostic.category,'legitimate_unsupported_semantics');
const invalid=await run(JSON.stringify({interpretationStatus:'SUPPORTED',decisionAuthority:'final',consequenceScope:null,accountabilityEvidence:'explicit',responsibilityContinuity:{state:'unknown',qualification:null,months:null,minimumMonths:null,maximumMonths:null},context:{decision:'x',responsibility:'y',consequence:null},limitations:[]}));
assert.equal(invalid.reason,'invalid_provider_output'); assert.equal(invalid.diagnostic.category,'candidate_rejected'); assert.ok(invalid.diagnostic.validationErrors.length);
const valid=await run(JSON.stringify({interpretationStatus:'SUPPORTED',decisionAuthority:'final',consequenceScope:'team',accountabilityEvidence:'explicit',responsibilityContinuity:{state:'unknown',qualification:null,months:null,minimumMonths:null,maximumMonths:null},context:{decision:'x',responsibility:'y',consequence:'team'},limitations:[]}));
assert.equal(valid.supported,true); assert.equal(valid.candidate.decisionAuthority,'final');
let provider=false; try{await runGroqDecisionAccountabilitySemanticExecutor({evidence,completionRunner:async()=>{const e=new Error('provider');e.providerDiagnostic={failureKind:'provider_request_failed'};throw e;}})}catch(e){provider=e.providerDiagnostic.failureKind==='provider_request_failed'} assert.equal(provider,true);
console.log('AR-03C semantic candidate rejection diagnostics: PASS');

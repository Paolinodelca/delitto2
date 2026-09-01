import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runGroqDecisionAccountabilitySemanticExecutor} from '../src/infrastructure/groq/runGroqDecisionAccountabilitySemanticExecutor.js';
const evidence={content:{answerText:'fixture'}};
const continuity={state:'unknown',qualification:null,months:null,minimumMonths:null,maximumMonths:null};
async function run(candidate){return runGroqDecisionAccountabilitySemanticExecutor({evidence,completionRunner:async()=>({content:JSON.stringify(candidate),model:'fixture',outputMode:'json_schema'})});}
const contextual={interpretationStatus:'SUPPORTED',decisionAuthority:'none',consequenceScope:null,accountabilityEvidence:null,responsibilityContinuity:continuity,context:{decision:'release',responsibility:'explicitly no authority',consequence:null},limitations:[]};
const validContextual=await run(contextual); assert.equal(validContextual.supported,true); assert.equal(validContextual.candidate.decisionAuthority,'none');
const rejectedContextual=await run({...contextual,context:{decision:'release',responsibility:null,consequence:null}}); assert.equal(rejectedContextual.reason,'invalid_provider_output'); assert.equal(rejectedContextual.diagnostic.category,'candidate_rejected'); assert.match(rejectedContextual.diagnostic.validationErrors.join(' '),/positive\/contextual minimum/); assert.deepEqual(rejectedContextual.diagnostic.candidateShape.contextPresence,{decision:true,responsibility:false,consequence:false}); assert.equal(rejectedContextual.diagnostic.candidateShape.decisionAuthority,'none');
const shared={...contextual,decisionAuthority:'shared',consequenceScope:'function',accountabilityEvidence:'explicit',context:{decision:'process change',responsibility:'joint approval authority',consequence:'function'}};
const validShared=await run(shared); assert.equal(validShared.supported,true); assert.equal(validShared.candidate.decisionAuthority,'shared');
const unsupportedShared=await run({...shared,interpretationStatus:'UNSUPPORTED',decisionAuthority:null,consequenceScope:null,accountabilityEvidence:null,context:{decision:null,responsibility:null,consequence:null}}); assert.equal(unsupportedShared.reason,'unsupported_semantics'); assert.equal(unsupportedShared.diagnostic.category,'legitimate_unsupported_semantics'); assert.equal(unsupportedShared.diagnostic.candidateShape.interpretationStatus,'UNSUPPORTED'); assert.equal(unsupportedShared.diagnostic.candidateShape.decisionAuthority,null);
const harness=fs.readFileSync(new URL('./test_ar03a_live_groq_decision_accountability_semantic_verification.js',import.meta.url),'utf8');
assert.match(harness,/AR03F_DIAGNOSTIC/); for(const id of ['C05_CONTEXTUAL_NONE','C12_HOSTILE_EVIDENCE','C03_SHARED','P_SHARED_2','P_SHARED_3'])assert.ok(harness.includes(id));
assert.match(harness,/C05_CONTEXTUAL_NONE[^\n]+expect:\{status:'SUPPORTED',authority:'none'\}/); assert.match(harness,/P_SHARED_3[^\n]+expect:\{status:'SUPPORTED',authority:'shared',scope:'function'\}/);
console.log('AR-03F residual live semantic instability diagnostics: PASS');

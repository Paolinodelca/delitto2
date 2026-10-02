import assert from 'node:assert/strict';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {buildGroqRequestBody,DEFAULT_GROQ_MODEL} from '../src/infrastructure/groq/groqModelCompatibility.js';
import {evidence,candidate,fallbackSelection,assertCanonicalFinal,structuredError} from './pdir11_historical_regression_fixture.js';

let calls=0,repairArgs;
let result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)return{content:JSON.stringify(candidate()),model:'mock',outputMode:'json_schema'};
    repairArgs=args;
    return{content:JSON.stringify(fallbackSelection(args)),model:'mock',outputMode:'json_object'};
  }
});
assertCanonicalFinal(result);
const prepared=buildGroqRequestBody({task:repairArgs.task,model:DEFAULT_GROQ_MODEL,systemText:repairArgs.systemText,userText:repairArgs.userText,jsonSchema:repairArgs.jsonSchema,strictSchemaCompatible:repairArgs.strictSchemaCompatible});
assert.equal(prepared.contract.mode,'json_object');
assert.deepEqual(prepared.body.response_format,{type:'json_object'});

// Fifth Corrective intent: exactly one initial replay only for structured-output rejection.
calls=0;
result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)throw structuredError();
    if(calls===2)return{content:JSON.stringify(candidate()),model:'mock'};
    return{content:JSON.stringify(fallbackSelection(args)),model:'mock'};
  }
});
assert.equal(calls,3);
assertCanonicalFinal(result);
assert.equal(result.provider.initialStructuredOutputRecoveryAttempted,true);

calls=0;
await assert.rejects(()=>runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence:evidence(),completionRunner:async()=>{calls++;throw structuredError();}}));
assert.equal(calls,2);

calls=0;
const rate=Object.assign(new Error('rate'),{providerDiagnostic:{failureKind:'rate_limit'}});
await assert.rejects(()=>runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence:evidence(),completionRunner:async()=>{calls++;throw rate;}}));
assert.equal(calls,1);
console.log('PDIR-11 fifth corrective intent preserved: provider-light fallback and bounded structured-output recovery remain intact.');

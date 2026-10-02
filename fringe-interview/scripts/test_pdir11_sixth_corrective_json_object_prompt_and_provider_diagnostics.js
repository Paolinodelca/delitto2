import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {buildGroqRequestBody,DEFAULT_GROQ_MODEL} from '../src/infrastructure/groq/groqModelCompatibility.js';
import {parseSafeGroqErrorDiagnostic} from '../src/infrastructure/groq/runGroqChatCompletion.js';
import {evidence,candidate,fallbackSelection,assertCanonicalFinal} from './pdir11_historical_regression_fixture.js';

let calls=0,repairArgs;
const result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)return{content:JSON.stringify(candidate()),model:'mock'};
    repairArgs=args;
    return{content:JSON.stringify(fallbackSelection(args)),model:'mock'};
  }
});
assertCanonicalFinal(result);
const prepared=buildGroqRequestBody({task:repairArgs.task,model:DEFAULT_GROQ_MODEL,systemText:repairArgs.systemText,userText:repairArgs.userText,temperature:repairArgs.temperature,jsonSchema:repairArgs.jsonSchema,strictSchemaCompatible:repairArgs.strictSchemaCompatible});
assert.deepEqual(prepared.body.response_format,{type:'json_object'});
for(const phrase of ['Return ONLY one valid JSON object','Do not return prose','Markdown','code fences','MUST NOT return Evidence text'])assert.match(repairArgs.systemText,new RegExp(phrase,'i'));

const secret='gsk_abcdefghijklmnopqrstuvwxyz123456';
const diagnostic=parseSafeGroqErrorDiagnostic({status:400,task:'continuingPeopleResponsibilitySemanticSupportRepair',model:DEFAULT_GROQ_MODEL,rawText:JSON.stringify({error:{message:`Invalid request. Authorization: Bearer ${secret}. JSON mode failure.`,failed_generation:`partial model output ${secret} ${'x'.repeat(1600)}`,code:'json_object_failed',type:'invalid_request_error'}})});
assert.equal(diagnostic.providerCode,'json_object_failed');
assert.equal(diagnostic.providerType,'invalid_request_error');
assert.ok(diagnostic.providerErrorMessage.includes('Invalid request.'));
assert.ok(diagnostic.providerFailedGeneration.includes('partial model output'));
assert.ok(diagnostic.providerErrorMessage.length<=601);
assert.ok(diagnostic.providerFailedGeneration.length<=1201);
assert.equal(JSON.stringify(diagnostic).includes(secret),false);
assert.equal(JSON.stringify(diagnostic).includes('Bearer gsk_'),false);

const it=JSON.parse(fs.readFileSync(new URL('../config/private_beta_ui.it.json',import.meta.url),'utf8'));
const uiMessage=it?.directionAcquisitionProviderFailure||'';
assert.ok(uiMessage.length>0);
assert.doesNotMatch(uiMessage,/Groq|provider|400|json|schema|structured|failed_generation/i);
console.log('PDIR-11 sixth corrective intent preserved: JSON Object instructions and bounded safe diagnostics remain intact.');

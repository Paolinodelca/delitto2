import assert from 'node:assert/strict';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {buildGroqRequestBody,DEFAULT_GROQ_MODEL} from '../src/infrastructure/groq/groqModelCompatibility.js';
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
assert.ok(repairArgs.jsonSchema);
assert.deepEqual(repairArgs.jsonSchema.required,['selections']);
assert.equal(repairArgs.jsonSchema.additionalProperties,false);
const item=repairArgs.jsonSchema.properties.selections.items;
assert.deepEqual(item.required,['field','candidateId']);
assert.equal(item.additionalProperties,false);
assert.deepEqual(Object.keys(item.properties).sort(),['candidateId','field']);
assert.equal(JSON.stringify(repairArgs.jsonSchema).includes('excerpt'),false);
assert.equal(JSON.stringify(repairArgs.jsonSchema).includes('start'),false);
assert.equal(JSON.stringify(repairArgs.jsonSchema).includes('end'),false);

const prepared=buildGroqRequestBody({task:repairArgs.task,model:DEFAULT_GROQ_MODEL,systemText:repairArgs.systemText,userText:repairArgs.userText,temperature:repairArgs.temperature,jsonSchema:repairArgs.jsonSchema,strictSchemaCompatible:repairArgs.strictSchemaCompatible});
assert.equal(prepared.contract.mode,'json_object');
assert.deepEqual(prepared.body.response_format,{type:'json_object'});
console.log('PDIR-11 fourth corrective intent preserved: flat JSON Object selection contract exposes only field + candidateId.');

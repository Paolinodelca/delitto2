import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {buildGroqRequestBody,DEFAULT_GROQ_MODEL} from '../src/infrastructure/groq/groqModelCompatibility.js';
import {evidence,candidate,fallbackSelection,repairPayloadFromArgs,assertCanonicalFinal,kinds} from './pdir11_historical_regression_fixture.js';

let calls=0,repairArgs;
const c=candidate();
const result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)return{content:JSON.stringify(c),model:'mock',outputMode:'json_schema'};
    repairArgs=args;
    return{content:JSON.stringify(fallbackSelection(args)),model:'mock',outputMode:'json_object'};
  }
});
assertCanonicalFinal(result);
const payload=repairPayloadFromArgs(repairArgs);
assert.deepEqual(payload.validatedCandidate,c);
assert.deepEqual(payload.unresolvedSelectionMap.map(x=>x.field),['responsibilityKinds[2]']);
assert.equal(payload.unresolvedSelectionMap[0].semanticValue,kinds[2]);
assert.equal(payload.unresolvedSelectionMap[0].candidateSupportClaim,c.support.responsibilityKinds[2]);
assert.ok(payload.unresolvedSelectionMap[0].candidates.length>0);
assert.match(repairArgs.systemText,/FIELD and SEMANTIC VALUE/i);
assert.match(repairArgs.systemText,/candidateId/i);
assert.match(repairArgs.systemText,/MUST NOT return Evidence text/i);

const prepared=buildGroqRequestBody({task:repairArgs.task,model:DEFAULT_GROQ_MODEL,systemText:repairArgs.systemText,userText:repairArgs.userText,temperature:repairArgs.temperature,jsonSchema:repairArgs.jsonSchema,strictSchemaCompatible:repairArgs.strictSchemaCompatible});
assert.equal(prepared.contract.mode,'json_object');
assert.deepEqual(prepared.body.response_format,{type:'json_object'});
assert.equal(prepared.body.include_reasoning,false);
assert.equal(prepared.body.reasoning_effort,'low');
assert.equal(prepared.body.max_completion_tokens,2000);
assert.equal(prepared.body.temperature,0);

for(const task of ['decisionAccountabilitySemanticExecutor','answerAnnotation','professionalPerception']){
  const other=buildGroqRequestBody({task,model:DEFAULT_GROQ_MODEL,systemText:'system',userText:'user'}).body;
  assert.equal(Object.prototype.hasOwnProperty.call(other,'reasoning_effort'),false,`${task} must retain existing reasoning configuration`);
}
const source=fs.readFileSync(new URL('../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js',import.meta.url),'utf8');
for(const forbidden of ['normalize(','localeCompare(','levenshtein'])assert.doesNotMatch(source,new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
console.log('PDIR-11 eighth corrective intent preserved: explicit fallback mapping and task-specific low/2000 stabilization remain intact.');

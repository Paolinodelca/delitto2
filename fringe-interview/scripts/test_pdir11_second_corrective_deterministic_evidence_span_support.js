import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {evidence,candidate,fallbackSelection,repairPayloadFromArgs,assertCanonicalFinal,exactFallback} from './pdir11_historical_regression_fixture.js';

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
assert.equal(calls,2);
assertCanonicalFinal(result);
const payload=repairPayloadFromArgs(repairArgs);
assert.equal(payload.unresolvedSelectionMap.length,1);
assert.equal(payload.unresolvedSelectionMap[0].field,'responsibilityKinds[2]');
assert.equal(payload.unresolvedSelectionMap[0].candidateSupportClaim.includes('partecipò'),true);
assert.equal(payload.unresolvedSelectionMap[0].candidates.some(item=>item.excerpt===exactFallback),true);
assert.equal(result.candidate.support.responsibilityKinds[2],exactFallback);

// Second Corrective intent: materialization is deterministic application work; no fuzzy/normalization shortcut.
const source=fs.readFileSync(new URL('../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js',import.meta.url),'utf8');
for(const forbidden of ['normalize(','localeCompare(','levenshtein'])assert.doesNotMatch(source,new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
console.log('PDIR-11 second corrective intent preserved: deterministic exact Evidence materialization with no fuzzy/normalization repair.');

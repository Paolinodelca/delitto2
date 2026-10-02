import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {live,evidence,candidate,exactFallback,repairPayloadFromArgs,selectionForExactExcerpt,selectionRepair,assertCanonicalFinal} from './pdir11_historical_regression_fixture.js';

function validRepair(args,fieldsAndExcerpts){
  return selectionRepair(fieldsAndExcerpts.map(([field,excerpt])=>selectionForExactExcerpt(args,field,excerpt)));
}

// Verbatim fields bypass provider entirely.
let calls=0;
let result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async()=>({content:JSON.stringify(candidate({mutatedLast:false})),model:'mock'})
});
assert.equal(result.supported,true);assert.equal(calls,0); // runner itself is invoked below through explicit counter fixture

calls=0;
result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async()=>{calls++;return{content:JSON.stringify(candidate({mutatedLast:false})),model:'mock'};}
});
assert.equal(calls,1);
assert.equal(result.provider.supportRepairAttempted,false);

// Only unresolved field enters fallback; every offered candidate is exact application-owned Evidence.
let repairArgs;
calls=0;
result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)return{content:JSON.stringify(candidate()),model:'mock'};
    repairArgs=args;
    return{content:JSON.stringify(validRepair(args,[['responsibilityKinds[2]',exactFallback]])),model:'mock',outputMode:'json_object'};
  }
});
assert.equal(calls,2);assertCanonicalFinal(result);
const payload=repairPayloadFromArgs(repairArgs);
assert.deepEqual(payload.unresolvedSelectionMap.map(x=>x.field),['responsibilityKinds[2]']);
for(const entry of payload.unresolvedSelectionMap)for(const offered of entry.candidates)assert.equal(live.includes(offered.excerpt),true,offered.excerpt);
assert.equal(payload.unresolvedSelectionMap[0].candidates.some(x=>x.excerpt===exactFallback),true);
assert.equal(result.candidate.support.responsibilityKinds[2],exactFallback);

// Provider output contract is selection-only: no Evidence string and no offsets.
assert.deepEqual(repairArgs.jsonSchema.required,['selections']);
const selectionItem=repairArgs.jsonSchema.properties.selections.items;
assert.deepEqual(Object.keys(selectionItem.properties).sort(),['candidateId','field']);
const schemaText=JSON.stringify(repairArgs.jsonSchema);
for(const forbidden of ['excerpt','start','end'])assert.equal(schemaText.includes(`"${forbidden}"`),false);
assert.match(repairArgs.systemText,/MUST NOT return Evidence text/i);

// Invalid / nonexistent / wrong-field selections fail closed.
const validId=selectionForExactExcerpt(repairArgs,'responsibilityKinds[2]',exactFallback).candidateId;
for(const badRepair of [
  {selections:[{field:'responsibilityKinds[2]',candidateId:'candidate_missing'}]},
  {selections:[{field:'wrong',candidateId:validId}]},
  {selections:[{field:'responsibilityKinds[2]',candidateId:''}]},
  {selections:[{field:'responsibilityKinds[2]',candidateId:validId},{field:'responsibilityKinds[2]',candidateId:validId}]}
]){
  calls=0;
  const bad=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
    evidence:evidence(),
    completionRunner:async()=>({content:JSON.stringify(++calls===1?candidate():badRepair),model:'mock'})
  });
  assert.equal(bad.supported,false);
  assert.equal(bad.diagnostic.repairFailure,'invalid_application_owned_candidate_selection');
}

// Multi-unresolved preserves exact field order/cardinality and materializes application-owned text.
const multi=candidate();
multi.support.responsibilityKinds[1]='organizzò i turni';
calls=0;let multiArgs;
const multiResult=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)return{content:JSON.stringify(multi),model:'mock'};
    multiArgs=args;
    return{content:JSON.stringify(validRepair(args,[['responsibilityKinds[1]','organizzo i turni'],['responsibilityKinds[2]',exactFallback]])),model:'mock'};
  }
});
assert.equal(multiResult.supported,true);
const multiPayload=repairPayloadFromArgs(multiArgs);
assert.deepEqual(multiPayload.unresolvedSelectionMap.map(x=>x.field),['responsibilityKinds[1]','responsibilityKinds[2]']);
assert.deepEqual(multiResult.candidate.support.responsibilityKinds,['definire le priorità e distribuire le attività giornaliere','organizzo i turni',exactFallback]);

// No fuzzy/accent normalization is introduced; supportIsVerbatim remains a final mandatory gate.
const source=fs.readFileSync(new URL('../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js',import.meta.url),'utf8');
for(const forbidden of ['normalize(','localeCompare(','levenshtein'])assert.doesNotMatch(source,new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
assert.match(source,/supportIsVerbatim\(repaired,text\)/);

// Deterministic eventTime and already-grounded fields stay out of fallback.
assert.equal(payload.unresolvedSelectionMap.some(x=>x.field==='eventTime'),false);
assert.equal(result.candidate.eventTime.description,'Da circa due anni');

console.log('PDIR-11 application-owned Evidence candidate selection fallback tests passed.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
const require=createRequire(import.meta.url);const {buildEvidence}=require('../src/core/evidence/buildEvidence');
const live='Da circa due anni coordino stabilmente una decina di operatori nel reparto produttivo. Mi occupo di definire le priorità e distribuire le attività giornaliere, organizzo i turni e partecipo insieme al mio responsabile alle valutazioni periodiche delle persone.';
const candidate={interpretationStatus:'SUPPORTED',responsibilityPresence:'supported',continuity:'continuing',responsibilityMode:'informal_operational',responsibilityKinds:['work_assignment_or_priority_setting','workload_shift_or_schedule_coordination','performance_follow_up_or_feedback'],peopleScope:{kind:'category',value:'una decina di operatori',min:null,max:null},professionalContext:{description:'reparto produttivo',current:true},eventTime:{description:'Da circa due anni'},support:{presence:'coordino stabilmente una decina di operatori',continuity:'Da circa due anni',mode:'coordino stabilmente',peopleScope:'una decina di operatori',professionalContext:'reparto produttivo',responsibilityKinds:['definire le priorità e distribuire le attività giornaliere','organizzo i turni','partecipò insieme al mio responsabile alle valutazioni periodiche delle persone']},limitations:['formal reporting authority not established']};
const evidence=buildEvidence({sourceType:'runtime_answer',sourceRef:'runtime:pdir11-corrective-9',content:{answerText:live},provenance:{capturedAt:'2026-09-11T21:00:00.000Z'},metadata:{version:'1.0'}});
const exactFallback='partecipo insieme al mio responsabile alle valutazioni periodiche delle persone';
function payload(args){return JSON.parse(args.userText.split('\n').find(x=>x.startsWith('{"validatedCandidate"')))}
function repairFor(args){
 const p=payload(args);const entry=p.unresolvedSelectionMap.find(x=>x.field==='responsibilityKinds[2]');const owned=entry.candidates.find(x=>x.excerpt===exactFallback);
 return {selections:[{field:'responsibilityKinds[2]',candidateId:owned?.candidateId||''}]};
}
let calls=0,repairArgs;
const result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence,completionRunner:async args=>{calls++;if(calls===1)return{content:JSON.stringify(candidate),model:'mock',outputMode:'json_schema'};repairArgs=args;return{content:JSON.stringify(repairFor(args)),model:'mock',outputMode:'json_object'};}});
assert.equal(calls,2);assert.equal(result.supported,true);assert.equal(result.provider.supportRepairStatus,'application_owned_candidate_selection_accepted');
assert.match(repairArgs.systemText,/application-owned exact Evidence candidates/i);assert.match(repairArgs.systemText,/MUST NOT return Evidence text/i);assert.doesNotMatch(repairArgs.systemText,/numeric coordinates/i);
const p=payload(repairArgs);
assert.equal(p.unresolvedSelectionMap.length,1);assert.equal(p.unresolvedSelectionMap[0].field,'responsibilityKinds[2]');
assert.equal(p.unresolvedSelectionMap[0].candidates.some(x=>x.excerpt===exactFallback),true);
const expected=['coordino stabilmente una decina di operatori','Da circa due anni','coordino stabilmente','una decina di operatori','reparto produttivo','definire le priorità e distribuire le attività giornaliere','organizzo i turni',exactFallback];
for(const x of expected)assert.equal(live.includes(x),true,x);
assert.equal(result.candidate.support.presence,expected[0]);assert.equal(result.candidate.support.continuity,expected[1]);assert.equal(result.candidate.support.mode,expected[2]);assert.equal(result.candidate.support.peopleScope,expected[3]);assert.equal(result.candidate.support.professionalContext,expected[4]);assert.deepEqual(result.candidate.support.responsibilityKinds,[expected[5],expected[6],expected[7]]);assert.equal(result.candidate.eventTime.description,'Da circa due anni');
assert.equal(result.candidate.support.responsibilityKinds[2].includes('partecipò'),false);

// Ambiguous exact candidate text is not offered as an application-owned fallback candidate.
const ambiguousText=`${live} ${exactFallback}`;const ambiguousEvidence=buildEvidence({sourceType:'runtime_answer',sourceRef:'runtime:pdir11-corrective-9-ambiguous',content:{answerText:ambiguousText},provenance:{capturedAt:'2026-09-11T21:00:00.000Z'},metadata:{version:'1.0'}});
calls=0;
const ambiguous=await runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence:ambiguousEvidence,completionRunner:async args=>{calls++;if(calls===1)return{content:JSON.stringify(candidate),model:'mock'};const ap=payload(args);const entry=ap.unresolvedSelectionMap.find(x=>x.field==='responsibilityKinds[2]');const owned=entry.candidates.find(x=>x.excerpt===exactFallback);assert.equal(owned,undefined);return{content:JSON.stringify({selections:[{field:'responsibilityKinds[2]',candidateId:''}]}),model:'mock'};}});
assert.equal(ambiguous.supported,false);assert.equal(ambiguous.diagnostic.repairFailure,'invalid_application_owned_candidate_selection');

const source=fs.readFileSync(new URL('../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js',import.meta.url),'utf8');for(const forbidden of ['normalize(','localeCompare(','levenshtein'])assert.doesNotMatch(source,new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
console.log('PDIR-11 ninth corrective deterministic application-side source materialization tests passed under candidate-selection fallback.');

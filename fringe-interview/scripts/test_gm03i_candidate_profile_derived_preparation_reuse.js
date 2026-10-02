import assert from 'node:assert/strict';
import { resolveCandidateProfileDerivedPreparation } from '../src/app/candidateProfileDerivedPreparation.js';
const sources=[1,2,3].map(i=>({id:`s${i}`,content:`content ${i}`,sourceRole:i===1?'current_cv':'professional_declaration'}));
let calls=0;const runParser=async({cvText,userNotes})=>{calls++;return {parsed:{candidateProfile:{summary:`${cvText}|${userNotes}`}}};};
const cold=await resolveCandidateProfileDerivedPreparation({professionalSources:sources,userNotes:'n',runParser});assert.equal(calls,4);assert.equal(cold.diagnostics.candidateProfileLogicalCallCount,4);
calls=0;const warm=await resolveCandidateProfileDerivedPreparation({professionalSources:sources,userNotes:'n',existing:cold.derivedPreparation,runParser});assert.equal(calls,0);assert.equal(warm.diagnostics.aggregateHit,true);
calls=0;const changed=await resolveCandidateProfileDerivedPreparation({professionalSources:sources.map((s,i)=>i===1?{...s,content:'changed'}:s),userNotes:'n',existing:cold.derivedPreparation,runParser});assert.equal(calls,2);
calls=0;const notes=await resolveCandidateProfileDerivedPreparation({professionalSources:sources,userNotes:'n2',existing:cold.derivedPreparation,runParser});assert.equal(calls,1);assert.equal(notes.diagnostics.perSourceHitCount,3);
calls=0;const reordered=await resolveCandidateProfileDerivedPreparation({professionalSources:[sources[1],sources[0],sources[2]],userNotes:'n',existing:cold.derivedPreparation,runParser});assert.equal(calls,1);
console.log('GM-03I CandidateProfile derived preparation reuse: PASS');

// GM-03I First Corrective: validated lower-level preparation survives later failures.
{
 const sources=[{id:'s1',content:'one'},{id:'s2',content:'two'},{id:'s3',content:'three'}];
 let calls=0;const checkpoints=[];
 const parser=async()=>{calls++;if(calls===4)throw new Error('HTTP_429');return {parsed:{candidateProfile:{call:calls}}};};
 await assert.rejects(()=>resolveCandidateProfileDerivedPreparation({professionalSources:sources,userNotes:'n',runParser:parser,onDerivedPreparationCheckpoint:async c=>checkpoints.push(c)}));
 assert.equal(checkpoints.length,3);assert.deepEqual(checkpoints.at(-1).derivedPreparation.sources.map(x=>x.sourceRef),['s1','s2','s3']);assert.equal(checkpoints.at(-1).derivedPreparation.aggregate,undefined);
 calls=0;const retry=await resolveCandidateProfileDerivedPreparation({professionalSources:sources,userNotes:'n',existing:checkpoints.at(-1).derivedPreparation,runParser:async()=>{calls++;return {parsed:{candidateProfile:{retry:true}}};}});
 assert.equal(calls,1);assert.equal(retry.diagnostics.perSourceHitCount,3);
}
{
 const sources=[{id:'s1',content:'one'},{id:'s2',content:'two'},{id:'s3',content:'three'}];const checkpoints=[];let calls=0;
 await assert.rejects(()=>resolveCandidateProfileDerivedPreparation({professionalSources:sources,runParser:async()=>{calls++;if(calls===3)throw new Error('invalid');return {parsed:{candidateProfile:{call:calls}}};},onDerivedPreparationCheckpoint:async c=>checkpoints.push(c)}));
 assert.equal(checkpoints.length,2);assert.deepEqual(checkpoints.at(-1).derivedPreparation.sources.map(x=>x.sourceRef),['s1','s2']);
}
console.log('GM-03I First Corrective progressive persistence: PASS');

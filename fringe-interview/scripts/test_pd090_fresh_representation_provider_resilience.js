import assert from 'node:assert/strict';
import { resolveCandidateProfileDerivedPreparation } from '../src/app/candidateProfileDerivedPreparation.js';
import { candidateProfilePacingDecision, isTransientCandidateProfileProviderFailure } from '../src/app/privateBetaStagedInterviewJourney.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const sources=[1,2,3,4].map(i=>({id:`source_${i}`,content:`professional source ${i}`,sourceRole:i===1?'current_cv':i===2?'previous_cv':i===3?'professional_declaration':'candidate_profile'}));

function success(call,{remainingTokens='9000',resetTokens='0s'}={}){
 return {parsed:{candidateProfile:{call}},modelMeta:{provider:'groq',task:'candidateProfile',rateLimitMetadata:{remainingTokens,resetTokens,tokenResetMs:0,retryAfter:null,retryAfterMs:null,recommendedWaitMs:0}}};
}
function rateLimitError(){
 const error=new Error('Groq provider request failed for candidateProfile with status 429.');
 error.status=429;error.task='candidateProfile';error.providerDiagnostic={failureKind:'rate_limit',providerCode:'rate_limit_exceeded',providerType:'tokens',rateLimitMetadata:{remainingTokens:'0',resetTokens:'48s',tokenResetMs:48000}};
 return error;
}

// Real failure shape: sources 1-3 validate/checkpoint, source 4 repeatedly rate-limited.
{
 let calls=0;const checkpoints=[];const progress=[];
 await assert.rejects(()=>resolveCandidateProfileDerivedPreparation({
  professionalSources:sources,
  runParser:async()=>{calls++;if(calls===4)throw rateLimitError();return success(calls);},
  onDerivedPreparationCheckpoint:async c=>checkpoints.push(c),
  onSourceProgress:r=>progress.push(r)
 }),/429/);
 assert.equal(calls,4);
 assert.equal(checkpoints.length,3);
 assert.deepEqual(checkpoints.at(-1).derivedPreparation.sources.map(x=>x.sourceRef),['source_1','source_2','source_3']);
 assert(progress.some(x=>x.stage==='source_provider_failed'&&x.sourceRef==='source_4'));

 // Retry: provider MUST be called only for source 4 plus aggregate; sources 1-3 are checkpoint hits.
 let retryCalls=0;
 const retry=await resolveCandidateProfileDerivedPreparation({
  professionalSources:sources,
  existing:checkpoints.at(-1).derivedPreparation,
  runParser:async()=>success(++retryCalls)
 });
 assert.equal(retry.diagnostics.perSourceHitCount,3);
 assert.equal(retry.diagnostics.perSourceMissCount,1);
 assert.equal(retry.diagnostics.resumeFromCheckpoint,true);
 assert.equal(retryCalls,2,'retry should call only source 4 and aggregate, never sources 1-3');
 assert.deepEqual(retry.diagnostics.sources.slice(0,3).map(x=>x.providerCallSkipped),[true,true,true]);
}

// Token-headroom pacing uses the canonical 4096 CandidateProfile budget and provider reset metadata.
{
 const pacing=candidateProfilePacingDecision({previousProviderMeta:{rateLimitMetadata:{remainingTokens:'829',resetTokens:'53.8s',tokenResetMs:53800,retryAfterMs:null}}});
 assert.equal(pacing.nextCompletionTokenBudget,4096);
 assert.equal(pacing.tokenHeadroomSufficient,false);
 assert.equal(pacing.chosenWaitMs,53800);
 assert.equal(pacing.pacingReason,'insufficient_token_headroom_for_dependent_call');
 const enough=candidateProfilePacingDecision({previousProviderMeta:{rateLimitMetadata:{remainingTokens:'9000',resetTokens:'53.8s',tokenResetMs:53800}}});
 assert.equal(enough.chosenWaitMs,0);
 assert.equal(enough.tokenHeadroomSufficient,true);
}

// Changed source invalidates only that source preparation; aggregate recomputes.
{
 let initialCalls=0;
 const cold=await resolveCandidateProfileDerivedPreparation({professionalSources:sources,runParser:async()=>success(++initialCalls)});
 let changedCalls=0;
 const changedSources=sources.map((s,i)=>i===1?{...s,content:'changed professional source 2'}:s);
 const changed=await resolveCandidateProfileDerivedPreparation({professionalSources:changedSources,existing:cold.derivedPreparation,runParser:async()=>success(++changedCalls)});
 assert.equal(changed.diagnostics.perSourceHitCount,3);
 assert.equal(changed.diagnostics.perSourceMissCount,1);
 assert.equal(changedCalls,2);
}

// Canonical/schema failure is not classified as transient; 503 and 429 are.
{
 const canonical=new Error('validateParserResult: schema violation');
 assert.equal(isTransientCandidateProfileProviderFailure(canonical),false);
 const unavailable=new Error('provider 503');unavailable.status=503;unavailable.providerDiagnostic={failureKind:'provider_unavailable'};
 assert.equal(isTransientCandidateProfileProviderFailure(unavailable),true);
 assert.equal(isTransientCandidateProfileProviderFailure(rateLimitError()),true);
}



// Candidate-facing transient provider failure is not blamed on Candidate input.
{
 const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{status:'blocked',completed:false,phase:'purpose_understand',error:{code:'SERVICE_UNAVAILABLE',resumable:true}}});
 assert(html.includes('Le informazioni già elaborate sono state conservate'));
 assert(!html.includes('Puoi controllare i dati e riprovare'));
}

// Active-profile isolation: a preparation bound to another Professional Identity is never reused.
{
 let callsA=0;
 const a=await resolveCandidateProfileDerivedPreparation({professionalSources:sources,profileBindingRef:'profile:A',runParser:async()=>success(++callsA)});
 let callsB=0;
 const b=await resolveCandidateProfileDerivedPreparation({professionalSources:sources,profileBindingRef:'profile:B',existing:a.derivedPreparation,runParser:async()=>success(++callsB)});
 assert.equal(b.diagnostics.profileBindingMatch,false);
 assert.equal(b.diagnostics.perSourceHitCount,0);
 assert.equal(callsB,5,'different profile binding must force four source calls plus aggregate');
}

console.log('PD-090 progressive source resume and token-headroom pacing: PASS');

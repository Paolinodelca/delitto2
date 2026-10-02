import assert from 'node:assert/strict';
import { projectGroqRateLimitMetadata, MAX_DEPENDENT_TOKEN_RESET_WAIT_MS } from '../src/infrastructure/groq/runGroqChatCompletion.js';
import { resolveDependentTokenHeadroomPacing, createLiveHigherOrderProfessionalSynthesisProvider } from '../src/app/liveHigherOrderProfessionalSynthesisProvider.js';
import { resolveGroqTaskCompletionBudget } from '../src/infrastructure/groq/groqModelCompatibility.js';

const budget=resolveGroqTaskCompletionBudget({task:'higherOrderProfessionalSynthesis'});
assert.equal(budget,4000);
const metadata=(headers)=>projectGroqRateLimitMetadata({headers:new Headers(headers)});

const ample=resolveDependentTokenHeadroomPacing({rateLimitMetadata:metadata({'x-ratelimit-remaining-tokens':'9000','x-ratelimit-reset-tokens':'54s'}),nextCompletionTokenBudget:budget});
assert.equal(ample.tokenHeadroomSufficient,true);assert.equal(ample.chosenWaitMs,0);

const real=resolveDependentTokenHeadroomPacing({rateLimitMetadata:metadata({'x-ratelimit-remaining-tokens':'829','x-ratelimit-reset-tokens':'53.8s'}),nextCompletionTokenBudget:budget});
assert.equal(real.tokenHeadroomSufficient,false);assert.equal(real.chosenWaitMs,53800);assert.equal(real.pacingReason,'insufficient_token_headroom_for_dependent_call');
assert(real.chosenWaitMs>10000);

const absent=resolveDependentTokenHeadroomPacing({rateLimitMetadata:null,nextCompletionTokenBudget:budget});
assert.equal(absent.tokenHeadroomSufficient,null);assert.equal(absent.chosenWaitMs,0);
const malformed=resolveDependentTokenHeadroomPacing({rateLimitMetadata:metadata({'x-ratelimit-remaining-tokens':'829','x-ratelimit-reset-tokens':'bad'}),nextCompletionTokenBudget:budget});
assert.equal(malformed.tokenHeadroomSufficient,false);assert.equal(malformed.chosenWaitMs,0);
const bounded=resolveDependentTokenHeadroomPacing({rateLimitMetadata:metadata({'x-ratelimit-remaining-tokens':'1','x-ratelimit-reset-tokens':'99m'}),nextCompletionTokenBudget:budget});
assert.equal(bounded.chosenWaitMs,MAX_DEPENDENT_TOKEN_RESET_WAIT_MS);assert.equal(MAX_DEPENDENT_TOKEN_RESET_WAIT_MS,65000);

// Same-request retry remains on the original short clamp even though tokenResetMs is preserved for dependent-call pacing.
const longReset=metadata({'x-ratelimit-remaining-tokens':'0','x-ratelimit-reset-tokens':'54s'});
assert.equal(longReset.tokenResetMs,54000);assert.equal(longReset.recommendedWaitMs,10000);

// Diagnostics are passive and semantic provider output is unchanged when no wait is required.
const contributor={contributorRef:'relationship:R1',contributorType:'grounded_descriptive_professional_relationship',nativeRef:'R1',semanticContent:{wording:'w',basis:'b'},claimShape:{},materialRefs:['m1'],sourceRefs:['s1'],professionalBasisRefs:['e1'],semanticCeiling:{}};
const proposal={proposalRef:'p1',contributorRefs:['relationship:R1'],wording:'w',compositionBasis:'b',claimShape:{structureClaim:'descriptive_combination',personPropertyAssertion:'none',continuityAssertion:'none',leadershipAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',generalAutonomyAssertion:'none',resultCausalityAssertion:'none',targetRelationAssertion:'none'}};
const runner=async()=>({model:'controlled',structured:{structureProposals:[proposal]}});
const events=[];
const provider=createLiveHigherOrderProfessionalSynthesisProvider({modelRunner:runner,beforeCallPacing:()=>ample,diagnosticSink:x=>events.push(x)});
const result=await provider.proposalProvider({contributors:[contributor]});
assert.equal(result.length,1);const d=events.find(x=>x.stage==='dependent_call_pacing_decision');assert(d);assert.equal(d.tokenHeadroomSufficient,true);assert.equal(d.chosenWaitMs,0);

console.log('GM-02I Second Corrective token-headroom-aware dependent-call pacing: PASS');

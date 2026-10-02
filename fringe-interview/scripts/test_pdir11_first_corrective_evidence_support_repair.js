import assert from 'node:assert/strict';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {evidence,candidate,fallbackSelection,selectionRepair,assertCanonicalFinal} from './pdir11_historical_regression_fixture.js';

let calls=0;
let result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)return{content:JSON.stringify(candidate()),model:'mock',outputMode:'json_schema'};
    return{content:JSON.stringify(fallbackSelection(args)),model:'mock',outputMode:'json_object'};
  }
});
assert.equal(calls,2);
assertCanonicalFinal(result);
assert.equal(result.provider.supportRepairStatus,'application_owned_candidate_selection_accepted');

// First Corrective intent: provider cannot inject unsupported/provider-authored Evidence.
// Unknown IDs and wrong fields fail closed.
for(const repair of [
  selectionRepair([{field:'responsibilityKinds[2]',candidateId:'candidate_not_application_owned'}]),
  selectionRepair([{field:'wrong',candidateId:'candidate_not_application_owned'}])
]){
  calls=0;
  result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
    evidence:evidence(),
    completionRunner:async()=>({content:JSON.stringify(++calls===1?candidate():repair),model:'mock'})
  });
  assert.equal(result.supported,false);
  assert.equal(result.reason,'unsupported_candidate_support');
  assert.equal(result.diagnostic.repairFailure,'invalid_application_owned_candidate_selection');
}
console.log('PDIR-11 first corrective intent preserved: provider cannot inject unsupported Evidence under application-owned candidate selection.');

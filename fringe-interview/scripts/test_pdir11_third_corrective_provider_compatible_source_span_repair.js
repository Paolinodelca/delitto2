import assert from 'node:assert/strict';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {evidence,candidate,fallbackSelection,assertCanonicalFinal} from './pdir11_historical_regression_fixture.js';

let calls=0,repairArgs;
let result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
  evidence:evidence(),
  completionRunner:async args=>{
    calls++;
    if(calls===1)return{content:JSON.stringify(candidate()),model:'mock',outputMode:'json_schema'};
    repairArgs=args;
    return{content:JSON.stringify(fallbackSelection(args)),model:'mock',outputMode:'json_object'};
  }
});
assertCanonicalFinal(result);
assert.equal(repairArgs.task,'continuingPeopleResponsibilitySemanticSupportRepair');
assert.equal(repairArgs.strictSchemaCompatible,false);
assert.match(repairArgs.systemText,/application-owned exact Evidence candidates/i);
assert.match(repairArgs.systemText,/MUST NOT return Evidence text/i);
assert.doesNotMatch(repairArgs.systemText,/generate numeric coordinates/i);

// Third Corrective intent: malformed/shape-incompatible provider output fails closed.
for(const bad of ['{bad json',JSON.stringify({selections:[{field:'wrong',candidateId:'x'}]}),JSON.stringify({selections:[]}),JSON.stringify({groundedExcerpts:[]})]){
  calls=0;
  result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence:evidence(),completionRunner:async()=>({content:++calls===1?JSON.stringify(candidate()):bad,model:'mock'})});
  assert.equal(result.supported,false);
  assert.equal(result.diagnostic.category,'source_span_repair_rejected');
}
console.log('PDIR-11 third corrective intent preserved: bounded candidate-selection repair remains strict and fail-closed.');

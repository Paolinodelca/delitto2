import assert from 'node:assert/strict';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {evidence,candidate,fallbackSelection,repairPayloadFromArgs} from './pdir11_historical_regression_fixture.js';

for(const count of [1,2,3]){
  const c=candidate({kindCount:count,mutatedLast:count===3});
  let calls=0,captured;
  const result=await runGroqContinuingPeopleResponsibilitySemanticExecutor({
    evidence:evidence(),
    completionRunner:async args=>{
      calls++;
      if(calls===1)return{content:JSON.stringify(c),model:'mock'};
      captured=args;
      return{content:JSON.stringify(fallbackSelection(args)),model:'mock'};
    }
  });
  assert.equal(result.candidate.support.responsibilityKinds.length,count,`final cardinality ${count}`);
  assert.deepEqual(result.candidate.responsibilityKinds,c.responsibilityKinds,`semantic order ${count}`);
  if(count<3){
    assert.equal(calls,1,`exact claims with cardinality ${count} should not require provider fallback`);
    assert.equal(result.supported,true);
  }else{
    assert.equal(calls,2);
    assert.equal(result.supported,true);
    const payload=repairPayloadFromArgs(captured);
    assert.deepEqual(payload.unresolvedSelectionMap.map(x=>x.field),['responsibilityKinds[2]']);
    assert.equal(payload.unresolvedSelectionMap[0].semanticValue,c.responsibilityKinds[2]);
    assert.equal(payload.unresolvedSelectionMap[0].candidateSupportClaim,c.support.responsibilityKinds[2]);
  }
}
console.log('PDIR-11 seventh corrective intent preserved: grounding priority and responsibilityKinds cardinality/order remain exact.');

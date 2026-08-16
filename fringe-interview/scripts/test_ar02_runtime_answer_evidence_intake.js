import assert from 'assert';
import { buildAcceptedRuntimeAnswerEvidenceStore } from '../src/app/registerAcceptedRuntimeAnswerEvidence.js';

const answers=[
 {stepType:'question',phaseName:'CASE_1',answerText:'I aligned Mechanical, Software, Validation, Manufacturing and Purchasing stakeholders with conflicting priorities.',timestamp:'2026-08-16T18:00:00.000Z',questionContext:{questionKey:'stakeholder_interaction',questionText:'Describe a stakeholder conflict.',expectedSignals:['stakeholder_management','cross_functional_coordination']}},
 {stepType:'question',phaseName:'DEPTH_CHECK',answerText:'I contributed to cost evaluation and cost reduction, but I did not own the program budget, P&L, formal resource allocation, or overall program accountability.',timestamp:'2026-08-16T18:01:00.000Z',questionContext:{questionKey:'budget_scope',questionText:'What budget responsibility did you own?',expectedSignals:['scope_of_ownership','cost_awareness']}},
 {stepType:'question',phaseName:'CASE_1',answerText:'I worked with the Software team during system integration; I did not own Software Engineering.',timestamp:'2026-08-16T18:02:00.000Z',questionContext:{questionKey:'cross_functional_software',questionText:'How did you work with Software?',expectedSignals:['cross_functional_coordination']}}
];
const store=buildAcceptedRuntimeAnswerEvidenceStore({betaSessionId:'beta-ar02',interviewSessionId:'interview-ar02',answers});
assert.equal(store.evidence.length,3);
for(const [i,e] of store.evidence.entries()){
 assert.equal(e.type,'source_content');
 assert.equal(e.sourceType,'interview_runtime_answer');
 assert.equal(e.sourceRole,'accepted_runtime_answer');
 assert.equal(e.content.provenance.betaSessionRef,'betaSession:beta-ar02');
 assert.equal(e.content.provenance.interviewSessionRef,'interviewSession:interview-ar02');
 assert.equal(e.content.provenance.answerRef,`runtimeAnswer:${i+1}`);
}
assert.ok(store.evidence[0].content.questionContext.expectedSignals.includes('stakeholder_management'));
assert.match(store.evidence[1].content.answerText,/did not own the program budget/i);
assert.match(store.evidence[1].content.answerText,/cost evaluation/i);
assert.match(store.evidence[2].content.answerText,/worked with the Software team/i);
assert.match(store.evidence[2].content.answerText,/did not own Software Engineering/i);
assert.equal('knowledge' in store.evidence[1],false,'Evidence intake must not invent Knowledge semantics.');
console.log('AR-02 accepted Runtime answer canonical Evidence intake tests PASSED');

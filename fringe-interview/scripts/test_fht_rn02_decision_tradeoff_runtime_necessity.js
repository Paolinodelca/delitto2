import assert from 'node:assert/strict';
import { evaluateDecisionTradeoffQuestionNecessity } from '../src/interview/evaluateDecisionTradeoffQuestionNecessity.js';
import { createInterviewRuntime } from '../src/interview/createInterviewRuntime.js';
import { advanceInterviewRuntime } from '../src/interview/advanceInterviewRuntime.js';
import { composeInterviewSession } from '../src/interview/composeInterviewSession.js';

const RS='knowledgeAcquisitionRuntimeSession:rs-da';
const planning={purposes:[{goal:'decision_accountability',runtimeSession:{id:'rs-da'}}]};
const da=(action,opts={})=>({semanticType:'decision_accountability',knowledgeSnapshot:opts.knowledge===false?null:{snapshotId:'ks1'},knowledgeRef:opts.knowledge===false?null:'ks1',sourceExecutionRef:opts.execution===false?'':'knowledgeAcquisitionExecution:e1',sourceRuntimeSessionRef:opts.session||RS,sourceRuntimeActionRef:`interviewQuestion:${action}`,sourceEvidenceRef:opts.evidence===false?'':'ev1',semanticExecutionTrace:opts.failed?{status:'failed',category:'provider_structured_output_rejection'}:{status:'succeeded',category:'knowledge_produced'}});
const evalN=(items)=>evaluateDecisionTradeoffQuestionNecessity({questionKey:'decision_tradeoffs',planning,runtimeKnowledgeResults:items});
assert.equal(evalN([da('decision_tradeoff_probe')]).decision,'suppress');
assert.equal(evalN([]).decision,'preserve');
assert.equal(evalN([da('opening_career_walkthrough')]).decision,'preserve');
assert.equal(evalN([{...da('decision_tradeoff_probe'),semanticType:'quantified_outcome'}]).decision,'preserve');
assert.equal(evalN([da('decision_tradeoff_probe',{failed:true,knowledge:false})]).decision,'preserve');
assert.equal(evalN([da('decision_tradeoff_probe',{evidence:false})]).decision,'preserve');
assert.equal(evalN([da('decision_tradeoff_probe',{session:'knowledgeAcquisitionRuntimeSession:other'})]).decision,'preserve');
assert.equal(evaluateDecisionTradeoffQuestionNecessity({questionKey:'stakeholder_interaction',planning,runtimeKnowledgeResults:[da('decision_tradeoff_probe')]}).applicable,false);

const session={id:'rn02-session',openingBlock:{question:'Opening',questionKey:'opening_career_walkthrough'},coreQuestionBlocks:[{question:'Tradeoff',familyKey:'decision_tradeoffs'},{question:'Stakeholder',familyKey:'stakeholder_interaction'}],followupBlocks:[],closingBlock:{question:'Closing',questionKey:'closing'}};
let runtime=createInterviewRuntime({interviewSession:session,productMode:'free'}).interviewRuntime;
const advanced=await advanceInterviewRuntime({interviewSession:session,interviewRuntime:runtime,answerText:'Accepted opening answer',beforeAdaptiveDecision:async({runtime})=>{runtime.meta={...(runtime.meta||{}),fhtAcquisitionDecisionContext:{planning,runtimeKnowledgeResults:[da('decision_tradeoff_probe')]}};return {runtime};}});
runtime=advanced.interviewRuntime;
assert.equal(runtime.currentStep?.payload?.familyKey,'stakeholder_interaction','suppression must advance exactly to the next unrelated Core step');
assert.deepEqual(runtime.runtimeState.extensions?.fhtRuntimeNecessity?.suppressedQuestionKeys,['decision_tradeoffs']);
assert.equal(runtime.runtimeState.answers.length,1,'suppressed question must not create an answer');
assert.equal(runtime.runtimeState.isCompleted,false);
console.log('FHT-RN02 deterministic necessity and progression: PASS');

// RN02 corrective: production composition must preserve canonical question identity separately
// from the structural primary_* slot identity used by the composed Runtime block.
const composed = composeInterviewSession({
  interviewPlan: { sessionStrategy: {}, priorityTopics: [], reportEmphasis: {} },
  interviewQuestionSet: {
    primaryQuestions: [
      {
        question: 'Tradeoff composed',
        familyKey: 'primary_2',
        canonicalQuestionKey: 'decision_tradeoffs',
        familyLabel: 'Decision',
        narrativeRole: 'DECISION_PROBE',
        source: 'contextual_selection'
      },
      {
        question: 'Stakeholder composed',
        familyKey: 'primary_3',
        canonicalQuestionKey: 'stakeholder_interaction',
        familyLabel: 'Stakeholder',
        narrativeRole: 'PRESSURE_PROBE',
        source: 'contextual_selection'
      }
    ],
    selectedQuestionFamilies: [],
    selectedFollowupPacks: [],
    priorityTopics: []
  }
}).interviewSession;
assert.equal(composed.coreQuestionBlocks[0].familyKey, 'primary_2', 'structural family identity must remain stable');
assert.equal(composed.coreQuestionBlocks[0].canonicalQuestionKey, 'decision_tradeoffs', 'canonical identity must survive composition');
let composedRuntime=createInterviewRuntime({interviewSession:composed,productMode:'free'}).interviewRuntime;
composedRuntime=(await advanceInterviewRuntime({
  interviewSession:composed,
  interviewRuntime:composedRuntime,
  answerText:'Accepted opening answer',
  beforeAdaptiveDecision:async({runtime})=>{
    runtime.meta={...(runtime.meta||{}),fhtAcquisitionDecisionContext:{planning,runtimeKnowledgeResults:[da('decision_tradeoff_probe')]}};
    return {runtime};
  }
})).interviewRuntime;
assert.equal(composedRuntime.currentStep?.payload?.canonicalQuestionKey,'stakeholder_interaction');
assert.deepEqual(composedRuntime.runtimeState.extensions?.fhtRuntimeNecessity?.suppressedQuestionKeys,['decision_tradeoffs']);
console.log('FHT-RN02 canonical Core identity corrective: PASS');

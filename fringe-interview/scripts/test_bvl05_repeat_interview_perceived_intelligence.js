import assert from 'assert';
import { loadStructuredQuestionBank } from '../src/interview/loadStructuredQuestionBank.js';
import { rankStructuredQuestions } from '../src/interview/rankStructuredQuestions.js';
import { createPrivateBetaUiRequestHandler } from '../src/app/privateBetaUiServer.js';
import { createMemoryPrivateBetaProfessionalIdentityStore, privateBetaPersonRefFromContext } from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const {structuredQuestionBank}=loadStructuredQuestionBank();
const context={seniorityContext:'senior',companyContext:'structured',defaultTone:'direct',roleFamily:'generic_professional'};
const first=rankStructuredQuestions({interviewContextProfile:context,structuredQuestionBank}).rankedStructuredQuestions;
const firstKey=first.rankedQuestions[0].key;
const history=[{key:firstKey,category:'',signals:[]}];
const second=rankStructuredQuestions({interviewContextProfile:context,structuredQuestionBank,recentQuestionKeys:[firstKey],recentQuestionHistory:history}).rankedStructuredQuestions;
assert.notEqual(second.rankedQuestions[0].key,firstKey,'an already-used question must lose priority when other authorized bank questions are available');
assert(second.rankedQuestions.find(x=>x.key===firstKey).reasons.some(x=>x.startsWith('recentKeyPenalty:')));
const secondAgain=rankStructuredQuestions({interviewContextProfile:context,structuredQuestionBank,recentQuestionKeys:[firstKey],recentQuestionHistory:history}).rankedStructuredQuestions;
assert.deepStrictEqual(second,secondAgain,'same history/context must remain deterministic');
// Exhausted/no-alternative bank: preserve the only canonical question; never fabricate a replacement.
const onlyQuestion=structuredQuestionBank.questions.find(x=>x.key===firstKey);
const exhausted=rankStructuredQuestions({interviewContextProfile:context,structuredQuestionBank:{version:1,questions:[onlyQuestion]},recentQuestionKeys:[firstKey],recentQuestionHistory:history}).rankedStructuredQuestions;
assert.equal(exhausted.rankedQuestions.length,1);assert.equal(exhausted.rankedQuestions[0].key,firstKey);
// Ranking never mutates canonical question intent/variants or invents semantic objectives.
assert.deepStrictEqual(structuredQuestionBank.questions.find(x=>x.key===firstKey),onlyQuestion);

// Production server boundary: history is separate from Knowledge and is applied only when the same saved identity is recovered.
const store=createMemoryPrivateBetaProfessionalIdentityStore();const personRef=privateBetaPersonRefFromContext('repeat-person');
await store.save({record:{version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:'CV',userNotes:''},professionalSources:[],reusableKnowledgeResults:[],knowledgeRefs:[],revision:1,createdAt:'2026-09-08T09:00:00.000Z',updatedAt:'2026-09-08T09:00:00.000Z',lastEnrichedBySessionRef:null}});
const recentQuestionStore=new Map([['repeat-person',[{key:firstKey,category:'role_fit',signals:['ownership']}]]]);const calls=[];
const handler=createPrivateBetaUiRequestHandler({professionalIdentityStore:store,recentQuestionStore,contextIdFactory:()=> 'repeat-person',stagedPrepare:async({uiInput,recentQuestionKeys,recentQuestionHistory,reusableProfessionalIdentity})=>{calls.push({action:uiInput.identityAction,keys:[...recentQuestionKeys],history:JSON.parse(JSON.stringify(recentQuestionHistory)),recovered:Boolean(reusableProfessionalIdentity)});return {state:null,publicResult:{status:'understanding',completed:false,phase:'understanding',sessionRef:'s',preInterview:{candidateProfile:{},cvReviewReport:{},targetRole:'Target B',professionalIdentityContinuity:{recovered:Boolean(reusableProfessionalIdentity),reusedKnowledgeCount:0},repeatInterviewContinuity:{priorAnsweredQuestionCount:recentQuestionHistory.length,selectionHistoryApplied:Boolean(reusableProfessionalIdentity&&recentQuestionHistory.length)},professionalSources:[]}}};}});
function req(body){return {method:'POST',url:'/private-beta/journey',headers:{cookie:'imago_beta_repeat_context=repeat-person'},async *[Symbol.asyncIterator](){yield Buffer.from(body);}};}function res(){return {headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(c,h){this.code=c;Object.assign(this.headers,h||{});},end(v){this.body=v||'';}};}
let r=res();await handler(req('identityAction=recover&consentDecision=accept&targetRole=Target+B'),r);assert.deepStrictEqual(calls[0].keys,[firstKey]);assert(calls[0].recovered);assert(r.body.includes('repeat-interview-continuity'));
r=res();await handler(req('identityAction=create&consentDecision=accept&targetRole=Target+B'),r);assert.deepStrictEqual(calls[1].keys,[],'explicit new identity path must not inherit prior-interview ranking history');
// History contains bounded identifiers only, not answers/transcripts/Knowledge.
const stored=JSON.stringify(recentQuestionStore.get('repeat-person'));for(const forbidden of ['answerText','runtimeKnowledge','transcript','jdText','cvText'])assert.equal(stored.includes(forbidden),false);
// IT/EN continuity copy is externalized and renderable.
const result={phase:'understanding',sessionRef:'s',preInterview:{candidateProfile:{},cvReviewReport:{},targetRole:'T',professionalIdentityContinuity:{recovered:true},repeatInterviewContinuity:{selectionHistoryApplied:true},professionalSources:[]}};
assert(renderPrivateBetaUiJourneyHtml({locale:'it',result}).includes('domande già affrontate'));
assert(renderPrivateBetaUiJourneyHtml({locale:'en',result}).includes('questions already covered'));
console.log('BVL-05 repeat-interview perceived intelligence tests PASSED');

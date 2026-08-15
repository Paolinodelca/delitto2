import assert from 'assert';
import fs from 'fs';
import { createPrivateBetaUiRequestHandler } from '../src/app/privateBetaUiServer.js';
import { loadStructuredQuestionBank } from '../src/interview/loadStructuredQuestionBank.js';
import { rankStructuredQuestions } from '../src/interview/rankStructuredQuestions.js';

const mvpSource=fs.readFileSync('src/app/runFringeInterviewMVP.js','utf8');
assert(mvpSource.includes('recentQuestionKeys = []'));
assert(mvpSource.includes('recentQuestionHistory = []'));
assert(mvpSource.includes('recentQuestionKeys,\n    recentQuestionHistory'));
assert(!mvpSource.includes('Math.random'));

const {structuredQuestionBank}=loadStructuredQuestionBank();
const context={seniorityContext:'senior',companyContext:'structured',defaultTone:'direct',roleFamily:'generic_professional'};
const baselineA=rankStructuredQuestions({interviewContextProfile:context,structuredQuestionBank});
const baselineB=rankStructuredQuestions({interviewContextProfile:context,structuredQuestionBank});
assert.deepStrictEqual(baselineA,baselineB,'first interview/no history must preserve deterministic baseline');
const recentKeys=baselineA.rankedStructuredQuestions.rankedQuestions.slice(0,3).map(x=>x.key);
const varied=rankStructuredQuestions({interviewContextProfile:context,structuredQuestionBank,recentQuestionKeys:recentKeys,recentQuestionHistory:recentKeys.map(key=>({key,category:'',signals:[]}))});
assert.deepStrictEqual(varied.rankedStructuredQuestions.recentQuestionKeys,recentKeys);
assert(varied.rankedStructuredQuestions.rankedQuestions.some((x,i)=>x.key!==baselineA.rankedStructuredQuestions.rankedQuestions[i]?.key||x.score!==baselineA.rankedStructuredQuestions.rankedQuestions[i]?.score),'recent history must causally affect existing ranking when alternatives exist');

const recentQuestionStore=new Map();
const sessionStore=new Map();
let contextCounter=0;
const prepareCalls=[];
const handler=createPrivateBetaUiRequestHandler({
  sessionStore,recentQuestionStore,contextIdFactory:()=>`ctx-${++contextCounter}`,
  stagedPrepare:async({recentQuestionKeys,recentQuestionHistory})=>{
    prepareCalls.push({recentQuestionKeys:[...recentQuestionKeys],recentQuestionHistory:JSON.parse(JSON.stringify(recentQuestionHistory))});
    const n=prepareCalls.length;
    return {state:{id:`s${n}`,sessionId:`s${n}`,usedQuestionHistory:[]},publicResult:{status:'interview',completed:false,phase:'interview',sessionRef:`s${n}`,currentQuestion:{stepType:'core_question',question:'Q'}}};
  },
  stagedAnswer:async({state})=>{
    state.usedQuestionHistory.push({key:'decision_tradeoffs',category:'decision_tradeoff',signals:['decision']});
    return {state,publicResult:{status:'interview',completed:false,phase:'interview',sessionRef:state.sessionId,currentQuestion:{stepType:'core_question',question:'NEXT'}}};
  }
});
function req(method,url,cookie='',body=''){return {method,url,headers:{cookie},async *[Symbol.asyncIterator](){if(body)yield Buffer.from(body);}};}
function res(){return {headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(code,h){this.code=code;Object.assign(this.headers,h||{});},end(v){this.body=v||'';}};}
let r=res();await handler(req('GET','/private-beta'),r);const cookie=String(r.headers['Set-Cookie']).split(';')[0];
r=res();await handler(req('POST','/private-beta/journey',cookie,'consentDecision=accept'),r);assert.deepStrictEqual(prepareCalls[0].recentQuestionKeys,[]);
r=res();await handler(req('POST','/private-beta/interview/answer',cookie,'sessionRef=s1&answer=used'),r);
assert.deepStrictEqual(recentQuestionStore.get('ctx-1').map(x=>x.key),['decision_tradeoffs']);
assert.equal(JSON.stringify(recentQuestionStore.get('ctx-1')).includes('used'),false,'answers must not be retained for variation');
r=res();await handler(req('POST','/private-beta/journey',cookie,'consentDecision=accept'),r);assert.deepStrictEqual(prepareCalls[1].recentQuestionKeys,['decision_tradeoffs'],'successive simulation must receive prior answered-question history');
// Separate browser context must not inherit history.
r=res();await handler(req('GET','/private-beta'),r);const cookie2=String(r.headers['Set-Cookie']).split(';')[0];
r=res();await handler(req('POST','/private-beta/journey',cookie2,'consentDecision=accept'),r);assert.deepStrictEqual(prepareCalls[2].recentQuestionKeys,[],'unrelated context must be isolated');
// Interrupted/abandoned simulation remains safe: only successfully answered questions are retained; planned/unseen questions are never added by server.
assert.equal(recentQuestionStore.get('ctx-1').length,1);
const stored=JSON.stringify(recentQuestionStore.get('ctx-1'));
for(const forbidden of ['cvText','jdText','answer','prompt','rawProvider']) assert.equal(stored.includes(forbidden),false);
console.log('ME-02C repeat interview variation tests PASSED');

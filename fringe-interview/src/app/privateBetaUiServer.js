import http from "http";
import { URLSearchParams } from "url";
import { randomUUID } from "crypto";
import { renderPrivateBetaUiJourneyHtml } from "./renderPrivateBetaUiJourneyHtml.js";
import { prepareStagedPrivateBetaJourney, continueStagedPrivateBetaJourney, answerStagedPrivateBetaJourney, finalizeStagedPrivateBetaJourney } from "./privateBetaJourneyIntegration.js";
const REPEAT_CONTEXT_COOKIE="imago_beta_repeat_context";
function parseForm(raw){return Object.fromEntries(new URLSearchParams(raw).entries());}
function parseCookies(header=""){return Object.fromEntries(String(header).split(";").map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf("=");return i<0?[x,""]:[x.slice(0,i),decodeURIComponent(x.slice(i+1))];}));}
function getRepeatContext(req,contextIdFactory){const existing=parseCookies(req.headers?.cookie||"")[REPEAT_CONTEXT_COOKIE];return existing||contextIdFactory();}
function setRepeatContextCookie(res,id){res.setHeader("Set-Cookie",`${REPEAT_CONTEXT_COOKIE}=${encodeURIComponent(id)}; Path=/private-beta; HttpOnly; SameSite=Lax`);}
function mergeQuestionHistory(store,contextId,history){const current=Array.isArray(store.get(contextId))?store.get(contextId):[];const byKey=new Map(current.map(x=>[x.key,x]));for(const item of Array.isArray(history)?history:[]){if(item?.key)byKey.set(item.key,{key:item.key,category:item.category||"",signals:Array.isArray(item.signals)?item.signals:[]});}const merged=[...byKey.values()].slice(-24);store.set(contextId,merged);return merged;}
async function body(req){let raw="";for await(const chunk of req)raw+=chunk;return parseForm(raw);}
export function createPrivateBetaUiRequestHandler({locale="it",journeyOptions={},journeyEntryPoint=null,stagedPrepare=prepareStagedPrivateBetaJourney,stagedContinue=continueStagedPrivateBetaJourney,stagedAnswer=answerStagedPrivateBetaJourney,stagedFinalize=finalizeStagedPrivateBetaJourney,sessionStore=new Map(),recentQuestionStore=new Map(),contextIdFactory=()=>randomUUID()}={}){
 return async function handler(req,res){
  if(req.method==="GET"&&(req.url==="/"||req.url==="/private-beta")){const contextId=getRepeatContext(req,contextIdFactory);setRepeatContextCookie(res,contextId);res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});res.end(renderPrivateBetaUiJourneyHtml({locale}));return;}
  if(req.method==="POST"&&req.url==="/private-beta/journey"){
   if(typeof journeyEntryPoint==="function"){ const legacy=await journeyEntryPoint({uiInput:await body(req),...journeyOptions}); res.writeHead(legacy?.completed?200:422,{"Content-Type":"text/html; charset=utf-8"}); res.end(renderPrivateBetaUiJourneyHtml({locale,result:legacy})); return; }
   const contextId=getRepeatContext(req,contextIdFactory);setRepeatContextCookie(res,contextId);const recentQuestionHistory=recentQuestionStore.get(contextId)||[];let outcome;try{outcome=await stagedPrepare({uiInput:await body(req),recentQuestionKeys:recentQuestionHistory.map(x=>x.key),recentQuestionHistory,...journeyOptions});if(outcome.state){outcome.state.repeatContextId=contextId;sessionStore.set(outcome.publicResult.sessionRef,outcome.state);}}catch{outcome={publicResult:{status:"blocked",completed:false,phase:"start",error:{code:"UNEXPECTED_ERROR"}}};}
   res.writeHead(outcome.publicResult?.error?422:200,{"Content-Type":"text/html; charset=utf-8"});res.end(renderPrivateBetaUiJourneyHtml({locale,result:outcome.publicResult}));return;
  }
  if(req.method==="POST"&&req.url==="/private-beta/understanding/continue"){
   const input=await body(req),state=sessionStore.get(input.sessionRef);let outcome;try{outcome=await stagedContinue({state,representationAgreement:input.representationAgreement});if(outcome.state)sessionStore.set(input.sessionRef,outcome.state);}catch{outcome={publicResult:{status:"blocked",completed:false,phase:"understanding",error:{code:"UNEXPECTED_ERROR"}}};}
   res.writeHead(outcome.publicResult?.error?422:200,{"Content-Type":"text/html; charset=utf-8"});res.end(renderPrivateBetaUiJourneyHtml({locale,result:outcome.publicResult}));return;
  }
  if(req.method==="POST"&&req.url==="/private-beta/interview/answer"){
   const input=await body(req),state=sessionStore.get(input.sessionRef);let outcome;try{outcome=await stagedAnswer({state,answer:input.answer});if(outcome.state){sessionStore.set(input.sessionRef,outcome.state);if(outcome.state.repeatContextId)mergeQuestionHistory(recentQuestionStore,outcome.state.repeatContextId,outcome.state.usedQuestionHistory);}}catch{outcome={publicResult:{status:"blocked",completed:false,phase:"interview",error:{code:"UNEXPECTED_ERROR"}}};}
   res.writeHead(outcome.publicResult?.error?422:200,{"Content-Type":"text/html; charset=utf-8"});res.end(renderPrivateBetaUiJourneyHtml({locale,result:outcome.publicResult}));return;
  }
  if(req.method==="POST"&&req.url==="/private-beta/feedback"){
   const input=await body(req),state=sessionStore.get(input.sessionRef);let outcome;try{outcome=await stagedFinalize({state,feedbackAction:input.feedbackAction,feedbackComment:input.feedbackComment});sessionStore.delete(input.sessionRef);}catch{outcome={publicResult:{status:"blocked",completed:false,phase:"feedback",error:{code:"UNEXPECTED_ERROR"}}};}
   res.writeHead(outcome.publicResult?.completed?200:422,{"Content-Type":"text/html; charset=utf-8"});res.end(renderPrivateBetaUiJourneyHtml({locale,result:outcome.publicResult}));return;
  }
  res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});res.end("");
 };
}
export function createPrivateBetaUiServer(options={}){return http.createServer(createPrivateBetaUiRequestHandler(options));}
export default createPrivateBetaUiServer;

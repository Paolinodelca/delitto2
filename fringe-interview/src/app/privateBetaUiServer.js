import http from "http";
import { URLSearchParams } from "url";
import { renderPrivateBetaUiJourneyHtml } from "./renderPrivateBetaUiJourneyHtml.js";
import { prepareStagedPrivateBetaJourney, answerStagedPrivateBetaJourney, finalizeStagedPrivateBetaJourney } from "./privateBetaJourneyIntegration.js";
function parseForm(raw){return Object.fromEntries(new URLSearchParams(raw).entries());}
async function body(req){let raw="";for await(const chunk of req)raw+=chunk;return parseForm(raw);}
export function createPrivateBetaUiRequestHandler({locale="it",journeyOptions={},journeyEntryPoint=null,stagedPrepare=prepareStagedPrivateBetaJourney,stagedAnswer=answerStagedPrivateBetaJourney,stagedFinalize=finalizeStagedPrivateBetaJourney,sessionStore=new Map()}={}){
 return async function handler(req,res){
  if(req.method==="GET"&&(req.url==="/"||req.url==="/private-beta")){res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});res.end(renderPrivateBetaUiJourneyHtml({locale}));return;}
  if(req.method==="POST"&&req.url==="/private-beta/journey"){
   if(typeof journeyEntryPoint==="function"){ const legacy=await journeyEntryPoint({uiInput:await body(req),...journeyOptions}); res.writeHead(legacy?.completed?200:422,{"Content-Type":"text/html; charset=utf-8"}); res.end(renderPrivateBetaUiJourneyHtml({locale,result:legacy})); return; }
   let outcome;try{outcome=await stagedPrepare({uiInput:await body(req),...journeyOptions});if(outcome.state)sessionStore.set(outcome.publicResult.sessionRef,outcome.state);}catch{outcome={publicResult:{status:"blocked",completed:false,phase:"start",error:{code:"UNEXPECTED_ERROR"}}};}
   res.writeHead(outcome.publicResult?.error?422:200,{"Content-Type":"text/html; charset=utf-8"});res.end(renderPrivateBetaUiJourneyHtml({locale,result:outcome.publicResult}));return;
  }
  if(req.method==="POST"&&req.url==="/private-beta/interview/answer"){
   const input=await body(req),state=sessionStore.get(input.sessionRef);let outcome;try{outcome=await stagedAnswer({state,answer:input.answer});if(outcome.state)sessionStore.set(input.sessionRef,outcome.state);}catch{outcome={publicResult:{status:"blocked",completed:false,phase:"interview",error:{code:"UNEXPECTED_ERROR"}}};}
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

import {createRequire} from 'node:module';
import {runGroqChatCompletion} from './runGroqChatCompletion.js';
const require=createRequire(import.meta.url);
const {DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA,validateDecisionAccountabilityProductionSemanticCandidate}=require('../../app/knowledge/decisionAccountabilityProductionSemanticCandidate.js');
const {buildDecisionAccountabilityProductionSemanticPrompt}=require('../../app/knowledge/buildDecisionAccountabilityProductionSemanticPrompt.js');

function diagnosticCandidateShape(candidate){
  const context=candidate&&typeof candidate.context==='object'&&candidate.context!==null?candidate.context:{};
  const continuity=candidate&&typeof candidate.responsibilityContinuity==='object'&&candidate.responsibilityContinuity!==null?candidate.responsibilityContinuity:null;
  return Object.freeze({
    interpretationStatus:candidate?.interpretationStatus??null,
    decisionAuthority:candidate?.decisionAuthority??null,
    consequenceScope:candidate?.consequenceScope??null,
    accountabilityEvidence:candidate?.accountabilityEvidence??null,
    responsibilityContinuity:continuity?Object.freeze({state:continuity.state??null,qualification:continuity.qualification??null,months:continuity.months??null,minimumMonths:continuity.minimumMonths??null,maximumMonths:continuity.maximumMonths??null}):null,
    contextPresence:Object.freeze({decision:typeof context.decision==='string'&&Boolean(context.decision.trim()),responsibility:typeof context.responsibility==='string'&&Boolean(context.responsibility.trim()),consequence:typeof context.consequence==='string'&&Boolean(context.consequence.trim())})
  });
}

export async function runGroqDecisionAccountabilitySemanticExecutor({evidence,completionRunner=runGroqChatCompletion}={}){
  const {systemText,userText}=buildDecisionAccountabilityProductionSemanticPrompt({evidence});
  const result=await completionRunner({task:'decisionAccountabilitySemanticExecutor',systemText,userText,temperature:0,maxRetries:2,retryDelayMs:1200,jsonSchema:DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA,strictSchemaCompatible:true});
  let candidate;try{candidate=JSON.parse(result?.content);}catch{return Object.freeze({supported:false,reason:'malformed_provider_output',diagnostic:Object.freeze({stage:'json_parse',category:'json_parse_failure'})});}
  const validation=validateDecisionAccountabilityProductionSemanticCandidate(candidate);
  if(!validation.isValid)return Object.freeze({supported:false,reason:'invalid_provider_output',diagnostic:Object.freeze({stage:'semantic_candidate_validation',category:'candidate_rejected',validationErrors:Object.freeze(validation.errors.slice(0,8)),candidateShape:diagnosticCandidateShape(candidate)})});
  if(candidate.interpretationStatus!=='SUPPORTED')return Object.freeze({supported:false,reason:'unsupported_semantics',diagnostic:Object.freeze({stage:'semantic_candidate_validation',category:'legitimate_unsupported_semantics',candidateShape:diagnosticCandidateShape(candidate)})});
  return Object.freeze({supported:true,candidate:Object.freeze(candidate),provider:Object.freeze({task:'decisionAccountabilitySemanticExecutor',model:result?.model||null,outputMode:result?.outputMode||null})});
}

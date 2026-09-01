import {createRequire} from 'node:module';
import {runGroqChatCompletion} from './runGroqChatCompletion.js';
const require=createRequire(import.meta.url);
const {DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA,validateDecisionAccountabilityProductionSemanticCandidate}=require('../../app/knowledge/decisionAccountabilityProductionSemanticCandidate.js');
const {buildDecisionAccountabilityProductionSemanticPrompt}=require('../../app/knowledge/buildDecisionAccountabilityProductionSemanticPrompt.js');

export async function runGroqDecisionAccountabilitySemanticExecutor({evidence,completionRunner=runGroqChatCompletion}={}){
  const {systemText,userText}=buildDecisionAccountabilityProductionSemanticPrompt({evidence});
  const result=await completionRunner({task:'decisionAccountabilitySemanticExecutor',systemText,userText,temperature:0,maxRetries:2,retryDelayMs:1200,jsonSchema:DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA,strictSchemaCompatible:true});
  let candidate;try{candidate=JSON.parse(result?.content);}catch{return Object.freeze({supported:false,reason:'malformed_provider_output'});}
  const validation=validateDecisionAccountabilityProductionSemanticCandidate(candidate);
  if(!validation.isValid)return Object.freeze({supported:false,reason:'invalid_provider_output'});
  if(candidate.interpretationStatus!=='SUPPORTED')return Object.freeze({supported:false,reason:'unsupported_semantics'});
  return Object.freeze({supported:true,candidate:Object.freeze(candidate),provider:Object.freeze({task:'decisionAccountabilitySemanticExecutor',model:result?.model||null,outputMode:result?.outputMode||null})});
}

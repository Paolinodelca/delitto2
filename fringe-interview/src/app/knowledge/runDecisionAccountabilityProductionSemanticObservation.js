import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {runGroqDecisionAccountabilitySemanticExecutor} from '../../infrastructure/groq/runGroqDecisionAccountabilitySemanticExecutor.js';
const require=createRequire(import.meta.url);
const {resolveDecisionAccountabilitySemanticAuthority}=require('./resolveDecisionAccountabilitySemanticAuthority.js');
const {constructAuthorizedDecisionAccountabilityObservation}=require('./constructAuthorizedDecisionAccountabilityObservation.js');
const {candidateToObservationInput}=require('./decisionAccountabilityProductionSemanticCandidate.js');
const {buildDecisionAccountabilityMeasureResult}=require('../../core/measurement/decisionAccountability/buildDecisionAccountabilityMeasureResult.js');
const {projectDecisionAccountabilityMeasureResult}=require('../../core/measurement/decisionAccountability/projectDecisionAccountabilityMeasureResult.js');
function observationId(evidenceId,semanticPolicyRef){return `decision_accountability_observation:${crypto.createHash('sha256').update(`${semanticPolicyRef}|${evidenceId}`).digest('hex')}`;}
export async function runDecisionAccountabilityProductionSemanticObservation({evidence,knowledgeAcquisitionExecution,knowledgeAcquisitionPlan,capabilityConfiguration,solutionDecision,knowledgeAcquisitionDesign,semanticExecutor=runGroqDecisionAccountabilitySemanticExecutor,now}={}){
  const semanticAuthority=resolveDecisionAccountabilitySemanticAuthority({evidence,knowledgeAcquisitionExecution,knowledgeAcquisitionPlan,capabilityConfiguration,solutionDecision,knowledgeAcquisitionDesign});
  if(!semanticAuthority.resolved)return Object.freeze({semanticAuthority,observation:null,specializedMeasurementResult:null,measurementResult:null,provider:null});
  let execution;try{execution=await semanticExecutor({evidence});}catch{return Object.freeze({semanticAuthority,observation:null,specializedMeasurementResult:null,measurementResult:null,provider:null});}
  if(!execution?.supported||!execution.candidate)return Object.freeze({semanticAuthority,observation:null,specializedMeasurementResult:null,measurementResult:null,provider:execution?.provider||null});
  const input=candidateToObservationInput(execution.candidate);
  const executor=()=>({supported:true,observation:{...input,observationId:observationId(evidence.id,semanticAuthority.semanticPolicyRef),inferenceSupportInputs:{evidenceQuality:{state:'not_yet_derived'},sourceConvergence:{state:'not_yet_derived'},consistency:{state:'not_yet_derived'},coverage:{state:'not_yet_derived'}},metadata:{createdAt:now||new Date().toISOString()}}});
  const observation=constructAuthorizedDecisionAccountabilityObservation({evidence,semanticAuthority,executor});
  if(!observation)return Object.freeze({semanticAuthority,observation:null,specializedMeasurementResult:null,measurementResult:null,provider:execution.provider||null});
  const specializedMeasurementResult=buildDecisionAccountabilityMeasureResult({observation});
  const measurementResult=projectDecisionAccountabilityMeasureResult(specializedMeasurementResult,{calculatedAt:now});
  return Object.freeze({semanticAuthority,observation,specializedMeasurementResult,measurementResult,provider:execution.provider||null});
}

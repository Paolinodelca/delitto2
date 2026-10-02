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
function ref(value,prefix){return typeof value==='string'&&value.trim()?value.trim():value?.id?`${prefix}:${value.id}`:null;}
function trace({stage,status,category,reasonCode,semanticAuthority,evidence,knowledgeAcquisitionExecution,providerCategory=null}={}){
  return Object.freeze({
    semanticType:'decision_accountability',
    stage,
    status,
    category,
    reasonCode:reasonCode||category,
    semanticPolicyRef:semanticAuthority?.semanticPolicyRef||null,
    executionRef:ref(semanticAuthority?.knowledgeAcquisitionExecutionRef)||ref(knowledgeAcquisitionExecution,'knowledgeAcquisitionExecution'),
    evidenceRef:ref(evidence?.id),
    providerCategory:providerCategory||null
  });
}
function output({semanticAuthority,observation=null,specializedMeasurementResult=null,measurementResult=null,provider=null,semanticExecutionTrace}){
  return Object.freeze({semanticAuthority,observation,specializedMeasurementResult,measurementResult,provider,semanticExecutionTrace});
}
function executionFailure(execution){
  const reason=execution?.reason||'semantic_executor_no_candidate';
  if(reason==='unsupported_semantics')return {category:'semantic_insufficiency',reasonCode:'unsupported_semantic_candidate',providerCategory:execution?.diagnostic?.category||null};
  if(reason==='invalid_provider_output'||reason==='malformed_provider_output')return {category:'invalid_provider_candidate',reasonCode:reason,providerCategory:execution?.diagnostic?.category||null};
  return {category:'semantic_executor_failure',reasonCode:reason,providerCategory:execution?.diagnostic?.category||null};
}
function providerFailure(error){
  const diagnostic=error?.providerDiagnostic;
  const kind=diagnostic?.failureKind||null;
  return {
    category:kind==='structured_output_rejected'?'provider_structured_output_rejection':'provider_technical_failure',
    reasonCode:kind||'provider_execution_error',
    providerCategory:kind
  };
}

export async function runDecisionAccountabilityProductionSemanticObservation({evidence,knowledgeAcquisitionExecution,knowledgeAcquisitionPlan,capabilityConfiguration,solutionDecision,knowledgeAcquisitionDesign,semanticExecutor=runGroqDecisionAccountabilitySemanticExecutor,now}={}){
  const semanticAuthority=resolveDecisionAccountabilitySemanticAuthority({evidence,knowledgeAcquisitionExecution,knowledgeAcquisitionPlan,capabilityConfiguration,solutionDecision,knowledgeAcquisitionDesign});
  if(!semanticAuthority.resolved)return output({semanticAuthority,semanticExecutionTrace:trace({stage:'semantic_authority',status:'failed',category:'authority_failure',reasonCode:semanticAuthority.reason||'semantic_authority_unresolved',semanticAuthority,evidence,knowledgeAcquisitionExecution})});

  let execution;
  try{execution=await semanticExecutor({evidence});}
  catch(error){
    const failure=providerFailure(error);
    return output({semanticAuthority,semanticExecutionTrace:trace({stage:'provider_execution',status:'failed',...failure,semanticAuthority,evidence,knowledgeAcquisitionExecution})});
  }

  if(!execution?.supported||!execution.candidate){
    const failure=executionFailure(execution);
    return output({semanticAuthority,provider:execution?.provider||null,semanticExecutionTrace:trace({stage:failure.category==='semantic_insufficiency'?'semantic_candidate':'provider_candidate',status:'failed',...failure,semanticAuthority,evidence,knowledgeAcquisitionExecution})});
  }

  const input=candidateToObservationInput(execution.candidate);
  const executor=()=>({supported:true,observation:{...input,observationId:observationId(evidence.id,semanticAuthority.semanticPolicyRef),inferenceSupportInputs:{evidenceQuality:{state:'not_yet_derived'},sourceConvergence:{state:'not_yet_derived'},consistency:{state:'not_yet_derived'},coverage:{state:'not_yet_derived'}},metadata:{createdAt:now||new Date().toISOString()}}});
  const observation=constructAuthorizedDecisionAccountabilityObservation({evidence,semanticAuthority,executor});
  if(!observation)return output({semanticAuthority,provider:execution.provider||null,semanticExecutionTrace:trace({stage:'observation_construction',status:'failed',category:'observation_validation_failure',reasonCode:'authorized_observation_not_constructed',semanticAuthority,evidence,knowledgeAcquisitionExecution})});

  const specializedMeasurementResult=buildDecisionAccountabilityMeasureResult({observation});
  if(specializedMeasurementResult.resultStatus!=='draft')return output({semanticAuthority,observation,specializedMeasurementResult,provider:execution.provider||null,semanticExecutionTrace:trace({stage:'specialized_measurement',status:'failed',category:'measurement_insufficient',reasonCode:`specialized_measurement_${specializedMeasurementResult.resultStatus}`,semanticAuthority,evidence,knowledgeAcquisitionExecution})});

  let measurementResult;
  try{measurementResult=projectDecisionAccountabilityMeasureResult(specializedMeasurementResult,{calculatedAt:now});}
  catch{return output({semanticAuthority,observation,specializedMeasurementResult,provider:execution.provider||null,semanticExecutionTrace:trace({stage:'generic_measurement_projection',status:'failed',category:'generic_measurement_projection_failure',reasonCode:'generic_measurement_projection_error',semanticAuthority,evidence,knowledgeAcquisitionExecution})});}
  if(!measurementResult)return output({semanticAuthority,observation,specializedMeasurementResult,provider:execution.provider||null,semanticExecutionTrace:trace({stage:'generic_measurement_projection',status:'failed',category:'generic_measurement_projection_failure',reasonCode:'generic_measurement_not_produced',semanticAuthority,evidence,knowledgeAcquisitionExecution})});

  return output({semanticAuthority,observation,specializedMeasurementResult,measurementResult,provider:execution.provider||null,semanticExecutionTrace:trace({stage:'generic_measurement_projection',status:'succeeded',category:'measurement_ready',reasonCode:'generic_measurement_calculated',semanticAuthority,evidence,knowledgeAcquisitionExecution})});
}

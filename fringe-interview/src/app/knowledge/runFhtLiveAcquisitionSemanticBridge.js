const {buildKnowledgeAcquisitionRuntimeSession}=require('./buildKnowledgeAcquisitionRuntimeSession');
const {buildKnowledgeAcquisitionExecution,transitionKnowledgeAcquisitionExecution}=require('./buildKnowledgeAcquisitionExecution');
const {resolveDecisionAccountabilitySemanticAuthority}=require('./resolveDecisionAccountabilitySemanticAuthority');
const {constructAuthorizedDecisionAccountabilityObservation}=require('./constructAuthorizedDecisionAccountabilityObservation');
const {buildDecisionAccountabilityMeasureResult}=require('../../core/measurement/decisionAccountability/buildDecisionAccountabilityMeasureResult');
const {projectDecisionAccountabilityMeasureResult}=require('../../core/measurement/decisionAccountability/projectDecisionAccountabilityMeasureResult');
const {runQuantifiedOutcomeSemanticKnowledgePath}=require('./runQuantifiedOutcomeSemanticKnowledgePath');
const {buildDecisionAccountabilityMeasurementDimensionMapping}=require('../../core/dimension/buildDecisionAccountabilityMeasurementDimensionMapping');
const {mapMeasurementResultToDimensionContributions,buildKnowledgeLedger,appendDimensionContributions,buildKnowledgeSnapshot}=require('../../core/dimension');

function txt(v){return typeof v==='string'?v.trim():''}
function clone(v){return JSON.parse(JSON.stringify(v))}
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(freeze)}return v}
function canonicalPurposeForAssociation(planning,ref){if(!ref||!txt(ref.goal)||!txt(ref.planItemRef)||!txt(ref.knowledgeAcquisitionPlanRef)||!txt(ref.knowledgeAcquisitionDesignRef))return null;const p=(planning?.purposes||[]).find(x=>x.goal===ref.goal);if(!p)return null;if(ref.planItemRef!==p.planItemRefs?.[0])return null;if(ref.knowledgeAcquisitionPlanRef!==`knowledgeAcquisitionPlan:${p.plan.id}`)return null;if(ref.knowledgeAcquisitionDesignRef!==`knowledgeAcquisitionDesign:${p.design.id}`)return null;if(ref.knowledgeAcquisitionRuntimeSessionRef&&ref.knowledgeAcquisitionRuntimeSessionRef!==`knowledgeAcquisitionRuntimeSession:${p.runtimeSession.id}`)return null;return p}
function activeSession(purpose,now){const item=purpose.plan.planItems[0].planItemRef;return buildKnowledgeAcquisitionRuntimeSession({knowledgeAcquisitionPlan:purpose.plan,sessionKey:purpose.runtimeSession.sessionKey,status:'active',activePlanItemRef:item,itemStates:purpose.plan.planItems.map(x=>({sourcePlanItemRef:x.planItemRef,status:x.planItemRef===item?'active':'pending',activatedAt:x.planItemRef===item?now:null,suspendedAt:null,completedAt:null,abandonedAt:null})),lifecycle:{createdAt:purpose.runtimeSession.lifecycle.createdAt,updatedAt:now,activatedAt:now,suspendedAt:null,completedAt:null,abandonedAt:null},extensions:{...clone(purpose.runtimeSession.extensions),fhtRuntimeActionAssociation:true}},{now});}
function defaultQOExecutor({evidence}){const text=txt(evidence?.content?.answerText);const m=text.match(/(?:circa|approximately|about)?\s*(\d+(?:[.,]\d+)?)\s*%/i);if(!m)return{supported:false};const value=Number(m[1].replace(',','.'));if(!Number.isFinite(value))return{supported:false};const contribution=/\b(contribu|contribut|aiutat|supportat|partecipat|collaborat)/i.test(text)?'contributed':/\b(ho|i)\s+(ridott|aumentat|migliorat|incrementat|reduced|increased|improved)/i.test(text)?'contributed':null;if(!contribution)return{supported:false};return{supported:true,observation:{observationId:`quantified_outcome:${evidence.id}`,measurableOutcome:text,quantitativeValue:{value,unit:'percent',approximate:/\b(circa|approximately|about)\b/i.test(text),direction:'change',lowerBound:null,upperBound:null},contributionRelationship:contribution,causalityBoundary:'contribution_only',context:{event:text},limitations:['Causal attribution is limited to the stated contribution relationship.'],metadata:{createdAt:new Date().toISOString()}}};}
function knowledgeFromDaMeasurement({semanticAuthority,observation,specializedMeasurementResult,measurementResult,subjectRef,now}){const mapping=buildDecisionAccountabilityMeasurementDimensionMapping({now});const dimensionContributions=mapMeasurementResultToDimensionContributions(measurementResult,mapping);let knowledgeLedger=buildKnowledgeLedger({contributions:[],metadata:{createdAt:now,updatedAt:now}},{now});knowledgeLedger=appendDimensionContributions(knowledgeLedger,dimensionContributions,{now});const knowledgeSnapshot=buildKnowledgeSnapshot(knowledgeLedger,{now});const personKnowledgeMatrix=null,knowledgeCoverage=null;return Object.freeze({semanticAuthority,observation,specializedMeasurementResult,measurementResult,dimensionContributions,knowledgeLedger,knowledgeSnapshot,personKnowledgeMatrix,knowledgeCoverage})}
function daTrace({stage,status,category,reasonCode,semanticAuthority,evidence,execution,providerCategory=null}={}){return freeze({semanticType:'decision_accountability',stage,status,category,reasonCode:reasonCode||category,semanticPolicyRef:semanticAuthority?.semanticPolicyRef||null,executionRef:semanticAuthority?.knowledgeAcquisitionExecutionRef||(execution?.id?`knowledgeAcquisitionExecution:${execution.id}`:null),evidenceRef:evidence?.id||null,providerCategory:providerCategory||null})}
function withTrace(result,semanticExecutionTrace){return freeze({...result,semanticExecutionTrace})}
function emptyDa({semanticAuthority=null,observation=null,specializedMeasurementResult=null,measurementResult=null,provider=null,semanticExecutionTrace}){return freeze({semanticAuthority,observation,specializedMeasurementResult,measurementResult,provider,dimensionContributions:Object.freeze([]),knowledgeLedger:null,knowledgeSnapshot:null,personKnowledgeMatrix:null,knowledgeCoverage:null,semanticExecutionTrace})}

async function runFhtLiveAcquisitionSemanticBridge({planning,acquisitionActionAssociation,acceptedAnswer,buildEvidenceStore,betaSessionId,interviewSessionId,subjectRef,now,decisionAccountabilityExecutor,quantifiedOutcomeExecutor}={}){
  const runtimeActionRef=txt(acquisitionActionAssociation?.runtimeActionRef);
  const refs=Array.isArray(acquisitionActionAssociation?.purposeRefs)?acquisitionActionAssociation.purposeRefs:[];
  if(!runtimeActionRef||!refs.length)return freeze([]);
  const results=[];
  for(const ref of refs){
    const p=canonicalPurposeForAssociation(planning,ref);if(!p)continue;
    const session=activeSession(p,now);
    let execution=buildKnowledgeAcquisitionExecution({knowledgeAcquisitionRuntimeSession:session,knowledgeAcquisitionPlan:p.plan,executionKey:`${txt(acceptedAnswer?.timestamp)||now}:${runtimeActionRef}:${p.goal}`},{now});
    execution=transitionKnowledgeAcquisitionExecution({knowledgeAcquisitionExecution:execution,knowledgeAcquisitionRuntimeSession:session,knowledgeAcquisitionPlan:p.plan,targetStatus:'selected'},{now});
    execution=transitionKnowledgeAcquisitionExecution({knowledgeAcquisitionExecution:execution,knowledgeAcquisitionRuntimeSession:session,knowledgeAcquisitionPlan:p.plan,targetStatus:'ready_for_invocation'},{now});
    const store=buildEvidenceStore({betaSessionId,interviewSessionId,answers:[acceptedAnswer],knowledgeAcquisitionExecutionRef:`knowledgeAcquisitionExecution:${execution.id}`});
    const evidence=store.evidence[0];
    let result;

    if(p.goal==='decision_accountability'){
      if(decisionAccountabilityExecutor){
        const semanticAuthority=resolveDecisionAccountabilitySemanticAuthority({evidence,knowledgeAcquisitionExecution:execution,knowledgeAcquisitionPlan:p.plan,capabilityConfiguration:p.capabilityConfiguration,solutionDecision:p.solutionDecision,knowledgeAcquisitionDesign:p.design});
        if(!semanticAuthority.resolved){
          result=emptyDa({semanticAuthority,semanticExecutionTrace:daTrace({stage:'semantic_authority',status:'failed',category:'authority_failure',reasonCode:semanticAuthority.reason||'semantic_authority_unresolved',semanticAuthority,evidence,execution})});
        }else{
          const observation=constructAuthorizedDecisionAccountabilityObservation({evidence,semanticAuthority,executor:decisionAccountabilityExecutor});
          if(!observation){
            result=emptyDa({semanticAuthority,semanticExecutionTrace:daTrace({stage:'observation_construction',status:'failed',category:'observation_validation_failure',reasonCode:'authorized_observation_not_constructed',semanticAuthority,evidence,execution})});
          }else{
            const specializedMeasurementResult=buildDecisionAccountabilityMeasureResult({observation});
            if(specializedMeasurementResult.resultStatus!=='draft'){
              result=emptyDa({semanticAuthority,observation,specializedMeasurementResult,semanticExecutionTrace:daTrace({stage:'specialized_measurement',status:'failed',category:'measurement_insufficient',reasonCode:`specialized_measurement_${specializedMeasurementResult.resultStatus}`,semanticAuthority,evidence,execution})});
            }else{
              let measurementResult=null;
              try{measurementResult=projectDecisionAccountabilityMeasureResult(specializedMeasurementResult,{calculatedAt:now});}catch{}
              if(!measurementResult){
                result=emptyDa({semanticAuthority,observation,specializedMeasurementResult,semanticExecutionTrace:daTrace({stage:'generic_measurement_projection',status:'failed',category:'generic_measurement_projection_failure',reasonCode:'generic_measurement_not_produced',semanticAuthority,evidence,execution})});
              }else{
                try{
                  const knowledge=knowledgeFromDaMeasurement({semanticAuthority,observation,specializedMeasurementResult,measurementResult,subjectRef,now});
                  result=withTrace(knowledge,daTrace({stage:'knowledge_construction',status:'succeeded',category:'knowledge_produced',reasonCode:'knowledge_snapshot_produced',semanticAuthority,evidence,execution}));
                }catch{
                  result=emptyDa({semanticAuthority,observation,specializedMeasurementResult,measurementResult,semanticExecutionTrace:daTrace({stage:'knowledge_construction',status:'failed',category:'knowledge_construction_failure',reasonCode:'knowledge_snapshot_not_produced',semanticAuthority,evidence,execution})});
                }
              }
            }
          }
        }
      }else{
        const {runDecisionAccountabilityProductionSemanticObservation}=await import('./runDecisionAccountabilityProductionSemanticObservation.js');
        const prod=await runDecisionAccountabilityProductionSemanticObservation({evidence,knowledgeAcquisitionExecution:execution,knowledgeAcquisitionPlan:p.plan,capabilityConfiguration:p.capabilityConfiguration,solutionDecision:p.solutionDecision,knowledgeAcquisitionDesign:p.design,now});
        if(prod.measurementResult){
          try{
            const knowledge=knowledgeFromDaMeasurement({...prod,subjectRef,now});
            result=withTrace({...knowledge,provider:prod.provider||null},daTrace({stage:'knowledge_construction',status:'succeeded',category:'knowledge_produced',reasonCode:'knowledge_snapshot_produced',semanticAuthority:prod.semanticAuthority,evidence,execution,providerCategory:prod.semanticExecutionTrace?.providerCategory||null}));
          }catch{
            result=emptyDa({...prod,semanticExecutionTrace:daTrace({stage:'knowledge_construction',status:'failed',category:'knowledge_construction_failure',reasonCode:'knowledge_snapshot_not_produced',semanticAuthority:prod.semanticAuthority,evidence,execution,providerCategory:prod.semanticExecutionTrace?.providerCategory||null})});
          }
        }else result=emptyDa({...prod,semanticExecutionTrace:prod.semanticExecutionTrace});
      }
    }else{
      result=runQuantifiedOutcomeSemanticKnowledgePath({evidence,knowledgeAcquisitionExecution:execution,knowledgeAcquisitionPlan:p.plan,capabilityConfiguration:p.capabilityConfiguration,solutionDecision:p.solutionDecision,knowledgeAcquisitionDesign:p.design,observationExecutor:quantifiedOutcomeExecutor||defaultQOExecutor,subjectRef,now});
    }
    results.push(freeze({goal:p.goal,runtimeActionRef,planItemRef:ref.planItemRef,execution,evidence,result}));
  }
  return freeze(results);
}
module.exports={runFhtLiveAcquisitionSemanticBridge,defaultQOExecutor};

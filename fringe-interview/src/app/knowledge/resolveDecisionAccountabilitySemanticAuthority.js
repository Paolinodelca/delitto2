const { validateKnowledgeAcquisitionExecution } = require('./validateKnowledgeAcquisitionExecution');
const { validateKnowledgeAcquisitionPlan } = require('./validateKnowledgeAcquisitionPlan');
const { validateKnowledgeAcquisitionCapabilityConfiguration } = require('./validateKnowledgeAcquisitionCapabilityConfiguration');
const { validateKnowledgeAcquisitionSolutionDecision } = require('./validateKnowledgeAcquisitionSolutionDecision');
const { validateKnowledgeAcquisitionDesign, AUTHORIZED_SEMANTIC_POLICY } = require('../../core/knowledge/validateKnowledgeAcquisitionDesign');
const { validateEvidence } = require('../../core/evidence/validateEvidence');
function ref(prefix,id){return `${prefix}:${id}`}
function no(reason){return Object.freeze({resolved:false,reason,semanticPolicyRef:null,knowledgeAcquisitionDesignRef:null,knowledgeAcquisitionExecutionRef:null})}
function resolveDecisionAccountabilitySemanticAuthority({evidence,knowledgeAcquisitionExecution:execution,knowledgeAcquisitionPlan:plan,capabilityConfiguration:configuration,solutionDecision:decision,knowledgeAcquisitionDesign:design}={}){
 if(!validateEvidence(evidence).isValid)return no('invalid_evidence');
 const executionRef=evidence?.content?.provenance?.knowledgeAcquisitionExecutionRef;
 if(!executionRef)return no('missing_execution_provenance');
 if(!validateKnowledgeAcquisitionExecution(execution).valid||executionRef!==ref('knowledgeAcquisitionExecution',execution.id))return no('broken_execution_lineage');
 if(!validateKnowledgeAcquisitionPlan(plan).valid||execution.sourcePlanRef!==ref('knowledgeAcquisitionPlan',plan.id))return no('broken_plan_lineage');
 if(!validateKnowledgeAcquisitionCapabilityConfiguration(configuration).valid||plan.sourceCapabilityConfigurationRef!==ref('knowledgeAcquisitionCapabilityConfiguration',configuration.id))return no('broken_configuration_lineage');
 if(!validateKnowledgeAcquisitionSolutionDecision(decision).valid||configuration.sourceSolutionDecisionRef!==ref('knowledgeAcquisitionSolutionDecision',decision.id))return no('broken_solution_decision_lineage');
 const dv=validateKnowledgeAcquisitionDesign(design);if(!dv.valid||decision.sourceDesignRef!==ref('knowledgeAcquisitionDesign',design.id))return no('broken_design_lineage');
 if(design.semanticPolicyRef!==AUTHORIZED_SEMANTIC_POLICY)return no('unsupported_semantic_policy');
 if(design.designType!=='elementary_acquisition_design'||design.targetKnowledge.knowledgeLayer!=='elementary'||design.targetKnowledge.scope!=='dimension'||design.targetKnowledge.scopeRef!=='decision_accountability')return no('mismatched_design_target');
 return Object.freeze({resolved:true,reason:null,semanticPolicyRef:design.semanticPolicyRef,knowledgeAcquisitionDesignRef:ref('knowledgeAcquisitionDesign',design.id),knowledgeAcquisitionExecutionRef:executionRef});
}
module.exports={resolveDecisionAccountabilitySemanticAuthority};

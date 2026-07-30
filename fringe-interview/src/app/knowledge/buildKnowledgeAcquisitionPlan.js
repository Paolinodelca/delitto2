const {validateKnowledgeAcquisitionCapabilityConfiguration}=require('./validateKnowledgeAcquisitionCapabilityConfiguration');
const {validateKnowledgeAcquisitionCapabilityCompositionDesign}=require('./validateKnowledgeAcquisitionCapabilityCompositionDesign');
const {validateKnowledgeAcquisitionPlan}=require('./validateKnowledgeAcquisitionPlan');
const {validateKnowledgeAcquisitionPlanContext}=require('./validateKnowledgeAcquisitionPlanContext');
const {calculateKnowledgeAcquisitionPlanId}=require('./knowledgeAcquisitionPlanIdentity');
function obj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function clone(v){if(Array.isArray(v))return v.map(clone);if(obj(v))return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v}
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(freeze)}return v}
function fail(code,message,details){const e=new Error(message);e.code=code;e.details=details;throw e}
function sorted(v){return [...new Set(v)].sort()}
function itemRef(configurationId,capabilityRef){return `knowledgeAcquisitionCapabilityConfiguration:${configurationId}#capability:${encodeURIComponent(capabilityRef)}`}
function configurationItemRef(configurationId,item){return `${itemRef(configurationId,item.capabilityRef)}/parameter:${encodeURIComponent(item.parameterRef)}`}
function dependencyRef(compositionId,index){return `knowledgeAcquisitionCapabilityCompositionDesign:${compositionId}#logicalDependency:${index}`}
function buildKnowledgeAcquisitionPlan(input={}){
 if(!obj(input))fail('INVALID_KNOWLEDGE_ACQUISITION_PLAN_INPUT','Input must be an object.');
 const configuration=input.capabilityConfiguration,cv=validateKnowledgeAcquisitionCapabilityConfiguration(configuration);if(!cv.valid)fail('INVALID_KNOWLEDGE_ACQUISITION_CAPABILITY_CONFIGURATION',cv.errors.join(' | '),cv);
 const composition=input.capabilityCompositionDesign;
 if(configuration.decisionMode==='single'&&composition!=null)fail('UNEXPECTED_COMPOSITION_DESIGN','single mode must not supply a Composition Design.');
 if(configuration.decisionMode==='composed'){const v=validateKnowledgeAcquisitionCapabilityCompositionDesign(composition);if(!v.valid)fail('INVALID_CAPABILITY_COMPOSITION_DESIGN',v.errors.join(' | '),v)}
 const planItems=configuration.selectedCapabilityRefs.map(capabilityRef=>({
  planItemRef:itemRef(configuration.id,capabilityRef),capabilityRef,
  configurationItemRefs:configuration.configurationItems.filter(x=>x.capabilityRef===capabilityRef).map(x=>configurationItemRef(configuration.id,x)).sort(),
  compositionRoleAssignmentRef:composition?`knowledgeAcquisitionCapabilityCompositionDesign:${composition.id}#capabilityRoleAssignment:${encodeURIComponent(capabilityRef)}`:null
 }));
 const byContribution=new Map((composition?.contributions||[]).map(x=>[x.contributionRef,x.producerCapabilityRef]));
 const planDependencies=(composition?.logicalDependencies||[]).map((x,index)=>({
  planDependencyRef:dependencyRef(composition.id,index),dependentPlanItemRef:itemRef(configuration.id,byContribution.get(x.dependentContributionRef)),
  prerequisitePlanItemRefs:sorted(x.prerequisiteContributionRefs.map(ref=>itemRef(configuration.id,byContribution.get(ref)))),dependencyMode:x.dependencyMode,
  sourceLogicalDependencyRef:dependencyRef(composition.id,index)
 })).sort((a,b)=>a.planDependencyRef.localeCompare(b.planDependencyRef));
 const sourceCapabilityConfigurationRef=`knowledgeAcquisitionCapabilityConfiguration:${configuration.id}`;
 const semantic={sourceCapabilityConfigurationRef,sourceCompositionDesignRef:configuration.sourceCompositionDesignRef,decisionMode:configuration.decisionMode,selectedCapabilityRefs:[...configuration.selectedCapabilityRefs],planScope:{kind:'selected_capabilities',capabilityRefs:[...configuration.selectedCapabilityRefs]},planItems,planDependencies,provenance:{type:'knowledge_acquisition_plan_derivation',producerVersion:'1.0',deterministic:true,interpretive:false},dependencyRefs:sorted([sourceCapabilityConfigurationRef,...(configuration.sourceCompositionDesignRef?[configuration.sourceCompositionDesignRef]:[]),...configuration.selectedCapabilityRefs]),metadata:{contractVersion:'1.0',planStrategyVersion:'1.0',readOnly:true},extensions:obj(input.extensions)?clone(input.extensions):{}};
 const out={id:'',planVersion:'1.0',type:'knowledge_acquisition_plan',...semantic};out.id=calculateKnowledgeAcquisitionPlanId(out);
 const local=validateKnowledgeAcquisitionPlan(out);if(!local.valid)fail('INVALID_GENERATED_KNOWLEDGE_ACQUISITION_PLAN',local.errors.join(' | '),local);
 const context=validateKnowledgeAcquisitionPlanContext({knowledgeAcquisitionPlan:out,capabilityConfiguration:configuration,capabilityCompositionDesign:composition});if(!context.valid)fail('INVALID_KNOWLEDGE_ACQUISITION_PLAN_CONTEXT',context.errors.join(' | '),context);
 return freeze(out);
}
module.exports={buildKnowledgeAcquisitionPlan};

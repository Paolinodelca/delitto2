const A=require('../src/app/knowledge');
const {buildFixture:buildDecisionFixture}=require('./knowledge_acquisition_solution_decision_fixture');
const {buildFixture:buildCompositionFixture}=require('./knowledge_acquisition_capability_composition_design_fixture');

function definition(refs) {
  return { configurationDefinitionRef:'knowledgeAcquisitionConfigurationDefinition:fixture-v1', capabilityDefinitions:refs.map((capabilityRef,index)=>({ capabilityRef, parameters:index===0 ? [
    {parameterRef:'parameter:language',required:true,valueType:'string',allowedValues:['it','en'],constraints:{}},
    {parameterRef:'parameter:depth',required:false,valueType:'number',allowedValues:[],constraints:{minimum:1,maximum:5}},
  ] : [{parameterRef:'parameter:format',required:true,valueType:'string',allowedValues:['structured'],constraints:{minLength:3,maxLength:20}}] })) };
}
function inputFor(refs) {
  return { applicationConfigurationInputRef:'applicationConfigurationInput:fixture-v1', configurationItems:refs.flatMap((capabilityRef,index)=>index===0 ? [
    {capabilityRef,parameterRef:'parameter:depth',value:3},
    {capabilityRef,parameterRef:'parameter:language',value:'it'},
  ] : [{capabilityRef,parameterRef:'parameter:format',value:'structured'}]) };
}
function buildFixture() {
  const decisions=buildDecisionFixture();
  const singleDecision=A.buildKnowledgeAcquisitionSolutionDecision(decisions.inputs.single);
  const singleRefs=singleDecision.selectedCapabilityRefs;
  const singleSnapshots=decisions.candidates.filter(x=>singleRefs.includes(x.capabilityRef));
  const singleDefinition=definition(singleRefs), singleInput=inputFor(singleRefs);
  const composition=buildCompositionFixture();
  const compositionDesign=A.buildKnowledgeAcquisitionCapabilityCompositionDesign(composition.input);
  const composedRefs=composition.solutionDecision.selectedCapabilityRefs;
  const composedDefinition=definition(composedRefs), composedInput=inputFor(composedRefs);
  return {
    single:{solutionDecision:singleDecision,selectedCapabilitySnapshots:singleSnapshots,configurationDefinition:singleDefinition,applicationConfigurationInput:singleInput,input:{solutionDecision:singleDecision,selectedCapabilitySnapshots:singleSnapshots,configurationDefinition:singleDefinition,applicationConfigurationInput:singleInput,extensions:{fixture:true}}},
    composed:{solutionDecision:composition.solutionDecision,compositionDesign,selectedCapabilitySnapshots:composition.selectedCapabilitySnapshots,configurationDefinition:composedDefinition,applicationConfigurationInput:composedInput,input:{solutionDecision:composition.solutionDecision,compositionDesign,selectedCapabilitySnapshots:composition.selectedCapabilitySnapshots,configurationDefinition:composedDefinition,applicationConfigurationInput:composedInput,extensions:{fixture:true}}},
    noneDecision:A.buildKnowledgeAcquisitionSolutionDecision(decisions.inputs.none), deferredDecision:A.buildKnowledgeAcquisitionSolutionDecision(decisions.inputs.deferred), decisions,
  };
}
module.exports={buildFixture};

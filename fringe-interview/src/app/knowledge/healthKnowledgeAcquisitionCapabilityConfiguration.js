const { buildKnowledgeAcquisitionCapabilityConfiguration } = require('./buildKnowledgeAcquisitionCapabilityConfiguration');
const { validateKnowledgeAcquisitionCapabilityConfiguration } = require('./validateKnowledgeAcquisitionCapabilityConfiguration');
const { validateKnowledgeAcquisitionCapabilityConfigurationContext } = require('./validateKnowledgeAcquisitionCapabilityConfigurationContext');
function healthKnowledgeAcquisitionCapabilityConfiguration(fixtures) {
  if (!fixtures || typeof fixtures.buildFixture !== 'function') return { ok:false, details:{ reason:'Fixture provider is required.' } };
  try {
    const fixture=fixtures.buildFixture(), before=JSON.stringify(fixture);
    const single=buildKnowledgeAcquisitionCapabilityConfiguration(fixture.single.input);
    const composed=buildKnowledgeAcquisitionCapabilityConfiguration(fixture.composed.input);
    const context=validateKnowledgeAcquisitionCapabilityConfigurationContext({ capabilityConfiguration:composed, knowledgeAcquisitionSolutionDecision:fixture.composed.solutionDecision, capabilityCompositionDesign:fixture.composed.compositionDesign, selectedCapabilitySnapshots:fixture.composed.selectedCapabilitySnapshots, configurationDefinition:fixture.composed.configurationDefinition, applicationConfigurationInput:fixture.composed.applicationConfigurationInput });
    return { ok:validateKnowledgeAcquisitionCapabilityConfiguration(single).valid && validateKnowledgeAcquisitionCapabilityConfiguration(composed).valid && context.valid && single.sourceCompositionDesignRef===null && composed.sourceCompositionDesignRef!==null && JSON.stringify(fixture)===before, details:{ ids:[single.id,composed.id] } };
  } catch(error) { return { ok:false, details:{ error:error.message, code:error.code } }; }
}
module.exports={healthKnowledgeAcquisitionCapabilityConfiguration};

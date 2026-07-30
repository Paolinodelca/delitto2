const assert=require('assert');const A=require('../src/app/knowledge');const {buildFixture}=require('./knowledge_acquisition_capability_configuration_fixture');
const f=buildFixture(),before=JSON.stringify(f),single=A.buildKnowledgeAcquisitionCapabilityConfiguration(f.single.input),composed=A.buildKnowledgeAcquisitionCapabilityConfiguration(f.composed.input);
assert(A.validateKnowledgeAcquisitionCapabilityConfiguration(single).valid);assert(A.validateKnowledgeAcquisitionCapabilityConfiguration(composed).valid);
assert.equal(single.decisionMode,'single');assert.equal(single.sourceCompositionDesignRef,null);assert.equal(composed.decisionMode,'composed');assert(composed.sourceCompositionDesignRef);
assert.deepEqual(single,A.buildKnowledgeAcquisitionCapabilityConfiguration(f.single.input));assert.equal(JSON.stringify(f),before);
f.single.applicationConfigurationInput.configurationItems[0].value=5;f.single.selectedCapabilitySnapshots[0].metadata.version='changed';assert.equal(single.configurationItems[0].value,3);assert.equal(single.extensions.fixture,true);
assert.throws(()=>A.buildKnowledgeAcquisitionCapabilityConfiguration({...f.single.input,solutionDecision:f.noneDecision}),/not applicable/);assert.throws(()=>A.buildKnowledgeAcquisitionCapabilityConfiguration({...f.single.input,solutionDecision:f.deferredDecision}),/not applicable/);
console.log('Knowledge Acquisition Capability Configuration tests PASSED');

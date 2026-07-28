const assert=require('assert');const K=require('../src/core/knowledge');
for(const bad of [{},{unknown:'x'},{requirementType:'bad'},{scope:'bad'},{priority:1},{satisfied:true},{operator:'OR'},{sort:'rank'},{callback:()=>true}])assert.throws(()=>K.buildKnowledgeAcquisitionRequirementQuery(bad));
const health=K.healthKnowledgeAcquisitionRequirementQuery();assert(health.ok);assert(K.healthKnowledgeAcquisitionRequirement().ok);console.log('Knowledge Acquisition Requirement Query regression tests PASSED');

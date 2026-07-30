const assert=require('assert');const A=require('../src/app/knowledge');const F=require('./knowledge_acquisition_plan_fixture');const f=F.buildFixture();
const a=A.buildKnowledgeAcquisitionPlan(f.composed.input),b=A.buildKnowledgeAcquisitionPlan(f.composed.input);assert.equal(a.id,b.id);assert.deepEqual(a,b);
for(const key of ['runtime','execution','scheduler','schedule','progress','retry','queue','dispatch','provider','adapter','registry','reporting','results','knowledgeUpdate','persistence']){const x=JSON.parse(JSON.stringify(a));x.extensions[key]={enabled:true};assert(!A.validateKnowledgeAcquisitionPlan(x).valid,key)}
const changed=JSON.parse(JSON.stringify(a));changed.planScope.capabilityRefs=[];assert(!A.validateKnowledgeAcquisitionPlan(changed).valid);assert(!('buildKnowledgeAcquisitionPlan' in require('../src/core/knowledge')));
console.log('Knowledge Acquisition Plan regression tests passed.');

const A=require('../src/app/knowledge');const R=require('./knowledge_acquisition_runtime_session_fixture');
const now='2026-07-31T08:00:00.000Z',later='2026-07-31T08:01:00.000Z',latest='2026-07-31T08:02:00.000Z';
function buildFixture(){const r=R.buildFixture(),session=A.buildKnowledgeAcquisitionRuntimeSession(r.active.input,{now:r.later}),input={knowledgeAcquisitionRuntimeSession:session,knowledgeAcquisitionPlan:r.plan,executionKey:'execution-fixture-001',extensions:{fixture:{value:true}}};return{now,later,latest,plan:r.plan,session,input,upstream:r}}
module.exports={buildFixture};

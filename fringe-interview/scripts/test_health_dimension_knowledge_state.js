const assert=require("assert");
const {healthBuildDimensionKnowledgeState}=require("../src/core/dimension");
const result=healthBuildDimensionKnowledgeState();
assert.strictEqual(result.ok,true,result.error);
console.log("test_health_dimension_knowledge_state PASS");

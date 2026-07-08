const {
  healthBuildReasoningPipeline,
} = require("../src/core/reasoning/healthBuildReasoningPipeline");

const result = healthBuildReasoningPipeline();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_reasoning_pipeline PASS");
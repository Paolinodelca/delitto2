const {
  healthBuildRepresentationStrategyPipeline,
} = require("../src/core/representation/healthBuildRepresentationStrategyPipeline");

const result = healthBuildRepresentationStrategyPipeline();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_representation_strategy_pipeline PASS");
const assert = require("assert");
const { healthBuildDimensionContribution } = require("../src/core/dimension/healthBuildDimensionContribution");
const result = healthBuildDimensionContribution();
assert.strictEqual(result.ok, true, result.error);
console.log("test_health_dimension_contribution PASS");

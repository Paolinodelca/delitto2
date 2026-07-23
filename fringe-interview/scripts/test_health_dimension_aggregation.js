const assert = require("assert");
const { healthDimensionAggregation } = require("../src/core/dimension/healthDimensionAggregation");
const result = healthDimensionAggregation();
assert.strictEqual(result.ok, true, result.error);
console.log("test_health_dimension_aggregation PASS");

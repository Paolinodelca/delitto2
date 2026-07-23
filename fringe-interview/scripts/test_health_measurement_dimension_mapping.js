const assert=require("assert");
const {healthMeasurementDimensionMapping}=require("../src/core/dimension/healthMeasurementDimensionMapping");
const result=healthMeasurementDimensionMapping();
assert.strictEqual(result.ok,true,result.error);
console.log("test_health_measurement_dimension_mapping PASS");

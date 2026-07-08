const {
  healthBuildInputBundle,
} = require("../src/core/input/healthBuildInputBundle");

const result = healthBuildInputBundle();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_input_bundle PASS");
const {
  healthBuildImagoRuntime,
} = require("../src/core/runtime/healthBuildImagoRuntime");

const result = healthBuildImagoRuntime();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_imago_runtime PASS");
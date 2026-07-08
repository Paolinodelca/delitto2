const {
  healthBuildRepresentationReadiness,
} = require("../src/core/identity/healthBuildRepresentationReadiness");

const result = healthBuildRepresentationReadiness();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_representation_readiness PASS");
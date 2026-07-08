const {
  healthBuildProfessionalVisibilityComparison,
} = require("../src/core/reasoning/healthBuildProfessionalVisibilityComparison");

const result = healthBuildProfessionalVisibilityComparison();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_professional_visibility_comparison PASS");
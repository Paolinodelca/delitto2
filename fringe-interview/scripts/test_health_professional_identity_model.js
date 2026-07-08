const {
  healthBuildProfessionalIdentityModel,
} = require("../src/core/identity/healthBuildProfessionalIdentityModel");

const result = healthBuildProfessionalIdentityModel();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_professional_identity_model PASS");
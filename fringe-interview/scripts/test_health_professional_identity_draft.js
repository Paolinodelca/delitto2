const {
  healthBuildProfessionalIdentityDraft,
} = require("../src/core/identity/healthBuildProfessionalIdentityDraft");

const result = healthBuildProfessionalIdentityDraft();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_professional_identity_draft PASS");
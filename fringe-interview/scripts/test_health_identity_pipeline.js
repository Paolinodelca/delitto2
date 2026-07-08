const {
  healthBuildIdentityPipeline,
} = require("../src/core/identity/healthBuildIdentityPipeline");

const result = healthBuildIdentityPipeline();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

if (typeof result.statistics.evidenceCount !== "number") {
  console.error("Expected statistics.evidenceCount number.");
  process.exit(1);
}

if (typeof result.statistics.sourceCount !== "number") {
  console.error("Expected statistics.sourceCount number.");
  process.exit(1);
}

if (typeof result.statistics.observedExperienceCount !== "number") {
  console.error("Expected statistics.observedExperienceCount number.");
  process.exit(1);
}

if (typeof result.statistics.observedSkillCount !== "number") {
  console.error("Expected statistics.observedSkillCount number.");
  process.exit(1);
}

if (typeof result.statistics.discoveryCount !== "number") {
  console.error("Expected statistics.discoveryCount number.");
  process.exit(1);
}

console.log("test_health_identity_pipeline PASS");
const {
  healthBuildEvidenceStore,
} = require("../src/core/evidence/healthBuildEvidenceStore");

const result = healthBuildEvidenceStore();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  process.exit(1);
}

console.log("test_health_evidence_store PASS");
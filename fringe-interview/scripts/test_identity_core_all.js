const { execSync } = require("child_process");

const commands = [
  "node scripts/test_build_input_source.js",
  "node scripts/test_build_input_bundle.js",
  "node scripts/test_health_input_bundle.js",
  "node scripts/test_build_evidence.js",
  "node scripts/test_extract_basic_evidence_from_source.js",
  "node scripts/test_extract_basic_evidence_from_professional_history.js",
  "node scripts/test_extract_basic_evidence_from_discovery.js",
  "node scripts/test_extract_basic_evidence_from_updates.js",
  "node scripts/test_build_evidence_store.js",
  "node scripts/test_health_evidence_store.js",
  "node scripts/test_build_evidence_summary.js",
  "node scripts/test_build_professional_identity_draft.js",
  "node scripts/test_health_professional_identity_draft.js",
  "node scripts/test_build_professional_identity_model.js",
  "node scripts/test_health_professional_identity_model.js",
  "node scripts/test_build_representation_readiness.js",
  "node scripts/test_health_representation_readiness.js",
  "node scripts/test_build_identity_pipeline.js",
  "node scripts/test_health_identity_pipeline.js",
  "node scripts/test_build_identity_pipeline_summary.js",
  "node scripts/test_identity_core_regression.js",
  "node scripts/test_identity_pipeline_output_snapshot.js",
  "node scripts/test_build_reasoning_context.js",
  "node scripts/test_build_representation_gap_reasoning.js",
  "node scripts/test_build_reasoning_pipeline.js",
  "node scripts/test_health_reasoning_pipeline.js",
  "node scripts/test_build_reasoning_pipeline_summary.js",
  "node scripts/test_reasoning_core_regression.js",
  "node scripts/fringe_health_check.js",
];

for (const command of commands) {
  try {
    console.log(`RUNNING: ${command}`);
    execSync(command, {
      stdio: "inherit",
    });
    console.log(`PASS: ${command}`);
  } catch (error) {
    console.error(`FAIL: ${command}`);
    process.exit(1);
  }
}

console.log("✅ Identity + Reasoning Core all tests PASSED");
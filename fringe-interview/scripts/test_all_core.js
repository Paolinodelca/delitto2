import { execSync } from "child_process";

const testGroups = [
  {
  name: "Capability Design and Projection",
  commands: [


    "node scripts/test_build_capability_design.js",
"node scripts/test_build_leadership_capability_design.js",
"node scripts/test_build_target_model.js",

"node scripts/test_build_plant_manager_transformation_target_model.js",


"node scripts/test_build_plant_manager_leadership_capability_projection.js",
"node scripts/test_build_plant_manager_leadership_demo_result.js",
"node scripts/test_build_plant_manager_leadership_scenario_comparison.js",
"node scripts/test_build_capability_projection.js",


"node scripts/test_build_capability_definition_from_projection.js",


  ],
},


  {
    name: "Capability Execution Core",
    commands: [
      "node scripts/test_build_capability_definition.js",
      "node scripts/test_build_capability_contribution.js",
      "node scripts/test_build_capability_contribution_match.js",
      "node scripts/test_build_capability_aggregation_context.js",
      "node scripts/test_build_capability_result.js",
      "node scripts/test_health_capability_core.js",
      "node scripts/test_capability_core_regression.js",
    ],
  },
  {
    name: "Measurement Core",
    commands: [
      "node scripts/test_build_decision_accountability_observation.js",
      "node scripts/test_build_decision_accountability_measure_result.js",
      "node scripts/test_build_measurement_factor_definition.js",
      "node scripts/test_build_management_observation.js",
      "node scripts/test_build_measurement_profile.js",
      "node scripts/test_build_measure_result.js",
      "node scripts/test_health_measure_result.js",
      "node scripts/test_measurement_core_regression.js",
    ],
  },
  {
    name: "Runtime and General Health",
    commands: [
      "node scripts/test_imago_runtime_regression.js",
      "node scripts/fringe_health_check.js",
    ],
  },
];

for (const group of testGroups) {
  console.log("\n========================================");
  console.log(`TEST GROUP: ${group.name}`);
  console.log("========================================");

  for (const command of group.commands) {
    console.log(`\nRUNNING: ${command}`);

    try {
      execSync(command, { stdio: "inherit" });
      console.log(`PASS: ${command}`);
    } catch (error) {
      console.error(`FAIL: ${command}`);
      process.exit(1);
    }
  }
}

console.log("\n✅ IMAGO Core all tests PASSED");

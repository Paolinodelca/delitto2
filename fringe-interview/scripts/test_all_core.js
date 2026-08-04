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
"node scripts/test_build_decision_accountability_leadership_contribution.js",
"node scripts/test_health_measurement_capability_bridge.js",
"node scripts/test_measurement_capability_bridge_regression.js",
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
    name: "Dimension Contribution Core",
    commands: [
      "node scripts/test_build_dimension_contribution.js",
      "node scripts/test_dimension_contribution_regression.js",
      "node scripts/test_health_dimension_contribution.js",
    ],
  },
  {
    name: "Measurement-to-Dimension Mapping Core",
    commands: [
      "node scripts/test_build_measurement_dimension_mapping.js",
      "node scripts/test_map_measurement_result_to_dimension_contributions.js",
      "node scripts/test_measurement_result_dimension_contribution_mapping_hardening.js",
      "node scripts/test_measurement_dimension_mapping_regression.js",
      "node scripts/test_health_measurement_dimension_mapping.js",
      "node scripts/test_measurement_result_mapping_applicability.js",
      "node scripts/test_measurement_result_mapping_applicability_boundary.js",
      "node scripts/test_measurement_result_mapping_applicability_public_api.js",
      "node scripts/test_health_measurement_result_mapping_applicability.js",
    ],
  },
  {
    name: "Dimension Knowledge State Core",
    commands: [
      "node scripts/test_build_dimension_knowledge_state.js",
      "node scripts/test_dimension_knowledge_state_regression.js",
      "node scripts/test_health_dimension_knowledge_state.js",
    ],
  },
  {
    name: "Elementary Dimension Aggregation Core",
    commands: [
      "node scripts/test_aggregate_dimension_contributions.js",
      "node scripts/test_dimension_aggregation_regression.js",
      "node scripts/test_health_dimension_aggregation.js",
    ],
  },
  {
    name: "Knowledge Ledger and Snapshot Core",
    commands: [
      "node scripts/test_knowledge_ledger.js",
      "node scripts/test_dimension_contribution_ledger_intake_hardening.js",
      "node scripts/test_knowledge_snapshot.js",
      "node scripts/test_knowledge_ledger_snapshot_regression.js",
      "node scripts/test_health_knowledge_ledger_snapshot.js",
    ],
  },
  {
    name: "Derived Knowledge Core",
    commands: [
      "node scripts/test_derived_knowledge_rule.js",
      "node scripts/test_derived_knowledge_result.js",
      "node scripts/test_evaluate_derived_knowledge_rules.js",
      "node scripts/test_derived_knowledge_regression.js",
      "node scripts/test_health_derived_knowledge.js",
    ],
  },
  {
    name: "Capability Recipe Execution Core",
    commands: [
      "node scripts/test_capability_recipe.js",
      "node scripts/test_capability_execution_result.js",
      "node scripts/test_execute_capability_recipe.js",
      "node scripts/test_capability_recipe_execution_regression.js",
      "node scripts/test_health_capability_recipe_execution.js",
    ],
  },
  {
    name: "Derived Dimension State Core",
    commands: [
      "node scripts/test_derived_dimension_knowledge_state.js",
      "node scripts/test_build_derived_dimension_knowledge_states.js",
      "node scripts/test_derived_dimension_state_regression.js",
      "node scripts/test_health_derived_dimension_state.js",
    ],
  },
  {
    name: "Person Knowledge Matrix Core",
    commands: [
      "node scripts/test_person_knowledge_matrix.js",
      "node scripts/test_person_knowledge_matrix_regression.js",
      "node scripts/test_health_person_knowledge_matrix.js",
      "node scripts/test_person_knowledge_matrix_query.js",
      "node scripts/test_person_knowledge_matrix_query_regression.js",
      "node scripts/test_health_person_knowledge_matrix_query.js",
      "node scripts/test_knowledge_coverage.js",
      "node scripts/test_knowledge_coverage_regression.js",
      "node scripts/test_health_knowledge_coverage.js",
      "node scripts/test_knowledge_coverage_query.js",
      "node scripts/test_knowledge_coverage_query_regression.js",
      "node scripts/test_health_knowledge_coverage_query.js",
      "node scripts/test_knowledge_opportunity.js",
      "node scripts/test_knowledge_opportunity_regression.js",
      "node scripts/test_health_knowledge_opportunity.js",
      "node scripts/test_knowledge_opportunity_query.js",
      "node scripts/test_knowledge_opportunity_query_regression.js",
      "node scripts/test_health_knowledge_opportunity_query.js",
      "node scripts/test_knowledge_acquisition_need.js",
      "node scripts/test_knowledge_acquisition_need_regression.js",
      "node scripts/test_health_knowledge_acquisition_need.js",
      "node scripts/test_knowledge_acquisition_need_query.js",
      "node scripts/test_knowledge_acquisition_need_query_regression.js",
      "node scripts/test_health_knowledge_acquisition_need_query.js",
      "node scripts/test_knowledge_acquisition_strategy.js",
      "node scripts/test_knowledge_acquisition_strategy_regression.js",
      "node scripts/test_health_knowledge_acquisition_strategy.js",
      "node scripts/test_knowledge_acquisition_strategy_query.js",
      "node scripts/test_knowledge_acquisition_strategy_query_regression.js",
      "node scripts/test_health_knowledge_acquisition_strategy_query.js",
      "node scripts/test_knowledge_acquisition_requirement.js",
      "node scripts/test_knowledge_acquisition_requirement_regression.js",
      "node scripts/test_health_knowledge_acquisition_requirement.js",
      "node scripts/test_knowledge_acquisition_requirement_query.js",
      "node scripts/test_knowledge_acquisition_requirement_query_regression.js",
      "node scripts/test_health_knowledge_acquisition_requirement_query.js",
      "node scripts/test_knowledge_acquisition_design.js",
      "node scripts/test_knowledge_acquisition_design_regression.js",
      "node scripts/test_health_knowledge_acquisition_design.js",
      "node scripts/test_knowledge_acquisition_capability_match.js",
      "node scripts/test_knowledge_acquisition_capability_match_regression.js",
      "node scripts/test_health_knowledge_acquisition_capability_match.js",
      "node scripts/test_knowledge_acquisition_boundary_freeze.js",
      "node scripts/test_health_knowledge_acquisition_boundary.js",
    ],
  },
  {
    name: "Knowledge Acquisition Application Decision",
    commands: [
      "node scripts/test_knowledge_acquisition_solution_decision.js",
      "node scripts/test_knowledge_acquisition_solution_decision_regression.js",
      "node scripts/test_knowledge_acquisition_solution_decision_public_api.js",
      "node scripts/test_health_knowledge_acquisition_solution_decision.js",
      "node scripts/test_knowledge_acquisition_capability_composition_design.js",
      "node scripts/test_knowledge_acquisition_capability_composition_design_regression.js",
      "node scripts/test_knowledge_acquisition_capability_composition_design_context.js",
      "node scripts/test_knowledge_acquisition_capability_composition_design_public_api.js",
      "node scripts/test_health_knowledge_acquisition_capability_composition_design.js",
      "node scripts/test_knowledge_acquisition_capability_configuration.js",
      "node scripts/test_knowledge_acquisition_capability_configuration_regression.js",
      "node scripts/test_knowledge_acquisition_capability_configuration_context.js",
      "node scripts/test_knowledge_acquisition_capability_configuration_public_api.js",
      "node scripts/test_health_knowledge_acquisition_capability_configuration.js",
      "node scripts/test_knowledge_acquisition_plan.js",
      "node scripts/test_knowledge_acquisition_plan_identity.js",
      "node scripts/test_knowledge_acquisition_plan_context.js",
      "node scripts/test_knowledge_acquisition_plan_regression.js",
      "node scripts/test_knowledge_acquisition_plan_public_api.js",
      "node scripts/test_health_knowledge_acquisition_plan.js",
      "node scripts/test_knowledge_acquisition_runtime_session.js",
      "node scripts/test_knowledge_acquisition_runtime_session_identity.js",
      "node scripts/test_knowledge_acquisition_runtime_session_context.js",
      "node scripts/test_knowledge_acquisition_runtime_session_lifecycle.js",
      "node scripts/test_knowledge_acquisition_runtime_session_item_state.js",
      "node scripts/test_knowledge_acquisition_runtime_session_regression.js",
      "node scripts/test_knowledge_acquisition_runtime_session_public_api.js",
      "node scripts/test_health_knowledge_acquisition_runtime_session.js",
      "node scripts/test_knowledge_acquisition_execution.js",
      "node scripts/test_knowledge_acquisition_execution_context.js",
      "node scripts/test_knowledge_acquisition_execution_state.js",
      "node scripts/test_knowledge_acquisition_execution_identity.js",
      "node scripts/test_knowledge_acquisition_execution_boundary.js",
      "node scripts/test_knowledge_acquisition_execution_public_api.js",
      "node scripts/test_health_knowledge_acquisition_execution.js",
      "node scripts/test_knowledge_acquisition_provider_result.js",
      "node scripts/test_knowledge_acquisition_provider_result_public_api.js",
      "node scripts/test_health_knowledge_acquisition_provider_result.js",
      "node scripts/test_structured_input_provider_result_evidence_extractor.js",
      "node scripts/test_structured_input_provider_result_evidence_extractor_regression.js",
      "node scripts/test_structured_input_provider_result_evidence_extractor_public_api.js",
      "node scripts/test_health_structured_input_provider_result_evidence_extractor.js",
      "node scripts/test_knowledge_acquisition_evidence_intake.js",
      "node scripts/test_knowledge_acquisition_evidence_intake_atomicity.js",
      "node scripts/test_knowledge_acquisition_evidence_intake_empty.js",
      "node scripts/test_knowledge_acquisition_evidence_intake_boundary.js",
      "node scripts/test_knowledge_acquisition_evidence_intake_public_api.js",
      "node scripts/test_health_knowledge_acquisition_evidence_intake.js",
      "node scripts/test_registered_evidence_selection.js",
      "node scripts/test_registered_evidence_selection_validation.js",
      "node scripts/test_registered_evidence_selection_boundary.js",
      "node scripts/test_registered_evidence_selection_public_api.js",
      "node scripts/test_health_registered_evidence_selection.js",
      "node scripts/test_registered_evidence_observation_construction.js",
      "node scripts/test_registered_evidence_observation_construction_validation.js",
      "node scripts/test_registered_evidence_observation_construction_boundary.js",
      "node scripts/test_registered_evidence_observation_construction_public_api.js",
      "node scripts/test_health_registered_evidence_observation_construction.js",
      "node scripts/test_registered_observation_measurement_result_normalization.js",
      "node scripts/test_registered_observation_measurement_result_normalization_validation.js",
      "node scripts/test_registered_observation_measurement_result_normalization_boundary.js",
      "node scripts/test_registered_observation_measurement_result_normalization_public_api.js",
      "node scripts/test_health_registered_observation_measurement_result_normalization.js",
      "node scripts/test_structured_input_knowledge_acquisition_invocation_adapter.js",
      "node scripts/test_structured_input_knowledge_acquisition_invocation_adapter_public_api.js",
      "node scripts/test_health_structured_input_knowledge_acquisition_invocation_adapter.js",
      "node scripts/test_knowledge_acquisition_declarative_integrity.js",
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
      name: "IMAGO Builder Foundation",
      commands: [
        "node scripts/test_build_generation_plan.js",
        "node scripts/test_generation_plan_regression.js",
         "node scripts/test_build_measurement_module_spec.js",
        "node scripts/test_validate_measurement_module_spec.js",
        "node scripts/test_measurement_module_spec_regression.js",
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

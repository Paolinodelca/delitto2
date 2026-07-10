const {
  buildMeasurementFactorDefinition,
} = require("../src/core/measurement/buildMeasurementFactorDefinition");

const {
  validateMeasurementFactorDefinition,
} = require("../src/core/measurement/validateMeasurementFactorDefinition");

const {
  getMeasurementFactorDefinition,
} = require("../src/core/measurement/getMeasurementFactorDefinition");

const failures = [];

/*
 * Scenario A — teamSize
 */
const teamSizeDefinition =
  buildMeasurementFactorDefinition("teamSize");

const teamSizeValidation =
  validateMeasurementFactorDefinition(teamSizeDefinition);

if (!teamSizeValidation.isValid) {
  failures.push(
    `teamSize definition invalid: ${teamSizeValidation.errors.join("; ")}`
  );
}

if (
  teamSizeDefinition.scoring.strategy !== "ratio_to_benchmark"
) {
  failures.push(
    'Expected teamSize strategy === "ratio_to_benchmark".'
  );
}

if (teamSizeDefinition.defaultWeight !== 0.35) {
  failures.push("Expected teamSize defaultWeight === 0.35.");
}

if (
  !teamSizeDefinition.supportedDimensions.includes(
    "management_scope"
  )
) {
  failures.push(
    "Expected teamSize to support management_scope."
  );
}

/*
 * Scenario B — responsibilityType
 */
const responsibilityTypeDefinition =
  getMeasurementFactorDefinition("responsibilityType");

const responsibilityTypeValidation =
  validateMeasurementFactorDefinition(
    responsibilityTypeDefinition
  );

if (!responsibilityTypeValidation.isValid) {
  failures.push(
    `responsibilityType definition invalid: ${responsibilityTypeValidation.errors.join(
      "; "
    )}`
  );
}

if (
  responsibilityTypeDefinition.scoring.strategy !== "enum_map"
) {
  failures.push(
    'Expected responsibilityType strategy === "enum_map".'
  );
}

if (
  responsibilityTypeDefinition.scoring.parameters.values.direct !== 1
) {
  failures.push(
    "Expected responsibilityType direct value === 1."
  );
}

if (
  responsibilityTypeDefinition.scoring.parameters.values.indirect !==
  0.4
) {
  failures.push(
    "Expected responsibilityType indirect value === 0.4."
  );
}

/*
 * Scenario C — contextRelevance
 */
const contextRelevanceDefinition =
  buildMeasurementFactorDefinition("contextRelevance");

const contextRelevanceValidation =
  validateMeasurementFactorDefinition(
    contextRelevanceDefinition
  );

if (!contextRelevanceValidation.isValid) {
  failures.push(
    `contextRelevance definition invalid: ${contextRelevanceValidation.errors.join(
      "; "
    )}`
  );
}

if (
  contextRelevanceDefinition.scoring.strategy !== "normalized_value"
) {
  failures.push(
    'Expected contextRelevance strategy === "normalized_value".'
  );
}

if (contextRelevanceDefinition.defaultWeight !== 0.15) {
  failures.push(
    "Expected contextRelevance defaultWeight === 0.15."
  );
}

if (
  contextRelevanceDefinition.inputField !== "contextRelevance"
) {
  failures.push(
    'Expected contextRelevance inputField === "contextRelevance".'
  );
}

/*
 * Scenario D — Unknown factor
 */
const unknownDefinition =
  buildMeasurementFactorDefinition("inventedFactor");

const unknownValidation =
  validateMeasurementFactorDefinition(unknownDefinition);

if (!unknownValidation.isValid) {
  failures.push(
    `Unknown factor should be structurally valid: ${unknownValidation.errors.join(
      "; "
    )}`
  );
}

if (unknownDefinition.scoring.strategy !== "unsupported") {
  failures.push(
    'Expected unknown factor strategy === "unsupported".'
  );
}

if (unknownValidation.warnings.length === 0) {
  failures.push(
    "Expected unknown factor warnings.length > 0."
  );
}

console.log(
  JSON.stringify(
    {
      test: "Measurement Factor Definition",
      status: failures.length === 0 ? "PASS" : "FAIL",

      teamSize: {
        strategy: teamSizeDefinition.scoring.strategy,
        defaultWeight: teamSizeDefinition.defaultWeight,
      },

      responsibilityType: {
        strategy:
          responsibilityTypeDefinition.scoring.strategy,
        values:
          responsibilityTypeDefinition.scoring.parameters.values,
      },

      contextRelevance: {
        strategy:
          contextRelevanceDefinition.scoring.strategy,
        defaultWeight:
          contextRelevanceDefinition.defaultWeight,
        inputField:
          contextRelevanceDefinition.inputField,
      },

      unknown: {
        strategy: unknownDefinition.scoring.strategy,
        warnings: unknownValidation.warnings,
      },
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_build_measurement_factor_definition PASS");
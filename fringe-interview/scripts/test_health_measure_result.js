const {
  healthBuildMeasureResult,
} = require("../src/core/measurement/healthBuildMeasureResult");

const result = healthBuildMeasureResult();

console.log(JSON.stringify(result, null, 2));

if (result.status !== "PASS") {
  console.error('Expected status === "PASS".');
  process.exit(1);
}

if (result.dimensionId !== "management_scope") {
  console.error(
    'Expected dimensionId === "management_scope".'
  );
  process.exit(1);
}

if (
  typeof result.measureValue !== "number" ||
  result.measureValue <= 0 ||
  result.measureValue >= 1
) {
  console.error(
    "Expected base measureValue > 0 and < 1."
  );
  process.exit(1);
}

if (result.profileApplied !== true) {
  console.error(
    "Expected standard profileApplied === true."
  );
  process.exit(1);
}

if (!result.disabledFactorProfile) {
  console.error(
    "Expected disabledFactorProfile."
  );
  process.exit(1);
}

if (
  result.disabledFactorProfile.profileId !==
  "management_disabled_factor_health"
) {
  console.error(
    "Expected disabled factor health profileId."
  );
  process.exit(1);
}

if (
  !result.disabledFactorProfile.disabledFactors.includes(
    "managementLayer"
  )
) {
  console.error(
    "Expected managementLayer in disabled factors."
  );
  process.exit(1);
}

if (
  result.disabledFactorProfile.activeFactors.includes(
    "managementLayer"
  )
) {
  console.error(
    "Expected managementLayer not in active factors."
  );
  process.exit(1);
}

if (
  result.disabledFactorProfile.activeFactors.length !== 3
) {
  console.error(
    "Expected three active factors."
  );
  process.exit(1);
}

if (result.baseDefinitionUnchanged !== true) {
  console.error(
    "Expected base definition unchanged."
  );
  process.exit(1);
}

if (
  !result.validation ||
  !result.validation.disabledFactorResult ||
  result.validation.disabledFactorResult.isValid !== true
) {
  console.error(
    "Expected disabled factor result validation to pass."
  );
  process.exit(1);
}

console.log("test_health_measure_result PASS");
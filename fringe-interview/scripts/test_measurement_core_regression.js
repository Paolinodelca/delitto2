const {
  buildMeasurementDefinition,
} = require("../src/core/measurement/buildMeasurementDefinition");
const {
  buildMeasurementProfile,
} = require("../src/core/measurement/buildMeasurementProfile");
const {
  buildMeasureResult,
} = require("../src/core/measurement/buildMeasureResult");
const {
  validateMeasureResult,
} = require("../src/core/measurement/validateMeasureResult");

const failures = [];

const definition =
  buildMeasurementDefinition("management_scope");

const strongObservation = {
  observationId: "management_strong",
  teamSize: 100,
  durationYears: 10,
  responsibilityType: "direct",
  managementLayer: "multi_layer",
  contextType: "business_unit",
  evidenceIds: ["ev_strong"],
  confidence: 0.95,
};

const intermediateObservation = {
  observationId: "management_intermediate",
  teamSize: 20,
  durationYears: 4,
  responsibilityType: "direct",
  managementLayer: "single_layer",
  contextType: "technical_office",
  evidenceIds: ["ev_intermediate"],
  confidence: 0.85,
};

const weakObservation = {
  observationId: "management_weak",
  teamSize: 5,
  durationYears: 1,
  responsibilityType: "shared",
  managementLayer: "single_layer",
  contextType: "small_team",
  evidenceIds: ["ev_weak"],
  confidence: 0.7,
};

/*
 * Regressione base
 */
const strongResult = buildMeasureResult({
  definition,
  observations: [strongObservation],
});

const intermediateResult = buildMeasureResult({
  definition,
  observations: [intermediateObservation],
});

const multipleResult = buildMeasureResult({
  definition,
  observations: [
    intermediateObservation,
    weakObservation,
  ],
});

const unknownResult = buildMeasureResult({
  definition,
  observations: [],
});

[
  strongResult,
  intermediateResult,
  multipleResult,
  unknownResult,
].forEach((result, index) => {
  const validation = validateMeasureResult(result);

  if (!validation.isValid) {
    failures.push(
      `Base result ${index} invalid: ${validation.errors.join(
        "; "
      )}`
    );
  }
});

if (strongResult.value !== 1) {
  failures.push("Expected strong value === 1.");
}

if (
  intermediateResult.value <= 0 ||
  intermediateResult.value >= 1
) {
  failures.push(
    "Expected intermediate value > 0 and < 1."
  );
}

if (multipleResult.observationResults.length !== 2) {
  failures.push(
    "Expected two observation results."
  );
}

if (unknownResult.observationStatus !== "unknown") {
  failures.push(
    'Expected unknown status === "unknown".'
  );
}

/*
 * Regressione disabled factor
 */
const disabledProfile = buildMeasurementProfile({
  profileId: "regression_disabled_layer",
  label: "Regression Disabled Layer",
  baseModelId: "management_scope_v1",

  disabledFactors: ["managementLayer"],

  rationale: "Regression for factor disabling.",

  source: {
    type: "regression_test",
    id: "disabled_layer_regression",
  },
});

const definitionBefore = JSON.stringify(definition);

const disabledResult = buildMeasureResult({
  definition,
  observations: [intermediateObservation],
  profile: disabledProfile,
});

const definitionAfter = JSON.stringify(definition);

const disabledValidation =
  validateMeasureResult(disabledResult);

if (!disabledValidation.isValid) {
  failures.push(
    `Disabled result invalid: ${disabledValidation.errors.join(
      "; "
    )}`
  );
}

if (
  !disabledResult.measurementContext.disabledFactors.includes(
    "managementLayer"
  )
) {
  failures.push(
    "Expected managementLayer disabled."
  );
}

if (
  disabledResult.measurementContext.activeFactors.includes(
    "managementLayer"
  )
) {
  failures.push(
    "Expected managementLayer not active."
  );
}

if (definitionBefore !== definitionAfter) {
  failures.push(
    "Expected definition immutability."
  );
}

/*
 * Regressione all disabled
 */
const allDisabledProfile = buildMeasurementProfile({
  profileId: "regression_all_disabled",
  label: "Regression All Disabled",
  baseModelId: "management_scope_v1",

  disabledFactors: [
    "teamSize",
    "durationYears",
    "responsibilityType",
    "managementLayer",
  ],

  rationale: "Regression for all factors disabled.",

  source: {
    type: "regression_test",
    id: "all_disabled_regression",
  },
});

const allDisabledResult = buildMeasureResult({
  definition,
  observations: [strongObservation],
  profile: allDisabledProfile,
});

const allDisabledValidation =
  validateMeasureResult(allDisabledResult);

if (!allDisabledValidation.isValid) {
  failures.push(
    `All-disabled result invalid: ${allDisabledValidation.errors.join(
      "; "
    )}`
  );
}

if (allDisabledResult.value !== 0) {
  failures.push(
    "Expected all-disabled value === 0."
  );
}

if (allDisabledResult.observationStatus !== "unknown") {
  failures.push(
    "Expected all-disabled status unknown."
  );
}

if (
  !allDisabledResult.limitations.includes(
    "No active measurement factors were available."
  )
) {
  failures.push(
    "Expected no-active-factors limitation."
  );
}

const output = {
  test: "Measurement Core Regression",

  status: failures.length === 0 ? "PASS" : "FAIL",

  strongValue: strongResult.value,

  intermediateValue: intermediateResult.value,

  multipleObservationsValue: multipleResult.value,

  unknownStatus: unknownResult.observationStatus,

  disabledFactor: {
    value: disabledResult.value,

    activeFactors:
      disabledResult.measurementContext.activeFactors,

    disabledFactors:
      disabledResult.measurementContext.disabledFactors,
  },

  allDisabled: {
    value: allDisabledResult.value,

    observationStatus:
      allDisabledResult.observationStatus,

    limitations: allDisabledResult.limitations,
  },

  definitionUnchanged:
    definitionBefore === definitionAfter,
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_measurement_core_regression PASS");
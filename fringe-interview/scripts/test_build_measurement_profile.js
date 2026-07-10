const {
  buildMeasurementDefinition,
} = require("../src/core/measurement/buildMeasurementDefinition");
const {
  buildMeasurementProfile,
} = require("../src/core/measurement/buildMeasurementProfile");
const {
  validateMeasurementProfile,
} = require("../src/core/measurement/validateMeasurementProfile");
const {
  applyMeasurementProfile,
} = require("../src/core/measurement/applyMeasurementProfile");

const failures = [];

function sumWeights(weights) {
  return Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );
}

const definition =
  buildMeasurementDefinition("management_scope");

/*
 * Scenario A — Profilo valido
 */
const validProfile = buildMeasurementProfile({
  profileId: "management_scope_recruiter_001",

  label: "Management Scope — Production Manager",

  baseModelId: "management_scope_v1",

  overrides: {
    weights: {
      teamSize: 0.45,
      durationYears: 0.25,
      responsibilityType: 0.2,
      managementLayer: 0.1,
    },

    thresholds: {
      minimum: 0.65,
    },

    benchmark: {
      teamSize: 150,
    },
  },

  rationale:
    "Production role with large direct workforce responsibility.",

  source: {
    type: "recruiter_configuration",
    id: "recruiter_001",
  },
});

const validProfileValidation =
  validateMeasurementProfile(validProfile);

if (!validProfileValidation.isValid) {
  failures.push(
    `Valid profile failed validation: ${validProfileValidation.errors.join(
      "; "
    )}`
  );
}

const definitionBefore = JSON.stringify(definition);

const appliedProfile = applyMeasurementProfile({
  definition,
  profile: validProfile,
});

if (
  appliedProfile.effectiveDefinition.aggregation.weights.teamSize !==
  0.45
) {
  failures.push(
    "Expected effective teamSize weight === 0.45."
  );
}

if (
  appliedProfile.effectiveDefinition.benchmark.reference.teamSize !==
  150
) {
  failures.push(
    "Expected effective benchmark teamSize === 150."
  );
}

if (
  appliedProfile.effectiveDefinition.thresholds.minimum !==
  0.65
) {
  failures.push(
    "Expected effective threshold minimum === 0.65."
  );
}

/*
 * Scenario B — Disattivazione managementLayer
 */
const disabledProfile = buildMeasurementProfile({
  profileId: "management_disable_layer",
  label: "Management Without Layer",
  baseModelId: "management_scope_v1",

  disabledFactors: ["managementLayer"],

  rationale: "Management layer excluded for this model.",

  source: {
    type: "test_configuration",
    id: "disable_layer_test",
  },
});

const disabledAppliedProfile = applyMeasurementProfile({
  definition,
  profile: disabledProfile,
});

const disabledAggregation =
  disabledAppliedProfile.effectiveDefinition.aggregation;

if (
  !disabledAppliedProfile.disabledFactors.includes(
    "managementLayer"
  )
) {
  failures.push(
    "Expected disabledFactors to contain managementLayer."
  );
}

if (
  !disabledAppliedProfile.appliedOverrides.disabledFactors.includes(
    "managementLayer"
  )
) {
  failures.push(
    "Expected appliedOverrides.disabledFactors to contain managementLayer."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    disabledAggregation.activeWeights,
    "managementLayer"
  )
) {
  failures.push(
    "Expected activeWeights not to contain managementLayer."
  );
}

if (
  Math.abs(
    sumWeights(disabledAggregation.activeWeights) - 1
  ) > 0.0001
) {
  failures.push(
    "Expected activeWeights sum to be approximately 1."
  );
}

/*
 * Scenario C — Fattore sconosciuto
 */
const unknownFactorProfile = buildMeasurementProfile({
  profileId: "management_unknown_factor",
  label: "Unknown Factor Profile",
  baseModelId: "management_scope_v1",

  disabledFactors: ["unknownFactor"],

  rationale: "Tests unknown disabled factor.",

  source: {
    type: "test_configuration",
    id: "unknown_factor_test",
  },
});

const unknownFactorApplication = applyMeasurementProfile({
  definition,
  profile: unknownFactorProfile,
});

if (
  !unknownFactorApplication.warnings.includes(
    "Unknown disabled factor: unknownFactor"
  )
) {
  failures.push(
    "Expected warning for unknown disabled factor."
  );
}

if (
  Object.keys(
    unknownFactorApplication.effectiveDefinition.aggregation
      .activeWeights
  ).length !== 4
) {
  failures.push(
    "Expected all valid factors to remain active."
  );
}

/*
 * Scenario D — Tutti i fattori disattivati
 */
const allDisabledProfile = buildMeasurementProfile({
  profileId: "management_all_disabled",
  label: "All Factors Disabled",
  baseModelId: "management_scope_v1",

  disabledFactors: [
    "teamSize",
    "durationYears",
    "responsibilityType",
    "managementLayer",
  ],

  rationale: "Tests all factors disabled.",

  source: {
    type: "test_configuration",
    id: "all_disabled_test",
  },
});

const allDisabledApplication = applyMeasurementProfile({
  definition,
  profile: allDisabledProfile,
});

if (
  Object.keys(
    allDisabledApplication.effectiveDefinition.aggregation
      .activeWeights
  ).length !== 0
) {
  failures.push(
    "Expected activeWeights to be empty when all factors are disabled."
  );
}

if (
  !allDisabledApplication.warnings.includes(
    "All measurement factors are disabled."
  )
) {
  failures.push(
    "Expected all-factors-disabled warning."
  );
}

/*
 * Scenario E — Immutabilità
 */
const definitionAfter = JSON.stringify(definition);

if (definitionBefore !== definitionAfter) {
  failures.push(
    "Expected original MeasurementDefinition to remain unchanged."
  );
}

/*
 * Scenario F — Added factors conservati
 */
const addedFactorProfile = buildMeasurementProfile({
  profileId: "management_added_factor",
  label: "Added Factor Profile",
  baseModelId: "management_scope_v1",

  addedFactors: [
    {
      factorId: "changeManagement",
      weight: 0.2,
      minimum: 0.6,
    },
  ],

  rationale: "Tests preservation of added factors.",

  source: {
    type: "test_configuration",
    id: "added_factor_test",
  },
});

const addedFactorApplication = applyMeasurementProfile({
  definition,
  profile: addedFactorProfile,
});

if (addedFactorApplication.addedFactors.length !== 1) {
  failures.push(
    "Expected addedFactors to be preserved."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    addedFactorApplication.effectiveDefinition.aggregation
      .activeWeights,
    "changeManagement"
  )
) {
  failures.push(
    "Expected added factor not to enter activeWeights."
  );
}

const output = {
  test: "Measurement Profile Disables Existing Factors",

  status: failures.length === 0 ? "PASS" : "FAIL",

  validProfile: {
    isValid: validProfileValidation.isValid,
    activeWeights:
      appliedProfile.effectiveDefinition.aggregation.activeWeights,
  },

  disabledProfile: {
    disabledFactors:
      disabledAppliedProfile.disabledFactors,
    activeWeights:
      disabledAggregation.activeWeights,
    activeWeightSum:
      sumWeights(disabledAggregation.activeWeights),
  },

  unknownFactor: {
    warnings: unknownFactorApplication.warnings,
  },

  allDisabled: {
    activeWeights:
      allDisabledApplication.effectiveDefinition.aggregation
        .activeWeights,
    warnings: allDisabledApplication.warnings,
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
console.log("test_build_measurement_profile PASS");
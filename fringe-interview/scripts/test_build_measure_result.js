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

function sumWeights(weights) {
  return Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );
}

const definition =
  buildMeasurementDefinition("management_scope");

const observation = {
  observationId: "management_test_001",
  teamSize: 20,
  durationYears: 4,
  responsibilityType: "direct",
  managementLayer: "multi_layer",
  contextType: "technical_office",
  evidenceIds: ["ev_test_001"],
  confidence: 0.85,
};

/*
 * Scenario A — Nessun fattore disattivato
 */
const baseResult = buildMeasureResult({
  definition,
  observations: [observation],
});

const baseValidation = validateMeasureResult(baseResult);

if (!baseValidation.isValid) {
  failures.push(
    `Base result validation failed: ${baseValidation.errors.join(
      "; "
    )}`
  );
}

if (
  baseResult.measurementContext.activeFactors.length !== 4
) {
  failures.push(
    "Expected four active factors without profile."
  );
}

if (
  baseResult.measurementContext.disabledFactors.length !== 0
) {
  failures.push(
    "Expected zero disabled factors without profile."
  );
}

if (
  baseResult.observationResults[0].factorUsage.activeFactors
    .length !== 4
) {
  failures.push(
    "Expected observation factorUsage to contain four active factors."
  );
}

/*
 * Scenario B — Disattivazione managementLayer
 */
const disabledProfile = buildMeasurementProfile({
  profileId: "disable_management_layer",
  label: "Disable Management Layer",
  baseModelId: "management_scope_v1",

  disabledFactors: ["managementLayer"],

  rationale: "Tests factor disabling.",

  source: {
    type: "test_configuration",
    id: "disable_management_layer_test",
  },
});

const definitionBefore = JSON.stringify(definition);

const disabledResult = buildMeasureResult({
  definition,
  observations: [observation],
  profile: disabledProfile,
});

const definitionAfter = JSON.stringify(definition);

const disabledValidation =
  validateMeasureResult(disabledResult);

if (!disabledValidation.isValid) {
  failures.push(
    `Disabled result validation failed: ${disabledValidation.errors.join(
      "; "
    )}`
  );
}

if (
  disabledResult.measurementContext.profileApplied !== true
) {
  failures.push(
    "Expected disabled profile to be applied."
  );
}

if (
  !disabledResult.measurementContext.disabledFactors.includes(
    "managementLayer"
  )
) {
  failures.push(
    "Expected managementLayer to be disabled."
  );
}

if (
  disabledResult.measurementContext.activeFactors.includes(
    "managementLayer"
  )
) {
  failures.push(
    "Expected managementLayer not to be active."
  );
}

const disabledActiveWeights =
  disabledResult.measurementContext.profileApplied
    ? disabledResult.observationResults[0].factorUsage.activeFactors
    : [];

if (disabledActiveWeights.includes("managementLayer")) {
  failures.push(
    "Expected observation factorUsage not to include managementLayer as active."
  );
}

if (disabledResult.value === baseResult.value) {
  failures.push(
    "Expected disabled-factor value to differ from base value."
  );
}

/*
 * Verifica activeWeights tramite applicazione profilo
 */
const {
  applyMeasurementProfile,
} = require("../src/core/measurement/applyMeasurementProfile");

const appliedDisabledProfile = applyMeasurementProfile({
  definition,
  profile: disabledProfile,
});

const activeWeights =
  appliedDisabledProfile.effectiveDefinition.aggregation.activeWeights;

if (
  Object.prototype.hasOwnProperty.call(
    activeWeights,
    "managementLayer"
  )
) {
  failures.push(
    "Expected activeWeights not to contain managementLayer."
  );
}

if (Math.abs(sumWeights(activeWeights) - 1) > 0.0001) {
  failures.push(
    "Expected activeWeights sum to be approximately 1."
  );
}

/*
 * Scenario C — Fattore sconosciuto
 */
const unknownFactorProfile = buildMeasurementProfile({
  profileId: "unknown_factor_profile",
  label: "Unknown Factor Profile",
  baseModelId: "management_scope_v1",

  disabledFactors: ["unknownFactor"],

  rationale: "Tests unknown factor handling.",

  source: {
    type: "test_configuration",
    id: "unknown_factor_test",
  },
});

const unknownFactorResult = buildMeasureResult({
  definition,
  observations: [observation],
  profile: unknownFactorProfile,
});

const unknownFactorValidation =
  validateMeasureResult(unknownFactorResult);

if (!unknownFactorValidation.isValid) {
  failures.push(
    `Unknown-factor result should be valid: ${unknownFactorValidation.errors.join(
      "; "
    )}`
  );
}

if (
  unknownFactorResult.measurementContext.profileApplied !== true
) {
  failures.push(
    "Expected unknown-factor profile to be applied."
  );
}

if (
  unknownFactorResult.measurementContext.activeFactors.length !==
  4
) {
  failures.push(
    "Expected four active factors after unknown disabled factor."
  );
}

if (
  !unknownFactorResult.extensions.profileWarnings.includes(
    "Unknown disabled factor: unknownFactor"
  )
) {
  failures.push(
    "Expected unknown-factor warning in extensions.profileWarnings."
  );
}

/*
 * Scenario D — Tutti i fattori disattivati
 */
const allDisabledProfile = buildMeasurementProfile({
  profileId: "all_disabled_profile",
  label: "All Disabled Profile",
  baseModelId: "management_scope_v1",

  disabledFactors: [
    "teamSize",
    "durationYears",
    "responsibilityType",
    "managementLayer",
  ],

  rationale: "Tests no active factors.",

  source: {
    type: "test_configuration",
    id: "all_disabled_test",
  },
});

const allDisabledResult = buildMeasureResult({
  definition,
  observations: [observation],
  profile: allDisabledProfile,
});

const allDisabledValidation =
  validateMeasureResult(allDisabledResult);

if (!allDisabledValidation.isValid) {
  failures.push(
    `All-disabled result should remain valid: ${allDisabledValidation.errors.join(
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
    'Expected all-disabled observationStatus === "unknown".'
  );
}

if (
  allDisabledResult.measurementContext.activeFactors.length !==
  0
) {
  failures.push(
    "Expected no active factors."
  );
}

if (
  allDisabledResult.measurementContext.disabledFactors.length !==
  4
) {
  failures.push(
    "Expected four disabled factors."
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

/*
 * Scenario E — Immutabilità
 */
if (definitionBefore !== definitionAfter) {
  failures.push(
    "Expected definition to remain unchanged."
  );
}

/*
 * Scenario F — Added factors non operativi
 */
const addedFactorProfile = buildMeasurementProfile({
  profileId: "added_factor_profile",
  label: "Added Factor Profile",
  baseModelId: "management_scope_v1",

  addedFactors: [
    {
      factorId: "changeManagement",
      weight: 0.2,
      minimum: 0.6,
    },
  ],

  rationale: "Tests non-operative added factors.",

  source: {
    type: "test_configuration",
    id: "added_factor_test",
  },
});

const addedFactorResult = buildMeasureResult({
  definition,
  observations: [observation],
  profile: addedFactorProfile,
});

if (
  addedFactorResult.measurementContext.activeFactors.includes(
    "changeManagement"
  )
) {
  failures.push(
    "Expected changeManagement not to enter active factors."
  );
}

if (
  !addedFactorResult.limitations.includes(
    "Added factors are not yet applied by buildMeasureResult."
  )
) {
  failures.push(
    "Expected added-factors limitation."
  );
}

const output = {
  test: "Measure Result Factor Disabling",

  status: failures.length === 0 ? "PASS" : "FAIL",

  base: {
    value: baseResult.value,
    activeFactors:
      baseResult.measurementContext.activeFactors,
    disabledFactors:
      baseResult.measurementContext.disabledFactors,
  },

  disabledProfile: {
    value: disabledResult.value,
    activeFactors:
      disabledResult.measurementContext.activeFactors,
    disabledFactors:
      disabledResult.measurementContext.disabledFactors,
    activeWeights,
    activeWeightSum: sumWeights(activeWeights),
  },

  unknownFactor: {
    warnings:
      unknownFactorResult.extensions.profileWarnings,
  },

  allDisabled: {
    value: allDisabledResult.value,
    observationStatus:
      allDisabledResult.observationStatus,
    activeFactors:
      allDisabledResult.measurementContext.activeFactors,
    disabledFactors:
      allDisabledResult.measurementContext.disabledFactors,
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
console.log("test_build_measure_result PASS");
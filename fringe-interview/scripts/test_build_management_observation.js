const {
  buildManagementObservation,
} = require("../src/core/measurement/buildManagementObservation");
const {
  validateManagementObservation,
} = require("../src/core/measurement/validateManagementObservation");
const {
  buildMeasurementDefinition,
} = require("../src/core/measurement/buildMeasurementDefinition");
const {
  buildMeasureResult,
} = require("../src/core/measurement/buildMeasureResult");

const failures = [];

/*
 * Scenario A — Observation completa
 */
const completeObservation = buildManagementObservation({
  observationId: "management_001",
  teamSize: 20,
  durationYears: 4,
  responsibilityType: "direct",
  managementLayer: "single_layer",
  contextType: "technical_office",
  evidenceIds: ["ev_001"],
  confidence: 0.85,
});

const completeValidation =
  validateManagementObservation(completeObservation);

if (!completeValidation.isValid) {
  failures.push(
    `Complete observation validation failed: ${completeValidation.errors.join(
      "; "
    )}`
  );
}

if (
  completeObservation.observationType !== "management_scope"
) {
  failures.push(
    'Expected observationType === "management_scope".'
  );
}

if (completeObservation.teamSize !== 20) {
  failures.push("Expected teamSize === 20.");
}

if (completeObservation.durationYears !== 4) {
  failures.push("Expected durationYears === 4.");
}

if (completeValidation.warnings.length !== 0) {
  failures.push(
    "Expected complete observation warnings.length === 0."
  );
}

/*
 * Scenario B — Normalizzazione
 */
const normalizedObservation = buildManagementObservation({
  observationId: "management_002",
  teamSize: -10,
  durationYears: -2,
  responsibilityType: "invalid",
  managementLayer: "invalid",
  contextType: null,
  evidenceIds: ["ev_002", "ev_002", "", null],
  confidence: 1.4,
});

const normalizedValidation =
  validateManagementObservation(normalizedObservation);

if (!normalizedValidation.isValid) {
  failures.push(
    `Normalized observation validation failed: ${normalizedValidation.errors.join(
      "; "
    )}`
  );
}

if (normalizedObservation.teamSize !== 0) {
  failures.push(
    "Expected normalized teamSize === 0."
  );
}

if (normalizedObservation.durationYears !== 0) {
  failures.push(
    "Expected normalized durationYears === 0."
  );
}

if (
  normalizedObservation.responsibilityType !== "unknown"
) {
  failures.push(
    'Expected normalized responsibilityType === "unknown".'
  );
}

if (
  normalizedObservation.managementLayer !== "unknown"
) {
  failures.push(
    'Expected normalized managementLayer === "unknown".'
  );
}

if (normalizedObservation.contextType !== "unknown") {
  failures.push(
    'Expected normalized contextType === "unknown".'
  );
}

if (normalizedObservation.evidenceIds.length !== 1) {
  failures.push(
    "Expected normalized evidenceIds.length === 1."
  );
}

if (
  normalizedObservation.evidenceIds[0] !== "ev_002"
) {
  failures.push(
    'Expected normalized evidenceIds[0] === "ev_002".'
  );
}

if (normalizedObservation.confidence !== 1) {
  failures.push(
    "Expected normalized confidence === 1."
  );
}

if (normalizedValidation.warnings.length === 0) {
  failures.push(
    "Expected normalized observation warnings.length > 0."
  );
}

/*
 * Scenario C — Observation incompleta ma valida
 */
const incompleteObservation = buildManagementObservation({
  observationId: "management_003",
});

const incompleteValidation =
  validateManagementObservation(incompleteObservation);

if (!incompleteValidation.isValid) {
  failures.push(
    `Incomplete observation validation failed: ${incompleteValidation.errors.join(
      "; "
    )}`
  );
}

if (incompleteObservation.teamSize !== 0) {
  failures.push(
    "Expected incomplete teamSize === 0."
  );
}

if (incompleteObservation.durationYears !== 0) {
  failures.push(
    "Expected incomplete durationYears === 0."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    incompleteObservation,
    "observationStatus"
  )
) {
  failures.push(
    "Expected observationStatus not to exist on ManagementObservation."
  );
}

if (incompleteValidation.warnings.length === 0) {
  failures.push(
    "Expected incomplete observation warnings.length > 0."
  );
}

/*
 * Scenario D — ID mancante
 */
const missingIdObservation =
  buildManagementObservation({});

const missingIdValidation =
  validateManagementObservation(missingIdObservation);

if (missingIdObservation.observationId !== null) {
  failures.push(
    "Expected missing observationId === null."
  );
}

if (missingIdValidation.isValid !== false) {
  failures.push(
    "Expected missing ID validation.isValid === false."
  );
}

if (
  !missingIdValidation.errors.some((error) =>
    error.includes("observationId")
  )
) {
  failures.push(
    "Expected missing ID errors to contain observationId."
  );
}

/*
 * Compatibilità con MeasureResult
 */
const definition =
  buildMeasurementDefinition("management_scope");

const measureResult = buildMeasureResult({
  definition,
  observations: [completeObservation],
});

if (measureResult.value <= 0) {
  failures.push(
    "Expected measureResult.value > 0."
  );
}

if (measureResult.observationStatus !== "observed") {
  failures.push(
    'Expected measureResult.observationStatus === "observed".'
  );
}

if (!measureResult.evidenceIds.includes("ev_001")) {
  failures.push(
    'Expected measureResult.evidenceIds to contain "ev_001".'
  );
}

const output = {
  test: "Management Observation Contract",
  status: failures.length === 0 ? "PASS" : "FAIL",

  complete: {
    observationId: completeObservation.observationId,
    warnings: completeValidation.warnings.length,
  },

  normalized: {
    teamSize: normalizedObservation.teamSize,
    durationYears: normalizedObservation.durationYears,
    responsibilityType:
      normalizedObservation.responsibilityType,
    managementLayer:
      normalizedObservation.managementLayer,
    contextType: normalizedObservation.contextType,
    evidenceIds: normalizedObservation.evidenceIds,
    confidence: normalizedObservation.confidence,
    warningCount: normalizedValidation.warnings.length,
  },

  incomplete: {
    isValid: incompleteValidation.isValid,
    warningCount: incompleteValidation.warnings.length,
  },

  missingId: {
    observationId: missingIdObservation.observationId,
    isValid: missingIdValidation.isValid,
    errors: missingIdValidation.errors,
  },

  measureCompatibility: {
    value: measureResult.value,
    observationStatus:
      measureResult.observationStatus,
    evidenceIds: measureResult.evidenceIds,
  },
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_build_management_observation PASS");
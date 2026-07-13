const {
  buildManagementObservation,
} = require("../src/core/measurement/buildManagementObservation");

const {
  validateManagementObservation,
} = require("../src/core/measurement/validateManagementObservation");

const failures = [];

/*
 * Scenario A — valore valido
 */
const validObservation =
  buildManagementObservation({
    observationId: "management_context_001",
    teamSize: 20,
    durationYears: 4,
    responsibilityType: "direct",
    managementLayer: "single_layer",
    contextType: "technical_office",
    contextRelevance: 0.82,
    evidenceIds: ["ev_001"],
    confidence: 0.85,
  });

const validValidation =
  validateManagementObservation(
    validObservation
  );

if (!validValidation.isValid) {
  failures.push(
    `Valid observation failed: ${validValidation.errors.join(
      "; "
    )}`
  );
}

if (validObservation.contextRelevance !== 0.82) {
  failures.push(
    "Expected contextRelevance === 0.82."
  );
}

/*
 * Scenario B — oltre massimo
 */
const maximumObservation =
  buildManagementObservation({
    observationId: "management_context_002",
    contextRelevance: 1.4,
  });

if (maximumObservation.contextRelevance !== 1) {
  failures.push(
    "Expected contextRelevance normalized to 1."
  );
}

/*
 * Scenario C — valore negativo
 */
const minimumObservation =
  buildManagementObservation({
    observationId: "management_context_003",
    contextRelevance: -0.3,
  });

if (minimumObservation.contextRelevance !== 0) {
  failures.push(
    "Expected contextRelevance normalized to 0."
  );
}

/*
 * Scenario D — valore mancante
 */
const unavailableObservation =
  buildManagementObservation({
    observationId: "management_context_004",
  });

const unavailableValidation =
  validateManagementObservation(
    unavailableObservation
  );

if (unavailableObservation.contextRelevance !== null) {
  failures.push(
    "Expected missing contextRelevance === null."
  );
}

if (!unavailableValidation.isValid) {
  failures.push(
    "Expected observation with missing contextRelevance to remain valid."
  );
}

if (
  !unavailableValidation.warnings.includes(
    "contextRelevance is not available."
  )
) {
  failures.push(
    "Expected unavailable contextRelevance warning."
  );
}

console.log(
  JSON.stringify(
    {
      test:
        "Management Observation Context Relevance",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      valid:
        validObservation.contextRelevance,

      maximum:
        maximumObservation.contextRelevance,

      minimum:
        minimumObservation.contextRelevance,

      unavailable: {
        value:
          unavailableObservation.contextRelevance,
        warnings:
          unavailableValidation.warnings,
      },
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error("FAIL");
  console.error(
    JSON.stringify(failures, null, 2)
  );
  process.exit(1);
}

console.log("PASS");
console.log(
  "test_build_management_observation PASS"
);
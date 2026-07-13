const {
  buildMeasurementDefinition,
} = require("../src/core/measurement/buildMeasurementDefinition");

const {
  buildMeasurementProfile,
} = require("../src/core/measurement/buildMeasurementProfile");

const {
  buildManagementObservation,
} = require("../src/core/measurement/buildManagementObservation");

const {
  buildMeasureResult,
} = require("../src/core/measurement/buildMeasureResult");

const {
  validateMeasureResult,
} = require("../src/core/measurement/validateMeasureResult");

const failures = [];

const definition =
  buildMeasurementDefinition(
    "management_scope"
  );

const definitionBefore =
  JSON.stringify(definition);

const strongObservation =
  buildManagementObservation({
    observationId:
      "management_strong",
    teamSize: 100,
    durationYears: 10,
    responsibilityType: "direct",
    managementLayer: "multi_layer",
    contextType: "business_unit",
    evidenceIds: ["ev_strong"],
    confidence: 0.95,
  });

const intermediateObservation =
  buildManagementObservation({
    observationId:
      "management_intermediate",
    teamSize: 20,
    durationYears: 4,
    responsibilityType: "direct",
    managementLayer: "single_layer",
    contextType: "technical_office",
    evidenceIds: ["ev_intermediate"],
    confidence: 0.85,
  });

const weakObservation =
  buildManagementObservation({
    observationId:
      "management_weak",
    teamSize: 5,
    durationYears: 1,
    responsibilityType: "shared",
    managementLayer: "single_layer",
    contextType: "small_team",
    evidenceIds: ["ev_weak"],
    confidence: 0.7,
  });

const strongResult =
  buildMeasureResult({
    definition,
    observations: [strongObservation],
  });

const intermediateResult =
  buildMeasureResult({
    definition,
    observations: [
      intermediateObservation,
    ],
  });

const multipleResult =
  buildMeasureResult({
    definition,
    observations: [
      intermediateObservation,
      weakObservation,
    ],
  });

const unknownResult =
  buildMeasureResult({
    definition,
    observations: [],
  });

[
  strongResult,
  intermediateResult,
  multipleResult,
  unknownResult,
].forEach((measureResult, index) => {
  const validation =
    validateMeasureResult(
      measureResult
    );

  if (!validation.isValid) {
    failures.push(
      `Legacy result ${index} invalid: ${validation.errors.join(
        "; "
      )}`
    );
  }
});

if (strongResult.value !== 1) {
  failures.push(
    "Expected strong value === 1."
  );
}

if (
  intermediateResult.value <= 0 ||
  intermediateResult.value >= 1
) {
  failures.push(
    "Expected intermediate value between 0 and 1."
  );
}

if (
  multipleResult
    .observationResults.length !== 2
) {
  failures.push(
    "Expected two observation results."
  );
}

if (
  unknownResult.value !== 0 ||
  unknownResult.observationStatus !==
    "unknown"
) {
  failures.push(
    "Expected unknown result."
  );
}

/*
 * Context relevance operativo
 */
const contextProfile =
  buildMeasurementProfile({
    profileId:
      "regression_context_profile",

    label:
      "Regression Context Profile",

    baseModelId:
      "management_scope_v1",

    addedFactors: [
      {
        factorId:
          "contextRelevance",
        weight: 0.2,
        minimum: 0.5,
        configuration: {},
      },
    ],

    rationale:
      "Regression context relevance.",

    source: {
      type: "regression_test",
      id: "context_regression",
    },
  });

const contextObservation =
  buildManagementObservation({
    observationId:
      "management_context",
    teamSize: 20,
    durationYears: 4,
    responsibilityType: "direct",
    managementLayer: "single_layer",
    contextType: "technical_office",
    contextRelevance: 0.9,
    evidenceIds: ["ev_context"],
    confidence: 0.85,
  });

const contextResult =
  buildMeasureResult({
    definition,
    observations: [contextObservation],
    profile: contextProfile,
  });

const contextValidation =
  validateMeasureResult(
    contextResult
  );

if (!contextValidation.isValid) {
  failures.push(
    `Context result invalid: ${contextValidation.errors.join(
      "; "
    )}`
  );
}

if (
  !contextResult.measurementContext
    .activeFactors.includes(
      "contextRelevance"
    )
) {
  failures.push(
    "Expected contextRelevance active."
  );
}

if (
  !contextResult.observationResults[0]
    .components.contextRelevance
) {
  failures.push(
    "Expected context component."
  );
}

/*
 * Context mancante non penalizza
 */
const missingContextObservation =
  buildManagementObservation({
    observationId:
      "management_missing_context",
    teamSize: 20,
    durationYears: 4,
    responsibilityType: "direct",
    managementLayer: "single_layer",
    contextType: "technical_office",
    contextRelevance: null,
    evidenceIds: [
      "ev_missing_context",
    ],
    confidence: 0.85,
  });

const missingBaseResult =
  buildMeasureResult({
    definition,
    observations: [
      missingContextObservation,
    ],
  });

const missingProfileResult =
  buildMeasureResult({
    definition,
    observations: [
      missingContextObservation,
    ],
    profile: contextProfile,
  });

if (
  missingBaseResult.value !==
  missingProfileResult.value
) {
  failures.push(
    "Expected missing context not to penalize score."
  );
}

if (
  !missingProfileResult
    .observationResults[0]
    .factorUsage.unavailableFactors
    .includes("contextRelevance")
) {
  failures.push(
    "Expected contextRelevance unavailable."
  );
}

const definitionAfter =
  JSON.stringify(definition);

if (
  definitionBefore !== definitionAfter
) {
  failures.push(
    "Expected definition immutability."
  );
}

console.log(
  JSON.stringify(
    {
      test:
        "Measurement Core Regression",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      strongValue:
        strongResult.value,

      intermediateValue:
        intermediateResult.value,

      multipleValue:
        multipleResult.value,

      unknownStatus:
        unknownResult.observationStatus,

      contextValue:
        contextResult.value,

      contextComponent:
        contextResult.observationResults[0]
          .components.contextRelevance,

      missingContext: {
        baseValue:
          missingBaseResult.value,
        profileValue:
          missingProfileResult.value,
        unavailableFactors:
          missingProfileResult
            .observationResults[0]
            .factorUsage
            .unavailableFactors,
      },

      definitionUnchanged:
        definitionBefore === definitionAfter,
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
  "test_measurement_core_regression PASS"
);
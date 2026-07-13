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

function sumComponentWeights(components) {
  return Object.values(components).reduce(
    (sum, component) =>
      sum + component.weight,
    0
  );
}

const definition =
  buildMeasurementDefinition(
    "management_scope"
  );

const baseObservation =
  buildManagementObservation({
    observationId:
      "management_context_test",
    teamSize: 20,
    durationYears: 4,
    responsibilityType: "direct",
    managementLayer: "single_layer",
    contextType: "technical_office",
    contextRelevance: 0.9,
    evidenceIds: ["ev_context_001"],
    confidence: 0.85,
  });

const baseResult =
  buildMeasureResult({
    definition,
    observations: [baseObservation],
  });

const baseValidation =
  validateMeasureResult(baseResult);

if (!baseValidation.isValid) {
  failures.push(
    `Base result invalid: ${baseValidation.errors.join(
      "; "
    )}`
  );
}

/*
 * Scenario E — contextRelevance attivo
 */
const contextProfile =
  buildMeasurementProfile({
    profileId:
      "context_relevance_active",

    label:
      "Context Relevance Active",

    baseModelId:
      "management_scope_v1",

    addedFactors: [
      {
        factorId: "contextRelevance",
        weight: 0.2,
        minimum: 0.5,
        configuration: {},
      },
    ],

    rationale:
      "Activates context relevance.",

    source: {
      type: "test_configuration",
      id: "context_active",
    },
  });

const contextResult =
  buildMeasureResult({
    definition,
    observations: [baseObservation],
    profile: contextProfile,
  });

const contextValidation =
  validateMeasureResult(contextResult);

if (!contextValidation.isValid) {
  failures.push(
    `Context result invalid: ${contextValidation.errors.join(
      "; "
    )}`
  );
}

if (
  contextResult.measurementContext
    .profileApplied !== true
) {
  failures.push(
    "Expected profileApplied true."
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
  !contextResult.measurementContext
    .addedFactors.includes(
      "contextRelevance"
    )
) {
  failures.push(
    "Expected contextRelevance in addedFactors."
  );
}

const contextComponent =
  contextResult.observationResults[0]
    .components.contextRelevance;

if (!contextComponent) {
  failures.push(
    "Expected contextRelevance component."
  );
} else if (
  contextComponent.normalizedValue !== 0.9
) {
  failures.push(
    "Expected normalizedValue === 0.9."
  );
}

if (
  contextResult.value === baseResult.value
) {
  failures.push(
    "Expected context profile value to differ from base."
  );
}

if (
  Math.abs(
    sumComponentWeights(
      contextResult.observationResults[0]
        .components
    ) - 1
  ) > 0.0001
) {
  failures.push(
    "Expected observation component weights sum approximately 1."
  );
}

/*
 * Scenario F — fattore attivo ma mancante
 */
const missingContextObservation =
  buildManagementObservation({
    observationId:
      "management_context_missing",
    teamSize: 20,
    durationYears: 4,
    responsibilityType: "direct",
    managementLayer: "single_layer",
    contextType: "technical_office",
    contextRelevance: null,
    evidenceIds: ["ev_context_missing"],
    confidence: 0.85,
  });

const missingContextBaseResult =
  buildMeasureResult({
    definition,
    observations: [
      missingContextObservation,
    ],
  });

const missingContextResult =
  buildMeasureResult({
    definition,
    observations: [
      missingContextObservation,
    ],
    profile: contextProfile,
  });

const missingValidation =
  validateMeasureResult(
    missingContextResult
  );

if (!missingValidation.isValid) {
  failures.push(
    `Missing-context result invalid: ${missingValidation.errors.join(
      "; "
    )}`
  );
}

const missingObservationResult =
  missingContextResult
    .observationResults[0];

if (
  !missingObservationResult.factorUsage
    .unavailableFactors.includes(
      "contextRelevance"
    )
) {
  failures.push(
    "Expected contextRelevance unavailable."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    missingObservationResult.components,
    "contextRelevance"
  )
) {
  failures.push(
    "Expected unavailable contextRelevance not to produce a component."
  );
}

if (
  Math.abs(
    sumComponentWeights(
      missingObservationResult.components
    ) - 1
  ) > 0.0001
) {
  failures.push(
    "Expected available component weights renormalized to 1."
  );
}

if (
  missingContextResult.value !==
  missingContextBaseResult.value
) {
  failures.push(
    "Expected missing contextRelevance not to penalize the observation."
  );
}

/*
 * Scenario G — aggiunto ma disattivato
 */
const disabledContextProfile =
  buildMeasurementProfile({
    profileId:
      "context_relevance_disabled",

    label:
      "Context Relevance Disabled",

    baseModelId:
      "management_scope_v1",

    addedFactors: [
      {
        factorId: "contextRelevance",
        weight: 0.2,
        minimum: 0.5,
        configuration: {},
      },
    ],

    disabledFactors: [
      "contextRelevance",
    ],

    rationale:
      "Adds and disables context relevance.",

    source: {
      type: "test_configuration",
      id: "context_disabled",
    },
  });

const disabledResult =
  buildMeasureResult({
    definition,
    observations: [baseObservation],
    profile: disabledContextProfile,
  });

if (
  disabledResult.measurementContext
    .activeFactors.includes(
      "contextRelevance"
    )
) {
  failures.push(
    "Expected contextRelevance not active."
  );
}

if (
  !disabledResult.measurementContext
    .disabledFactors.includes(
      "contextRelevance"
    )
) {
  failures.push(
    "Expected contextRelevance disabled."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    disabledResult.observationResults[0]
      .components,
    "contextRelevance"
  )
) {
  failures.push(
    "Expected disabled contextRelevance not to contribute."
  );
}

/*
 * Scenario I — regressione legacy
 */
const strongResult =
  buildMeasureResult({
    definition,
    observations: [
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
      }),
    ],
  });

if (strongResult.value !== 1) {
  failures.push(
    "Expected legacy strong value === 1."
  );
}

const unknownResult =
  buildMeasureResult({
    definition,
    observations: [],
  });

if (
  unknownResult.value !== 0 ||
  unknownResult.observationStatus !==
    "unknown"
) {
  failures.push(
    "Expected legacy unknown result."
  );
}

console.log(
  JSON.stringify(
    {
      test:
        "Context Relevance Factor Execution",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      baseValue:
        baseResult.value,

      contextValue:
        contextResult.value,

      contextComponent,

      missingContext: {
        baseValue:
          missingContextBaseResult.value,
        profileValue:
          missingContextResult.value,
        unavailableFactors:
          missingObservationResult.factorUsage
            .unavailableFactors,
        components:
          missingObservationResult.components,
      },

      disabledContext: {
        activeFactors:
          disabledResult.measurementContext
            .activeFactors,
        disabledFactors:
          disabledResult.measurementContext
            .disabledFactors,
      },

      legacyStrongValue:
        strongResult.value,

      legacyUnknownStatus:
        unknownResult.observationStatus,
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
  "test_build_measure_result PASS"
);
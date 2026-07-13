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
  buildMeasurementDefinition(
    "management_scope"
  );

const definitionBefore =
  JSON.stringify(definition);

/*
 * Context relevance attivo
 */
const profile =
  buildMeasurementProfile({
    profileId:
      "context_relevance_profile",

    label:
      "Context Relevance Profile",

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
      id: "context_relevance_profile",
    },
  });

const validation =
  validateMeasurementProfile(profile);

if (!validation.isValid) {
  failures.push(
    `Profile failed validation: ${validation.errors.join(
      "; "
    )}`
  );
}

const applied =
  applyMeasurementProfile({
    definition,
    profile,
  });

const aggregation =
  applied.effectiveDefinition.aggregation;

if (
  !Object.prototype.hasOwnProperty.call(
    aggregation.weights,
    "contextRelevance"
  )
) {
  failures.push(
    "Expected contextRelevance in effective weights."
  );
}

if (
  !Object.prototype.hasOwnProperty.call(
    aggregation.activeWeights,
    "contextRelevance"
  )
) {
  failures.push(
    "Expected contextRelevance in activeWeights."
  );
}

if (
  aggregation.pendingAddedFactors.length !== 0
) {
  failures.push(
    "Expected no pending valid added factors."
  );
}

if (
  Math.abs(
    sumWeights(
      aggregation.activeWeights
    ) - 1
  ) > 0.0001
) {
  failures.push(
    "Expected activeWeights sum approximately 1."
  );
}

/*
 * Context relevance aggiunto e poi disattivato
 */
const disabledProfile =
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
      "Adds and then disables context relevance.",

    source: {
      type: "test_configuration",
      id: "context_relevance_disabled",
    },
  });

const disabledApplied =
  applyMeasurementProfile({
    definition,
    profile: disabledProfile,
  });

if (
  !disabledApplied.disabledFactors.includes(
    "contextRelevance"
  )
) {
  failures.push(
    "Expected contextRelevance disabled."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    disabledApplied.effectiveDefinition
      .aggregation.activeWeights,
    "contextRelevance"
  )
) {
  failures.push(
    "Expected contextRelevance excluded from activeWeights."
  );
}

/*
 * Immutabilità
 */
const definitionAfter =
  JSON.stringify(definition);

if (
  definitionBefore !== definitionAfter
) {
  failures.push(
    "Expected definition unchanged."
  );
}

console.log(
  JSON.stringify(
    {
      test:
        "Measurement Profile Context Relevance",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      activeWeights:
        aggregation.activeWeights,

      appliedAddedFactors:
        applied.appliedOverrides
          .addedFactors,

      disabledContextRelevance: {
        activeWeights:
          disabledApplied.effectiveDefinition
            .aggregation.activeWeights,
        disabledFactors:
          disabledApplied.disabledFactors,
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
  "test_build_measurement_profile PASS"
);
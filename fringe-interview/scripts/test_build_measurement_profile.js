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

const definitionBefore = JSON.stringify(definition);

/*
 * Scenario A — Profilo standard valido
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

const validValidation =
  validateMeasurementProfile(validProfile);

if (!validValidation.isValid) {
  failures.push(
    `Valid profile failed: ${validValidation.errors.join(
      "; "
    )}`
  );
}

const validApplication =
  applyMeasurementProfile({
    definition,
    profile: validProfile,
  });

if (
  validApplication.effectiveDefinition.aggregation
    .weights.teamSize !== 0.45
) {
  failures.push(
    "Expected teamSize weight override."
  );
}

/*
 * Scenario B — Disabled factor
 */
const disabledProfile = buildMeasurementProfile({
  profileId: "disable_management_layer",

  label: "Disable Management Layer",

  baseModelId: "management_scope_v1",

  disabledFactors: ["managementLayer"],

  rationale: "Tests disabled factor.",

  source: {
    type: "test_configuration",
    id: "disabled_factor_test",
  },
});

const disabledApplication =
  applyMeasurementProfile({
    definition,
    profile: disabledProfile,
  });

if (
  Object.prototype.hasOwnProperty.call(
    disabledApplication.effectiveDefinition
      .aggregation.activeWeights,
    "managementLayer"
  )
) {
  failures.push(
    "Expected managementLayer not to be active."
  );
}

if (
  Math.abs(
    sumWeights(
      disabledApplication.effectiveDefinition
        .aggregation.activeWeights
    ) - 1
  ) > 0.0001
) {
  failures.push(
    "Expected active weight sum approximately 1."
  );
}

/*
 * Scenario E — Aggiunta valida
 */
const validAddedFactorProfile =
  buildMeasurementProfile({
    profileId: "profile_context_relevance",

    label: "Context Relevance Profile",

    baseModelId: "management_scope_v1",

    addedFactors: [
      {
        factorId: "contextRelevance",
        weight: 0.2,
        minimum: 0.5,
        configuration: {},
      },
    ],

    rationale:
      "Adds context relevance for future measurement.",

    source: {
      type: "test_configuration",
      id: "context_relevance_test",
    },
  });

const validAddedFactorValidation =
  validateMeasurementProfile(
    validAddedFactorProfile
  );

if (!validAddedFactorValidation.isValid) {
  failures.push(
    `Valid added-factor profile failed: ${validAddedFactorValidation.errors.join(
      "; "
    )}`
  );
}

const validAddedFactorApplication =
  applyMeasurementProfile({
    definition,
    profile: validAddedFactorProfile,
  });

const pendingAddedFactors =
  validAddedFactorApplication.effectiveDefinition
    .aggregation.pendingAddedFactors;

if (pendingAddedFactors.length !== 1) {
  failures.push(
    "Expected one pending added factor."
  );
}

if (
  pendingAddedFactors[0].factorId !==
  "contextRelevance"
) {
  failures.push(
    "Expected pending contextRelevance factor."
  );
}

if (
  !validAddedFactorApplication.appliedOverrides
    .addedFactors.some(
      (factor) =>
        factor.factorId === "contextRelevance"
    )
) {
  failures.push(
    "Expected contextRelevance in appliedOverrides.addedFactors."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    validAddedFactorApplication
      .effectiveDefinition.aggregation.weights,
    "contextRelevance"
  )
) {
  failures.push(
    "Expected contextRelevance not to enter weights yet."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    validAddedFactorApplication
      .effectiveDefinition.aggregation.activeWeights,
    "contextRelevance"
  )
) {
  failures.push(
    "Expected contextRelevance not to enter activeWeights yet."
  );
}

/*
 * Scenario F — Fattore sconosciuto
 */
const unknownAddedFactorProfile =
  buildMeasurementProfile({
    profileId: "profile_invented_factor",

    label: "Invented Factor Profile",

    baseModelId: "management_scope_v1",

    addedFactors: [
      {
        factorId: "inventedFactor",
        weight: 0.2,
        minimum: 0.5,
        configuration: {},
      },
    ],

    rationale: "Tests unknown factor.",

    source: {
      type: "test_configuration",
      id: "invented_factor_test",
    },
  });

const unknownAddedValidation =
  validateMeasurementProfile(
    unknownAddedFactorProfile
  );

if (
  !unknownAddedValidation.warnings.some(
    (warning) =>
      warning.includes(
        "not present in the catalog"
      )
  )
) {
  failures.push(
    "Expected profile warning for unknown factor."
  );
}

const unknownAddedApplication =
  applyMeasurementProfile({
    definition,
    profile: unknownAddedFactorProfile,
  });

if (
  !unknownAddedApplication.warnings.includes(
    "Unsupported added factor: inventedFactor"
  )
) {
  failures.push(
    "Expected unsupported added-factor warning."
  );
}

if (
  unknownAddedApplication.effectiveDefinition
    .aggregation.pendingAddedFactors.length !== 0
) {
  failures.push(
    "Expected inventedFactor not to be pending."
  );
}

/*
 * Scenario G — Fattore già esistente
 */
const existingFactorProfile =
  buildMeasurementProfile({
    profileId: "profile_existing_factor",

    label: "Existing Factor Profile",

    baseModelId: "management_scope_v1",

    addedFactors: [
      {
        factorId: "teamSize",
        weight: 0.2,
        minimum: 0.5,
        configuration: {},
      },
    ],

    rationale:
      "Tests already existing factor.",

    source: {
      type: "test_configuration",
      id: "existing_factor_test",
    },
  });

const existingValidation =
  validateMeasurementProfile(
    existingFactorProfile
  );

if (
  !existingValidation.warnings.some(
    (warning) =>
      warning.includes(
        "already exists in the base definition"
      )
  )
) {
  failures.push(
    "Expected profile warning for existing factor."
  );
}

const existingApplication =
  applyMeasurementProfile({
    definition,
    profile: existingFactorProfile,
  });

if (
  !existingApplication.warnings.includes(
    "Added factor already exists in base definition: teamSize"
  )
) {
  failures.push(
    "Expected apply warning for existing factor."
  );
}

if (
  existingApplication.effectiveDefinition
    .aggregation.pendingAddedFactors.length !== 0
) {
  failures.push(
    "Expected teamSize not to be added."
  );
}

/*
 * Scenario duplicati: mantenere il primo
 */
const duplicateAddedProfile =
  buildMeasurementProfile({
    profileId: "profile_duplicate_factor",
    baseModelId: "management_scope_v1",

    addedFactors: [
      {
        factorId: "contextRelevance",
        weight: 0.2,
        minimum: 0.5,
        configuration: {
          source: "first",
        },
      },
      {
        factorId: "contextRelevance",
        weight: 0.8,
        minimum: 0.9,
        configuration: {
          source: "second",
        },
      },
    ],
  });

if (duplicateAddedProfile.addedFactors.length !== 1) {
  failures.push(
    "Expected duplicate factorId to be removed."
  );
}

if (
  duplicateAddedProfile.addedFactors[0].weight !==
  0.2
) {
  failures.push(
    "Expected first duplicate factor to be retained."
  );
}

/*
 * Scenario H — Immutabilità
 */
const definitionAfter = JSON.stringify(definition);

if (definitionBefore !== definitionAfter) {
  failures.push(
    "Expected definition to remain unchanged."
  );
}

console.log(
  JSON.stringify(
    {
      test: "Measurement Profile With Factor Catalog",

      status:
        failures.length === 0 ? "PASS" : "FAIL",

      validProfile: {
        isValid: validValidation.isValid,
      },

      validAddedFactor: {
        isValid:
          validAddedFactorValidation.isValid,
        pendingAddedFactors,
        weights:
          validAddedFactorApplication
            .effectiveDefinition.aggregation.weights,
        activeWeights:
          validAddedFactorApplication
            .effectiveDefinition.aggregation
            .activeWeights,
      },

      unknownAddedFactor: {
        profileWarnings:
          unknownAddedValidation.warnings,
        applyWarnings:
          unknownAddedApplication.warnings,
      },

      existingFactor: {
        profileWarnings:
          existingValidation.warnings,
        applyWarnings:
          existingApplication.warnings,
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
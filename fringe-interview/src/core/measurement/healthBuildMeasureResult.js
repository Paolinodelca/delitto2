const {
  buildMeasurementDefinition,
} = require("./buildMeasurementDefinition");

const {
  validateMeasurementDefinition,
} = require("./validateMeasurementDefinition");

const {
  buildMeasurementProfile,
} = require("./buildMeasurementProfile");

const {
  buildManagementObservation,
} = require("./buildManagementObservation");

const {
  buildMeasureResult,
} = require("./buildMeasureResult");

const {
  validateMeasureResult,
} = require("./validateMeasureResult");

function healthBuildMeasureResult() {
  const definition =
    buildMeasurementDefinition(
      "management_scope"
    );

  const definitionBefore =
    JSON.stringify(definition);

  const observation =
    buildManagementObservation({
      observationId:
        "management_health_001",
      teamSize: 20,
      durationYears: 4,
      responsibilityType: "direct",
      managementLayer: "single_layer",
      contextType: "technical_office",
      contextRelevance: 0.8,
      evidenceIds: ["ev_health_001"],
      confidence: 0.9,
    });

  const baseResult =
    buildMeasureResult({
      definition,
      observations: [observation],
    });

  const baseValidation =
    validateMeasureResult(baseResult);

  const contextProfile =
    buildMeasurementProfile({
      profileId:
        "management_context_health",

      label:
        "Management Context Health",

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
        "Health check for context relevance.",

      source: {
        type: "health_check",
        id: "context_health",
      },
    });

  const contextResult =
    buildMeasureResult({
      definition,
      observations: [observation],
      profile: contextProfile,
    });

  const contextValidation =
    validateMeasureResult(contextResult);

  const contextObservationResult =
    contextResult.observationResults[0];

  const contextComponent =
    contextObservationResult &&
    contextObservationResult.components
      ? contextObservationResult
          .components.contextRelevance ||
        null
      : null;

  const definitionAfter =
    JSON.stringify(definition);

  const baseDefinitionUnchanged =
    definitionBefore === definitionAfter;

  const contextChecksPass =
    contextResult.measurementContext
      .profileApplied === true &&
    contextResult.measurementContext
      .activeFactors.includes(
        "contextRelevance"
      ) &&
    Boolean(contextComponent) &&
    contextComponent.normalizedValue ===
      0.8;

  const definitionValidation =
    validateMeasurementDefinition(
      definition
    );

  const status =
    definitionValidation.isValid === true &&
    baseValidation.isValid === true &&
    contextValidation.isValid === true &&
    contextChecksPass &&
    baseDefinitionUnchanged
      ? "PASS"
      : "FAIL";

  return {
    module: "Measurement Core",

    status,

    dimensionId:
      baseResult.dimensionId,

    measureValue:
      baseResult.value,

    observationStatus:
      baseResult.observationStatus,

    confidence:
      baseResult.confidence,

    benchmarkId:
      baseResult.benchmarkId,

    contextRelevanceProfile: {
      profileId:
        contextResult.measurementContext
          .profileId,

      measureValue:
        contextResult.value,

      contextRelevanceComponent:
        contextComponent,

      activeFactors:
        contextResult.measurementContext
          .activeFactors,

      unavailableFactors:
        contextObservationResult
          ? contextObservationResult
              .factorUsage
              .unavailableFactors
          : [],
    },

    baseDefinitionUnchanged,

    validation: {
      definition:
        definitionValidation,

      baseResult:
        baseValidation,

      contextRelevanceResult:
        contextValidation,
    },

    metadata: {
      version: "1.3",
      createdAt:
        new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildMeasureResult,
};
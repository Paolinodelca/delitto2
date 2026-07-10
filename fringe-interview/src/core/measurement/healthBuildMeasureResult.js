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
  buildMeasureResult,
} = require("./buildMeasureResult");
const {
  validateMeasureResult,
} = require("./validateMeasureResult");

function healthBuildMeasureResult() {
  const definition = buildMeasurementDefinition(
    "management_scope"
  );

  const definitionBefore = JSON.stringify(definition);

  const observations = [
    {
      observationId: "management_health_001",
      teamSize: 20,
      durationYears: 4,
      responsibilityType: "direct",
      managementLayer: "single_layer",
      contextType: "technical_office",
      evidenceIds: ["ev_health_001"],
      confidence: 0.9,
    },
  ];

  const standardProfile = buildMeasurementProfile({
    profileId: "management_health_profile",
    label: "Management Health Profile",
    baseModelId: "management_scope_v1",

    overrides: {
      weights: {
        teamSize: 0.5,
        durationYears: 0.2,
        responsibilityType: 0.2,
        managementLayer: 0.1,
      },
    },

    rationale: "Health-check profile.",

    source: {
      type: "health_check",
      id: "measurement_health",
    },
  });

  const disabledFactorProfile = buildMeasurementProfile({
    profileId: "management_disabled_factor_health",
    label: "Management Disabled Factor Health",
    baseModelId: "management_scope_v1",

    disabledFactors: ["managementLayer"],

    rationale: "Checks deterministic factor disabling.",

    source: {
      type: "health_check",
      id: "measurement_disabled_factor_health",
    },
  });

  const definitionValidation =
    validateMeasurementDefinition(definition);

  const baseMeasureResult = buildMeasureResult({
    definition,
    observations,
  });

  const baseResultValidation =
    validateMeasureResult(baseMeasureResult);

  const profileMeasureResult = buildMeasureResult({
    definition,
    observations,
    profile: standardProfile,
  });

  const profileResultValidation =
    validateMeasureResult(profileMeasureResult);

  const disabledFactorMeasureResult = buildMeasureResult({
    definition,
    observations,
    profile: disabledFactorProfile,
  });

  const disabledFactorValidation =
    validateMeasureResult(disabledFactorMeasureResult);

  const definitionAfter = JSON.stringify(definition);

  const baseDefinitionUnchanged =
    definitionBefore === definitionAfter;

  const disabledContext =
    disabledFactorMeasureResult.measurementContext;

  const disabledFactorChecksPass =
    disabledContext.profileApplied === true &&
    disabledContext.disabledFactors.includes(
      "managementLayer"
    ) &&
    !disabledContext.activeFactors.includes(
      "managementLayer"
    ) &&
    disabledContext.activeFactors.length === 3;

  const status =
    definitionValidation.isValid === true &&
    baseResultValidation.isValid === true &&
    profileResultValidation.isValid === true &&
    disabledFactorValidation.isValid === true &&
    profileMeasureResult.measurementContext.profileApplied === true &&
    disabledFactorChecksPass &&
    baseDefinitionUnchanged
      ? "PASS"
      : "FAIL";

  return {
    module: "Measurement Core",

    status,

    dimensionId: baseMeasureResult.dimensionId,

    measureValue: baseMeasureResult.value,

    observationStatus: baseMeasureResult.observationStatus,

    confidence: baseMeasureResult.confidence,

    benchmarkId: baseMeasureResult.benchmarkId,

    profileApplied:
      profileMeasureResult.measurementContext.profileApplied,

    profileId:
      profileMeasureResult.measurementContext.profileId,

    profileMeasureValue: profileMeasureResult.value,

    disabledFactorProfile: {
      profileId:
        disabledFactorMeasureResult.measurementContext.profileId,

      measureValue: disabledFactorMeasureResult.value,

      activeFactors:
        disabledFactorMeasureResult.measurementContext.activeFactors,

      disabledFactors:
        disabledFactorMeasureResult.measurementContext.disabledFactors,
    },

    baseDefinitionUnchanged,

    validation: {
      definition: definitionValidation,
      baseResult: baseResultValidation,
      profileResult: profileResultValidation,
      disabledFactorResult: disabledFactorValidation,
    },

    metadata: {
      version: "1.2",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildMeasureResult,
};
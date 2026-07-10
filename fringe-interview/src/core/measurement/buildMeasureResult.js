const {
  validateMeasurementProfile,
} = require("./validateMeasurementProfile");
const {
  applyMeasurementProfile,
} = require("./applyMeasurementProfile");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

function normalizeNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function getResponsibilityTypeScore(responsibilityType) {
  if (responsibilityType === "direct") {
    return 1;
  }

  if (responsibilityType === "shared") {
    return 0.7;
  }

  if (responsibilityType === "indirect") {
    return 0.4;
  }

  return 0;
}

function getManagementLayerScore(managementLayer) {
  if (managementLayer === "multi_layer") {
    return 1;
  }

  if (managementLayer === "single_layer") {
    return 0.6;
  }

  return 0;
}

function isValidObservation(observation) {
  return (
    isObject(observation) &&
    typeof observation.observationId === "string" &&
    observation.observationId.trim().length > 0
  );
}

function buildObservationResult({
  observation,
  benchmarkReference,
  weights,
  activeFactors,
  disabledFactors,
}) {
  const teamSize = normalizeNonNegativeNumber(observation.teamSize);

  const durationYears = normalizeNonNegativeNumber(
    observation.durationYears
  );

  const benchmarkTeamSize =
    normalizeNonNegativeNumber(benchmarkReference.teamSize) || 1;

  const benchmarkDurationYears =
    normalizeNonNegativeNumber(benchmarkReference.durationYears) || 1;

  const teamSizeScore = Math.min(teamSize / benchmarkTeamSize, 1);

  const durationScore = Math.min(
    durationYears / benchmarkDurationYears,
    1
  );

  const responsibilityTypeScore = getResponsibilityTypeScore(
    observation.responsibilityType
  );

  const managementLayerScore = getManagementLayerScore(
    observation.managementLayer
  );

  const componentScores = {
    teamSize: teamSizeScore,
    durationYears: durationScore,
    responsibilityType: responsibilityTypeScore,
    managementLayer: managementLayerScore,
  };

  const score = activeFactors.reduce((sum, factorId) => {
    const factorWeight =
      typeof weights[factorId] === "number" &&
      Number.isFinite(weights[factorId])
        ? weights[factorId]
        : 0;

    const componentScore =
      typeof componentScores[factorId] === "number"
        ? componentScores[factorId]
        : 0;

    return sum + componentScore * factorWeight;
  }, 0);

  const confidence =
    typeof observation.confidence === "number" &&
    Number.isFinite(observation.confidence)
      ? clamp(observation.confidence, 0, 1)
      : 0;

  return {
    observationId: observation.observationId,

    score: roundToTwoDecimals(clamp(score, 0, 1)),

    components: {
      teamSizeScore,
      durationScore,
      responsibilityTypeScore,
      managementLayerScore,
    },

    factorUsage: {
      activeFactors: [...activeFactors],
      disabledFactors: [...disabledFactors],
    },

    evidenceIds: asArray(observation.evidenceIds),

    confidence,
  };
}

function buildMeasureResult({
  definition = {},
  observations = [],
  profile = null,
} = {}) {
  const baseDefinition = isObject(definition) ? definition : {};

  let effectiveDefinition = baseDefinition;
  let appliedProfile = null;
  let profileApplied = false;

  const limitations = [];

  if (profile !== null && profile !== undefined) {
    const profileValidation = validateMeasurementProfile(profile);

    if (profileValidation.isValid === true) {
      appliedProfile = applyMeasurementProfile({
        definition: baseDefinition,
        profile,
      });

      effectiveDefinition = appliedProfile.effectiveDefinition;
      profileApplied = true;

      if (
        Array.isArray(profile.addedFactors) &&
        profile.addedFactors.length > 0
      ) {
        limitations.push(
          "Added factors are not yet applied by buildMeasureResult."
        );
      }
    } else {
      limitations.push(
        "Measurement profile was invalid and was not applied."
      );
    }
  }

  const benchmark = isObject(effectiveDefinition.benchmark)
    ? effectiveDefinition.benchmark
    : {};

  const benchmarkReference = isObject(benchmark.reference)
    ? benchmark.reference
    : {};

  const aggregation = isObject(effectiveDefinition.aggregation)
    ? effectiveDefinition.aggregation
    : {};

  const baseWeights = isObject(aggregation.weights)
    ? aggregation.weights
    : {};

  const hasActiveWeightsProperty = Object.prototype.hasOwnProperty.call(
    aggregation,
    "activeWeights"
  );

  const operationalWeights =
    hasActiveWeightsProperty && isObject(aggregation.activeWeights)
      ? aggregation.activeWeights
      : baseWeights;

  const activeFactors = Object.keys(operationalWeights);

  const disabledFactors =
    profileApplied &&
    appliedProfile &&
    Array.isArray(appliedProfile.disabledFactors)
      ? [...appliedProfile.disabledFactors]
      : [];

  const noActiveFactors = activeFactors.length === 0;

  if (noActiveFactors) {
    limitations.push(
      "No active measurement factors were available."
    );
  }

  const validObservations = asArray(observations).filter(
    isValidObservation
  );

  const observationResults = validObservations
    .map((observation) =>
      buildObservationResult({
        observation,
        benchmarkReference,
        weights: operationalWeights,
        activeFactors,
        disabledFactors,
      })
    )
    .sort((first, second) => second.score - first.score);

  let value = 0;

  if (!noActiveFactors && observationResults.length > 0) {
    const bestScore = observationResults[0].score;

    const additionalContribution = Math.min(
      observationResults
        .slice(1)
        .reduce(
          (sum, observationResult) =>
            sum + observationResult.score * 0.15,
          0
        ),
      0.15
    );

    value = roundToTwoDecimals(
      clamp(bestScore + additionalContribution, 0, 1)
    );
  }

  const observationStatus =
    !noActiveFactors && observationResults.length > 0
      ? "observed"
      : "unknown";

  const confidence =
    observationStatus === "observed"
      ? roundToTwoDecimals(
          observationResults.reduce(
            (sum, observationResult) =>
              sum + observationResult.confidence,
            0
          ) / observationResults.length
        )
      : 0;

  const evidenceIds = Array.from(
    new Set(
      observationResults.flatMap(
        (observationResult) => observationResult.evidenceIds
      )
    )
  );

  return {
    measureStatus: "draft",

    dimensionId: baseDefinition.dimensionId || null,

    value,

    measurementContext: {
      baseDefinitionId: baseDefinition.dimensionId || null,

      profileApplied,

      profileId:
        profile && typeof profile.profileId === "string"
          ? profile.profileId
          : null,

      effectiveModelId:
        profileApplied && appliedProfile
          ? appliedProfile.effectiveModelId
          : null,

      activeFactors,

      disabledFactors,
    },

    observationStatus,

    confidence,

    benchmarkId:
      profileApplied && appliedProfile
        ? appliedProfile.effectiveModelId
        : benchmark.benchmarkId || null,

    observationResults,

    evidenceIds,

    limitations,

    metadata: {
      version: "1.2",
      createdAt: new Date().toISOString(),
    },

    extensions: {
      profileWarnings:
        profileApplied &&
        appliedProfile &&
        Array.isArray(appliedProfile.warnings)
          ? [...appliedProfile.warnings]
          : [],
    },
  };
}

module.exports = {
  buildMeasureResult,
};
const {
  validateMeasurementProfile,
} = require("./validateMeasurementProfile");

const {
  applyMeasurementProfile,
} = require("./applyMeasurementProfile");

const {
  getMeasurementFactorDefinition,
} = require("./getMeasurementFactorDefinition");

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

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function normalizeNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function isValidObservation(observation) {
  return (
    isObject(observation) &&
    typeof observation.observationId === "string" &&
    observation.observationId.trim().length > 0
  );
}

function buildComponentScore({
  factorDefinition,
  observation,
  benchmarkReference,
}) {
  if (!isObject(factorDefinition)) {
    return null;
  }

  const factorId = factorDefinition.factorId;
  const inputField = factorDefinition.inputField;
  const scoring = isObject(factorDefinition.scoring)
    ? factorDefinition.scoring
    : {};

  const parameters = isObject(scoring.parameters)
    ? scoring.parameters
    : {};

  if (
    typeof factorId !== "string" ||
    typeof inputField !== "string"
  ) {
    return null;
  }

  const observedValue = observation[inputField];

  let normalizedValue = null;

  switch (scoring.strategy) {
    case "ratio_to_benchmark": {
      const benchmarkField = parameters.benchmarkField;

      if (typeof benchmarkField !== "string") {
        return null;
      }

      const safeObservedValue =
        normalizeNonNegativeNumber(observedValue);

      const benchmarkValue =
        normalizeNonNegativeNumber(
          benchmarkReference[benchmarkField]
        ) || 1;

      normalizedValue = Math.min(
        safeObservedValue / benchmarkValue,
        1
      );

      break;
    }

    case "enum_map": {
      const values = isObject(parameters.values)
        ? parameters.values
        : {};

      normalizedValue =
        typeof values[observedValue] === "number"
          ? values[observedValue]
          : typeof values.unknown === "number"
            ? values.unknown
            : 0;

      break;
    }

    case "normalized_value": {
      if (
        typeof observedValue !== "number" ||
        !Number.isFinite(observedValue)
      ) {
        return null;
      }

      const minimum =
        typeof parameters.minimum === "number"
          ? parameters.minimum
          : 0;

      const maximum =
        typeof parameters.maximum === "number"
          ? parameters.maximum
          : 1;

      if (maximum <= minimum) {
        return null;
      }

      const boundedValue = clamp(
        observedValue,
        minimum,
        maximum
      );

      normalizedValue =
        (boundedValue - minimum) /
        (maximum - minimum);

      break;
    }

    default:
      return null;
  }

  return {
    factorId,
    observedValue,
    normalizedValue: clamp(normalizedValue, 0, 1),
  };
}

function buildObservationResult({
  observation,
  benchmarkReference,
  weights,
  activeFactors,
  disabledFactors,
}) {
  const rawComponents = {};
  const unavailableFactors = [];

  activeFactors.forEach((factorId) => {
    const factorDefinition =
      getMeasurementFactorDefinition(factorId);

    const componentScore = buildComponentScore({
      factorDefinition,
      observation,
      benchmarkReference,
    });

    if (!componentScore) {
      unavailableFactors.push(factorId);
      return;
    }

    rawComponents[factorId] = componentScore;
  });

  const availableFactorIds = Object.keys(rawComponents);

  const availableWeightTotal = availableFactorIds.reduce(
    (sum, factorId) => {
      const factorWeight =
        typeof weights[factorId] === "number" &&
        Number.isFinite(weights[factorId]) &&
        weights[factorId] >= 0
          ? weights[factorId]
          : 0;

      return sum + factorWeight;
    },
    0
  );

  const components = {};

  availableFactorIds.forEach((factorId, index) => {
    const component = rawComponents[factorId];

    const baseWeight =
      typeof weights[factorId] === "number" &&
      Number.isFinite(weights[factorId]) &&
      weights[factorId] >= 0
        ? weights[factorId]
        : 0;

    let effectiveWeight = 0;

    if (availableWeightTotal > 0) {
      const isLast =
        index === availableFactorIds.length - 1;

      if (!isLast) {
        effectiveWeight = roundToFourDecimals(
          baseWeight / availableWeightTotal
        );
      } else {
        const alreadyAssigned = Object.values(
          components
        ).reduce(
          (sum, existingComponent) =>
            sum + existingComponent.weight,
          0
        );

        effectiveWeight = roundToFourDecimals(
          1 - alreadyAssigned
        );
      }
    }

    components[factorId] = {
      factorId,
      observedValue: component.observedValue,
      normalizedValue: component.normalizedValue,
      weight: effectiveWeight,
      weightedScore: roundToFourDecimals(
        component.normalizedValue * effectiveWeight
      ),
    };
  });

  const score = Object.values(components).reduce(
    (sum, component) =>
      sum + component.weightedScore,
    0
  );

  const confidence =
    typeof observation.confidence === "number" &&
    Number.isFinite(observation.confidence)
      ? clamp(observation.confidence, 0, 1)
      : 0;

  return {
    observationId: observation.observationId,

    score: roundToTwoDecimals(clamp(score, 0, 1)),

    components,

    factorUsage: {
      activeFactors: [...activeFactors],
      disabledFactors: [...disabledFactors],
      unavailableFactors,
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
  const baseDefinition = isObject(definition)
    ? definition
    : {};

  let effectiveDefinition = baseDefinition;
  let appliedProfile = null;
  let profileApplied = false;

  const limitations = [];

  if (profile !== null && profile !== undefined) {
    const profileValidation =
      validateMeasurementProfile(profile);

    if (profileValidation.isValid === true) {
      appliedProfile = applyMeasurementProfile({
        definition: baseDefinition,
        profile,
      });

      effectiveDefinition =
        appliedProfile.effectiveDefinition;

      profileApplied = true;

      if (
        Array.isArray(
          appliedProfile.unappliedAddedFactors
        ) &&
        appliedProfile.unappliedAddedFactors.length > 0
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

  const benchmark = isObject(
    effectiveDefinition.benchmark
  )
    ? effectiveDefinition.benchmark
    : {};

  const benchmarkReference = isObject(
    benchmark.reference
  )
    ? benchmark.reference
    : {};

  const aggregation = isObject(
    effectiveDefinition.aggregation
  )
    ? effectiveDefinition.aggregation
    : {};

  const baseWeights = isObject(aggregation.weights)
    ? aggregation.weights
    : {};

  const hasActiveWeightsProperty =
    Object.prototype.hasOwnProperty.call(
      aggregation,
      "activeWeights"
    );

  const operationalWeights =
    hasActiveWeightsProperty &&
    isObject(aggregation.activeWeights)
      ? aggregation.activeWeights
      : baseWeights;

  const activeFactors = Object.keys(
    operationalWeights
  );

  const disabledFactors =
    profileApplied &&
    appliedProfile &&
    Array.isArray(appliedProfile.disabledFactors)
      ? [...appliedProfile.disabledFactors]
      : [];

  const addedFactors =
    profileApplied &&
    appliedProfile &&
    Array.isArray(appliedProfile.addedFactors)
      ? appliedProfile.addedFactors.map(
          (factor) => factor.factorId
        )
      : [];

  const noActiveFactors =
    activeFactors.length === 0;

  if (noActiveFactors) {
    limitations.push(
      "No active measurement factors were available."
    );
  }

  const validObservations = asArray(
    observations
  ).filter(isValidObservation);

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
    .sort(
      (first, second) =>
        second.score - first.score
    );

  let value = 0;

  if (
    !noActiveFactors &&
    observationResults.length > 0
  ) {
    const bestScore =
      observationResults[0].score;

    const additionalContribution = Math.min(
      observationResults
        .slice(1)
        .reduce(
          (sum, observationResult) =>
            sum +
            observationResult.score * 0.15,
          0
        ),
      0.15
    );

    value = roundToTwoDecimals(
      clamp(
        bestScore + additionalContribution,
        0,
        1
      )
    );
  }

  const observationStatus =
    !noActiveFactors &&
    observationResults.length > 0
      ? "observed"
      : "unknown";

  const confidence =
    observationStatus === "observed"
      ? roundToTwoDecimals(
          observationResults.reduce(
            (sum, observationResult) =>
              sum +
              observationResult.confidence,
            0
          ) / observationResults.length
        )
      : 0;

  const evidenceIds = Array.from(
    new Set(
      observationResults.flatMap(
        (observationResult) =>
          observationResult.evidenceIds
      )
    )
  );

  return {
    measureStatus: "draft",

    dimensionId:
      baseDefinition.dimensionId || null,

    value,

    measurementContext: {
      baseDefinitionId:
        baseDefinition.dimensionId || null,

      profileApplied,

      profileId:
        profile &&
        typeof profile.profileId === "string"
          ? profile.profileId
          : null,

      effectiveModelId:
        profileApplied && appliedProfile
          ? appliedProfile.effectiveModelId
          : null,

      activeFactors,

      disabledFactors,

      addedFactors,
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
      version: "1.3",
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
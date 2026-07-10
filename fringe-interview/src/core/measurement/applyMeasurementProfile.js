const {
  getMeasurementFactorDefinition,
} = require("./getMeasurementFactorDefinition");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function buildActiveWeights(weights, disabledFactors) {
  const activeEntries = Object.entries(weights).filter(
    ([factorId]) => !disabledFactors.includes(factorId)
  );

  if (activeEntries.length === 0) {
    return {};
  }

  const totalWeight = activeEntries.reduce(
    (sum, [, weight]) =>
      sum +
      (
        typeof weight === "number" &&
        Number.isFinite(weight) &&
        weight >= 0
          ? weight
          : 0
      ),
    0
  );

  if (totalWeight === 0) {
    return {};
  }

  const activeWeights = {};

  activeEntries.forEach(([factorId, weight], index) => {
    const isLast = index === activeEntries.length - 1;

    if (!isLast) {
      activeWeights[factorId] =
        roundToFourDecimals(weight / totalWeight);
      return;
    }

    const assignedTotal = Object.values(
      activeWeights
    ).reduce(
      (sum, currentWeight) => sum + currentWeight,
      0
    );

    activeWeights[factorId] =
      roundToFourDecimals(1 - assignedTotal);
  });

  return activeWeights;
}

function applyMeasurementProfile({
  definition = {},
  profile = {},
} = {}) {
  const baseDefinition = isObject(definition)
    ? deepClone(definition)
    : {};

  const normalizedProfile = isObject(profile)
    ? profile
    : {};

  const overrides = isObject(
    normalizedProfile.overrides
  )
    ? normalizedProfile.overrides
    : {};

  const weightOverrides = isObject(overrides.weights)
    ? overrides.weights
    : {};

  const thresholdOverrides = isObject(
    overrides.thresholds
  )
    ? overrides.thresholds
    : {};

  const benchmarkOverrides = isObject(
    overrides.benchmark
  )
    ? overrides.benchmark
    : {};

  const baseBenchmark = isObject(
    baseDefinition.benchmark
  )
    ? baseDefinition.benchmark
    : {};

  const baseBenchmarkReference = isObject(
    baseBenchmark.reference
  )
    ? baseBenchmark.reference
    : {};

  const baseAggregation = isObject(
    baseDefinition.aggregation
  )
    ? baseDefinition.aggregation
    : {};

  const baseWeights = isObject(
    baseAggregation.weights
  )
    ? baseAggregation.weights
    : {};

  const effectiveWeights = {
    ...baseWeights,
    ...weightOverrides,
  };

  const requestedDisabledFactors = Array.isArray(
    normalizedProfile.disabledFactors
  )
    ? normalizedProfile.disabledFactors
    : [];

  const validDisabledFactors = [];
  const warnings = [];

  requestedDisabledFactors.forEach((factorId) => {
    if (
      Object.prototype.hasOwnProperty.call(
        effectiveWeights,
        factorId
      )
    ) {
      if (!validDisabledFactors.includes(factorId)) {
        validDisabledFactors.push(factorId);
      }
    } else {
      warnings.push(
        `Unknown disabled factor: ${factorId}`
      );
    }
  });

  const activeWeights = buildActiveWeights(
    effectiveWeights,
    validDisabledFactors
  );

  if (
    Object.keys(effectiveWeights).length > 0 &&
    Object.keys(activeWeights).length === 0
  ) {
    warnings.push(
      "All measurement factors are disabled."
    );
  }

  const requestedAddedFactors = Array.isArray(
    normalizedProfile.addedFactors
  )
    ? normalizedProfile.addedFactors
    : [];

  const validAddedFactors = [];

  requestedAddedFactors.forEach((addedFactor) => {
    if (!isObject(addedFactor)) {
      return;
    }

    const factorDefinition =
      getMeasurementFactorDefinition(
        addedFactor.factorId
      );

    if (
      factorDefinition.scoring.strategy ===
      "unsupported"
    ) {
      warnings.push(
        `Unsupported added factor: ${addedFactor.factorId}`
      );
      return;
    }

    if (
      !factorDefinition.supportedDimensions.includes(
        baseDefinition.dimensionId
      )
    ) {
      warnings.push(
        `Added factor does not support dimension: ${addedFactor.factorId}`
      );
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        effectiveWeights,
        addedFactor.factorId
      )
    ) {
      warnings.push(
        `Added factor already exists in base definition: ${addedFactor.factorId}`
      );
      return;
    }

    validAddedFactors.push({
      factorId: addedFactor.factorId,
      weight: addedFactor.weight,
      minimum: addedFactor.minimum,
      configuration: isObject(
        addedFactor.configuration
      )
        ? deepClone(addedFactor.configuration)
        : {},
      definition: factorDefinition,
    });
  });

  const effectiveDefinition = {
    ...baseDefinition,

    benchmark: {
      ...baseBenchmark,

      reference: {
        ...baseBenchmarkReference,
        ...benchmarkOverrides,
      },
    },

    aggregation: {
      ...baseAggregation,

      weights: {
        ...effectiveWeights,
      },

      activeWeights,

      pendingAddedFactors: deepClone(
        validAddedFactors
      ),
    },

    thresholds: {
      ...thresholdOverrides,
    },
  };

  const appliedOverrides = {
    weights: Object.keys(weightOverrides),
    thresholds: Object.keys(thresholdOverrides),
    benchmark: Object.keys(benchmarkOverrides),
    disabledFactors: [...validDisabledFactors],
    addedFactors: deepClone(validAddedFactors),
  };

  if (!normalizedProfile.profileId) {
    warnings.push("profileId is missing.");
  }

  if (!baseDefinition.dimensionId) {
    warnings.push(
      "definition.dimensionId is missing."
    );
  }

  return {
    effectiveModelId:
      `${baseDefinition.dimensionId || "unknown"}::` +
      `${normalizedProfile.profileId || "unknown"}`,

    baseDefinitionId:
      baseDefinition.dimensionId || null,

    profileId:
      normalizedProfile.profileId || null,

    label:
      normalizedProfile.label ||
      "Unnamed Measurement Profile",

    effectiveDefinition,

    appliedOverrides,

    disabledFactors: [...validDisabledFactors],

    addedFactors: deepClone(validAddedFactors),

    warnings,

    metadata: {
      version: "1.2",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  applyMeasurementProfile,
};
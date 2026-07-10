function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeOptionalString(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value;
}

function normalizeLabel(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Unnamed Measurement Profile";
  }

  return value;
}

function normalizeWeights(value) {
  if (!isObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([, weight]) =>
        typeof weight === "number" &&
        Number.isFinite(weight) &&
        weight >= 0
    )
  );
}

function normalizeThresholds(value) {
  if (!isObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([, threshold]) =>
        typeof threshold === "number" &&
        Number.isFinite(threshold) &&
        threshold >= 0 &&
        threshold <= 1
    )
  );
}

function isValidPrimitive(value) {
  return (
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    typeof value === "boolean"
  );
}

function normalizeBenchmark(value) {
  if (!isObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, benchmarkValue]) =>
      isValidPrimitive(benchmarkValue)
    )
  );
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0
      )
    )
  );
}

function normalizeAddedFactor(factor) {
  const source = isObject(factor) ? factor : {};

  return {
    factorId: normalizeOptionalString(source.factorId),

    weight:
      typeof source.weight === "number" &&
      Number.isFinite(source.weight) &&
      source.weight >= 0
        ? source.weight
        : null,

    minimum:
      source.minimum === null ||
      source.minimum === undefined
        ? null
        : typeof source.minimum === "number" &&
            Number.isFinite(source.minimum) &&
            source.minimum >= 0 &&
            source.minimum <= 1
          ? source.minimum
          : null,

    configuration: isObject(source.configuration)
      ? { ...source.configuration }
      : {},
  };
}

function normalizeAddedFactors(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedFactors = [];
  const seenFactorIds = new Set();

  value.forEach((factor) => {
    if (!isObject(factor)) {
      normalizedFactors.push(normalizeAddedFactor({}));
      return;
    }

    const normalizedFactor = normalizeAddedFactor(factor);

    if (
      normalizedFactor.factorId &&
      seenFactorIds.has(normalizedFactor.factorId)
    ) {
      return;
    }

    if (normalizedFactor.factorId) {
      seenFactorIds.add(normalizedFactor.factorId);
    }

    normalizedFactors.push(normalizedFactor);
  });

  return normalizedFactors;
}

function normalizeSource(value) {
  const source = isObject(value) ? value : {};

  return {
    type: normalizeOptionalString(source.type),
    id: normalizeOptionalString(source.id),
  };
}

function buildMeasurementProfile(input = {}) {
  const source = isObject(input) ? input : {};
  const overrides = isObject(source.overrides)
    ? source.overrides
    : {};

  const inputMetadata = isObject(source.metadata)
    ? source.metadata
    : {};

  return {
    profileId: normalizeOptionalString(source.profileId),

    label: normalizeLabel(source.label),

    baseModelId: normalizeOptionalString(source.baseModelId),

    overrides: {
      weights: normalizeWeights(overrides.weights),
      thresholds: normalizeThresholds(overrides.thresholds),
      benchmark: normalizeBenchmark(overrides.benchmark),
    },

    disabledFactors: normalizeStringArray(
      source.disabledFactors
    ),

    addedFactors: normalizeAddedFactors(source.addedFactors),

    rationale:
      typeof source.rationale === "string"
        ? source.rationale
        : null,

    source: normalizeSource(source.source),

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      ...inputMetadata,
    },

    extensions: isObject(source.extensions)
      ? source.extensions
      : {},
  };
}

module.exports = {
  buildMeasurementProfile,
};
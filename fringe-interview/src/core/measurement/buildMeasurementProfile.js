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
        (item) => typeof item === "string" && item.trim().length > 0
      )
    )
  );
}

function normalizeAddedFactors(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isObject)
    .map((factor) => ({
      ...factor,
    }));
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
  const overrides = isObject(source.overrides) ? source.overrides : {};
  const inputMetadata = isObject(source.metadata) ? source.metadata : {};

  return {
    profileId: normalizeOptionalString(source.profileId),

    label: normalizeLabel(source.label),

    baseModelId: normalizeOptionalString(source.baseModelId),

    overrides: {
      weights: normalizeWeights(overrides.weights),
      thresholds: normalizeThresholds(overrides.thresholds),
      benchmark: normalizeBenchmark(overrides.benchmark),
    },

    disabledFactors: normalizeStringArray(source.disabledFactors),

    addedFactors: normalizeAddedFactors(source.addedFactors),

    rationale:
      typeof source.rationale === "string" ? source.rationale : null,

    source: normalizeSource(source.source),

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      ...inputMetadata,
    },

    extensions: isObject(source.extensions) ? source.extensions : {},
  };
}

module.exports = {
  buildMeasurementProfile,
};
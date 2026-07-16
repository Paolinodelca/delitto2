const {
  buildMeasurementModuleNaming,
} = require("./buildMeasurementModuleNaming");

const DEFAULT_THRESHOLDS = {
  weak: 0.3,
  moderate: 0.5,
  strong: 0.7,
  veryStrong: 0.85,
};

const DEFAULT_INFERENCE_FIELDS = [
  "evidenceQuality",
  "sourceConvergence",
  "consistency",
  "coverage",
];

const DEFAULT_INFERENCE_WEIGHTS = {
  evidenceQuality: 0.3,
  sourceConvergence: 0.25,
  consistency: 0.25,
  coverage: 0.2,
};

const DEFAULT_GENERATION = {
  includeObservationBuilder: true,
  includeObservationValidator: true,
  includeMeasureDefinition: true,
  includeMeasureResultBuilder: true,
  includeMeasureResultValidator: true,
  includeIndex: true,
  includeHealth: true,
  includeObservationTest: true,
  includeMeasureResultTest: true,
  includeHealthTest: true,
  includeRegression: true,
  includeManifest: true,
};

const ALLOWED_DIRECTIONS = [
  "positive",
  "inverse",
];

const ALLOWED_SCORING_STATUSES = [
  "configuration_required",
  "configured",
];

const ALLOWED_PROVENANCE_STATUSES = [
  "hypothesis",
  "project_reviewed",
  "expert_reviewed",
  "document_supported",
  "empirically_validated",
  "deprecated",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOptionalString(value) {
  return isNonEmptyString(value) ? value : null;
}

function normalizeUniqueStrings(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  value.forEach((item) => {
    if (!isNonEmptyString(item) || seen.has(item)) {
      return;
    }

    seen.add(item);
    result.push(item);
  });

  return result;
}

function normalizePrimitive(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return null;
}

function normalizeNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function cloneObject(value) {
  return isObject(value) ? { ...value } : {};
}

function normalizeFactor(input = {}) {
  const factor = isObject(input) ? input : {};
  const factorId = normalizeOptionalString(factor.factorId);
  const observationField = normalizeOptionalString(factor.observationField)
    || factorId;
  const explainabilityKey = normalizeOptionalString(factor.explainabilityKey)
    || factorId;
  const inputMetadata = isObject(factor.metadata) ? factor.metadata : {};

  return {
    factorId,

    label: isNonEmptyString(factor.label)
      ? factor.label
      : "Unnamed Factor",

    description: normalizeOptionalString(factor.description),

    observationField,

    valueType: typeof factor.valueType === "string"
      ? factor.valueType
      : "enum",

    allowedValues: normalizeUniqueStrings(factor.allowedValues),

    defaultValue: normalizePrimitive(factor.defaultValue),

    weight: normalizeNonNegativeNumber(factor.weight),

    direction: ALLOWED_DIRECTIONS.includes(factor.direction)
      ? factor.direction
      : "positive",

    scoringStatus: ALLOWED_SCORING_STATUSES.includes(factor.scoringStatus)
      ? factor.scoringStatus
      : "configuration_required",

    scoringMap: cloneObject(factor.scoringMap),

    benchmarkKey: normalizeOptionalString(factor.benchmarkKey),

    explainabilityKey,

    metadata: {
      ...inputMetadata,
    },

    extensions: cloneObject(factor.extensions),
  };
}

function normalizeThresholds(value) {
  const thresholds = isObject(value) ? value : {};

  return Object.fromEntries(
    Object.entries(DEFAULT_THRESHOLDS).map(([key, defaultValue]) => {
      const explicitValue = thresholds[key];

      return [
        key,
        typeof explicitValue === "number" &&
        Number.isFinite(explicitValue) &&
        explicitValue >= 0 &&
        explicitValue <= 1
          ? explicitValue
          : defaultValue,
      ];
    })
  );
}

function normalizeInferenceSupport(value) {
  const source = isObject(value) ? value : {};
  const fields = Array.isArray(source.fields)
    ? normalizeUniqueStrings(source.fields)
    : [...DEFAULT_INFERENCE_FIELDS];
  const weightInput = isObject(source.weights) ? source.weights : {};
  const weights = {};

  fields.forEach((field) => {
    const explicitWeight = weightInput[field];
    const defaultWeight = DEFAULT_INFERENCE_WEIGHTS[field];

    if (
      typeof explicitWeight === "number" &&
      Number.isFinite(explicitWeight) &&
      explicitWeight >= 0
    ) {
      weights[field] = explicitWeight;
    } else if (typeof defaultWeight === "number") {
      weights[field] = defaultWeight;
    } else {
      weights[field] = 0;
    }
  });

  Object.entries(weightInput).forEach(([field, weight]) => {
    if (
      !Object.prototype.hasOwnProperty.call(weights, field) &&
      typeof weight === "number" &&
      Number.isFinite(weight) &&
      weight >= 0
    ) {
      weights[field] = weight;
    }
  });

  return {
    fields,
    weights,
  };
}

function normalizeObservation(value) {
  const source = isObject(value) ? value : {};
  const policy = isObject(source.notObservedPolicy)
    ? source.notObservedPolicy
    : {};

  return {
    contextEnabled: typeof source.contextEnabled === "boolean"
      ? source.contextEnabled
      : true,

    evidenceIdsEnabled: typeof source.evidenceIdsEnabled === "boolean"
      ? source.evidenceIdsEnabled
      : true,

    limitationsEnabled: typeof source.limitationsEnabled === "boolean"
      ? source.limitationsEnabled
      : true,

    notObservedPolicy: {
      requireEmptyEvidenceIds:
        typeof policy.requireEmptyEvidenceIds === "boolean"
          ? policy.requireEmptyEvidenceIds
          : true,

      zeroFields: normalizeUniqueStrings(policy.zeroFields),

      zeroInferenceSupport:
        typeof policy.zeroInferenceSupport === "boolean"
          ? policy.zeroInferenceSupport
          : true,
    },
  };
}

function normalizeGeneration(value) {
  const source = isObject(value) ? value : {};

  return Object.fromEntries(
    Object.entries(DEFAULT_GENERATION).map(([key, defaultValue]) => [
      key,
      typeof source[key] === "boolean"
        ? source[key]
        : defaultValue,
    ])
  );
}

function normalizeProvenance(value) {
  const source = isObject(value) ? value : {};
  const status = ALLOWED_PROVENANCE_STATUSES.includes(source.status)
    ? source.status
    : "hypothesis";
  const seen = new Set();
  const sources = [];

  if (Array.isArray(source.sources)) {
    source.sources.forEach((item) => {
      const entry = isObject(item) ? item : {};
      const sourceType = normalizeOptionalString(entry.sourceType);
      const sourceId = normalizeOptionalString(entry.sourceId);
      const key = `${sourceType === null ? "" : sourceType}::${sourceId === null ? "" : sourceId}`;

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      sources.push({
        sourceType,
        sourceId,
      });
    });
  }

  return {
    status,
    sources,
  };
}

function scoringMapIsComplete(factor) {
  if (factor.scoringStatus !== "configured") {
    return false;
  }

  const keys = Object.keys(factor.scoringMap);

  return (
    factor.allowedValues.length > 0 &&
    keys.length === factor.allowedValues.length &&
    factor.allowedValues.every((allowedValue) => {
      const score = factor.scoringMap[allowedValue];

      return (
        Object.prototype.hasOwnProperty.call(factor.scoringMap, allowedValue) &&
        typeof score === "number" &&
        Number.isFinite(score) &&
        score >= 0 &&
        score <= 1
      );
    })
  );
}

function generationDependenciesAreCoherent(generation) {
  return !(
    (generation.includeObservationValidator && !generation.includeObservationBuilder) ||
    (generation.includeMeasureResultBuilder && !generation.includeMeasureDefinition) ||
    (generation.includeMeasureResultValidator && !generation.includeMeasureResultBuilder) ||
    (generation.includeObservationTest && !generation.includeObservationBuilder) ||
    (generation.includeMeasureResultTest && !generation.includeMeasureResultBuilder) ||
    (generation.includeHealthTest && !generation.includeHealth) ||
    (generation.includeRegression && !generation.includeMeasureResultBuilder)
  );
}

function computeSemanticCompletion({
  measureId,
  naming,
  factors,
  benchmarkReference,
  generation,
  extensions,
}) {
  const scoringConfigured =
    factors.length > 0 &&
    factors.every(scoringMapIsComplete);

  const explainabilityConfigured =
    factors.length > 0 &&
    factors.every((factor) => isNonEmptyString(factor.explainabilityKey)) &&
    isObject(extensions.explainabilityConfiguration) &&
    Object.keys(extensions.explainabilityConfiguration).length > 0;

  const benchmarkConfigured =
    isObject(benchmarkReference) &&
    Object.keys(benchmarkReference).length > 0;

  const namingAvailable =
    isNonEmptyString(naming.moduleDirectory) &&
    isNonEmptyString(naming.pascalName) &&
    isNonEmptyString(naming.camelName) &&
    isNonEmptyString(naming.snakeName) &&
    isNonEmptyString(naming.constantName);

  const readyForGeneration =
    measureId !== null &&
    namingAvailable &&
    factors.length > 0 &&
    generationDependenciesAreCoherent(generation);

  const missingItems = [];

  if (!scoringConfigured) {
    missingItems.push("scoring_configuration");
  }

  if (!explainabilityConfigured) {
    missingItems.push("explainability_configuration");
  }

  if (!benchmarkConfigured) {
    missingItems.push("benchmark_configuration");
  }

  return {
    scoringConfigured,
    explainabilityConfigured,
    benchmarkConfigured,
    readyForGeneration,
    missingItems,
  };
}

function deriveSpecStatus({ measureId, naming, factors, semanticCompletion }) {
  const namingEssential =
    isNonEmptyString(naming.moduleDirectory) &&
    isNonEmptyString(naming.pascalName) &&
    isNonEmptyString(naming.camelName) &&
    isNonEmptyString(naming.snakeName) &&
    isNonEmptyString(naming.constantName);

  if (measureId === null || factors.length === 0 || !namingEssential) {
    return "draft";
  }

  if (
    semanticCompletion.scoringConfigured &&
    semanticCompletion.explainabilityConfigured &&
    semanticCompletion.benchmarkConfigured &&
    semanticCompletion.readyForGeneration
  ) {
    return "ready";
  }

  return "configuration_required";
}

function buildMeasurementModuleSpec(input = {}) {
  const source = isObject(input) ? input : {};
  const measureId = normalizeOptionalString(source.measureId);
  const specId = normalizeOptionalString(source.specId)
    || (measureId !== null ? `measurement_spec_${measureId}_v1` : null);
  const naming = buildMeasurementModuleNaming({
    measureId,
    naming: source.naming,
  });
  const factors = Array.isArray(source.factors)
    ? source.factors.map(normalizeFactor)
    : [];
  const benchmarkReference = cloneObject(source.benchmarkReference);
  const thresholds = normalizeThresholds(source.thresholds);
  const inferenceSupport = normalizeInferenceSupport(source.inferenceSupport);
  const observation = normalizeObservation(source.observation);
  const generation = normalizeGeneration(source.generation);
  const provenance = normalizeProvenance(source.provenance);
  const extensions = cloneObject(source.extensions);
  const semanticCompletion = computeSemanticCompletion({
    measureId,
    naming,
    factors,
    benchmarkReference,
    generation,
    extensions,
  });
  const inputMetadata = isObject(source.metadata) ? source.metadata : {};

  return {
    specId,
    specVersion: "1.0",
    specStatus: deriveSpecStatus({
      measureId,
      naming,
      factors,
      semanticCompletion,
    }),
    moduleType: "measurement",
    measureId,
    label: isNonEmptyString(source.label)
      ? source.label
      : "Unnamed Measurement",
    description: normalizeOptionalString(source.description),
    naming,
    factors,
    benchmarkReference,
    thresholds,
    inferenceSupport,
    observation,
    generation,
    semanticCompletion,
    provenance,
    rationale: normalizeOptionalString(source.rationale),
    metadata: {
      ...inputMetadata,
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
    extensions,
  };
}

module.exports = {
  buildMeasurementModuleSpec,
};

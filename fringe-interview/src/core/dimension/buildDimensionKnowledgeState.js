const DIMENSION_TYPES = ["elementary", "derived", "hybrid"];
const STATE_TYPES = ["observed", "derived", "hybrid", "unknown"];
const DIRECTIONS = ["supporting", "contradicting", "mixed", "unknown"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  }
  return value;
}

function normalizeStringRefs(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const refs = [];
  for (const item of value) {
    const ref = cleanString(item);
    if (ref && !seen.has(ref)) {
      seen.add(ref);
      refs.push(ref);
    }
  }
  return refs;
}

function normalizeContextDistribution(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!isObject(item)) return clone(item);
    const normalized = {
      contextId: cleanString(item.contextId),
      observationCount: item.observationCount,
    };
    for (const field of ["estimate", "coverage", "confidence"]) {
      if (Object.prototype.hasOwnProperty.call(item, field)) normalized[field] = item[field];
    }
    if (Object.prototype.hasOwnProperty.call(item, "metadata")) {
      normalized.metadata = isObject(item.metadata) ? clone(item.metadata) : item.metadata;
    }
    return normalized;
  });
}

function normalizeContradictions(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!isObject(item)) return clone(item);
    return {
      id: cleanString(item.id),
      type: cleanString(item.type),
      description: cleanString(item.description),
      relatedRefs: normalizeStringRefs(item.relatedRefs),
      severity: cleanString(item.severity),
      metadata: isObject(item.metadata) ? clone(item.metadata) : {},
    };
  });
}

function resolveNow(input, options) {
  const explicit = cleanString(options && options.now);
  if (explicit) return explicit;
  if (options && typeof options.now === "function") return options.now();
  const metadata = isObject(input.metadata) ? input.metadata : {};
  return cleanString(metadata.updatedAt) || cleanString(metadata.createdAt) || new Date().toISOString();
}

function buildDimensionKnowledgeState(input = {}, options = {}) {
  const now = resolveNow(input, options);
  const metadataInput = isObject(input.metadata) ? input.metadata : {};
  const stateType = STATE_TYPES.includes(input.stateType) ? input.stateType : "unknown";
  const unknown = stateType === "unknown";

  return {
    dimensionId: cleanString(input.dimensionId),
    dimensionType: DIMENSION_TYPES.includes(input.dimensionType)
      ? input.dimensionType
      : cleanString(input.dimensionType),
    stateType,
    estimate: unknown ? null : input.estimate,
    direction: unknown ? "unknown" : (DIRECTIONS.includes(input.direction) ? input.direction : cleanString(input.direction)),
    coverage: unknown && input.coverage === undefined ? 0 : input.coverage,
    confidence: unknown && input.confidence === undefined ? 0 : input.confidence,
    consistency: unknown && input.consistency === undefined ? 0 : input.consistency,
    stability: input.stability === undefined ? null : input.stability,
    evidenceQuality: input.evidenceQuality === undefined ? null : input.evidenceQuality,
    sourceReliability: input.sourceReliability === undefined ? null : input.sourceReliability,
    measurementCount: input.measurementCount === undefined ? 0 : input.measurementCount,
    independentMeasurementCount:
      input.independentMeasurementCount === undefined ? 0 : input.independentMeasurementCount,
    resultCount: input.resultCount === undefined ? 0 : input.resultCount,
    sourceDiversity: input.sourceDiversity === undefined ? 0 : input.sourceDiversity,
    contextDistribution: normalizeContextDistribution(input.contextDistribution),
    contradictions: normalizeContradictions(input.contradictions),
    supportingMeasurementResultRefs: normalizeStringRefs(input.supportingMeasurementResultRefs),
    supportingCapabilityResultRefs: normalizeStringRefs(input.supportingCapabilityResultRefs),
    derivationTrace:
      input.derivationTrace === null || input.derivationTrace === undefined
        ? null
        : clone(input.derivationTrace),
    metadata: {
      version: cleanString(metadataInput.version) || "1.0",
      createdAt: cleanString(metadataInput.createdAt) || now,
      updatedAt: cleanString(metadataInput.updatedAt) || now,
    },
    extensions: isObject(input.extensions) ? clone(input.extensions) : {},
  };
}

module.exports = {
  buildDimensionKnowledgeState,
  DIMENSION_TYPES,
  STATE_TYPES,
  DIRECTIONS,
};

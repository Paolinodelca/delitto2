const ALLOWED_RESPONSIBILITY_TYPES = [
  "direct",
  "shared",
  "indirect",
  "unknown",
];

const ALLOWED_MANAGEMENT_LAYERS = [
  "multi_layer",
  "single_layer",
  "unknown",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeNonNegativeNumber(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function normalizeObservationId(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value;
}

function normalizeResponsibilityType(value) {
  return ALLOWED_RESPONSIBILITY_TYPES.includes(value)
    ? value
    : "unknown";
}

function normalizeManagementLayer(value) {
  return ALLOWED_MANAGEMENT_LAYERS.includes(value)
    ? value
    : "unknown";
}

function normalizeContextType(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "unknown";
  }

  return value;
}

function normalizeEvidenceIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const validEvidenceIds = value.filter(
    (item) => typeof item === "string" && item.trim().length > 0
  );

  return Array.from(new Set(validEvidenceIds));
}

function normalizeConfidence(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function buildManagementObservation(input = {}) {
  const source = isObject(input) ? input : {};
  const inputMetadata = isObject(source.metadata)
    ? source.metadata
    : {};

  return {
    observationId: normalizeObservationId(source.observationId),

    observationType: "management_scope",

    teamSize: normalizeNonNegativeNumber(source.teamSize),

    durationYears: normalizeNonNegativeNumber(
      source.durationYears
    ),

    responsibilityType: normalizeResponsibilityType(
      source.responsibilityType
    ),

    managementLayer: normalizeManagementLayer(
      source.managementLayer
    ),

    contextType: normalizeContextType(source.contextType),

    evidenceIds: normalizeEvidenceIds(source.evidenceIds),

    confidence: normalizeConfidence(source.confidence),

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
  buildManagementObservation,
};
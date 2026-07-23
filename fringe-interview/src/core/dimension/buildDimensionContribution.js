const CONTRIBUTION_TYPES = ["supporting", "contradicting"];

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

function resolveNow(input, options) {
  if (options && typeof options.now === "function") return options.now();
  const explicit = cleanString(options && options.now);
  if (explicit) return explicit;
  const metadata = isObject(input.metadata) ? input.metadata : {};
  return cleanString(metadata.updatedAt) || cleanString(metadata.createdAt) || new Date().toISOString();
}

function normalizeProvenance(value) {
  const provenance = isObject(value) ? value : {};
  return {
    measurementResultRef: cleanString(provenance.measurementResultRef),
    sourceRefs: normalizeStringRefs(provenance.sourceRefs),
  };
}

function buildDimensionContribution(input = {}, options = {}) {
  const source = isObject(input) ? input : {};
  const now = resolveNow(source, options);
  const metadataInput = isObject(source.metadata) ? source.metadata : {};

  return {
    id: cleanString(source.id),
    measurementId: cleanString(source.measurementId),
    dimensionId: cleanString(source.dimensionId),
    contributionType: CONTRIBUTION_TYPES.includes(source.contributionType)
      ? source.contributionType
      : cleanString(source.contributionType),
    contributionValue: source.contributionValue === undefined ? 0 : source.contributionValue,
    confidence: source.confidence === undefined ? 0 : source.confidence,
    provenance: normalizeProvenance(source.provenance),
    metadata: {
      version: cleanString(metadataInput.version) || "1.0",
      createdAt: cleanString(metadataInput.createdAt) || now,
      updatedAt: cleanString(metadataInput.updatedAt) || now,
    },
    extensions: isObject(source.extensions) ? clone(source.extensions) : {},
  };
}

module.exports = { buildDimensionContribution };

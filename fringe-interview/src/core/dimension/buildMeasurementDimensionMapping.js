const VALUE_STRATEGIES = ["direct"];
const CONFIDENCE_STRATEGIES = ["inherit"];
const CONTRIBUTION_TYPES = ["supporting", "contradicting"];

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function cleanString(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}
function resolveNow(input, options) {
  if (options && typeof options.now === "function") return options.now();
  const explicit = cleanString(options && options.now);
  if (explicit) return explicit;
  const metadata = isObject(input.metadata) ? input.metadata : {};
  return cleanString(metadata.updatedAt) || cleanString(metadata.createdAt) || null;
}
function normalizeTarget(target) {
  const source = isObject(target) ? target : {};
  return {
    dimensionId: cleanString(source.dimensionId),
    contributionType: CONTRIBUTION_TYPES.includes(source.contributionType) ? source.contributionType : cleanString(source.contributionType),
    weight: source.weight === undefined ? 1 : source.weight,
    confidenceFactor: source.confidenceFactor === undefined ? 1 : source.confidenceFactor,
    extensions: isObject(source.extensions) ? clone(source.extensions) : {},
  };
}
function buildMeasurementDimensionMapping(input = {}, options = {}) {
  const source = isObject(input) ? input : {};
  const metadataInput = isObject(source.metadata) ? source.metadata : {};
  const now = resolveNow(source, options);
  return {
    id: cleanString(source.id),
    measurementId: cleanString(source.measurementId),
    targets: Array.isArray(source.targets) ? source.targets.map(normalizeTarget) : [],
    valueStrategy: VALUE_STRATEGIES.includes(source.valueStrategy) ? source.valueStrategy : (cleanString(source.valueStrategy) || "direct"),
    confidenceStrategy: CONFIDENCE_STRATEGIES.includes(source.confidenceStrategy) ? source.confidenceStrategy : (cleanString(source.confidenceStrategy) || "inherit"),
    metadata: {
      version: cleanString(metadataInput.version) || "1.0",
      createdAt: cleanString(metadataInput.createdAt) || now,
      updatedAt: cleanString(metadataInput.updatedAt) || now,
    },
    extensions: isObject(source.extensions) ? clone(source.extensions) : {},
  };
}
module.exports = { buildMeasurementDimensionMapping };

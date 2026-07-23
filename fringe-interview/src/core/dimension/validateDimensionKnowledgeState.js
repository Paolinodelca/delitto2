const { DIMENSION_TYPES, STATE_TYPES, DIRECTIONS } = require("./buildDimensionKnowledgeState");

const TOP_LEVEL_FIELDS = [
  "dimensionId", "dimensionType", "stateType", "estimate", "direction",
  "coverage", "confidence", "consistency", "stability", "evidenceQuality",
  "sourceReliability", "measurementCount", "independentMeasurementCount",
  "resultCount", "sourceDiversity", "contextDistribution", "contradictions",
  "supportingMeasurementResultRefs", "supportingCapabilityResultRefs",
  "derivationTrace", "metadata", "extensions",
];
const CONTEXT_FIELDS = ["contextId", "observationCount", "estimate", "coverage", "confidence", "metadata"];
const CONTRADICTION_FIELDS = ["id", "type", "description", "relatedRefs", "severity", "metadata"];
const TRACE_FIELDS = [
  "method", "sourceResultRefs", "capabilityId", "capabilityDesignVersion",
  "capabilityProjectionVersion", "capabilityDefinitionVersion", "metadata",
];
const SEVERITIES = ["low", "moderate", "high"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function validString(value) { return typeof value === "string" && value.trim().length > 0; }
function validUnit(value) { return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1; }
function validNullableUnit(value) { return value === null || validUnit(value); }
function validCount(value) { return Number.isInteger(value) && value >= 0; }
function validIso(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}
function unknownKeys(value, allowed, path, errors) {
  if (!isObject(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${path}.${key} is not allowed.`);
  }
}
function validateRefArray(value, path, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }
  const seen = new Set();
  value.forEach((ref, index) => {
    if (!validString(ref)) errors.push(`${path}[${index}] must be a non-empty string.`);
    else if (seen.has(ref)) errors.push(`${path} must not contain duplicate references.`);
    else seen.add(ref);
  });
}
function validateContextDistribution(value, errors) {
  if (!Array.isArray(value)) {
    errors.push("contextDistribution must be an array.");
    return;
  }
  value.forEach((item, index) => {
    const path = `contextDistribution[${index}]`;
    if (!isObject(item)) { errors.push(`${path} must be an object.`); return; }
    unknownKeys(item, CONTEXT_FIELDS, path, errors);
    if (!validString(item.contextId)) errors.push(`${path}.contextId must be a non-empty string.`);
    if (!validCount(item.observationCount)) errors.push(`${path}.observationCount must be a non-negative integer.`);
    for (const field of ["estimate", "coverage", "confidence"]) {
      if (Object.prototype.hasOwnProperty.call(item, field) && !validUnit(item[field])) {
        errors.push(`${path}.${field} must be a finite number between 0 and 1.`);
      }
    }
    if (Object.prototype.hasOwnProperty.call(item, "metadata") && !isObject(item.metadata)) {
      errors.push(`${path}.metadata must be an object.`);
    }
  });
}
function validateContradictions(value, errors) {
  if (!Array.isArray(value)) { errors.push("contradictions must be an array."); return; }
  value.forEach((item, index) => {
    const path = `contradictions[${index}]`;
    if (!isObject(item)) { errors.push(`${path} must be an object.`); return; }
    unknownKeys(item, CONTRADICTION_FIELDS, path, errors);
    for (const field of ["id", "type", "description"]) {
      if (!validString(item[field])) errors.push(`${path}.${field} must be a non-empty string.`);
    }
    validateRefArray(item.relatedRefs, `${path}.relatedRefs`, errors);
    if (!SEVERITIES.includes(item.severity)) errors.push(`${path}.severity must be low, moderate, or high.`);
    if (!isObject(item.metadata)) errors.push(`${path}.metadata must be an object.`);
  });
}
function validateDerivationTrace(value, errors) {
  if (value === null) return;
  if (!isObject(value)) { errors.push("derivationTrace must be null or an object."); return; }
  unknownKeys(value, TRACE_FIELDS, "derivationTrace", errors);
  if (!validString(value.method)) errors.push("derivationTrace.method must be a non-empty string.");
  validateRefArray(value.sourceResultRefs, "derivationTrace.sourceResultRefs", errors);
  for (const field of ["capabilityId", "capabilityDesignVersion", "capabilityProjectionVersion", "capabilityDefinitionVersion"]) {
    if (Object.prototype.hasOwnProperty.call(value, field) && value[field] !== null && !validString(value[field])) {
      errors.push(`derivationTrace.${field} must be null or a non-empty string.`);
    }
  }
  if (!isObject(value.metadata)) errors.push("derivationTrace.metadata must be an object.");
}

function validateDimensionKnowledgeState(state = {}) {
  const errors = [];
  const warnings = [];
  if (!isObject(state)) return { valid: false, errors: ["DimensionKnowledgeState must be an object."], warnings };
  unknownKeys(state, TOP_LEVEL_FIELDS, "dimensionKnowledgeState", errors);

  if (!validString(state.dimensionId)) errors.push("dimensionId must be a non-empty string.");
  if (!DIMENSION_TYPES.includes(state.dimensionType)) errors.push("dimensionType must be elementary, derived, or hybrid.");
  if (!STATE_TYPES.includes(state.stateType)) errors.push("stateType must be observed, derived, hybrid, or unknown.");

  const allowedPairs = {
    elementary: ["observed", "unknown"],
    derived: ["derived", "unknown"],
    hybrid: ["hybrid", "unknown"],
  };
  if (allowedPairs[state.dimensionType] && !allowedPairs[state.dimensionType].includes(state.stateType)) {
    errors.push(`dimensionType ${state.dimensionType} is incompatible with stateType ${state.stateType}.`);
  }

  if (state.stateType === "unknown") {
    if (state.estimate !== null) errors.push("estimate must be null when stateType is unknown.");
    if (state.direction !== "unknown") errors.push("direction must be unknown when stateType is unknown.");
  } else {
    if (!validUnit(state.estimate)) errors.push("estimate must be a finite number between 0 and 1.");
    if (!DIRECTIONS.includes(state.direction) || state.direction === "unknown") {
      errors.push("direction must be supporting, contradicting, or mixed when stateType is not unknown.");
    }
  }

  for (const field of ["coverage", "confidence", "consistency"]) {
    if (!validUnit(state[field])) errors.push(`${field} must be a finite number between 0 and 1.`);
  }
  for (const field of ["stability", "evidenceQuality", "sourceReliability"]) {
    if (!validNullableUnit(state[field])) errors.push(`${field} must be null or a finite number between 0 and 1.`);
  }
  for (const field of ["measurementCount", "independentMeasurementCount", "resultCount", "sourceDiversity"]) {
    if (!validCount(state[field])) errors.push(`${field} must be a non-negative integer.`);
  }
  if (validCount(state.independentMeasurementCount) && validCount(state.measurementCount) && state.independentMeasurementCount > state.measurementCount) {
    errors.push("independentMeasurementCount must not exceed measurementCount.");
  }
  if (validCount(state.sourceDiversity) && validCount(state.resultCount) && state.resultCount > 0 && state.sourceDiversity > state.resultCount) {
    errors.push("sourceDiversity must not exceed resultCount when resultCount is greater than 0.");
  }

  validateContextDistribution(state.contextDistribution, errors);
  validateContradictions(state.contradictions, errors);
  validateRefArray(state.supportingMeasurementResultRefs, "supportingMeasurementResultRefs", errors);
  validateRefArray(state.supportingCapabilityResultRefs, "supportingCapabilityResultRefs", errors);
  validateDerivationTrace(state.derivationTrace, errors);

  if (!isObject(state.metadata)) errors.push("metadata must be an object.");
  else {
    unknownKeys(state.metadata, ["version", "createdAt", "updatedAt"], "metadata", errors);
    if (state.metadata.version !== "1.0") errors.push("metadata.version must be 1.0.");
    if (!validIso(state.metadata.createdAt)) errors.push("metadata.createdAt must be a valid ISO timestamp.");
    if (!validIso(state.metadata.updatedAt)) errors.push("metadata.updatedAt must be a valid ISO timestamp.");
    if (validIso(state.metadata.createdAt) && validIso(state.metadata.updatedAt) && Date.parse(state.metadata.updatedAt) < Date.parse(state.metadata.createdAt)) {
      errors.push("metadata.updatedAt must not precede metadata.createdAt.");
    }
  }
  if (!isObject(state.extensions)) errors.push("extensions must be an object.");

  if (state.dimensionType === "elementary" && state.stateType !== "unknown" && state.supportingCapabilityResultRefs?.length) {
    errors.push("elementary states must not include supportingCapabilityResultRefs.");
  }
  if (state.dimensionType === "derived" && state.stateType !== "unknown" && state.supportingMeasurementResultRefs?.length) {
    errors.push("derived states must not include supportingMeasurementResultRefs.");
  }
  if (state.stateType === "observed" && state.coverage === 0) warnings.push("stateType is observed but coverage is 0.");
  if (state.stateType === "derived" && state.derivationTrace === null) warnings.push("stateType is derived but derivationTrace is null.");
  if (state.stateType !== "unknown" && state.resultCount === 0) warnings.push("resultCount is 0 while stateType is not unknown.");
  if (state.sourceDiversity === 0 && ((state.supportingMeasurementResultRefs?.length || 0) + (state.supportingCapabilityResultRefs?.length || 0) > 0)) {
    warnings.push("sourceDiversity is 0 while supporting references are present.");
  }
  if ((state.contradictions?.length || 0) > 0 && state.direction !== "mixed") warnings.push("contradictions are present but direction is not mixed.");

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateDimensionKnowledgeState };

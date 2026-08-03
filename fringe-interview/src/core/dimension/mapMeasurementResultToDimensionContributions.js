const crypto = require("crypto");
const { validateMeasurementResult } = require("../observation/validateMeasurementResult");
const { validateMeasurementDimensionMapping } = require("./validateMeasurementDimensionMapping");
const { buildDimensionContribution } = require("./buildDimensionContribution");
const { validateDimensionContribution } = require("./validateDimensionContribution");

const IDENTITY_SCHEMA = "dimension-contribution-mapping-identity-v1";
const FORMULA_VERSION = "1.0";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const item of Reflect.ownKeys(value)) deepFreeze(value[item]);
  return Object.freeze(value);
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function fingerprint(value) {
  return crypto.createHash("sha256").update(canonical(value)).digest("hex");
}

function fail(code, message, details) {
  const error = new Error(message);
  error.code = code;
  if (details !== undefined) error.details = details;
  throw error;
}

function collectHiddenPropertyErrors(value, path, errors, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  const enumerable = new Set(Object.keys(value));
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === "length") continue;
    if (typeof key === "symbol" || !enumerable.has(key)) errors.push(`${path} contains a hidden property.`);
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectHiddenPropertyErrors(item, `${path}[${index}]`, errors, seen));
  } else {
    Object.entries(value).forEach(([key, item]) =>
      collectHiddenPropertyErrors(item, `${path}.${key}`, errors, seen)
    );
  }
}

function collectNonCanonicalErrors(value, path, errors, seen = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) errors.push(`${path} must contain only finite numbers.`);
    return;
  }
  if (typeof value !== "object") {
    errors.push(`${path} contains a non-canonical value.`);
    return;
  }
  if (seen.has(value)) {
    errors.push(`${path} must not contain cyclic references.`);
    return;
  }
  seen.add(value);
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    errors.push(`${path} must contain only plain objects.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectNonCanonicalErrors(item, `${path}[${index}]`, errors, seen));
  } else {
    Object.entries(value).forEach(([key, item]) => collectNonCanonicalErrors(item, `${path}.${key}`, errors, seen));
  }
  seen.delete(value);
}

function validateLocalInputs(measurementResult, mapping) {
  const resultValidation = validateMeasurementResult(measurementResult);
  if (!resultValidation.valid) {
    fail(
      "INVALID_MEASUREMENT_RESULT",
      `MeasurementResult is invalid: ${resultValidation.errors.join(" | ")}`,
      resultValidation
    );
  }

  const mappingValidation = validateMeasurementDimensionMapping(mapping);
  if (!mappingValidation.valid) {
    fail(
      "INVALID_MEASUREMENT_DIMENSION_MAPPING",
      `MeasurementDimensionMapping is invalid: ${mappingValidation.errors.join(" | ")}`,
      mappingValidation
    );
  }

  const resultIntegrityErrors = [];
  collectHiddenPropertyErrors(measurementResult, "measurementResult", resultIntegrityErrors);
  if (resultIntegrityErrors.length > 0) {
    const details = { valid: false, errors: resultIntegrityErrors, warnings: [] };
    fail(
      "INVALID_MEASUREMENT_RESULT",
      `MeasurementResult is invalid: ${resultIntegrityErrors.join(" | ")}`,
      details
    );
  }

  const mappingIntegrityErrors = [];
  collectHiddenPropertyErrors(mapping, "mapping", mappingIntegrityErrors);
  collectNonCanonicalErrors(mapping.extensions, "mapping.extensions", mappingIntegrityErrors);
  mapping.targets.forEach((target, index) =>
    collectNonCanonicalErrors(target.extensions, `mapping.targets[${index}].extensions`, mappingIntegrityErrors)
  );
  if (mappingIntegrityErrors.length > 0) {
    const details = { valid: false, errors: mappingIntegrityErrors, warnings: [] };
    fail(
      "INVALID_MEASUREMENT_DIMENSION_MAPPING",
      `MeasurementDimensionMapping is invalid: ${mappingIntegrityErrors.join(" | ")}`,
      details
    );
  }
}

function validateContext(measurementResult, mapping) {
  if (measurementResult.measurementId !== mapping.measurementId) {
    fail(
      "INCOMPATIBLE_MEASUREMENT_MAPPING",
      "MeasurementResult measurementId is incompatible with mapping.measurementId."
    );
  }
  if (measurementResult.status !== "calculated") {
    fail(
      "MEASUREMENT_RESULT_NOT_APPLICABLE",
      "MeasurementResult must have status calculated to be mapped."
    );
  }
}

function canonicalObservationRefs(result) {
  return [...new Set((result.observationRefs || []).map((ref) => `observation:${ref.id.trim()}`))].sort();
}

function canonicalSourceRefs(result, mappingId) {
  return [`mapping:${mappingId}`, ...canonicalObservationRefs(result)].sort();
}

function canonicalPolicy(mapping) {
  return {
    id: mapping.id,
    measurementId: mapping.measurementId,
    targets: mapping.targets
      .map((target) => ({
        dimensionId: target.dimensionId,
        contributionType: target.contributionType,
        weight: target.weight,
        confidenceFactor: target.confidenceFactor,
        extensions: clone(target.extensions),
      }))
      .sort((left, right) => canonical(left).localeCompare(canonical(right))),
    valueStrategy: mapping.valueStrategy,
    confidenceStrategy: mapping.confidenceStrategy,
    version: mapping.metadata.version,
    extensions: clone(mapping.extensions),
  };
}

function roundUnit(value) {
  return Math.round(value * 1e12) / 1e12;
}

function formulaProvenance(measurementResult, mapping, target, policyFingerprint) {
  return {
    version: FORMULA_VERSION,
    policy: {
      mappingRef: `mapping:${mapping.id}`,
      mappingVersion: mapping.metadata.version,
      policyFingerprint,
    },
    value: {
      strategy: mapping.valueStrategy,
      expression: "abs(measurementResult.normalizedValue) * mappingTarget.weight",
      operands: {
        normalizedValue: measurementResult.normalizedValue,
        weight: target.weight,
      },
    },
    confidence: {
      strategy: mapping.confidenceStrategy,
      expression: "measurementResult.confidence * mappingTarget.confidenceFactor",
      operands: {
        confidence: measurementResult.confidence,
        confidenceFactor: target.confidenceFactor,
      },
    },
  };
}

function buildCanonicalContribution(measurementResult, mapping, target, policyFingerprint) {
  const contributionValue = roundUnit(Math.abs(measurementResult.normalizedValue) * target.weight);
  const confidence = roundUnit(measurementResult.confidence * target.confidenceFactor);
  const contributionBody = {
    measurementId: measurementResult.measurementId,
    dimensionId: target.dimensionId,
    contributionType: target.contributionType,
    contributionValue,
    confidence,
    provenance: {
      measurementResultRef: `measurementResult:${measurementResult.id}`,
      sourceRefs: canonicalSourceRefs(measurementResult, mapping.id),
    },
    metadata: {
      version: "1.0",
      createdAt: measurementResult.calculatedAt,
      updatedAt: measurementResult.calculatedAt,
    },
    extensions: {
      mapping: {
        id: mapping.id,
        version: mapping.metadata.version,
        policyFingerprint,
      },
      target: clone(target.extensions),
      formula: formulaProvenance(measurementResult, mapping, target, policyFingerprint),
    },
  };
  const id = `dimension_contribution_${fingerprint({
    schema: IDENTITY_SCHEMA,
    contribution: contributionBody,
  }).slice(0, 32)}`;
  const contribution = buildDimensionContribution({ id, ...contributionBody }, { now: measurementResult.calculatedAt });
  const validation = validateDimensionContribution(contribution);
  if (!validation.valid) {
    fail(
      "INVALID_GENERATED_DIMENSION_CONTRIBUTION",
      `Generated DimensionContribution is invalid: ${validation.errors.join(" | ")}`,
      validation
    );
  }
  return deepFreeze(contribution);
}

function mapMeasurementResultToDimensionContributions(measurementResult, mapping) {
  validateLocalInputs(measurementResult, mapping);
  validateContext(measurementResult, mapping);

  const policyFingerprint = fingerprint(canonicalPolicy(mapping));
  const contributions = mapping.targets.map((target) =>
    buildCanonicalContribution(measurementResult, mapping, target, policyFingerprint)
  );

  return deepFreeze(contributions);
}

module.exports = { mapMeasurementResultToDimensionContributions };

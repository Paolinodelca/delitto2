const crypto = require("crypto");
const { validateMeasurementResult } = require("../observation/validateMeasurementResult");
const { validateMeasurementDimensionMapping } = require("./validateMeasurementDimensionMapping");
const { buildDimensionContribution } = require("./buildDimensionContribution");
const { validateDimensionContribution } = require("./validateDimensionContribution");

function stableId(parts) {
  const digest = crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 24);
  return `dimension_contribution_${digest}`;
}
function observationSourceRefs(result, mappingId) {
  const refs = [`mapping:${mappingId}`];
  for (const ref of result.observationRefs || []) {
    if (ref && typeof ref === "object" && typeof ref.id === "string" && ref.id.trim()) refs.push(`observation:${ref.id.trim()}`);
  }
  return refs;
}
function roundUnit(value) { return Math.round(value * 1e12) / 1e12; }
function mapMeasurementResultToDimensionContributions(measurementResult, mapping) {
  const resultValidation = validateMeasurementResult(measurementResult);
  if (!resultValidation.valid) {
    const error = new Error(`MeasurementResult is invalid: ${resultValidation.errors.join(" | ")}`);
    error.code = "INVALID_MEASUREMENT_RESULT";
    error.details = resultValidation;
    throw error;
  }
  const mappingValidation = validateMeasurementDimensionMapping(mapping);
  if (!mappingValidation.valid) {
    const error = new Error(`MeasurementDimensionMapping is invalid: ${mappingValidation.errors.join(" | ")}`);
    error.code = "INVALID_MEASUREMENT_DIMENSION_MAPPING";
    error.details = mappingValidation;
    throw error;
  }
  if (measurementResult.measurementId !== mapping.measurementId) {
    const error = new Error("MeasurementResult measurementId is incompatible with mapping.measurementId.");
    error.code = "INCOMPATIBLE_MEASUREMENT_MAPPING";
    throw error;
  }
  if (measurementResult.status !== "calculated") {
    const error = new Error("MeasurementResult must have status calculated to be mapped.");
    error.code = "MEASUREMENT_RESULT_NOT_APPLICABLE";
    throw error;
  }
  const magnitude = Math.abs(measurementResult.normalizedValue);
  return mapping.targets.map((target) => {
    const contribution = buildDimensionContribution({
      id: stableId([measurementResult.id, mapping.id, target.dimensionId, target.contributionType]),
      measurementId: measurementResult.measurementId,
      dimensionId: target.dimensionId,
      contributionType: target.contributionType,
      contributionValue: roundUnit(magnitude * target.weight),
      confidence: roundUnit(measurementResult.confidence * target.confidenceFactor),
      provenance: {
        measurementResultRef: measurementResult.id,
        sourceRefs: observationSourceRefs(measurementResult, mapping.id),
      },
      metadata: {
        version: "1.0",
        createdAt: measurementResult.calculatedAt,
        updatedAt: measurementResult.calculatedAt,
      },
      extensions: {
        mapping: { id: mapping.id, version: mapping.metadata.version },
        target: target.extensions,
      },
    }, { now: measurementResult.calculatedAt });
    const validation = validateDimensionContribution(contribution);
    if (!validation.valid) {
      const error = new Error(`Generated DimensionContribution is invalid: ${validation.errors.join(" | ")}`);
      error.code = "INVALID_GENERATED_DIMENSION_CONTRIBUTION";
      error.details = validation;
      throw error;
    }
    return contribution;
  });
}
module.exports={mapMeasurementResultToDimensionContributions};

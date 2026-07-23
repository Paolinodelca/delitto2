const { buildMeasurementDimensionMapping } = require("./buildMeasurementDimensionMapping");
const { mapMeasurementResultToDimensionContributions } = require("./mapMeasurementResultToDimensionContributions");
const { aggregateDimensionContributions } = require("./aggregateDimensionContributions");
const { validateDimensionKnowledgeState } = require("./validateDimensionKnowledgeState");
const { buildMeasurementResult, validateMeasurementResult } = require("../observation");

function healthDimensionAggregation() {
  try {
    const at = "2026-07-23T10:00:00.000Z";
    const result = buildMeasurementResult({
      id: "health_aggregation_result",
      measurementId: "health_aggregation_measurement",
      characteristicId: "health_signal",
      observationRefs: [{ type: "observation", id: "health_observation" }],
      normalizedValue: 0.8,
      direction: "positive",
      confidence: 0.9,
      coverage: 0.5,
      evidenceQuality: 0.8,
      sourceReliability: 0.8,
      independence: 1,
      consistency: 1,
      status: "calculated",
      calculatedAt: at,
      calculatedBy: "health",
    });
    if (!validateMeasurementResult(result).valid) throw new Error("MeasurementResult invalid.");
    const mapping = buildMeasurementDimensionMapping({
      id: "health_aggregation_mapping",
      measurementId: "health_aggregation_measurement",
      targets: [{ dimensionId: "health_dimension", contributionType: "supporting" }],
      metadata: { createdAt: at, updatedAt: at },
    }, { now: at });
    const contributions = mapMeasurementResultToDimensionContributions(result, mapping);
    const state = aggregateDimensionContributions("health_dimension", contributions, { now: at });
    const validation = validateDimensionKnowledgeState(state);
    if (!validation.valid) throw new Error(validation.errors.join(" | "));
    if (state.stateType !== "observed" || state.direction !== "supporting") throw new Error("Aggregation state invalid.");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
module.exports = { healthDimensionAggregation };

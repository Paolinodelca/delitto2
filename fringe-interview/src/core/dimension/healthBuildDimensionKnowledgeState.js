const { buildDimensionKnowledgeState } = require("./buildDimensionKnowledgeState");
const { validateDimensionKnowledgeState } = require("./validateDimensionKnowledgeState");

function healthBuildDimensionKnowledgeState() {
  try {
    const now = "2026-07-22T15:00:00.000Z";
    const input = {
      dimensionId: " decision_clarity ",
      dimensionType: "elementary",
      stateType: "observed",
      estimate: 0.72,
      direction: "supporting",
      coverage: 0.65,
      confidence: 0.74,
      consistency: 0.8,
      measurementCount: 2,
      independentMeasurementCount: 1,
      resultCount: 2,
      sourceDiversity: 1,
      contextDistribution: [{ contextId: "pressure", observationCount: 2, estimate: 0.68, coverage: 0.4 }],
      contradictions: [],
      supportingMeasurementResultRefs: ["mr_1", "mr_1", "mr_2"],
      supportingCapabilityResultRefs: [],
      metadata: { createdAt: now, updatedAt: now },
      extensions: {},
    };
    const snapshot = JSON.stringify(input);
    const observed = buildDimensionKnowledgeState(input, { now });
    if (JSON.stringify(input) !== snapshot) throw new Error("builder mutated input");
    if (observed.dimensionId !== "decision_clarity" || observed.supportingMeasurementResultRefs.length !== 2) throw new Error("normalization failed");
    if (!validateDimensionKnowledgeState(observed).valid) throw new Error("observed state invalid");

    const derived = buildDimensionKnowledgeState({
      dimensionId: "leadership", dimensionType: "derived", stateType: "derived",
      estimate: 0.7, direction: "supporting", coverage: 0.5, confidence: 0.7, consistency: 0.75,
      measurementCount: 0, independentMeasurementCount: 0, resultCount: 1, sourceDiversity: 1,
      supportingCapabilityResultRefs: ["cap_result_1"],
      derivationTrace: { method: "capability_result", sourceResultRefs: ["cap_result_1"], capabilityId: "leadership", metadata: {} },
      metadata: { createdAt: now, updatedAt: now },
    }, { now });
    if (!validateDimensionKnowledgeState(derived).valid) throw new Error("derived state invalid");

    const unknown = buildDimensionKnowledgeState({ dimensionId: "ownership", dimensionType: "elementary", stateType: "unknown" }, { now });
    if (unknown.estimate !== null || unknown.direction !== "unknown" || !validateDimensionKnowledgeState(unknown).valid) throw new Error("unknown defaults invalid");

    const invalid = { ...observed, stateType: "derived" };
    if (validateDimensionKnowledgeState(invalid).valid) throw new Error("incoherent state accepted");
    return { ok: true, name: "Dimension Knowledge State core" };
  } catch (error) {
    return { ok: false, name: "Dimension Knowledge State core", error: error.message };
  }
}

module.exports = { healthBuildDimensionKnowledgeState };

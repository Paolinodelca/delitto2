const { buildDimensionContribution } = require("./buildDimensionContribution");
const { validateDimensionContribution } = require("./validateDimensionContribution");

function healthBuildDimensionContribution() {
  try {
    const now = "2026-07-23T10:00:00.000Z";
    const input = {
      id: " contribution_001 ",
      measurementId: " measurement_001 ",
      dimensionId: " decision_clarity ",
      contributionType: "supporting",
      contributionValue: 0.72,
      confidence: 0.81,
      provenance: {
        measurementResultRef: " measurement_result_001 ",
        sourceRefs: ["source_1", "source_1", "source_2"],
      },
      extensions: { health: true },
    };
    const snapshot = JSON.stringify(input);
    const result = buildDimensionContribution(input, { now });
    if (JSON.stringify(input) !== snapshot) throw new Error("builder mutated input");
    if (result.id !== "contribution_001") throw new Error("normalization failed");
    if (result.provenance.sourceRefs.length !== 2) throw new Error("reference deduplication failed");
    const validation = validateDimensionContribution(result);
    if (!validation.valid) throw new Error(validation.errors.join(" "));
    const invalid = { ...result, contributionValue: 2 };
    if (validateDimensionContribution(invalid).valid) throw new Error("invalid contribution accepted");
    return { ok: true, name: "Dimension Contribution core" };
  } catch (error) {
    return { ok: false, name: "Dimension Contribution core", error: error.message };
  }
}

module.exports = { healthBuildDimensionContribution };

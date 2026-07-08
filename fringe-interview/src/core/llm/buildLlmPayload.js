function buildLlmPayload({
  identityPipelineResult = {},
  reasoningPipeline = {},
  reasoningSummary = {},
} = {}) {
  const representationStrategy =
    identityPipelineResult.representationStrategy || null;

  const professionalIdentityModel =
    identityPipelineResult.professionalIdentityModel || null;

  const locale =
    representationStrategy?.targetContext?.locale || "it";

  return {
    payloadStatus: "draft",

    task: {
      type: "professional_visibility_narrative",
      locale,
      outputMode: "structured_json",
    },

    inputs: {
      identitySummary: identityPipelineResult.evidenceSummary || null,
      reasoningSummary,
      representationStrategy,
      professionalIdentityModel,
    },

    constraints: {
      noInventedFacts: true,
      citeEvidenceOnly: true,
      noJudgement: true,
      noGuarantees: true,
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildLlmPayload,
};
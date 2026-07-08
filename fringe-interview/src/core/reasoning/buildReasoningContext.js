function buildReasoningContext({ identityPipelineResult = {} } = {}) {
  return {
    reasoningStatus: "draft",

    inputs: {
      evidenceSummary: identityPipelineResult.evidenceSummary || null,
      professionalIdentityModel:
        identityPipelineResult.professionalIdentityModel || null,
      representationReadiness:
        identityPipelineResult.representationReadiness || null,
      representationStrategy:
        identityPipelineResult.representationStrategy || null,
    },

    reasoningScope: {
      domain: "career",
      purpose: "professional_identity_reasoning",
      representationType:
        identityPipelineResult.representationStrategy?.representationType ||
        null,
    },

    constraints: {
      noNarrative: true,
      noLLM: true,
      noJudgement: true,
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildReasoningContext,
};
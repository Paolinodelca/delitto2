const { buildReasoningContext } = require("./buildReasoningContext");
const { validateReasoningContext } = require("./validateReasoningContext");
const {
  buildRepresentationGapReasoning,
} = require("./buildRepresentationGapReasoning");
const {
  validateRepresentationGapReasoning,
} = require("./validateRepresentationGapReasoning");

function buildReasoningPipeline({ identityPipelineResult = {} } = {}) {
  const reasoningContext = buildReasoningContext({
    identityPipelineResult,
  });

  const reasoningContextValidation =
    validateReasoningContext(reasoningContext);

  const representationGapReasoning = buildRepresentationGapReasoning({
    reasoningContext,
  });

  const representationGapReasoningValidation =
    validateRepresentationGapReasoning(representationGapReasoning);

  const status =
    reasoningContextValidation.isValid &&
    representationGapReasoningValidation.isValid
      ? "PASS"
      : "FAIL";

  return {
    reasoningStatus: "draft",

    reasoningContext,
    representationGapReasoning,

    validation: {
      reasoningContext: reasoningContextValidation,
      representationGapReasoning: representationGapReasoningValidation,
    },

    status,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildReasoningPipeline,
};
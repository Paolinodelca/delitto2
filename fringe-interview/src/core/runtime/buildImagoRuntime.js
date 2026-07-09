const {
  buildIdentityPipeline,
} = require("../identity/buildIdentityPipeline");
const {
  buildReasoningPipeline,
} = require("../reasoning/buildReasoningPipeline");
const {
  buildReasoningPipelineSummary,
} = require("../reasoning/buildReasoningPipelineSummary");
const { buildLlmPayload } = require("../llm/buildLlmPayload");
const { validateLlmPayload } = require("../llm/validateLlmPayload");
const {
  buildLlmPromptMessages,
} = require("../llm/buildLlmPromptMessages");
const {
  validateLlmPromptMessages,
} = require("../llm/validateLlmPromptMessages");

function buildImagoRuntime(inputBundle = {}, options = {}) {
  const identityPipelineResult = buildIdentityPipeline(inputBundle, options);

  const reasoningPipeline = buildReasoningPipeline({
    identityPipelineResult,
  });

  const reasoningSummary = buildReasoningPipelineSummary(reasoningPipeline);

  const llmPayload = buildLlmPayload({
    identityPipelineResult,
    reasoningPipeline,
    reasoningSummary,
  });

  const llmPayloadValidation = validateLlmPayload(llmPayload);

  const llmPromptMessages = buildLlmPromptMessages(llmPayload);
  const llmPromptMessagesValidation =
    validateLlmPromptMessages(llmPromptMessages);

  const status =
    identityPipelineResult.status === "PASS" &&
    reasoningPipeline.status === "PASS" &&
    llmPayloadValidation.isValid === true &&
    llmPromptMessagesValidation.isValid === true
      ? "PASS"
      : "FAIL";

  return {
    runtimeStatus: "draft",

    identityPipelineResult,
    reasoningPipeline,
    reasoningSummary,
    llmPayload,
    llmPromptMessages,

    validation: {
      identityPipeline: identityPipelineResult.validation || null,
      reasoningPipeline: reasoningPipeline.validation || null,
      llmPayload: llmPayloadValidation,
      llmPromptMessages: llmPromptMessagesValidation,
    },

    status,

    metadata: {
      version: "0.1",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildImagoRuntime,
};
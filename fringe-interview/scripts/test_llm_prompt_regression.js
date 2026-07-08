const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildReasoningPipeline,
} = require("../src/core/reasoning/buildReasoningPipeline");
const {
  buildReasoningPipelineSummary,
} = require("../src/core/reasoning/buildReasoningPipelineSummary");
const { buildLlmPayload } = require("../src/core/llm/buildLlmPayload");
const {
  buildLlmPromptMessages,
} = require("../src/core/llm/buildLlmPromptMessages");
const {
  validateLlmPromptMessages,
} = require("../src/core/llm/validateLlmPromptMessages");

const inputBundle = buildInputBundle({
  sources: [
    {
      id: "source_cv_1",
      type: "document",
      label: "Candidate CV",
      content: "Demo CV content",
      language: "it",
      sourceRole: "cv",
    },
    {
      id: "source_jd_1",
      type: "text",
      label: "Job Description",
      content: "Demo Job Description content",
      language: "it",
      sourceRole: "job_description",
    },
  ],

  professionalHistory: {
    experiences: [
      {
        id: "experience_1",
        role: "Operations Specialist",
      },
      {
        id: "experience_2",
        role: "Project Coordinator",
      },
    ],
    skills: [
      {
        id: "skill_1",
        name: "Process improvement",
      },
    ],
    achievements: [
      {
        id: "achievement_1",
        text: "Improved operational coordination.",
      },
    ],
    motivations: [
      {
        id: "motivation_1",
        text: "Crescere verso un ruolo più trasversale.",
      },
    ],
    targetDirections: [
      {
        id: "target_direction_1",
        role: "Operations Manager",
      },
    ],
  },

  discovery: {
    questions: [
      {
        id: "question_1",
        text: "Quale direzione professionale vuoi esplorare?",
      },
      {
        id: "question_2",
        text: "Quali esperienze vuoi rendere più visibili?",
      },
    ],
    answers: [
      {
        id: "answer_1",
        questionId: "question_1",
        text: "Vorrei crescere verso un ruolo operations più trasversale.",
      },
      {
        id: "answer_2",
        questionId: "question_2",
        text: "Vorrei valorizzare meglio il coordinamento operativo.",
      },
    ],
    status: "in_progress",
  },

  updates: [
    {
      id: "update_1",
      type: "profile_update",
      content: "Candidate added one later update.",
    },
  ],
});

const targetContext = {
  representationType: "cv",
  targetRole: "Operations Manager",
  locale: "it",
};

const identityPipelineResult = buildIdentityPipeline(inputBundle, {
  targetContext,
});

const reasoningPipeline = buildReasoningPipeline({
  identityPipelineResult,
});

const reasoningSummary = buildReasoningPipelineSummary(reasoningPipeline);

const llmPayload = buildLlmPayload({
  identityPipelineResult,
  reasoningPipeline,
  reasoningSummary,
});

const llmPromptMessages = buildLlmPromptMessages(llmPayload);
const promptValidation = validateLlmPromptMessages(llmPromptMessages);

const failures = [];

if (identityPipelineResult.status !== "PASS") {
  failures.push('Expected identityPipelineResult.status === "PASS".');
}

if (reasoningPipeline.status !== "PASS") {
  failures.push('Expected reasoningPipeline.status === "PASS".');
}

if (llmPayload.payloadStatus !== "draft") {
  failures.push('Expected llmPayload.payloadStatus === "draft".');
}

if (llmPromptMessages.promptStatus !== "draft") {
  failures.push('Expected llmPromptMessages.promptStatus === "draft".');
}

if (!promptValidation.isValid) {
  failures.push(
    `Expected LlmPromptMessages validation to be valid: ${promptValidation.errors.join(
      "; "
    )}`
  );
}

if (!Array.isArray(llmPromptMessages.messages)) {
  failures.push("Expected llmPromptMessages.messages to be an array.");
}

const systemMessage = Array.isArray(llmPromptMessages.messages)
  ? llmPromptMessages.messages.find((message) => message.role === "system")
  : null;

const userMessage = Array.isArray(llmPromptMessages.messages)
  ? llmPromptMessages.messages.find((message) => message.role === "user")
  : null;

if (!systemMessage) {
  failures.push("Expected system message.");
}

if (!userMessage) {
  failures.push("Expected user message.");
}

const systemContent = systemMessage ? systemMessage.content : "";
const normalizedSystemContent = systemContent.toLowerCase();

if (
  !normalizedSystemContent.includes("do not invent facts") &&
  !normalizedSystemContent.includes("no invented facts")
) {
  failures.push("Expected system message to contain no invented facts rule.");
}

if (
  !normalizedSystemContent.includes("do not judge") &&
  !normalizedSystemContent.includes("no judgement") &&
  !normalizedSystemContent.includes("no judgment")
) {
  failures.push("Expected system message to contain no judgement rule.");
}

if (
  !normalizedSystemContent.includes("structured json") &&
  !normalizedSystemContent.includes("structured JSON")
) {
  failures.push("Expected system message to contain structured JSON rule.");
}

if (!userMessage || !userMessage.content.includes('"llmPayload"')) {
  failures.push("Expected user message to contain serialized payload JSON.");
}

if (!llmPayload.inputs || !llmPayload.inputs.reasoningSummary) {
  failures.push("Expected payload.inputs.reasoningSummary.");
}

if (!llmPayload.inputs || !llmPayload.inputs.professionalIdentityModel) {
  failures.push("Expected payload.inputs.professionalIdentityModel.");
}

if (!llmPayload.inputs || !llmPayload.inputs.representationStrategy) {
  failures.push("Expected payload.inputs.representationStrategy.");
}

const output = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  identityStatus: identityPipelineResult.status,
  reasoningStatus: reasoningPipeline.status,
  payloadStatus: llmPayload.payloadStatus,
  promptStatus: llmPromptMessages.promptStatus,
  messageRoles: Array.isArray(llmPromptMessages.messages)
    ? llmPromptMessages.messages.map((message) => message.role)
    : [],
  promptValidation: promptValidation.isValid,
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_llm_prompt_regression PASS");
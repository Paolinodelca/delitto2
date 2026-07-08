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
    ],
    answers: [
      {
        id: "answer_1",
        questionId: "question_1",
        text: "Vorrei valorizzare meglio il coordinamento operativo.",
      },
    ],
    status: "in_progress",
  },
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

const promptMessages = buildLlmPromptMessages(llmPayload);
const validation = validateLlmPromptMessages(promptMessages);

console.log(
  JSON.stringify(
    {
      promptMessages,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (promptMessages.promptStatus !== "draft") {
  console.error('Expected promptStatus === "draft".');
  process.exit(1);
}

if (promptMessages.messages.length < 2) {
  console.error("Expected messages.length >= 2.");
  process.exit(1);
}

const systemMessage = promptMessages.messages.find(
  (message) => message.role === "system"
);

const userMessage = promptMessages.messages.find(
  (message) => message.role === "user"
);

if (!systemMessage) {
  console.error("Expected system message.");
  process.exit(1);
}

if (!userMessage) {
  console.error("Expected user message.");
  process.exit(1);
}

if (
  !systemMessage.content.includes("Do not invent facts") &&
  !systemMessage.content.includes("no invented facts")
) {
  console.error("Expected system message to contain no invented facts rule.");
  process.exit(1);
}

if (!userMessage.content.includes('"llmPayload"')) {
  console.error("Expected user message to contain JSON payload.");
  process.exit(1);
}

console.log("test_build_llm_prompt_messages PASS");
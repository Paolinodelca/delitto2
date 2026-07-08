const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

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

const outputDir = join("tmp", "llm-prompt");
const outputPath = join(outputDir, "llm_prompt_messages.json");

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

const promptMessages = buildLlmPromptMessages(llmPayload);
const validation = validateLlmPromptMessages(promptMessages);

if (!validation.isValid) {
  console.error("Expected LlmPromptMessages validation to be valid.");
  console.error(JSON.stringify(validation, null, 2));
  process.exit(1);
}

if (promptMessages.promptStatus !== "draft") {
  console.error('Expected promptStatus === "draft".');
  process.exit(1);
}

if (!Array.isArray(promptMessages.messages)) {
  console.error("Expected messages array.");
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
  console.error("Expected system content to contain anti-hallucination rule.");
  process.exit(1);
}

if (!userMessage.content.includes('"llmPayload"')) {
  console.error("Expected user content to contain payload JSON.");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(promptMessages, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      messageCount: promptMessages.messages.length,
      roles: promptMessages.messages.map((message) => message.role),
      systemMessageLength: systemMessage.content.length,
      userMessageLength: userMessage.content.length,
    },
    null,
    2
  )
);

console.log("test_llm_prompt_messages_output_snapshot PASS");
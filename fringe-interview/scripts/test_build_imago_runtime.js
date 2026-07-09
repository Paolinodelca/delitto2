const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { buildImagoRuntime } = require("../src/core/runtime/buildImagoRuntime");
const {
  validateImagoRuntime,
} = require("../src/core/runtime/validateImagoRuntime");

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

const imagoRuntime = buildImagoRuntime(inputBundle, {
  targetContext,
});

const validation = validateImagoRuntime(imagoRuntime);

console.log(
  JSON.stringify(
    {
      status: imagoRuntime.status,
      runtimeStatus: imagoRuntime.runtimeStatus,
      validation,
      llmPayloadValidation: imagoRuntime.validation.llmPayload,
      llmPromptMessagesValidation:
        imagoRuntime.validation.llmPromptMessages,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (imagoRuntime.runtimeStatus !== "draft") {
  console.error('Expected runtimeStatus === "draft".');
  process.exit(1);
}

if (imagoRuntime.status !== "PASS") {
  console.error('Expected status === "PASS".');
  process.exit(1);
}

if (!imagoRuntime.identityPipelineResult) {
  console.error("Expected identityPipelineResult.");
  process.exit(1);
}

if (!imagoRuntime.reasoningPipeline) {
  console.error("Expected reasoningPipeline.");
  process.exit(1);
}

if (!imagoRuntime.reasoningSummary) {
  console.error("Expected reasoningSummary.");
  process.exit(1);
}

if (!imagoRuntime.llmPayload) {
  console.error("Expected llmPayload.");
  process.exit(1);
}

if (!imagoRuntime.llmPromptMessages) {
  console.error("Expected llmPromptMessages.");
  process.exit(1);
}

if (imagoRuntime.validation.llmPayload.isValid !== true) {
  console.error("Expected validation.llmPayload.isValid === true.");
  process.exit(1);
}

if (imagoRuntime.validation.llmPromptMessages.isValid !== true) {
  console.error("Expected validation.llmPromptMessages.isValid === true.");
  process.exit(1);
}

console.log("test_build_imago_runtime PASS");
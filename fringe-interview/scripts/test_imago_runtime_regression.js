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

const runtime = buildImagoRuntime(inputBundle, {
  targetContext,
});

const validation = validateImagoRuntime(runtime);

const failures = [];

if (!validation.isValid) {
  failures.push(
    `Expected ImagoRuntime validation to be valid: ${validation.errors.join(
      "; "
    )}`
  );
}

if (runtime.status !== "PASS") {
  failures.push('Expected runtime.status === "PASS".');
}

if (runtime.runtimeStatus !== "draft") {
  failures.push('Expected runtime.runtimeStatus === "draft".');
}

if (
  !runtime.identityPipelineResult ||
  runtime.identityPipelineResult.status !== "PASS"
) {
  failures.push('Expected identityPipelineResult.status === "PASS".');
}

if (!runtime.reasoningPipeline || runtime.reasoningPipeline.status !== "PASS") {
  failures.push('Expected reasoningPipeline.status === "PASS".');
}

if (!runtime.reasoningSummary || runtime.reasoningSummary.status !== "PASS") {
  failures.push('Expected reasoningSummary.status === "PASS".');
}

if (!runtime.llmPayload || runtime.llmPayload.payloadStatus !== "draft") {
  failures.push('Expected llmPayload.payloadStatus === "draft".');
}

if (
  !runtime.llmPromptMessages ||
  runtime.llmPromptMessages.promptStatus !== "draft"
) {
  failures.push('Expected llmPromptMessages.promptStatus === "draft".');
}

if (
  !runtime.validation ||
  !runtime.validation.llmPayload ||
  runtime.validation.llmPayload.isValid !== true
) {
  failures.push("Expected validation.llmPayload.isValid === true.");
}

if (
  !runtime.validation ||
  !runtime.validation.llmPromptMessages ||
  runtime.validation.llmPromptMessages.isValid !== true
) {
  failures.push("Expected validation.llmPromptMessages.isValid === true.");
}

const output = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  runtimeStatus: runtime.status,
  identityStatus: runtime.identityPipelineResult
    ? runtime.identityPipelineResult.status
    : null,
  reasoningStatus: runtime.reasoningPipeline
    ? runtime.reasoningPipeline.status
    : null,
  payloadStatus: runtime.llmPayload ? runtime.llmPayload.payloadStatus : null,
  promptStatus: runtime.llmPromptMessages
    ? runtime.llmPromptMessages.promptStatus
    : null,
  coverageRatio:
    runtime.reasoningSummary &&
    runtime.reasoningSummary.reasoning
      ? runtime.reasoningSummary.reasoning.coverageRatio
      : null,
  weightedCoverageRatio:
    runtime.reasoningSummary &&
    runtime.reasoningSummary.reasoning
      ? runtime.reasoningSummary.reasoning.weightedCoverageRatio
      : null,
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_imago_runtime_regression PASS");
const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { buildImagoRuntime } = require("../src/core/runtime/buildImagoRuntime");
const {
  validateImagoRuntime,
} = require("../src/core/runtime/validateImagoRuntime");

const outputDir = join("tmp", "imago-runtime");
const outputPath = join(outputDir, "imago_runtime_result.json");

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

if (!validation.isValid) {
  console.error("Expected ImagoRuntime validation to be valid.");
  console.error(JSON.stringify(validation, null, 2));
  process.exit(1);
}

if (runtime.status !== "PASS") {
  console.error('Expected runtime.status === "PASS".');
  console.error(JSON.stringify(runtime.validation, null, 2));
  process.exit(1);
}

if (!runtime.identityPipelineResult) {
  console.error("Expected runtime.identityPipelineResult.");
  process.exit(1);
}

if (!runtime.reasoningPipeline) {
  console.error("Expected runtime.reasoningPipeline.");
  process.exit(1);
}

if (!runtime.reasoningSummary) {
  console.error("Expected runtime.reasoningSummary.");
  process.exit(1);
}

if (!runtime.llmPayload) {
  console.error("Expected runtime.llmPayload.");
  process.exit(1);
}

if (!runtime.llmPromptMessages) {
  console.error("Expected runtime.llmPromptMessages.");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(runtime, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      runtimeStatus: runtime.status,
      identityStatus: runtime.identityPipelineResult.status,
      reasoningStatus: runtime.reasoningPipeline.status,
      payloadStatus: runtime.llmPayload.payloadStatus,
      promptStatus: runtime.llmPromptMessages.promptStatus,
      representationType: runtime.reasoningSummary.representation.type,
      coverageRatio: runtime.reasoningSummary.reasoning.coverageRatio,
      weightedCoverageRatio:
        runtime.reasoningSummary.reasoning.weightedCoverageRatio,
    },
    null,
    2
  )
);

console.log("test_imago_runtime_output_snapshot PASS");
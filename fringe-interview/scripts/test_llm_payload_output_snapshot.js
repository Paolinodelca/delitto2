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
const { validateLlmPayload } = require("../src/core/llm/validateLlmPayload");

const outputDir = join("tmp", "llm-payload");
const outputPath = join(outputDir, "llm_payload.json");

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

const payload = buildLlmPayload({
  identityPipelineResult,
  reasoningPipeline,
  reasoningSummary,
});

const validation = validateLlmPayload(payload);

if (!validation.isValid) {
  console.error("Expected LlmPayload validation to be valid.");
  console.error(JSON.stringify(validation, null, 2));
  process.exit(1);
}

if (payload.payloadStatus !== "draft") {
  console.error('Expected payload.payloadStatus === "draft".');
  process.exit(1);
}

if (payload.task.type !== "professional_visibility_narrative") {
  console.error(
    'Expected payload.task.type === "professional_visibility_narrative".'
  );
  process.exit(1);
}

if (payload.task.outputMode !== "structured_json") {
  console.error('Expected payload.task.outputMode === "structured_json".');
  process.exit(1);
}

if (!payload.inputs.reasoningSummary) {
  console.error("Expected payload.inputs.reasoningSummary.");
  process.exit(1);
}

if (!payload.inputs.professionalIdentityModel) {
  console.error("Expected payload.inputs.professionalIdentityModel.");
  process.exit(1);
}

if (payload.constraints.noInventedFacts !== true) {
  console.error("Expected payload.constraints.noInventedFacts === true.");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      taskType: payload.task.type,
      locale: payload.task.locale,
      outputMode: payload.task.outputMode,
      noInventedFacts: payload.constraints.noInventedFacts,
      noJudgement: payload.constraints.noJudgement,
    },
    null,
    2
  )
);

console.log("test_llm_payload_output_snapshot PASS");
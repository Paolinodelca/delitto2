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

const validation = validateLlmPayload(llmPayload);

console.log(
  JSON.stringify(
    {
      llmPayload,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (llmPayload.payloadStatus !== "draft") {
  console.error('Expected payloadStatus === "draft".');
  process.exit(1);
}

if (llmPayload.task.type !== "professional_visibility_narrative") {
  console.error(
    'Expected task.type === "professional_visibility_narrative".'
  );
  process.exit(1);
}

if (llmPayload.task.outputMode !== "structured_json") {
  console.error('Expected task.outputMode === "structured_json".');
  process.exit(1);
}

if (llmPayload.constraints.noInventedFacts !== true) {
  console.error("Expected constraints.noInventedFacts === true.");
  process.exit(1);
}

if (!llmPayload.inputs.reasoningSummary) {
  console.error("Expected inputs.reasoningSummary.");
  process.exit(1);
}

if (!llmPayload.inputs.professionalIdentityModel) {
  console.error("Expected inputs.professionalIdentityModel.");
  process.exit(1);
}

console.log("test_build_llm_payload PASS");
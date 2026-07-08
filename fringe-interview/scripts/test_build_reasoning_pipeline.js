const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildReasoningPipeline,
} = require("../src/core/reasoning/buildReasoningPipeline");
const {
  validateReasoningPipeline,
} = require("../src/core/reasoning/validateReasoningPipeline");

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

const validation = validateReasoningPipeline(reasoningPipeline);

console.log(
  JSON.stringify(
    {
      reasoningPipeline,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (reasoningPipeline.status !== "PASS") {
  console.error('Expected status === "PASS".');
  process.exit(1);
}

if (!reasoningPipeline.reasoningContext) {
  console.error("Expected reasoningContext.");
  process.exit(1);
}

if (!reasoningPipeline.representationGapReasoning) {
  console.error("Expected representationGapReasoning.");
  process.exit(1);
}

if (reasoningPipeline.validation.reasoningContext.isValid !== true) {
  console.error("Expected validation.reasoningContext.isValid === true.");
  process.exit(1);
}

if (
  reasoningPipeline.validation.representationGapReasoning.isValid !== true
) {
  console.error(
    "Expected validation.representationGapReasoning.isValid === true."
  );
  process.exit(1);
}

console.log("test_build_reasoning_pipeline PASS");
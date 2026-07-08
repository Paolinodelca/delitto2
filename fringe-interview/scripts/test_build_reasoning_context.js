const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildReasoningContext,
} = require("../src/core/reasoning/buildReasoningContext");
const {
  validateReasoningContext,
} = require("../src/core/reasoning/validateReasoningContext");

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

const reasoningContext = buildReasoningContext({
  identityPipelineResult,
});

const validation = validateReasoningContext(reasoningContext);

console.log(
  JSON.stringify(
    {
      reasoningContext,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (reasoningContext.reasoningStatus !== "draft") {
  console.error('Expected reasoningStatus === "draft".');
  process.exit(1);
}

if (!reasoningContext.inputs.evidenceSummary) {
  console.error("Expected inputs.evidenceSummary.");
  process.exit(1);
}

if (!reasoningContext.inputs.professionalIdentityModel) {
  console.error("Expected inputs.professionalIdentityModel.");
  process.exit(1);
}

if (!reasoningContext.inputs.representationReadiness) {
  console.error("Expected inputs.representationReadiness.");
  process.exit(1);
}

if (reasoningContext.reasoningScope.domain !== "career") {
  console.error('Expected reasoningScope.domain === "career".');
  process.exit(1);
}

if (reasoningContext.constraints.noLLM !== true) {
  console.error("Expected constraints.noLLM === true.");
  process.exit(1);
}

if (reasoningContext.constraints.noNarrative !== true) {
  console.error("Expected constraints.noNarrative === true.");
  process.exit(1);
}

console.log("test_build_reasoning_context PASS");
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

const summary = buildReasoningPipelineSummary(reasoningPipeline);

console.log(JSON.stringify(summary, null, 2));

if (summary.status !== "PASS") {
  console.error('Expected summary.status === "PASS".');
  process.exit(1);
}

if (!summary.reasoningStatus) {
  console.error("Expected summary.reasoningStatus.");
  process.exit(1);
}

if (!summary.representation || typeof summary.representation !== "object") {
  console.error("Expected summary.representation object.");
  process.exit(1);
}

if (typeof summary.reasoning.gapCount !== "number") {
  console.error("Expected summary.reasoning.gapCount number.");
  process.exit(1);
}

if (typeof summary.reasoning.opportunityCount !== "number") {
  console.error("Expected summary.reasoning.opportunityCount number.");
  process.exit(1);
}

if (typeof summary.reasoning.priorityCount !== "number") {
  console.error("Expected summary.reasoning.priorityCount number.");
  process.exit(1);
}

if (typeof summary.reasoning.coverageRatio !== "number") {
  console.error("Expected summary.reasoning.coverageRatio number.");
  process.exit(1);
}

if (typeof summary.reasoning.weightedCoverageRatio !== "number") {
  console.error("Expected summary.reasoning.weightedCoverageRatio number.");
  process.exit(1);
}

console.log("test_build_reasoning_pipeline_summary PASS");
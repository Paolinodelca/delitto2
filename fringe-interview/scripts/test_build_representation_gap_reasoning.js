const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildReasoningContext,
} = require("../src/core/reasoning/buildReasoningContext");
const {
  buildRepresentationGapReasoning,
} = require("../src/core/reasoning/buildRepresentationGapReasoning");
const {
  validateRepresentationGapReasoning,
} = require("../src/core/reasoning/validateRepresentationGapReasoning");

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

const representationGapReasoning = buildRepresentationGapReasoning({
  reasoningContext,
});

const validation = validateRepresentationGapReasoning(
  representationGapReasoning
);

console.log(
  JSON.stringify(
    {
      representationGapReasoning,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (representationGapReasoning.reasoningStatus !== "draft") {
  console.error('Expected reasoningStatus === "draft".');
  process.exit(1);
}

if (typeof representationGapReasoning.readiness.canGenerate !== "boolean") {
  console.error("Expected readiness.canGenerate boolean.");
  process.exit(1);
}

if (!Array.isArray(representationGapReasoning.gaps)) {
  console.error("Expected gaps array.");
  process.exit(1);
}

if (!Array.isArray(representationGapReasoning.opportunities)) {
  console.error("Expected opportunities array.");
  process.exit(1);
}

if (!Array.isArray(representationGapReasoning.priorities)) {
  console.error("Expected priorities array.");
  process.exit(1);
}

if (!representationGapReasoning.comparisonResult) {
  console.error("Expected comparisonResult.");
  process.exit(1);
}

if (!representationGapReasoning.metrics) {
  console.error("Expected metrics.");
  process.exit(1);
}

if (typeof representationGapReasoning.metrics.coverageRatio !== "number") {
  console.error("Expected metrics.coverageRatio number.");
  process.exit(1);
}

if (
  typeof representationGapReasoning.metrics.weightedCoverageRatio !== "number"
) {
  console.error("Expected metrics.weightedCoverageRatio number.");
  process.exit(1);
}


if (representationGapReasoning.comparisonResult.policyId !== "representation_gap") {
  console.error('Expected comparisonResult.policyId === "representation_gap".');
  process.exit(1);
}

if (
  representationGapReasoning.comparisonResult.policy.policyId !==
  "representation_gap"
) {
  console.error('Expected comparisonResult.policy.policyId === "representation_gap".');
  process.exit(1);
}

if (
  typeof representationGapReasoning.comparisonResult.metrics.coverageRatio !==
  "number"
) {
  console.error("Expected comparisonResult.metrics.coverageRatio number.");
  process.exit(1);
}

if (
  representationGapReasoning.priorities.length !==
  representationGapReasoning.comparisonResult.result.missing.length
) {
  console.error("Expected priorities.length to match comparisonResult.result.missing.length.");
  process.exit(1);
}

if (
  representationGapReasoning.opportunities.length !==
  representationGapReasoning.comparisonResult.result.matched.length
) {
  console.error("Expected opportunities.length to match comparisonResult.result.matched.length.");
  process.exit(1);
}

if (representationGapReasoning.constraints.noLLM !== true) {
  console.error("Expected constraints.noLLM === true.");
  process.exit(1);
}

console.log("test_build_representation_gap_reasoning PASS");
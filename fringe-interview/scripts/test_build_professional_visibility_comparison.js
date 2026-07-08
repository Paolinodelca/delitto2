const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildProfessionalVisibilityComparison,
} = require("../src/core/reasoning/buildProfessionalVisibilityComparison");
const {
  validateProfessionalVisibilityComparison,
} = require("../src/core/reasoning/validateProfessionalVisibilityComparison");

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

const identityPipelineResult = buildIdentityPipeline(inputBundle);

const professionalVisibilityComparison =
  buildProfessionalVisibilityComparison({
    professionalIdentityModel:
      identityPipelineResult.professionalIdentityModel,
  });

const validation = validateProfessionalVisibilityComparison(
  professionalVisibilityComparison
);

console.log(
  JSON.stringify(
    {
      professionalVisibilityComparison,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (professionalVisibilityComparison.visibilityStatus !== "draft") {
  console.error('Expected visibilityStatus === "draft".');
  process.exit(1);
}

if (!professionalVisibilityComparison.comparisonResult) {
  console.error("Expected comparisonResult.");
  process.exit(1);
}

if (
  professionalVisibilityComparison.comparisonResult.policyId !==
  "representation_gap"
) {
  console.error('Expected comparisonResult.policyId === "representation_gap".');
  process.exit(1);
}

if (
  typeof professionalVisibilityComparison.visibilityMetrics.coverageRatio !==
  "number"
) {
  console.error("Expected visibilityMetrics.coverageRatio number.");
  process.exit(1);
}

if (
  typeof professionalVisibilityComparison.visibilityMetrics
    .weightedCoverageRatio !== "number"
) {
  console.error("Expected visibilityMetrics.weightedCoverageRatio number.");
  process.exit(1);
}

if (professionalVisibilityComparison.targetAreas.length === 0) {
  console.error("Expected targetAreas.length > 0.");
  process.exit(1);
}

console.log("test_build_professional_visibility_comparison PASS");
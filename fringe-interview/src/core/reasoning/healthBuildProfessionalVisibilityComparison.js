const { buildInputBundle } = require("../input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../identity/buildIdentityPipeline");
const {
  buildProfessionalVisibilityComparison,
} = require("./buildProfessionalVisibilityComparison");
const {
  validateProfessionalVisibilityComparison,
} = require("./validateProfessionalVisibilityComparison");

function healthBuildProfessionalVisibilityComparison() {
  const inputBundle = buildInputBundle({
    sources: [
      {
        id: "source_cv_demo",
        type: "document",
        label: "Demo CV",
        content: "Demo CV content",
        language: "it",
        sourceRole: "cv",
      },
      {
        id: "source_jd_demo",
        type: "text",
        label: "Demo Job Description",
        content: "Demo Job Description content",
        language: "it",
        sourceRole: "job_description",
      },
    ],

    professionalHistory: {
      experiences: [
        {
          id: "experience_demo",
          role: "Operations Specialist",
        },
      ],
      skills: [
        {
          id: "skill_demo",
          name: "Process improvement",
        },
      ],
      motivations: [
        {
          id: "motivation_demo",
          text: "Crescere verso un ruolo più trasversale.",
        },
      ],
      targetDirections: [
        {
          id: "target_direction_demo",
          role: "Operations Manager",
        },
      ],
    },

    discovery: {
      questions: [
        {
          id: "question_demo",
          text: "Quale direzione professionale vuoi esplorare?",
        },
      ],
      answers: [
        {
          id: "answer_demo",
          questionId: "question_demo",
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

  return {
    module: "Professional Visibility Comparison",
    status: validation.isValid ? "PASS" : "FAIL",
    visibilityMetrics: professionalVisibilityComparison.visibilityMetrics,
    validation,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildProfessionalVisibilityComparison,
};
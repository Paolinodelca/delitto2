const { buildInputBundle } = require("../input/buildInputBundle");
const { buildIdentityPipeline } = require("./buildIdentityPipeline");
const {
  validateRepresentationReadiness,
} = require("./validateRepresentationReadiness");

function healthBuildRepresentationReadiness() {
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
          text: "Vorrei crescere verso un ruolo operations più trasversale.",
        },
      ],
      status: "in_progress",
    },
  });

  const pipeline = buildIdentityPipeline(inputBundle);
  const representationReadiness = pipeline.representationReadiness;

  const validation = representationReadiness
    ? validateRepresentationReadiness(representationReadiness)
    : {
        isValid: false,
        errors: ["representationReadiness is missing."],
      };

  return {
    module: "Representation Readiness",
    status: validation.isValid ? "PASS" : "FAIL",
    canGenerate: representationReadiness
      ? representationReadiness.canGenerate
      : {},
    blockerCount: representationReadiness
      ? representationReadiness.blockers.length
      : 0,
    warningCount: representationReadiness
      ? representationReadiness.warnings.length
      : 0,
    validation,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildRepresentationReadiness,
};
const { buildInputBundle } = require("../input/buildInputBundle");
const { buildIdentityPipeline } = require("../identity/buildIdentityPipeline");

function healthBuildRepresentationStrategyPipeline() {
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
      achievements: [
        {
          id: "achievement_demo",
          text: "Improved operational coordination.",
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

  const pipeline = buildIdentityPipeline(inputBundle, {
    targetContext: {
      representationType: "cv",
      targetRole: "Operations Manager",
      locale: "it",
    },
  });

  const strategy = pipeline.representationStrategy;
  const validation = pipeline.validation.representationStrategy;

  const isValid =
    pipeline.status === "PASS" &&
    strategy &&
    validation &&
    validation.isValid === true;

  return {
    module: "Representation Strategy Pipeline",
    status: isValid ? "PASS" : "FAIL",
    representationType: strategy ? strategy.representationType : null,
    canGenerate: strategy ? strategy.readiness.canGenerate : false,
    requiredEvidenceAreaCount: strategy
      ? strategy.requiredEvidenceAreas.length
      : 0,
    recommendedFocusAreaCount: strategy
      ? strategy.recommendedFocusAreas.length
      : 0,
    validation: validation || {
      isValid: false,
      errors: ["representationStrategy validation is missing."],
    },
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildRepresentationStrategyPipeline,
};
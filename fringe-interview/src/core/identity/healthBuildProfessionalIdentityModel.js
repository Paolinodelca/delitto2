const { buildInputBundle } = require("../input/buildInputBundle");
const { buildIdentityPipeline } = require("./buildIdentityPipeline");
const {
  validateProfessionalIdentityModel,
} = require("./validateProfessionalIdentityModel");

function healthBuildProfessionalIdentityModel() {
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
  const professionalIdentityModel = pipeline.professionalIdentityModel;

  const validation = professionalIdentityModel
    ? validateProfessionalIdentityModel(professionalIdentityModel)
    : {
        isValid: false,
        errors: ["professionalIdentityModel is missing."],
      };

  return {
    module: "Professional Identity Model",
    status: validation.isValid ? "PASS" : "FAIL",
    readiness: professionalIdentityModel
      ? professionalIdentityModel.readiness
      : {},
    technicalProfile: professionalIdentityModel
      ? professionalIdentityModel.technicalProfile
      : {},
    validation,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildProfessionalIdentityModel,
};
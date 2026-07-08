const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildProfessionalIdentityModel,
} = require("../src/core/identity/buildProfessionalIdentityModel");
const {
  validateProfessionalIdentityModel,
} = require("../src/core/identity/validateProfessionalIdentityModel");

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
        role: "Product Operations Manager",
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
        text: "Vorrei valorizzare meglio il coordinamento cross-funzionale.",
      },
    ],
    status: "in_progress",
  },
});

const pipeline = buildIdentityPipeline(inputBundle);

const professionalIdentityModel = buildProfessionalIdentityModel({
  professionalIdentityDraft: pipeline.professionalIdentityDraft,
});

const validation = validateProfessionalIdentityModel(professionalIdentityModel);

const summary = {
  validation,
  modelStatus: professionalIdentityModel.modelStatus,
  technicalProfile: professionalIdentityModel.technicalProfile,
  readiness: professionalIdentityModel.readiness,
};

console.log(JSON.stringify(summary, null, 2));

if (!validation.isValid) {
  process.exit(1);
}

if (professionalIdentityModel.modelStatus !== "draft") {
  console.error('Expected modelStatus === "draft".');
  process.exit(1);
}

if (
  !professionalIdentityModel.technicalProfile ||
  typeof professionalIdentityModel.technicalProfile !== "object"
) {
  console.error("Expected technicalProfile object.");
  process.exit(1);
}

if (
  !professionalIdentityModel.readiness ||
  typeof professionalIdentityModel.readiness !== "object"
) {
  console.error("Expected readiness object.");
  process.exit(1);
}

if (typeof professionalIdentityModel.readiness.canGenerateNarrative !== "boolean") {
  console.error("Expected readiness.canGenerateNarrative boolean.");
  process.exit(1);
}

if (typeof professionalIdentityModel.readiness.canGenerateCV !== "boolean") {
  console.error("Expected readiness.canGenerateCV boolean.");
  process.exit(1);
}

if (typeof professionalIdentityModel.readiness.needsMoreEvidence !== "boolean") {
  console.error("Expected readiness.needsMoreEvidence boolean.");
  process.exit(1);
}

console.log("test_build_professional_identity_model PASS");
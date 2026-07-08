const { buildInputSource } = require("../src/core/input/buildInputSource");
const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildIdentityPipelineSummary,
} = require("../src/core/identity/buildIdentityPipelineSummary");

const cvSource = buildInputSource({
  id: "source_cv_1",
  type: "document",
  label: "Candidate CV",
  content: "Demo CV content",
  language: "it",
  sourceRole: "cv",
});

const jobDescriptionSource = buildInputSource({
  id: "source_jd_1",
  type: "text",
  label: "Job Description",
  content: "Demo Job Description content",
  language: "it",
  sourceRole: "job_description",
});

const inputBundle = buildInputBundle({
  sources: [cvSource, jobDescriptionSource],

  professionalHistory: {
    experiences: [
      {
        id: "experience_1",
        role: "Operations Specialist",
      },
      {
        id: "experience_2",
        role: "Project Coordinator",
      },
    ],
    education: [
      {
        id: "education_1",
        title: "Business Administration",
      },
    ],
    skills: [
      {
        id: "skill_1",
        name: "Process improvement",
      },
      {
        id: "skill_2",
        name: "Stakeholder coordination",
      },
    ],
    achievements: [
      {
        id: "achievement_1",
        text: "Riduzione dei tempi di coordinamento operativo.",
      },
    ],
    motivations: [
      {
        id: "motivation_1",
        text: "Crescere verso un ruolo più trasversale.",
      },
    ],
    preferences: [
      {
        id: "preference_1",
        text: "Preferenza per contesti cross-funzionali.",
      },
    ],
    constraints: [
      {
        id: "constraint_1",
        text: "Disponibilità geografica limitata.",
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
      {
        id: "question_2",
        text: "Quali esperienze vuoi rendere più visibili?",
      },
    ],
    answers: [
      {
        id: "answer_1",
        questionId: "question_1",
        text: "Vorrei crescere verso un ruolo operations più trasversale.",
      },
      {
        id: "answer_2",
        questionId: "question_2",
        text: "Vorrei valorizzare meglio il coordinamento cross-funzionale.",
      },
    ],
    status: "in_progress",
  },

  updates: [
    {
      id: "update_1",
      type: "profile_update",
      content: "Candidate added a later profile update.",
    },
  ],
});

const pipeline = buildIdentityPipeline(inputBundle);
const summary = buildIdentityPipelineSummary(pipeline);

const evidenceStore = pipeline.evidenceStore;
const evidenceSummary = pipeline.evidenceSummary;
const professionalIdentityDraft = pipeline.professionalIdentityDraft;
const professionalIdentityModel = pipeline.professionalIdentityModel;

const failures = [];

if (pipeline.status !== "PASS") {
  failures.push('Expected pipeline.status === "PASS".');
}

if (evidenceStore.evidence.length <= 0) {
  failures.push("Expected evidenceStore.evidence.length > 0.");
}

if (evidenceSummary.totalEvidence !== evidenceStore.evidence.length) {
  failures.push(
    "Expected evidenceSummary.totalEvidence to match evidenceStore.evidence.length."
  );
}

if (professionalIdentityDraft.identityStatus !== "draft") {
  failures.push('Expected professionalIdentityDraft.identityStatus === "draft".');
}

if (
  !professionalIdentityDraft.coverage ||
  typeof professionalIdentityDraft.coverage !== "object"
) {
  failures.push("Expected professionalIdentityDraft.coverage object.");
}

if (typeof professionalIdentityDraft.confidence.evidenceCoverage !== "number") {
  failures.push(
    "Expected professionalIdentityDraft.confidence.evidenceCoverage number."
  );
}

if (!professionalIdentityModel) {
  failures.push("Expected professionalIdentityModel.");
}

if (!pipeline.validation.professionalIdentityModel.isValid) {
  failures.push("Expected ProfessionalIdentityModel validation to be valid.");
}

if (summary.status !== "PASS") {
  failures.push('Expected summary.status === "PASS".');
}

if (summary.evidence.total !== evidenceSummary.totalEvidence) {
  failures.push(
    "Expected summary.evidence.total to match evidenceSummary.totalEvidence."
  );
}

if (!Array.isArray(summary.identity.populatedAreas)) {
  failures.push("Expected summary.identity.populatedAreas array.");
}

if (!Array.isArray(summary.identity.missingAreas)) {
  failures.push("Expected summary.identity.missingAreas array.");
}

if (!summary.model || typeof summary.model !== "object") {
  failures.push("Expected summary.model object.");
}

if (!summary.model.readiness || typeof summary.model.readiness !== "object") {
  failures.push("Expected summary.model.readiness object.");
}

if (
  !summary.model.technicalProfile ||
  typeof summary.model.technicalProfile !== "object"
) {
  failures.push("Expected summary.model.technicalProfile object.");
}

const output = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  evidenceCount: evidenceStore.evidence.length,
  evidenceCoverage: professionalIdentityDraft.confidence.evidenceCoverage,
  modelStatus: professionalIdentityModel
    ? professionalIdentityModel.modelStatus
    : null,
  populatedAreas: professionalIdentityDraft.coverage
    ? professionalIdentityDraft.coverage.populatedAreas
    : [],
  missingAreas: professionalIdentityDraft.coverage
    ? professionalIdentityDraft.coverage.missingAreas
    : [],
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_identity_core_regression PASS");
const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");

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

const result = buildIdentityPipeline(inputBundle, {
  targetContext: {
    representationType: "cv",
    targetRole: "Operations Manager",
    locale: "it",
  },
});
const draft = result.professionalIdentityDraft;
const model = result.professionalIdentityModel;

const summary = {
  status: result.status,
  evidenceCount: result.evidenceStore.evidence.length,
  evidenceSummaryTotal: result.evidenceSummary.totalEvidence,
  identityStatus: draft.identityStatus,
  modelStatus: model && model.modelStatus,
  coverage: draft.coverage,
  evidenceCoverage: draft.confidence.evidenceCoverage,
  validation: {
    inputBundle: result.validation.inputBundle.isValid,
    evidenceStore: result.validation.evidenceStore.isValid,
    professionalIdentityDraft:
      result.validation.professionalIdentityDraft.isValid,
    professionalIdentityModel:
      result.validation.professionalIdentityModel.isValid,
  },
};

console.log(JSON.stringify(summary, null, 2));

if (result.status !== "PASS") {
  console.error("Expected status === PASS.");
  process.exit(1);
}

if (result.evidenceStore.evidence.length <= 0) {
  console.error("Expected evidenceStore.evidence.length > 0.");
  process.exit(1);
}

if (
  result.evidenceSummary.totalEvidence !== result.evidenceStore.evidence.length
) {
  console.error(
    "Expected evidenceSummary.totalEvidence to match evidenceStore.evidence.length."
  );
  process.exit(1);
}

if (draft.identityStatus !== "draft") {
  console.error('Expected professionalIdentityDraft.identityStatus === "draft".');
  process.exit(1);
}

if (!result.professionalIdentityModel) {
  console.error("Expected professionalIdentityModel.");
  process.exit(1);
}

if (!result.validation.professionalIdentityModel.isValid) {
  console.error("Expected ProfessionalIdentityModel validation to be valid.");
  process.exit(1);
}

if (!result.representationReadiness) {
  console.error("Expected representationReadiness.");
  process.exit(1);
}

if (!result.validation.representationReadiness.isValid) {
  console.error("Expected RepresentationReadiness validation to be valid.");
  process.exit(1);
}


if (!draft.coverage || typeof draft.coverage !== "object") {
  console.error("Expected professionalIdentityDraft.coverage object.");
  process.exit(1);
}

if (!Array.isArray(draft.coverage.populatedAreas)) {
  console.error("Expected coverage.populatedAreas array.");
  process.exit(1);
}

if (!Array.isArray(draft.coverage.missingAreas)) {
  console.error("Expected coverage.missingAreas array.");
  process.exit(1);
}

if (typeof draft.confidence.evidenceCoverage !== "number") {
  console.error("Expected confidence.evidenceCoverage number.");
  process.exit(1);
}

if (!Array.isArray(draft.gaps)) {
  console.error("Expected gaps array.");
  process.exit(1);
}

if (!result.validation.inputBundle.isValid) {
  console.error("Expected InputBundle validation to be valid.");
  process.exit(1);
}

if (!result.validation.evidenceStore.isValid) {
  console.error("Expected EvidenceStore validation to be valid.");
  process.exit(1);
}

if (!result.validation.professionalIdentityDraft.isValid) {
  console.error("Expected ProfessionalIdentityDraft validation to be valid.");
  process.exit(1);
}

if (!result.representationStrategy) {
  console.error("Expected representationStrategy.");
  process.exit(1);
}

if (!result.validation.representationStrategy.isValid) {
  console.error("Expected RepresentationStrategy validation to be valid.");
  process.exit(1);
}

if (result.representationStrategy.representationType !== "cv") {
  console.error('Expected representationStrategy.representationType === "cv".');
  process.exit(1);
}

console.log("test_build_identity_pipeline PASS");
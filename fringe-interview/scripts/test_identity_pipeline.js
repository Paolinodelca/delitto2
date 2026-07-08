const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { validateInputBundle } = require("../src/core/input/validateInputBundle");
const { buildEvidenceStore } = require("../src/core/evidence/buildEvidenceStore");
const {
  validateEvidenceStore,
} = require("../src/core/evidence/validateEvidenceStore");
const {
  buildEvidenceSummary,
} = require("../src/core/evidence/buildEvidenceSummary");
const {
  buildProfessionalIdentityDraft,
} = require("../src/core/identity/buildProfessionalIdentityDraft");
const {
  validateProfessionalIdentityDraft,
} = require("../src/core/identity/validateProfessionalIdentityDraft");

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

const inputBundleValidation = validateInputBundle(inputBundle);

const evidenceStore = buildEvidenceStore(inputBundle);
const evidenceStoreValidation = validateEvidenceStore(evidenceStore);

const evidenceSummary = buildEvidenceSummary(evidenceStore);

const professionalIdentityDraft = buildProfessionalIdentityDraft({
  evidenceStore,
  evidenceSummary,
});

const professionalIdentityDraftValidation = validateProfessionalIdentityDraft(
  professionalIdentityDraft
);

const summary = {
  inputBundle: {
    isValid: inputBundleValidation.isValid,
    sourceCount: inputBundle.sources.length,
  },
  evidenceStore: {
    isValid: evidenceStoreValidation.isValid,
    evidenceCount: evidenceStore.evidence.length,
    statistics: evidenceStore.statistics,
  },
  evidenceSummary: {
    totalEvidence: evidenceSummary.totalEvidence,
    byType: evidenceSummary.byType,
    bySourceRole: evidenceSummary.bySourceRole,
    byExtractedBy: evidenceSummary.byExtractedBy,
  },
  professionalIdentityDraft: {
    isValid: professionalIdentityDraftValidation.isValid,
    identityStatus: professionalIdentityDraft.identityStatus,
    observedAreas: {
      experiences:
        professionalIdentityDraft.observedAreas.experiences.length,
      skills: professionalIdentityDraft.observedAreas.skills.length,
      motivations:
        professionalIdentityDraft.observedAreas.motivations.length,
      targetDirections:
        professionalIdentityDraft.observedAreas.targetDirections.length,
      discovery:
        professionalIdentityDraft.observedAreas.discovery.length,
      sources: professionalIdentityDraft.observedAreas.sources.length,
    },
  },
};

let failed = false;

if (!inputBundleValidation.isValid) {
  console.error("FAIL: InputBundle validation failed.");
  console.error(JSON.stringify(inputBundleValidation.errors, null, 2));
  failed = true;
}

if (!evidenceStoreValidation.isValid) {
  console.error("FAIL: EvidenceStore validation failed.");
  console.error(JSON.stringify(evidenceStoreValidation.errors, null, 2));
  failed = true;
}

if (!professionalIdentityDraftValidation.isValid) {
  console.error("FAIL: ProfessionalIdentityDraft validation failed.");
  console.error(
    JSON.stringify(professionalIdentityDraftValidation.errors, null, 2)
  );
  failed = true;
}

if (evidenceStore.evidence.length <= 0) {
  console.error("FAIL: Expected evidenceStore.evidence.length > 0.");
  failed = true;
}

if (evidenceSummary.totalEvidence !== evidenceStore.evidence.length) {
  console.error(
    "FAIL: Expected evidenceSummary.totalEvidence to match evidenceStore.evidence.length."
  );
  failed = true;
}

if (professionalIdentityDraft.identityStatus !== "draft") {
  console.error('FAIL: Expected identityStatus === "draft".');
  failed = true;
}

if (professionalIdentityDraft.observedAreas.experiences.length !== 1) {
  console.error("FAIL: Expected observedAreas.experiences.length === 1.");
  failed = true;
}

if (professionalIdentityDraft.observedAreas.skills.length !== 1) {
  console.error("FAIL: Expected observedAreas.skills.length === 1.");
  failed = true;
}

if (professionalIdentityDraft.observedAreas.motivations.length !== 1) {
  console.error("FAIL: Expected observedAreas.motivations.length === 1.");
  failed = true;
}

if (professionalIdentityDraft.observedAreas.targetDirections.length !== 1) {
  console.error("FAIL: Expected observedAreas.targetDirections.length === 1.");
  failed = true;
}

if (professionalIdentityDraft.observedAreas.discovery.length !== 1) {
  console.error("FAIL: Expected observedAreas.discovery.length === 1.");
  failed = true;
}

console.log(JSON.stringify(summary, null, 2));

if (failed) {
  console.error("FAIL");
  process.exit(1);
}

console.log("PASS");
console.log("test_identity_pipeline PASS");
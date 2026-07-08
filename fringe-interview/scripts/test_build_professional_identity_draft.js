const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { buildEvidenceStore } = require("../src/core/evidence/buildEvidenceStore");
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
        text: "Vorrei crescere verso un ruolo operations più trasversale.",
      },
    ],
    status: "in_progress",
  },
});

const evidenceStore = buildEvidenceStore(inputBundle);
const evidenceSummary = buildEvidenceSummary(evidenceStore);

const draft = buildProfessionalIdentityDraft({
  evidenceStore,
  evidenceSummary,
});

const validation = validateProfessionalIdentityDraft(draft);

console.log(
  JSON.stringify(
    {
      draft,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (draft.identityStatus !== "draft") {
  console.error('Expected identityStatus === "draft".');
  process.exit(1);
}

if (draft.observedAreas.experiences.length !== 1) {
  console.error("Expected observedAreas.experiences.length === 1.");
  process.exit(1);
}

if (draft.observedAreas.skills.length !== 1) {
  console.error("Expected observedAreas.skills.length === 1.");
  process.exit(1);
}

if (draft.observedAreas.discovery.length !== 1) {
  console.error("Expected observedAreas.discovery.length === 1.");
  process.exit(1);
}

if (draft.evidenceSummary.totalEvidence !== evidenceStore.evidence.length) {
  console.error("Expected evidenceSummary.totalEvidence to match evidence length.");
  process.exit(1);
}

if (!draft.coverage || typeof draft.coverage !== "object") {
  console.error("Expected coverage object.");
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

if (!Array.isArray(draft.gaps) || draft.gaps.length === 0) {
  console.error("Expected gaps for missing areas.");
  process.exit(1);
}

const hasMissingAreaGap = draft.gaps.some(
  (gap) => gap.type === "missing_observed_area" && gap.area
);

if (!hasMissingAreaGap) {
  console.error("Expected gaps to contain missing observed areas.");
  process.exit(1);
}

console.log("test_build_professional_identity_draft PASS");
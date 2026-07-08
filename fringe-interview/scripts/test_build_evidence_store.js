const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { buildEvidenceStore } = require("../src/core/evidence/buildEvidenceStore");
const {
  validateEvidenceStore,
} = require("../src/core/evidence/validateEvidenceStore");



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
      content: "Demo JD content",
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
        text: "Vorrei crescere verso ruoli operations più trasversali.",
      },
    ],
    status: "in_progress",
  },

  updates: [
  {
    id: "update_1",
    type: "new_note",
    content: "Candidate added one later update.",
  },
],

});

const evidenceStore = buildEvidenceStore(inputBundle);
const validation = validateEvidenceStore(evidenceStore);

const invalidEvidenceStore = {
  ...evidenceStore,
  evidence: evidenceStore.evidence.map((evidence, index) =>
    index === 0
      ? {
          ...evidence,
          sourceId: null,
        }
      : evidence
  ),
};

const invalidValidation = validateEvidenceStore(invalidEvidenceStore);

const legacyStore = buildEvidenceStore([
  {
    id: "legacy_source",
    type: "text",
    content: "Legacy source content",
  },
]);

const legacyValidation = validateEvidenceStore(legacyStore);

console.log(
  JSON.stringify(
    {
      evidenceStore,
      validation,
      invalidValidation,
      legacyStore,
      legacyValidation,
    },
    null,
    2
  )
);

if (evidenceStore.statistics.sourceCount !== 2) {
  console.error("Expected sourceCount === 2");
  process.exit(1);
}

if (evidenceStore.statistics.totalEvidence !== 6) {
  console.error("Expected totalEvidence === 6");
  process.exit(1);
}

if (evidenceStore.evidence.length !== 6) {
  console.error("Expected evidence.length === 6");
  process.exit(1);
}

if (evidenceStore.metadata.inputBundleVersion !== "1.0") {
  console.error('Expected metadata.inputBundleVersion === "1.0"');
  process.exit(1);
}

if (!validation.isValid || !legacyValidation.isValid) {
  process.exit(1);
}

if (invalidValidation.isValid) {
  console.error("Expected invalid EvidenceStore validation to fail.");
  process.exit(1);
}

const hasIndexedSourceIdError = invalidValidation.errors.some(
  (error) => error.includes("evidence[0]") && error.includes("sourceId")
);

if (!hasIndexedSourceIdError) {
  console.error("Expected validation error to reference evidence[0] and sourceId.");
  process.exit(1);
}

console.log("test_build_evidence_store PASS");
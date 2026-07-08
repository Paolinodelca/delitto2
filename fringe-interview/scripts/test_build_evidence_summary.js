const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { buildEvidenceStore } = require("../src/core/evidence/buildEvidenceStore");
const {
  buildEvidenceSummary,
} = require("../src/core/evidence/buildEvidenceSummary");

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
        text: "Vorrei crescere verso un ruolo più trasversale.",
      },
    ],
    status: "in_progress",
  },
});

const evidenceStore = buildEvidenceStore(inputBundle);
const evidenceSummary = buildEvidenceSummary(evidenceStore);

console.log(JSON.stringify({ evidenceSummary }, null, 2));

if (evidenceSummary.totalEvidence !== 4) {
  console.error("Expected totalEvidence === 4.");
  process.exit(1);
}

if (!evidenceSummary.byType || typeof evidenceSummary.byType !== "object") {
  console.error("Expected byType object.");
  process.exit(1);
}

if (
  !evidenceSummary.bySourceRole ||
  typeof evidenceSummary.bySourceRole !== "object"
) {
  console.error("Expected bySourceRole object.");
  process.exit(1);
}

if (
  !evidenceSummary.byExtractedBy ||
  typeof evidenceSummary.byExtractedBy !== "object"
) {
  console.error("Expected byExtractedBy object.");
  process.exit(1);
}

if (!Array.isArray(evidenceSummary.sourceIds)) {
  console.error("Expected sourceIds array.");
  process.exit(1);
}

console.log("test_build_evidence_summary PASS");
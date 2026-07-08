const {
  extractBasicEvidenceFromSource,
} = require("../src/core/evidence/extractBasicEvidenceFromSource");
const { validateEvidence } = require("../src/core/evidence/validateEvidence");

const sourceWithContent = {
  id: "source_cv_1",
  type: "document",
  label: "Candidate CV",
  content: "Demo CV content",
  language: "it",
  sourceRole: "cv",
};

const sourceWithoutContent = {
  id: "source_empty_1",
  type: "text",
  label: "Empty source",
  sourceRole: "notes",
};

const evidenceWithContent = extractBasicEvidenceFromSource(sourceWithContent);
const evidenceWithoutContent =
  extractBasicEvidenceFromSource(sourceWithoutContent);

const evidenceValidation =
  evidenceWithContent.length > 0
    ? validateEvidence(evidenceWithContent[0])
    : { isValid: false, errors: ["Missing evidence."] };

console.log(
  JSON.stringify(
    {
      evidenceWithContent,
      evidenceWithoutContent,
      evidenceValidation,
    },
    null,
    2
  )
);

if (evidenceWithContent.length !== 1) {
  console.error("Expected source with content to produce 1 evidence.");
  process.exit(1);
}

if (evidenceWithoutContent.length !== 0) {
  console.error("Expected source without content to produce 0 evidence.");
  process.exit(1);
}

if (evidenceWithContent[0].sourceId !== sourceWithContent.id) {
  console.error("Expected evidence sourceId to match source id.");
  process.exit(1);
}

if (evidenceWithContent[0].content !== sourceWithContent.content) {
  console.error("Expected evidence content to match source content.");
  process.exit(1);
}

if (!evidenceValidation.isValid) {
  console.error("Expected extracted evidence to be valid.");
  process.exit(1);
}

console.log("test_extract_basic_evidence_from_source PASS");
const { buildEvidence } = require("../src/core/evidence/buildEvidence");
const { validateEvidence } = require("../src/core/evidence/validateEvidence");

const validEvidence = buildEvidence({
  id: "evidence_test_1",
  type: "source_content",
  description: "Candidate CV",
  content: "Demo evidence content",
  sourceId: "source_cv_1",
  sourceType: "document",
  sourceRole: "cv",
  confidence: null,
  extractedBy: "basic_extractor",
});

const validValidation = validateEvidence(validEvidence);

const invalidEvidence = buildEvidence({
  id: "",
  type: "",
  content: null,
  sourceId: null,
  extractedBy: null,
});

const invalidValidation = validateEvidence(invalidEvidence);

console.log(
  JSON.stringify(
    {
      validEvidence,
      validValidation,
      invalidEvidence,
      invalidValidation,
    },
    null,
    2
  )
);

if (!validValidation.isValid) {
  console.error("Expected validEvidence to be valid.");
  process.exit(1);
}

if (invalidValidation.isValid) {
  console.error("Expected invalidEvidence to be invalid.");
  process.exit(1);
}

console.log("test_build_evidence PASS");
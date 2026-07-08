const { buildInputSource } = require("../src/core/input/buildInputSource");
const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { validateInputBundle } = require("../src/core/input/validateInputBundle");
const { buildEvidenceStore } = require("../src/core/evidence/buildEvidenceStore");
const {
  validateEvidenceStore,
} = require("../src/core/evidence/validateEvidenceStore");

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
  discovery: {
    questions: [],
    answers: [],
    status: "not_started",
  },
});

const inputBundleValidation = validateInputBundle(inputBundle);

const evidenceStore = buildEvidenceStore(inputBundle);
const evidenceStoreValidation = validateEvidenceStore(evidenceStore);

const summary = {
  inputBundle: {
    isValid: inputBundleValidation.isValid,
    sourceCount: inputBundle.sources.length,
  },
  evidenceStore: {
    isValid: evidenceStoreValidation.isValid,
    sourceCount: evidenceStore.sources.length,
    evidenceCount: evidenceStore.evidence.length,
    statistics: evidenceStore.statistics,
  },
  evidence: evidenceStore.evidence.map((evidence) => ({
    id: evidence.id,
    type: evidence.type,
    sourceId: evidence.sourceId,
    sourceRole: evidence.sourceRole,
    hasContent: Boolean(evidence.content),
  })),
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

if (inputBundle.sources.length !== 2) {
  console.error("FAIL: Expected inputBundle.sources.length === 2.");
  failed = true;
}

if (evidenceStore.sources.length !== 2) {
  console.error("FAIL: Expected evidenceStore.sources.length === 2.");
  failed = true;
}

if (evidenceStore.evidence.length !== 2) {
  console.error("FAIL: Expected evidenceStore.evidence.length === 2.");
  failed = true;
}

if (evidenceStore.statistics.sourceCount !== 2) {
  console.error("FAIL: Expected evidenceStore.statistics.sourceCount === 2.");
  failed = true;
}

if (evidenceStore.statistics.totalEvidence !== 2) {
  console.error("FAIL: Expected evidenceStore.statistics.totalEvidence === 2.");
  failed = true;
}

evidenceStore.evidence.forEach((evidence, index) => {
  if (!evidence.sourceId) {
    console.error(`FAIL: Expected evidence[${index}].sourceId.`);
    failed = true;
  }

  if (!evidence.content) {
    console.error(`FAIL: Expected evidence[${index}].content.`);
    failed = true;
  }
});

console.log(JSON.stringify(summary, null, 2));

if (failed) {
  console.error("FAIL");
  process.exit(1);
}

console.log("PASS");
console.log("test_intake_evidence_pipeline PASS");
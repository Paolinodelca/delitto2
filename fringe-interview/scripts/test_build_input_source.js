const { buildInputSource } = require("../src/core/input/buildInputSource");
const { validateInputSource } = require("../src/core/input/validateInputSource");

const cvSource = buildInputSource({
  id: "source_cv_1",
  type: "document",
  label: "Candidate CV",
  content: "Demo CV content",
  language: "it",
  sourceRole: "cv",
  quality: {
    completeness: "partial",
    reliability: "self_reported",
    freshness: "recent",
  },
  provenance: {
    origin: "upload",
    providedBy: "candidate",
    collectedAt: new Date().toISOString(),
  },
});

const jobDescriptionSource = buildInputSource({
  id: "source_jd_1",
  type: "text",
  label: "Job Description",
  content: "Demo Job Description content",
  language: "it",
  sourceRole: "job_description",
  quality: {
    completeness: "partial",
    reliability: "provided_by_company",
    freshness: "recent",
  },
  provenance: {
    origin: "manual_input",
    providedBy: "user",
    collectedAt: new Date().toISOString(),
  },
});

const cvValidation = validateInputSource(cvSource);
const jobDescriptionValidation = validateInputSource(jobDescriptionSource);

console.log(
  JSON.stringify(
    {
      cvSource,
      cvValidation,
      jobDescriptionSource,
      jobDescriptionValidation,
    },
    null,
    2
  )
);

if (!cvValidation.isValid || !jobDescriptionValidation.isValid) {
  process.exit(1);
}

console.log("test_build_input_source PASS");
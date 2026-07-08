const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildIdentityPipelineSummary,
} = require("../src/core/identity/buildIdentityPipelineSummary");

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

const pipelineResult = buildIdentityPipeline(inputBundle, {
  targetContext: {
    representationType: "cv",
    targetRole: "Operations Manager",
    locale: "it",
  },
});

const summary = buildIdentityPipelineSummary(pipelineResult);

console.log(JSON.stringify(summary, null, 2));

if (summary.status !== "PASS") {
  console.error('Expected summary.status === "PASS".');
  process.exit(1);
}

if (summary.evidence.total <= 0) {
  console.error("Expected summary.evidence.total > 0.");
  process.exit(1);
}

if (typeof summary.identity.evidenceCoverage !== "number") {
  console.error("Expected summary.identity.evidenceCoverage to be a number.");
  process.exit(1);
}

if (!Array.isArray(summary.identity.populatedAreas)) {
  console.error("Expected summary.identity.populatedAreas to be an array.");
  process.exit(1);
}

if (!Array.isArray(summary.identity.missingAreas)) {
  console.error("Expected summary.identity.missingAreas to be an array.");
  process.exit(1);
}

if (!Array.isArray(summary.identity.gaps)) {
  console.error("Expected summary.identity.gaps to be an array.");
  process.exit(1);
}

if (!summary.model || typeof summary.model !== "object") {
  console.error("Expected summary.model object.");
  process.exit(1);
}

if (!summary.model.readiness || typeof summary.model.readiness !== "object") {
  console.error("Expected summary.model.readiness object.");
  process.exit(1);
}



if (
  !summary.model.technicalProfile ||
  typeof summary.model.technicalProfile !== "object"
) {
  console.error("Expected summary.model.technicalProfile object.");
  process.exit(1);
}

if (!summary.representation || typeof summary.representation !== "object") {
  console.error("Expected summary.representation object.");
  process.exit(1);
}

if (
  !summary.representation.canGenerate ||
  typeof summary.representation.canGenerate !== "object"
) {
  console.error("Expected summary.representation.canGenerate object.");
  process.exit(1);
}

if (!Array.isArray(summary.representation.blockers)) {
  console.error("Expected summary.representation.blockers array.");
  process.exit(1);
}

if (!Array.isArray(summary.representation.warnings)) {
  console.error("Expected summary.representation.warnings array.");
  process.exit(1);
}

if (!summary.strategy || typeof summary.strategy !== "object") {
  console.error("Expected summary.strategy object.");
  process.exit(1);
}

if (summary.strategy.representationType !== "cv") {
  console.error('Expected summary.strategy.representationType === "cv".');
  process.exit(1);
}

console.log("test_build_identity_pipeline_summary PASS");
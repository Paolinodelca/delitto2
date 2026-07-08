const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildRepresentationReadiness,
} = require("../src/core/identity/buildRepresentationReadiness");
const {
  validateRepresentationReadiness,
} = require("../src/core/identity/validateRepresentationReadiness");

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

const pipeline = buildIdentityPipeline(inputBundle);

const representationReadiness = buildRepresentationReadiness({
  professionalIdentityModel: pipeline.professionalIdentityModel,
});

const validation = validateRepresentationReadiness(representationReadiness);

console.log(
  JSON.stringify(
    {
      representationReadiness,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (representationReadiness.status !== "draft") {
  console.error('Expected status === "draft".');
  process.exit(1);
}

if (typeof representationReadiness.canGenerate.narrative !== "boolean") {
  console.error("Expected canGenerate.narrative boolean.");
  process.exit(1);
}

if (typeof representationReadiness.canGenerate.cv !== "boolean") {
  console.error("Expected canGenerate.cv boolean.");
  process.exit(1);
}

if (!Array.isArray(representationReadiness.blockers)) {
  console.error("Expected blockers array.");
  process.exit(1);
}

if (!Array.isArray(representationReadiness.warnings)) {
  console.error("Expected warnings array.");
  process.exit(1);
}

if (typeof representationReadiness.evidenceCoverage !== "number") {
  console.error("Expected evidenceCoverage number.");
  process.exit(1);
}

console.log("test_build_representation_readiness PASS");
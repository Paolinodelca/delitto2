const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildRepresentationStrategy,
} = require("../src/core/representation/buildRepresentationStrategy");
const {
  validateRepresentationStrategy,
} = require("../src/core/representation/validateRepresentationStrategy");

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
    achievements: [
      {
        id: "achievement_1",
        text: "Riduzione dei tempi di coordinamento operativo.",
      },
    ],
    targetDirections: [
      {
        id: "target_direction_1",
        role: "Operations Manager",
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
        text: "Vorrei valorizzare meglio il coordinamento operativo.",
      },
    ],
    status: "in_progress",
  },
});

const pipeline = buildIdentityPipeline(inputBundle);

const strategy = buildRepresentationStrategy({
  professionalIdentityModel: pipeline.professionalIdentityModel,
  representationReadiness: pipeline.representationReadiness,
  targetContext: {
    representationType: "cv",
    targetRole: "Operations Manager",
    locale: "it",
  },
});

const validation = validateRepresentationStrategy(strategy);

console.log(
  JSON.stringify(
    {
      strategy,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

if (strategy.strategyStatus !== "draft") {
  console.error('Expected strategyStatus === "draft".');
  process.exit(1);
}

if (strategy.representationType !== "cv") {
  console.error('Expected representationType === "cv".');
  process.exit(1);
}

if (typeof strategy.readiness.canGenerate !== "boolean") {
  console.error("Expected readiness.canGenerate boolean.");
  process.exit(1);
}

if (strategy.requiredEvidenceAreas.length === 0) {
  console.error("Expected requiredEvidenceAreas.length > 0.");
  process.exit(1);
}

if (!Array.isArray(strategy.recommendedFocusAreas)) {
  console.error("Expected recommendedFocusAreas array.");
  process.exit(1);
}

if (!strategy.technicalProfile) {
  console.error("Expected technicalProfile.");
  process.exit(1);
}

console.log("test_build_representation_strategy PASS");
const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildIdentityPipelineSummary,
} = require("../src/core/identity/buildIdentityPipelineSummary");

const outputDir = join("tmp", "identity-pipeline");
const outputPath = join(outputDir, "identity_pipeline_result.json");

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
      {
        id: "experience_2",
        role: "Project Coordinator",
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
      {
        id: "question_2",
        text: "Quali esperienze vuoi rendere più visibili?",
      },
    ],
    answers: [
      {
        id: "answer_1",
        questionId: "question_1",
        text: "Vorrei crescere verso un ruolo operations più trasversale.",
      },
      {
        id: "answer_2",
        questionId: "question_2",
        text: "Vorrei valorizzare meglio il coordinamento cross-funzionale.",
      },
    ],
    status: "in_progress",
  },
});

const pipeline = buildIdentityPipeline(inputBundle);
const summary = buildIdentityPipelineSummary(pipeline);

const professionalIdentityModel = pipeline.professionalIdentityModel;
const representationReadiness = pipeline.representationReadiness;

if (pipeline.status !== "PASS") {
  console.error("Expected pipeline.status === PASS.");
  console.error(JSON.stringify(pipeline.validation, null, 2));
  process.exit(1);
}

if (
  !pipeline.professionalIdentityDraft.coverage ||
  typeof pipeline.professionalIdentityDraft.coverage !== "object"
) {
  console.error("Expected professionalIdentityDraft.coverage object.");
  process.exit(1);
}

if (
  typeof pipeline.professionalIdentityDraft.confidence.evidenceCoverage !==
  "number"
) {
  console.error(
    "Expected professionalIdentityDraft.confidence.evidenceCoverage number."
  );
  process.exit(1);
}

if (!professionalIdentityModel) {
  console.error("Expected professionalIdentityModel.");
  process.exit(1);
}

if (professionalIdentityModel.modelStatus !== "draft") {
  console.error('Expected professionalIdentityModel.modelStatus === "draft".');
  process.exit(1);
}

if (
  !professionalIdentityModel.readiness ||
  typeof professionalIdentityModel.readiness !== "object"
) {
  console.error("Expected professionalIdentityModel.readiness object.");
  process.exit(1);
}

if (
  !professionalIdentityModel.technicalProfile ||
  typeof professionalIdentityModel.technicalProfile !== "object"
) {
  console.error("Expected professionalIdentityModel.technicalProfile object.");
  process.exit(1);
}

if (
  typeof professionalIdentityModel.readiness.canGenerateNarrative !== "boolean"
) {
  console.error(
    "Expected professionalIdentityModel.readiness.canGenerateNarrative boolean."
  );
  process.exit(1);
}

if (typeof professionalIdentityModel.readiness.canGenerateCV !== "boolean") {
  console.error(
    "Expected professionalIdentityModel.readiness.canGenerateCV boolean."
  );
  process.exit(1);
}

if (!representationReadiness) {
  console.error("Expected representationReadiness.");
  process.exit(1);
}

if (
  !representationReadiness.canGenerate ||
  typeof representationReadiness.canGenerate !== "object"
) {
  console.error("Expected representationReadiness.canGenerate object.");
  process.exit(1);
}

if (!Array.isArray(representationReadiness.blockers)) {
  console.error("Expected representationReadiness.blockers array.");
  process.exit(1);
}

if (!Array.isArray(representationReadiness.warnings)) {
  console.error("Expected representationReadiness.warnings array.");
  process.exit(1);
}

if (!summary.representation || typeof summary.representation !== "object") {
  console.error("Expected summary.representation object.");
  process.exit(1);
}

const snapshot = {
  ...pipeline,
  summary,
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      evidenceCount: pipeline.evidenceStore.evidence.length,
      populatedAreas:
        pipeline.professionalIdentityDraft.coverage.populatedAreas,
      missingAreas: pipeline.professionalIdentityDraft.coverage.missingAreas,
      evidenceCoverage:
        pipeline.professionalIdentityDraft.confidence.evidenceCoverage,
      modelStatus: professionalIdentityModel.modelStatus,
      canGenerateNarrative:
        representationReadiness.canGenerate.narrative,
      canGenerateCV: representationReadiness.canGenerate.cv,
      needsMoreEvidence: professionalIdentityModel.readiness.needsMoreEvidence,
      blockerCount: representationReadiness.blockers.length,
      warningCount: representationReadiness.warnings.length,
    },
    null,
    2
  )
);

console.log("test_identity_pipeline_output_snapshot PASS");
const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildReasoningPipeline,
} = require("../src/core/reasoning/buildReasoningPipeline");
const {
  buildReasoningPipelineSummary,
} = require("../src/core/reasoning/buildReasoningPipelineSummary");

const outputDir = join("tmp", "reasoning-pipeline");
const outputPath = join(outputDir, "reasoning_pipeline_result.json");

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
        text: "Improved operational coordination.",
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
        text: "Vorrei valorizzare meglio il coordinamento operativo.",
      },
    ],
    status: "in_progress",
  },

  updates: [
    {
      id: "update_1",
      type: "profile_update",
      content: "Candidate added one later update.",
    },
  ],
});

const targetContext = {
  representationType: "cv",
  targetRole: "Operations Manager",
  locale: "it",
};

const identityPipelineResult = buildIdentityPipeline(inputBundle, {
  targetContext,
});

const reasoningPipeline = buildReasoningPipeline({
  identityPipelineResult,
});

const reasoningSummary = buildReasoningPipelineSummary(reasoningPipeline);

const representationGapReasoning =
  reasoningPipeline.representationGapReasoning;

const comparisonResult =
  representationGapReasoning && representationGapReasoning.comparisonResult;

const metrics = representationGapReasoning && representationGapReasoning.metrics;

if (identityPipelineResult.status !== "PASS") {
  console.error("Expected identityPipelineResult.status === PASS.");
  console.error(JSON.stringify(identityPipelineResult.validation, null, 2));
  process.exit(1);
}

if (reasoningPipeline.status !== "PASS") {
  console.error("Expected reasoningPipeline.status === PASS.");
  console.error(JSON.stringify(reasoningPipeline.validation, null, 2));
  process.exit(1);
}

if (reasoningSummary.status !== "PASS") {
  console.error("Expected reasoningSummary.status === PASS.");
  process.exit(1);
}

if (!comparisonResult) {
  console.error("Expected comparisonResult.");
  process.exit(1);
}

if (
  !comparisonResult.result ||
  !Array.isArray(comparisonResult.result.matched)
) {
  console.error("Expected comparisonResult.result.matched array.");
  process.exit(1);
}

if (
  !comparisonResult.result ||
  !Array.isArray(comparisonResult.result.missing)
) {
  console.error("Expected comparisonResult.result.missing array.");
  process.exit(1);
}

if (
  !comparisonResult.metrics ||
  typeof comparisonResult.metrics.coverageRatio !== "number"
) {
  console.error("Expected comparisonResult.metrics.coverageRatio number.");
  process.exit(1);
}

if (
  !comparisonResult.metrics ||
  typeof comparisonResult.metrics.weightedCoverageRatio !== "number"
) {
  console.error("Expected comparisonResult.metrics.weightedCoverageRatio number.");
  process.exit(1);
}

if (comparisonResult.policyId !== "representation_gap") {
  console.error('Expected comparisonResult.policyId === "representation_gap".');
  process.exit(1);
}

if (
  !comparisonResult.policy ||
  comparisonResult.policy.policyId !== "representation_gap"
) {
  console.error(
    'Expected comparisonResult.policy.policyId === "representation_gap".'
  );
  process.exit(1);
}

if (!metrics) {
  console.error("Expected representationGapReasoning.metrics.");
  process.exit(1);
}

if (typeof metrics.coverageRatio !== "number") {
  console.error("Expected metrics.coverageRatio number.");
  process.exit(1);
}

if (typeof metrics.weightedCoverageRatio !== "number") {
  console.error("Expected metrics.weightedCoverageRatio number.");
  process.exit(1);
}

if (typeof metrics.matchedCount !== "number") {
  console.error("Expected metrics.matchedCount number.");
  process.exit(1);
}

if (typeof metrics.missingCount !== "number") {
  console.error("Expected metrics.missingCount number.");
  process.exit(1);
}

if (typeof reasoningSummary.reasoning.coverageRatio !== "number") {
  console.error("Expected reasoningSummary.reasoning.coverageRatio number.");
  process.exit(1);
}

if (typeof reasoningSummary.reasoning.weightedCoverageRatio !== "number") {
  console.error(
    "Expected reasoningSummary.reasoning.weightedCoverageRatio number."
  );
  process.exit(1);
}

const snapshot = {
  identityPipelineResult,
  reasoningPipeline,
  reasoningSummary,
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      representationType: reasoningSummary.representation.type,
      canGenerate: reasoningSummary.representation.canGenerate,
      comparisonPolicy: comparisonResult.policyId,
      coverageRatio: metrics.coverageRatio,
      weightedCoverageRatio: metrics.weightedCoverageRatio,
      matchedCount: metrics.matchedCount,
      missingCount: metrics.missingCount,
      priorityCount: metrics.priorityCount,
      opportunityCount: metrics.opportunityCount,
    },
    null,
    2
  )
);

console.log("test_reasoning_pipeline_output_snapshot PASS");
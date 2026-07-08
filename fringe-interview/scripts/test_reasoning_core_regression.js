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

const failures = [];

if (identityPipelineResult.status !== "PASS") {
  failures.push('Expected identityPipelineResult.status === "PASS".');
}

if (reasoningPipeline.status !== "PASS") {
  failures.push('Expected reasoningPipeline.status === "PASS".');
}

if (!reasoningPipeline.reasoningContext) {
  failures.push("Expected reasoningPipeline.reasoningContext.");
}

if (!reasoningPipeline.representationGapReasoning) {
  failures.push("Expected reasoningPipeline.representationGapReasoning.");
}

if (!reasoningPipeline.representationGapReasoning.comparisonResult) {
  failures.push("Expected representationGapReasoning.comparisonResult.");
}

if (
  reasoningPipeline.representationGapReasoning.comparisonResult &&
  typeof reasoningPipeline.representationGapReasoning.comparisonResult.metrics
    .coverageRatio !== "number"
) {
  failures.push(
    "Expected representationGapReasoning.comparisonResult.metrics.coverageRatio number."
  );
}

if (
  reasoningPipeline.representationGapReasoning.comparisonResult &&
  reasoningPipeline.representationGapReasoning.priorities.length !==
    reasoningPipeline.representationGapReasoning.comparisonResult.result.missing
      .length
) {
  failures.push(
    "Expected priorities.length to match comparisonResult.result.missing.length."
  );
}

if (
  reasoningPipeline.representationGapReasoning.comparisonResult &&
  reasoningPipeline.representationGapReasoning.opportunities.length !==
    reasoningPipeline.representationGapReasoning.comparisonResult.result.matched
      .length
) {
  failures.push(
    "Expected opportunities.length to match comparisonResult.result.matched.length."
  );
}


if (reasoningSummary.status !== "PASS") {
  failures.push('Expected reasoningSummary.status === "PASS".');
}

if (!reasoningSummary.representation) {
  failures.push("Expected reasoningSummary.representation.");
}

if (!reasoningSummary.reasoning) {
  failures.push("Expected reasoningSummary.reasoning.");
}

if (
  !reasoningSummary.reasoning ||
  typeof reasoningSummary.reasoning.gapCount !== "number"
) {
  failures.push("Expected reasoningSummary.reasoning.gapCount number.");
}

if (
  !reasoningSummary.reasoning ||
  typeof reasoningSummary.reasoning.opportunityCount !== "number"
) {
  failures.push("Expected reasoningSummary.reasoning.opportunityCount number.");
}

if (
  !reasoningSummary.reasoning ||
  typeof reasoningSummary.reasoning.priorityCount !== "number"
) {
  failures.push("Expected reasoningSummary.reasoning.priorityCount number.");
}

if (
  !reasoningSummary.reasoning ||
  typeof reasoningSummary.reasoning.coverageRatio !== "number"
) {
  failures.push("Expected reasoningSummary.reasoning.coverageRatio number.");
}

if (
  !reasoningSummary.reasoning ||
  typeof reasoningSummary.reasoning.weightedCoverageRatio !== "number"
) {
  failures.push(
    "Expected reasoningSummary.reasoning.weightedCoverageRatio number."
  );
}

const output = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  representationType: reasoningSummary.representation
    ? reasoningSummary.representation.type
    : null,
  canGenerate: reasoningSummary.representation
    ? reasoningSummary.representation.canGenerate
    : false,
  gapCount: reasoningSummary.reasoning
    ? reasoningSummary.reasoning.gapCount
    : 0,
  
  coverageRatio: reasoningSummary.reasoning
  ? reasoningSummary.reasoning.coverageRatio
  : 0,
  weightedCoverageRatio: reasoningSummary.reasoning
  ? reasoningSummary.reasoning.weightedCoverageRatio
   : 0,

  opportunityCount: reasoningSummary.reasoning
    ? reasoningSummary.reasoning.opportunityCount
    : 0,
  priorityCount: reasoningSummary.reasoning
    ? reasoningSummary.reasoning.priorityCount
    : 0,
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_reasoning_core_regression PASS");
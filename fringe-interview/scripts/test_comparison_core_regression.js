const {
  buildComparisonPolicy,
} = require("../src/core/comparison/buildComparisonPolicy");
const {
  validateComparisonPolicy,
} = require("../src/core/comparison/validateComparisonPolicy");
const {
  buildComparisonResult,
} = require("../src/core/comparison/buildComparisonResult");
const {
  validateComparisonResult,
} = require("../src/core/comparison/validateComparisonResult");

const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const {
  buildIdentityPipeline,
} = require("../src/core/identity/buildIdentityPipeline");
const {
  buildReasoningPipeline,
} = require("../src/core/reasoning/buildReasoningPipeline");

const failures = [];

const observed = ["experiences", "skills", "motivations"];
const reference = [
  "experiences",
  "skills",
  "achievements",
  "targetDirections",
];

const policy = buildComparisonPolicy("representation_gap");
const policyValidation = validateComparisonPolicy(policy);

if (!policyValidation.isValid) {
  failures.push(
    `Expected policy to be valid: ${policyValidation.errors.join("; ")}`
  );
}

const comparisonResult = buildComparisonResult({
  observed,
  reference,
  policy,
});

const comparisonValidation = validateComparisonResult(comparisonResult);

if (!comparisonValidation.isValid) {
  failures.push(
    `Expected comparisonResult to be valid: ${comparisonValidation.errors.join(
      "; "
    )}`
  );
}

if (comparisonResult.policyId !== "representation_gap") {
  failures.push('Expected comparisonResult.policyId === "representation_gap".');
}

if (comparisonResult.metrics.matchedCount !== 2) {
  failures.push("Expected matchedCount === 2.");
}

if (comparisonResult.metrics.missingCount !== 2) {
  failures.push("Expected missingCount === 2.");
}

if (comparisonResult.metrics.unexpectedCount !== 1) {
  failures.push("Expected unexpectedCount === 1.");
}

if (comparisonResult.metrics.coverageRatio !== 0.5) {
  failures.push("Expected coverageRatio === 0.5.");
}

if (typeof comparisonResult.metrics.weightedCoverageRatio !== "number") {
  failures.push("Expected weightedCoverageRatio number.");
}

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
        text: "Improved operational coordination.",
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

const representationGapReasoning =
  reasoningPipeline.representationGapReasoning || null;

const reasoningComparisonResult = representationGapReasoning
  ? representationGapReasoning.comparisonResult
  : null;

const reasoningMetrics = representationGapReasoning
  ? representationGapReasoning.metrics
  : null;

if (reasoningPipeline.status !== "PASS") {
  failures.push('Expected reasoningPipeline.status === "PASS".');
}

if (!reasoningComparisonResult) {
  failures.push("Expected representationGapReasoning.comparisonResult.");
}

if (!reasoningMetrics) {
  failures.push("Expected representationGapReasoning.metrics.");
}

if (reasoningMetrics && typeof reasoningMetrics.coverageRatio !== "number") {
  failures.push("Expected reasoning metrics.coverageRatio number.");
}

if (
  reasoningMetrics &&
  typeof reasoningMetrics.weightedCoverageRatio !== "number"
) {
  failures.push("Expected reasoning metrics.weightedCoverageRatio number.");
}

const output = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  policyId: comparisonResult.policyId,
  coverageRatio: comparisonResult.metrics.coverageRatio,
  weightedCoverageRatio: comparisonResult.metrics.weightedCoverageRatio,
  matchedCount: comparisonResult.metrics.matchedCount,
  missingCount: comparisonResult.metrics.missingCount,
  priorityCount: reasoningMetrics ? reasoningMetrics.priorityCount : null,
  opportunityCount: reasoningMetrics ? reasoningMetrics.opportunityCount : null,
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_comparison_core_regression PASS");
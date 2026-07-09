const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { buildImagoRuntime } = require("../src/core/runtime/buildImagoRuntime");

const outputDir = join("tmp", "fringe-imago-runtime");
const runtimeOutputPath = join(outputDir, "imago_runtime_result.json");
const comparisonNotesPath = join(outputDir, "comparison_notes.json");
const comparisonSummaryPath = join(outputDir, "comparison_summary.json");

const inputBundle = buildInputBundle({
  sources: [
    {
      id: "source_cv_fringe_demo",
      type: "document",
      label: "FRINGE Demo CV",
      content:
        "Candidate has experience in operations coordination, process improvement, stakeholder management and cross-functional delivery.",
      language: "it",
      sourceRole: "cv",
    },
    {
      id: "source_jd_fringe_demo",
      type: "text",
      label: "FRINGE Demo Job Description",
      content:
        "The target role is Operations Manager with responsibility for process coordination, stakeholder alignment, delivery tracking and operational improvement.",
      language: "it",
      sourceRole: "job_description",
    },
  ],

  professionalHistory: {
    experiences: [
      {
        id: "experience_1",
        role: "Operations Specialist",
        description:
          "Coordinamento operativo tra funzioni, monitoraggio attività e miglioramento processi.",
      },
      {
        id: "experience_2",
        role: "Project Coordinator",
        description:
          "Supporto a progetti cross-funzionali e allineamento tra stakeholder.",
      },
    ],
    skills: [
      {
        id: "skill_1",
        name: "Process improvement",
      },
      {
        id: "skill_2",
        name: "Stakeholder coordination",
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
        text: "Crescere verso un ruolo operations più trasversale.",
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
        text: "Vorrei orientarmi verso ruoli operations con maggiore coordinamento.",
      },
      {
        id: "answer_2",
        questionId: "question_2",
        text: "Vorrei rendere più visibili i progetti cross-funzionali e il lavoro sugli stakeholder.",
      },
    ],
    status: "in_progress",
  },

  updates: [
    {
      id: "update_1",
      type: "profile_update",
      content: "Candidate added one FRINGE-like runtime update.",
    },
  ],
});

const targetContext = {
  representationType: "cv",
  targetRole: "Operations Manager",
  locale: "it",
};

const runtime = buildImagoRuntime(inputBundle, {
  targetContext,
});

if (runtime.status !== "PASS") {
  console.error('Expected runtime.status === "PASS".');
  console.error(JSON.stringify(runtime.validation, null, 2));
  process.exit(1);
}

const professionalIdentityDraft =
  runtime.identityPipelineResult.professionalIdentityDraft;

const reasoningSummary = runtime.reasoningSummary;

const sources = runtime.identityPipelineResult.inputBundle.sources;
const professionalHistory =
  runtime.identityPipelineResult.inputBundle.professionalHistory;
const discovery = runtime.identityPipelineResult.inputBundle.discovery;

const hasCvSource = sources.some((source) => source.sourceRole === "cv");
const hasJobDescriptionSource = sources.some(
  (source) => source.sourceRole === "job_description"
);

const canProceedToLLMPayload =
  runtime.status === "PASS" &&
  runtime.llmPayload.payloadStatus === "draft" &&
  runtime.llmPromptMessages.promptStatus === "draft";

const comparisonNotes = {
  runtimeStatus: runtime.status,
  sourceCount: runtime.identityPipelineResult.evidenceStore.sources.length,
  populatedAreas: professionalIdentityDraft.coverage.populatedAreas,
  missingAreas: professionalIdentityDraft.coverage.missingAreas,
  coverageRatio: reasoningSummary.reasoning.coverageRatio,
  weightedCoverageRatio: reasoningSummary.reasoning.weightedCoverageRatio,
  representationType: reasoningSummary.representation.type,
  payloadStatus: runtime.llmPayload.payloadStatus,
  promptStatus: runtime.llmPromptMessages.promptStatus,
};

const comparisonSummary = {
  status: runtime.status,

  representationType: reasoningSummary.representation.type,

  input: {
    sourceCount: sources.length,
    hasCvSource,
    hasJobDescriptionSource,
    professionalHistoryExperienceCount: Array.isArray(
      professionalHistory.experiences
    )
      ? professionalHistory.experiences.length
      : 0,
    discoveryAnswerCount: Array.isArray(discovery.answers)
      ? discovery.answers.length
      : 0,
  },

  identity: {
    populatedAreas: professionalIdentityDraft.coverage.populatedAreas,
    missingAreas: professionalIdentityDraft.coverage.missingAreas,
  },

  reasoning: {
    coverageRatio: reasoningSummary.reasoning.coverageRatio,
    weightedCoverageRatio: reasoningSummary.reasoning.weightedCoverageRatio,
    priorityCount: reasoningSummary.reasoning.priorityCount,
    opportunityCount: reasoningSummary.reasoning.opportunityCount,
  },

  llmPreparation: {
    payloadStatus: runtime.llmPayload.payloadStatus,
    promptStatus: runtime.llmPromptMessages.promptStatus,
    messageCount: Array.isArray(runtime.llmPromptMessages.messages)
      ? runtime.llmPromptMessages.messages.length
      : 0,
  },

  verdict: {
    canProceedToLLMPayload,
    canProceedToReportIntegration: false,
  },
};

mkdirSync(outputDir, { recursive: true });

writeFileSync(runtimeOutputPath, JSON.stringify(runtime, null, 2), "utf8");
writeFileSync(
  comparisonNotesPath,
  JSON.stringify(comparisonNotes, null, 2),
  "utf8"
);
writeFileSync(
  comparisonSummaryPath,
  JSON.stringify(comparisonSummary, null, 2),
  "utf8"
);

console.log(
  JSON.stringify(
    {
      runtimeOutputPath,
      comparisonNotesPath,
      comparisonSummaryPath,
      comparisonSummary,
    },
    null,
    2
  )
);

console.log("test_fringe_imago_runtime_parallel_snapshot PASS");
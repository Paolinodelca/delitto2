const { buildInputBundle } = require("../input/buildInputBundle");
const { buildIdentityPipeline } = require("../identity/buildIdentityPipeline");
const { buildReasoningPipeline } = require("./buildReasoningPipeline");

function healthBuildReasoningPipeline() {
  const inputBundle = buildInputBundle({
    sources: [
      {
        id: "source_cv_demo",
        type: "document",
        label: "Demo CV",
        content: "Demo CV content",
        language: "it",
        sourceRole: "cv",
      },
      {
        id: "source_jd_demo",
        type: "text",
        label: "Demo Job Description",
        content: "Demo Job Description content",
        language: "it",
        sourceRole: "job_description",
      },
    ],
    professionalHistory: {
      experiences: [
        {
          id: "experience_demo",
          role: "Operations Specialist",
        },
      ],
      skills: [
        {
          id: "skill_demo",
          name: "Process improvement",
        },
      ],
      achievements: [
        {
          id: "achievement_demo",
          text: "Improved operational coordination.",
        },
      ],
      targetDirections: [
        {
          id: "target_direction_demo",
          role: "Operations Manager",
        },
      ],
    },
    discovery: {
      questions: [
        {
          id: "question_demo",
          text: "Quale direzione professionale vuoi esplorare?",
        },
      ],
      answers: [
        {
          id: "answer_demo",
          questionId: "question_demo",
          text: "Vorrei valorizzare meglio il coordinamento operativo.",
        },
      ],
      status: "in_progress",
    },
  });

  const identityPipelineResult = buildIdentityPipeline(inputBundle, {
    targetContext: {
      representationType: "cv",
      targetRole: "Operations Manager",
      locale: "it",
    },
  });

  const reasoningPipeline = buildReasoningPipeline({
    identityPipelineResult,
  });

  const representationGapReasoning =
    reasoningPipeline.representationGapReasoning || {};

  return {
    module: "Reasoning Pipeline",
    status: reasoningPipeline.status === "PASS" ? "PASS" : "FAIL",
    reasoningStatus: reasoningPipeline.reasoningStatus,
    gapCount: Array.isArray(representationGapReasoning.gaps)
      ? representationGapReasoning.gaps.length
      : 0,
    opportunityCount: Array.isArray(representationGapReasoning.opportunities)
      ? representationGapReasoning.opportunities.length
      : 0,
    priorityCount: Array.isArray(representationGapReasoning.priorities)
      ? representationGapReasoning.priorities.length
      : 0,
    validation: reasoningPipeline.validation,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildReasoningPipeline,
};
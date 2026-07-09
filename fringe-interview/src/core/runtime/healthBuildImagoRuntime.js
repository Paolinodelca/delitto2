const { buildInputBundle } = require("../input/buildInputBundle");
const { buildImagoRuntime } = require("./buildImagoRuntime");
const { validateImagoRuntime } = require("./validateImagoRuntime");

function healthBuildImagoRuntime() {
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
      motivations: [
        {
          id: "motivation_demo",
          text: "Crescere verso un ruolo più trasversale.",
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

    updates: [
      {
        id: "update_demo",
        type: "profile_update",
        content: "Candidate added one later update.",
      },
    ],
  });

  const imagoRuntime = buildImagoRuntime(inputBundle, {
    targetContext: {
      representationType: "cv",
      targetRole: "Operations Manager",
      locale: "it",
    },
  });

  const validation = validateImagoRuntime(imagoRuntime);

  const status =
    validation.isValid === true && imagoRuntime.status === "PASS"
      ? "PASS"
      : "FAIL";

  return {
    module: "IMAGO Runtime",
    status,
    runtimeStatus: imagoRuntime.runtimeStatus,
    identityStatus: imagoRuntime.identityPipelineResult
      ? imagoRuntime.identityPipelineResult.status
      : null,
    reasoningStatus: imagoRuntime.reasoningPipeline
      ? imagoRuntime.reasoningPipeline.status
      : null,
    payloadStatus: imagoRuntime.llmPayload
      ? imagoRuntime.llmPayload.payloadStatus
      : null,
    promptStatus: imagoRuntime.llmPromptMessages
      ? imagoRuntime.llmPromptMessages.promptStatus
      : null,
    validation,
    metadata: {
      version: "0.1",
      createdAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  healthBuildImagoRuntime,
};
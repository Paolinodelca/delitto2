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
const { buildLlmPayload } = require("../src/core/llm/buildLlmPayload");
const { validateLlmPayload } = require("../src/core/llm/validateLlmPayload");

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

const payload = buildLlmPayload({
  identityPipelineResult,
  reasoningPipeline,
  reasoningSummary,
});

const validation = validateLlmPayload(payload);

const failures = [];

if (!validation.isValid) {
  failures.push(`Expected LlmPayload validation to be valid: ${validation.errors.join("; ")}`);
}

if (!payload.payloadStatus) {
  failures.push("Missing payloadStatus.");
}

if (!payload.task || !payload.task.type) {
  failures.push("Missing task.type.");
}

if (!payload.task || !payload.task.locale) {
  failures.push("Missing task.locale.");
}

if (!payload.task || !payload.task.outputMode) {
  failures.push("Missing task.outputMode.");
}

if (!payload.inputs || !payload.inputs.identitySummary) {
  failures.push("Missing inputs.identitySummary.");
}

if (!payload.inputs || !payload.inputs.reasoningSummary) {
  failures.push("Missing inputs.reasoningSummary.");
}

if (!payload.inputs || !payload.inputs.representationStrategy) {
  failures.push("Missing inputs.representationStrategy.");
}

if (!payload.inputs || !payload.inputs.professionalIdentityModel) {
  failures.push("Missing inputs.professionalIdentityModel.");
}

if (!payload.constraints || payload.constraints.noInventedFacts === undefined) {
  failures.push("Missing constraints.noInventedFacts.");
}

if (!payload.constraints || payload.constraints.citeEvidenceOnly === undefined) {
  failures.push("Missing constraints.citeEvidenceOnly.");
}

if (!payload.constraints || payload.constraints.noJudgement === undefined) {
  failures.push("Missing constraints.noJudgement.");
}

if (!payload.constraints || payload.constraints.noGuarantees === undefined) {
  failures.push("Missing constraints.noGuarantees.");
}

if (payload.payloadStatus !== "draft") {
  failures.push('Expected payload.payloadStatus === "draft".');
}

if (payload.task.type !== "professional_visibility_narrative") {
  failures.push(
    'Expected payload.task.type === "professional_visibility_narrative".'
  );
}

if (payload.task.outputMode !== "structured_json") {
  failures.push('Expected payload.task.outputMode === "structured_json".');
}

if (payload.constraints.noInventedFacts !== true) {
  failures.push("Expected payload.constraints.noInventedFacts === true.");
}

if (payload.constraints.citeEvidenceOnly !== true) {
  failures.push("Expected payload.constraints.citeEvidenceOnly === true.");
}

if (payload.constraints.noJudgement !== true) {
  failures.push("Expected payload.constraints.noJudgement === true.");
}

if (payload.constraints.noGuarantees !== true) {
  failures.push("Expected payload.constraints.noGuarantees === true.");
}

const output = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  taskType: payload.task ? payload.task.type : null,
  locale: payload.task ? payload.task.locale : null,
  outputMode: payload.task ? payload.task.outputMode : null,
  constraints: {
    noInventedFacts: payload.constraints
      ? payload.constraints.noInventedFacts
      : null,
    citeEvidenceOnly: payload.constraints
      ? payload.constraints.citeEvidenceOnly
      : null,
    noJudgement: payload.constraints ? payload.constraints.noJudgement : null,
    noGuarantees: payload.constraints ? payload.constraints.noGuarantees : null,
  },
};

console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) {
  console.error("FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("PASS");
console.log("test_llm_payload_regression PASS");
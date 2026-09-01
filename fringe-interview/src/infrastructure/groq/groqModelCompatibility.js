export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
export const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

const GPT_OSS_PROFILE = Object.freeze({
  provider: "groq",
  structuredOutput: true,
  strictJsonSchema: true,
  jsonObjectMode: true,
  reasoningControl: true,
  completionTokenParameter: "max_completion_tokens"
});

const GENERIC_GROQ_PROFILE = Object.freeze({
  provider: "groq",
  structuredOutput: false,
  strictJsonSchema: false,
  jsonObjectMode: true,
  reasoningControl: false,
  completionTokenParameter: "max_tokens"
});

export function resolveGroqModel(env = process.env) {
  const configured = typeof env?.GROQ_MODEL === "string" ? env.GROQ_MODEL.trim() : "";
  return configured || DEFAULT_GROQ_MODEL;
}

export function resolveGroqModelProfile(model = resolveGroqModel()) {
  return model === DEFAULT_GROQ_MODEL ? GPT_OSS_PROFILE : GENERIC_GROQ_PROFILE;
}

const TASK_CONTRACTS = Object.freeze({
  candidateProfile: Object.freeze({ mode: "json_object" }),
  roleProfile: Object.freeze({ mode: "json_object" }),
  jobFitAnalysis: Object.freeze({ mode: "json_object" }),
  answerAnnotation: Object.freeze({ mode: "json_schema", schemaName: "answer_annotation", strict: true, completionBudget: 2048 }),
  decisionAccountabilitySemanticExecutor: Object.freeze({ mode: "json_schema", schemaName: "decision_accountability_semantic_candidate", strict: true, completionBudget: 1200 }),
  professionalPerception: Object.freeze({ mode: "json_object" }),
  adaptiveFollowupQuestion: Object.freeze({ mode: "text" }),
  gapDrivenInterviewQuestion: Object.freeze({ mode: "text" })
});

export function resolveGroqTaskCompletionBudget({ task, maxTokens } = {}) {
  if (Number.isFinite(maxTokens) && maxTokens > 0) return Math.floor(maxTokens);
  const budget = TASK_CONTRACTS[task]?.completionBudget;
  return Number.isFinite(budget) && budget > 0 ? Math.floor(budget) : null;
}

export function closeJsonSchemaObjects(value) {
  if (Array.isArray(value)) return value.map(closeJsonSchemaObjects);
  if (!value || typeof value !== "object") return value;
  const result = {};
  for (const [key, child] of Object.entries(value)) result[key] = closeJsonSchemaObjects(child);
  if (result.type === "object" && result.properties && typeof result.properties === "object") {
    result.additionalProperties = false;
  }
  return result;
}

function buildStrictSchemaContract(jsonSchema, schemaName) {
  return {
    type: "json_schema",
    json_schema: {
      name: schemaName || "structured_output",
      strict: true,
      schema: closeJsonSchemaObjects(jsonSchema)
    }
  };
}

export function resolveGroqOutputContract({ task, jsonSchema = null, strictSchemaCompatible = false, model } = {}) {
  const profile = resolveGroqModelProfile(model);
  const taskContract = TASK_CONTRACTS[task] || null;
  const wantsStrictSchema = taskContract?.mode === "json_schema" || strictSchemaCompatible;

  if (jsonSchema && wantsStrictSchema && profile.strictJsonSchema) {
    return {
      mode: "json_schema",
      responseFormat: buildStrictSchemaContract(jsonSchema, taskContract?.schemaName),
      strict: true
    };
  }
  if ((jsonSchema || taskContract?.mode === "json_object" || taskContract?.mode === "json_schema") && profile.jsonObjectMode) {
    return { mode: "json_object", responseFormat: { type: "json_object" }, strict: false };
  }
  return { mode: "text", responseFormat: null, strict: false };
}

export function buildGroqRequestBody({ task, model = resolveGroqModel(), systemText, userText, temperature = 0.2, maxTokens, jsonSchema = null, strictSchemaCompatible = false } = {}) {
  const contract = resolveGroqOutputContract({ task, jsonSchema, strictSchemaCompatible, model });
  const profile = resolveGroqModelProfile(model);
  const body = { model, temperature, messages: [{ role: "system", content: systemText }, { role: "user", content: userText }] };
  const completionBudget = resolveGroqTaskCompletionBudget({ task, maxTokens });
  if (completionBudget) body[profile.completionTokenParameter] = completionBudget;
  if (contract.responseFormat) body.response_format = contract.responseFormat;
  if (contract.mode !== "text" && profile.reasoningControl) body.include_reasoning = false;
  return { body, contract, profile, completionBudget };
}

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
export const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

const GPT_OSS_PROFILE = Object.freeze({
  provider: "groq",
  structuredOutput: true,
  strictJsonSchema: true,
  jsonObjectMode: true,
  reasoningControl: true
});

const GENERIC_GROQ_PROFILE = Object.freeze({
  provider: "groq",
  structuredOutput: false,
  strictJsonSchema: false,
  jsonObjectMode: true,
  reasoningControl: false
});

export function resolveGroqModel(env = process.env) {
  const configured = typeof env?.GROQ_MODEL === "string" ? env.GROQ_MODEL.trim() : "";
  return configured || DEFAULT_GROQ_MODEL;
}

export function resolveGroqModelProfile(model = resolveGroqModel()) {
  return model === DEFAULT_GROQ_MODEL ? GPT_OSS_PROFILE : GENERIC_GROQ_PROFILE;
}

const TASK_CONTRACTS = Object.freeze({
  candidateProfile: "json_object",
  roleProfile: "json_object",
  jobFitAnalysis: "json_object",
  answerAnnotation: "json_object",
  professionalPerception: "json_object",
  adaptiveFollowupQuestion: "text",
  gapDrivenInterviewQuestion: "text"
});

export function resolveGroqOutputContract({ task, jsonSchema = null, strictSchemaCompatible = false, model } = {}) {
  const profile = resolveGroqModelProfile(model);
  if (jsonSchema && strictSchemaCompatible && profile.strictJsonSchema) {
    return { mode: "json_schema", responseFormat: { type: "json_schema", json_schema: jsonSchema } };
  }
  if ((jsonSchema || TASK_CONTRACTS[task] === "json_object") && profile.jsonObjectMode) {
    return { mode: "json_object", responseFormat: { type: "json_object" } };
  }
  return { mode: "text", responseFormat: null };
}

export function buildGroqRequestBody({ task, model = resolveGroqModel(), systemText, userText, temperature = 0.2, maxTokens, jsonSchema = null, strictSchemaCompatible = false } = {}) {
  const contract = resolveGroqOutputContract({ task, jsonSchema, strictSchemaCompatible, model });
  const body = { model, temperature, messages: [{ role: "system", content: systemText }, { role: "user", content: userText }] };
  if (Number.isFinite(maxTokens) && maxTokens > 0) body.max_tokens = maxTokens;
  if (contract.responseFormat) body.response_format = contract.responseFormat;
  return { body, contract, profile: resolveGroqModelProfile(model) };
}

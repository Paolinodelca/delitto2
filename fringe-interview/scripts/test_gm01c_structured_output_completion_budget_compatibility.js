import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_GROQ_MODEL,
  buildGroqRequestBody,
  closeJsonSchemaObjects,
  resolveGroqModel,
  resolveGroqModelProfile,
  resolveGroqOutputContract,
  resolveGroqTaskCompletionBudget
} from "../src/infrastructure/groq/groqModelCompatibility.js";
import { parseSafeGroqErrorDiagnostic } from "../src/infrastructure/groq/runGroqChatCompletion.js";

const schemaText = await readFile(new URL("../config/answer_annotation_schema.json", import.meta.url), "utf8");
const schema = JSON.parse(schemaText);

assert.equal(resolveGroqTaskCompletionBudget({ task: "answerAnnotation" }), 2048);
assert.equal(resolveGroqTaskCompletionBudget({ task: "candidateProfile" }), null);
assert.equal(resolveGroqTaskCompletionBudget({ task: "answerAnnotation", maxTokens: 1536 }), 1536);

const current = buildGroqRequestBody({
  task: "answerAnnotation",
  model: DEFAULT_GROQ_MODEL,
  systemText: "semantic instructions",
  userText: "candidate answer",
  jsonSchema: schema,
  strictSchemaCompatible: true
});
assert.equal(current.completionBudget, 2048);
assert.equal(current.body.max_completion_tokens, 2048);
assert.equal(current.body.max_tokens, undefined);
assert.equal(current.body.response_format.type, "json_schema");
assert.equal(current.body.response_format.json_schema.strict, true);
assert.equal(current.body.include_reasoning, false);

const explicitCurrent = buildGroqRequestBody({
  task: "candidateProfile",
  model: DEFAULT_GROQ_MODEL,
  systemText: "s",
  userText: "u",
  maxTokens: 1200
});
assert.equal(explicitCurrent.body.max_completion_tokens, 1200);
assert.equal(explicitCurrent.body.max_tokens, undefined);

const alternate = buildGroqRequestBody({
  task: "candidateProfile",
  model: "alternate/model",
  systemText: "s",
  userText: "u",
  maxTokens: 1200
});
assert.equal(alternate.body.max_tokens, 1200);
assert.equal(alternate.body.max_completion_tokens, undefined);
assert.equal(resolveGroqModelProfile(DEFAULT_GROQ_MODEL).completionTokenParameter, "max_completion_tokens");
assert.equal(resolveGroqModelProfile("alternate/model").completionTokenParameter, "max_tokens");

assert.equal(resolveGroqModel({ GROQ_MODEL: "alternate/model" }), "alternate/model");
for (const task of ["candidateProfile", "roleProfile", "jobFitAnalysis", "professionalPerception"]) {
  assert.equal(resolveGroqOutputContract({ task, model: DEFAULT_GROQ_MODEL }).mode, "json_object");
}
for (const task of ["adaptiveFollowupQuestion", "gapDrivenInterviewQuestion"]) {
  assert.equal(resolveGroqOutputContract({ task, model: DEFAULT_GROQ_MODEL }).mode, "text");
}
assert.equal(closeJsonSchemaObjects(schema).additionalProperties, false);

const adapterSource = await readFile(new URL("../src/interview/adapters/runGroqAnswerAnnotationModel.js", import.meta.url), "utf8");
assert.equal(/maxTokens\s*:|max_completion_tokens|max_tokens/.test(adapterSource), false, "Answer Annotation adapter must not own the completion budget");
assert.equal(adapterSource.includes('openai/gpt-oss-120b'), false);

const builderSource = await readFile(new URL("../src/interview/buildAnswerAnnotationPrompt.js", import.meta.url), "utf8");
assert.equal(builderSource.includes('"$schema"'), false, "GM-01B native prompt alignment must remain intact");
assert.ok(builderSource.includes("excerpt must match the original answerText exactly"));
assert.ok(builderSource.includes("3 to 6 annotations"));

const raw = JSON.stringify({ error: { type: "invalid_request_error", code: "json_validate_failed", message: "Generated JSON does not match expected schema. CANDIDATE_SECRET PROMPT_SECRET gsk_SECRET" } });
const diagnostic = parseSafeGroqErrorDiagnostic({ rawText: raw, status: 400, task: "answerAnnotation", model: DEFAULT_GROQ_MODEL });
const exposed = JSON.stringify(diagnostic);
for (const forbidden of ["CANDIDATE_SECRET", "PROMPT_SECRET", "gsk_SECRET"]) assert.equal(exposed.includes(forbidden), false);
assert.equal(diagnostic.failureKind, "structured_output_rejected");

console.log("GM-01C structured-output completion-budget compatibility tests passed.");

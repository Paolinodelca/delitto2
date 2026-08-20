import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAnswerAnnotationPrompt } from "../src/interview/buildAnswerAnnotationPrompt.js";
import { deriveAnswerAnnotationProviderSchema } from "../src/interview/deriveAnswerAnnotationProviderSchema.js";
import { DEFAULT_GROQ_MODEL, resolveGroqModel, resolveGroqOutputContract } from "../src/infrastructure/groq/groqModelCompatibility.js";

const input = {
  answerId: "gm01e-1",
  questionLabel: "Leadership",
  questionPrompt: "Describe a situation in which you influenced colleagues without formal authority.",
  answerText: "I aligned Mechanical and Software around conflicting priorities and explained the trade-off before recommending a shared priority.",
  reviewMode: "interview"
};

const schemaText = await readFile(new URL("../config/answer_annotation_schema.json", import.meta.url), "utf8");
const canonicalSchema = JSON.parse(schemaText);
const providerSchema = deriveAnswerAnnotationProviderSchema(canonicalSchema);
const native = (await buildAnswerAnnotationPrompt({ ...input, nativeSchemaEnforced: true })).answerAnnotationPrompt;
const combined = `${native.systemPrompt}\n${native.userPrompt}`;

assert.equal(combined.includes('"$schema"'), false, "native prompt must not duplicate JSON schema");
assert.equal(/calculate.*start|calculate.*end|character offsets/i.test(combined), true, "prompt must explicitly remove offset calculation from model responsibility");
assert.ok(/verbatim/i.test(combined));
assert.ok(/do not invent|unsupported/i.test(combined));
assert.ok(/questionPrompt/.test(combined));
for (const semantic of ["strength", "evidence", "weakness", "opportunity"]) assert.ok(combined.includes(semantic));
assert.ok(/improvedAnswerDraft/.test(combined));
assert.ok(/3 to 6/.test(combined));
assert.ok(/italiano|English/.test(native.systemPrompt));

const annotation = providerSchema.properties.answerAnnotation.properties.annotations.items;
assert.equal(Object.prototype.hasOwnProperty.call(annotation.properties, "start"), false);
assert.equal(Object.prototype.hasOwnProperty.call(annotation.properties, "end"), false);
for (const field of ["annotationId", "type", "dimension", "label", "reason", "excerpt"]) assert.ok(annotation.required.includes(field));

assert.equal(resolveGroqOutputContract({ task: "answerAnnotation", model: DEFAULT_GROQ_MODEL, jsonSchema: providerSchema, strictSchemaCompatible: true }).mode, "json_schema");
for (const task of ["candidateProfile", "roleProfile", "jobFitAnalysis", "professionalPerception"]) assert.equal(resolveGroqOutputContract({ task, model: DEFAULT_GROQ_MODEL }).mode, "json_object");
for (const task of ["adaptiveFollowupQuestion", "gapDrivenInterviewQuestion"]) assert.equal(resolveGroqOutputContract({ task, model: DEFAULT_GROQ_MODEL }).mode, "text");
assert.equal(resolveGroqModel({ GROQ_MODEL: "alternate/model" }), "alternate/model");

const source = await readFile(new URL("../src/interview/buildAnswerAnnotationPrompt.js", import.meta.url), "utf8");
assert.equal(source.includes("openai/gpt-oss-120b"), false);
console.log("GM-01E Answer Annotation prompt consolidation tests passed.");

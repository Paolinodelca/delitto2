import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadAnswerAnnotationSchema } from "../src/interview/loadAnswerAnnotationSchema.js";
import {
  deriveAnswerAnnotationCoachingProviderSchema,
  deriveAnswerAnnotationAnnotationsProviderSchema
} from "../src/interview/deriveAnswerAnnotationProviderSchema.js";
import { buildAnswerAnnotationPrompt } from "../src/interview/buildAnswerAnnotationPrompt.js";

const canonical = await loadAnswerAnnotationSchema();
const before = JSON.stringify(canonical);
const coaching = deriveAnswerAnnotationCoachingProviderSchema(canonical);
const annotations = deriveAnswerAnnotationAnnotationsProviderSchema(canonical);
assert.equal(JSON.stringify(canonical), before);

const cp = coaching.properties.answerAnnotation.properties;
const ap = annotations.properties.answerAnnotation.properties;
for (const f of ["summary","tags","strengths","weaknesses","coachTip","upgradeSuggestion","improvedAnswerDraft"]) assert.ok(cp[f]);
assert.equal(cp.annotations, undefined);
assert.ok(ap.annotations);
for (const f of ["summary","strengths","weaknesses","coachTip","upgradeSuggestion","improvedAnswerDraft"]) assert.equal(ap[f], undefined);
assert.equal(ap.annotations.items.properties.start, undefined);
assert.equal(ap.annotations.items.properties.end, undefined);
assert.deepEqual(ap.annotations.items.properties.type.enum, canonical.properties.answerAnnotation.properties.annotations.items.properties.type.enum);
assert.deepEqual(ap.annotations.items.properties.dimension.enum, canonical.properties.answerAnnotation.properties.annotations.items.properties.dimension.enum);

const prompts = await buildAnswerAnnotationPrompt({
  answerId:"a1", questionLabel:"Q", questionPrompt:"Tell me", answerText:"I led a team and improved delivery.", nativeSchemaEnforced:true
});
assert.match(prompts.coachingPrompt.systemPrompt,/Do not generate annotations/);
assert.doesNotMatch(prompts.annotationPrompt.systemPrompt,/coachTip|upgradeSuggestion|improvedAnswerDraft/);
assert.match(prompts.annotationPrompt.systemPrompt,/verbatim/);
assert.match(prompts.annotationPrompt.systemPrompt,/Do not calculate or return start\/end/);
assert.doesNotMatch(prompts.coachingPrompt.userPrompt,/"properties"/);
assert.doesNotMatch(prompts.annotationPrompt.userPrompt,/"properties"/);

const runSource = await readFile(new URL("../src/interview/runAnswerAnnotation.js", import.meta.url),"utf8");
assert.match(runSource,/providerCallCount: 2/);
assert.match(runSource,/annotations: annotations\.annotations/);
assert.match(runSource,/normalizeAnswerAnnotation\(composed\)/);

console.log("GM-02 composed Answer Annotation provider execution tests passed.");

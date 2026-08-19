import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAnswerAnnotationPrompt } from "../src/interview/buildAnswerAnnotationPrompt.js";
import { resolveGroqAnswerAnnotationPromptOptions, runGroqAnswerAnnotationModel } from "../src/interview/adapters/runGroqAnswerAnnotationModel.js";
import { DEFAULT_GROQ_MODEL, closeJsonSchemaObjects, resolveGroqOutputContract } from "../src/infrastructure/groq/groqModelCompatibility.js";

const schemaText = await readFile(new URL("../config/answer_annotation_schema.json", import.meta.url), "utf8");
const schema = JSON.parse(schemaText);
const beforeSchema = JSON.stringify(schema);
const input = {
  answerId: "gm01b-1",
  questionLabel: "Leadership",
  questionPrompt: "Describe a situation in which you influenced colleagues without formal authority.",
  answerText: "I aligned Mechanical and Software around conflicting priorities and made the trade-off explicit.",
  reviewMode: "interview"
};

const nativeOptions = await resolveGroqAnswerAnnotationPromptOptions();
assert.equal(nativeOptions.nativeSchemaEnforced, true);
const native = (await buildAnswerAnnotationPrompt({ ...input, ...nativeOptions })).answerAnnotationPrompt;
assert.equal(native.userPrompt.includes(schemaText.trim()), false, "native-schema prompt must not duplicate canonical schema verbatim");
assert.equal(native.userPrompt.includes('"$schema"'), false, "native-schema prompt must not embed schema structure");
for (const semantic of ["answer relative to the actual questionPrompt", "annotations", "strengths", "weaknesses", "coachTip", "improvedAnswerDraft", "Do not invent facts"]) {
  assert.ok((native.systemPrompt + native.userPrompt).includes(semantic), `semantic instruction missing: ${semantic}`);
}
for (const fidelity of ["excerpt must match the original answerText exactly", "start and end positions", "Avoid overlapping annotations", "3 to 6 annotations"]) {
  assert.ok((native.systemPrompt + native.userPrompt).includes(fidelity), `fidelity instruction missing: ${fidelity}`);
}
assert.ok(/italiano|English/.test(native.systemPrompt), "language instruction must remain present");

const fallback = (await buildAnswerAnnotationPrompt({ ...input, nativeSchemaEnforced: false })).answerAnnotationPrompt;
assert.ok(fallback.userPrompt.includes('"answerAnnotation"'), "non-native fallback must retain structural schema guidance");
assert.ok(fallback.userPrompt.includes('"annotations"'));

assert.equal(JSON.stringify(JSON.parse(await readFile(new URL("../config/answer_annotation_schema.json", import.meta.url), "utf8"))), beforeSchema, "canonical schema must remain unchanged");
const closed = closeJsonSchemaObjects(schema);
assert.equal(closed.additionalProperties, false);
const contract = resolveGroqOutputContract({ task: "answerAnnotation", model: DEFAULT_GROQ_MODEL, jsonSchema: schema, strictSchemaCompatible: true });
assert.equal(contract.mode, "json_schema"); assert.equal(contract.responseFormat.json_schema.strict, true);
for (const task of ["candidateProfile", "roleProfile", "jobFitAnalysis", "professionalPerception"]) assert.equal(resolveGroqOutputContract({task,model:DEFAULT_GROQ_MODEL}).mode,"json_object");
for (const task of ["adaptiveFollowupQuestion", "gapDrivenInterviewQuestion"]) assert.equal(resolveGroqOutputContract({task,model:DEFAULT_GROQ_MODEL}).mode,"text");

const oldKey=process.env.GROQ_API_KEY, oldModel=process.env.GROQ_MODEL, oldFetch=globalThis.fetch;
process.env.GROQ_API_KEY="gsk_GM01B_TEST_ONLY"; process.env.GROQ_MODEL=DEFAULT_GROQ_MODEL;
let sentBody=null;
globalThis.fetch=async (_url,options)=>{ sentBody=JSON.parse(options.body); return {ok:true,status:200,headers:{get:()=>null},text:async()=>JSON.stringify({choices:[{message:{content:'{"answerAnnotation":{}}'}}]})}; };
try { await runGroqAnswerAnnotationModel({systemPrompt:native.systemPrompt,userPrompt:native.userPrompt}); }
finally { globalThis.fetch=oldFetch; oldKey===undefined?delete process.env.GROQ_API_KEY:process.env.GROQ_API_KEY=oldKey; oldModel===undefined?delete process.env.GROQ_MODEL:process.env.GROQ_MODEL=oldModel; }
assert.equal(sentBody.response_format.type,"json_schema"); assert.equal(sentBody.response_format.json_schema.strict,true); assert.equal(sentBody.include_reasoning,false);
const sentPrompt=sentBody.messages.map(m=>m.content).join("\n");
assert.equal(sentPrompt.includes(schemaText.trim()),false,"actual provider request prompt must not duplicate schema verbatim");
assert.equal(sentPrompt.includes('"$schema"'),false);
assert.ok(sentPrompt.includes(input.answerText),"candidate answer must still be supplied as task input");

const adapterSource=await readFile(new URL("../src/interview/adapters/runGroqAnswerAnnotationModel.js",import.meta.url),"utf8");
const builderSource=await readFile(new URL("../src/interview/buildAnswerAnnotationPrompt.js",import.meta.url),"utf8");
assert.equal(builderSource.includes('openai/gpt-oss-120b'),false); assert.equal(adapterSource.includes('openai/gpt-oss-120b'),false);
console.log("GM-01B native structured-output prompt alignment tests passed.");

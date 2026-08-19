import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEFAULT_GROQ_MODEL, buildGroqRequestBody, closeJsonSchemaObjects, resolveGroqOutputContract } from "../src/infrastructure/groq/groqModelCompatibility.js";
import { parseSafeGroqErrorDiagnostic, runGroqChatCompletion } from "../src/infrastructure/groq/runGroqChatCompletion.js";

const schema = JSON.parse(await readFile(new URL("../config/answer_annotation_schema.json", import.meta.url), "utf8"));
const closed = closeJsonSchemaObjects(schema);

function visitObjects(node, path = "$") {
  if (!node || typeof node !== "object") return [];
  const found = [];
  if (!Array.isArray(node) && node.type === "object") found.push({ path, node });
  if (Array.isArray(node)) node.forEach((v, i) => found.push(...visitObjects(v, `${path}[${i}]`)));
  else for (const [k, v] of Object.entries(node)) found.push(...visitObjects(v, `${path}.${k}`));
  return found;
}
for (const { path, node } of visitObjects(closed)) {
  assert.equal(node.additionalProperties, false, `strict object must be closed at ${path}`);
  assert.deepEqual(new Set(node.required || []), new Set(Object.keys(node.properties || {})), `all properties required at ${path}`);
}
function removeProviderOnly(node) {
  if (Array.isArray(node)) return node.map(removeProviderOnly);
  if (!node || typeof node !== "object") return node;
  return Object.fromEntries(Object.entries(node).filter(([k]) => k !== "additionalProperties").map(([k,v]) => [k, removeProviderOnly(v)]));
}
assert.deepEqual(removeProviderOnly(closed), schema, "strict closing must preserve the canonical Answer Annotation schema semantics");

const answerContract = resolveGroqOutputContract({ task: "answerAnnotation", model: DEFAULT_GROQ_MODEL, jsonSchema: schema, strictSchemaCompatible: true });
assert.equal(answerContract.mode, "json_schema");
assert.equal(answerContract.responseFormat.json_schema.strict, true);
assert.equal(answerContract.responseFormat.json_schema.name, "answer_annotation");
const answerBody = buildGroqRequestBody({ task: "answerAnnotation", model: DEFAULT_GROQ_MODEL, systemText: "Return JSON.", userText: "input", jsonSchema: schema, strictSchemaCompatible: true });
assert.equal(answerBody.body.response_format.type, "json_schema");
assert.equal(answerBody.body.include_reasoning, false);

for (const task of ["candidateProfile","roleProfile","jobFitAnalysis","professionalPerception"]) {
  assert.equal(resolveGroqOutputContract({ task, model: DEFAULT_GROQ_MODEL }).mode, "json_object");
}
for (const task of ["adaptiveFollowupQuestion","gapDrivenInterviewQuestion"]) {
  assert.equal(resolveGroqOutputContract({ task, model: DEFAULT_GROQ_MODEL }).mode, "text");
}
assert.equal(resolveGroqOutputContract({ task:"answerAnnotation", model:"alternate/model", jsonSchema:schema, strictSchemaCompatible:true }).mode, "json_object");

const secret="gsk_SECRET_SHOULD_NOT_LEAK";
const answer="CANDIDATE_ANSWER_SHOULD_NOT_LEAK";
const prompt="PROMPT_SHOULD_NOT_LEAK";
const raw=JSON.stringify({error:{type:"invalid_request_error",code:"json_validate_failed",message:`Generated JSON does not match the expected schema. ${answer} ${prompt} ${secret}`},request_payload:{prompt,answer,api_key:secret}});
const diagnostic=parseSafeGroqErrorDiagnostic({rawText:raw,status:400,task:"answerAnnotation",model:DEFAULT_GROQ_MODEL});
assert.equal(diagnostic.task,"answerAnnotation"); assert.equal(diagnostic.model,DEFAULT_GROQ_MODEL); assert.equal(diagnostic.status,400);
assert.equal(diagnostic.providerType,"invalid_request_error"); assert.equal(diagnostic.providerCode,"json_validate_failed");
assert.equal(diagnostic.failureKind,"structured_output_rejected");
const serialized=JSON.stringify(diagnostic);
for(const forbidden of [secret,answer,prompt,"request_payload"]) assert.equal(serialized.includes(forbidden),false);

const previousKey=process.env.GROQ_API_KEY; process.env.GROQ_API_KEY=secret;
const previousFetch=globalThis.fetch;
globalThis.fetch=async (_url, options)=>{
  assert.ok(options.headers.Authorization.includes(secret));
  return {ok:false,status:400,headers:{get:()=>null},text:async()=>raw};
};
try {
  await assert.rejects(runGroqChatCompletion({task:"answerAnnotation",systemText:prompt,userText:answer,maxRetries:0,jsonSchema:schema,strictSchemaCompatible:true}), error=>{
    const exposed=JSON.stringify({message:error.message,diagnostic:error.providerDiagnostic});
    assert.equal(exposed.includes(secret),false); assert.equal(exposed.includes(answer),false); assert.equal(exposed.includes(prompt),false);
    assert.equal(error.providerDiagnostic.failureKind,"structured_output_rejected"); return true;
  });
} finally { globalThis.fetch=previousFetch; if(previousKey===undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY=previousKey; }

console.log("GM-01A Groq Answer Annotation compatibility tests passed.");

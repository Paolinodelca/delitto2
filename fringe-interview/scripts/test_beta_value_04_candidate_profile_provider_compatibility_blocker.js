import assert from "node:assert/strict";
import {
  DEFAULT_GROQ_MODEL,
  buildGroqRequestBody,
  resolveGroqOutputContract,
  resolveGroqTaskCompletionBudget
} from "../src/infrastructure/groq/groqModelCompatibility.js";

const contract = resolveGroqOutputContract({
  task: "candidateProfile",
  model: DEFAULT_GROQ_MODEL
});
assert.equal(contract.mode, "json_object");
assert.deepEqual(contract.responseFormat, { type: "json_object" });
assert.equal(contract.strict, false);

const prepared = buildGroqRequestBody({
  task: "candidateProfile",
  model: DEFAULT_GROQ_MODEL,
  systemText: "Return only JSON.",
  userText: "Candidate material"
});

assert.equal(prepared.contract.mode, "json_object");
assert.equal(prepared.body.response_format?.type, "json_object");
assert.equal(prepared.body.response_format?.json_schema, undefined);
assert.equal(prepared.body.include_reasoning, false);
assert.equal(prepared.body.reasoning_effort, "low");
assert.equal(prepared.body.max_completion_tokens, 4096);
assert.equal(prepared.completionBudget, 4096);
assert.equal(resolveGroqTaskCompletionBudget({ task: "candidateProfile" }), 4096);

for (const task of ["roleProfile", "jobFitAnalysis", "professionalPerception"]) {
  const other = buildGroqRequestBody({
    task,
    model: DEFAULT_GROQ_MODEL,
    systemText: "s",
    userText: "u"
  });
  assert.equal(other.contract.mode, "json_object");
  assert.equal(other.body.response_format?.type, "json_object");
  assert.equal(other.body.reasoning_effort, undefined, `${task} must retain its current reasoning configuration`);
}

console.log("BETA-VALUE-04 CandidateProfile provider compatibility blocker tests passed.");

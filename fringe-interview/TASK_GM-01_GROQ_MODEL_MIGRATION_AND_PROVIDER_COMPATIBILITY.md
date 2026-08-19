# TASK GM-01 — Groq Model Migration & Provider Compatibility Boundary

## Final verdict

**B — GROQ MIGRATION IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

The migration is implemented deterministically, but this Builder environment does not contain `GROQ_API_KEY`; therefore real-provider success cannot be claimed.

## 1. Groq/model call sites discovered

Production Groq HTTP/model adapters discovered:

- `src/parser/adapters/runGroqParserModel.js` — parser capability adapter used by CandidateProfile, RoleProfile and JobFitAnalysis and supplied as the model adapter to live Beta/MVP paths.
- `src/interview/adapters/runGroqAnswerAnnotationModel.js` — supported Answer Annotation adapter.
- `src/interview/adapters/runGroqProfessionalPerceptionModel.js` — supported Professional Perception adapter/test path.

Model-adapter consumers also include adaptive follow-up and gap-driven question generation. They consume an injected model adapter; they do not own Groq configuration.

Classification:

- **LIVE CONSUMED:** CandidateProfile, RoleProfile, JobFitAnalysis; staged Private Beta/MVP parser model adapter; adaptive follow-up when its trigger fires and an adapter is supplied.
- **AVAILABLE BUT NOT LIVE/independently invoked:** Answer Annotation and Professional Perception Groq adapters remain supported and have Groq runner scripts, while the current staged Beta report path also contains deterministic/non-direct-Groq report construction.
- **LEGACY / conditional:** gap-driven generation exists behind the existing injected adapter/selection path and is not newly activated by GM-01.

GM-01 does not change those consumption decisions.

## 2. Old default model locations

The decommissioned `llama-3.3-70b-versatile` default existed independently in:

- `src/parser/adapters/runGroqParserModel.js`;
- `src/interview/adapters/runGroqAnswerAnnotationModel.js`;
- `src/interview/adapters/runGroqProfessionalPerceptionModel.js`.

No production source retains that default after GM-01.

## 3. New canonical default location

`src/infrastructure/groq/groqModelCompatibility.js`

contains the single canonical default:

`openai/gpt-oss-120b`

and the Groq chat-completions endpoint, capability profile and output-contract selection policy.

## 4. Selected replacement model

Baseline: `openai/gpt-oss-120b`.

`GROQ_MODEL` remains supported. An override changes the model without edits to application adapters.

There is no automatic fallback to another model.

## 5. Capability profile design

The minimum compatibility profile expresses only behavior currently required by the migration:

- structured output availability;
- strict JSON Schema availability;
- JSON Object Mode availability;
- reasoning-control capability.

The boundary is Groq-specific and intentionally is not a general multi-provider framework.

Unknown/override Groq model IDs use a conservative profile: JSON Object Mode is available to current JSON tasks, while strict schema and reasoning-control assumptions are not made.

## 6. Structured-output strategy per capability

- CandidateProfile: **JSON Object Mode**.
- RoleProfile: **JSON Object Mode**.
- JobFitAnalysis: **JSON Object Mode**.
- Answer Annotation: **JSON Object Mode**.
- Professional Perception: **JSON Object Mode**.
- Adaptive follow-up: **text**.
- Gap-driven question: **text**.

The parser `parser_schema.json` is a prompt/schema guide rather than a canonical JSON Schema contract. It is therefore not silently converted into strict JSON Schema.

The existing Answer Annotation and Professional Perception schemas are real JSON Schemas but are not Groq strict-mode compatible as written: object levels do not consistently set `additionalProperties:false`, and Professional Perception has optional properties. GM-01 does not weaken or rewrite application contracts to force strict mode.

The compatibility boundary nevertheless supports `json_schema` when a future caller supplies an explicitly strict-compatible canonical schema. This leaves AR-02A a clean future path without implementing its semantics.

## 7. JobFitAnalysis failure diagnosis

Supplied live evidence showed CandidateProfile PASS, RoleProfile PASS and JobFitAnalysis failure in the local balanced-JSON extractor after changing only the model ID.

Repository inspection shows all three parser tasks previously requested ordinary text and relied on prompt wording plus `extractJsonObject()` for syntactic JSON recovery. JobFitAnalysis has the largest/deepest output guide and therefore the greatest exposure to GPT-OSS free-form/reasoning/output-format variation.

The repository and supplied failure do not prove truncation as the cause. No evidence justifies blindly increasing token limits.

GM-01 fixes the demonstrated compatibility weakness at the provider/output-contract boundary by requesting JSON Object Mode for parser JSON tasks. The existing parser validator and semantic contract remain unchanged.

A real provider run is still required to prove the diagnosis operationally.

## 8. Reasoning handling

IMAGO does not request, persist, expose or log hidden reasoning.

The GPT-OSS capability profile records that reasoning control exists, but GM-01 does not introduce chain-of-thought fields or make application behavior depend on reasoning content. Structured JSON reliability is handled through the output contract.

## 9. Environment override behavior

`GROQ_MODEL` continues to override the canonical default.

The override is resolved once by the Infrastructure compatibility boundary. Application adapters do not contain a model-specific conditional.

## 10. Future model migration procedure

A future Groq migration should require:

1. change the canonical default in `groqModelCompatibility.js`;
2. declare/adjust the model capability profile there;
3. run compatibility/output-contract tests and application regressions;
4. perform local live provider validation.

Application adapters should not require model-ID edits.

## 11. Remaining model-specific conditionals

One deliberate model-specific selection remains in the canonical compatibility module to associate the selected baseline ID with its capability profile.

No `if (model === ...)` logic is scattered through parser, Answer Annotation, Professional Perception, adaptive follow-up or gap-driven generation.

## 12. Security and failure behavior

The new shared Groq request boundary does not log:

- `GROQ_API_KEY`;
- prompts;
- CV/JD content;
- answers;
- provider response bodies;
- hidden reasoning.

Errors retain task, model and HTTP status where available. There is no hidden model substitution.

## 13. Deterministic tests executed

PASS:

- `node scripts/test_groq_model_compatibility.js`;
- `node scripts/test_parser_runner_mock.js`;
- `node scripts/test_staged_private_beta_journey.js`;
- `node scripts/fringe_health_check.js` — **All health checks passed**.

The compatibility test proves canonical default, decommissioned-default removal, environment override, capability resolution, JSON Object Mode, text mode, strict-schema selection only when explicitly compatible, and alternate-model injection without application edits.

`test_adaptive_runtime_followup.js` was inspected but cannot execute in this environment because it is a real-Groq test and `GROQ_API_KEY` is absent. It fails safely at the provider boundary before any request.

## 14. Live tests

**Deferred — no `GROQ_API_KEY` in Builder environment.**

No secret was simulated.

Therefore GM-01 cannot claim verdict A.

## 15. Files changed

- `src/infrastructure/groq/groqModelCompatibility.js`
- `src/infrastructure/groq/runGroqChatCompletion.js`
- `src/parser/adapters/runGroqParserModel.js`
- `src/interview/adapters/runGroqAnswerAnnotationModel.js`
- `src/interview/adapters/runGroqProfessionalPerceptionModel.js`
- `scripts/test_groq_model_compatibility.js`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_GM-01_GROQ_MODEL_MIGRATION_AND_PROVIDER_COMPATIBILITY.md`
- `TASK_GM-01_MANIFEST.txt`

No `docs/20-product/` file is changed.

## 16. Remaining provider risks

- Real `openai/gpt-oss-120b` behavior must still prove that JSON Object Mode resolves the JobFitAnalysis failure.
- Override models may differ in actual Groq response-format support; the conservative profile avoids strict-schema assumptions but live validation remains mandatory for a new baseline.
- Existing semantic validators remain the authority after provider syntactic output constraints; JSON Object Mode guarantees neither semantic correctness nor application validation success.

## 17. Exact local live-test commands

PowerShell, from the repository root with the existing `GROQ_API_KEY` already set:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"

node scripts/test_parser_runner_groq.js
node scripts/test_full_parser_pipeline_groq.js
node scripts/test_run_fringe_interview_mvp.js
node scripts/test_adaptive_runtime_followup.js
node scripts/test_run_professional_perception_groq.js
node scripts/test_answer_annotation_runner_groq.js
node scripts/fringe_health_check.js
```

The minimum acceptance evidence is:

- CandidateProfile PASS;
- RoleProfile PASS;
- JobFitAnalysis PASS;
- relevant MVP/adaptive-follow-up PASS;
- Professional Perception PASS;
- Answer Annotation PASS if retained as supported Groq capability;
- health check PASS.

Do not change the model between these tests.

## 18. Readiness for reopening AR-02A

Implementation is ready, but **AR-02A remains deferred until the local real-provider validation above passes**, as required by GM-01.

GM-01 does not implement semantic extraction, modify PA-02 authority, activate dormant Interview capabilities, or change Representation behavior.

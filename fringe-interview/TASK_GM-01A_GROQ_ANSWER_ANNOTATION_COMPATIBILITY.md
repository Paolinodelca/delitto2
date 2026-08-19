# TASK GM-01A — Groq 400 Diagnostic + Answer Annotation Compatibility Fix

## Final verdict

**B — COMPATIBILITY FIX IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

## 1. Exact 400 root cause

The exact message for the *historical* HTTP 400 cannot be recovered from the supplied repository/run evidence: before GM-01A `runGroqChatCompletion` read the provider response body into `rawText` and discarded it before throwing. The Builder environment has no `GROQ_API_KEY`, so a truthful live reproduction of that historical 400 is not possible here.

The failure boundary is nevertheless isolated: Answer Annotation was the only supplied live failure and used GPT-OSS JSON Object Mode for a large nested contract. Current Groq structured-output documentation states that JSON Object Mode can fail when valid JSON cannot be produced, while GPT-OSS 120B supports strict JSON Schema constrained output. GM-01A therefore removes that avoidable best-effort generation boundary for Answer Annotation rather than guessing at a prompt defect.

The new diagnostic makes the next live execution decisive. If the provider returns a 400, `error.providerDiagnostic` will safely preserve provider code/type and a coarse sanitized classification such as `structured_output_rejected` without retaining the raw body.

Accordingly, the **historical provider sub-code/message remains unknown until local live validation**. The compatibility correction itself is deterministic and evidence-based; this report does not fabricate a provider message that was never retained.

## 2. Sanitized diagnostic design

`runGroqChatCompletion` now parses the provider error envelope only for an allowlisted diagnostic:

- task;
- model;
- HTTP status;
- provider `error.code` when scalar;
- provider `error.type` when string;
- normalized safe provider-message class;
- `retry-after`;
- coarse failure kind.

It deliberately does **not** attach:

- raw provider body;
- request body;
- prompt/system prompt;
- candidate answer;
- CV/JD;
- API key/Authorization header;
- generated completion;
- reasoning.

Arbitrary provider message text is not copied through. Known classes are normalized to fixed safe messages. This keeps diagnostics server/test-side and does not weaken M1-03 user-facing error handling.

## 3. Answer Annotation request before / after

### Before GM-01A

```text
answerAnnotation
→ shared compatibility profile
→ response_format: { type: "json_object" }
→ full canonical schema embedded only in prompt
→ best-effort valid-JSON generation
→ extractJsonObject
→ existing normalizer
```

### After GM-01A on openai/gpt-oss-120b

```text
answerAnnotation
→ existing canonical answer_annotation_schema.json
→ shared compatibility profile
→ provider-only recursive object closing
→ response_format: {
     type: "json_schema",
     json_schema: {
       name: "answer_annotation",
       strict: true,
       schema: <same semantic schema + additionalProperties:false>
     }
   }
→ include_reasoning:false
→ extractJsonObject
→ existing normalizer
```

No Answer Annotation application field, enum, required field or normalization semantic is changed.

## 4. Output mode selected and why

**Native strict JSON Schema** is selected for Answer Annotation when the model capability profile reports strict JSON Schema support.

Reason:

1. GPT-OSS 120B supports strict JSON Schema structured output.
2. Answer Annotation already has one canonical JSON Schema.
3. Every object in that schema already requires every declared property.
4. The only strict-mode structural requirement missing from its ten object nodes is `additionalProperties:false`.
5. Adding that restriction at the provider boundary changes no required field, type, enum or application meaning.
6. Strict constrained output is a better compatibility fit for this rich nested contract than best-effort JSON Object Mode.

For a model profile without strict-schema support, the centralized contract falls back to JSON Object Mode when available. There is no hidden model fallback.

## 5. Schema compatibility findings

`config/answer_annotation_schema.json` was inspected recursively.

- Valid JSON: **yes**.
- JSON Schema structure used by the application: **valid for the supported subset inspected**.
- Object nodes: **10**.
- All declared properties present in each object's `required`: **yes, 10/10**.
- `additionalProperties:false`: **missing in the canonical file on all 10 object nodes**.
- Arrays: arrays of supported object/string structures; compatible.
- Enums: string enums; compatible.
- `start` / `end`: `number`; supported by Groq structured-output schema subset.
- Unsupported schema feature found: **none in the schema used here**.
- Optional application fields requiring nullable conversion: **none**.

The canonical schema file is **not modified**. `closeJsonSchemaObjects` creates a provider representation that recursively adds only `additionalProperties:false`. A deterministic test strips those provider-only additions and proves byte-equivalent parsed semantics to the original schema object.

## 6. JSON Object / JSON Schema / text mode

After GM-01A:

- CandidateProfile: JSON Object Mode — unchanged.
- RoleProfile: JSON Object Mode — unchanged.
- JobFitAnalysis: JSON Object Mode — unchanged.
- Answer Annotation: strict JSON Schema on GPT-OSS — changed at compatibility boundary only.
- Professional Perception: JSON Object Mode — unchanged.
- Adaptive follow-up question: text — unchanged.
- Gap-driven interview question: text — unchanged.

## 7. Was the schema changed?

**No canonical schema change.**

The provider request receives a derived closed-object representation. This is deliberately infrastructure compatibility, not a second schema and not an application-contract fork.

## 8. Model capability changes

No model-name conditional was added to application adapters.

The canonical `TASK_CONTRACTS` entry for Answer Annotation now declares a strict schema contract. `resolveGroqModelProfile` decides whether the selected model can satisfy it.

GPT-OSS structured requests also set `include_reasoning:false`, using the existing `reasoningControl` model capability. Reasoning is neither required by the application nor retained.

Future migration remains:

```text
configuration / GROQ_MODEL
+ capability profile
+ task output contract
+ regression/live tests
```

rather than edits scattered across adapters.

## 9. Retry / network findings

Existing retryable HTTP statuses remain:

- 429;
- 500;
- 502;
- 503;
- 504.

HTTP 400 remains non-retryable.

When a numeric `retry-after` header is returned, the shared client now honors it; otherwise the existing progressive fixed delay is used.

The previously observed `UND_ERR_CONNECT_TIMEOUT` is a transport failure rather than HTTP provider rejection. GM-01A does **not** add broad network retry behavior because that is not required to fix the reproducible 400 and would broaden scope. This remains a non-blocking infrastructure limitation.

## 10. Rate-limit findings

No rate-limit policy is reclassified. The supplied live evidence already established that the observed 429 cleared after the Free Plan TPM window and that the full MVP then passed.

429 remains retryable. `retry-after`, where provided, is now usable by the shared boundary.

## 11. Tests executed

PASS:

- `node scripts/test_gm01a_groq_answer_annotation_compatibility.js`
  - strict Answer Annotation contract selected centrally;
  - all 10 object nodes closed for strict provider representation;
  - all semantic fields remain required;
  - provider-only transformation preserves canonical schema semantics;
  - GPT-OSS structured request suppresses returned reasoning;
  - alternate model remains capability-driven;
  - parser/report/text task contracts unchanged;
  - sanitized 400 preserves task/model/status/code/type/classification;
  - prompt does not leak;
  - candidate answer does not leak;
  - API key does not leak;
  - raw provider payload does not leak.
- `node scripts/test_groq_model_compatibility.js` — PASS.
- `node scripts/test_parser_runner_mock.js` — PASS.
- `node scripts/test_answer_annotation_prompt.js` — PASS after creating its expected tmp output directory; no product change required.
- `node scripts/test_staged_private_beta_journey.js` — PASS.
- `node scripts/test_staged_private_beta_ui_journey.js` — PASS.
- syntax checks for all modified JavaScript — PASS.
- `node scripts/fringe_health_check.js` — **All health checks passed.**

Professional Perception and parser task contracts are also asserted unchanged by the GM-01A deterministic compatibility test. The supplied GM-01 live baseline records real Professional Perception and parser PASS and those expensive provider calls were not repeated without a key.

## 12. Live tests executed / deferred

Builder environment:

```text
GROQ_API_KEY: unavailable
```

No key was simulated.

Therefore the required live command is deferred to the local environment:

### PowerShell

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_answer_annotation_runner_groq.js
```

If `GROQ_API_KEY` is not already present in that shell, set it using the same local secret-management method used for the completed GM-01 validation. Do not place it in the repository.

Expected result after the fix:

```text
Answer annotation Groq test completed successfully.
```

If it still fails, inspect only the safe diagnostic printed on the Error object:

```text
providerDiagnostic.task
providerDiagnostic.model
providerDiagnostic.status
providerDiagnostic.providerCode
providerDiagnostic.providerType
providerDiagnostic.providerMessage
providerDiagnostic.failureKind
providerDiagnostic.retryAfter
```

Do not log the raw request or response body.

Minimal optional regression after that PASS:

```powershell
node scripts/test_parser_runner_mock.js
node scripts/test_gm01a_groq_answer_annotation_compatibility.js
node scripts/fringe_health_check.js
```

The already live-validated expensive Parser/JobFit/MVP/Professional Perception calls do not need to be repeated solely for GM-01A.

## 13. Files changed

- `src/infrastructure/groq/groqModelCompatibility.js`
- `src/infrastructure/groq/runGroqChatCompletion.js`
- `src/interview/adapters/runGroqAnswerAnnotationModel.js`
- `scripts/test_gm01a_groq_answer_annotation_compatibility.js`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_GM-01A_GROQ_ANSWER_ANNOTATION_COMPATIBILITY.md`
- `TASK_GM-01A_MANIFEST.txt`

No Product Authority, Answer Annotation schema, Interview semantics, UI, question bank, AR-02A, AR-03 or AR-04 file is changed.

## 14. Future migration impact

The migration boundary remains centralized. A future model change normally requires only:

1. model configuration;
2. capability-profile adjustment if capabilities differ;
3. deterministic compatibility regression;
4. focused live validation.

The Answer Annotation adapter supplies its already-existing schema but contains no model-name logic.

## 15. Readiness to close GM-01

**Pending one focused live Answer Annotation PASS.**

GM-01's other supplied live validations are already PASS. GM-01A closes the deterministic compatibility and diagnostic gaps, but this task explicitly forbids claiming full live validation without a real provider execution.

## 16. Readiness to reopen AR-02A

**Deferred until the local Answer Annotation live command passes.**

After that PASS, the Groq migration/provider compatibility gate can be considered closed for the currently exercised baseline and AR-02A may be reopened under PA-02 authority.

## Root-cause closure note

Because the old client destroyed the 400 body, the exact historical provider message is unknowable from this baseline. GM-01A intentionally records that fact instead of guessing. The new diagnostic is the mechanism that makes the next live result attributable. The compatibility change independently removes JSON Object Mode's best-effort JSON-generation failure class from Answer Annotation by using GPT-OSS strict constrained JSON Schema output.

## Final verdict

**B — COMPATIBILITY FIX IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

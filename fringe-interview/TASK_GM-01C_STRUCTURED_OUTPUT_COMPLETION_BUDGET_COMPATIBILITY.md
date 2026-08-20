# TASK GM-01C — Structured Output Completion Budget Compatibility

## Final verdict

**B — COMPLETION BUDGET FIX IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

No live Groq execution is claimed from the Builder environment because `GROQ_API_KEY` is not available there.

## 1. Previous effective completion budget

Repository-first inspection found no dedicated Answer Annotation completion budget.

`runGroqAnswerAnnotationModel.js` called the shared Groq boundary without `maxTokens`. `TASK_CONTRACTS.answerAnnotation` specified strict JSON Schema behavior but no token budget. Consequently `buildGroqRequestBody()` emitted neither `max_tokens` nor `max_completion_tokens` for the real Answer Annotation request.

Therefore the effective completion limit was provider/default behavior rather than an IMAGO task-owned budget.

No other application call site currently supplies an output-token limit except through the shared provider-neutral `maxTokens` input supported by the Parser adapter.

## 2. Completion-budget hypothesis status

The repository and supplied live evidence support the hypothesis as plausible, not proven.

Already established live facts:

- GPT-OSS 120B availability/account support: PASS;
- strict Structured Outputs with minimal schema: PASS;
- strict Structured Outputs with the full real Answer Annotation schema: PASS;
- recursive provider-side `additionalProperties:false`: PASS;
- GM-01B native prompt/schema separation: implemented;
- real Answer Annotation before GM-01C: `400 / json_validate_failed`;
- direct full-schema successful output: approximately 765 completion tokens.

The real task is materially richer than the direct schema acceptance test because it may need summary, tags, 3–6 annotations, strengths, weaknesses, coachTip, upgradeSuggestion and improvedAnswerDraft while satisfying exact span/excerpt constraints.

GM-01C therefore tests the remaining completion-budget hypothesis without changing the output contract.

## 3. Selected Answer Annotation budget

**2048 completion tokens**

This value is stored centrally in the existing `TASK_CONTRACTS.answerAnnotation` compatibility contract.

Rationale:

- the known successful full-schema direct output consumed about 765 completion tokens;
- the real task requires substantially richer content than that direct diagnostic;
- 2048 provides roughly 2.7× headroom over the observed direct output;
- it is large enough to permit the existing 3–6 annotation preference plus coaching/draft fields;
- it is intentionally not an arbitrary 4096/maximum setting;
- unrelated task budgets are not increased;
- the Free Plan 8K TPM limit still matters during live validation, but a maximum completion budget is not necessarily fully consumed.

The exact value is provider/task compatibility policy, not Answer Annotation product semantics.

## 4. Provider parameter before / after

### Before

When a caller supplied `maxTokens`, the shared Groq boundary emitted:

```text
max_tokens
```

Answer Annotation supplied no value, so neither completion-limit parameter was emitted.

### After

For the current canonical GPT-OSS compatibility profile:

```text
max_completion_tokens
```

is emitted.

For Answer Annotation, the centrally resolved task budget produces:

```text
max_completion_tokens: 2048
```

The generic alternate Groq profile retains `max_tokens` for explicit provider-neutral caller limits. This preserves compatibility without adding model-name conditionals to application adapters.

## 5. Task-contract changes

`TASK_CONTRACTS.answerAnnotation` now contains:

- `mode: json_schema`;
- `schemaName: answer_annotation`;
- `strict: true`;
- `completionBudget: 2048`.

A small reusable resolver, `resolveGroqTaskCompletionBudget`, applies:

1. an explicit provider-neutral caller `maxTokens` when supplied;
2. otherwise the task contract completion budget;
3. otherwise no explicit budget.

No general token-management framework was introduced.

## 6. Model capability changes

The existing model compatibility profiles now declare the provider parameter used for completion limits:

- current GPT-OSS profile → `max_completion_tokens`;
- generic alternate Groq profile → `max_tokens`.

This keeps provider syntax inside the compatibility boundary.

The application architecture remains:

```text
IMAGO task
→ task contract
→ completion budget
→ model capability profile
→ provider request
```

## 7. Adapter changes

**None.**

`src/interview/adapters/runGroqAnswerAnnotationModel.js` remains unchanged and contains no hardcoded token budget or provider token parameter.

This is intentional: Answer Annotation asks for its task contract; the compatibility boundary owns budget and provider parameter selection.

The Parser adapter's existing provider-neutral `maxTokens` API remains source-compatible. On the current GPT-OSS path that value is now emitted as `max_completion_tokens`; on the generic alternate profile it remains `max_tokens`.

## 8. Schema and prompt semantics confirmation

Unchanged:

- `config/answer_annotation_schema.json`;
- required fields;
- enums;
- annotation count preference;
- span/excerpt rules;
- coaching semantics;
- `improvedAnswerDraft`;
- language behavior;
- normalization;
- native strict schema mode;
- `include_reasoning:false`;
- GM-01B prompt/schema separation.

Answer Annotation remains:

```text
json_schema
strict:true
```

No fallback to JSON Object Mode or text was introduced.

## 9. Diagnostics

GM-01A safe `providerDiagnostic` behavior is unchanged.

Deterministic tests confirm diagnostics do not leak:

- prompt;
- candidate answer;
- API key.

Raw provider error bodies remain unexposed.

A previously observed `UND_ERR_CONNECT_TIMEOUT` is a separate transport limitation. GM-01C does not redesign retry/network behavior.

## 10. Deterministic tests executed

PASS:

- `node scripts/test_gm01c_structured_output_completion_budget_compatibility.js`
- `node scripts/test_groq_model_compatibility.js`
- `node scripts/test_gm01a_groq_answer_annotation_compatibility.js`
- `node scripts/test_gm01b_native_structured_output_prompt_alignment.js`
- `node scripts/test_answer_annotation_prompt.js`
- `node scripts/test_parser_runner_mock.js`
- `node scripts/test_staged_private_beta_journey.js`
- `node scripts/test_staged_private_beta_ui_journey.js`
- `node scripts/fringe_health_check.js`

Health result:

```text
All health checks passed.
```

The GM-01C test proves specifically:

- Answer Annotation budget resolves centrally to 2048;
- the Answer Annotation adapter does not own/hardcode the budget;
- current GPT-OSS request uses `max_completion_tokens`;
- current migrated path does not emit deprecated `max_tokens`;
- explicit Parser-style `maxTokens` remains supported through the shared boundary;
- generic alternate compatibility profile can still emit `max_tokens`;
- Answer Annotation remains strict `json_schema`;
- `include_reasoning:false` remains present;
- Parser/Professional Perception output contracts remain JSON Object Mode;
- adaptive/gap-driven contracts remain text;
- `GROQ_MODEL` override remains functional;
- GM-01B prompt alignment remains intact;
- safe diagnostics remain intact.

The legacy Answer Annotation prompt test writes a preview under `tmp/answer-annotation`; that generated test artifact was removed before manifest/overlay generation.

## 11. Live validation status

**Not executed in Builder environment: `GROQ_API_KEY` unavailable.**

No key was simulated.

Only this local provider check is required after allowing the 8K TPM window to clear:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_answer_annotation_runner_groq.js
```

Expected success:

```text
Answer annotation Groq test completed successfully.
```

CandidateProfile, RoleProfile, JobFitAnalysis, Full MVP Session and Professional Perception do not need to be repeated because their already live-validated production paths were not changed except for the centralized parameter translation when an explicit token limit is actually supplied.

## 12. Files changed

- `src/infrastructure/groq/groqModelCompatibility.js`
- `scripts/test_gm01c_structured_output_completion_budget_compatibility.js`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_GM-01C_STRUCTURED_OUTPUT_COMPLETION_BUDGET_COMPATIBILITY.md`
- `TASK_GM-01C_MANIFEST.txt`

No `docs/20-product/` file changed.

## 13. Remaining provider risks

1. The completion-budget hypothesis still requires one real Answer Annotation provider execution.
2. The Groq Free Plan TPM window can produce `429`; this must not be classified as compatibility failure.
3. A previously observed `UND_ERR_CONNECT_TIMEOUT` remains a separate non-blocking transport risk.
4. If `400 / json_validate_failed` still occurs with the 2048 budget, no additional speculative fallback should be added. The next step must use the existing sanitized diagnostic and isolate the smallest remaining generation constraint experimentally.

## 14. Readiness to close GM-01 series

**Not yet live-closed.**

Deterministic compatibility work for GM-01 / GM-01A / GM-01B / GM-01C is green, but the series should be considered provider-live closed only after the real Answer Annotation command succeeds with GPT-OSS 120B.

## 15. Readiness to reopen AR-02A

**Deferred until the single local Answer Annotation live validation succeeds.**

No AR-02A work was performed.

## Scope confirmation

Not modified or implemented:

- Product Authority;
- AR-02A;
- AR-03;
- AR-04;
- semantic extractor;
- professional ontology;
- Interview behavior;
- Representation;
- Answer Annotation schema;
- Answer Annotation prompt design;
- model fallback;
- UI;
- broad provider framework.

No commit or push was executed.

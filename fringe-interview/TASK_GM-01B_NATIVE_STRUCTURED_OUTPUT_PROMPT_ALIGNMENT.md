# TASK GM-01B — Native Structured Output Prompt Alignment

## Final verdict

**B — PROMPT ALIGNMENT IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

## 1. Previous duplicate-contract behavior

After GM-01A, Answer Annotation sent the same structural contract twice to GPT-OSS 120B:

1. native Groq `response_format.type = json_schema`, `strict: true`, containing the provider-compatible form of `config/answer_annotation_schema.json`;
2. the complete canonical JSON Schema serialized verbatim into `userPrompt` by `buildAnswerAnnotationPrompt.js`.

The supplied live evidence already isolates the remaining problem tightly: strict Structured Outputs work on the account/model, and the complete real Answer Annotation schema with recursive `additionalProperties:false` also passes a direct strict-schema provider test with a minimal prompt. The real Answer Annotation request still returned `json_validate_failed`. Therefore prompt/schema duplication is the remaining concrete request difference to remove. Because Builder cannot execute Groq live, GM-01B does not claim that duplication is proven to be the historical 400 root cause until the post-overlay live call passes.

## 2. New structural / semantic responsibility split

The canonical split is now:

- **Structural contract:** GM-01 compatibility boundary → native Groq strict `json_schema` when supported.
- **Semantic instructions:** Answer Annotation system/user prompt → coaching meaning, answer fidelity, span correctness, evidence constraints, annotation selection and locale.

When native strict schema is selected, the prompt no longer serializes the full JSON Schema. It asks the model to populate the provider-enforced structured output contract and keeps all semantic instructions.

When native strict schema is not selected, the prompt builder retains the historical embedded-schema guidance so a JSON Object/text-compatible path still has structural instructions.

## 3. Prompt changes

`buildAnswerAnnotationPrompt` now accepts one neutral option: `nativeSchemaEnforced`.

When `true`:

- the canonical schema is not loaded merely for prompt serialization;
- the full schema is not embedded in `userPrompt`;
- semantic/coaching instructions remain;
- exact excerpt fidelity remains;
- start/end correctness remains;
- non-overlap guidance remains;
- the 3–6 annotation preference remains;
- unsupported-fact prohibition remains;
- locale/language instruction remains.

When `false`, the prior schema-in-prompt behavior remains available.

No model-name conditional was added to application prompt logic.

## 4. Schema changes

**None.**

`config/answer_annotation_schema.json` is unchanged.

The GM-01A provider-side recursive `additionalProperties:false` transformation is unchanged and remains covered by deterministic regression tests.

## 5. Provider compatibility boundary changes

The canonical GM-01 low-level compatibility profile and request builder are unchanged.

A minimal adapter-level query now asks the existing canonical compatibility resolver which Answer Annotation output contract applies. It exposes only the neutral prompt fact `nativeSchemaEnforced` to the prompt builder. Capability/model detection remains centralized in `groqModelCompatibility.js`; it is not reimplemented in application prompt code.

This preserves the intended architecture:

`IMAGO capability → task output contract → model capability profile → provider request`.

## 6. Backward compatibility

For a model/profile where the canonical compatibility boundary does not select native `json_schema`, `nativeSchemaEnforced` is false and the prompt continues to include the canonical schema as structural guidance.

`extractJsonObject` remains in `runAnswerAnnotation`. It is harmless for strict JSON output and remains useful for backward-compatible non-native paths. No parsing refactor was necessary.

## 7. Span / excerpt behavior

Preserved unchanged:

- annotation excerpt must match original `answerText` exactly;
- start/end must be consistent with the excerpt;
- overlapping annotations are discouraged;
- 3–6 annotations remain preferred where appropriate;
- strength/weakness/opportunity semantics remain;
- improved answer drafts may not invent unsupported facts.

Strict schema is treated only as structural enforcement; it is not claimed to guarantee semantic span correctness.

## 8. Diagnostics

GM-01A safe `providerDiagnostic` behavior is unchanged.

Provider errors still expose only sanitized task/model/status/code/type/message/retry information and coarse failure classification. Raw prompts, candidate answers, API keys, CV/JD, reasoning and raw provider bodies remain excluded.

## 9. Tests executed

PASS:

- `scripts/test_gm01b_native_structured_output_prompt_alignment.js`
  - native strict mode does not duplicate the canonical schema in the actual prompt sent to the mocked provider;
  - semantic instructions remain;
  - answer/span fidelity instructions remain;
  - locale instruction remains;
  - canonical schema remains unchanged;
  - strict provider transformation remains active;
  - Answer Annotation remains strict `json_schema` on the compatible default model;
  - Parser and Professional Perception remain JSON Object Mode;
  - adaptive/gap-driven questions remain text mode;
  - no GPT-OSS model-name conditional exists in Answer Annotation prompt/adapter logic.
- `scripts/test_gm01a_groq_answer_annotation_compatibility.js` — PASS.
- `scripts/test_groq_model_compatibility.js` — PASS.
- `scripts/test_parser_runner_mock.js` — PASS.
- `scripts/test_staged_private_beta_journey.js` — PASS.
- `scripts/test_staged_private_beta_ui_journey.js` — PASS.
- `scripts/fringe_health_check.js` — **All health checks passed.**
- `scripts/test_answer_annotation_prompt.js` — PASS after creating its pre-existing expected `tmp/answer-annotation` output directory. No production behavior was changed for that fixture dependency.

A standalone Professional Perception prompt-preview script was not counted as a regression because it requires a pre-existing `tmp/app-mvp-session/fringe_interview_mvp_session_result.json` fixture not present in the clean repository. Professional Perception's output contract is directly asserted by GM-01/GM-01A/GM-01B compatibility tests and the full health check remains green.

## 10. Live validation status

Not executed in Builder: no `GROQ_API_KEY` was simulated or inserted.

The only required local live closure test is:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_answer_annotation_runner_groq.js
```

Expected success:

```text
Answer annotation Groq test completed successfully.
```

CandidateProfile, RoleProfile, JobFitAnalysis, full MVP Session and Professional Perception do not need expensive repetition because the supplied task records them as already live-validated and GM-01B does not change their production paths.

## 11. Files changed

- `src/interview/buildAnswerAnnotationPrompt.js`
- `src/interview/runAnswerAnnotation.js`
- `src/interview/adapters/runGroqAnswerAnnotationModel.js`
- `scripts/test_gm01b_native_structured_output_prompt_alignment.js`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_GM-01B_NATIVE_STRUCTURED_OUTPUT_PROMPT_ALIGNMENT.md`
- `TASK_GM-01B_MANIFEST.txt`

No `docs/20-product/` file was modified.

## 12. Remaining provider limitation

The only unresolved provider fact is whether removing the duplicate structural contract makes the **real** Answer Annotation call pass. The supplied diagnostics strongly isolate prompt/request generation as the remaining area, but only a real post-overlay Groq call can prove closure.

If HTTP 400 remains, do not add a fallback. Use the existing sanitized `providerDiagnostic` and compare the smallest remaining semantic-prompt/request differences against the already-passing direct full-schema test.

## 13. Readiness to close GM-01 / GM-01A / GM-01B

**Pending one local live Answer Annotation PASS.**

GM-01 migration paths other than Answer Annotation are already live validated. GM-01A diagnostics are functioning. GM-01B removes the diagnosed duplicate structural contract without weakening the application schema.

## 14. Readiness to reopen AR-02A

**Not yet.**

AR-02A remains deferred until the local real Answer Annotation test passes and the Groq migration can be closed.

## Final verdict

**B — PROMPT ALIGNMENT IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

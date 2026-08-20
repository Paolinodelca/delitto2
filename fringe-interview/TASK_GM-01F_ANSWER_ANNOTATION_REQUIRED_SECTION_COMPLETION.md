# TASK GM-01F — Answer Annotation Required Section Completion

## Final verdict
**B — REQUIRED SECTION COMPLETION IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

## 1. Exact failed_generation finding
The authoritative live production request returned `HTTP 400 / json_validate_failed`. Generated Answer Annotation contained the identity/input fields plus `summary`, `tags`, and `annotations`, but completed before all canonical required sections were present.

## 2. Required fields omitted
`strengths`, `weaknesses`, `coachTip`, `upgradeSuggestion`, `improvedAnswerDraft`.

## 3. Prompt change
The native Answer Annotation prompt now explicitly requires completion of every canonical content section before response completion: `summary`, `tags`, `annotations`, `strengths`, `weaknesses`, `coachTip`, `upgradeSuggestion`, `improvedAnswerDraft`.

It also states that `tags`/`strengths`/`weaknesses` may be empty arrays when unsupported but their properties remain required; `coachTip` and `upgradeSuggestion` remain required concise evidence-faithful objects; and `improvedAnswerDraft` is always returned, with `isProvided:false` and empty text when no safe draft is available.

The prompt remains consolidated and does not re-embed the full native schema. Existing explicit GM-01B/C/D fidelity wording is preserved for regression compatibility without changing semantics.

## 4. Schema change
**No.** `config/answer_annotation_schema.json` is unchanged.

## 5. Provider projection change
**No.** GM-01D provider projection and deterministic `start`/`end` reconstruction are unchanged. No schema ordering workaround was introduced.

## 6. Fixture encoding change
**No.** Mojibake fixture cleanup was not necessary for the diagnosed 400.

## 7. Deterministic tests
PASS: GM-01F, GM-01E, GM-01D, GM-01C, GM-01B, GM-01A, GM-01 compatibility, Answer Annotation prompt, parser mock, staged Beta application, staged Beta UI, and `fringe_health_check.js` (`All health checks passed.`). GM-01D regression covers normalization/span reconstruction.

## 8. Live validation status
Not executed in Builder environment; no `GROQ_API_KEY` was simulated.

Local closure command:
```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_answer_annotation_runner_groq.js
```
Success criterion: `Answer annotation Groq test completed successfully.` Then verify required sections exist and verbatim excerpts survive deterministic span normalization. If 400 persists, use provider failed-generation evidence; do not add another speculative workaround.

## 9. Files changed
- `src/interview/buildAnswerAnnotationPrompt.js`
- `scripts/test_gm01f_answer_annotation_required_section_completion.js`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_GM-01F_ANSWER_ANNOTATION_REQUIRED_SECTION_COMPLETION.md`
- `TASK_GM-01F_MANIFEST.txt`

## 10. Readiness to close GM-01 series
Not live-closed. Deterministic compatibility is green; one real Answer Annotation provider PASS remains.

## 11. Readiness to reopen AR-02A
Deferred until local Answer Annotation live validation succeeds and the Groq migration series closes.

## Scope
No Product Authority, schema, provider projection, model, strict-mode, completion-budget, reasoning, retry/fallback, AR-02A/03/04, ontology, Interview or Representation changes. No commit/push.

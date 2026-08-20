# TASK GM-02 — Composed Answer Annotation Provider Execution

## Final verdict

**B — COMPOSED ANSWER ANNOTATION IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

## Architecture inspected and pattern reused

Repository inspection found existing task-specific Groq adapters, programmatic provider-schema projection, normalization boundaries, and deterministic application composition patterns. GM-02 reuses those boundaries rather than introducing a new orchestration framework.

## Established live evidence

GPT-OSS 120B, native strict Structured Outputs, and the canonical Answer Annotation schema are already live-proven. GM-01D proved deterministic span reconstruction. Completion-budget increases, prompt consolidation, and explicit required-section instructions did not make the monolithic production generation reliable. The latest failed generation stopped after `summary`/`tags`; a prior one stopped after `annotations`.

## Decomposition selected

Answer Annotation now uses exactly two sequential provider calls:

1. **Coaching projection** — identity/input fields plus `summary`, `tags`, `strengths`, `weaknesses`, `coachTip`, `upgradeSuggestion`, `improvedAnswerDraft`.
2. **Annotation projection** — identity/input fields plus `annotations`; provider annotations exclude `start`/`end`.

Both projections are derived programmatically from `config/answer_annotation_schema.json`. No second maintained semantic schema exists.

## Prompt responsibilities

The coaching call is explicitly limited to coaching sections and does not request annotations. The annotation call is limited to exact-passage annotation semantics and does not request coaching sections. Native mode does not embed the canonical schema in either prompt.

## Deterministic composition

`runAnswerAnnotation` preserves the original application input identity fields, takes coaching fields only from the coaching result, annotations only from the annotation result, then passes the composed canonical object through the existing `normalizeAnswerAnnotation` boundary. Provider results are not used to overwrite unrelated responsibilities.

GM-01D remains authoritative: surviving excerpts receive deterministic UTF-16 `start`/`end` offsets and must satisfy `answerText.slice(start,end) === excerpt`; missing, ambiguous and overlap handling remain in the existing normalizer.

## Canonical schema

**Unchanged.** No canonical field, enum, required property, or consumer shape was modified.

## Partial failure

There is no hidden degraded result. If either required provider call fails, the existing provider/application error propagates and Answer Annotation fails explicitly. No model, JSON Object, text, or locally fabricated semantic fallback was added.

## Provider impact

Answer Annotation changes from **1 provider request to exactly 2 provider requests**. No iterative/agentic loop was introduced. Existing provider model, strict mode, completion-budget architecture, safe diagnostics, retry policy and capability resolution remain unchanged.

## Fixture

The existing Groq runner fixture in this baseline is already valid UTF-8 Italian; no encoding change was necessary. The runner was updated only to report safe composed-path validation facts: provider-call count, annotation/strength/weakness counts, coaching-object presence, improved-draft state, and exact span checks.

## Deterministic tests

PASS:
- `test_gm02_composed_answer_annotation_provider_execution.js`
- GM-01F
- GM-01E
- GM-01D
- GM-01C
- GM-01A
- Groq model compatibility
- Parser mock
- staged Beta application
- staged Beta UI
- `fringe_health_check.js` → **All health checks passed.**

GM-01B's direct adapter-body regression is deliberately superseded because it calls the old single-call `runGroqAnswerAnnotationModel({systemPrompt,userPrompt})` signature. Its relevant invariants (native strict schema, no schema re-embedding, prompt responsibility separation) are covered by GM-02 and later regression tests.

## Live validation

Not claimed: Builder has no real Groq execution evidence for GM-02.

Required local validation only:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_answer_annotation_runner_groq.js
```

Success requires both composed calls to succeed, the canonical coaching sections to exist, meaningful annotation behavior where supported, exact surviving spans, and:

`Answer annotation Groq test completed successfully.`

## Files changed

See `TASK_GM-02_MANIFEST.txt`.

## Readiness

Groq migration: **not live-closed until the single composed production runner passes locally.**

AR-02A: **remains deferred until GM-02 live validation passes.**

No Product Authority change. No commit or push.

# TASK GM-01E — Answer Annotation Prompt Consolidation for GPT-OSS Compatibility

## Final verdict

**B — PROMPT CONSOLIDATION IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

GM-01E consolidates the production Answer Annotation prompt without changing Product Authority, Answer Annotation product semantics, Interview behavior, provider schema, deterministic span resolution, or the public Answer Annotation contract.

## Implementation summary

The production prompt was reduced and reorganized so that:

- native strict JSON Schema remains the sole structural authority when available;
- the prompt focuses on semantic coaching requirements;
- schema structure is not duplicated in the native-schema prompt;
- the model is not asked to calculate `start` / `end`;
- exact verbatim `excerpt` selection remains required;
- question-relative coaching remains required;
- unsupported inference guardrails remain;
- `strength` / `evidence` / `weakness` / `opportunity` semantics remain;
- `improvedAnswerDraft` fidelity remains;
- localization remains;
- the 3–6 annotation target remains a preference rather than duplicated structural instruction.

GM-01D deterministic span resolution remains unchanged:
- unique excerpt → deterministic span;
- missing excerpt → annotation discarded;
- ambiguously repeated excerpt → annotation discarded;
- no fuzzy matching;
- final public annotations still contain `start` and `end`.

## Product / provider boundaries preserved

Unchanged:

- `docs/20-product/`;
- canonical Answer Annotation schema;
- GM-01A safe diagnostics;
- GM-01C completion budget;
- GM-01D provider projection and span reconstruction;
- Parser contracts;
- Professional Perception contract;
- adaptive/gap-driven text output contracts;
- `GROQ_MODEL` override;
- provider fallback policy;
- public Answer Annotation shape.

No AR-02A / AR-03 / AR-04 work was performed.

## Deterministic verification status

GM-01E regression coverage validates:

1. native structured-output prompt does not duplicate the JSON schema;
2. native prompt does not ask for `start` / `end`;
3. verbatim excerpt requirement remains;
4. unsupported-inference guardrail remains;
5. question-relative coaching remains;
6. strength/evidence/weakness/opportunity semantics remain;
7. improvedAnswerDraft fidelity remains;
8. localization remains;
9. annotation-count preference remains without structural duplication;
10. GM-01D provider schema remains unchanged;
11. deterministic span reconstruction remains unchanged;
12. Parser / Professional Perception / adaptive / gap-driven contracts remain unchanged;
13. `GROQ_MODEL` override remains unchanged;
14. GM-01A safe diagnostics remain unchanged;
15. prior GM-01-series regressions, staged Beta regressions and health checks remain green.

## Live validation status

Live provider validation is still required on the local environment with a real Groq key:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_answer_annotation_runner_groq.js
```

Success criterion:

```text
Answer annotation Groq test completed successfully.
```

Only after that PASS can the GM-01 series be considered live-validated and AR-02A reopened.

## Actual changed files

Exactly **4** files are changed relative to the current baseline:

- `src/interview/buildAnswerAnnotationPrompt.js`
- `scripts/test_gm01e_answer_annotation_prompt_consolidation.js`
- `TASK_GM-01E_ANSWER_ANNOTATION_PROMPT_CONSOLIDATION.md`
- `TASK_GM-01E_MANIFEST.txt`

`docs/00-continuity/BETA_READINESS_MATRIX.md` is intentionally **excluded** from the manifest and overlay because it is identical to the current baseline (`git diff` empty) and therefore is not an actual changed file.

## Deliverable integrity

The regenerated deliverables are built from the four actual changed files only.

Required invariant:

```text
actual changed files
=
TASK_GM-01E_MANIFEST.txt
=
overlay ZIP entries
```

No nested ZIP.

No commit or push performed.

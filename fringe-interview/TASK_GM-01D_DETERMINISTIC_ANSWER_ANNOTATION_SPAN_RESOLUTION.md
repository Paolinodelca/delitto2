# TASK GM-01D — Deterministic Answer Annotation Span Resolution

## Final verdict

**B — DETERMINISTIC SPAN RESOLUTION IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**

The previous provider contract required GPT-OSS to generate semantic annotation content plus exact `start`/`end` character arithmetic. Live diagnostics isolated the failure to that annotation-span path: strict minimal/full schema passed, real values with placeholders passed, genuine coaching with `annotations=[]` passed, while the original full annotation path returned `400 / json_validate_failed`; 2048/4096 completion budgets did not fix it.

GM-01D splits responsibility as follows: the LLM selects `annotationId`, `type`, `dimension`, `label`, `reason` and an exact verbatim `excerpt`; application normalization deterministically derives `start` and `end` from authoritative `answerText`.

A provider schema is derived from `config/answer_annotation_schema.json` by deep-copying it and removing only annotation `start`/`end` properties and required entries. The canonical schema is unchanged and the provider projection is not a second semantic model. Strict `json_schema`, recursive `additionalProperties:false`, `include_reasoning:false`, and GM-01C completion-budget behavior remain unchanged.

Canonical offset convention is preserved: JavaScript UTF-16 string offsets, `start` inclusive and `end` exclusive (`answerText.slice(start,end) === excerpt`). A unique excerpt resolves deterministically. A missing excerpt is discarded. A repeated ambiguous excerpt without valid disambiguating canonical offsets is discarded rather than mapped to an arbitrary occurrence. No fuzzy matching is introduced.

Existing overlap behavior is preserved: current type/priority ranking determines which overlapping annotation survives. The final public/application shape still contains `start` and `end`; `runAnswerAnnotation.js` and consumers are unchanged.

The prompt no longer asks the model to calculate offsets. It still requires exact verbatim excerpts, existing coaching semantics, annotation types/dimensions, 3–6 preference, strengths/weaknesses/opportunities, improved draft behavior and localization. Native GM-01B schema separation remains; non-native fallback also embeds the derived provider projection without offsets.

GM-01A safe diagnostics remain unchanged; no prompt, candidate answer, API key, raw provider body or reasoning is exposed. No model fallback, rate-limit change, transport redesign, Product Authority change, AR-02A/03/04 work, UI work or Interview redesign was introduced.

Deterministic PASS: GM-01D; GM-01; GM-01A; GM-01B; GM-01C; Answer Annotation prompt; parser mock; staged Beta application; staged Beta UI; `fringe_health_check.js` (`All health checks passed.`). Syntax checks pass.

`GROQ_API_KEY` is unavailable in the Builder environment, so live validation is not claimed. Local closure command after TPM clearance:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_answer_annotation_runner_groq.js
```

Success requires the command to complete and generated annotations to satisfy verbatim excerpt and `answerText.slice(start,end) === excerpt`. If live `400` remains, preserve diagnostics and run only the smallest evidence-based next experiment; do not weaken semantics.

Files changed: provider-schema derivation helper; Groq Answer Annotation adapter; Answer Annotation prompt; normalizer; GM-01D test; GM-01B regression test; pertinent Beta readiness continuity; report; manifest. Product Authority unchanged.

GM-01 series is deterministically ready but not live-closed. AR-02A remains deferred until this single live Answer Annotation validation succeeds. No commit or push executed.

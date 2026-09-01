# AR-03C — Live Semantic Candidate Rejection Diagnosis

## Verdict

**B — CANDIDATE REJECTION DIAGNOSTICS READY; LOCAL LIVE EVIDENCE REQUIRED**

**FIRST HUMAN TEST GATE: PENDING**

## Repository-first diagnosis

The production path is:

Evidence → `buildDecisionAccountabilityProductionSemanticPrompt` → `runGroqDecisionAccountabilitySemanticExecutor` → `runGroqChatCompletion` → Groq structured output (`json_schema`) → JSON parse → `validateDecisionAccountabilityProductionSemanticCandidate` → executor status/reason → AR-03A `semanticView()`.

The previous AR-03A label `no semantic candidate` was lossy: `semanticView()` intentionally maps only a supported candidate and `unsupported_semantics`; `malformed_provider_output` and `invalid_provider_output` both became `null`, so the live transcript cannot establish which rejection occurred in the four primary cases.

AR-03C does **not** infer a model-semantic failure from that transcript. No prompt, semantic policy, schema, validator, Measurement, Knowledge or projection semantics were changed.

## Diagnostic seam added

The existing executor reasons are preserved and now carry sanitized diagnostic detail for non-provider rejection:

- `malformed_provider_output` → stage `json_parse`, category `json_parse_failure`;
- `invalid_provider_output` → stage `semantic_candidate_validation`, category `candidate_rejected`, plus bounded validator errors;
- `unsupported_semantics` → stage `semantic_candidate_validation`, category `legitimate_unsupported_semantics`;
- valid supported candidate remains unchanged;
- provider failures remain exceptions carrying the existing safe `providerDiagnostic` from `runGroqChatCompletion`.

AR-03A now prints the executor reason/stage/category when a candidate is absent and preserves the progressive `[n/N] START/DONE` logging. `AR03C_DIAGNOSTIC=1` restricts the live run to the four primary cases, without changing their fixtures or assertions.

## Four-case diagnostic table

| Case | Expected | Provider request | Provider structured output | Schema/adapter validation | Semantic candidate validation | Executor reason/status | First rejection point | Classification |
|---|---|---|---|---|---|---|---|---|
| C06_AMBIGUOUS_SCOPE | UNSUPPORTED | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC |
| C09_BOUNDED_CONTINUITY | SUPPORTED/final/team/known lower_bound 12 | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC |
| C12_HOSTILE_EVIDENCE | SUPPORTED/none | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC |
| P_SHARED_3 | SUPPORTED/shared/function | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC | PENDING LOCAL LIVE DIAGNOSTIC |

`GROQ_API_KEY` is absent in the Builder environment, therefore no live cause is invented.

## Deterministic verification

PASS:

- `node scripts/test_ar03c_semantic_candidate_rejection_diagnostics.js`
- `node scripts/test_ar02d_reopen_decision_accountability_production_semantic_executor.js`
- `node scripts/test_ar02c_decision_accountability_semantic_integration.js`
- repository-equivalent Observation regression: `node scripts/test_build_decision_accountability_observation.js`
- repository-equivalent Measurement regression: `node scripts/test_build_decision_accountability_measure_result.js`
- `node scripts/test_groq_model_compatibility.js`
- `node scripts/fringe_health_check.js` — **All health checks passed.**

The task-requested filenames `scripts/test_decision_accountability_observation.js`, `scripts/test_decision_accountability_measurement.js`, and `scripts/test_ar03b_groq_model_compatibility_consumption.js` are not present in the received repository. Their existing repository-equivalent tests were run where available; no missing test was fabricated.

## Local live diagnostic

With the already-authorized Groq environment configured:

```powershell
$env:AR03C_DIAGNOSTIC="1"
node scripts/test_ar03a_live_groq_decision_accountability_semantic_verification.js
Remove-Item Env:AR03C_DIAGNOSTIC
```

The run will execute only C06, C09, C12 and P_SHARED_3 and expose the sanitized first observable rejection category. Do not paste the API key into source files.

## Files changed

1. `src/infrastructure/groq/runGroqDecisionAccountabilitySemanticExecutor.js`
2. `scripts/test_ar03a_live_groq_decision_accountability_semantic_verification.js`
3. `scripts/test_ar03c_semantic_candidate_rejection_diagnostics.js`
4. `TASK_AR-03C_LIVE_SEMANTIC_CANDIDATE_REJECTION_DIAGNOSIS.md`
5. `TASK_AR-03C_MANIFEST.txt`

Production semantics changed: **NO**. Diagnostic observability only.

No commit. No push.

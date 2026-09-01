# AR-03D — Decision Accountability Live Semantic Contract Conformance Correction

## Verdict

**A — DECISION ACCOUNTABILITY LIVE CONTRACT CONFORMANCE CORRECTED**

**FIRST HUMAN TEST GATE = PENDING FULL LIVE AR-03A RERUN**

Live execution was not performed in the Builder environment because `GROQ_API_KEY` is not available. Status: **PENDING LOCAL LIVE VERIFICATION**.

## Root cause and correction

| Case | Root cause | First correction point | Correction |
|---|---|---|---|
| C06_AMBIGUOUS_SCOPE | The canonical validator already rejects positive `SUPPORTED` without a supported `consequenceScope`, but the provider-facing JSON Schema allowed that invalid combination. The prompt stated the sufficiency rule but did not explicitly direct the provider to emit `UNSUPPORTED` when positive authority exists and scope remains ambiguous. | **D — mismatch schema ↔ canonical validator**, plus contract expression clarification | Provider-facing schema now constrains positive `SUPPORTED` to recommendation/shared/final **and** a canonical scope. The prompt explicitly requires `UNSUPPORTED` when scope is missing/ambiguous and forbids invention/defaulting. |
| C09_BOUNDED_CONTINUITY | The canonical validator requires scalar `lower_bound` as `months`, with `minimumMonths`/`maximumMonths` null. The previous provider-facing schema allowed every temporal field combination, so a schema-valid provider output could still be canonically invalid. | **D — mismatch schema ↔ canonical validator** | Provider-facing continuity schema now mirrors the existing canonical shapes: exact/approximate/lower_bound/upper_bound use `months`; range uses `minimumMonths` + `maximumMonths`; unknown carries no temporal values. Prompt serialization is made explicit, including lower-bound shape. |

No validator relaxation, new temporal representation, semantic policy change, Observation/Measurement change, heuristic fallback, retry, model change, or case-ID/phrase-specific logic was introduced.

## Files changed

- `src/app/knowledge/decisionAccountabilityProductionSemanticCandidate.js`
- `src/app/knowledge/buildDecisionAccountabilityProductionSemanticPrompt.js`
- `scripts/test_ar03d_decision_accountability_contract_conformance.js`
- `TASK_AR-03D_DECISION_ACCOUNTABILITY_LIVE_SEMANTIC_CONTRACT_CONFORMANCE_CORRECTION.md`
- `TASK_AR-03D_MANIFEST.txt`

## Deterministic regression

PASS:

- `node scripts/test_ar03d_decision_accountability_contract_conformance.js`
- `node scripts/test_ar03c_semantic_candidate_rejection_diagnostics.js`
- `node scripts/test_ar02d_reopen_decision_accountability_production_semantic_executor.js`
- `node scripts/test_ar02c_decision_accountability_semantic_integration.js`
- `node scripts/test_build_decision_accountability_observation.js`
- `node scripts/test_build_decision_accountability_measure_result.js`
- `node scripts/test_groq_model_compatibility.js`
- `node scripts/fringe_health_check.js` → **All health checks passed.**

The repository does not contain the task-named `test_ar03b_groq_model_compatibility_consumption.js`; no replacement test was fabricated.

The AR-03D regression proves: missing scope cannot form a valid positive candidate; canonical `UNSUPPORTED` remains valid; lower-bound provider shape is canonical; exact/approximate/unknown/contextual-none remain valid; unknown never becomes zero; and the validator still rejects the non-canonical `minimumMonths` representation for `lower_bound`.

## Live verification

Builder live run: **NO — PENDING LOCAL LIVE VERIFICATION**.

First run the narrow AR-03C diagnostic for C06/C09 if desired, then perform the required full AR-03A rerun with the canonical model. The full rerun remains the authority for reassessing the First Human Test Gate.

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_ar03a_live_groq_decision_accountability_semantic_verification.js
```

## Production semantics changed

**NO.** The correction makes the provider-facing contract conform to already-canonical PA-06 / AR-02E / AR-02D REOPEN semantics.

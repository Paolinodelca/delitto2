# AR-03F — Residual Live Semantic Instability Diagnosis

## Verdict

**B — RESIDUAL DIAGNOSTICS READY; LOCAL LIVE EVIDENCE REQUIRED BEFORE AR-03G**

**FIRST HUMAN TEST GATE: PENDING**

## Repository-first diagnosis

The canonical contracts are not ambiguous.

- Contextual non-authority is canonical only when `decisionAuthority = none` is explicit and a concrete represented decision/responsibility context exists. It is contextual knowledge, not a negative Measurement/Contribution.
- `shared` requires effective joint decision authority, not consultation/collaboration. `P_SHARED_3` explicitly states that both approvals were required, formal shared authority, and function scope; its AR-03A expected result remains contract-conformant.

The residual live transcript is insufficient to identify the concrete provider candidate fields behind the contextual-none rejection: the executor previously retained validation errors but discarded the rejected candidate shape. Likewise, a valid `UNSUPPORTED` result discarded the candidate shape, preventing direct comparison of the three shared outputs.

Therefore AR-03F does not infer a semantic correction from the lossy transcript.

## Minimal diagnostic seam

`runGroqDecisionAccountabilitySemanticExecutor.js` now attaches a sanitized `diagnostic.candidateShape` only to non-supported outcomes after successful JSON parsing:

- `interpretationStatus`
- `decisionAuthority`
- `consequenceScope`
- `accountabilityEvidence`
- continuity state/qualification/numeric shape
- boolean presence only for `context.decision`, `context.responsibility`, `context.consequence`

No Evidence text, context text, provider raw output, API key, headers, or secrets are added to diagnostics. Semantic results and validator behavior are unchanged.

The AR-03A harness adds `AR03F_DIAGNOSTIC=1`, selecting only:

`C05_CONTEXTUAL_NONE`, `C12_HOSTILE_EVIDENCE`, `C03_SHARED`, `P_SHARED_2`, `P_SHARED_3`.

Existing AR-03C diagnostic mode and progress logging are preserved.

## Diagnostic table

| Case | Expected | Observed live evidence available | Provider candidate shape | Validator result | First divergence/rejection point | Classification | AR-03G correction required |
|---|---|---|---|---|---|---|---|
| C05_CONTEXTUAL_NONE | SUPPORTED / none | candidate rejected; positive/contextual minimum sufficiency | **PENDING LOCAL NARROW DIAGNOSTIC** | rejected | semantic candidate validation; concrete missing/divergent field not recoverable from old transcript | contract is canonical; A1/A2/A3/A5 distinction pending candidate shape | **PENDING LOCAL NARROW DIAGNOSTIC** |
| C12_HOSTILE_EVIDENCE | SUPPORTED / none | latest full live rejected; earlier runs produced UNSUPPORTED and valid SUPPORTED/none | **PENDING LOCAL NARROW DIAGNOSTIC** | latest: rejected | semantic candidate validation; concrete missing/divergent field not recoverable from old transcript | live instability established; exact contextual rejection cause pending | **PENDING LOCAL NARROW DIAGNOSTIC** |
| C03_SHARED | SUPPORTED / shared / function | latest full live valid SUPPORTED/shared/function | supported shape known materially | valid | none individually; failure derived from group stability | canonical result valid | none individually |
| P_SHARED_2 | SUPPORTED / shared / function | latest full live valid SUPPORTED/shared/function | supported shape known materially | valid | none individually; failure derived from group stability | canonical result valid | none individually |
| P_SHARED_3 | SUPPORTED / shared / function | latest full live valid UNSUPPORTED; earlier narrow live produced valid SUPPORTED/shared/function | old UNSUPPORTED candidate fields unavailable | valid UNSUPPORTED | model semantic classification before validator rejection | canonical contract/fixture expectation are aligned; cross-run model execution variability is demonstrated, but narrow candidate comparison is still required before choosing B1 vs B4 closure treatment | **PENDING LOCAL NARROW DIAGNOSTIC** |

## AR-03G handoff boundary

AR-03G remains the single closure task. Before it is authored/executed, run the five-case local diagnostic and retain its output.

For contextual-none, AR-03G may use **MINIMAL TECHNICAL CORRECTION AUTHORIZED BY EXISTING CONTRACT** only if the new candidate shape demonstrates A1/A2/A3/A5 against the already-canonical contextual-none contract. If the repository/provider evidence instead exposes real authority ambiguity, stop for Product/Architecture Authority.

For shared, no test-expectation correction is currently authorized: `P_SHARED_3` is materially aligned with the canonical `shared` definition. The historical runs already demonstrate execution variability (SUPPORTED in an earlier narrow run, UNSUPPORTED in the latest full run). The new narrow diagnostic must determine whether a specific provider-facing contract-expression defect is demonstrated; otherwise AR-03G must use **NO CORRECTION — MODEL VARIABILITY MUST BE ACCEPTED/MEASURED** rather than heuristic fallback, retry, voting, or case-specific logic.

Exact local command:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
$env:AR03F_DIAGNOSTIC="1"
node scripts/test_ar03a_live_groq_decision_accountability_semantic_verification.js
Remove-Item Env:AR03F_DIAGNOSTIC
```

Builder live execution: **NO — GROQ_API_KEY unavailable.**

## Regression

PASS:

- `scripts/test_ar03f_residual_live_semantic_instability_diagnostics.js`
- `scripts/test_ar03e_groq_structured_output_schema_compatibility.js`
- `scripts/test_ar03d_decision_accountability_contract_conformance.js`
- `scripts/test_ar03c_semantic_candidate_rejection_diagnostics.js`
- `scripts/test_ar02d_reopen_decision_accountability_production_semantic_executor.js`
- `scripts/test_ar02c_decision_accountability_semantic_integration.js`
- `scripts/test_build_decision_accountability_observation.js`
- `scripts/test_build_decision_accountability_measure_result.js`
- `scripts/test_groq_model_compatibility.js`
- `scripts/fringe_health_check.js` — All health checks passed.

Production semantic policy changed: **NO**. Validator/schema semantics changed: **NO**. Expected AR-03A meanings changed: **NO**. Commit/push: **NO**.

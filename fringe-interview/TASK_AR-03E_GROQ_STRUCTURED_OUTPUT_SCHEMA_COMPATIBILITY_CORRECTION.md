# IMAGO — AR-03E Groq Structured Output Schema Compatibility Correction

## Verdict

**A — GROQ STRUCTURED OUTPUT COMPATIBILITY CORRECTED**

**FIRST HUMAN TEST GATE: PENDING FULL LIVE AR-03A RERUN**

## Root cause

AR-03D introduced provider-facing cross-field enforcement by adding a **root-level `anyOf`** over three complete candidate object branches (`UNSUPPORTED`, positive `SUPPORTED`, contextual-none `SUPPORTED`) and a second `anyOf` over continuity object variants.

Repository comparison against the pre-AR-03D schema shows that nullable property-level `anyOf` unions already existed during the earlier successful live Groq execution. The new root-level branch construction was introduced only by AR-03D and the full live AR-03A then changed from provider-accepted requests to immediate `structured_output_rejected` for 18/18 requests.

Groq Structured Outputs documents `anyOf` as a supported union composition inside a root object/property boundary, with strict schemas requiring all object properties to be required and all objects closed with `additionalProperties: false`. The AR-03D root-level discriminator attempted to encode canonical cross-field semantics in the provider schema rather than leaving them to the existing canonical validator.

**First incompatible correction point:** provider-facing JSON Schema — root-level `anyOf` branch structure introduced by AR-03D.

## Correction

The Decision Accountability provider-facing schema is restored to the previously live-compatible **single root object** shape. It remains structurally typed and closed, but does not encode cross-field semantic conditions through root branching.

Canonical AR-03D semantics remain unchanged and are enforced by:

- the existing production semantic prompt, which requires `UNSUPPORTED` when positive authority lacks a supported consequence scope and requires scalar `months` for `exact` / `approximate` / `lower_bound` / `upper_bound`;
- the existing canonical validator, which remains the final authority and is **not relaxed**.

Therefore:

- positive `SUPPORTED` without supported `consequenceScope` remains invalid;
- canonical `UNSUPPORTED` remains valid;
- `lower_bound + months` remains valid;
- `lower_bound + minimumMonths` remains invalid;
- exact / approximate / unknown / contextual-none behavior remains unchanged.

No semantic policy, Observation, Measurement, Knowledge, model-selection, GM-01 or GM-02 behavior was changed.

## Regression

PASS:

- `node scripts/test_ar03e_groq_structured_output_schema_compatibility.js`
- `node scripts/test_ar03d_decision_accountability_contract_conformance.js`
- `node scripts/test_ar03c_semantic_candidate_rejection_diagnostics.js`
- `node scripts/test_ar02d_reopen_decision_accountability_production_semantic_executor.js`
- `node scripts/test_ar02c_decision_accountability_semantic_integration.js`
- `node scripts/test_build_decision_accountability_observation.js`
- `node scripts/test_build_decision_accountability_measure_result.js`
- `node scripts/test_groq_model_compatibility.js`
- `node scripts/fringe_health_check.js` → `All health checks passed.`

## Live verification

`GROQ_API_KEY` is not available in the Builder environment.

**Status: PENDING LOCAL LIVE VERIFICATION**

Recommended local sequence after applying the overlay:

```powershell
$env:GROQ_MODEL="openai/gpt-oss-120b"
node scripts/test_ar03a_live_groq_decision_accountability_semantic_verification.js
```

A single/narrow live request may be used first if the owner wants to verify that the provider accepts the schema before spending all 18 calls. AR-03E does not open the First Human Test Gate.

## Changed files

- `src/app/knowledge/decisionAccountabilityProductionSemanticCandidate.js`
- `scripts/test_ar03d_decision_accountability_contract_conformance.js`
- `scripts/test_ar03e_groq_structured_output_schema_compatibility.js`
- `TASK_AR-03E_GROQ_STRUCTURED_OUTPUT_SCHEMA_COMPATIBILITY_CORRECTION.md`
- `TASK_AR-03E_MANIFEST.txt`

No commit. No push.

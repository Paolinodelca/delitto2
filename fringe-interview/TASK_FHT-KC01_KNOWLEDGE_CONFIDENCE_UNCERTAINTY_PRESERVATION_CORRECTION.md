# FHT-KC01 — Knowledge Confidence Uncertainty Preservation Correction

## Verdict

**A — KNOWLEDGE CONFIDENCE UNCERTAINTY PRESERVATION CORRECTED**

## Generic contract correction

The generic Measurement → DimensionContribution → elementary Knowledge boundary now represents semantic meaning independently from epistemic confidence. `confidenceState` is canonicalized as `known`, `partial`, or `not_yet_derived`. Numeric `confidence` remains mandatory for the known branch and is `null` for non-known branches; unknown confidence is never defaulted to 0/1 or another scalar. Existing support scalars on MeasurementResult may remain `null` when confidence is non-known, while specialized inference-support detail is preserved losslessly in projection extensions.

Decision Accountability projection now accepts an already-valid `draft` specialized semantic result even when inference support is partial. It preserves the specialized score/direction exactly, carries the full specialized inference-support object, and does not synthesize confidence. Invalid, insufficient, or contextual specialized results still fail closed.

## DimensionContribution / aggregation

DimensionContribution carries the same independent `confidenceState`; mapping computes numeric confidence only for the existing known-confidence branch. For non-known confidence, semantic contribution value is still derived from the authorized normalized semantic value and mapping weight, while confidence remains `null`.

`confidence_weighted_signed_mean_v1` is unchanged for all-known inputs. If any contribution has non-known confidence, aggregation switches to the bounded `semantic_signed_mean_with_explicit_unknown_confidence_v1` branch: semantic signed contributions are aggregated without using confidence as a weight, while confidence aggregation remains explicitly non-derived (`null`). Known and unknown confidence are therefore not silently conflated.

## Knowledge behavior

An elementary state may now be `observed` with supported estimate/direction while `confidenceState` is `partial` or `not_yet_derived` and numeric confidence is `null`. Confidence incompleteness alone no longer converts supported meaning into unknown/neutral/negative/absent Knowledge. Derived-rule consumers remain fail-closed because a non-numeric confidence cannot satisfy numeric minimum-confidence gates.

## Changed files

- `src/core/observation/buildMeasurementResult.js`
- `src/core/observation/validateMeasurementResult.js`
- `src/core/measurement/decisionAccountability/projectDecisionAccountabilityMeasureResult.js`
- `src/core/dimension/buildDimensionContribution.js`
- `src/core/dimension/validateDimensionContribution.js`
- `src/core/dimension/mapMeasurementResultToDimensionContributions.js`
- `src/core/dimension/aggregateDimensionContributions.js`
- `src/core/dimension/buildDimensionKnowledgeState.js`
- `src/core/dimension/validateDimensionKnowledgeState.js`
- `scripts/test_build_decision_accountability_measure_result.js`
- `scripts/test_fht_kc01_knowledge_confidence_uncertainty_preservation.js`

No pre-existing DR02/AP01/Product Authority file was modified by KC01. No overlapping dirty-file ownership was required. The supplied handover contains no usable `.git`, so Git cleanliness is not claimed.

## Verification

PASS:

- `test_fht_kc01_knowledge_confidence_uncertainty_preservation.js`
- `test_build_decision_accountability_measure_result.js`
- `test_ar02c_decision_accountability_semantic_integration.js`
- `test_ar02d_reopen_decision_accountability_production_semantic_executor.js`
- `test_map_measurement_result_to_dimension_contributions.js`
- `test_measurement_result_dimension_contribution_mapping_hardening.js`
- `test_knowledge_ledger.js`
- `test_knowledge_snapshot_construction_hardening.js`
- `test_person_knowledge_matrix_regression.js`
- `test_health_registered_observation_measurement_result_normalization.js`
- `test_fht_pa01_quantified_outcome_semantic_authority.js`
- `test_fht_ap01_live_acquisition_purpose_planning.js`
- `test_fht_dr02_final_representation_semantic_authority.js`
- MeasurementResult / DimensionContribution / aggregation / DimensionKnowledgeState / KnowledgeLedgerSnapshot health checks
- full `fringe_health_check.js` — **All health checks passed**

## Anomalies

One existing Decision Accountability unit assertion expected partial inference support to project to `null`; it was updated because that expectation was precisely the AR04/KC01 boundary being corrected. Known-confidence mapping formula provenance was kept byte-for-byte structurally compatible after regression exposed an unnecessary added `state` field.

## FHT-AI01

**FHT-AI01 prerequisite resolved; same FHT-AI01 may now be resumed.**

FHT-AI01 was not resumed inside KC01. First Human Test gate remains **CLOSED**.

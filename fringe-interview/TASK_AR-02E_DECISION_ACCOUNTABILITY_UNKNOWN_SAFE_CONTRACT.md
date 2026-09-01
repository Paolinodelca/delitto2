# AR-02E — Decision Accountability Unknown-Safe Contract Correction

## Verdict

**A — UNKNOWN-SAFE DECISION ACCOUNTABILITY CONTRACT CORRECTION COMPLETE**

AR-02E applies the PA-06 / PD-040 contract correction only. No production executor, provider/model call, prompt, generic epistemic framework, Product Authority change, coefficient change, or new scoring rule was introduced.

## Corrected Observation representation

`DecisionAccountabilityObservation` now preserves missing semantic values instead of manufacturing enum defaults:

- `decisionAuthority`: canonical enum or `null`; missing/invalid never becomes `none`.
- `consequenceScope`: canonical enum or `null`; missing/invalid never becomes `individual_task`.
- `accountabilityEvidence`: canonical enum or `null`; missing/invalid never becomes `claimed`.
- `observationStatus`: `observed` only when positive minimum sufficiency is present; explicit `decisionAuthority = none` is `contextual`; otherwise the specialized object is `insufficient` and cannot enter the positive Measurement path.
- deterministic `evidenceIds` and concrete non-empty context remain required for positive status.

## Temporal representation

Responsibility continuity is represented narrowly as `responsibilityContinuity`:

- `{ state: "known", qualification: "exact", months }`
- `{ state: "known", qualification: "approximate", months }`
- `{ state: "known", qualification: "lower_bound", months }`
- `{ state: "known", qualification: "upper_bound", months }`
- `{ state: "known", qualification: "range", minimumMonths, maximumMonths }`
- `{ state: "unknown" | "not_applicable" | "not_yet_derived" }`

The legacy scalar `responsibilityContinuityMonths` is retained only as an exact-value compatibility projection and is `null` for unknown/qualified states. Unknown never becomes `0`; bounds/approximations never become invented exact months.

## Inference-support representation

Each of `evidenceQuality`, `sourceConvergence`, `consistency`, and `coverage` independently uses an epistemic state:

- known: `{ state: "known", value: [0..1], producer?: { producerRef } }`
- unavailable: `{ state: "unknown" | "not_applicable" | "not_yet_derived" }`

Numeric legacy inputs are accepted as known values for directly affected deterministic fixtures. Missing inputs become `not_yet_derived`, never zero. Known producer provenance is preserved and validated when supplied.

## Measurement behavior

Required positive semantics (`decisionAuthority` recommendation/shared/final and supported `consequenceScope`) remain mandatory.

The existing v1 weighted-sum semantics require all four strength components for a final score. PA-06 forbids both zero substitution and unauthorized weight renormalization. Therefore, when optional `accountabilityEvidence` or exact continuity is unavailable/qualified, the specialized result is explicitly `insufficient` with `score = null` rather than inventing a partial aggregation rule.

When all strength components are known, the existing coefficients, benchmark, thresholds, and score are unchanged.

Inference support remains separate. Its aggregate is calculated only when all four canonical inputs are known; otherwise `inferenceSupport.state = "partial"`, aggregate `value`/`band` remain `null`, and known components are preserved without depressing measured strength.

## Projection eligibility gate

`projectDecisionAccountabilityMeasureResult()` now returns a generic canonical `MeasurementResult` only for a valid `draft` specialized result with known aggregate inference support. `invalid`, `insufficient`, `contextual`, and partial-inference results cannot project and therefore cannot create `DimensionContribution` / Knowledge through this path.

The directly affected Leadership capability adapter/health regression was aligned with the corrected non-draft `insufficient` semantics so it does not reinterpret a missing score as a measured result.

## AR-02C compatibility

AR-02C authority resolution and authorized Observation construction were not redesigned. Existing deterministic exact/numeric test fixtures are compatibility-normalized to the corrected contract and the full AR-02C Evidence → Observation → Measurement → MeasurementResult → DimensionContribution → Knowledge / PKM / Coverage path remains green when sufficient canonical information exists.

## Files changed

See `TASK_AR-02E_MANIFEST.txt`.

## Verification

PASS:

- `node scripts/test_ar02c_decision_accountability_semantic_integration.js`
- `node scripts/test_ar02a_runtime_answer_knowledge_vertical_slice.js`
- `node scripts/test_build_decision_accountability_observation.js`
- `node scripts/test_build_decision_accountability_measure_result.js`
- `node scripts/test_build_decision_accountability_leadership_contribution.js`
- `node scripts/test_measurement_capability_bridge_regression.js`
- `node scripts/test_build_plant_manager_leadership_demo_result.js`
- `node scripts/test_build_plant_manager_leadership_scenario_comparison.js`
- `node scripts/fringe_health_check.js` — **All health checks passed.**

The documented unrelated baseline `test_all_core` failure was not used as an AR-02E gate, per task instruction.

## Reopenability

**AR-02D is now technically reopenable without another Product decision for the unknown-safe Observation/Measurement contract.** AR-02E does not itself implement the production free-form semantic executor.

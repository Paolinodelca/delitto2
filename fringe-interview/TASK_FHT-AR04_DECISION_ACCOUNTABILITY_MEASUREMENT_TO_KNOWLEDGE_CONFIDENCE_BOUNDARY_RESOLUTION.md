# FHT-AR04 — Decision Accountability Measurement-to-Knowledge Confidence Boundary Resolution

## Verdict

**B — MINIMAL CANONICAL ARCHITECTURE BOUNDARY CAN BE DEFINED WITHOUT NEW PRODUCT AUTHORITY**

FHT-AI01 remains **C — IMPLEMENTATION BLOCKED** during this review. First Human Test gate remains **CLOSED**.

## Current blocking contract

The specialized Decision Accountability path already distinguishes semantic measurement meaning from inference-support completeness:

- a valid `draft` result may carry a computed `score` / `band`;
- `inferenceSupport.state` may independently be `partial`;
- each inference-support component may be `not_yet_derived`;
- partial inference support has no fabricated aggregate `value` / `band`.

The block is introduced by the generic projection boundary, not by the specialized semantic Measurement. `projectDecisionAccountabilityMeasureResult()` returns `null` unless `inferenceSupport.state === "known"` because generic `MeasurementResult` requires numeric `confidence`, `coverage`, `evidenceQuality`, `sourceReliability`, `independence`, and `consistency`. Downstream `DimensionContribution` also requires numeric confidence, and elementary `DimensionKnowledgeState` requires numeric confidence/coverage/consistency. The current aggregation uses contribution confidence as a semantic weighting operand. Therefore unknown confidence cannot be preserved through the generic pipeline without either fabricating a scalar or suppressing otherwise-valid semantic meaning.

## Semantic result vs confidence

The repository already establishes that these are different axes.

Canonical Product Authority in `PD-040` states that `evidenceQuality`, `sourceConvergence`, `consistency`, and `coverage` are inference-support epistemic information owned by separate producers; they may remain not yet available and the single-Evidence interpreter may not invent them. Crucially, it also states that Measurement strength must be calculated from known applicable strength components while inference support remains separately unavailable/partial and **must not gate or depress measured strength by fabricated defaults**.

`REPRESENTATION_MODEL.md` independently requires confidence/uncertainty, coverage, quality, reliability, independence and consistency to remain distinct from value. `PD-039` makes no-Knowledge-effect conditional on absence of a valid semantic Observation, not on absence of fully derived confidence metadata.

Therefore the current generic scalar-only confidence boundary incorrectly conflates:

`valid supported semantic measurement + confidence not yet derived`

with:

`no Measurement eligible for Knowledge`.

No new Product Decision is required to separate those states; that separation is already canonical.

## Minimum canonical architecture boundary

### Canonical input state

A valid authorized `DecisionAccountabilityObservation` produces a valid specialized `DecisionAccountabilityMeasureResult` with:

- `resultStatus = draft`;
- semantic `score` / `band` computed only from known applicable strength components;
- `inferenceSupport.state = partial` when one or more epistemic support components are not canonically derived;
- unknown support components explicitly preserved as `not_yet_derived` (or another already-allowed non-known state);
- no invented numeric aggregate confidence.

### Canonical output state

The generic Measurement → DimensionContribution → elementary Knowledge path must be able to preserve two independent facts:

1. **semantic result is known/supported**;
2. **confidence/inference support is partial or not yet derived**.

`not_yet_derived` must remain epistemic metadata/state. It must never be converted to `0`, `1`, another scalar, negative person meaning, or a semantic-result veto.

### MeasurementResult

A generic calculated `MeasurementResult` may carry the already-computed semantic `normalizedValue` and `direction` while its confidence/support information is explicitly non-known. The subsequent corrective task must introduce the minimum canonical representation for non-derived confidence/support rather than requiring a fabricated scalar. Decision Accountability specialized inference-support detail must remain losslessly traceable through the projection.

Fail closed if the semantic specialized result itself is invalid/non-draft, the Observation is invalid/ineligible, semantic authority is unresolved, or projection cannot preserve the specialized result losslessly.

### DimensionContribution

A DimensionContribution may preserve a supported semantic contribution while its confidence is explicitly non-known. Mapping must not multiply semantic meaning by an invented confidence value. The existing formula `measurementResult.confidence * confidenceFactor` is applicable only when confidence is known; unknown confidence requires an uncertainty-preserving branch, not numeric substitution.

### Knowledge

An elementary observed Knowledge state may exist when supported semantic contribution exists while its confidence remains explicitly non-known/not-yet-derived. Its semantic estimate/direction must derive only from supported semantic contributions. Confidence incompleteness must remain separately visible and must not be converted into a neutral midpoint, weakness, contradiction, zero-confidence semantic weight, or absence.

The current `confidence_weighted_signed_mean_v1` cannot be reused unchanged for an unknown-confidence contribution because zero/unknown confidence currently affects semantic aggregation. The corrective boundary must therefore preserve semantic aggregation independently from confidence aggregation whenever confidence is not derived. This is a bounded correction to the existing generic projection/aggregation contracts, not a new Decision Accountability scoring policy.

### Fail-closed conditions

No downstream Knowledge effect when any of the following applies:

- unresolved/broken semantic authority;
- no valid Decision Accountability Observation;
- specialized result is `invalid`, `insufficient`, or `contextual` rather than semantic `draft`;
- semantic value itself cannot be computed without inventing unknown strength components;
- generic projection would lose or strengthen specialized semantic meaning;
- downstream code would need to fabricate confidence/support values.

Partial/not-yet-derived confidence alone is **not** a fail-closed condition.

## Minimum subsequent corrective implementation surface

Create one separately bounded corrective task before resuming the same FHT-AI01. Its minimum responsibility is to make the generic Measurement → DimensionContribution → elementary Knowledge confidence representation uncertainty-preserving.

Expected implementation surface, subject to repository-first confirmation in that task:

- `src/core/observation/buildMeasurementResult.js`
- `src/core/observation/validateMeasurementResult.js`
- `src/core/measurement/decisionAccountability/projectDecisionAccountabilityMeasureResult.js`
- `src/core/dimension/buildDimensionContribution.js`
- `src/core/dimension/validateDimensionContribution.js`
- `src/core/dimension/mapMeasurementResultToDimensionContributions.js`
- `src/core/dimension/aggregateDimensionContributions.js`
- `src/core/dimension/buildDimensionKnowledgeState.js`
- `src/core/dimension/validateDimensionKnowledgeState.js`

Only contract/build/validation/aggregation changes strictly required to preserve unknown confidence are authorized. Do not alter Decision Accountability semantic scoring, acquisition planning, Runtime routing, Quantified Outcome semantics, Representation, or target matching.

## Deterministic coverage required for corrective task

Prove at minimum:

1. valid Decision Accountability semantic result + all support known still follows the existing known-confidence behavior;
2. valid semantic result + one/more `not_yet_derived` support components projects to a valid generic MeasurementResult without invented scalar confidence;
3. semantic normalized value/direction are identical to the specialized result meaning;
4. unknown confidence survives MeasurementResult → DimensionContribution;
5. semantic contribution survives without multiplication by fabricated `0`/`1` confidence;
6. elementary Knowledge may be observed while confidence remains explicitly non-known;
7. unknown confidence does not create neutral/negative person meaning;
8. invalid/insufficient/contextual specialized results still produce no contribution/Knowledge;
9. known and unknown confidence are not silently conflated during aggregation;
10. repeated projection remains deterministic and provenance-preserving;
11. existing generic MeasurementResult / DimensionContribution / KnowledgeSnapshot regressions remain passing after intentional contract updates;
12. existing Decision Accountability semantic tests remain passing;
13. Quantified Outcome regressions remain passing and its semantics are not generalized into Decision Accountability;
14. health check passes.

## Inspected production files / contracts

Product authority:

- `docs/20-product/REPRESENTATION_MODEL.md`
- `docs/20-product/PRODUCT_DECISIONS.md` — especially PD-038, PD-039, PD-040

Decision Accountability:

- `src/core/measurement/decisionAccountability/buildDecisionAccountabilityObservation.js`
- `src/core/measurement/decisionAccountability/validateDecisionAccountabilityObservation.js`
- `src/core/measurement/decisionAccountability/buildDecisionAccountabilityMeasureResult.js`
- `src/core/measurement/decisionAccountability/validateDecisionAccountabilityMeasureResult.js`
- `src/core/measurement/decisionAccountability/projectDecisionAccountabilityMeasureResult.js`
- `src/app/knowledge/runDecisionAccountabilitySemanticKnowledgePath.js`

Generic Measurement / Dimension / Knowledge:

- `src/core/observation/buildMeasurementResult.js`
- `src/core/observation/validateMeasurementResult.js`
- `src/core/dimension/buildDimensionContribution.js`
- `src/core/dimension/validateDimensionContribution.js`
- `src/core/dimension/mapMeasurementResultToDimensionContributions.js`
- `src/core/dimension/aggregateDimensionContributions.js`
- `src/core/dimension/buildKnowledgeLedger.js`
- `src/core/dimension/buildKnowledgeSnapshot.js`
- `src/core/dimension/buildDimensionKnowledgeState.js`
- `src/core/dimension/validateDimensionKnowledgeState.js`

Comparison only:

- `src/core/measurement/quantifiedOutcome/projectQuantifiedOutcomeMeasureResult.js`

## Existing tests executed

PASS:

- `node scripts/test_build_decision_accountability_measure_result.js`
- `node scripts/test_ar02c_decision_accountability_semantic_integration.js`
- `node scripts/test_ar02d_reopen_decision_accountability_production_semantic_executor.js`

These confirm the specialized unknown-safe behavior and the current integration boundary; they do not authorize fabricated generic confidence.

## Anomalies

No source or test files were modified. No overlay created. No commit or push performed.

The supplied handover ZIP does not contain usable Git metadata for this review, so Git cleanliness is not claimed.

## Exact next boundary

Before resuming FHT-AI01, execute one bounded corrective implementation task implementing the already-authorized separation:

**supported semantic Measurement/Contribution/Knowledge may exist while confidence/inference support remains explicitly not yet derived.**

After that correction passes deterministic regression, resume the **same FHT-AI01**. Do not create FHT-AI01B or FHT-AI02.

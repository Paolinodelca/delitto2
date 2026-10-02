# IMAGO — FHT-DA01
## Decision Accountability Measurement Eligibility and Semantic Failure Trace Corrective

### Verdict
**B — CORRECTIVE COMPLETE; CONTROLLED LIVE VERIFICATION REQUIRED**

No commit. No push.

## 1. First Failing Boundary Confirmed

The corrective addresses the deterministic AR07 boundary:

`valid canonical DecisionAccountabilityObservation`
→ **specialized DA Measurement eligibility**.

The prior implementation made an otherwise valid positive Observation `insufficient` whenever `accountabilityEvidenceScore` or `responsibilityContinuityScore` was null.

## 2. Previous Measurement Behavior

For an observed DA case, the previous builder required all four numeric strength components:

- decision authority;
- consequence scope;
- accountability explicitness/evidence;
- exact responsibility continuity.

Unknown accountability explicitness or unknown/non-exact continuity therefore prevented generic Measurement, DimensionContribution and Knowledge.

This contradicted PD-040, which permits those optional semantic facts to remain unknown and requires strength to use known applicable components without zero-imputation.

## 3. Corrected Measurement Eligibility

Positive `observed` DA Observations now remain Measurement-eligible when the canonical required positive semantics are present:

- positive authority (`recommendation`, `shared`, `final`);
- supported consequence scope;
- valid Evidence/context/provenance.

Optional unknown accountability explicitness and continuity remain null and no longer invalidate the whole strength Measurement.

`none` remains contextual and cannot become positive Knowledge. Invalid Observations remain fail-closed.

## 4. Strength Calculation

The existing component mappings, weights and thresholds are unchanged.

The weighted-sum contract is applied only to numeric known/applicable components and normalized by the sum of their applicable weights:

`sum(component × configuredWeight) / sum(knownApplicableWeights)`.

This prevents an omitted unknown component from acting as an implicit zero.

No new threshold, score mapping or Product rule was introduced.

Responsibility continuity contributes numerically only when the existing contract has an **exact** month value. Approximate/bounded/range continuity remains semantically preserved and is not collapsed to an invented exact numeric value.

## 5. Unknown Preservation

Verified:

- unknown continuity → `responsibilityContinuityScore = null`;
- unknown accountability explicitness → `accountabilityEvidenceScore = null`;
- neither becomes zero/default;
- inference-support `not_yet_derived` remains partial;
- numeric confidence remains null when not canonically known;
- inference-support uncertainty does not reduce measured strength.

## 6. Semantic Failure Trace

A bounded, deterministic, non-authoritative `semanticExecutionTrace` now distinguishes supported repository categories including:

- semantic authority failure;
- provider technical failure;
- provider structured-output rejection;
- invalid/malformed provider candidate;
- legitimate `UNSUPPORTED` semantic candidate;
- Observation construction/validation failure;
- specialized Measurement insufficient/failure;
- generic Measurement projection failure;
- Knowledge construction failure;
- successful Knowledge production.

Trace fields are bounded to stage/status/category/reason code plus already-authorized semantic/execution/Evidence/provider category references.

No raw Runtime answer, transcript, new Evidence, person trait, target conclusion or invented score is stored.

The staged Private Beta journey retains cumulative `fhtSemanticExecutionTraces` for controlled operational verification while keeping them separate from Knowledge and Representation.

## 7. Journey-Level Behavior

Added a live-equivalent staged regression:

authorized DA acquisition
→ Execution
→ accepted Evidence
→ valid shared-authority DA Observation
→ unknown continuity + unknown accountability explicitness
→ calculated specialized Measurement
→ generic Measurement
→ DimensionContribution
→ KnowledgeSnapshot
→ `runtimeKnowledgeResults`.

Assertions confirm:

- DA Knowledge survives;
- optional unknowns remain null;
- no zero/default/confidence is invented;
- success trace reaches journey diagnostic state.

A second journey case verifies no-Knowledge remains distinguishable through a bounded failure trace.

## 8. Tests

PASS:

- new FHT-DA01 deterministic + journey-level regression;
- updated AR-02D production semantic executor regression;
- FHT-KC01;
- FHT-AI01;
- FHT-AS01 original;
- FHT-AS01 corrective lifecycle;
- FHT-RS02;
- staged Private Beta journey;
- AR-02C;
- AR-03C;
- AR-03F;
- Measurement/Capability bridge regression;
- full `scripts/fringe_health_check.js`.

Health result:

**All health checks passed.**

## 9. Residual Limitations

- Provider/model execution may still legitimately fail or return semantic insufficiency.
- This corrective does not make every DA answer produce Knowledge.
- Production provider reliability still requires controlled live verification.
- No adaptive retry was implemented.
- QO richness, Adaptive Acquisition/Core timeline redundancy, referential grounding, narrative tuning and Beta feedback persistence remain out of scope.
- Trace is diagnostic session state only; no general telemetry/persistence platform was introduced.

## 10. Controlled Live Required

Repeat the controlled Marco run.

Acceptance is not “DA must always succeed”.

The required result is:

- if a valid DA candidate/Observation is produced with unknown continuity/accountability explicitness, Measurement must not be lost solely for those unknowns;
- if DA still produces no Knowledge, `fhtSemanticExecutionTraces` must identify the actual bounded failure stage/category;
- if DA and QO both reach current-session Knowledge, existing RS02 should preserve both in Professional Representation.

## 11. Product Authority Status

**No new Product Decision required.**

The implementation follows existing PD-040. `docs/20-product/` is unchanged.

## 12. Verdict

**B — CORRECTIVE COMPLETE; CONTROLLED LIVE VERIFICATION REQUIRED**

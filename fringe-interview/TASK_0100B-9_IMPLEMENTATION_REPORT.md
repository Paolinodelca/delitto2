# TASK 0100B-9 — Implementation Report

## Repository Inspection

The complete handover archive was inspected. The application root is `repository/`. The Core roadmap is located at `repository/docs/15-architecture_specifications/CORE_ROADMAP.md` relative to that root.

Inspected components included the real `DimensionKnowledgeState` builder, validator, tests and elementary aggregator; `DerivedKnowledgeRule` and `DerivedKnowledgeResult`; `CapabilityRecipe`, `CapabilityExecutionResult` and `executeCapabilityRecipe`; KnowledgeSnapshot validation and identity patterns; Dimension and Capability public APIs; regression gates; Health Check integration; and the relevant dependency graph.

The existing `DimensionKnowledgeState` already contains historical elementary/derived vocabulary, but its shape is evidence-oriented and does not provide the explicit Capability Recipe, execution-result and rule-result references required here. The implemented solution therefore uses a distinct contract.

## Architectural Decision

Strategy A was selected: a separate `DerivedDimensionKnowledgeState` contract in `src/core/dimension/`.

A minimal declarative `DerivedDimensionMapping` was necessary because the existing Derived Knowledge Foundation produces boolean rule results. The mapping explicitly associates an allowlisted `derived_dimension` target with a numeric estimate in the range `[0,1]`. This avoids implicit boolean-to-number, string-to-number or null-to-zero conversion.

The transformation imports the leaf `validateCapabilityExecutionResult` validator rather than the Capability index. Capability does not import the derived-state builder, so no CommonJS cycle is introduced.

## Design

### DerivedDimensionMapping

Fields: `id`, `resultTarget`, `dimensionId`, `estimate`, `confidenceStrategy`, `metadata`, `extensions`.

Only `resultTarget.knowledgeType === "derived_dimension"` is eligible. Estimate must already be numeric and within `[0,1]`. The only confidence strategy is `minimum`. Duplicate mapping targets are rejected.

### DerivedDimensionKnowledgeState

Fields: `id`, `dimensionId`, `knowledgeLayer`, `stateType`, `status`, `estimate`, `confidence`, `capabilityId`, `recipeRef`, `recipeVersion`, `snapshotRef`, `executionRefs`, `sourceResultRefs`, `dependencyRefs`, `provenance`, `derivedAt`, `metadata`, `extensions`.

The discriminants are fixed to `knowledgeLayer: "derived"`, `stateType: "derived"`, and `status: "known"`. Coverage and consistency are intentionally omitted because the available inputs do not provide a justified semantic denominator or agreement model.

### Transformation

`buildDerivedDimensionKnowledgeStates(executionResults, mappings, options)` validates all execution results and mappings, rejects duplicate execution/result IDs, filters non-eligible targets, groups canonically by dimension plus Snapshot/Capability/Recipe version context, and produces a new sorted collection.

Aggregation uses a confidence-weighted mean of the explicit mapping estimates:

`estimate = sum(mappingEstimate × resultConfidence) / sum(resultConfidence)`

State confidence is the minimum confidence of the aggregated DerivedKnowledgeResult objects. No result count or match ratio is treated as confidence.

A valid empty input, an empty execution result, or no eligible mapped target produces `[]`.

Identity excludes current timestamps and input order. Dependency references include compact Snapshot, Recipe, CapabilityExecutionResult, DerivedKnowledgeRule and DerivedKnowledgeResult references. Provenance is `derived_dimension_aggregation` with producer version `1.0`.

Inputs are not mutated. No Observation, MeasurementResult, DimensionContribution, Ledger append, Snapshot mutation or elementary-state replacement occurs.

## Files Created

- `src/core/dimension/buildDerivedDimensionMapping.js`
- `src/core/dimension/validateDerivedDimensionMapping.js`
- `src/core/dimension/buildDerivedDimensionKnowledgeState.js`
- `src/core/dimension/validateDerivedDimensionKnowledgeState.js`
- `src/core/dimension/buildDerivedDimensionKnowledgeStates.js`
- `src/core/dimension/healthDerivedDimensionState.js`
- `scripts/test_derived_dimension_knowledge_state.js`
- `scripts/test_build_derived_dimension_knowledge_states.js`
- `scripts/test_derived_dimension_state_regression.js`
- `scripts/test_health_derived_dimension_state.js`

## Files Modified

- `src/core/dimension/index.js`
- `scripts/test_all_core.js`
- `scripts/fringe_health_check.js`
- `scripts/test_dimension_aggregation_regression.js`
- `scripts/test_knowledge_ledger_snapshot_regression.js`
- `scripts/test_capability_recipe_execution_regression.js`
- `repository/docs/15-architecture_specifications/CORE_ROADMAP.md`

## Public API

- `buildDerivedDimensionMapping`
- `validateDerivedDimensionMapping`
- `buildDerivedDimensionKnowledgeState`
- `validateDerivedDimensionKnowledgeState`
- `buildDerivedDimensionKnowledgeStates`

Internal aggregation/grouping helpers and the Health Check are not exported.

## Tests

Executed successfully:

- `node scripts/test_derived_dimension_knowledge_state.js`
- `node scripts/test_build_derived_dimension_knowledge_states.js`
- `node scripts/test_derived_dimension_state_regression.js`
- `node scripts/test_health_derived_dimension_state.js`
- `node scripts/test_dimension_aggregation_regression.js`
- `node scripts/test_knowledge_ledger_snapshot_regression.js`
- `node scripts/test_capability_recipe_execution_regression.js`
- `node scripts/test_all_core.js`
- `node scripts/fringe_health_check.js`

Final aggregate result: `IMAGO Core all tests PASSED`. General Health Check result: `All health checks passed`.

## Regression

Regression covers contract shape, derived discriminants, mapping target allowlist, numeric range, deterministic identity/order, duplicate execution and result detection, weighted aggregation, conservative confidence, empty behavior, immutability, public API limits, separation from elementary states, absence of Contribution/Ledger propagation, and dependency-cycle protection.

## Health

The dedicated Health Check executes the real pipeline:

`DimensionContribution → KnowledgeLedger → KnowledgeSnapshot → DerivedKnowledgeRule → CapabilityRecipe → executeCapabilityRecipe → CapabilityExecutionResult → buildDerivedDimensionKnowledgeStates → valid DerivedDimensionKnowledgeState`.

## Static Audit

Positive findings:

- elementary and derived states remain explicit and distinct;
- no duplication of DerivedKnowledgeResult or CapabilityExecutionResult contracts;
- no generic conversion of arbitrary targets;
- no implicit boolean/string/null numeric conversion;
- no Ledger append, Contribution, Observation or MeasurementResult creation;
- no Snapshot or elementary-state mutation;
- no chaining, recursion or multi-pass execution;
- no `eval`, callbacks, executable formulas or arbitrary field paths;
- no hardcoded professional rules, narrative or LLM;
- deterministic aggregation, identity and canonical order;
- conservative confidence;
- explicit Recipe/Capability/version provenance;
- no UUID or current timestamp in identity;
- no persistence, database, network or filesystem storage in Core;
- no dependency cycle and no accidental API export;
- no breaking change detected.

## Documentation

`CORE_ROADMAP.md` now records `0100B-9 — Derived Dimension State Foundation` as COMPLETED, documents the real `CapabilityExecutionResult → DerivedDimensionKnowledgeState[]` pipeline and the permanent elementary/derived reconstruction distinction, and sets `0100B-10 — Person Knowledge Matrix Foundation` as PLANNED / Current Task.

## Known Limitations

Not implemented: Person Knowledge Matrix, persistence, Ledger append, conversion to DimensionContribution, derived-state chaining, multi-pass inference, general conflict resolution, automatic merging with elementary states, or application-specific rules.

## Deliverable

La root applicativa dell’overlay è `repository/`.

The overlay contains only created or modified files, this report and the manifest. The roadmap path is preserved as `repository/docs/15-architecture_specifications/CORE_ROADMAP.md` relative to the application root. The complete repository is not included.

## Task Boundary

Il Task 0100B-10 non è stato iniziato.

# TASK 0100E-43 - Post-Capability-Recipe-Execution Downstream Architecture Review

Status: **COMPLETED**

Outcome: **APPROVED WITH HARDENING GATE**

Date: 2026-08-04

Authorized base: `fc2df4787fc9f2c578d2a6fed1a075eb6fc7da6f`

## Decision

The first legitimate direct downstream consumer of `CapabilityExecutionResult` is the existing Core `buildDerivedDimensionKnowledgeStates(executionResults, mappings, options)` boundary. It consumes complete validated `CapabilityExecutionResult[]` containers together with explicit `DerivedDimensionMapping[]`; it does not consume a detached `DerivedKnowledgeResult[]` collection and no intermediate selection or registration contract is justified.

The consumer is Core-owned and produces `DerivedDimensionKnowledgeState[]`. Its collection cardinality is:

```text
0..N CapabilityExecutionResult + 0..N DerivedDimensionMapping
-> 0..N DerivedDimensionKnowledgeState
```

For each eligible positive `DerivedKnowledgeResult`, the explicit mapping determines the target Dimension and numeric estimate. Results that have no mapping, are not `derived_dimension`, or are not boolean `true` produce no state. Zero execution results, zero derived results, zero eligible results or zero applicable mappings therefore produce an empty state collection; this is not evidence of absence and must not synthesize an unknown or negative state.

## Aggregation boundary

Multiple eligible `DerivedKnowledgeResult` values may contribute to one `DerivedDimensionKnowledgeState` only when they belong to the same Snapshot, Capability, Recipe and Recipe version context and map explicitly to the same Dimension. Within that context, the existing boundary uses a confidence-weighted mean for `estimate` and the minimum source confidence for state `confidence`.

This N:1 aggregation is legitimate because it is the established Derived Dimension reconstruction responsibility introduced with the existing Foundation, not a Matrix or Coverage fusion. However, aggregation across distinct `CapabilityExecutionResult` instances is not approved unless every contributing execution identity is preserved exactly. The current implementation groups by semantic context but records only one execution reference for the group; E-44 must harden or constrain this behavior before the boundary is treated as fully conforming for repeated executions of the same Snapshot/Recipe context.

## Identity, causality and provenance

The complete execution containers remain necessary because they provide Capability, Recipe version, Snapshot context, execution identity and validated result membership. Derived result identity and causal lineage are preserved through `sourceResultRefs`; execution causality through `executionRefs`; Snapshot, Recipe, Rule and lower dependencies through `dependencyRefs`; and mapping identity through `extensions.aggregation.mappingRefs`. The derived state has its own deterministic semantic identity and explicit `derived_dimension_aggregation` provenance.

`confidence` is aggregated as the minimum source-result confidence. The numeric `estimate` is recalculated from explicit mapping estimates using source confidence as weight. No independent `quality` or `reliability` field exists on `DerivedKnowledgeResult`, so neither is consumed or invented. Contribution lineage is preserved by references and dependencies rather than converted into a score.

## Rejected alternatives and downstream guardrails

- Direct detached consumption of `DerivedKnowledgeResult[]` would discard execution-level identity and context.
- A new selection, registration, store or collection contract is unnecessary because the existing execution container and explicit mappings already define the complete input boundary.
- `KnowledgeLedger` and `KnowledgeSnapshot` are upstream reconstruction artifacts, not consumers of execution output.
- `PersonKnowledgeMatrix` consumes Snapshot plus already-built Derived Dimension states and is therefore later.
- `KnowledgeCoverage` consumes PersonKnowledgeMatrix and is later still.
- No PersonKnowledgeMatrix update, Coverage update, Requirement satisfaction, Opportunity, Need, persistence, I/O, Runtime mutation, LLM or report generation is authorized by this review.

## Ownership and dependency direction

Ownership remains in Core under the existing Dimension reconstruction module. The Dimension layer may depend on the leaf Capability execution-result validator and mapping/state contracts. Capability execution does not import or invoke the derived-state builder, preserving one-way downstream dependency and avoiding a parallel pipeline.

## Next gate

The minimum next implementation task is `0100E-44 - Derived Dimension Knowledge State Construction Hardening Foundation`.

E-44 may harden only the existing `CapabilityExecutionResult[] + DerivedDimensionMapping[] -> DerivedDimensionKnowledgeState[]` boundary: complete container validation, deterministic identity, exact multi-execution lineage, canonical grouping/order, deep immutability, empty/non-applicable behavior and focused tests/health. It must not change public contracts or cardinality, introduce an intermediate contract, or authorize Matrix, Coverage or any later consumer.

## Verification

Repository-first inspection covered execution/result builders and validators, Derived Dimension mapping/state builders and validators, real tests and health paths, Ledger/Snapshot role, Matrix/Coverage dependency direction, authority documents and roadmap. Scope remained documentation-only.

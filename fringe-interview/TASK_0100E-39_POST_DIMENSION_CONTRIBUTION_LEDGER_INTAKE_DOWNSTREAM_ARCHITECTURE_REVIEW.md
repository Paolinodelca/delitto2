# TASK 0100E-39 — Post-Dimension-Contribution-Ledger-Intake Downstream Architecture Review

Status: **COMPLETED**

Outcome: **APPROVED WITH HARDENING GATE**

Date: 2026-08-04

Branch: `task/0100e-39`

Base and starting HEAD: `origin/milestone/0100b-knowledge-foundation` at `4578c4bd25e8d227887eccceac3175502dcaabbe`

## Decision

The first legitimate direct consumer of one updated `KnowledgeLedger` is the existing Core `buildKnowledgeSnapshot(ledger, options)` boundary. No Ledger selection/query or intermediate contract is justified: the Ledger is already the canonical complete contribution collection and Snapshot reconstruction must be reproducible from that explicit whole aggregate.

`KnowledgeSnapshot` is a reconstructable immutable materialized view and the boundary at which elementary per-Dimension aggregation occurs. It is neither an authoritative aggregate nor an operational boundary. The historical builder expresses the correct dependency direction, but its determinism, complete-content identity, canonical lineage, deep immutability and timestamp semantics require a dedicated hardening task before this new pipeline may invoke it.

## Direct answers

1. **Yes.** `KnowledgeSnapshot` is the direct Ledger consumer.
2. It is a derived, reconstructable immutable materialized view; construction is a pure Core derivation boundary, not an operational boundary or authoritative store.
3. **No.** A prior selection/query would make reconstruction policy caller-dependent and weaken whole-Ledger causality.
4. Snapshot consumes exactly one complete explicit Ledger, not an implicit or filtered subset.
5. Cardinality is `1 Ledger -> 1 Snapshot`; a non-empty Ledger yields `1..N DimensionKnowledgeState` values, exactly one per represented `dimensionId`; an empty Ledger yields one empty Snapshot with `0` states.
6. Identity must commit to the complete canonical Ledger identity, aggregation strategy/version and complete canonical state content. `ledgerRef`, canonical Contribution refs, MeasurementResult refs and deterministic ordering preserve causality and provenance. Timestamps must not create semantic identity drift.
7. **Yes, only here.** Contributions are grouped by `dimensionId` and aggregated into elementary `DimensionKnowledgeState`; no cross-Dimension, derived-knowledge, Matrix or Coverage aggregation is authorized.
8. An empty valid Ledger produces a valid empty Snapshot. Dimensions absent from the Ledger produce no state; absence of contributions is not absence of knowledge. An `unknown` state would require an explicit requested dimension scope, which this boundary does not accept.
9. **No.** Snapshot may contain elementary state derivation only. It does not imply derived Knowledge, `DerivedDimensionKnowledgeState`, Matrix, Coverage or Requirement satisfaction.
10. **No.** Neither Ledger Selection/Query nor a Snapshot request/result contract is needed for whole-Ledger reconstruction.
11. The minimum next task is `0100E-40 — Knowledge Snapshot Construction Hardening Foundation`, confined to the existing Snapshot/elementary aggregation path and focused validation, tests and health registration.

## Alternatives assessed

- **A — KnowledgeLedger -> KnowledgeSnapshot: approved**, through the existing Core boundary after E-40 hardening.
- **B — Ledger -> Selection/Query -> Snapshot: rejected.** No repository contract or consumer need authorizes a partial Snapshot; it would obscure reproducibility and source completeness.
- **C — Ledger -> Dimension Aggregation -> Snapshot: rejected as a separate public boundary, accepted as Snapshot internals.** The historical builder already owns deterministic per-Dimension grouping and calls the existing aggregator.
- **D — direct use of historical APIs: direction approved, immediate use rejected.** `buildKnowledgeSnapshot` and `aggregateDimensionContributions` predate E-36/E-38 guarantees; the returned Snapshot is mutable, its identity includes timestamp-bearing state fingerprints, and lineage is not validated against actual Ledger content.
- **E — a new intermediate contract or direct state/Matrix/Coverage consumer: rejected.** It duplicates existing semantics or skips the established reconstructable-view boundary.

## Repository evidence and constraints

Authority defines Evidence/Ledger as authoritative and Snapshot, states and Matrix as reconstructable views. The roadmap orders Ledger/Snapshot before elementary and derived knowledge. The existing builder validates one Ledger, groups all Contributions, aggregates each represented Dimension, orders states and emits one Snapshot. `buildPersonKnowledgeMatrix` consumes a validated Snapshot, confirming that Matrix is later. Matrix/Coverage queries operate on later views and are not Ledger selection mechanisms. `EvidenceSummary` belongs to the historical Evidence/identity pipeline and is not a Dimension Ledger consumer.

E-40 must preserve established aggregation formulas unless a separate architecture decision changes them. It must not infer quality/reliability, synthesize missing Dimensions, derive higher Knowledge, update Matrix/Coverage, decide satisfaction, persist, perform I/O or mutate Runtime. The fixed partial-coverage policy and confidence-weighted signed mean are historical semantics to regression-protect and critically verify, not redesign under E-39.

## Ownership and dependency direction

Core owns Snapshot construction and elementary aggregation. Application may orchestrate a call using one explicit valid Ledger and explicit deterministic options, but no Application contract is required. Core remains independent of Application, Infrastructure, Runtime and reporting. Later derived-state, Matrix and Coverage layers depend on Snapshot; Snapshot must not depend on them.

## Verification and anomaly policy

The review is documentation-only. Continuity governance, Overall Health, static document checks, manifest/worktree equality, documentation scope, ownership/dependency direction, forbidden implementation scan and `git diff --check` pass. The Core aggregate passed the Ledger/Snapshot and downstream Core groups, then stopped on the reproduced pre-existing Structured Input Evidence golden-ID assertion (`evidence_13dbd5...` actual versus `evidence_7720f1...` expected). This is an external NOTE, not an E-39-modified gate; no correction is included.

## Next gate

`0100E-40 — Knowledge Snapshot Construction Hardening Foundation` is the sole planned task. It may harden only the existing `buildKnowledgeSnapshot` boundary and directly required elementary aggregation validation/tests/health without changing public contracts or authorizing any later Knowledge layer.

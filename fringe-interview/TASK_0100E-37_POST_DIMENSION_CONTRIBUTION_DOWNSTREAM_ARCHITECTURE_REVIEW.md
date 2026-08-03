# TASK 0100E-37 — Post-Dimension-Contribution Downstream Architecture Review

Status: **COMPLETED**

Outcome: **APPROVED WITH NOTES**

Date: 2026-08-03

Branch: `task/0100e-37`

Base and starting HEAD: `origin/milestone/0100b-knowledge-foundation` at `a4f720f47032a91888de6ef1069452ef7f43145e`

## Decision

The first legitimate consumer of hardened `DimensionContribution[]` is the existing Core `appendDimensionContributions(ledger, contributions, options)` operation. Application owns orchestration and supplies one explicit valid `KnowledgeLedger`, the complete mapper batch and an explicit timestamp; Core owns validation, exact-ID collision rejection and atomic copy-on-write registration.

The operation returns one new existing `KnowledgeLedger`. No intermediate contract, intake-result, selection or aggregation contract is required. `KnowledgeSnapshot`, `DimensionKnowledgeState`, derived state, Matrix and Coverage are not direct consumers and remain unauthorized by this task.

## Repository assessment

The repository already separates the chain:

```text
DimensionContribution[]
→ appendDimensionContributions(existing Ledger, batch)
→ KnowledgeLedger
→ buildKnowledgeSnapshot
→ aggregateDimensionContributions per Dimension
→ DimensionKnowledgeState[]
→ derived state / Matrix / Coverage
```

Direct construction of a populated Ledger exists but is a Core aggregate builder, not the Application intake boundary. Direct `KnowledgeSnapshot`, `DimensionKnowledgeState`, `DerivedDimensionKnowledgeState` or `PersonKnowledgeMatrix` consumption would skip the authoritative Contribution collection and its collision rules. A selection boundary is unjustified because the mapper batch is already explicit and complete.

## Boundary

- **Owner:** Application orchestration; Core aggregate registration.
- **Input:** one explicit valid Ledger, one `0..N` hardened Contribution batch from a completed mapper invocation, explicit `now`.
- **Output:** one fresh existing Ledger; empty batch is a fresh semantic no-op.
- **Cardinality:** `(1 Ledger + 0..N Contributions) → 1 Ledger`; no Contribution merge, replacement or semantic deduplication.
- **Atomicity:** any invalid or duplicate ID rejects the whole batch; inputs remain unchanged.
- **Causality:** Ledger contains the unchanged complete Contributions; their canonical Result, Mapping and Observation references preserve the chain to Measurement and Evidence.
- **Identity:** Ledger identity remains derived from the canonical set of hardened Contribution IDs. Exact collisions are rejected. No new identity is introduced.
- **Ordering:** registration canonicalizes the stored collection; input order has no semantic effect.

## Metrics and aggregation

Registration preserves `contributionValue` (magnitude/polarity semantics) and `confidence` unchanged. Quality and reliability are not Contribution or Ledger fields and remain reachable through canonical `measurementResultRef`; they must not be synthesized, copied or defaulted during intake.

Multiple Contributions, including several for the same Dimension or Measurement, are preserved as distinct assertions. Registration performs no weighting, conflict resolution or aggregation. Dimension grouping and the existing confidence-weighted signed aggregation belong only to later Snapshot construction and are not authorized for modification or invocation by this review.

## Existing implementation gap

The existing operation has the correct responsibility and contracts but rebuilds mutable Ledger output and does not expose an Application-owned intake use-case boundary consistent with the established orchestration pattern. The next gate may harden only this path: explicit closed intake operation, contextual validation, atomic copy-on-write append, canonical ordering, deterministic identity preservation and deep immutability. Existing contracts, formulas and downstream builders remain unchanged.

## Rejected alternatives

- direct mapper-to-Snapshot/state/derived state/Matrix/Coverage;
- aggregation before Ledger registration;
- Contribution selection, candidate, collection or intake-result contracts;
- silent duplicate merge, replacement or semantic deduplication;
- copying quality/reliability into Ledger or Contribution;
- combining batches from independent mapper invocations inside the intake operation.

## Ownership and dependency direction

Application may depend on Core contracts and coordinate the use case. Core owns Ledger semantics and must not import Application, Infrastructure, Runtime or reporting. Snapshot, derived knowledge and composed views consume inward Core artifacts only after separate authorization.

## Next gate

`0100E-38 — Dimension Contribution Ledger Intake Hardening Foundation` is the sole planned task. It may implement the minimum Application-owned intake wrapper and harden the existing Core append path without changing contracts, builders, validators, public Core API, aggregation, Snapshot, states, Matrix, Coverage, persistence, I/O, satisfaction or Runtime.

## Residual notes

- Ledger content identity is sound for E-36 output because each Contribution ID commits to its complete canonical semantic body.
- Timestamp and deep-freeze guarantees require focused treatment in E-38.
- Snapshot aggregation policy, including fixed partial coverage and null quality/reliability, requires a later repository-first review after intake hardening.

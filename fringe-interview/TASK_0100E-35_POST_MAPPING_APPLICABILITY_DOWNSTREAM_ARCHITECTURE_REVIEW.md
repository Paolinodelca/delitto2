# TASK 0100E-35 — Post-Mapping-Applicability Downstream Architecture Review

Status: **COMPLETED**

Outcome: **APPROVED WITH NOTES**

Date: 2026-08-03

Branch: `task/0100e-35`
Base and starting HEAD: `origin/milestone/0100b-knowledge-foundation` at `cb520dfa0d0ac82a99f4104d20d2f9193f2e4080`

## 1. Executive Summary

The first legitimate downstream consumer of an `applicable` E-34 outcome is the existing Core `mapMeasurementResultToDimensionContributions(measurementResult, mapping)`. Application branches on E-34 and invokes it only with the original immutable Result and applicable frozen Mapping. Core owns target-specific Contribution creation.

The mapper is responsibility-compatible but not sufficient unchanged: its identity omits semantic values and policy factors/version, output is mutable, reference order is not explicitly canonical, and formula provenance is incomplete. The approved next gate is **0100E-36 — Measurement Result Dimension Contribution Mapping Hardening Foundation**, limited to hardening the existing mapper. No parallel mapper, intermediate contract, contract change, Ledger or Knowledge update is authorized.

## 2. Repository Evidence Reviewed

Reviewed MeasurementResult contract/identity and E-32 normalizer; E-34 applicability; MeasurementDimensionMapping contract; historical mapper; DimensionContribution contract, builder, validator, identity, health and API; mapping/contribution regressions; aggregation, KnowledgeLedger, KnowledgeSnapshot, elementary/derived state and PersonKnowledgeMatrix; E-32/E-33/E-34 reports/manifests; current continuity, architecture, decisions, next phase, roadmap and freeze.

Preliminary gate: E-34 was latest COMPLETED; no downstream was approved/planned; no E-35 task/report/branch/roadmap conflict existed; worktree was clean; HEAD equalled the required base.

## 3. Current Architecture

```text
Observation[] → MeasurementResult normalization [Core]
→ MeasurementResult → Mapping applicability [Core; Application supplies Mapping]
→ applicable(Result, Mapping)
→ DimensionContribution mapping [Core; Application orchestrates]
→ DimensionContribution[]
→ Ledger / Snapshot / Knowledge [separate; not authorized]
```

## 4. Mapping Applicability Boundary

Only `applicable` may proceed. `not_applicable` invokes no mapper. `stopped` invokes no mapper. Invalid input throws and invokes no mapper. None may become an empty/zero/negative/absent/`not_observed` Contribution or a satisfaction result.

## 5. Historical Mapper Assessment

The mapper consumes exactly Result and Mapping, validates both, requires exact `measurementId` and `calculated`, and needs no other context. Per target it assigns `dimensionId` and `contributionType`, calculates `abs(result.normalizedValue) × target.weight`, and calculates `result.confidence × target.confidenceFactor`. It references Result, Mapping and Observations.

It does not read Result direction, characteristic, coverage, quality, reliability, independence or consistency. It is compatible in ownership/cardinality but requires local identity, canonicalization, immutability and formula-provenance hardening.

## 6. DimensionContribution Boundary

The existing contract is sufficient: one target-specific assertion with measurement/dimension, polarity, bounded magnitude/confidence and provenance. Mapping ends at policy; Contribution begins at applying one explicit target to one calculated Result. Quality/reliability stay on the referenced Result. No contract, builder or validator change is justified.

## 7. Downstream Candidates

- **A — existing Core mapper to `DimensionContribution[]`: approved with hardening.** Core; Result+Mapping; `1..N`; established dependencies; risk is current integrity gaps.
- **B — exactly one Contribution: rejected.** Real Mapping has `1..N` targets.
- **C — Application Contribution Context: rejected.** No missing input; it would permit policy overrides.
- **D — harden historical mapper without contracts: approved.** Smallest non-duplicative gate.
- **E — Registered Observation-specific mapper: rejected.** Result is canonical; parallel pipeline would couple downstream to origin.
- **F — Contribution Candidate: rejected.** No ranking/review/deferred lifecycle exists.
- **G — no Foundation: rejected.** Current identity/mutability/provenance guarantees are insufficient.
- **H — Application E-34 gate plus hardened Core mapper: approved.** No new Application contract.

## 8. Candidate Comparison

| Candidate | Owner | Cardinality | New contract | Decision |
|---|---|---:|---:|---|
| A/D/H | Application orchestration + Core mapping | applicable pair → `1..N` | no | approved with hardening |
| B | Core/Application | pair → `1` | no | rejected |
| C | Application + Core | context + pair → `1..N` | yes | rejected |
| E | Core parallel path | pair → `1..N` | likely | rejected |
| F | Core | pair → Candidate(s) | yes | rejected |
| G | Core current API | pair → mutable `1..N` | no | rejected unchanged |

## 9. Ownership Matrix

| Responsibility | Owner |
|---|---|
| select/supply one Mapping | Application |
| applicability | Core E-34 |
| branch and invoke only on `applicable` | Application orchestration |
| validate and apply target policy | Core mapper |
| build/validate/freeze Contributions | Core mapper using existing contract |
| append/aggregate/update Knowledge | not authorized |

## 10. Responsibility Matrix

Allowed: defensive validation, explicit target traversal, established formulas, canonical refs, deterministic IDs, immutable Contributions. Forbidden: Mapping selection/mutation, Dimension inference, Result aggregation, hidden rules/defaults, Ledger/Snapshot/state/Matrix/Coverage/satisfaction updates, I/O and Runtime mutation.

## 11. Cardinality

- Pipeline `1 Result + 1 Mapping → 0`: only because non-applicable/stopped/invalid do not invoke the mapper.
- Invoked applicable pair → exactly one Contribution per target, therefore `1..N`.
- Exactly one occurs only when Mapping has one target.
- `N Result + 1 Mapping → 1` is rejected; no aggregation.
- `N Result + N Mapping → N` is not a batch contract; independent pairs require independent calls.

Fan-out is authorized only by the Mapping's real validated `1..N` unique explicit targets.

## 12. E-34 Outcome Handling

| Outcome | Invoke mapper | Result |
|---|---:|---|
| `applicable` | yes | one Contribution per target |
| `not_applicable` | no | none |
| `stopped` | no | none; insufficiency remains explicit |
| invalid | no | error, none |

## 13. Dimension, Weight, Direction and Strength

Mapping supplies `dimensionId`, `contributionType`, `weight` and `confidenceFactor`. Result supplies `normalizedValue`. Mapper derives magnitude/strength as `abs(normalizedValue) × weight`. Result `direction` is not copied; target `contributionType` is the explicit polarity policy. E-36 must preserve and version/protect this existing rule, not redesign it or infer Dimension from characteristic.

## 14. Confidence

Contribution confidence is explicitly calculated as Result confidence times Mapping target factor. It is neither a raw copy nor aggregation. E-36 preserves the formula and makes its provenance verifiable.

## 15. Quality and Reliability

Contribution owns neither field. They are not copied, transformed or aggregated; they remain reachable on the causally referenced Result. No implicit zero/default is permitted.

## 16. Causality and Provenance

```text
Contribution → measurementResultRef → Result
             → measurementId → Measurement
             → Result.observationRefs → Observation → Evidence
             → Mapping ref/version
```

Canonical refs are sufficient; full artifacts and raw Evidence are not duplicated.

## 17. Identity

Current ID hashes only Result ID, Mapping ID, Dimension and contribution type. Different value/confidence/weight/factor/version can therefore produce different semantics under the same ID. E-36 must derive identity from complete canonical semantic inputs/output and policy version, independent of key/target/ref order, and freeze before return. Validator changes are unnecessary; focused tests must prove repeatability, semantic sensitivity and mutation isolation.

## 18. Interpretation Boundary

Permitted interpretation is only versioned application of explicit target magnitude/polarity/confidence policy to one calculated applicable Result. No person meaning, satisfaction, absence, scoring, aggregation or Knowledge interpretation occurs.

## 19. Architectural Decision

**APPROVED WITH NOTES**

- Consumer: existing mapper after E-34 `applicable`.
- Ownership: Core transformation; Application orchestration.
- I/O: calculated Result + applicable Mapping → deeply immutable existing Contributions.
- Cardinality: one per explicit target (`1..N`); no Result aggregation.
- Causality: canonical Result/Mapping/Observation refs; Measurement/Evidence transitively reachable.
- Identity: complete content-derived canonical identity required.
- Metrics: Mapping target + Result magnitude/confidence; quality/reliability stay on Result.
- Intermediate contract: none.
- Historical mapper: right boundary, local hardening required.

## 20. Rejected Alternatives

Rejected: direct unmodified use, single-only mapping, Application formula context, parallel mapper, Candidate, batch/aggregation, Result-derived Dimension, contract changes and automatic Ledger append.

## 21. Guardrails

E-36 may modify only the mapper and minimum mapping/contribution regression, API and health coverage. MeasurementResult, Mapping and DimensionContribution contracts/builders/validators remain unchanged. No Application contract, registry/resolver, persistence, Ledger/Snapshot/state/Matrix/Coverage, derived knowledge, satisfaction, Provider/Adapter/LLM, filesystem/network, reporting, final scoring or Runtime mutation.

## 22. Self Review

Answers: (1) both artifacts, no context; (2) yes, calculated required; (3) yes, stopped/not-applicable stop fully; (4–6) invoked pair yields `1..N` from targets, fan-out authorized only there; (7–8) no N:1; (9–10) Mapping owns target/policy, Result owns metric inputs, mapper calculates; (11) confidence transformed explicitly, quality/reliability referenced; (12) no context, formula provenance required; (13) mapper is Core; (14) Application orchestrates; (15) Mapping is not modified; (16–17) no intermediate, existing Contribution sufficient; (18) canonical refs preserve chain; (19) stop precedes invocation; (20) Contribution ends before explicit Ledger append; (21) E-36 is sole next task.

## 23. Residual Risks

- Existing `abs(value)` plus Mapping polarity may be domain-sensitive; E-36 protects but cannot redesign it.
- Mapping ID is caller-supplied; hardened identity must include canonical policy content/version.
- Evidence traversal is transitive through Observation, not flattened.
- Standalone builder defaults remain broader; mapper output can be stricter without contract changes.

## 24. Next Authorized Gate

`0100E-36 — Measurement Result Dimension Contribution Mapping Hardening Foundation` — **PLANNED**.

It may preserve formulas/fan-out, implement complete canonical content-derived IDs, canonical provenance, fresh deep-frozen output, generated-Contribution validation and focused regressions/API/health. It may not change contracts/builders/validators or cross into Ledger/Knowledge.

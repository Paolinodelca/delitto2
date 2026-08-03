# TASK 0100E-36 — Measurement Result Dimension Contribution Mapping Hardening Foundation

Status: **COMPLETED**

Overall outcome: **CONFORMING**

Date: 2026-08-03

Branch: `task/0100e-36`

Base: `origin/milestone/0100b-knowledge-foundation` at `4ed411864e9917d1ffce07605269dbe8d5493bca`

## 1. Outcome

The historical Core `mapMeasurementResultToDimensionContributions(measurementResult, mapping)` was hardened in place. No second mapper, intermediate contract, parallel pipeline or downstream responsibility was introduced. The existing API, owner, input pair, established formulas, one-per-target cardinality and `DimensionContribution[]` output contract are preserved.

## 2. Repository-First Review

The review inspected the real mapper, MeasurementResult builder/validator and E-32 normalization guarantees; E-34 applicability operation and validators; MeasurementDimensionMapping builder/validator/health/API; DimensionContribution builder/validator/health/API; mapping and contribution regressions; aggregate Core/health integration; E-35 report/manifest/ADR; and all CURRENT authority documents.

The mapper already consumed exactly one calculated Result and one applicable Mapping, validated both existing contracts, required exact `measurementId`, traversed explicit Mapping targets, applied `abs(normalizedValue) × weight` and `confidence × confidenceFactor`, validated generated Contributions and performed no downstream mutation. It was therefore responsibility-compatible with E-35.

## 3. Findings

The approved hardening gaps were confirmed:

- identity hashed only Result ID, Mapping ID, Dimension and polarity;
- semantic values, factors, policy content and policy version were absent from identity;
- `measurementResultRef` and source reference ordering were not canonical;
- formula strategies, expressions and operands were not explicit provenance;
- Contributions and their returned array were mutable;
- policy extensions could contain hidden or non-canonical values that undermine deterministic hashing.

No architectural blocker or incompatible responsibility was found.

## 4. Final API

```js
mapMeasurementResultToDimensionContributions(measurementResult, mapping)
  -> deeply frozen DimensionContribution[1..N]
```

The public Core export is unchanged. No new external API or semantic contract was added.

## 5. Ownership and Invocation

Application remains responsible for branching on E-34 and invoking the mapper only after `applicable`. Core remains responsible for local validation, exact contextual compatibility, explicit target traversal, formula application and construction/validation/freezing of existing Contributions.

`not_applicable`, `stopped` and invalid E-34 outcomes remain terminal before mapper invocation.

## 6. Local Validation

The mapper preserves existing MeasurementResult and MeasurementDimensionMapping validators and their error codes. It additionally rejects hidden/symbol properties recursively and rejects non-canonical Mapping policy extension values, non-finite values, exotic objects and cycles. Existing contract builders and validators are unchanged.

## 7. Contextual Validation

The existing contextual rules are preserved:

- `measurementResult.measurementId === mapping.measurementId`;
- `measurementResult.status === "calculated"`.

Mismatch throws `INCOMPATIBLE_MEASUREMENT_MAPPING`; a non-calculated valid Result throws `MEASUREMENT_RESULT_NOT_APPLICABLE`.

## 8. Deterministic Identity

Each Contribution ID is a SHA-256-derived identifier over identity schema `dimension-contribution-mapping-identity-v1` and the complete canonical generated Contribution body. The body contains output metrics, canonical provenance, timestamp/version, exact formula provenance, target extensions and the complete Mapping policy fingerprint.

Identity is insensitive to object-key, Mapping-target and Observation-reference order, while remaining sensitive to semantic Result value/confidence and Mapping policy weight/factor/content.

## 9. Canonical Policy and Provenance

The Mapping policy fingerprint includes Mapping identity and measurement scope, canonically ordered complete targets, `direct`/`inherit` strategies, Mapping version and Mapping extensions. Contribution provenance uses:

- `measurementResult:<resultId>`;
- sorted unique `mapping:<mappingId>` and `observation:<observationId>` source references.

Quality, reliability and other unused Result fields are not copied or transformed; they remain reachable through the causal Result reference.

## 10. Formula Provenance

Contribution extensions record formula version `1.0`, the canonical Mapping ref/version/fingerprint and exact strategies, expressions and operands:

- value: `direct`, `abs(measurementResult.normalizedValue) * mappingTarget.weight`;
- confidence: `inherit`, `measurementResult.confidence * mappingTarget.confidenceFactor`.

The historical arithmetic and 12-decimal rounding are unchanged.

## 11. Deep Immutability

Every generated Contribution is recursively frozen after existing contract validation. The returned array is also recursively frozen. All nested provenance, source refs, Mapping metadata, target extensions, formula metadata and operand objects are isolated from later caller mutation.

## 12. Cardinality and Ordering

One calculated Result plus one applicable Mapping still produces exactly one Contribution per explicit unique Mapping target (`1..N`). The mapper preserves Mapping target traversal order. Canonical IDs and policy fingerprints do not depend on target order. No Result aggregation or batch contract exists.

## 13. Contract Compatibility

MeasurementResult, MeasurementDimensionMapping and DimensionContribution contracts, builders and validators are unchanged. Formula provenance and policy integrity are carried through the existing `extensions` field. The Core index export set remains unchanged.

## 14. Health and Regression Coverage

Dedicated coverage proves repeatability, semantic sensitivity, target/key/ref-order independence, canonical policy fingerprinting, canonical refs, exact formula provenance, deep freeze, input isolation, preserved error codes and forbidden dependency absence. Existing mapping health now verifies the hardened guarantees and remains integrated in Core aggregate and Overall Health.

## 15. Forbidden Responsibility Review

The mapper imports only Observation validation and Dimension Mapping/Contribution components inside Core. It contains no Ledger, Snapshot, Knowledge, Matrix, Coverage, satisfaction, persistence, filesystem/network I/O, Provider, Adapter, LLM, reporting or Runtime dependency. No existing downstream artifact was modified.

## 16. Continuity Impact Assessment

Impact: implementation and authority realignment inside the already approved ADR-043 boundary. README, CONTINUITY, CORE_ARCHITECTURE, DECISIONS, NEXT_PHASE and CORE_ROADMAP now record E-36 as completed and E-37 as the sole planned repository-first downstream architecture review.

## 17. Deliverables

The manifest contains only the historical mapper hardening, focused mapping tests/health/aggregate registration, six authority documents, this report and the manifest. No staging, commit, push or milestone integration was performed.

## 18. Residual Risks

- The established `abs(normalizedValue)` plus target polarity rule remains domain-sensitive by design; E-36 records but does not redesign it.
- Mapping identity remains caller-supplied; the content-derived policy fingerprint prevents that caller ID from being the sole identity input.
- Formula provenance is stored in the existing open `extensions` field because changing the consolidated Contribution contract is outside scope.
- No downstream consumer is authorized. E-37 must review the repository before any Ledger, Snapshot or Knowledge boundary can be considered.

## 19. Next Gate

`0100E-37 — Post-Dimension-Contribution-Mapping Downstream Architecture Review` — **PLANNED** and sole planned task.

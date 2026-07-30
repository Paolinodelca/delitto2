# IMAGO Core — Architectural Decisions

Status: **CURRENT**

Verified through: **Task 0100E-11**

## Foundation decisions

### ADR-001 — Evidence is authoritative

Snapshots, derived states and PersonKnowledgeMatrix are reconstructable views, not authoritative evidence stores.

### ADR-002 — Observation, Measurement and Contribution are separate

An observed fact is not automatically a measure; a measure is not automatically a Dimension contribution.

### ADR-003 — Mappings are explicit

Measurement and derived Dimension mappings are declarative. Implicit boolean, string, null or numeric conversions are forbidden.

### ADR-004 — Ledger is immutable; Snapshot is reconstructable

KnowledgeLedger preserves contributions. KnowledgeSnapshot reconstructs elementary state deterministically.

### ADR-005 — Elementary and derived layers remain distinct

`DimensionKnowledgeState` and `DerivedDimensionKnowledgeState` may coexist for the same Dimension without fusion or averaging.

### ADR-006 — CapabilityRecipe is distinct from Capability

The Foundation strategy is `evaluate_all_rules`, without implicit recursion, chaining or multi-pass evaluation.

### ADR-007 — Derived Dimension mapping is explicit

A boolean derived result does not become numeric automatically.

### ADR-008 — Confidence is conservative

Derived state confidence uses the minimum confidence actually involved.

### ADR-009 — Semantic metrics are not invented

Coverage, consistency or global confidence are absent unless supported by explicit contract semantics.

### ADR-010 — PersonKnowledgeMatrix is a materialized view

It embeds compact states because no resolvable state repository exists. It is reconstructable and is not an evidence store.

### ADR-011 — Knowledge composition has no inverse dependency

Higher knowledge composition depends on Snapshot, Dimension and derived Dimension contracts; lower layers do not depend on PersonKnowledgeMatrix.

### ADR-012 — Subject reference is minimal

The technical subject reference contains only a type and identifier, without personal free text.

### ADR-013 — No person score

Matrix and deterministic Knowledge Foundations do not expose employability, potential, readiness, fit, ranking, recommendation or global person metrics.

### ADR-014 — Layer collisions are preserved

The same Dimension may appear in elementary and derived layers without implicit selection.

### ADR-015 — Recipe versions coexist

No automatic selection of the latest or most confident Recipe version occurs.

### ADR-016 — Identity is deterministic

Random UUIDs, array order, timestamps and personal data do not define logical identity.

### ADR-017 — Elementary state reference is locally deterministic

Because elementary `DimensionKnowledgeState` has no native `id`, Matrix uses a canonical local fingerprint. Evolution requires a dedicated regression-protected task.

### ADR-018 — Deterministic Foundations have no LLM or external effects

No network, database, executable callback, `eval`, arbitrary formula or hardcoded professional rule is introduced.

### ADR-019 — No in-place mutation

Builders and transformations return new values and preserve caller-owned inputs.

### ADR-020 — Query Foundations are read-only

Queries use allowlisted exact filters, AND semantics, canonical ordering and valid empty results without upstream reinterpretation.

## Knowledge Acquisition and downstream decisions

### ADR-021 — Phase D boundary is frozen

Task 0100D-10 froze:

```text
PersonKnowledgeMatrix
→ KnowledgeCoverage
→ KnowledgeOpportunity
→ KnowledgeAcquisitionNeed
→ KnowledgeAcquisitionStrategy
→ KnowledgeAcquisitionRequirement
```

Mappings, one-to-one cardinality from Opportunity onward, direct causality, Requirement semantics and public exports require a new architecture task to change. Requirement has no satisfaction, status, plan or execution state.

### ADR-022 — Knowledge Acquisition Design is the first downstream consumer

Task 0100E-1 approved and E-2 implemented one mechanism-neutral `KnowledgeAcquisitionDesign` per Requirement. The builder consumes explicit resolved causal context; it performs no persistence lookup or implicit resolution.

### ADR-023 — Capability Match is pure Core matching

Tasks E-3/E-4 established `Design → 0..N Match`, one immutable candidate snapshot per invocation. Core evaluates semantic compatibility only. Application owns discovery, availability, policy, ranking and selection.

### ADR-024 — Solution Decision is Application-owned

Tasks E-5/E-6 established the deterministic Application decision with `single`, `composed`, `none` and `deferred` modes. It consumes already produced Matches and candidate snapshots. It does not introduce Core collections, configuration, planning or execution.

### ADR-025 — Composition Design is Application-owned and composed-only

Tasks E-7/E-8 established exactly one `KnowledgeAcquisitionCapabilityCompositionDesign` for a valid `composed` Decision and none for `single`, `none` or `deferred`. It is declarative and contains no executable ordering, provider, adapter, recipe or runtime behavior.

### ADR-026 — Local and contextual validation have distinct guarantees

The local Composition Design validator checks self-contained invariants. A separate pure contextual validator proves exact correspondence with the supplied Decision and Design. Neither performs discovery, matching, selection or reselection.

### ADR-027 — No downstream operational layer before E-9

Configuration, Planning, Runtime, Execution, Requirement satisfaction and Knowledge Update are not approved as the next layer. Task 0100E-9 must review the first legitimate consumer common to `single` and `composed`. Configuration is a candidate, not a decision.

### ADR-028 — Unified declarative Capability Configuration is the approved next direction

Task 0100E-9 approved `KnowledgeAcquisitionCapabilityConfiguration` as an Application-owned, declarative and immutable pre-planning artifact. One Configuration may exist for an applicable `single` or `composed` Solution Decision; `none` and `deferred` produce none. For `composed`, the corresponding Composition Design is a mandatory direct causal source. `single` is not normalized as a composition of cardinality one.

Configuration may bind only explicit non-secret declarative values to already selected capability references. It may not discover or reselect capabilities, mutate Decision or Composition Design, resolve provider/adapter/availability, contain credentials or secret references, order invocations, plan, retry, orchestrate or execute. Task 0100E-10 implements this approved direction without changing the decision.

### ADR-029 — Declarative Knowledge Acquisition Plan is the first Configuration consumer

Task 0100E-11 approves `KnowledgeAcquisitionPlan` as an Application-owned, immutable, post-Configuration and pre-Runtime boundary. Exactly one Plan may be built from one valid `single` or `composed` Configuration; `none` and `deferred` cannot reach this boundary. The Plan has exactly one declarative unit per selected capability and preserves, without duplicating or operationalizing, Configuration values and composed logical dependencies.

No intermediate readiness, binding or normalized-composition contract is required. The Plan may not resolve registry, provider or adapter, produce invocation payloads, define executable ordering or scheduling, orchestrate or execute, collect results, assess Requirement satisfaction or update knowledge. Task 0100E-12 may implement only this declarative Plan Foundation.

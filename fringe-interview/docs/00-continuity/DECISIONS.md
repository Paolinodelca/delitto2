# IMAGO Core — Architectural Decisions

Status: **CURRENT**

Verified through: **Task 0100E-26**

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

No intermediate readiness, binding or normalized-composition contract is required. The Plan may not resolve registry, provider or adapter, produce invocation payloads, define executable ordering or scheduling, orchestrate or execute, collect results, assess Requirement satisfaction or update knowledge. Task 0100E-12 implements only this declarative Plan Foundation and does not change ADR-029.

### ADR-030 — Runtime Session is the first operational Plan consumer

Task 0100E-13 approves `KnowledgeAcquisitionRuntimeSession` as the Application-owned first operational boundary. One immutable Plan may cause zero or more Sessions; each Session refers to exactly one Plan and contains exactly one operational item-state projection per Plan Item. Session identity is distinct from Plan identity so resume/reconstruction preserves an existing Session while a rerun creates a new Session.

The Session owns lifecycle, progress, active-item selection and operational timestamps. It is pre-Execution: attempts, retry policy, provider/adapter binding, invocation, errors, outputs, results, event persistence, Requirement satisfaction and Knowledge Update remain separate downstream concerns. A Runtime Definition is not introduced because it would duplicate the already authoritative Plan. Task 0100E-14 implements this Runtime Session Foundation with the closed lifecycle `created`, `active`, `suspended`, `completed`, `abandoned`, stable identity and exact Plan Item state projections; ADR-030 remains unchanged.

### ADR-031 — Execution is the first Session consumer; Invocation is the first side-effect

Task 0100E-15 approves Application-owned `KnowledgeAcquisitionExecution` as the first direct consumer downstream of Runtime Session. One Execution represents one explicitly authorized attempt for exactly one active Session item and preserves exact Session and Plan Item causality. No readiness, preparation, action or execution-request contract is required between Session and Execution.

Execution remains a provider-neutral semantic attempt snapshot. The first observable external effect arises only at the separate Knowledge Acquisition Invocation Boundary, where infrastructure translates an authorized Execution through a concrete adapter/provider. Task 0100E-16 may implement only the Execution Foundation. Provider selection, adapter binding, invocation, retry, timeout, scheduler, queue, orchestration, persistence, events, results, Reporting, Requirement satisfaction and Knowledge Update remain unapproved; a new repository-first review is required before the Invocation Boundary.

Task 0100E-16 implements this decision with a stable identity derived from Session reference, Plan Item reference and explicit `executionKey`; exact Plan and Session causality; and the closed pre-invocation state machine `created` → `selected` → `ready_for_invocation`. Multiple explicit keys may represent multiple Executions for one Session item without defining retry semantics. Task 0100E-17 is the required post-Execution downstream architecture review.

### ADR-032 — Invocation is an Application-owned port, not a Provider or Adapter

Task 0100E-17 approves `KnowledgeAcquisitionInvocationBoundary` as the first boundary after a `ready_for_invocation` Execution. Application owns the outbound port and the minimal ephemeral input semantics; Infrastructure owns its concrete implementation. The input consumes explicit, contextually consistent Execution, Runtime Session, Plan, Capability Configuration and selected capability context without copying technology into Execution.

The first observable effect occurs only when a concrete Infrastructure Adapter invokes an external capability or Provider. No persistent Invocation aggregate is justified. Task 0100E-18 may implement only the port, contextual validation and an effect-free test double. Provider/adapter discovery or selection, concrete adapters, transport, network, HTTP, REST, MCP, plugins, prompts, models, vendors, retries, persistence and results remain unapproved.

Task 0100E-18 implements ADR-032 as a structural Application port exposing only `invoke`, plus a deeply immutable ephemeral `KnowledgeAcquisitionInvocationInput`. The input has exact Execution, Runtime Session, Plan and Plan Item causal refs, a resolved technology-neutral acquisition operation, and a deterministic integrity fingerprint rather than an autonomous persistent identity. It has no lifecycle, result or outcome. The next gate is the repository-first Task 0100E-19 post-boundary architecture review; no Infrastructure component is pre-authorized.

### ADR-033 — A capability-specific Invocation Adapter is the first Infrastructure consumer

Task 0100E-19 approves a capability-specific Infrastructure Invocation Adapter as the first consumer and concrete implementer of the Application-owned `KnowledgeAcquisitionInvocationPort`. The Adapter translates the technology-neutral invocation input for one already selected capability and is the first component in which a future real side-effect may occur when it invokes an external capability or Provider.

Adapter and Provider remain distinct responsibility levels even if a future technical module co-locates them: the Adapter implements the Application port and protects its semantics, while the Provider exposes or performs the external mechanism. Composition/bootstrap Infrastructure selects or injects both before the call. `invoke` performs no dynamic provider/adapter resolution, registry lookup or generic routing. A generic Adapter is excluded because it would require unapproved dispatch infrastructure, and no additional semantic boundary is required before the Provider.

E-19 is review-only. It implements and authorizes no concrete Adapter, Provider, transport or side-effect. Task 0100E-20 is the next Foundation gate and remains bound by the exclusions for dynamic selection, registry, retry, persistence, Result, Outcome, Requirement satisfaction and Knowledge Update.

### ADR-034 — The first invocation adapter targets structured input

Task 0100E-20 implements the Infrastructure-owned `StructuredInputKnowledgeAcquisitionInvocationAdapter` for the repository-established `capability:structured-input-v1`. Bootstrap supplies one Provider compatible with the closed `acquireKnowledge` contract. The Adapter implements the Application port, validates integrity and capability compatibility, and delegates the same immutable invocation input to the Provider. The Provider does not implement the port. No concrete Provider, transport, registry, resolver, routing, discovery, retry, timeout, result, persistence or Knowledge Update is authorized. Task 0100E-21 is the required downstream architecture review.

### ADR-035 — Provider Result precedes concrete Provider integration

Task 0100E-21 determines that the direct downstream consumer already exists as the Infrastructure Structured Input Provider role, but its return semantics are intentionally undefined. The first new boundary is therefore `KnowledgeAcquisitionProviderResult`, owned by Infrastructure and returned by a compatible Provider through the Adapter. It is a closed, immutable, ephemeral technical result causally bound to the originating Invocation Input fingerprint.

Raw vendor response remains private to a future integration. Provider Result is not an Application Invocation Result, acquired knowledge, Evidence, Requirement satisfaction or Knowledge Update. Provider throws/rejections propagate without mapping; retry, timeout, normalization and resilience policies remain excluded. Task 0100E-22 may implement only the effect-free Provider Result Foundation and minimum Provider/Adapter return enforcement. It may not implement a concrete Provider, client, transport, external I/O or semantic transformation.

### ADR-036 — Provider Result has one successful technical state and deterministic integrity

Task 0100E-22 implements the Provider Result as a closed Infrastructure value with `resultVersion`, technical `type`, sole state `succeeded`, `capabilityRef`, exact `invocationInputFingerprint`, opaque cloned `providerPayload` and deterministic `integrityFingerprint`. No autonomous or persistent ID, timestamps, lifecycle or duplicated Execution/Session/Plan references are introduced because Invocation Input already preserves that causal chain.

The Adapter validates the returned result structurally and against the original Invocation Input, then returns the same value unchanged. Provider throws and rejected promises continue to propagate unchanged, so no `failed`, `rejected` or `unavailable` result state and no failure taxonomy is authorized. Task 0100E-23 is a repository-first downstream review; concrete integration remains unapproved.

### ADR-037 — Provider Result enters the semantic domain through capability-specific Evidence extraction

Task 0100E-23 approves a capability-specific Provider Result Evidence Extractor as the first semantic crossing after `KnowledgeAcquisitionProviderResult`. The extractor implementation is Infrastructure-owned because it consumes the Infrastructure result and understands the structured-input provider payload. Its output is zero or more existing Core-owned Evidence values; Evidence, not the opaque payload, is where the semantic domain begins.

Direct Knowledge creation is rejected because Evidence is authoritative and Knowledge is reconstructed through Observation, Measurement, Dimension Contribution, Ledger and Snapshot. A Knowledge Candidate or generic normalized Provider response is also rejected because neither contract exists and both would duplicate or blur established boundaries. Core never imports Provider Result or provider schema; Infrastructure depends inward on the Core Evidence contract.

Task 0100E-24 may implement only an effect-free extractor for `capability:structured-input-v1`, contextual validation, minimal fixture-backed payload decoding and existing Evidence construction/validation. It may not modify Provider/Adapter/Provider Result/Evidence contracts, implement external I/O, update stores/Ledger/Matrix/Coverage, create Knowledge, decide confidence/quality/satisfaction, normalize Provider errors or mutate Runtime artifacts.

Task 0100E-24 implements ADR-037 with a closed fixture-backed `structured_input` payload schema, deterministic Evidence identity, exact source and acquisition provenance, local payload validation and contextual Provider Result/Invocation Input validation. The extractor returns only a deeply frozen `Evidence[]`, including a valid empty array. It assigns no final confidence or scoring and performs no I/O, persistence, ingestion, update or mutation. ADR-037 is unchanged; E-25 must review any downstream consumer.

### ADR-038 — Application intake registers Evidence into the Core EvidenceStore before Observation

Task 0100E-25 approves a narrow Application-owned Knowledge Acquisition Evidence Intake operation as the first direct consumer of the Core-owned `Evidence[]` returned by the Infrastructure extractor. The operation coordinates validation and atomic immutable registration into the existing Core-owned EvidenceStore aggregate/collection. EvidenceStore is not persistence, and no new Evidence Collection or intake-result domain contract is introduced.

Task 0100E-26 implements ADR-038 as `intakeKnowledgeAcquisitionEvidence({ evidenceStore, evidence })`. It returns the updated EvidenceStore directly, keeps the existing Store identity model, validates locally and contextually, rejects exact ID collisions within the batch and against the Store before construction, canonically sorts the combined Evidence by ID, deep-clones and deep-freezes the result, and returns a fresh equivalent Store for an empty batch. No Core public contract changes or downstream semantic responsibilities are introduced.

Exact duplicate Evidence IDs are rejected during intake/registration rather than silently merged. Acquisition provenance and `confidence: null` are preserved unchanged. Observation does not consume the extractor array directly: future Evidence-to-Observation semantics remain Core-owned, operate from registered Evidence in the Store/collection, and require a separate architecture gate. E-26 may implement only the effect-free intake Foundation and the minimum Core registration primitive required by it; persistence, semantic deduplication, Observation, Measurement, Contribution, Knowledge updates, Requirement satisfaction and Runtime mutation remain excluded.

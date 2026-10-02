# IMAGO Core — Architectural Decisions

Status: **CURRENT**

Verified through: **Task 0100E-43**

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

### ADR-039 — Exact registered-Evidence selection precedes Observation construction

Task 0100E-27 approves a narrow Application-owned Registered Evidence Selection operation as the first direct consumer of a populated Core EvidenceStore. It accepts an explicitly supplied valid Store and `0..N` unique exact Evidence IDs, proves membership, and returns a fresh deeply immutable canonical `Evidence[]` containing unchanged registered values. The operation has no autonomous identity or domain result wrapper, performs no persistence, and preserves Evidence provenance and nullable confidence exactly.

Observation is a first interpretation, not a structural translation. Registered Evidence does not determine the existing Observation contract's Measurement, characteristic, signal status/type, direction/strength, numeric confidence, quality, reliability, grouping, provenance or deterministic identity. Therefore direct Store-to-Observation, Observation Candidate and Observation Collection/Store alternatives are rejected. Empty/no-match selection remains an empty Evidence array and never means absent or `not_observed`.

Task 0100E-28 may implement only the exact Registered Evidence Selection Foundation, with minimum Application validation/public exposure/health/tests required by convention. Semantic filtering, Evidence deletion/merge, Observation or Measurement creation, confidence assignment, persistence, I/O, Provider/Adapter/LLM work, downstream Knowledge updates, Requirement satisfaction and Runtime mutation remain excluded. Any Evidence-to-Observation transformer requires a later repository-first architecture gate; its semantics are Core-owned and may be Application-orchestrated.

Task 0100E-28 implements ADR-039 as `selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore, evidenceIds })`. Local validation enforces the closed input and unique non-empty string IDs; contextual validation enforces a valid unambiguous Store and exact membership. The operation returns a cloned, deeply frozen `Evidence[]` in canonical ID order, including a fresh frozen empty array for zero IDs. Core APIs and contracts remain unchanged. Task 0100E-29 must review the next downstream boundary without presuming Observation construction.

### ADR-040 — Explicit Core Observation construction is the first interpretation

Task 0100E-29 approves a Core-owned, Application-orchestrated Observation Construction operation as the first legitimate consumer of selected registered Evidence. It requires one valid existing Measurement and an explicit closed versioned construction context/rule set, then returns canonical immutable existing Observation values. One Evidence may cause zero or more Observations; every Observation has exactly one Evidence cause, identified through `contentRef`, and exactly one Measurement. Multiple Evidence values may not be synthesized into one Observation at this gate.

Observation confidence, quality and reliability are assigned only by explicit deterministic rules; Evidence confidence remains unchanged and is neither implicitly transferred nor aggregated. Empty selection or no rule match produces no Observation and never implies `not_observed` or absence. No Observation Candidate or Store is introduced. Task 0100E-30 may implement only this effect-free Foundation using existing Evidence, Measurement and Observation contracts; Measurement creation/result, cross-Evidence synthesis, Contribution, Knowledge, persistence, I/O, LLM and Runtime mutation remain excluded.

Task 0100E-30 implements ADR-040 as `constructObservationsFromRegisteredEvidence({ evidence, measurement, construction })`. The closed versioned construction input supports only exact Evidence `content` equality in this baseline, supplies explicit bounded technical signal fields and an explicit timestamp, and is checked by separate local and contextual validators. The operation uses the existing Observation builder/validator without changing Evidence, Measurement or Observation contracts; output identities are deterministic, ordering is canonical and values are deeply immutable.

### ADR-041 — Measurement Result Normalization is the first Observation consumer

Task 0100E-31 approves the existing Core-owned Measurement Result normalization boundary as the first direct consumer of constructed `Observation[]`. One explicit invocation accepts the same existing Measurement, Observations, one targeted characteristic ID and a closed versioned normalization context, and returns exactly one existing MeasurementResult. Zero, one or many matching Observations may contribute; N:1 aggregation is authorized only inside this boundary. No Observation selection, Measurement Application/Execution, Candidate, collection or store is introduced.

MeasurementResult is a per-Measurement/per-characteristic synthesis, not an atomic Observation, Dimension contribution or Knowledge. Its identity is deterministic and content-derived; Observation references are canonical; output is deeply immutable. Result confidence, evidence quality and source reliability are recalculated only through explicit versioned Core rules and are never transferred implicitly. Empty or unusable input yields `insufficient_data` and never asserts absence. Task 0100E-32 implements only this normalization Foundation; mapping, Contribution, Knowledge, persistence, I/O and Runtime mutation remain excluded pending an explicit architecture review.

### ADR-042 — Explicit single-Mapping applicability precedes Contribution creation

Task 0100E-33 establishes that existing `MeasurementDimensionMapping` is declarative policy keyed by `measurementId`; it is not derived from and does not itself consume MeasurementResult. Application owns explicit supply/selection of exactly one existing Mapping. Core owns validation and exact compatibility. A calculated compatible result may expose the unchanged Mapping as applicable; `insufficient_data` stops explicitly as not applicable while the result remains present and valid. No characteristic-to-Dimension inference, discovery, fan-out, registration, store, intermediate domain contract, metric transformation or Contribution is authorized. Task E-34 may implement only this effect-free applicability Foundation.

Task 0100E-34 implements ADR-042 with a minimal ephemeral discriminated operation result. `applicable` carries a deeply frozen semantic clone of the explicitly supplied Mapping; `not_applicable` represents exact `measurementId` mismatch; `stopped` represents valid `insufficient_data`; invalid input throws `INVALID_MEASUREMENT_RESULT_MAPPING_APPLICABILITY`. No domain identity or persistent contract is added. Contribution mapping remains unauthorized pending a repository-first post-applicability review.

### ADR-043 — Harden the existing Contribution mapper; do not create a parallel boundary

Task 0100E-35 approves the existing Core `mapMeasurementResultToDimensionContributions` as the first direct consumer after E-34 `applicable`. Application invokes it with the original calculated Result and applicable Mapping; every other E-34 outcome stops before invocation. The real Mapping's `1..N` explicit unique targets authorize exactly one Contribution per target and no Result aggregation. Mapping owns Dimension, contribution polarity, weight and confidence factor; Result supplies normalized magnitude and confidence; the mapper applies established `direct` and `inherit` formulas. Quality and reliability remain on the causally referenced Result.

The existing Contribution contract is sufficient and no Candidate, context, parallel mapper or Application contract is introduced. The implementation requires local hardening because identity omits semantic values/policy inputs, output is mutable and formula provenance/canonical references are incomplete. E-36 may correct only those guarantees while preserving formulas, ownership, inputs, output contract and cardinality. It may not modify contracts/builders/validators or append to Ledger, build Knowledge, decide satisfaction, perform I/O or mutate Runtime.

Task 0100E-36 implements ADR-043 in the existing mapper only. The public API remains `mapMeasurementResultToDimensionContributions(measurementResult, mapping)`. Identity is derived from the canonical complete Contribution body, including canonical causal refs, exact formula provenance and a content-derived fingerprint of the complete Mapping policy. Formula version `1.0` records the unchanged `direct` magnitude and `inherit` confidence strategies with exact operands. Local validation preserves existing contract validation and rejects hidden or non-canonical policy values; contextual validation preserves calculated status and exact `measurementId`. Results are fresh and deeply immutable. No external contract, builder or validator changes, parallel path or downstream state responsibility are introduced.

### ADR-044 — Register hardened Contributions atomically before aggregation

Task 0100E-37 approves the existing Core `appendDimensionContributions` operation as the first direct consumer of a complete hardened mapper batch. Application supplies one explicit Ledger, one `0..N` batch and an explicit timestamp; Core validates and atomically returns one new Ledger. Exact ID collisions reject the batch. Contributions, metrics and provenance remain unchanged; quality and reliability remain on the referenced MeasurementResult. No selection, intermediate contract, merge, replacement, semantic deduplication or aggregation is introduced.

Task E-38 may add the minimum Application intake boundary and harden the existing append path for canonical, deterministic, deeply immutable copy-on-write output. It may not change contracts/builders/validators/Core API or cross into Snapshot, states, derived knowledge, Matrix, Coverage, persistence, satisfaction or Runtime.

### ADR-045 — Ledger identity commits to canonical Contribution content

Task 0100E-38 hardens the existing `appendDimensionContributions(ledger, contributions, options)` path in place. No Application wrapper or intermediate contract is required: Application orchestration calls the existing Core API with one valid Ledger, one `0..N` batch and explicit `options.now`. Core validates all visible and hidden content plus canonical provenance before constructing anything, rejects exact ID collisions atomically, stores Contributions in canonical `createdAt`/ID order and returns a fresh deeply frozen Ledger.

Ledger identity uses a versioned SHA-256 fingerprint of the complete canonical stored Contributions, independent of input and object-key order. The validator recalculates this identity and derived statistics, so stale identity/content combinations are invalid. An empty batch returns a fresh frozen equivalent Ledger with unchanged identity. Contribution values and contracts remain unchanged; Snapshot, aggregation and all later Knowledge consumers remain unauthorized pending explicit architecture review.

### ADR-046 — Snapshot is the complete Ledger's first derived consumer

Task 0100E-39 approves the existing Core `buildKnowledgeSnapshot(ledger, options)` as the first direct downstream consumer of one complete valid Ledger. Snapshot is a reconstructable immutable materialized view, not an authoritative aggregate or operational boundary. Per-Dimension elementary aggregation belongs inside Snapshot construction; a separate Ledger selection/query or intermediate contract is rejected.

Cardinality is `1 Ledger -> 1 Snapshot`, with exactly one elementary state per Dimension represented by Contributions. An empty Ledger yields an empty Snapshot; unrepresented Dimensions are not synthesized and do not imply absence. Identity and lineage must commit to the complete canonical Ledger and aggregation output without timestamp drift. E-40 may harden only this existing boundary. Derived Knowledge, Matrix, Coverage, satisfaction, persistence, I/O and Runtime mutation remain unauthorized.

Task 0100E-40 implements the approved hardening without a contract or API change. Canonical Snapshot identity uses complete Ledger identity, the established aggregation strategy and timestamp-independent semantic state content. Snapshot and aggregation results are deeply immutable and validation rejects non-canonical content.

### ADR-047 - Capability Recipe execution is the Snapshot's first downstream boundary

Task 0100E-41 approves the existing Core `executeCapabilityRecipe(snapshot, recipe, options)` operation as the first direct consumer of one complete valid Snapshot. It consumes exactly one explicit Recipe and returns exactly one `CapabilityExecutionResult` containing `0..N DerivedKnowledgeResult` values. The existing rule evaluator is internal to this execution responsibility and does not create an intermediate pipeline boundary.

Snapshot and Recipe identities, rule/state dependencies and result references preserve exact causality and provenance. Execution may validate and evaluate each explicit rule once; recursion, chaining, implicit aggregation and mutation are forbidden. Derived Dimension State, Matrix, Coverage, satisfaction, persistence, I/O and Runtime mutation remain downstream and unauthorized. E-42 may harden only the existing execution/evaluation path without changing contracts or public APIs.

### ADR-048 - Capability execution identity commits to complete semantic output

Task 0100E-42 hardens the existing execution/evaluation path in place. `CapabilityExecutionResult` identity commits to its complete canonical timestamp-independent semantic content, summary, dependencies, provenance, metadata and extensions. Validation enforces exact Snapshot/Recipe context and causal references. Execution results, their derived results and nested content are deeply immutable.

The public API, contracts and cardinality remain unchanged. Rule evaluation stays internal to `executeCapabilityRecipe`; no intermediate boundary, derived Dimension aggregation, Matrix/Coverage update, satisfaction, persistence, I/O, Runtime mutation or LLM is authorized.


### ADR-049 - Derived Dimension State construction is the first Capability execution consumer

Task 0100E-43 approves the existing Core `buildDerivedDimensionKnowledgeStates(executionResults, mappings, options)` operation as the first direct downstream consumer of complete `CapabilityExecutionResult[]` containers. Explicit `DerivedDimensionMapping[]` values are required to translate eligible positive derived targets into numeric Dimension estimates. No detached `DerivedKnowledgeResult[]` boundary and no intermediate selection, registration or store contract is introduced.

Cardinality is `0..N CapabilityExecutionResult + 0..N Mapping -> 0..N DerivedDimensionKnowledgeState`. Empty, unmatched, unmapped or non-positive result sets return an empty collection and never imply absent knowledge. Within one Snapshot/Capability/Recipe/version context, multiple mapped results may aggregate N:1 using the established confidence-weighted estimate and minimum confidence. Cross-execution aggregation is not authorized unless all contributing execution identities are retained exactly.

E-44 may harden only this existing construction boundary, including exact multi-execution lineage, deterministic identity/order, deep immutability and focused validation/tests. Matrix, Coverage, satisfaction, persistence, I/O, Runtime mutation, LLM and reports remain unauthorized.

### ADR-050 — Professional Direction Exploration is a Product/Application hypothesis layer over existing professional knowledge

PDIR-02 canonicalizes Product Decisions PD-054 and PD-055. Professional Direction Exploration uses the same person-owned Living Professional Identity and canonical Professional Knowledge path under explicit Product purpose `professional_direction_explore`; it does not create a second identity, Core Knowledge model, ProfessionalTrajectory, fit/readiness score or employment-decision path. A named Career Direction is a derived Product/Application hypothesis formed from current supported Professional Representation meaning plus a separate externally grounded, provenance-bearing, versioned Role/Career Direction Representation. The exploratory Role/Career Direction Representation remains distinct from a concrete Target/Opportunity Representation.

Conditions to verify remain decision-relevant unknowns rather than capability deficiencies. Direction-driven acquisition may later prioritize only already-authorised semantic dimensions through the existing Knowledge Acquisition chain and cannot manufacture semantic authority or Knowledge. Bridge/development/learning outputs remain bounded options tied to external role requirements and current supported state; course completion is not capability proof. Future Evidence Challenges remain deferred pending separate Product/methodology authority and, if later authorised, must enter through the canonical Evidence → Observation → Measurement → Knowledge path. PDIR-03 may now review the minimum Career Direction Representation and external role knowledge architecture; implementation remains unauthorized until that review is complete.

## PDIR-07 — People Responsibility Product/Semantic Authority Canonicalization
**Status:** CANONICAL AUTHORITY COMPLETE

PDIR-07 canonicalizes Product Decision PD-056. `continuing_people_responsibility` is now an authorised elementary professional Person Knowledge dimension with Person-side goal `people_responsibility_scope` and semantic policy identity `professional_semantic_policy:continuing_people_responsibility:v1`. The authority was required because PDIR-05/06 established that the human-accepted Career Direction condition concerning continuing people responsibility could not legitimately use Decision Accountability, Quantified Outcome, title, coordination or historical people-leadership projection logic as Person semantic authority.

PD-056 authorises a narrow context/time/provenance-bounded semantic family: positive Evidence must establish people-related responsibility, continuity beyond a one-off episode, at least one concrete responsibility kind and bounded professional context; Observation may retain continuity, responsibility mode, people scope and the minimum v1 responsibility kinds; Measurement remains non-evaluative; canonical Knowledge records documented responsibility only. It explicitly excludes leadership quality/style/potential, management capability/readiness, title-as-proof, generic coordination, Decision Accountability or Quantified Outcome as proxies, team outcome as proof, capability scoring, fit/readiness and development-gap inference. Contextual non-responsibility remains contextual and never becomes global deficiency.

No new generic Core contract is required: the existing Evidence → Observation → Measurement → DimensionContribution → Knowledge path, provenance/temporal/source-multiplicity rules and Knowledge Acquisition architecture remain authoritative. A future acquisition must associate `professional_semantic_policy:continuing_people_responsibility:v1` upstream through `KnowledgeAcquisitionDesign`; Career Direction may motivate acquisition but cannot define Person semantics.

**Next authorised technical scope:** one minimal people-responsibility semantic vertical slice only: accepted answer/source → Evidence → `observed_continuing_people_responsibility_context` → bounded Measurement → DimensionContribution → elementary `continuing_people_responsibility` Knowledge → shared Career Direction Condition resolution. Full Direction-driven acquisition, UI, DevelopmentNeed, BridgeExperience, Training and leadership-capability modelling remain outside this authority.

## BV05-EXP-A — Source-Grounded Professional Episode Meaning Product Authority
**Status:** CANONICAL AUTHORITY COMPLETE

BV05-EXP-A canonicalizes Product Decision PD-057. IMAGO may now preserve **Source-Grounded Professional Episode Meaning** as Representation/Application material between raw/source Evidence and derived professional views without requiring one canonical Person Knowledge dimension for every professionally meaningful activity. The object describes the documented episode/activity and the person's source-supported participation/contribution in context; it does not generalize the person into capability, trait, fit, readiness or suitability.

The authorised conceptual branch is `authorised source → Evidence → Source-Grounded Professional Episode Meaning → Representation/Application material`. The canonical Person Knowledge branch remains separate and unchanged: where an independent semantic policy exists, the same Evidence may also follow `Evidence → Observation → Measurement → DimensionContribution → Person Knowledge`. Episode Meaning is not canonical Observation or weaker Knowledge and cannot be promoted to Knowledge by repetition, relevance, provider labelling, user selection or Representation prominence.

PD-057 authorises open **source-bounded descriptive vocabulary** while continuing to prohibit open Person-level semantic inference. Provenance, episode/context/time identity and contribution/ownership strength must remain bounded to Evidence; external Role/Target knowledge may affect relevance but may not manufacture Person-side meaning. Provider assistance is candidate-only and application grounding/claim-shape validation remains authoritative. No universal professional ontology is required.

Episode Meaning may later become Person material for the existing BV05A Professional Material Relevance Relation only through separately authorised mappings, and may support Pattern discovery only through separately authorised Pattern rules. BV05A itself is not redesigned by this authority.

PD-057 also canonicalizes the requirement-granularity boundary exposed by BV05A: a human-readable external requirement may be compound, while relevance must operate on sufficiently atomic semantic requirement units so relevance to one component cannot imply support for the others. No universal requirement ontology or decomposition implementation is authorised here.

**Next authorised scope:** a separate repository-first implementation task may define the minimum technical Episode Meaning contract/extraction/materialization vertical slice and prove source grounding, open descriptive meaning with closed epistemic claim shape, provenance, provider non-authority and domain independence. Production extraction, Germany-specific logic, new Person semantic policies, Target/JD relevance, CV tailoring, acquisition and UI expansion remain outside this authority until separately authorised.

## BV05-EXP-D — Representation Informational Contribution & Composition Product Authority
**Status:** CANONICAL AUTHORITY COMPLETE

BV05-EXP-D canonicalizes Product Decision PD-058. IMAGO now distinguishes source presence, current Representation visibility, Representation-relative informational contribution, independently authorised Connection and purpose-relative relevance. Informational contribution is a derived non-evaluative relation between authorised professional material and one specific Professional Representation; it asks what supported information the material adds beyond what the current composition already materially expresses. It is not intrinsic episode importance, salience, prestige, capability, seniority, fit/readiness or a global score.

PD-058 explicitly authorises partial Representation: one aspect of an Episode Meaning may already support a Pattern while other source-grounded aspects remain compositionally unexpressed. Source-grounded material may expose bounded informational/support units with open descriptive vocabulary for comparison against current Representation composition units, without creating Person Knowledge dimensions or a universal professional ontology. Pattern remains recurrence; Connection remains independently authorised; purpose-relative BV05A relevance remains separate.

The authorised composition direction is `Representation material including Episode Meanings -> derived informational contribution/coverage -> bounded non-redundant selection -> existing Pattern / Connection / Knowledge material -> Professional Meaning -> progressive support/provenance`. Existing Professional Meaning remains the destination. First-reading has a bounded semantic/narrative composition budget but no Top-N ranking or importance score. Visibility/prominence remains derived from the materialised Representation under PD-053; time and source multiplicity remain governed by PD-030/031/032. Provider may later propose bounded grounded relations but is not authority for importance or new Person meaning.

No production composition, provider/runtime, Person Knowledge, Career Direction relevance, Target/JD, UI, atomic Role Requirement or BV05A implementation is changed by this authority task.

**Next authorised scope:** a separate repository-first minimal implementation may prove PD-058 with the Germany Episode Meaning by distinguishing already represented cross-functional collaboration from still-unexpressed line-launch / installation / start-up / stabilization context, feeding only bounded non-redundant material into the existing Professional Meaning composition. It must remain domain-independent and fail closed rather than introduce global scoring, free semantic similarity, Person capability inference or target-relative relevance.

## Candidate Career Preference Context Product Authority
**Status:** CANONICAL AUTHORITY COMPLETE

Product Decision **PD-059 — Candidate Career Preference Context** is canonical.

PD-059 establishes Career Preference Context as explicit Candidate-declared/confirmed, person-associated Product/Application exploration state. It is reusable across relevant Career Direction Exploration sessions and Candidate-editable, while remaining outside canonical factual Person Knowledge and the factual Professional Identity. The Beta persistence boundary is the current explicitly confirmed preference context with minimal update provenance; no behavioural preference-history/analytics platform is authorised.

Career Preference Context may contain a small extensible set of Candidate-declared interests, activity preferences, exploration orientations, avoidances, practical constraints, uncertainty and explicit Direction exploration requests. `unknown`, `not sure` and `no preference` are legitimate explicit states. The authority does not create a universal preference taxonomy or permit hidden preference inference.

Under `professional_direction_explore`, preference may filter, broaden, prioritise, order or explicitly request exploration, but it cannot manufacture Person-side professional support. Career Direction explanation must keep **professional support**, **Candidate preference** and **unknown / condition to verify** distinct. Existing PD-054/PD-055 Career Direction semantics, Professional Representation authority and authorised acquisition remain unchanged.

PD-059 introduces no Semantic Authority, Person Knowledge dimension, personality/psychometric assessment, fit/readiness scoring, Employer-visible Person truth or Opportunity/Application contract. Sparse academic/early-career material remains subject to existing source-grounded authority and cannot be converted from qualification into professional capability/suitability.

**Next authorised scope:** a separate bounded implementation task may add optional Candidate UI to provide/edit current Career Preference Context, persist/retrieve the current Candidate-controlled state, consume it transparently in Career Direction Exploration without altering existing professional-support relations, and explain professional support / Candidate preference / unknown as separate bases. Opportunity Understanding and Grounded Application Package remain separately authorised future work.

## Grounded Opportunity Application Package Product Authority
**Status:** CANONICAL AUTHORITY COMPLETE

Product Decision **PD-060 — Grounded Opportunity Application Package** is canonical.

PD-060 establishes the Candidate Beta application boundary:

`authorised Candidate professional material + Concrete Opportunity source / Opportunity Understanding -> target-relative grounded selection, emphasis, composition and wording -> Grounded Application Package -> Targeted CV + Cover Letter -> Candidate review -> copy/export/download`.

A Concrete Opportunity is a specific external application target and remains distinct from exploratory Career Direction. Opportunity Understanding is a source-grounded Application-side Representation of that Opportunity, with reconstructable source provenance, and is separate from Person Knowledge and Career Direction Knowledge.

The Grounded Application Package is a derived Candidate/Application Representation for one Opportunity. Targeting may change selection, omission, ordering, emphasis, composition and wording of supported Candidate material, but cannot manufacture capability, ownership, leadership, experience, outcome, seniority, fit/readiness or Candidate truth from Opportunity wording or Candidate preference.

Every substantive Candidate-side professional claim must remain reconstructably grounded in authorised Candidate material. Application wording is not Person Knowledge or factual Professional Identity, and wording transformation may not increase semantic strength beyond its support. Targeted CV and Cover Letter share the same Grounded Application Package basis rather than maintaining independent truth.

Candidate artifact editing is allowed but does not rewrite Evidence, Person Knowledge or Professional Representation. New/stronger factual claims introduced through editing are not silently promoted to Person truth; they remain unverified/unadopted by IMAGO or require a separately authorised confirmation/acquisition path before becoming supported fact.

The minimal Beta lifecycle is one current Opportunity -> current Opportunity Understanding -> current Grounded Application Package -> CV + Cover Letter -> Candidate review -> copy/export/download, with minimal input identity/provenance and stale-state handling when relevant Candidate or Opportunity grounding changes. No CRM, bulk application management or complex version platform is authorised.

Unsupported Opportunity requirements remain `not sufficiently established from current Candidate information`, not automatic weaknesses/deficiencies/capability gaps. `not established != absent`.

Legacy CV/target code may later contribute mechanically safe formatting/template/rendering components, but legacy candidate-profile/trait/heuristic semantics are not canonical authority and must not bypass the current Professional Identity / Professional Representation / provenance boundary.

**Next authorised scope:** one bounded Candidate Beta implementation slice may support one Candidate + one concrete Opportunity/JD -> bounded Opportunity Understanding -> Grounded Application Package -> Targeted CV + Cover Letter from the same grounded basis -> Candidate review -> copy/export/download. It must preserve Candidate professional truth, Opportunity separation, provenance, semantic-strength boundaries, `not established != absent`, no fit/readiness and no automatic submission.

## PD-061 — Grounded Candidate Application Experience and Professional Document Composition
**Status:** CANONICAL AUTHORITY COMPLETE

PD-061 extends the closed PD-060 Application semantic foundation into a Candidate-grade Application Experience without changing Candidate truth or PD-060 grounding.

Canonical decisions:
- Concrete Opportunity/JD remains the first productive target boundary under PD-060 Opportunity Understanding.
- No-JD Target Role preparation is deferred until a separate Role Understanding / Role Knowledge source-and-provenance authority exists; model prior knowledge alone is not canonical role truth.
- A non-evaluative Target-Relative Information Map distinguishes `sufficiently_documented`, `related_but_not_established`, `not_sufficiently_established` and explicit `candidate_uncertain`; these are not fit/readiness/capability judgments.
- Material unknowns may trigger optional targeted acquisition only through existing authorised Evidence/Knowledge paths; unanswered questions are not negative evidence.
- A canonical CV Content Model is separate from visual templates and preserves coherent professional/educational history while allocating greater detail to target-relevant grounded material.
- Candidate-controlled contact data is Application/account-side information, distinct from canonical professional Knowledge.
- Quantitative professional evidence is valuable when supported and must never be invented.
- Preferred CV budget is approximately one page, with two pages acceptable when needed for material history/evidence; space allocation is composition, not Candidate scoring.
- CV and Cover Letter use Candidate-owned document voice while preserving semantic strength.
- Cover Letter is a grounded narrative composition, not a prose copy of the CV and not a source of invented motivation/suitability.
- Content and presentation are separate. Beta template families are Essential/ATS-friendly, Professional and Compact/Modern.
- PDF is the required Candidate-grade stable output for the bounded Beta; DOCX is authorised where the same grounded content boundary can be preserved. TXT-only output is insufficient for Candidate-grade completion.
- UI language, Opportunity/source language and generated-document language are separate dimensions.
- Application workspace state remains separate from Professional Identity; only canonical acquisition may update Candidate truth.
- Candidate remains final human authority over review and external use.

Controlled-exploration requirements promoted into the next bounded implementation are: purpose-gated Career Preference controls; visible major-purpose actions at generic entry; distinguishable professional-source labels; corrected IT/EN application/document language routing; coherent Candidate voice; removal of internal grounding jargon from normal Candidate UI; Candidate-grade CV/letter composition; and professional document materialization.

Explicitly deferred:
1. productive no-JD targeting pending separate Role Understanding / Role Knowledge authority;
2. BETA-04 Portable Professional Identity export/import/resume;
3. separate Data & Privacy Architecture exploration.

**Next authorised scope:** one bounded “Marco” + supplied Industrialization Project Engineer JD vertical may implement Opportunity Understanding -> Target-Relative Information Map -> material unknowns -> optional authorised acquisition -> complete CV Content Model -> target-focused Candidate-grade CV + Cover Letter -> template preview -> PDF download (DOCX optional if bounded) -> return to Professional Identity without Opportunity contamination, while addressing the promoted UX/Application findings and preserving all PD-060 semantic-strength/provenance constraints.


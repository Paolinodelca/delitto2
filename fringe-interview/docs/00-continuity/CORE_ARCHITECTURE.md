# IMAGO Core — Architecture Map

Status: **CURRENT**

Verified through: **Task 0100E-39**

## Principle

IMAGO does not evaluate a person in the absolute. The Core organizes reconstructable knowledge while preserving evidence, origin, confidence, version, provenance and dependencies.

```text
Evidence → Measurement → Knowledge → Derived Knowledge → Composed View
```

Evidence remains authoritative. Knowledge is reconstructable. Elementary and derived knowledge remain distinct. Deterministic Foundations do not introduce person scores, implicit evaluation or LLM inference.

## Current end-to-end map

```text
Input / Evidence                                      [Core]
→ Observation                                         [Core]
→ MeasurementResult / MeasurementDimensionMapping    [Core]
→ DimensionContribution / KnowledgeLedger             [Core]
→ KnowledgeSnapshot / DimensionKnowledgeState         [Core]
→ CapabilityRecipe / DerivedDimensionKnowledgeState   [Core]
→ PersonKnowledgeMatrix                               [Core]
→ KnowledgeCoverage                                   [Core]
→ KnowledgeOpportunity                                [Core]
→ KnowledgeAcquisitionNeed                            [Core]
→ KnowledgeAcquisitionStrategy                        [Core]
→ KnowledgeAcquisitionRequirement                     [Core]
→ KnowledgeAcquisitionDesign                          [Core]
→ KnowledgeAcquisitionCapabilityMatch                 [Core]
→ KnowledgeAcquisitionSolutionDecision                [Application]
→ KnowledgeAcquisitionCapabilityCompositionDesign     [Application; composed only]
→ KnowledgeAcquisitionCapabilityConfiguration         [Application; single/composed]
→ KnowledgeAcquisitionPlan                            [Application; implemented]
→ KnowledgeAcquisitionRuntimeSession                  [Application; implemented, stateful, pre-Execution]
→ KnowledgeAcquisitionExecution                       [Application; implemented, pre-invocation]
→ KnowledgeAcquisitionInvocationBoundary              [Application outbound port; implemented, effect-free contract]
→ Structured Input Invocation Adapter / Provider      [Infrastructure; Adapter implemented, Provider role only]
→ KnowledgeAcquisitionProviderResult                  [Infrastructure; implemented technical boundary]
→ Provider Result Evidence Extractor                  [Infrastructure; implemented]
→ Evidence[]                                          [Core; semantic boundary]
→ Knowledge Acquisition Evidence Intake               [Application; implemented]
→ EvidenceStore                                       [Core; populated aggregate/collection]
→ Registered Evidence Selection                       [Application; implemented, exact/read-only]
→ Evidence[]                                          [Core values; canonical immutable subset]
→ Observation Construction                            [Core semantics; implemented, Application-orchestrated]
→ Observation[]                                       [Core values; atomic, one Evidence cause each]
```

Query Foundations provide deterministic, read-only access for Matrix, Coverage, Opportunity, Need, Strategy and Requirement without reinterpreting upstream semantics.

## Core-owned layers

### Evidence, Measurement and Contribution

`InputBundle`, sources, Evidence, Observation, MeasurementResult, declarative mappings and DimensionContribution preserve the distinction between facts, measures and contributions. Raw source content is not copied into PersonKnowledgeMatrix.

### Elementary and derived knowledge

```text
DimensionContribution[]
→ KnowledgeLedger
→ KnowledgeSnapshot
→ DimensionKnowledgeState[]
```

```text
KnowledgeSnapshot
→ DerivedKnowledgeRule / CapabilityRecipe
→ CapabilityExecutionResult
→ DerivedDimensionKnowledgeState[]
```

Ledger and Snapshot are not mutated. Derived states are not appended to the elementary Contribution Ledger.

### PersonKnowledgeMatrix

The matrix is a deterministic, reconstructable materialized view. It preserves elementary and derived layers, shared dimensions without fusion, lineage, version context and dependency references. It is not an evidence store and does not create a person-level score.

### Declarative Knowledge Acquisition boundary

```text
PersonKnowledgeMatrix
→ Coverage
→ Opportunity
→ Need
→ Strategy
→ Requirement
```

This boundary describes available knowledge, incomplete composition, the missing layer, a general transformation category and the required knowledge availability. It does not prescribe method, source, channel, priority, plan or execution. Its mappings, cardinality and causality are frozen by `KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md`.

### Design and Match

`KnowledgeAcquisitionDesign` is the mechanism-neutral declarative consumer of Requirement. It receives explicitly resolved causal context and performs no lookup.

`KnowledgeAcquisitionCapabilityMatch` evaluates one immutable candidate snapshot per invocation. It returns `compatible`, `incompatible` or `indeterminate`. Discovery, availability, ranking and selection are not Core responsibilities.

## Application-owned layers

### Solution Decision

Application owns candidate discovery/resolution and the deterministic, auditable `KnowledgeAcquisitionSolutionDecision`. Supported modes are `single`, `composed`, `none` and `deferred`. The Decision does not configure, plan or execute a solution.

### Capability Composition Design

For `composed` only, Application builds exactly one declarative Composition Design from the Decision, source Design and selected capability snapshots. It records roles, contribution responsibilities, logical dependencies and declarative conditions.

Local validation proves only self-contained contract invariants. Contextual validation separately proves correspondence with the supplied Decision and Design. Neither validation performs discovery, matching or reselection.

## Runtime and Reporting legacy

The repository contains existing, health-checked Runtime, Beta Session and Reporting pipelines. They predate the Phase D/E downstream architecture and are not currently consumers of Solution Decision or Composition Design.

Their existence does not imply integration with Knowledge Acquisition. Any connection requires an explicitly reviewed Application/Runtime/Adapter boundary.

## Capability Configuration

Task 0100E-10 implements `KnowledgeAcquisitionCapabilityConfiguration` as one unified Application-owned declarative artifact for applicable `single` and `composed` Decisions. The composed path requires the corresponding Composition Design; the single path does not fabricate one. `none` and `deferred` produce no Configuration.

Configuration binds only explicit non-secret declarative values to already selected capability references. It does not repeat composition topology, resolve providers or adapters, order invocations, plan or execute.

## Knowledge Acquisition Plan

Task 0100E-12 implements `KnowledgeAcquisitionPlan` as the first consumer of a valid Configuration. It is an immutable Application-owned declarative organization of one item per selected capability. Plan scope is exactly the Configuration capability scope; Plan Dependencies reference and preserve composed logical dependencies without converting them into executable ordering. The Plan contains no state, scheduling, Runtime, execution, results, provider binding or invocation payload. No intermediate contract is introduced.

## Knowledge Acquisition Runtime Session

Task 0100E-13 approves and E-14 implements `KnowledgeAcquisitionRuntimeSession` as the first operational boundary and first consumer of a valid Plan. It is Application-owned and holds a distinct stable session identity, exact Plan/Plan Item causal refs, closed lifecycle, item-state progress, active-item selection and explicit operational timestamps. One Plan may cause zero or more Sessions; each Session refers to exactly one Plan. Resume/reconstruction preserves Session identity, while a new `sessionKey` creates a new Session for the same immutable Plan.

The Session is pre-Execution. It does not bind providers, create invocation payloads, execute, retry, collect results, persist events, update knowledge or assess Requirement satisfaction. No declarative Runtime Definition is required between Plan and Session.

## Approved Execution Direction and Side-Effect Boundary

Task 0100E-15 approves `KnowledgeAcquisitionExecution` as the Application-owned first direct Session consumer. It represents one explicitly authorized semantic attempt for one exact active Session item and preserves exact Session and Plan Item causality. No intermediate readiness, preparation, action or execution-request contract is required.

Task 0100E-16 implements Execution as an immutable, integration-neutral description with stable causal identity and the closed lifecycle `created`, `selected`, `ready_for_invocation`. It never mutates Session or Plan and stops before the separate Knowledge Acquisition Invocation Boundary. Invocation and every external effect require the repository-first Task 0100E-17 architecture review.

Task 0100E-17 approves `KnowledgeAcquisitionInvocationBoundary` as an Application-owned outbound port with an ephemeral, technology-neutral input contract. An Infrastructure Adapter is its first technological consumer; a Provider remains behind the Adapter. Task 0100E-18 may implement only the port, contextual validation and an effect-free test double. Concrete adapters, providers and real external effects remain unapproved.

Task 0100E-18 implements the effect-free Application boundary as a structural `invoke` port contract and an ephemeral, deeply immutable input with causal refs, resolved acquisition semantics and an integrity fingerprint. It introduces no persistent identity, lifecycle, Infrastructure implementation, result or outcome. Task 0100E-19 must review the first authorized downstream Infrastructure component.

Task 0100E-19 approves a capability-specific Infrastructure Invocation Adapter as the first consumer and concrete implementer of the Application-owned port. The Adapter and Provider are distinct responsibility levels: the Adapter translates the technology-neutral input and is the first future location of a real side-effect; the Provider exposes or performs the external mechanism behind it. Composition/bootstrap Infrastructure selects or injects the Adapter and Provider before `invoke`. No dynamic resolution, registry or generic routing occurs during the call, a generic Adapter is excluded, and no additional semantic boundary is required before the Provider. E-19 is review-only and implements or authorizes no concrete Adapter, Provider or side-effect.

Task 0100E-20 implements `StructuredInputKnowledgeAcquisitionInvocationAdapter` in Infrastructure for the exact `capability:structured-input-v1` reference. Its frozen port implementation receives a compatible Provider from bootstrap, validates the Application input and capability, and delegates the unchanged immutable input through the Provider's sole `acquireKnowledge` operation. This is the authorized effect boundary. No concrete Provider or transport is implemented, and no runtime selection, registry, resolver, routing, discovery, retry, timeout, output normalization, persistence or Knowledge Update is introduced.

Task 0100E-21 approves Infrastructure-owned `KnowledgeAcquisitionProviderResult` as the first new boundary after the Adapter and already established Provider role. A future compatible Provider returns one closed, immutable and ephemeral technical result causally bound to the Invocation Input fingerprint; the Adapter validates and passes it through. Raw external response remains integration-private. Provider Result is not an Application Invocation Result, acquired knowledge, Evidence or Knowledge Update. Task E-22 may implement only this effect-free result foundation and minimum Provider/Adapter contract enforcement; concrete Provider, transport, external I/O, error normalization and semantic transformation remain excluded.

## Not approved or implemented downstream

- acquisition Action or executable Recipe beyond the approved semantic Execution;
- dynamic provider/adapter resolution, registry or generic routing;
- concrete invocation and runtime orchestration;
- execution result and observation ingestion for this boundary;
- Requirement satisfaction;
- Knowledge Update;
- Runtime/Reporting legacy integration.

Task 0100E-22 implements the Infrastructure-owned `KnowledgeAcquisitionProviderResult` as a closed, deeply immutable, ephemeral technical result. Its sole authorized state is `succeeded`; it carries an opaque cloned `providerPayload`, the exact Invocation Input fingerprint and a deterministic integrity fingerprint. The Adapter validates contextual causality and returns the same result. Provider throws/rejections remain errors rather than embedded failure states.

Task 0100E-23 approves a capability-specific Infrastructure Provider Result Evidence Extractor as the first semantic crossing. It validates the technical result/context, understands only the structured-input payload schema and materializes zero or more existing Core-owned Evidence values. Infrastructure technical processing ends at this anti-corruption crossing; the semantic domain begins at Evidence. Core does not import Provider Result or provider schema. Direct Knowledge, Knowledge Candidate, generic normalization, state updates and Requirement satisfaction are excluded. E-24 may implement only the effect-free extractor Foundation without changing existing Provider, Adapter, Provider Result or Evidence contracts.

Task 0100E-24 implements that extractor for `capability:structured-input-v1`. It validates Provider Result and originating Invocation Input context, interprets only the closed fixture-backed `structured_input` records schema, and returns a fresh deeply frozen Core `Evidence[]`. Evidence identities are deterministic; source identity and exact Invocation Input/Provider Result fingerprints are preserved as provenance. Empty extraction is valid and is not a failure or satisfaction decision. No I/O, persistence, Provider invocation, state update, scoring, confidence assignment or semantic deduction occurs.

Task 0100E-25 approves a narrow Application-owned Knowledge Acquisition Evidence Intake operation as the first direct consumer of extracted `Evidence[]`. It coordinates Core validation and atomic copy-on-write registration into the existing Core-owned EvidenceStore aggregate/collection. EvidenceStore is an in-memory authoritative domain collection, not persistence and not the Application use-case boundary. No new Evidence Collection contract is introduced.

Task 0100E-26 implements the operation as `intakeKnowledgeAcquisitionEvidence`. It consumes one explicit valid EvidenceStore and a valid `0..N` Evidence batch, rejects any exact identity collision before building, returns a fresh deeply frozen Store, preserves Store metadata/identity semantics and every Evidence property, and updates only canonical Evidence ordering and `statistics.totalEvidence`. Empty input is a valid fresh-store no-op. No Core API or contract is changed.

Task 0100E-27 approves and Task 0100E-28 implements an Application-owned Registered Evidence Selection operation as the first direct consumer of the populated Store. `selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore, evidenceIds })` accepts exact unique Evidence IDs and returns a fresh deeply immutable canonical subset of cloned, otherwise unchanged registered Evidence. Task E-29 approves and Task E-30 implements Core-owned, Application-orchestrated `constructObservationsFromRegisteredEvidence` as its first interpreting consumer. Construction requires one existing Measurement and explicit closed versioned exact-content rules; one Evidence may cause zero or more Observations, while every Observation has one exact Evidence cause through `contentRef` and preserves the original source through `sourceRef`. Local validation proves the closed input; contextual validation proves Measurement method, target and source correspondence. N:1 Observation, Observation Candidate/Store, Measurement creation/result, persistence, Contribution, Knowledge Update, Requirement satisfaction, concrete Provider integration and Runtime mutation remain excluded. No next task is currently authorized.

Task E-31 approves and Task E-32 implements Core-owned, Application-orchestrated Measurement Result Normalization as the first direct consumer of constructed Observations. The same existing Measurement, one explicit target characteristic, immutable Observations and a closed versioned normalization context yield exactly one existing MeasurementResult. `0..N:1` aggregation is authorized only here; result identity is deterministic, references are canonical, output is deeply immutable and aggregate confidence/quality/reliability come only from explicit versioned rules. Empty or unusable input yields `insufficient_data`, never absence. No intermediate contract or Store is required. Dimension mapping, Contribution and Knowledge remain outside the implemented gate.

Task E-33 determines that `MeasurementDimensionMapping` is pre-existing declarative policy, not an artifact produced by or consuming MeasurementResult. Application must explicitly supply/select exactly one Mapping; the next Core-owned applicability boundary may only validate the E-32 result and Mapping, require calculated status and exact `measurementId` equality, and preserve both unchanged. `insufficient_data` stops explicitly before application. E-34 is the sole planned Foundation; Contribution creation, fan-out, registration, stores and Knowledge remain unapproved.

Task E-34 implements that Core boundary as `evaluateMeasurementResultMappingApplicability({ measurementResult, mapping })`. Invalid input throws a typed validation error; exact-ID calculated input returns `applicable` with a frozen semantic Mapping clone; calculated mismatch returns `not_applicable`; and `insufficient_data` returns `stopped`. The operation has no identity, discovery, fan-out, metric transformation or downstream invocation. A post-applicability architecture review is required before any further implementation gate.

Task E-35 approves the existing Core `mapMeasurementResultToDimensionContributions` as the first consumer of the original calculated Result plus the Mapping carried by an `applicable` E-34 outcome. Application owns branching/orchestration; Core emits exactly one existing Contribution per explicit unique Mapping target. Other E-34 outcomes never invoke the mapper. Mapping supplies Dimension, polarity, weight and confidence factor; Result supplies magnitude and confidence inputs; quality and reliability remain on the referenced Result. E-36 is the sole planned gate and may harden only identity, canonical provenance, deep immutability and explicit formula provenance. Ledger and Knowledge remain separate and unauthorized.

Task E-36 hardens that same mapper without changing its API, owner, responsibility, inputs, formulas, output contract or target-driven cardinality. Each Contribution ID hashes its complete canonical semantic body; the body includes a content-derived fingerprint of the complete Mapping policy, canonical Result/Mapping/Observation references and explicit versioned formula strategies, expressions and operands. Local validation rejects invalid or non-canonical inputs, contextual validation requires exact `measurementId` and `calculated`, and the returned Contribution array is freshly deeply frozen. No parallel mapper, contract change, Ledger append, Snapshot, Knowledge, Matrix, Coverage, I/O or Runtime mutation is introduced.

Task E-37 approves the existing Core `appendDimensionContributions` as the first direct consumer of one hardened mapper batch, under Application orchestration. It atomically returns one new Ledger, preserves Contributions and provenance unchanged, rejects exact ID collisions and performs no aggregation. E-38 may harden only this intake/append path. Snapshot, Dimension state, derived knowledge, Matrix and Coverage remain separate and unauthorized.

Task E-38 hardens that same Core append boundary without changing its public signature or responsibility. The complete existing Ledger and `0..N` batch are validated before construction; exact collisions reject the entire intake; canonical stored ordering and provenance are required; Ledger identity hashes complete canonical Contribution content; the validator recalculates identity and derived statistics; and the fresh result is deeply frozen. Empty intake is a fresh identity-stable semantic no-op. Application continues to orchestrate directly through the existing Core operation. No downstream consumer is authorized.

Task E-39 approves `buildKnowledgeSnapshot(ledger, options)` as the first direct consumer of the complete updated Ledger. Snapshot is a Core-owned reconstructable materialized view: construction groups all Contributions by `dimensionId` and performs elementary aggregation inside the boundary. No partial-Ledger query, intermediate contract or higher Knowledge layer is authorized. E-40 may harden only Snapshot identity, lineage, canonical determinism, deep immutability and the established elementary aggregation path.

## Dependency direction

Lower layers must not import higher composed views. Core does not discover Application candidates. Application decisions may consume immutable Core outputs. Runtime concerns must not be added to Core contracts to absorb downstream ambiguity.

## Identity, versioning and immutability

- contract version and instance identity remain distinct;
- identities are deterministic, canonical and independent of input order and timestamps;
- inputs are not mutated in place;
- transferred structures are caller-owned deep clones where the contracts require it;
- runtime freezing is not inferred from immutability guarantees.

## Guardrails

Without an explicit implementation task, do not introduce person scoring, ranking, recommendation, diagnosis, automatic decision-making, Planning, Execution, Requirement satisfaction or Knowledge Update.

`not observed` does not mean `absent`.

## Verification

```powershell
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

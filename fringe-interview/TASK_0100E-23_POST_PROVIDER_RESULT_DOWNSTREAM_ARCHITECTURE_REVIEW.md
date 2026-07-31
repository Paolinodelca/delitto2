# Task 0100E-23 — Post-Provider-Result Downstream Architecture Review

## 1. Executive Summary

Repository-first outcome: **APPROVED WITH NOTES**.

The first legitimate semantic boundary after `KnowledgeAcquisitionProviderResult` is a **capability-specific Provider Result Evidence Extractor**. Its implementation is Infrastructure-owned because it consumes the Infrastructure result and understands the provider/capability-specific `providerPayload`; its output is the existing Core-owned `Evidence[]` boundary. The extractor is the anti-corruption crossing at which Infrastructure technical data is translated inward and the semantic domain begins.

It may validate the result against the originating Invocation Input, decode only the payload shape for `capability:structured-input-v1`, and materialize zero or more Evidence items with explicit source/provenance and preserved acquisition causality. It may not create Knowledge directly, assert final confidence or quality, update stores, Matrix or Coverage, decide Requirement satisfaction, or mutate Runtime Session, Execution, Plan or Strategy.

No `Knowledge Candidate`, generic decoder/normalizer, Application Invocation Result or separate translation artifact is justified before Evidence. Existing repository behavior already extracts Evidence from structured sources and updates, and the authoritative pipeline explicitly starts with Evidence. The sole next planned gate is `0100E-24 — Structured Input Provider Result Evidence Extractor Foundation`.

## 2. Repository Review

The review materially covered E-18 through E-22; Invocation Input/Port; Structured Input Adapter; Provider role and contract; Provider Result builder and validators; Core Evidence builders, validators, store and extractors; Observation, Measurement, Contribution, Ledger, Snapshot, elementary/derived knowledge, PersonKnowledgeMatrix and Coverage; Knowledge Acquisition Requirement through Execution; Core Architecture, Decisions, Roadmap, Continuity and the Phase D freeze.

Repository evidence is decisive:

1. Evidence is authoritative; Knowledge is reconstructed downstream from observations, measurements and contributions.
2. `providerPayload` is deliberately technical and opaque at the Provider Result boundary.
3. Core imports neither Application nor Infrastructure.
4. Existing basic extractors translate structured source material into zero or more Core Evidence items without updating knowledge state.
5. No repository-wide Knowledge Candidate, Acquired Knowledge, semantic normalization, Requirement satisfaction or Knowledge Update contract exists.
6. E-21 forbids Provider writes to Evidence/Knowledge stores, Coverage and PersonKnowledgeMatrix and reserves semantic transformation for a later inward boundary.

## 3. Current Architecture

```text
KnowledgeAcquisitionExecution                          [Application]
→ KnowledgeAcquisitionInvocationInput                  [Application]
→ KnowledgeAcquisitionInvocationPort                   [Application]
→ StructuredInputKnowledgeAcquisitionInvocationAdapter [Infrastructure]
→ Structured Input Provider role                       [Infrastructure]
→ KnowledgeAcquisitionProviderResult                   [Infrastructure]
```

The result is a closed, immutable, successful technical value. Its payload is JSON-compatible but has no repository semantic meaning. Adapter validation proves technical integrity and causality only; it does not establish that payload content is Evidence or Knowledge.

## 4. Downstream Analysis

The immediate downstream problem has two sides in one bounded component: understand the exact structured-input Provider payload, then express extractable source material through the existing Core Evidence contract. This is extraction, not generic normalization. “Decoding” is too narrow because parsing alone does not choose Evidence fields or provenance. “Knowledge extraction” is too advanced because repository Knowledge is not a direct transcription of source content.

The extractor is capability-specific for the same reason the Invocation Adapter is capability-specific: a generic component would require unapproved registries, schemas, routing or provider dispatch. Bootstrap supplies the compatible implementation; no runtime selection occurs.

The Provider Result is the technical input. `Evidence[]` is the semantic output. Zero items are legitimate when a valid payload contains no extractable evidence; zero must not be reinterpreted as failure, absence of knowledge, or Requirement non-satisfaction.

## 5. Boundary Candidates

### Provider Result Interpreter

Useful as a responsibility description, but too generic as an artifact. Without a precise output it can accumulate decoding, normalization, quality, Knowledge creation and update policy. The approved extractor narrows interpretation to Evidence materialization.

### Provider Result Decoder

Technical decoding may occur inside the extractor, but a decoder alone stops before semantic output and adds an unsupported intermediate representation.

### Provider Result Normalizer

Rejected. There is no repository-wide normalized provider schema and only one capability-specific Adapter contract.

### Knowledge Extraction / Knowledge Materialization

Rejected as the first boundary. Both bypass authoritative Evidence and the Observation → Measurement → Contribution → Ledger/Snapshot reconstruction path.

### Knowledge Candidate

Rejected. No such contract exists, and it would duplicate or blur Evidence while leaving authoritative evidence ingestion unresolved.

### Knowledge Translation

Rejected as ambiguous. The source is technical provider data, not Knowledge, and the first legitimate semantic output is Evidence.

### Evidence Extraction

Approved, refined as a capability-specific Provider Result Evidence Extractor. It matches existing source/update extraction precedent, keeps provider knowledge outside Core, and lands on an established authoritative Core boundary.

## 6. Ownership Analysis

| Concern | Owner | Reason |
|---|---|---|
| Provider Result and contextual validation | Infrastructure | Existing technical return contract |
| Structured-input payload schema understanding | Infrastructure extractor | Provider/capability-specific knowledge must not enter Core or Application |
| Evidence contract and validation | Core | Evidence is the authoritative first semantic artifact |
| Extractor construction/binding | Infrastructure bootstrap | Static capability-specific technical composition |
| Later orchestration and state transition | Unresolved future Application gate | No update/satisfaction workflow is approved |

The extractor is Infrastructure-owned; its semantic output is Core-owned. Outer Infrastructure may depend inward on Core contracts while Core remains unaware of Provider Result, payload schema and extractor implementation.

## 7. Dependency Analysis

```text
Infrastructure Provider Result Evidence Extractor
  → Infrastructure Provider Result validation
  → Application Invocation Input validation (existing inward dependency)
  → Core Evidence builder/validator
```

Forbidden directions are `Core → Infrastructure Provider Result`, `Application → concrete Infrastructure extractor`, and `Core Evidence → provider payload schema`. The Provider and Adapter do not import Core or create Evidence. Core continues to depend on neither Application nor Infrastructure.

## 8. Alternative Comparison

| Alternative | Strength | Architectural defect | Decision |
|---|---|---|---|
| A. Provider Result → Knowledge | Short path | Bypasses Evidence, Observation, Measurement and Ledger authority | REJECTED |
| B. Provider Result → Knowledge Candidate → Knowledge | Intermediate step | Candidate is absent and overlaps Evidence | REJECTED |
| C. Provider Result → Evidence → Knowledge | Reuses authoritative Core entry and extraction precedent | Needs strict provider-specific anti-corruption and later orchestration | APPROVED WITH REFINEMENT |
| D. Provider Result → normalized response → semantic artifact | Could serve many Providers | Generic schema/registry need is absent | REJECTED |

Refined C:

```text
Provider Result
→ capability-specific Provider Result Evidence Extractor
→ Evidence[]
→ existing semantic reconstruction pipeline
```

## 9. Recommended Architecture

Approve one `Structured Input Provider Result Evidence Extractor` Foundation as the next implementation gate. It is capability-specific, Infrastructure-owned and effect-free; consumes a valid Provider Result plus originating Invocation Input context; understands only the fixture-established structured-input payload schema; emits zero or more fresh validated Core Evidence values; and does not expose provider schema through Core APIs.

No standalone Decoder, Normalizer, Candidate or Application Invocation Result is required first. If E-24 shows that mandatory acquisition provenance cannot fit the current Evidence contract, it must stop and request another architecture review rather than alter that contract implicitly.

## 10. Responsibilities

The extractor may:

1. validate Provider Result structurally and contextually against Invocation Input;
2. require the exact supported capability;
3. read and decode `providerPayload` against one explicit structured-input schema;
4. distinguish extractable records from valid non-evidentiary technical content;
5. map records into zero or more Core Evidence inputs;
6. attach source identity/type/role, extraction method and supported causal provenance;
7. validate Evidence outputs and preserve caller input immutability;
8. fail locally on unsupported payload shape without normalizing Provider execution failures.

## 11. Forbidden Responsibilities

The extractor must not create Knowledge, Observation, MeasurementResult, DimensionContribution, Ledger, Snapshot or derived states; append to Evidence Store or Ledger; update PersonKnowledgeMatrix or Coverage; create Reports or persist data; score, evaluate quality, rank or decide final confidence; decide Requirement satisfaction or create Knowledge Update; mutate Session, Execution, Input, Plan, Configuration or Strategy; select Providers/capabilities; route, retry or normalize errors; perform external I/O; expose secrets/vendor objects; or modify Provider Result, Provider, Adapter or Core Evidence contracts.

## 12. Pipeline Update

```text
KnowledgeAcquisitionExecution                          [Application]
→ KnowledgeAcquisitionInvocationInput                  [Application]
→ StructuredInputKnowledgeAcquisitionInvocationAdapter [Infrastructure]
→ Structured Input Provider                            [Infrastructure]
→ KnowledgeAcquisitionProviderResult                   [Infrastructure technical boundary]
→ Structured Input Provider Result Evidence Extractor  [Infrastructure anti-corruption crossing]
→ Evidence[]                                           [Core semantic boundary begins]
→ Observation                                          [Core; existing]
→ MeasurementResult / DimensionContribution            [Core; existing]
→ KnowledgeLedger / KnowledgeSnapshot                  [Core; existing]
→ PersonKnowledgeMatrix / Coverage                     [Core; separately rebuilt/read-only]
```

Infrastructure's provider-result pipeline ends when technical payload becomes validated Core Evidence. The semantic domain begins at Evidence, not at the opaque payload and not at Knowledge. This review does not authorize automatic execution of the later Core chain or any stateful ingestion/update orchestration.

## 13. Risks

- No concrete Provider yet establishes the payload schema; E-24 must use the smallest deterministic fixture-backed schema.
- The legacy Evidence contract uses timestamps and flexible extensions; mandatory deterministic provenance may not fit without change. E-24 must stop rather than broaden it.
- Zero extracted Evidence can be confused with failure or missing knowledge.
- The extractor could absorb quality/confidence/measurement policy unless tightly scoped.
- Existing basic extractors are precedent, not permission to introduce provider concepts into Core.
- Evidence ingestion, Knowledge Update, satisfaction and Runtime completion remain unresolved.

## 14. Next Implementation Gate

The sole next planned task is `0100E-24 — Structured Input Provider Result Evidence Extractor Foundation`.

It may implement only the effect-free, capability-specific Infrastructure extractor; validate result/input causality; decode a minimal fixture-backed structured-input payload; build and validate zero or more existing Core Evidence values; expose only Infrastructure APIs; and add focused tests, health and continuity updates.

It may not implement or modify a concrete Provider, Adapter, transport, external I/O, Provider Result contract, Evidence contract, generic decoder/normalizer, Knowledge Candidate, Knowledge construction, Evidence Store/Ledger/Matrix/Coverage update, satisfaction, Runtime transition, persistence or reporting.

## 15. Self Review

- Repository-first review of E-18 through E-22 and required boundaries: **PASS**.
- First semantic boundary and ownership identified: **PASS**.
- Core independence preserved: **PASS**.
- Alternatives A through D compared: **PASS**.
- Direct Knowledge and speculative Candidate rejected: **PASS**.
- Responsibilities, exclusions, pipeline and sole next gate explicit: **PASS**.
- Documentation-only scope; no code or contract implementation: **PASS**.

Final outcome: **APPROVED WITH NOTES**.

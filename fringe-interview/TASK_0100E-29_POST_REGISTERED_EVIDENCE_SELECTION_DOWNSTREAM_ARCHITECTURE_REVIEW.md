# TASK 0100E-29 — Post-Registered-Evidence-Selection Downstream Architecture Review

Status: **COMPLETED**

Outcome: **APPROVED WITH NOTES**

## 1. Executive Summary

The first legitimate downstream consumer of the canonical immutable registered `Evidence[]` is a **Core-owned Observation Construction operation**, invoked by an Application use case with one explicit valid existing `Measurement` and an explicit deterministic construction rule set. The approved next boundary is:

```text
Registered Evidence Selection                  [Application]
→ Evidence[]                                   [Core values]
→ Observation Construction                     [Core semantic operation]
   + Measurement + explicit construction rules [Core inputs; Application supplied]
→ Observation[]                                [Core values]
→ future MeasurementResult                     [separate gate]
```

Observation is the first authorized interpretation: a rule-scoped classification of one registered Evidence item as zero or more atomic signals for one Measurement target. It is neither structural translation nor cross-Evidence synthesis. Every produced Observation is caused by exactly one selected Evidence, identifies that Evidence through `contentRef: { type: "evidence", id }`, preserves the Evidence's source through `sourceRef`, and belongs to exactly one supplied Measurement through `measurementId`. One Evidence may yield zero, one or several Observations; several Evidence values may not be collapsed into one Observation at this gate. Cross-Evidence combination begins only in the existing MeasurementResult normalization boundary.

No `ObservationCandidate`, Observation collection/store, new Observation contract, Measurement creation, MeasurementResult, Contribution or Knowledge update is justified. The next authorized implementation task is **0100E-30 — Registered Evidence Observation Construction Foundation**, limited to the effect-free Core operation, explicit closed construction context/rules, validation, public exposure, health and tests.

## 2. Repository Evidence Reviewed

The review inspected the repository rather than inferring a greenfield design:

- Core Evidence: `buildEvidence`, `validateEvidence`, `buildEvidenceStore`, `validateEvidenceStore`, Evidence public exports/health and Basic Extractors;
- Application intake and selection: E-26 intake, E-28 `selectRegisteredKnowledgeAcquisitionEvidence`, local/context validators, public API, tests and health;
- Observation: `buildObservation`, `validateObservation`, shared reference/minimization helpers, Observation public API and `test_measurement_observation_foundation`;
- Measurement: `buildMeasurement`, `validateMeasurement`, `buildMeasurementResult`, `validateMeasurementResult`, normalization and the Measurement/Observation foundation note;
- downstream separation: MeasurementDimensionMapping, DimensionContribution, KnowledgeLedger, KnowledgeSnapshot, PersonKnowledgeMatrix and Coverage contracts/builders/validators/health;
- reports and manifests E-24 through E-28;
- current authorities: `CONTINUITY`, `CORE_ARCHITECTURE`, `DECISIONS`, `NEXT_PHASE`, continuity index and `CORE_ROADMAP`;
- relevant aggregate Core and Overall Health entry points.

Material repository facts:

1. Evidence carries authoritative extracted content, source identity, nullable confidence, extraction provenance, metadata and extensions.
2. E-28 returns a new deeply frozen, canonically ordered array of unchanged registered Evidence; empty selection has no absence semantics.
3. Observation requires `measurementId`, `sourceRef`, `characteristicId`, signal type/status, direction/strength for observed signals, numeric confidence, evidence quality, source reliability, an extraction method and timestamp. It deliberately forbids raw source payloads.
4. Observation already provides opaque `contentRef`, suitable for one exact Evidence identity without changing the contract, and `sourceRef`, suitable for the Evidence's original source identity.
5. Measurement declares sources, scope, target IDs and method before observations are normalized. MeasurementResult consumes Observation references and performs redundancy grouping and weighted normalization.
6. No Evidence-to-Observation operation, Observation Candidate, Observation Collection or Observation Store exists.
7. Ledger, Snapshot, Matrix and Coverage are downstream reconstructable structures and are not lawful direct consumers of selected Evidence.

## 3. Current Architecture

```text
Provider Result                               [Infrastructure]
→ capability-specific Evidence extraction      [Infrastructure]
→ Evidence[]                                   [Core]
→ Evidence intake                              [Application]
→ EvidenceStore                                [Core aggregate/collection]
→ exact registered-Evidence selection          [Application]
→ Evidence[]                                   [Core; immutable subset]
→ ?
→ Observation                                  [Core]
→ MeasurementResult                            [Core]
→ MeasurementDimensionMapping
→ DimensionContribution
→ KnowledgeLedger → KnowledgeSnapshot
→ PersonKnowledgeMatrix → Coverage
```

Infrastructure ended at Evidence extraction. Application owns intake, exact selection and orchestration. Core owns Evidence, Measurement, Observation and every semantic rule that turns registered source material into an analytical signal.

## 4. Registered Evidence Selection Boundary

Selection is non-interpretive. Its input is one valid unambiguous EvidenceStore plus `0..N` exact unique IDs. Its output is one fresh immutable canonical `Evidence[]`. It may prove identity and membership only. It does not filter semantically, group, classify, infer absence, score, modify confidence, create analytical scope or discard Evidence from the Store.

The selected array is an invocation input, not a new aggregate or authority. EvidenceStore remains the authoritative in-memory collection.

## 5. Observation Boundary

Observation is an atomic analyzed signal, not copied Evidence. Construction is permitted only when the caller supplies:

- one valid existing Measurement whose source/scope/targets/method authorize the analysis;
- selected registered Evidence;
- a closed, explicit, versioned deterministic rule set defining supported Evidence types, target characteristic, signal classification, observed/not-observed criteria, direction/strength, confidence, evidence quality, source reliability, grouping/fingerprint behavior and producer identity.

The construction operation validates correspondence among Measurement, Evidence and rules, then returns fresh deeply immutable existing Observation values. It cannot create or mutate Measurement. It cannot emit `not_observed` merely because selection is empty or a rule finds no signal.

## 6. Downstream Candidates

### A. Evidence[] → Observation Construction [Core]

- Responsibility: apply explicit domain rules and build valid atomic Observation values.
- Ownership: Core; Application supplies inputs and invokes.
- Input/output: Evidence[] + Measurement + rules → Observation[].
- Cardinality: N Evidence → 0..M Observations; each Observation has exactly one Evidence cause.
- Causality/identity: exact Evidence `contentRef`, original source `sourceRef`, supplied Measurement ID; deterministic identity derived from those refs, characteristic, signal and rule version.
- Confidence: newly computed by explicit rule; never silently copied/defaulted.
- Mutability: fresh, deeply immutable output; inputs unchanged.
- Interpretation: limited classification of one Evidence item into an atomic signal.
- Dependencies: Core contracts only.
- Advantage: matches existing architecture and preserves dependency direction.
- Risk: an unconstrained implementation could hide policy; closed rules and contextual validation are mandatory.
- Decision: **approved with the constraints in this report**.

### B. Evidence[] → Observation Construction [Application] → Observation [Core]

- Responsibility/ownership: Application would own semantic classification while Core only validates output.
- Cardinality and causality: technically possible but policy would live outside the semantic owner.
- Advantage: convenient orchestration.
- Risk: Application becomes the owner of confidence, signal and absence semantics.
- Decision: **rejected**. Application orchestrates but does not define construction semantics.

### C. Evidence[] → Observation Candidate [Application] → Observation [Core]

- Responsibility: would stage tentative interpreted signals.
- Identity/confidence: introduces unresolved candidate identity and promotion semantics.
- Advantage: could support human/LLM review later.
- Risk: no repository contract or workflow requires it; duplicates Observation shape and creates a second semantic authority.
- Decision: **rejected**.

### D. Evidence → Observation, fixed 1:1

- Responsibility: structural conversion.
- Cardinality: exactly one-to-one.
- Advantage: simple traceability.
- Risk: falsely assumes every Evidence contains exactly one relevant signal and prevents zero/multiple characteristic signals.
- Decision: **rejected**.

### E. Evidence[] → Observation, N:1

- Responsibility: cross-Evidence synthesis.
- Causality/confidence: requires first-class multiple Evidence refs and aggregation semantics not present in Observation.
- Advantage: compact synthesis.
- Risk: overlaps MeasurementResult, loses atomicity and cannot be represented cleanly by the existing contract.
- Decision: **rejected for this gate**.

### F. Evidence[] → Observation[] with explicit rules

- Responsibility: rule-driven atomic construction.
- Ownership: Core rules/operation, Application orchestration.
- Cardinality: N → 0..M, constrained to one Evidence cause per Observation.
- Advantage: preserves zero/one/many outcomes without cross-Evidence synthesis.
- Risk: becomes ambiguous unless Measurement and rule versions are mandatory.
- Decision: **approved; this is the operational form of candidate A**.

### G. Direct use of existing Observation contracts without a Foundation

- Responsibility: ad hoc callers invoke `buildObservation`.
- Advantage: no new API.
- Risk: the builder defaults missing semantics and timestamp/identity; it does not validate Evidence membership, Measurement correspondence, causality or rule authority.
- Decision: **rejected**.

### H. Observation Construction Context/Rules as input, not a Candidate

- Responsibility: an explicit closed construction input describes the authorized semantic method and correspondence.
- Ownership: Core contract; supplied by Application.
- Output: no separately persisted domain object; it is the validated input to candidate A/F.
- Advantage: makes interpretation reviewable without inventing an Observation Candidate.
- Risk: scope creep into generic rule engine or taxonomy.
- Decision: **approved only as the minimum input contract inside E-30**.

## 7. Candidate Comparison

| Candidate | Core semantics | Exact causality | Existing contracts | Avoids premature synthesis | Decision |
|---|---:|---:|---:|---:|---|
| A/F Core rule-driven construction | Yes | Yes | Yes | Yes | Approved |
| B Application construction | No | Possible | Yes | Yes | Rejected |
| C Candidate layer | Split | Unspecified | No | Yes | Rejected |
| D fixed 1:1 | Yes | Yes | Yes | Yes | Rejected |
| E N:1 Observation | Yes | Contract gap | No | No | Rejected |
| G ad hoc builders | Unowned | No | Yes | Unclear | Rejected |
| H explicit context/rules input | Yes | Supports A/F | Minimal new input | Yes | Approved as input only |

## 8. Ownership Matrix

| Artifact/operation | Owner | Role |
|---|---|---|
| Evidence / EvidenceStore | Core | authoritative extracted source material and collection |
| Registered Evidence Selection | Application | exact read-only selection |
| Measurement | Core | pre-existing analytical scope, targets and method |
| Observation construction rules/context | Core contract, Application supplied | explicit authority for classification |
| Observation Construction | Core | deterministic semantic transformation |
| Observation | Core | atomic interpreted signal |
| MeasurementResult and later artifacts | Core | separate downstream processing |
| Provider/Adapter/LLM/persistence | None in this gate | excluded |

## 9. Responsibility Matrix

| Responsibility | Selection | Construction | MeasurementResult | Excluded |
|---|---:|---:|---:|---:|
| Prove exact registered membership | Yes | Consume | No | — |
| Preserve Evidence unchanged | Yes | Yes | Reference only | — |
| Supply analytical scope | No | Validate | Consume | Measurement creation |
| Classify atomic signal | No | Yes, explicit rules | No | free-form inference |
| Assign Observation confidence/quality/reliability | No | Yes, explicit rules | Aggregate later | final/scientific scoring |
| Combine several Evidence values | No | No | Via Observation aggregation | N:1 Observation |
| Infer absence from empty/no-match | No | No | No | forbidden |
| Update Knowledge structures | No | No | No | forbidden |

## 10. Cardinality

Approved cardinality:

```text
1 Measurement + 0..N selected Evidence + 1 rule set
→ 0..M Observation

1 Evidence → 0..M Observation
1 Observation → exactly 1 Evidence cause
1 Observation → exactly 1 Measurement
N Evidence → 1 Observation: not approved
```

An empty input produces an empty Observation array. It does not produce a `not_observed` Observation. Several Evidence values may independently produce observations for the same characteristic; later normalization handles independence and redundancy without deleting Evidence.

## 11. Causality and Provenance

Each Observation must retain three distinct causal axes:

1. `measurementId` identifies the exact analytical scope and method;
2. `contentRef: { type: "evidence", id: evidence.id }` identifies the exact registered Evidence cause;
3. `sourceRef` preserves the Evidence source (`sourceType`/`sourceId`) rather than replacing source provenance with the Evidence ID.

`extractedBy` identifies the construction rule/producer; rule version and deterministic construction context belong in approved metadata/extensions without raw content. `locationRef`, `independenceGroup` and `evidenceFingerprint` may be set only by explicit rules. Evidence content, metadata, acquisition provenance, confidence and extensions remain untouched in EvidenceStore.

No Evidence is deleted, merged or marked consumed. Semantic redundancy affects only later analytical weighting.

## 12. Identity

Observation identity must be deterministic and independent of wall-clock time. The logical identity must include at least Measurement ID, Evidence ID, characteristic ID, signal type/status, rule ID/version and a deterministic ordinal/discriminator when one Evidence emits several signals. The existing builder's timestamp-based fallback ID is not authorized for E-30 output.

Repeated construction with identical logical input must produce the same IDs and canonical Observation order; ambiguous duplicate logical identities must be rejected.

## 13. Confidence

Observation confidence is assigned by the explicit Core construction rule, not by selection, EvidenceStore, Infrastructure or an arbitrary caller. Evidence confidence is never mutated. It is not automatically transferred because it is nullable and expresses a different boundary. It is not automatically aggregated because one Observation has one Evidence cause. A versioned rule may use a numeric Evidence confidence as one declared input; `null` must remain unknown and may not be coerced to zero or certainty.

Observation `confidence`, `evidenceQuality` and `sourceReliability` remain distinct. E-30 may implement deterministic fixture-backed baseline values/rules only; it may not claim scientific or final confidence. Cross-Observation confidence aggregation belongs to MeasurementResult.

## 14. Interpretation Boundary

Observation is a **classification/interpretation of an atomic signal**. It is not:

- a structural translation of every Evidence;
- a synthesis of several Evidence values;
- a person evaluation, dimension contribution or Knowledge conclusion;
- a semantic deletion/deduplication step;
- an LLM judgment or final score.

The minimum authorized interpretation is: for an explicitly targeted characteristic under a supplied Measurement method, determine whether one Evidence contains a rule-defined atomic signal and, if so, assign its signal attributes and bounded technical confidence fields.

## 15. Measurement Boundary

Measurement begins **before Observation construction as explicit scope**, but E-30 does not create it. The caller must supply a valid Measurement whose source references, target IDs, scope and method correspond to the selected Evidence and rule set.

MeasurementResult begins only after Observation construction, when existing normalization consumes valid observations belonging to that Measurement. E-30 cannot normalize, weight across Evidence, calculate coverage, map dimensions or emit insufficient-data results.

“Not observed” is an explicit rule outcome within an examined authorized unit, not the default for empty selection, unsupported Evidence, no rule match or missing data. Therefore `non osservato ≠ assente` remains preserved.

## 16. Architectural Decision

**ADR-040 — Explicit Core Observation construction is the first interpretation of selected registered Evidence.**

Outcome: **APPROVED WITH NOTES**.

- First consumer: Core-owned Registered Evidence Observation Construction operation.
- Ownership: Core semantics and input contract; Application orchestration.
- Input: immutable selected registered Evidence[], one valid existing Measurement and one closed explicit versioned construction rule/context.
- Output: fresh deeply immutable canonical Observation[].
- Cardinality: Evidence 1→0..N; batch N→0..M; every Observation has exactly one Evidence cause and one Measurement; N→1 is deferred.
- Causality: Measurement ID + exact Evidence contentRef + original sourceRef + rule producer/version.
- Identity: deterministic from logical causality; no timestamp fallback.
- Confidence: assigned by explicit rule, Evidence confidence unchanged and not implicitly transferred/aggregated.
- Interpretation: atomic signal classification only.
- Intermediate contract: no Observation Candidate; only a minimal validated construction context/rule input.
- Prohibited: Measurement creation/result, cross-Evidence synthesis, Contribution/Knowledge updates, persistence/I/O, LLM, final scoring and absence inference.
- Next task: `0100E-30 — Registered Evidence Observation Construction Foundation`.

## 17. Rejected Alternatives

- Application-owned semantics: violates semantic ownership.
- Fixed 1:1 conversion: invents signals and rejects valid zero/multiple outcomes.
- N:1 Observation: requires multiple-cause representation and overlaps MeasurementResult.
- Observation Candidate: unsupported extra lifecycle and duplicate semantic shape.
- Observation Collection/Store: no consumer or persistence requirement; arrays plus Measurement references are sufficient.
- Ad hoc use of builders: fails contextual causality, deterministic identity and rule authorization.
- Measurement or Knowledge first: bypasses the established Observation boundary.

## 18. Guardrails

- Evidence and EvidenceStore remain unchanged and authoritative.
- Selection remains Application-owned and non-interpretive.
- Core imports neither Application nor Infrastructure.
- Construction is pure, deterministic, synchronous and effect-free.
- Inputs are never mutated; outputs are fresh and deeply immutable.
- Empty input/output has no absence semantics.
- No raw Evidence content is copied into Observation.
- No automatic Measurement, MeasurementResult, Contribution, Ledger, Snapshot, Matrix, Coverage, Requirement satisfaction or Runtime update.
- No Provider, Adapter, LLM, database, filesystem, network or report generation.
- No destructive semantic deduplication, Evidence loss or final/scientific score.

## 19. Self Review

| Check | Result |
|---|---|
| Repository-first evidence reviewed | PASS |
| Fifteen mandatory questions answered | PASS |
| Candidates A–H evaluated | PASS |
| Ownership/dependency direction explicit | PASS |
| Cardinality and N:1 decision explicit | PASS |
| Causality/provenance representation explicit | PASS |
| Identity and confidence authority explicit | PASS |
| `not observed != absent` preserved | PASS |
| Measurement/Knowledge kept outside next task | PASS |
| No production implementation in E-29 | PASS |

## 20. Residual Risks

- The existing Observation contract has only one `contentRef`; the approved gate deliberately limits each Observation to one Evidence cause. Future N:1 Observation semantics require a separate contract review.
- `sourceRef` correspondence to Measurement `sourceRefs` needs a precise contextual rule because Evidence stores `sourceId/sourceType` as strings while Measurement uses typed refs.
- Construction rules, taxonomy and calibration are not yet present. E-30 must remain closed and fixture-backed rather than introduce a generic rule engine.
- Existing builders do not deep-freeze output and provide time-based defaults. E-30 must wrap existing contracts with deterministic identity, validation, cloning/freezing and canonical ordering without changing them.
- Numeric confidence/quality/reliability fields can look scientific. E-30 documentation must identify them as bounded technical baseline values only.

## 21. Next Authorized Gate

`0100E-30 — Registered Evidence Observation Construction Foundation`

Type: **FOUNDATION**

Status: **PLANNED**

Authorized scope only:

- one effect-free Core operation consuming selected registered Evidence, one existing Measurement and one closed explicit versioned construction context/rule set;
- exact local and contextual validation;
- deterministic Observation identity and canonical ordering;
- one exact Evidence cause per Observation through `contentRef` and preserved original source through `sourceRef`;
- atomic classification with Evidence 1→0..N and batch N→0..M;
- explicit technical confidence, quality and reliability rules;
- existing Observation builder/validator use without modifying their contracts;
- minimum Core public exposure, health and tests required by repository convention.

Not authorized:

- Observation Candidate or Observation Store/Collection;
- new Measurement or changes to Measurement/Observation/Evidence contracts;
- N:1 Observation or cross-Evidence synthesis;
- MeasurementResult/MeasurementDimensionMapping/DimensionContribution;
- Ledger/Snapshot/Matrix/Coverage/Requirement satisfaction/Knowledge update;
- semantic Evidence deletion/merge, persistence, I/O, Provider/Adapter/LLM, runtime mutation, report generation or final scoring.

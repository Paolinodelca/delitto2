# TASK 0100E-25 — Post-Evidence-Extraction Downstream Architecture Review

Status: **COMPLETED**
Outcome: **APPROVED WITH NOTES**
Continuity impact: **BOUNDARY**

## 1. Executive Summary

The first legitimate direct consumer of the immutable Core-owned `Evidence[]` returned by the Structured Input Provider Result Evidence Extractor is an **Application-owned Knowledge Acquisition Evidence Intake operation**. Its sole domain destination is the existing **Core-owned EvidenceStore**, used as an immutable authoritative aggregate/collection. The approved flow is therefore:

```text
Structured Input Provider Result Evidence Extractor [Infrastructure]
→ Evidence[]                                  [Core values]
→ Knowledge Acquisition Evidence Intake       [Application operation]
→ EvidenceStore                               [Core aggregate/collection]
→ future Evidence-to-Observation processing   [Core semantics; separate gate]
```

This is candidate C with an important repository-first qualification: “pipeline” means a narrow synchronous Application use case, not a new domain value, runtime pipeline, queue, database, repository, event stream or persistence layer. No new intermediate contract is justified. The intake validates the supplied Core values, checks exact identity collisions and acquisition-provenance coherence, and returns a fresh valid EvidenceStore without mutating inputs. Empty input is a valid no-op result and is not absence, failure or Requirement satisfaction.

The current `buildEvidenceStore` is not this intake. It is a legacy Core builder that extracts Evidence from an `InputBundle`; it does not accept already extracted `Evidence[]`, append to an existing store, reject duplicate Evidence IDs, or persist anything. Consequently E-25 approves the architecture, not reuse by semantic fiction.

Direct `Evidence[] → Observation` is rejected. Observation represents an analyzed signal scoped to a Measurement and requires characteristic, direction/strength or `not_observed`, quality, reliability and confidence semantics that extraction neither knows nor may invent. Evidence registration must precede that separate transformation.

## 2. Repository Evidence Reviewed

The review inspected the repository at mandatory base HEAD `ecd1008d24740bc109213e2d95c842bae247687a`, including:

- Core Evidence: `buildEvidence`, `validateEvidence`, `buildEvidenceStore`, `validateEvidenceStore`, basic source extractors, exports, Evidence Store tests and health;
- E-24 Infrastructure extractor: extraction, payload/context validators, identity, health, fixture, dedicated/regression/public-API tests and E-24 report;
- E-23 architecture report and manifest;
- Observation and Measurement: builders, validators, normalization, foundation notes and tests;
- Dimension Contribution, Measurement mapping, KnowledgeLedger append/build/validation, KnowledgeSnapshot and their tests/health;
- PersonKnowledgeMatrix builder/validator/tests and public layering;
- the legacy `test_intake_evidence_pipeline.js`, which contains no intake component and exercises `InputBundle → buildEvidenceStore` only;
- current authority documents: Continuity index/workflow, `CONTINUITY.md`, `CORE_ARCHITECTURE.md`, `DECISIONS.md`, `NEXT_PHASE.md`, Core roadmap and the acquisition boundary freeze;
- pertinent Core, Application and Infrastructure public APIs and aggregate/overall health entry points.

Repository facts that control the decision:

1. Evidence is Core-owned and contains source identity, extraction metadata, nullable confidence and extensions.
2. E-24 returns a fresh deeply frozen `Evidence[]`, preserves exact Invocation Input and Provider Result fingerprints in `extensions.acquisitionProvenance`, and performs no update or I/O.
3. `EvidenceStore` is a Core object containing `evidence`, `sources`, statistics, metadata and extensions. No repository/database interface, load/save method, transaction or external side effect exists.
4. `buildEvidenceStore` consumes an `InputBundle` or legacy source array and performs extraction itself. It is not an append/register operation for Evidence values.
5. `validateEvidenceStore` validates member shape but currently does not reject duplicate Evidence IDs or prove acquisition causality.
6. No implemented Evidence Intake Pipeline or Evidence Collection domain contract exists. `EvidenceCollectionPlan` is a different legacy planning artifact.
7. Observation does not accept Evidence. It requires `measurementId`, source/location references, characteristic and signal semantics; Measurement requires source references and analysis scope.
8. Measurement normalization deduplicates redundant observed signals by independence group/fingerprint for analytical weighting. That is not authoritative Evidence deduplication.
9. KnowledgeLedger is append-only in logical semantics, rejects duplicate Contribution IDs, and returns a newly built Ledger. It is a useful immutability pattern, not an Evidence intake implementation.
10. KnowledgeSnapshot and PersonKnowledgeMatrix are reconstructable downstream views, explicitly not authoritative Evidence stores.

## 3. Current Architecture

The verified chain is:

```text
Provider Result [Infrastructure technical value]
→ capability-specific extractor [Infrastructure anti-corruption boundary]
→ Evidence[] [Core semantic values]
→ unresolved intake/registration boundary
→ EvidenceStore [Core authority]
→ Measurement + Observation
→ MeasurementResult
→ DimensionContribution
→ KnowledgeLedger
→ KnowledgeSnapshot
→ derived knowledge / PersonKnowledgeMatrix
```

Infrastructure ends when the extractor returns `Evidence[]`. It cannot call the Application intake, update the Store, or create downstream semantic objects. Dependency direction remains inward: Infrastructure may depend on Core Evidence; Core must not know Provider Result or its schema.

## 4. Evidence Boundary

Evidence is authoritative extracted source material, not an interpreted observation. Registration must preserve every supplied Evidence value unchanged, including `confidence: null`. Intake may inspect and clone/freeze but must not enrich, score, reinterpret, merge or rewrite Evidence.

`Evidence[]` has batch cardinality `0..n`. An empty batch remains legitimate. It means only “this extraction produced no Evidence”; it does not mean that a characteristic is absent, that acquisition failed, or that a Requirement is satisfied/unsatisfied.

Evidence identity supplied by E-24 is deterministic. Intake therefore treats equal IDs as identity collisions. It must reject duplicate IDs within the incoming batch and against the current Store; it must not silently keep first/last, merge payloads or convert a collision into a semantic conclusion.

## 5. Downstream Candidates

### A. Evidence[] → EvidenceStore

| Property | Assessment |
|---|---|
| Ownership | Core Evidence values and Core EvidenceStore |
| Responsibility | Authoritative collection of registered Evidence |
| Cardinality | `0..n Evidence + 0..1 current Store → 1 new Store` |
| Causality | Evidence identity/provenance retained; no Application use-case boundary |
| Mutability | Must be copy-on-write |
| Side effect | None in the current repository |
| Persistence | None |
| Advantages | Short path; uses the existing authoritative aggregate |
| Risks | The existing builder does not consume Evidence; a direct call would conflate construction/extraction with registration and leave orchestration ownership implicit |
| Decision | **Rejected as a complete direct architecture; retained as the domain destination behind intake** |

### B. Evidence[] → Observation

| Property | Assessment |
|---|---|
| Ownership | Evidence and Observation are Core-owned |
| Responsibility | Would transform extracted material into measurement-scoped signals |
| Cardinality | Potentially `1 Evidence → 0..n Observations`; not established |
| Causality | Requires explicit Evidence refs, Measurement ref and analysis method |
| Mutability | Could be immutable but no builder/adapter exists |
| Side effect | None required, but it bypasses registration authority |
| Persistence | None |
| Advantages | Moves toward the knowledge chain |
| Risks | Invents characteristic, direction, strength, confidence, quality and reliability; bypasses Store; confuses extraction with observation |
| Decision | **Rejected** |

### C. Evidence[] → Evidence Intake Pipeline → EvidenceStore

| Property | Assessment |
|---|---|
| Ownership | Application operation; Core Evidence and EvidenceStore |
| Responsibility | Coordinate validation and atomic immutable registration into the Core aggregate |
| Cardinality | One call consumes one `0..n` batch and optional current Store, returning exactly one new Store; no-op is valid |
| Causality | Preserves Evidence IDs and provenance; validates batch/store coherence without importing Provider contracts |
| Mutability | No in-place mutation; fresh Store and caller-isolated structures |
| Side effect | None; synchronous in-memory use case |
| Persistence | Explicitly excluded |
| Advantages | Makes layer crossing and use-case ownership explicit; preserves Core authority; leaves persistence replaceable and later |
| Risks | “Pipeline” may be misread as runtime orchestration; implementation could duplicate Core validation or broaden provenance semantics |
| Decision | **Approved with the narrow name/semantics “Knowledge Acquisition Evidence Intake operation”** |

### D. Evidence[] → EvidenceCollection

| Property | Assessment |
|---|---|
| Ownership | Would need a new Core contract |
| Responsibility | Would duplicate the collection role already represented by EvidenceStore |
| Cardinality | Likely `0..n → 1`, but unapproved |
| Causality | No improvement over Store |
| Mutability | Could be immutable |
| Side effect | None |
| Persistence | None |
| Advantages | Avoids the misleading word “Store” |
| Risks | Parallel authority, migration ambiguity and needless contract/API expansion; confusion with `EvidenceCollectionPlan` |
| Decision | **Rejected** |

### E. Core-owned Evidence Registration aggregate method only

| Property | Assessment |
|---|---|
| Ownership | Core |
| Responsibility | Validate identity uniqueness and build a new Store |
| Cardinality | Current Store plus batch to new Store |
| Causality | Generic Evidence causality only |
| Mutability | Copy-on-write |
| Side effect | None |
| Persistence | None |
| Advantages | Strong aggregate invariants modeled near the data |
| Risks | Does not own the acquisition use case or layer crossing; current repository has functions rather than aggregate methods; alone it leaves orchestration implicit |
| Decision | **Accepted only as an internal Core primitive that a future intake operation may use, not as the whole downstream boundary** |

## 6. Candidate Comparison

| Candidate | Existing contract reused | Correct authority | Explicit use-case owner | Avoids semantic leap | Outcome |
|---|---:|---:|---:|---:|---|
| A. Direct Store | Partial | Yes | No | Yes | Rejected alone |
| B. Observation | Yes | No | No | No | Rejected |
| C. Intake → Store | Yes | Yes | Yes | Yes | **Approved with notes** |
| D. Collection | No | Ambiguous | No | Yes | Rejected |
| E. Core registration only | Partial | Yes | No | Yes | Supporting primitive only |

## 7. Ownership Matrix

| Component/value | Owner | Boundary rule |
|---|---|---|
| Provider Result and payload schema | Infrastructure | Must not cross into Core/Application APIs |
| Structured Input Evidence Extractor | Infrastructure | Terminates at returned `Evidence[]` |
| Evidence / EvidenceStore | Core | Authoritative source-material values and aggregate/collection |
| Knowledge Acquisition Evidence Intake | Application | Orchestrates registration using Core validation/aggregate behavior |
| Evidence registration primitive/invariants | Core | Generic validity, unique identity and immutable Store construction |
| Evidence → Observation semantic transformation | Core semantics, Application orchestration | Separate future gate; no Provider knowledge |
| Persistence adapter/repository | Unassigned | Not authorized |
| Measurement, Observation, Result, Contribution, Ledger, Snapshot, Matrix | Core | Strictly downstream and unchanged |

## 8. Responsibility Matrix

| Responsibility | Intake | EvidenceStore/Core primitive | Later Observation boundary | Excluded everywhere in E-26 |
|---|---:|---:|---:|---:|
| Validate Evidence contract | Coordinate | Own | Consume valid refs | — |
| Reject duplicate Evidence IDs | Coordinate atomically | Own invariant | No | — |
| Preserve provenance and identity | Yes | Yes | Reference later | — |
| Validate generic provenance coherence | Yes | May expose helper | No | — |
| Validate Provider Result/Input contracts | No | No | No | Yes |
| Persist/load | No | No | No | Yes |
| Create Observation | No | No | Later | Yes |
| Set confidence/quality/reliability | No | No | Later explicit semantics | Yes |
| Decide absence/satisfaction | No | No | No | Yes |
| Update Ledger/Matrix/Coverage/Runtime | No | No | No | Yes |

## 9. Cardinality and Causality

For one intake invocation:

```text
0..1 current EvidenceStore + exactly one Evidence batch (0..n)
→ exactly one fresh valid EvidenceStore
```

One Evidence may later cause zero, one or many Observations, and one Observation must belong to exactly one Measurement. Those mappings are not approved by E-25 because the repository has no Evidence-to-Observation adapter or explicit cardinality contract.

Intake preserves, but does not reconstruct, E-24 causality. Evidence IDs and `extensions.acquisitionProvenance` carry capability, Invocation Input fingerprint, Provider Result fingerprint and provider record identity. The intake may require a batch to be internally coherent and may reject missing or conflicting acquisition provenance for this acquisition-specific path. It cannot import or validate Infrastructure Provider Result objects; exact upstream contextual validation remains the extractor's responsibility.

## 10. Persistence and Store Analysis

EvidenceStore is best classified as a **Core aggregate/collection boundary**, not persistence:

- it contains Evidence, sources, statistics and metadata;
- its builder and validator are pure synchronous functions;
- it has no repository port, serialization policy, database identity, load/save, transaction or I/O;
- the builder derives Evidence from input sources and returns a plain value;
- tests and health are in-memory.

It is not itself the Application intake boundary because it cannot coordinate the post-extractor use case. The approved intake produces a Store value; it does not save it. Any future persistence requires a separate Application port and Infrastructure adapter review.

## 11. Observation Boundary Analysis

Observation does not legitimately consume the extractor output directly. Its contract describes a signal discovered by an explicit Measurement and requires fields the extractor intentionally leaves undecided. In particular, Observation confidence is numeric while extracted Evidence confidence remains `null`; copying or defaulting that value would violate the frozen principle.

The eventual Evidence-to-Observation transition belongs to Core semantic logic: it must use registered Evidence references, a valid Measurement, an explicit method and explicit characteristic scope. Application may orchestrate that Core operation, but it must not own the interpretation rules. Observation should consume Evidence through the authoritative Store/registered collection, not by retaining the Infrastructure-returned array as a second source of truth.

`not_observed` remains an explicit Observation state. An empty extraction, absent Evidence, missing signal and negative evidence are not interchangeable.

## 12. Architectural Decision

**ADR-038 — Application intake registers extracted Evidence into the Core EvidenceStore before observation.**

Decision: approve a narrow Application-owned `Knowledge Acquisition Evidence Intake` operation as the first direct downstream consumer of E-24 `Evidence[]`. It coordinates Core validation and immutable, atomic registration into the existing Core-owned EvidenceStore aggregate/collection. No new intermediate domain contract is introduced. EvidenceStore remains non-persistent.

Answers to the ten required questions:

1. **Yes.** Extracted Evidence must first be registered in EvidenceStore before Observation processing.
2. **Through the registered Store/collection.** No direct extractor-array-to-Observation path is approved.
3. **EvidenceStore is a Core aggregate/collection boundary.** It is neither persistence nor the Application intake operation.
4. **Core owns Evidence → Observation semantics; Application may orchestrate it.** That transition is not part of E-26.
5. **No new domain value contract is needed.** A narrow Application operation and, if necessary, a Core registration primitive are sufficient.
6. **Core validates Evidence shape and unique identity; Application intake validates batch/store atomicity and acquisition-provenance coherence.** Extractor context validation remains Infrastructure-owned. Observation/Measurement later validate analytical causality.
7. **Exact identity deduplication occurs at intake/Store registration and rejects collisions.** Semantic signal redundancy is handled later during Measurement normalization, not by deleting Evidence.
8. **The next component is Application-owned.** Its data and aggregate destination remain Core-owned.
9. **Excluded:** persistence, I/O, Provider/Adapter invocation, Runtime mutation, Observation/Measurement/Contribution/Knowledge creation, Ledger/Snapshot/Matrix/Coverage updates, Requirement satisfaction, confidence/quality/scoring, semantic merge, silent duplicate collapse and in-place mutation.
10. **Next authorized task:** `0100E-26 — Knowledge Acquisition Evidence Intake Foundation`, limited to the effect-free Application intake and minimum Core immutable registration primitive needed to produce a valid existing EvidenceStore.

## 13. Rejected Alternatives

- **Direct EvidenceStore construction from E-24 output:** rejected because the existing builder has incompatible input semantics and no registration invariants.
- **Direct Observation:** rejected because it bypasses Evidence authority and invents analysis semantics.
- **New EvidenceCollection:** rejected because it duplicates EvidenceStore and introduces dual authority.
- **Measurement first:** rejected because Measurement scopes analysis but does not register Evidence or generate observations by itself.
- **Infrastructure intake/store update:** rejected because Infrastructure must terminate at `Evidence[]`.
- **Knowledge/Ledger/Matrix/Coverage/Requirement update:** rejected as a multi-layer bypass.
- **Persistence/repository first:** rejected because no persistence contract or need is established.

## 14. Guardrails

- Evidence and EvidenceStore remain Core-owned; intake is Application-owned.
- Infrastructure returns `Evidence[]` and stops.
- No modification of Evidence values; `confidence` remains `null`.
- No in-place mutation of arrays, stores, Evidence, metadata or extensions.
- Registration is atomic: any invalid item or identity collision rejects the operation.
- Exact duplicates are rejected, not silently coalesced; semantic redundancy is preserved for later analysis.
- Empty intake is valid and carries no absence/satisfaction meaning.
- No Observation, Measurement, MeasurementResult, Contribution, Knowledge, Ledger, Snapshot, Matrix, Coverage or satisfaction update.
- No persistence, network, event, queue, retry, runtime transition or concrete Provider integration.
- No Provider Result or Infrastructure schema import into Core or Application.
- Public contract changes remain unauthorized unless E-26 demonstrates they are indispensable and stops for review.

## 15. Self Review

| Check | Result |
|---|---|
| Repository-first evidence | PASS |
| Required candidates and ten questions | PASS |
| Ownership and dependency direction | PASS |
| Cardinality and causal limits explicit | PASS |
| EvidenceStore classification | PASS |
| Observation boundary protected | PASS |
| Frozen principles preserved | PASS |
| Implementation/code/API/test changes | NONE |
| Continuity Impact Assessment | BOUNDARY; authority documents aligned |

Self-review outcome: **CONFORMING WITH NOTES**. The note is that the repository's current EvidenceStore builder is not an ingestion API and its validator does not enforce duplicate IDs. E-26 must implement only the minimal effect-free registration behavior and must not reinterpret the existing builder as already satisfying the decision.

## 16. Residual Risks

- `EvidenceStore` naming can be mistaken for persistence; E-26 documentation and API naming must retain the aggregate/collection classification.
- The legacy Store contains `sources`, but E-24 Evidence carries source data by reference and no InputSource objects. E-26 must not fabricate sources; it must use a repository-compatible deterministic representation or stop if the existing contract cannot represent registration without semantic change.
- Acquisition provenance lives in flexible Evidence extensions rather than a frozen Core field. E-26 may validate only the established E-24 shape for this path and must not broaden the Evidence contract silently.
- Exact identity collision and semantic equivalence are different. Intake may reject IDs; it must not attempt semantic deduplication.
- The Evidence-to-Observation mapping, Measurement creation order and Observation Evidence reference shape remain unresolved and require a later architecture review.
- Persistent storage, concurrency and multi-writer atomicity are unmodeled and not implied by the in-memory operation.

## 17. Next Authorized Gate

`0100E-26 — Knowledge Acquisition Evidence Intake Foundation`

Type: **FOUNDATION**
Status: **PLANNED**
Ownership: **Application operation consuming Core values; minimum Core registration primitive only if required**

Authorized scope:

- consume a valid immutable `Evidence[]` from the semantic boundary without importing Provider Result contracts;
- accept an explicit valid current EvidenceStore or establish the minimal empty-store path;
- validate Evidence, acquisition-batch coherence and exact duplicate IDs;
- return one fresh valid EvidenceStore with deterministic statistics and preserved Evidence/provenance;
- add focused tests, health/public exposure only where required by existing layer conventions, and continuity updates.

Not authorized:

- Evidence/EvidenceStore contract changes without a new review;
- persistence or repository ports;
- Observation, Measurement, Result, Contribution, Ledger, Snapshot, Matrix, Coverage or Knowledge Update;
- Requirement satisfaction or Runtime mutation;
- scoring, confidence assignment, quality/reliability inference or semantic deduplication;
- concrete Provider, transport or external I/O.

# TASK 0100E-27 — Post-Evidence-Intake Downstream Architecture Review

Status: **COMPLETED**
Outcome: **APPROVED WITH NOTES**
Continuity impact: **BOUNDARY**

## 1. Executive Summary

The first legitimate direct consumer of a populated Core-owned `EvidenceStore` is a narrow, read-only **Application-owned Registered Evidence Selection operation**. It accepts one valid `EvidenceStore` plus an explicit exact-reference selection input and returns a fresh immutable `Evidence[]` containing unchanged registered members in canonical Evidence-ID order.

The approved minimum flow is:

```text
EvidenceStore                                [Core authority, in memory]
→ Registered Evidence Selection             [Application operation]
→ Evidence[]                                 [existing Core values, selected by exact refs]
→ future Observation construction gate      [not authorized]
```

Observation is not the direct Store consumer at this gate. The existing Observation contract is already a first interpretation: it is Measurement-scoped and requires characteristic, signal type, observed/not-observed status, direction/strength, numeric confidence, evidence quality, source reliability and analytical provenance. Registered Evidence does not determine those values. A direct transformer would therefore invent policy rather than translate structure.

No Observation Construction Foundation, Observation Collection/Store or `ObservationCandidate` contract is approved now. Task 0100E-28 may implement only exact, non-semantic selection of already registered Evidence. A later repository-first review must decide Measurement causality, interpretation method, Observation identity, confidence/quality/reliability assignment, grouping and `0..N` cardinality before any Observation is created.

## 2. Repository Evidence Reviewed

The review was performed at mandatory HEAD/base `61a92447fa0ede62a1e8f32f1ab644c383d8eac8` and inspected:

- Core `Evidence`, validator, `EvidenceStore`, validator, public exports, health and basic extractors;
- E-26 Application intake, local/context validation, public API, health and focused tests;
- Observation/Measurement contracts, builders, validators, normalization, tests and `MEASUREMENT_OBSERVATION_FOUNDATION.md`;
- `MeasurementResult`, `MeasurementDimensionMapping`, `DimensionContribution`, `KnowledgeLedger`, `KnowledgeSnapshot` and `PersonKnowledgeMatrix` builders/validators/tests/health;
- E-24, E-25 and E-26 reports and manifests;
- current continuity index/workflow, continuity, architecture, decisions, next phase, roadmap and acquisition boundary freeze;
- pertinent Core, Application and Infrastructure APIs and aggregate/overall health entry points.

Controlling repository facts:

1. Evidence is immutable authoritative extracted material. It has identity, content/source provenance and nullable confidence, but no Measurement, characteristic, direction, strength, quality or reliability semantics.
2. EvidenceStore is a Core aggregate/collection value with pure in-memory builders/validation. It has no load/save, repository, transaction, database or I/O behavior.
3. E-26 returns a new deeply frozen Store, preserves Evidence unchanged, rejects exact ID collisions and allows semantic equivalents with distinct IDs.
4. Existing `Measurement` scopes analysis through source refs, target IDs and a method, but its generic contract does not define how registered Evidence is selected or interpreted.
5. Existing `Observation` requires a Measurement ID, source ref, characteristic, signal semantics, numeric confidence/quality/reliability and analytical provenance; it forbids raw source payloads.
6. Observation identity currently defaults to time-based construction. No deterministic Evidence-to-Observation identity rule exists.
7. `normalizeMeasurementResult` groups Observation signals for analytical weighting. That grouping is not Evidence selection and must not delete or merge Evidence.
8. No Observation collection/store exists. `MeasurementResult.observationRefs` consumes an explicit array without requiring a new authoritative collection.
9. Basic Evidence extractors are structural and leave confidence neutral; they do not establish Observation semantics.
10. Downstream Measurement mapping, Contribution, Ledger, Snapshot and Matrix all assume valid earlier semantic objects and cannot repair missing Observation causality.

## 3. Current Architecture

```text
KnowledgeAcquisitionProviderResult                         [Infrastructure]
→ Structured Input Provider Result Evidence Extractor      [Infrastructure]
→ Evidence[]                                               [Core]
→ Knowledge Acquisition Evidence Intake                    [Application]
→ EvidenceStore                                            [Core, in memory]
→ unresolved registered-Evidence consumption boundary
→ Measurement + Observation                               [Core]
→ MeasurementResult → DimensionContribution
→ KnowledgeLedger → KnowledgeSnapshot → PersonKnowledgeMatrix
```

Infrastructure terminates at Evidence extraction. Application coordinates use cases over Core contracts. Core owns Evidence, Measurement and Observation semantics and must remain independent of Application and Infrastructure.

## 4. EvidenceStore Boundary

EvidenceStore is the authoritative in-memory collection of registered Evidence, not persistence. A component may read it without turning it into persistence when the read is a pure operation over an explicitly supplied Store value, performs no I/O, and returns caller-isolated Core values.

The first read boundary may validate Store shape and exact requested Evidence IDs, select without mutation, preserve all Evidence fields including `confidence`, and return canonical ordering. It may not infer relevance from content, delete unmatched Evidence, mark absence, merge semantic equivalents or update Store statistics.

An empty exact selection and an empty Store produce an empty array. They mean only “no registered Evidence matched these explicit references”; they do not mean a characteristic was absent, not observed, contradicted, satisfied or unsatisfied.

## 5. Observation Boundary

Observation is not a structural copy of Evidence. It is an atomic analyzed signal under an explicit Measurement. The current contract forces decisions about:

- characteristic and signal type;
- `observed` versus `not_observed`;
- direction and strength when observed;
- numeric confidence, evidence quality and source reliability;
- source/location/content references, independence grouping and fingerprint;
- observation time, extractor/method identity and Measurement causality.

Evidence alone cannot answer these questions. Even copying `Evidence.confidence` is impossible for the established acquisition path because it remains `null`, while Observation validation requires a number in `[0,1]`. Defaulting it to zero would be an assignment policy, not preservation.

Therefore an Evidence-to-Observation transformer is a future legitimate semantic component, but not the first authorized Store consumer and not implementable from current rules. The existing Observation builder/validator remain unchanged.

## 6. Downstream Candidates

| Candidate | Responsibility / ownership | Creator → consumer | Input → output | Cardinality / causality | Mutation / persistence | Interpretation / confidence | Advantages | Risks | Decision |
|---|---|---|---|---|---|---|---|---|---|
| A. `EvidenceStore → Observation Builder` | Core builder invoked directly | caller → Observation consumers | Store → Observation(s) | undefined; Measurement and Evidence links missing | none intended | would invent all signal fields and numeric confidence | shortest path | bypasses explicit selection and analytical method | **Rejected** |
| B. `Evidence[] → Observation Builder` | Core builder | arbitrary array holder → Observation consumers | Evidence batch → Observation(s) | undefined; bypasses Store authority | none intended | same semantic invention as A | simple signature | restores extractor array as competing authority | **Rejected** |
| C. `EvidenceStore → Evidence Selection [Application] → Observation [Core]` | Application selects; future Core interprets | use case → later semantic transformer | Store + exact refs → selected `Evidence[]`; Observation later | `1 Store + 0..N refs → 0..N Evidence`; exact ID causality | fresh output; no I/O | selection none; Observation deferred | establishes legitimate read boundary without leap | can broaden into semantic filtering if under-specified | **Approved only through selection; Observation remains a later gate** |
| D. `Evidence → ObservationCandidate → Observation` | would require new owner/contract | analyzer → Observation builder | Evidence → new candidate → Observation | still undefined | could be immutable; no persistence | candidate merely relocates unresolved interpretation/confidence | explicit staging | duplicates uncertainty and expands contracts | **Rejected** |
| E. `EvidenceStore → Observation Collection` | would require new Core collection | transformer → result consumers | Store → new collection | mapping undefined | dual in-memory authority; no persistence | interpretation unresolved | batch container | no repository need; MeasurementResult already accepts refs | **Rejected** |
| F. Direct existing Observation contracts | Core | caller → normalizer | manually supplied values → Observation | caller-defined | pure | valid only when caller already owns complete semantics | reuses contracts | no approved caller/method supplies them | **Rejected for next task** |
| G. Exact Registered Evidence Selection Foundation | Application operation over Core values | Application use case → future reviewed semantic boundary | Store + exact Evidence ID refs → unchanged `Evidence[]` | deterministic subset; every output ID must be registered and requested | copy/freeze; no Store mutation or persistence | none; confidence unchanged | minimum repository-supported consumer | does not itself advance to Observation | **Approved** |

## 7. Candidate Comparison

| Candidate | Reads Store authority | Explicit owner | Defined cardinality | Preserves Evidence | Avoids interpretation | New domain contract | Outcome |
|---|---:|---:|---:|---:|---:|---:|---|
| A | Yes | Partial | No | Unclear | No | No | Rejected |
| B | No | Partial | No | Unclear | No | No | Rejected |
| C through selection | Yes | Yes | Yes | Yes | Yes | No | Approved |
| D | Optional | Ambiguous | No | Unclear | No | Yes | Rejected |
| E | Yes | Ambiguous | No | Unclear | No | Yes | Rejected |
| F | Optional | Caller-dependent | No | Caller-dependent | No | No | Rejected now |
| G | Yes | Yes | Yes | Yes | Yes | No domain value | **Approved** |

## 8. Ownership Matrix

| Component/value | Owner | Rule |
|---|---|---|
| Evidence / EvidenceStore | Core | authoritative immutable source material and collection |
| Exact selection input | Application operation input | ephemeral IDs/refs only; not a persistent domain artifact |
| Registered Evidence Selection | Application | validates context and coordinates a read over Core values |
| Generic Evidence/Store validation | Core | contract shape and registered membership |
| Evidence-to-Observation interpretation | Core semantics | future gate; explicit Measurement and method required |
| Observation orchestration | Application | future gate only; may invoke Core semantics |
| Provider/payload/extractor | Infrastructure | cannot enter the new selection boundary |
| Persistence | Unassigned | not authorized |

## 9. Responsibility Matrix

| Responsibility | Selection boundary | Future Observation boundary | Forbidden in E-28 |
|---|---:|---:|---:|
| Validate supplied EvidenceStore | coordinate Core validator | consume valid Store/selection | — |
| Resolve exact registered Evidence IDs | yes | consume result | — |
| Preserve canonical ID order and immutable values | yes | yes | — |
| Semantic relevance filtering/content search | no | future explicit policy only | yes |
| Group/merge/delete Evidence | no | no destructive Evidence change | yes |
| Assign Measurement/characteristic/signal semantics | no | future | yes |
| Assign confidence/quality/reliability | no | future explicit method | yes |
| Create Observation/Measurement/Result | no | future | yes |
| Persist, update Knowledge or mutate Runtime | no | no automatic behavior | yes |

## 10. Cardinality

Approved E-28 cardinality:

```text
exactly 1 valid EvidenceStore + exactly 1 explicit selection of 0..N unique Evidence IDs
→ exactly 1 fresh immutable Evidence[] containing 0..N registered Evidence
```

Selection neither establishes nor constrains future semantic cardinality. Repository-first answers are:

- one Evidence does **not** necessarily produce exactly one Observation;
- one Evidence may later produce `0..N` Observations under different characteristics or measurements;
- multiple Evidence may later contribute to one analytical conclusion, but the current atomic Observation contract has one `sourceRef`; aggregation belongs to MeasurementResult, not an assumed many-Evidence Observation;
- these possibilities are not implementation authorization.

## 11. Causality and Provenance

The selector proves only membership causality: every returned object has an ID explicitly requested by the caller and present in the supplied valid Store. It preserves the Evidence ID, source fields, extraction data and `extensions.acquisitionProvenance` byte-for-byte in value semantics.

Core validation owns Evidence and Store shape. Application contextual validation owns uniqueness of requested refs and exact Store membership. The future Observation boundary must separately validate Measurement membership, method/version, source/content Evidence refs and any characteristic-specific rule. Infrastructure provenance may be preserved through Evidence but Provider Result contracts must not cross into Application or Core.

## 12. Identity

Selection creates no autonomous identity. Its ephemeral input is not an aggregate, request record or persistence key. Output Evidence retain their existing IDs and ordering.

No Observation identity rule is approved. The current time-based builder fallback is insufficient as a causal Evidence-to-Observation identity policy. A future gate must decide whether identity derives from Measurement, Evidence reference, characteristic, signal type, location/fingerprint and method version before automated construction.

## 13. Confidence

Evidence confidence is preserved exactly, including `null`. Selection assigns no confidence and must not coerce `null` to zero.

Observation confidence cannot remain `null` under the current validator. It also cannot be legitimately copied or defaulted from Evidence. Consequently no first Observation may be constructed until an explicit Core-owned analytical method defines numeric Observation confidence together with evidence quality and source reliability. Final confidence and scoring remain out of scope.

## 14. Interpretation Boundary

Selection is strictly structural: exact ID membership, validation, copying/freezing and canonical ordering. It cannot inspect Evidence content to infer relevance, choose characteristics, detect signals, classify direction, calculate strength, establish absence, group semantic equivalents or rank evidence.

Observation is a first interpretation, not a structural translation. `not_observed` may only arise from an explicit Measurement scope and method that evaluated the relevant selected source set. Zero selected Evidence, a missing ID, an empty Store or an empty extractor batch must never be converted automatically into `not_observed` or an absent/negative signal.

## 15. Architectural Decision

**ADR-039 — Exact registered-Evidence selection precedes any Observation construction.**

Decision: **APPROVED WITH NOTES**.

- First downstream consumer: Application-owned Registered Evidence Selection operation.
- Input: one explicit valid Core EvidenceStore and an ephemeral selection containing `0..N` unique exact Evidence IDs.
- Output: one fresh deeply immutable canonical `Evidence[]`; no wrapper/outcome/domain contract.
- Cardinality: `1 Store + 0..N refs → 0..N Evidence`.
- Causality: exact requested-ID-to-registered-member correspondence; upstream Evidence provenance unchanged.
- Identity: no selector/result identity; Evidence IDs unchanged; Observation identity deferred.
- Confidence: unchanged, including `null`; no Observation confidence assignment.
- Interpretation: none. Exact membership selection only.
- Intermediate contract: no new domain contract. A minimal ephemeral Application input shape is sufficient.
- Observation foundation: existing contracts are retained but automated Observation Construction is not yet authorized.
- Persistence/mutation: none.

Explicit answers to the mandatory questions:

1. Observation should eventually consume selected registered Evidence, not EvidenceStore wholesale and not the extractor array directly.
2. E-28 processes an exact selective query against an explicitly supplied whole Store; it returns a batch.
3. No; `1 Evidence → exactly 1 Observation` is unsupported.
4. Multiple Evidence may inform later analysis, but a many-Evidence atomic Observation is not established; MeasurementResult is the existing aggregation boundary.
5. Potentially, under different explicit analytical scopes, but no cardinality is approved for implementation.
6. Observation is a first interpretation.
7. A future Core-owned explicit analytical method must assign Observation confidence; neither extractor, intake nor selector may do so.
8. Evidence confidence remains `null`; Observation confidence cannot be `null` under the current contract, so construction is deferred.
9. Core validates Evidence/Store and future Observation shape; Application validates selection membership; a future semantic transformer validates Measurement/method causality and provenance.
10. No Observation Collection/Store is needed now.
11. Selection is Application-owned; future transformation semantics are Core-owned and may be Application-orchestrated.
12. A pure Application operation can read an explicitly supplied Store without persistence.
13. Exact Evidence selection occurs in that Application operation; semantic selection remains future and method-scoped.
14. Empty/no-match results remain empty Evidence arrays only and never become absence or `not_observed` automatically.
15. The next authorized task is `0100E-28 — Registered Evidence Selection Foundation`.

## 16. Rejected Alternatives

- Direct Store-to-Observation and batch-to-Observation: missing analytical semantics and causal identity.
- Observation Candidate: merely moves unresolved interpretation into a new contract.
- Observation Collection/Store: duplicates authority without a demonstrated consumer or persistence need.
- Direct ad hoc use of Observation builder: technically possible but architecturally unauthorized because no approved method supplies mandatory semantics.
- Measurement creation as the next task: Measurement is required later but its construction policy and connection to acquisition requirements are not established by populated Store alone.
- Semantic filtering/grouping: content-dependent interpretation, not minimum selection.
- Persistence/repository: no repository evidence of a required external store.

## 17. Guardrails

- EvidenceStore remains a Core in-memory aggregate/collection and the sole registered-Evidence authority.
- Selection is effect-free, exact-reference based and Application-owned.
- Evidence are returned unchanged; no deletion, merge, rewrite or semantic deduplication.
- Inputs are never mutated; outputs are fresh and deeply immutable.
- Empty selection/no match preserves “not observed ≠ absent”.
- Core imports neither Application nor Infrastructure; Application depends only on Core contracts.
- Infrastructure has no role in selection or Observation semantics.
- No persistence, filesystem, network, Provider, Adapter, LLM, runtime mutation or report generation.
- No Observation, Measurement, MeasurementResult, Contribution, Knowledge, Ledger, Snapshot, Matrix, Coverage or Requirement-satisfaction creation/update.
- No scoring or confidence/quality/reliability assignment.

## 18. Self Review

| Check | Result |
|---|---|
| Required repository areas inspected | PASS |
| Candidates A–G evaluated | PASS |
| Fifteen mandatory questions answered | PASS |
| One clear repository-first decision | PASS |
| Ownership/dependency direction preserved | PASS |
| Cardinality, causality, identity and confidence explicit | PASS |
| “not observed ≠ absent” preserved | PASS |
| New intermediate domain contract avoided | PASS |
| Product contracts/builders/validators/API/health/tests changed | NONE |
| Observation/Measurement/Knowledge implemented | NONE |

Self-review outcome: **CONFORMING WITH NOTES**. The note is deliberate: selection is only a minimum safe read boundary. It must not be presented as sufficient input for Observation construction.

## 19. Residual Risks

- Exact-ID selection may be too narrow for future Measurement methods; any source-, characteristic- or content-based query needs a separate semantic review.
- The Store also contains `sources`, while acquired Evidence may preserve only source references. E-28 must not fabricate or resolve source objects.
- Existing Observation identity defaults and numeric confidence defaults are convenient builders, not approved Evidence-to-Observation policy.
- Existing Measurement source refs are generic and do not by themselves prove selected Evidence membership.
- Concurrent/persistent Store access remains unmodeled and unapproved.

## 20. Next Authorized Gate

`0100E-28 — Registered Evidence Selection Foundation`

Type: **FOUNDATION**
Status: **PLANNED**
Ownership: **Application operation consuming Core EvidenceStore and returning existing Core Evidence values**

Authorized scope:

- accept one explicit valid EvidenceStore and an ephemeral exact-ID selection;
- validate selection shape, unique requested IDs and exact Store membership;
- support `0..N` IDs and an empty result without absence semantics;
- return fresh deeply immutable unchanged Evidence in canonical ID order;
- add only minimum Application validation/public API/health/tests required by existing conventions;
- preserve Core contracts and dependency direction.

Not authorized:

- Observation/Measurement construction or contract changes;
- semantic filtering, grouping, ranking, deduplication or Evidence deletion;
- confidence, quality, reliability, direction, strength or absence assignment;
- persistence, repository ports, I/O, Provider/Adapter/LLM integration;
- MeasurementResult, Contribution, Knowledge, Ledger, Snapshot, Matrix, Coverage, Requirement satisfaction or Runtime mutation.

# IMAGO Core Continuity

Status: **CURRENT**

Verified through: **CONT-AR03 on repository base `5a08d5d`**

Current product objective: **PREPARE AND EXECUTE THE FIRST SUPERVISED HUMAN TEST**

Last realignment: 2026-09-02 (`CONT-AR03`)

## Purpose

This document is the current verified continuity view. It is rewritten when a milestone changes; it is not an append-only task diary. Detailed history belongs to Git, task reports and the preserved reviews under `reviews/`.

The repository in the assigned branch and worktree is the factual source of truth. New tasks follow `IMAGO_CODEX_WORKFLOW.md` and the observed branch context in `GIT_BRANCHING_MODEL.md`.

## Current state

Completed task sequence:

```text
0100A-1B, 0100A-2
0100B-1 … 0100B-10
0100C-1 … 0100C-3
0100D-1 … 0100D-10
0100E-1 … 0100E-43
```

Tasks D-9 and odd E tasks through E-43 are architecture reviews. D-10 is consolidation and freeze. Even E tasks through E-42 are implemented Foundations.

## Knowledge Foundation

Core-owned and verified:

```text
Input / Evidence
→ Observation
→ MeasurementResult
→ MeasurementDimensionMapping
→ DimensionContribution
→ KnowledgeLedger
→ KnowledgeSnapshot
→ DimensionKnowledgeState (elementary)
→ DerivedKnowledgeRule / CapabilityRecipe
→ CapabilityExecutionResult
→ DerivedDimensionKnowledgeState
→ PersonKnowledgeMatrix
```

Evidence remains authoritative; reconstructed knowledge is deterministic. Elementary and derived states remain separate. No person score, implicit layer fusion or LLM inference is introduced by these Foundations.

## Knowledge Acquisition — Phase D

Core-owned, declarative and frozen:

```text
PersonKnowledgeMatrix
→ KnowledgeCoverage (+ Query)
→ KnowledgeOpportunity (+ Query)
→ KnowledgeAcquisitionNeed (+ Query)
→ KnowledgeAcquisitionStrategy (+ Query)
→ KnowledgeAcquisitionRequirement (+ Query)
```

From Opportunity onward the frozen cardinality is one-to-one. Direct causal references, mappings, Requirement semantics and public exports are protected by `KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md` and dedicated regression/health checks. Requirement contains no satisfaction, planning or execution state.

## Design, Match, Decision and Composition — Phase E

Implemented boundary:

```text
KnowledgeAcquisitionRequirement
→ KnowledgeAcquisitionDesign                       [Core]
→ KnowledgeAcquisitionCapabilityMatch              [Core]
→ KnowledgeAcquisitionSolutionDecision             [Application]
→ KnowledgeAcquisitionCapabilityCompositionDesign  [Application; composed only]
```

- Design is mechanism-neutral and uses explicitly resolved causal context.
- Match evaluates one immutable candidate snapshot per invocation; discovery and candidate resolution remain Application responsibilities.
- Solution Decision supports `single`, `composed`, `none` and `deferred`.
- Composition Design exists exactly once only for a valid `composed` Decision.
- The local validator proves self-contained invariants; the contextual validator separately proves correspondence with the supplied Decision and Design.
- No component performs implicit discovery, reselection, configuration, planning or execution.

## Runtime and Reporting separation

The repository contains verified historical Runtime, Beta Session and Reporting pipelines, including Professional Perception and CV Review. They are not yet integrated with the Phase D/E Knowledge Acquisition artifacts.

No current documentation may represent `KnowledgeAcquisitionSolutionDecision` or Composition Design as already driving runtime orchestration, providers, adapters, reports, Requirement satisfaction or Knowledge Update.

## Capability Configuration — Phase E

Task 0100E-10 implements `KnowledgeAcquisitionCapabilityConfiguration`: one unified Application-owned declarative artifact for `single` and `composed`. The composed path requires its Composition Design as a direct causal source; `single` is not normalized as a one-capability composition. `none` and `deferred` are rejected and produce no Configuration.

`KnowledgeAcquisitionCapabilityConfiguration` is **IMPLEMENTED** as an immutable pre-planning Foundation with deterministic identity, canonical items, local validation and separate contextual validation.

Configuration contains only explicitly supplied non-secret declarative values. It does not resolve providers, order invocations, plan or execute.

Task 0100E-12 implements `KnowledgeAcquisitionPlan` as the first downstream consumer. The immutable Application-owned Plan is declarative, post-Configuration and pre-Runtime. It preserves exact capability/configuration scope and composed logical dependencies without executable order, state, scheduling, runtime or results. It is **IMPLEMENTED**.

Task 0100E-13 approves and Task 0100E-14 implements `KnowledgeAcquisitionRuntimeSession` as the first operational consumer of the Plan. It is Application-owned, Plan-scoped and stateful, with stable Session identity, closed lifecycle, exact item-state projections and explicit timestamps, but remains pre-Execution. The Plan is never mutated.

Task 0100E-15 approves and Task 0100E-16 implements Application-owned `KnowledgeAcquisitionExecution` as the first direct Session consumer and one semantic attempt for one exact active Session item. Its closed pre-invocation lifecycle is `created`, `selected`, `ready_for_invocation`; it is deeply immutable, identity-safe and effect-neutral. Task 0100E-17 approves and Task 0100E-18 implements `KnowledgeAcquisitionInvocationBoundary` as an Application-owned structural outbound port plus an ephemeral, immutable and integrity-fingerprinted input. Task 0100E-19 approves and Task 0100E-20 implements the first capability-specific Infrastructure Invocation Adapter for `capability:structured-input-v1`. Task 0100E-21 approves and Task 0100E-22 implements `KnowledgeAcquisitionProviderResult`. Task 0100E-23 approves and Task 0100E-24 implements the capability-specific Provider Result Evidence Extractor as the crossing into Core `Evidence[]`. Task 0100E-25 approves and E-26 implements Evidence Intake; E-27 approves and E-28 implements exact registered-Evidence selection; E-29 approves and E-30 implements Observation Construction; E-31 approves and E-32 implements MeasurementResult normalization. Task E-33 approves and E-34 implements narrow Mapping Applicability. E-35 approves and E-36 hardens the existing Core Contribution mapper after `applicable`: identity now derives from canonical semantic output and complete Mapping policy, references and policy fingerprint are canonical, formula operands/strategies are explicit, and returned Contributions are deeply immutable. Contribution remains distinct from Knowledge; Knowledge Update, Matrix/Coverage update, satisfaction, persistence and Runtime mutation remain unauthorized. See `NEXT_PHASE.md`.

Task E-37 approves Application-orchestrated atomic registration of one hardened mapper batch through the existing Core `appendDimensionContributions` operation. The existing Ledger is the direct downstream aggregate; registration preserves Contributions unchanged, rejects exact collisions and performs no aggregation. Snapshot, states, derived knowledge, Matrix and Coverage remain unauthorized.

Task E-38 hardens that existing intake in place. Ledger identity now commits to complete canonical Contribution content rather than IDs alone; the builder and validator reject hidden, cyclic, exotic or non-canonical content and non-canonical Contribution references; append validates the complete Ledger and batch before copy-on-write construction; and every result is deeply frozen. Empty intake returns a fresh frozen equivalent Ledger with stable identity. No Contribution value, contract, public API, aggregation or downstream artifact changes.

Task E-39 approves the existing Core `buildKnowledgeSnapshot` boundary as the first direct consumer of one complete updated Ledger. Snapshot is a reconstructable immutable materialized view and performs elementary per-Dimension aggregation internally; no Ledger selection/query or intermediate contract is introduced. Empty Ledger produces one empty Snapshot and unrepresented Dimensions produce no state. E-40 is the sole planned hardening gate. Derived Knowledge, Matrix, Coverage and satisfaction remain unauthorized.

Task E-40 hardens the existing Snapshot boundary in place: identity commits to Ledger identity, aggregation strategy and complete semantic state content without timestamp drift; construction and elementary aggregation return deeply frozen canonical results; validation rejects non-canonical content. Contracts and public exports are unchanged.


## Private Beta Milestone 1 implementation status

Task `M1-01 — Beta User Journey Completion Gate` is implemented. `runFringeInterviewMVPSession` now derives truthful completion metadata and returns an immutable `betaUserJourney` assessment with stage-level evidence and explicit blockers. The gate is Application-owned and consumes only the existing Beta Session, Interview Runtime and Final Report outputs; no Core contract or deferred Core hardening was introduced.

Verification: dedicated journey assessment, Beta Session Core, Beta Session hardening and Beta Runtime Session Integration tests pass. The aggregate Core and global health commands are not reproducible from this handover archive because the archive has no `package.json`/Git metadata and mixes ESM and CommonJS loading assumptions; the aggregate Core run also reproduces the pre-existing golden evidence-ID mismatch recorded in the Beta Readiness Matrix.

Task `M1-02 — Private Beta User Journey Verification` is implemented. The Application-owned `verifyPrivateBetaUserJourney` wrapper invokes the existing session runner and returns a small immutable pass summary only when the M1-01 journey gate, runtime completion, final report availability and Beta Session closure are mutually consistent. It rejects incomplete or malformed session outputs with explicit verification errors. No Core contract or deferred E-44 work was changed.

Verification: the dedicated verification suite, M1-01 journey assessment, Beta Runtime Session Integration, Beta Session Core and Beta Session hardening tests pass. A real parser-backed offline end-to-end execution remains non-reproducible from this handover archive because the referenced `config/parser_*.json`, sample fixtures, `package.json` and Git metadata are absent.

## Private Beta Milestone 1 status — M1-03

Task M1-03 adds the minimum Application-level error handling boundary consumed by the Private Beta journey. `runPrivateBetaUserJourney` delegates to the M1-02 verifier and always returns a deterministic frozen outcome: completed on success, or a tester-safe failure classified as input, session, service or unexpected. Failure output contains only a stable code, explicit Italian message and safe fallback action; original technical messages and stack details are not propagated. Retry, telemetry, advanced logging, Core hardening and Milestone 2/3 work remain out of scope.

Dedicated M1-03 tests and the M1-01/M1-02 and Beta Session regression suites pass. The handover archive still does not include `package.json`, Git metadata or parser configuration/sample fixtures, so repository-wide npm/Git and real parser-backed offline verification cannot be reproduced from this archive alone.


## Private Beta Milestone 1 status — M1-04

Task M1-04 adds the minimum Application-level onboarding boundary for a new beta tester. `startPrivateBetaOnboarding`, `advancePrivateBetaOnboarding` and `resumePrivateBetaOnboarding` expose a deterministic immutable three-step path: Professional Identity state, working mode and immediate user goal. Every step presents at most three choices, help remains optional metadata, and resume uses a versioned state token. Selecting Tutor mode grants no access and creates no consent or authorization state. No UI framework, persistence, privacy flow, Professional Identity evolution, Core hardening or Milestone 2/3 capability was introduced.

Dedicated M1-04 tests and the M1-01/M1-02/M1-03 plus Beta Session regression suites pass. Repository-wide npm/Git verification remains non-reproducible because the handover archive has no `package.json` or Git metadata.


## Private Beta Milestone 1 status — M1-05

Task M1-05 adds the minimum Application-level privacy and consent boundary between completed onboarding and any Private Beta data use. `createPrivateBetaConsent`, `decidePrivateBetaConsent`, `revokePrivateBetaConsent` and `assertPrivateBetaDataUseAllowed` expose an immutable versioned state with deterministic timestamps, explicit accept/refuse decisions, revocation and safe blocking for pending, refused or revoked consent. The state records person ownership and the Private Beta purpose, classifies its notice as provisional and does not claim complete legal or GDPR compliance. Tutor mode never grants access automatically: `tutorAccessGranted` remains false and Tutor authorization is not implemented.

`runPrivateBetaUserJourney` now enforces this consent gate before invoking the journey verifier and returns tester-safe privacy errors without processing the supplied session input. Dedicated M1-05 tests and M1-01/M1-02/M1-03/M1-04 plus Beta Session and Builder readiness regressions pass. Repository-wide npm/Git verification remains non-reproducible because the handover archive has no `package.json` or Git metadata.

## Current authoritative documents

- `README.md` — authority index and reading order;
- `IMAGO_CODEX_WORKFLOW.md` — current operational protocol;
- `CONTINUITY.md` — current verified state;
- `CORE_ARCHITECTURE.md` — current architecture map;
- `DECISIONS.md` — approved architectural decisions;
- `NEXT_PHASE.md` — next approved gate;
- `../15-architecture_specifications/CORE_ROADMAP.md` — current Core roadmap;
- `../15-architecture_specifications/KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md` — normative frozen boundary;
- `GIT_BRANCHING_MODEL.md` — observed Git topology, descriptive rather than prescriptive.

## Historical documents

- `GIT_MILESTONE_GUIDE.md` — historical 0100B-specific procedure;
- `reviews/*_2026-07-30.md` — preserved ARCH-RECOVERY-001 review evidence;
- root, `notes/`, product/Beta and Builder continuity or handover files — historical or scope-specific unless the current index says otherwise.

Earlier continuity text referenced governance files not present in this branch. GOV-REALIGN-001 does not recreate them by inference. Their absence does not transfer authority to similarly named historical files.

## Frozen boundaries and risks

- Changes to D mappings, cardinality, direct causality, public exports or Requirement semantics require an explicit architecture task.
- Capability Configuration, declarative Plan, Runtime Session, Execution and the Invocation port contract are implemented. E-19 approves the capability-specific Adapter direction only; concrete Adapter/Provider invocation, Satisfaction and Knowledge Update remain unimplemented downstream layers pending their explicit gates.
- Runtime and Reporting legacy integration requires an explicit boundary and adapters.
- The default GitHub branch must not be assumed to be the operational Core base.
- Every task must pass the Continuity Impact Assessment in `IMAGO_CODEX_WORKFLOW.md`.

## Verification baseline

```powershell
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

Expected:

```text
IMAGO Core all tests PASSED
All health checks passed
```

Task E-41 approves the existing Core `executeCapabilityRecipe(snapshot, recipe, options)` boundary as the first direct Snapshot consumer. Rule evaluation is internal to that execution boundary; Derived Dimension State, Matrix and Coverage remain later consumers. E-42 may harden only this existing execution/evaluation path without changing contracts or public APIs.

Task E-42 completes that hardening in place. CapabilityExecutionResult identity commits to complete timestamp-independent semantic content and exact causal lineage; execution and derived results are deeply immutable; local and Snapshot/Recipe contextual validation are canonical. API, contracts and cardinality remain unchanged. No downstream consumer is authorized.


Task E-43 approves the existing Core `buildDerivedDimensionKnowledgeStates(executionResults, mappings, options)` boundary as the first direct consumer of complete `CapabilityExecutionResult[]` containers. Explicit mappings produce `0..N DerivedDimensionKnowledgeState` values; zero eligible results produce an empty collection and do not imply absence. No intermediate contract is required.

Within one Snapshot/Capability/Recipe/version context, multiple mapped positive results may aggregate N:1 into one Derived Dimension state. Estimate uses the established confidence-weighted mapping mean and state confidence uses the minimum source confidence. Cross-execution aggregation is not approved unless every execution identity is preserved exactly; the current single-execution reference behavior requires E-44 hardening.

`0100E-44 — Derived Dimension Knowledge State Construction Hardening Foundation` remains **deferred** unless explicitly consumed by the active product path. It is not the current implementation priority.

## Private Beta Milestone 1 status — M1-06

Task M1-06 adds the minimum Application-level feedback boundary at the end of a completed Private Beta journey. `createPrivateBetaFeedback`, `submitPrivateBetaFeedback` and `skipPrivateBetaFeedback` expose an immutable, versioned state with `not_started`, `submitted` and `skipped` statuses, deterministic timestamps, a session reference, three compact groups of structured answers and one optional free-text comment limited to 500 characters. The feedback captures clarity, usefulness, report credibility, most valuable part, difficulty, reuse and recommendation intent without technical details, new personal data, analytics, telemetry or persistence claims.

`runPrivateBetaUserJourney` now prepares a `not_started` feedback state only after successful completion when a session identifier is available. Missing or skipped feedback never invalidates completion. The feedback state has no Professional Identity field and does not mutate Representation data. Dedicated M1-06 tests and M1-01 through M1-05 plus Beta Runtime Session, Beta Session Core, hardening and Builder readiness regressions pass. Repository-wide npm/Git verification remains non-reproducible because the handover archive has no `package.json` or Git metadata.

## Private Beta Milestone 1 status — M1-07

Task M1-07 adds the minimum Application-level operational logging boundary for the Private Beta. Immutable, versioned events cover `session_started`, `session_completed`, `application_error` and `session_interrupted`, with only `eventId`, technical `sessionId`, timestamp, boundary, outcome and an optional safe M1-03 error code. The sink is injected and failure-safe; logging failure never blocks or changes the Beta journey and no Professional Identity data is accepted by the event model.

The operational runbook documents the expected event sequence, manual distinction between application error, incomplete session and service unavailability, forbidden data, manual checks and escalation conditions. No production persistence, retention, analytics, dashboard, tracing, retry or alerting is claimed. Dedicated M1-07 tests and M1-01 through M1-06 plus Beta Runtime Session, Beta Session Core, hardening and Builder readiness regressions pass.

---

## Current Product Objective

Status: **FIRST HUMAN TEST READY WITH SUPERVISED LIMITATIONS**

The Private Beta foundations and the canonical Beta integration path are present. Product Authority remains under `docs/20-product/`.

The current objective is:

**PREPARE AND EXECUTE THE FIRST SUPERVISED HUMAN TEST**

This objective takes priority over further AR-03 semantic hardening or deferred Core hardening. `0100E-44` and other deferred Core work remain deferred unless the First Human Test path explicitly consumes them.

## Private Beta integration status — BI-01

Task `BI-01 — Beta Journey Integration` integrates the existing Milestone 1 foundations into one Application-owned canonical path. A technical Beta Session is created before onboarding without personal input references; M1-04 onboarding and M1-05 consent are completed before the integration reads or forwards personal materials. The same session is then started in the existing Interview Runtime, completion is assessed and verified through M1-01/M1-02, M1-03 provides tester-safe execution failure handling, the existing Professional Perception reporting layer is materialized for the completed interview, M1-06 feedback remains optional, and M1-07 operational logging remains minimized and failure-safe.

BI-01 does not invent Professional Identity persistence: no existing Application boundary provides a dated persistent Professional Identity snapshot suitable for the canonical Beta journey, so the integrated result exposes `PROFESSIONAL_IDENTITY_SNAPSHOT_CAPABILITY_UNAVAILABLE`. Voice is likewise not implemented because no reusable voice subsystem is present in the handover baseline; text remains supported. Real parser/provider-backed end-to-end regression remains dependent on fixtures/configuration not contained in this handover archive.

## AR-03 closure — Decision Accountability live readiness

Status: **CLOSED**

AR-03G final verdict:

**B — AR-03 CLOSED; FIRST HUMAN TEST MAY PROCEED WITH EXPLICIT SUPERVISED LIMITATIONS.**

**FIRST HUMAN TEST GATE: OPEN WITH EXPLICIT TEST LIMITATIONS.**

There is no subsequent AR-03 technical task. Residual `contextual-none` and `shared` live failures are classified as **MODEL EXECUTION VARIABILITY**, not as a remaining deterministic contract defect. The canonical authority and validator boundaries remain unchanged.

Residual failures fail closed: incomplete `SUPPORTED` candidates are rejected; `UNSUPPORTED` does not produce a positive Observation; rejected or incomplete candidates are not repaired, retried, majority-voted, passed through validator relaxation, or converted into Knowledge. The known residual variability can therefore cause missing information acquisition, but current evidence does not demonstrate silent creation of canonically incorrect Knowledge.

The AR-03A `18/18` result remains a strict semantic-stability benchmark, not the gate for the exploratory First Human Test. No fallback, retry, majority voting, validator relaxation or Knowledge repair is authorized as a consequence of AR-03 closure.

### First Human Test operating constraints

The First Human Test must:

- be supervised;
- preserve `Evidence → semantic executor outcome → Observation` provenance;
- record provider/model identity and semantic executor outcome;
- present rejected / `UNSUPPORTED` outcomes as **not enough evidence / not established**, never as weakness;
- avoid Measurement/Knowledge conclusions when canonical projection is unavailable;
- collect participant/observer disagreement with IMAGO;
- treat run-to-run model variability as calibration evidence;
- not be represented as production reliability validation.

Detailed AR-03A→AR-03G history remains in Git, task reports and manifests; this document records only the consolidated current state.

## FHT runtime question coordination authority — PD-049

PD-049 closes the Product/Architecture authority gap identified by FHT-AR08 at `updated current-session Knowledge / Acquisition state → Core question necessity / scheduling decision`.

For subsequent bounded implementation work, preserve these separate concepts:

```text
question identity
≠ question objective
≠ acquisition purpose
≠ semantic dimension
≠ Knowledge state
≠ question necessity
```

A Core question subject to necessity evaluation requires explicit pre-Runtime objective linkage. Satisfaction is established only by the authorized current state associated with that objective, never by textual similarity, keywords, target/JD similarity, generic answer quality or unrelated Knowledge. If every canonical objective is satisfied, bounded suppression is authorized; if any objective remains necessary, preserve the question; ambiguous linkage or satisfaction fails closed by preserving it. Opening and closing remain outside this suppression authority. Replace/transform is not generically authorized.

The next authorized implementation review is repository-first and must identify the smallest existing FHT Core/adaptive vertical slice for:

```text
current Knowledge / acquisition state
→ Core question objective satisfaction
→ Core question necessity
→ suppress-or-preserve decision
```

It must use explicit canonical associations and must not introduce new semantic dimensions, redefine KnowledgeCoverage, infer semantic equivalence from wording, or broaden target/model authority.

## FHT decision-tradeoff question-objective authority — PD-050

PD-050 supplies the bounded canonical linkage required after FHT-RN01 stopped on missing Core-question objective authority.

For the First Human Test only:

```text
decision_tradeoffs
→ decision_tradeoff_accountability

decision_tradeoff_probe
→ decision_tradeoff_accountability

decision_tradeoff_accountability
→ SATISFIED only by current-session successful canonical decision_accountability Knowledge
  with causal acquisition lineage from decision_tradeoff_probe or decision_tradeoffs
```

`decision_tradeoffs` has exactly one canonical Runtime question objective in this bounded scope: `decision_tradeoff_accountability`. Existing question-bank intent/signals/category/narrative metadata do not add objectives. DA Knowledge from `opening_career_walkthrough` does not satisfy this objective.

Under PD-049, before presenting Core `decision_tradeoffs`: satisfied authorized lineage permits `SUPPRESS`; unsatisfied state requires `PRESERVE`; missing/ambiguous linkage, lineage or state fails closed to `PRESERVE`. No replacement is authorized. The rule is current-session acquisition necessity only and must not be generalized to other Core questions or DA-like questions.

The next authorized bounded implementation is:

```text
current-session semantic execution / Knowledge lineage
→ decision_tradeoff_accountability satisfaction
→ pre-presentation necessity evaluation
→ suppress-or-preserve decision_tradeoffs
```

## PD-062 — Candidate Application Document Composition and Completeness Authority

Status: **CANONICAL AUTHORITY COMPLETE**

PD-061I technical implementation, including the Second Corrective, remains **VERIFIED**. The controlled Human Candidate Experience remains **NOT ACCEPTED** pending downstream implementation of the Candidate-grade composition/completeness boundary identified by the human test. This is not a reopening of PD-060 or PD-061 and does not require a PD-061I Third Corrective.

Human-verified PASS areas are preserved and must not be reworked without a demonstrated regression: visible purpose actions; Career Preference purpose gating; Application/Professional Identity separation; UI/source/artifact language separation; `unknown != absent`; semantic invariance across Essential/Professional/Compact templates; PDF Unicode, wrapping and materialisation.

PD-062 closes the authority required for the next bounded implementation. Candidate documents must be composed from structured professional-history entries rather than an undifferentiated statement list; Document Completeness State is an Application-level non-scoring state separate from target-relative information needs; completeness acquisition is optional and authority-classed; Candidate-controlled contact data remains separate from professional Knowledge; document voice transformation is permitted only with semantic invariance; Candidate-facing Opportunity Understanding is a bounded source-grounded projection rather than raw JD replay.

The next implementation may address the human-test gaps for professional-history composition, completeness needs/acquisition, Professional Summary, Candidate document voice, Cover Letter composition, Candidate-facing Opportunity Understanding/gap grouping and ordinary-language wording. HTML preview wrapping and duplicate source-label disambiguation are downstream UX defects already covered by existing authority.

No-JD Role Knowledge, Portable Professional Identity and full Account/Data/Privacy architecture remain explicitly deferred and outside PD-062.

## PD-063 — Candidate Artifact Language Transformation Authority

Status: **CANONICAL / CLOSED**

PD-062 remains **CLOSED / CANONICAL**.

PD-062I First Corrective remains **IMPLEMENTATION VERIFIED**.

PD-062I Human Candidate Experience remains **NOT YET ACCEPTED**.

Human-verified structural PASS items remain preserved: Professional History identity; `source != experience`; Document Completeness versus target-relative gap separation; `unknown != absent`; Candidate proceed-with-incomplete-information control; Application / Professional Identity separation; PDF materialisation; template semantic invariance; UI/source/artifact language separation.

The controlled Human Candidate test adds the bounded language finding:

- Artifact language selection and UI/artifact independence: **HUMAN VERIFIED**.
- Structural artifact labels/boilerplate following the selected artifact language: **HUMAN VERIFIED**.
- Full Candidate-derived professional-content transformation into the selected artifact language: **NOT YET IMPLEMENTED / NOT YET HUMAN ACCEPTED**.

PD-063 canonically defines Candidate Artifact Language Transformation as a downstream, semantic-invariant document materialisation from the single Candidate Application Content Model. Language and document voice are bounded sibling constraints over the same structured authorised meaning; they do not create Person Knowledge, Candidate facts, stronger claims or language proficiency.

Original Candidate and Opportunity source material remains preserved. Artifact-language wording remains derived and reconstructably linked to its authorised support. Italian and English are the bounded current Private Beta implementation target; no unlimited-language promise is created.

Fail closed when semantic-preserving wording cannot be established: preserve attributable source meaning, request Candidate review/confirmation, or expose the bounded limitation rather than strengthening the claim.

Next implementation step: the consolidated **PD-062I Candidate Quality Corrective**, using canonical PD-063 specifically for CQ-05 while addressing the separately identified bounded Candidate-quality defects. Human Candidate acceptance remains separate and must be re-run after implementation.

## PD-064 — Candidate Application Semantic Protection Contract

Status: **CANONICAL / CLOSED**

PD-063 remains **CLOSED / CANONICAL**.

PD-062I Second Corrective remains **IMPLEMENTATION VERIFIED WITH CQ-05 OPEN**.

PD-062I CQ-05 first implementation attempt remains **BLOCKED BY MISSING TECHNICAL / CANONICAL VALIDATION BOUNDARY**.

PD-062I Human Candidate Experience remains **NOT YET RE-TESTED**.

PD-064 closes the missing Product Authority boundary by defining sparse **Candidate Application Semantic Protection** metadata that protects upstream-authorised meaning during downstream document/language materialisation without creating Person Knowledge, capability, fit/readiness or a universal ontology.

The bounded first-Beta explicit protection dimensions are:
- agency relation where already established upstream;
- shared/non-exclusive versus exclusive responsibility scope;
- project/team/process/event result attribution versus Candidate-exclusive causality;
- relevant existing epistemic boundary.

Item identity, experience association, chronology, provenance, source relationship and Candidate/Application/Professional-Identity separation remain structural protections rather than duplicate semantic tags.

Protection state distinguishes `established`, `no_additional_protection_needed` and `insufficiently_established`. Missing protection never means unrestricted transformation. Legacy/open material is not retroactively interpreted; if required protection cannot be reconstructed from canonical authority, automatic generative transformation must preserve/fail closed.

For protected items, CQ-05 may now implement a structured executor whose transformation-sensitive semantic atoms are rendered through application-controlled language-specific realizations keyed by authorised protection identities, or an equivalently deterministic constrained mechanism. Provider self-attestation and lexical blacklists are not proof. Free generated remainder must not be allowed to restate or contradict protected dimensions.

Validator authority is deliberately bounded: it may establish that canonical protected dimensions and structural invariants were preserved; it may not claim total semantic equivalence of arbitrary texts.

**Next authorised sequence:**

`PD-064 CLOSED → bounded PD-062I CQ-05 implementation attempt → technical review → ONE final Marco Human Candidate test in Italian + English.`

CQ-01/02/03/04/06/07 remain closed unless the CQ-05 implementation causes a specific regression.

## PD-065 — Bounded Professional Responsibility Scope Authority

Status: **CANONICAL / CLOSED**

PD-064D identified the controlled shared-responsibility case as a **TYPE 3 — CANONICAL SEMANTIC AUTHORITY GAP**. PD-065 closes that Product Authority gap without modifying Decision Accountability, PD-056, Quantified Outcome, PD-057, PD-064 or Candidate Application implementation.

Canonical concept: **Professional Responsibility Scope** is an optional elementary semantic relationship bound to one specific authorised professional activity/episode/responsibility/work scope.

Allowed states:
- `shared_non_exclusive`
- `exclusive_sole`
- `unknown_not_established`

The state is descriptive and non-evaluative. It is not a Person characteristic, capability, leadership/seniority signal, general ownership, Decision Accountability, Continuing People Responsibility, agency relation or result causality.

Construction requires explicit authorised source support, accepted acquisition/confirmation or existing canonical structured authority establishing the same bounded scope. Raw prose cannot directly become an Application semantic tag; missing/ambiguous scope remains `unknown_not_established`.

PD-057 may preserve/reference Responsibility Scope inside a bounded Episode Meaning when independently established, but PD-057 is not expanded into general Person inference.

An established Responsibility Scope may provide PD-064 transformation protection for the same bounded referent. Shared/non-exclusive protects against sole/full/exclusive materialisation; unknown does not permit strengthening.

Controlled first vertical slice: bounded operational-follow-up material equivalent to “Responsabilità condivisa sul follow-up operativo” may canonically preserve `shared_non_exclusive` without establishing leadership, Decision Accountability, ownership, causality, capability or seniority.

PD-065 does **not** address the independent approximately-20% Quantified Outcome case.

Next authorised sequence:
`PD-065 CLOSED → bounded Responsibility Scope implementation/routing → existing Quantified Outcome acquisition/confirmation + routing → CQ-05 Safe Executor Input Readiness review → protected IT↔EN materialisation only if ready`.

PD-062I remains **IMPLEMENTATION VERIFIED WITH CQ-05 OPEN**.

PD-062I Human Candidate Experience remains **NOT YET RE-TESTED**.


## PD-066 — Candidate Application Material Presentation-Language Basis

Status: **CANONICAL / CLOSED**

CQ-05I-R2 exposed one missing Application data-contract distinction: IMAGO could not establish, per stable Candidate Application Material realization, whether direct use was authorised in IT, EN or neither. PD-066 closes that authority gap with Presentation-Language Basis states `established(it)`, `established(en)` and `unknown`.

The basis belongs to the presentation realization, not Candidate truth. It is separate from `sameLanguageDocumentEligibility`, requested/generated artifact language, UI/browser locale, Opportunity/JD language and Candidate proficiency. Historic/missing basis is `unknown`, never default IT. No lexical/model language inference or historical-Beta backfill is authorised.

`D_L` is now canonically the set of otherwise eligible Candidate Application Material realizations whose basis is explicitly established as language L. A CQ-05 transformation reaching `VALID` may establish the requested language on its derived realization; non-VALID outcomes cannot. Mixed-language materials remain material-identity-specific and may coexist in one package.

Next sequence: `PD-066 CLOSED → resume bounded CQ-05I-R2 requested-language consumption enforcement → independent review → only then controlled Human Candidate sequence`.

## PD-067 — Interview Training / Professional Acquisition Boundary

Status: **CANONICAL / CLOSED — TRAINING ISOLATION IMPLEMENTED**

`interview_practice` is formative Training authority, not professional acquisition authority. Training acceptance may progress the shared Runtime and retain training-session answers, but cannot write Evidence or create Observation / Measurement / Knowledge / PI truth / Candidate Application Material. The gate uses structured Product purpose and fails closed for missing/ambiguous acquisition authority.

Build/Enrich remains the explicit acquisition purpose authorised to cross the accepted-answer Evidence boundary where its acquisition Runtime is used. A useful fact surfaced during Training may enter professional truth only through a future Candidate-confirmed **new acquisition event**; the Training Answer itself never becomes Evidence. The preserve/acquire UI transition is not exposed in this first slice because no bounded reusable transition is currently available without additional integration.


## PD-068 — Candidate-facing Representation / Home

Status: **CANONICAL / CLOSED — BOUNDED IMPLEMENTATION READY FOR REVIEW**

The first controlled Human Representation checkpoint was not accepted because the UI exposed repetitive/mechanical semantic machinery and the Home separated purpose selection from its action. PD-068 keeps the existing semantic Representation/Core authority and changes only Candidate-facing composition and interaction hierarchy. Default Representation now leads with bounded high-information professional readings, gives 2–4 discriminating supports under “Why IMAGO says this”, and moves deeper sources/limits behind progressive disclosure. Source identity is human-readable where repository facts permit; exact excerpts are never reconstructed.

The returning-user Home now acts as a compact orientation surface: factual material/Knowledge continuity state, compact consent state, purpose actions with adjacent CTA, and on-demand material management. No Candidate score or new semantic authority is introduced. Human Test remains paused pending Architect review/application; resume from “Mostrami come emergo professionalmente”.

## PD-068C — Professional Meaning Composition and Relationship Integration

Status: **FIRST CORRECTIVE IMPLEMENTED / AUTOMATED VERIFICATION PASS / READY FOR ARCHITECT REVIEW**

The approved PD-068C architecture remains: `professionalMeaning.professionalThreads` is Representation-only, non-persistent, structural-authority-only composition with no Person Knowledge write-back, lexical matching, new acquisition, or Core semantic rewrite.

The First Corrective tightens three boundaries. Role chronology/succession is no longer promoted into professional continuity merely because current and previous roles exist; continuity requires an already-authorised bridge such as a recurrence/pattern spanning the roles. Shared Runtime session/action is preserved as acquisition/provenance lineage only and is not promoted into same-professional-episode meaning because repository authority does not define RuntimeAction identity as canonical episode identity. Atlas therefore remains fail-closed absent structural episode linkage.

Professional Thread eligibility is now explicitly distinct from Level-1 selection. PD-058-style representation-relative informational contribution governs a categorical, non-evaluative selection: cross-material recurrence / authorised cross-role patterns are preferred over standalone episode or Knowledge atoms. Standalone eligible material remains reachable below Level 1 through progressive details/provenance. Selection introduces no score, prestige, capability, fit/readiness or Candidate ranking and does not depend on source/object order as primary authority.

Focused PD-068C corrective tests, relevant regressions and full `scripts/fringe_health_check.js` pass. Private Beta Home remains unchanged. Human Test was not run. The next controlled Human checkpoint remains `Mostrami come emergo professionalmente` after Architect approval/application of the cumulative corrective overlay.


## PD-069 — Grounded Descriptive Professional Relationship Authority

Status: **CANONICAL / CLOSED — READY FOR TECHNICAL VERTICAL SLICE**

PD-069 closes the authority gap identified by PRE-PD-069. Representation may derive open-vocabulary, source/material-scoped descriptive descriptors and grounded relationships between accepted descriptors without converting those relationships into Person-level capability, trait, leadership, seniority, fit/readiness or Knowledge. Model assistance may propose descriptors and relationship hypotheses; deterministic validation remains authoritative for grounding, admissibility, provenance and semantic-strength preservation and must not pretend to prove general semantic equivalence.

Grounded relationships remain Representation-only and feed existing Professional Meaning / Professional Threads before PD-058 informational contribution and non-redundant selection. Lexical/embedding similarity, same project/organisation name, chronology and Runtime/acquisition lineage are not sufficient semantic authority. Unsupported strengthening fails closed. Target-Relative Conditional Knowledge Gap remains a separate future Product Authority.

Next sequence: `PD-069 CLOSED -> bounded technical vertical slice -> automated verification -> Architect review -> controlled Human Professional Representation checkpoint`.


## PD-069I First Corrective — Proposal Self-Attestation Authority Removal

Status: **IMPLEMENTED / AUTOMATED VERIFICATION PASS / READY FOR ARCHITECT REVIEW**

- Preserves the approved PD-069I vertical-slice architecture and does not connect a live model.
- Provider-owned `semanticBoundary` booleans are no longer accepting semantic authority; when retained, they are diagnostic proposal metadata only.
- Descriptor proposals now carry a bounded structured `claimShape`; deterministic validation compares it with an upstream `semanticCeiling` derived from authorised Representation material.
- The ceiling is fail-closed: unknown agency, responsibility, ownership, decision authority, causality or Person-property authority is not treated as permission.
- Relationship hypotheses now carry a bounded structured relationship `claimShape`; Person property/capability, same-episode, chronology-only continuity, ownership/responsibility/causality and fit/readiness assertions fail closed.
- Open descriptive values remain open vocabulary. Deterministic validation checks claim strength/type and does not pretend to prove open semantic equivalence.
- No Person Knowledge persistence, ontology expansion, renderer redesign, Home change, Candidate confirmation or new Product Authority.
- Production behaviour remains unchanged when proposal providers are not configured.
- Focused adversarial tests prove that setting legacy safety flags to `false` cannot authorise an inadmissible structured claim.
- PD-069 authority, PD-068C corrective/composition, Professional Representation, CQ-05, PD-067, FB-01 and full health regressions pass.
- Human Test not run.

## PD-069L — Live Grounded Descriptive Relationship Proposal Integration

Status: IMPLEMENTED / DETERMINISTIC VERIFICATION PASS / LIVE VERIFICATION NOT EXECUTED — PROVIDER CREDENTIALS UNAVAILABLE / READY FOR ARCHITECT REVIEW.

- Connects the approved PD-069I proposal boundary to the existing Groq structured-output infrastructure without changing semantic acceptance authority.
- Uses one bounded live operation to propose descriptor proposals plus relationship hypotheses over authorised Representation material only; target/JD, Product Feedback, Training-only answers and unrelated Candidate state are excluded.
- The live adapter supplies open wording and structured claimShape only. Existing PD-069I semanticCeiling derivation and deterministic validators remain acceptance authority; model output cannot define its own ceiling or write Person Knowledge.
- Provider failure, malformed/empty output, or complete deterministic rejection falls back to the existing pre-PD-069L Representation path without fabricated relationships.
- Accepted relationships continue through Professional Meaning -> Professional Thread -> existing PD-058 Level-1 selection and progressive provenance.
- Bounded diagnostics retain IDs/counts/status/latency/provider identity and fallback reason, not unnecessary Candidate content.
- `scripts/run_pd069l_live_verification.js` is an explicit operator harness and is intentionally excluded from `fringe_health_check.js`.
- Human Test was NOT run. It remains gated by Architect review, overlay application, deterministic local verification and bounded live provider verification.

## PD-069L First Corrective — Live Provenance Identity and Support Reconstructability

Status: IMPLEMENTED / DETERMINISTICALLY VERIFIED; Architect review pending.

- Live bounded model input now materialises deterministic application-owned support identities before the model call and supplies `{ supportRef, exactText }` entries.
- Descriptor grounding is accepted only when the supplied support identity belongs to the referenced material; mismatched model text, unknown/cross-material support refs, or missing support identity fail closed.
- Accepted grounding is reconstructed from the application-owned support entry; the model is not provenance authority.
- Duplicate descriptor or relationship proposal refs fail closed; ambiguous descriptor refs cannot resolve through last-write-wins behaviour.
- PD-069I claimShape / semanticCeiling authority, PD-058 downstream selection, Person Knowledge boundary, target independence, fallback, and one-call live architecture remain unchanged.
- Deterministic focused/regression/full health checks PASS. Human Test not run.
- Live verification was not executed in Builder because provider credentials were unavailable; bounded operator live verification remains the next step after Architect approval/application.

## PD-070 — Higher-Order Descriptive Professional Structure Authority

Status: **CANONICAL / CLOSED — READY FOR TECHNICAL VERTICAL SLICE**

PD-070 closes the bounded authority gap identified by the readiness review. IMAGO may compose multiple independently grounded, already-authorised Representation contributors into a derived, nonpersistent Higher-Order Descriptive Professional Structure whose subject remains documented professional situations/materials rather than a stable Person property. The object preserves contributor/source provenance, claimShape, composition/independence basis and inherited semantic ceilings; richer synthesis does not authorise capability, trait, leadership, seniority, identity, continuity/trajectory, fit/readiness, causality or Person Knowledge strengthening.

A distinct second-order model boundary may propose grouping, wording and structured claim shape, but deterministic validation remains acceptance authority for contributor identity, provenance, recurrence independence, semantic-strength preservation, target independence and nonpersistence. PD-069 remains first-order grounded relationship authority; PD-070 is second-order grounded descriptive composition authority. Accepted structures flow through Professional Meaning / Professional Thread and only then PD-058 informational contribution/nonredundant selection.

Interesting Unknown remains explicitly unauthorised by PD-070; `professionalMeaning.insufficientObservability` receives no new semantics. No additional Candidate acquisition, target/JD reasoning, Person Knowledge promotion or universal ontology is authorised. Next sequence: `PD-070 CLOSED -> bounded technical vertical slice -> automated verification -> Architect review -> controlled Human Professional Representation checkpoint`.

## PD-070I — Higher-Order Descriptive Professional Structure Technical Vertical Slice

**Status:** IMPLEMENTED / CONTROLLED DETERMINISTIC VERIFICATION PASS / READY FOR ARCHITECT REVIEW.

PD-070I implements the smallest controlled second-order path authorised by PD-070: accepted PD-069 Grounded Descriptive Professional Relationships may be proposed into a distinct Representation-only Higher-Order Descriptive Professional Structure, then deterministically validated for contributor identity, reconstructable material independence, semantic-strength boundaries, target independence, nonpersistence and no Person-property inference. Accepted structures enter Professional Meaning distinctly, materialise as downstream Professional Threads, and may occupy Level 1 ahead of subsumed pairwise relationship threads under the existing nonredundant composition boundary. Underlying first-order relationships remain present for support/provenance. No raw-source re-extraction, live second-order provider, Interesting Unknown, Person Knowledge write-back or Human Test is introduced. Full health check passes. Live second-order provider integration remains a separate post-Architect task.

## PD-070I First Corrective — Independent Professional Basis and Nonredundant Level-1 Completion

Status: IMPLEMENTED / DETERMINISTICALLY VERIFIED; Architect review pending.

- Recurrence independence now resolves only through canonical professional episode identity propagated from accepted PD-069 descriptors (`episodeRef`) into the bounded PD-070 contributor adapter; distinct `materialRef`, source, chronology, project/organisation name and Runtime lineage are not independence proxies.
- A recurrence proposal fails closed when at least two independent canonical professional bases cannot be reconstructed. No recurrence proposal is downgraded or rewritten.
- Level-1 selection suppresses only first-order grounded relationships actually referenced by selected Higher-Order Structures; compositionally distinct non-subsumed eligible threads may fill the remaining bounded first-reading budget (max 3).
- Controlled tests cover distinct materialRefs resolving to the same professional basis (rejected recurrence), genuinely independent professional bases (accepted recurrence), H1 consuming R1/R2 while distinct R3 remains Level-1 eligible, and multiple Higher-Order Structures under the bounded budget.
- Full fringe_health_check.js PASS. No live provider integration. No Human Test.

## PD-070I2 — Multi-Type Higher-Order Composition Input and Cross-Type Subsumption Completion

Status: IMPLEMENTED / DETERMINISTICALLY VERIFIED; Architect review pending.

- PD-070L now receives a bounded Representation-only Higher-Order Composition Input spanning accepted PD-069 relationships, Source-Grounded Episode Meaning, supported Patterns and already-authorised bounded Knowledge meanings (Decision Accountability, Quantified Outcome, Responsibility Scope where present, Continuing People Responsibility).
- Every contributor preserves application-owned identity, contributor type, bounded structured meaning, source/material refs, canonical professional basis identity where actually available, and semantic ceiling/protection. Raw CV/interview/JD text is not reintroduced.
- Canonical professional episode identity is reused for recurrence; material/source identity and noncanonical Pattern episode labels are not promoted into professional-basis authority. Unknown basis remains unknown.
- PD-070I deterministic validation now accepts the authorised multi-type contributor classes while preserving the existing claimShape, recurrence, target-independence, nonpersistence and Person-property fail-closed boundaries.
- Accepted Higher-Order Structures preserve all exact multi-type contributor refs/types. Level-1 nonredundancy suppresses only explicitly consumed relationship / Pattern / Episode Meaning / bounded Knowledge threads; non-consumed material remains eligible and all underlying objects remain reconstructable.
- PD-070O diagnostics now expose the real multi-type input and explicit cross-type subsumption without changing Candidate-facing semantics.
- Focused multi-type tests and full `fringe_health_check.js` pass. No Human Test and no UI/provenance cleanup were performed.

## PD-070I2 First Corrective — Diversity-Preserving Bounded Higher-Order Composition Input

Status: IMPLEMENTED / DETERMINISTICALLY VERIFIED; Architect review pending.

- Replaces positional `out.slice(0,24)` truncation with deterministic structural round-robin selection across the existing authorised contributor classes while preserving the same maximum input budget of 24.
- Exact duplicate `contributorRef` identities are removed before budget selection; no wording, lexical, source/project or inferred semantic deduplication is introduced.
- When the eligible set exceeds the budget, an earlier contributor class cannot mechanically starve another authorised class that is actually present. Missing classes are never fabricated; if only one class exists it may fill the budget.
- Stable contributor identity ordering makes selection invariant to equivalent input-array permutations. No model ranking, relevance/importance score, embeddings, prestige, Candidate scoring or target-relative logic is introduced.
- PD-070I2 multi-type semantics, professional-basis rules, PD-070I validation, cross-type subsumption, Level-1 selection, renderer and Candidate-facing behavior are otherwise unchanged.
- Focused corrective tests and full `fringe_health_check.js` pass. No Human Test.

## PD-070O2 — Second-Order Provider Failure Diagnostic Completion

Status: IMPLEMENTED / OPERATOR-ONLY VERIFICATION PASS; Architect review pending.

- PD-070L model-call failures now preserve bounded existing provider/adapter metadata through the operator diagnostic boundary: failure kind/class, HTTP status, provider code/type/message, task, model, timeout/structured-output/parsing classification and elapsed time where known.
- The real PD-070 professional synthesis diagnostic includes this bounded failure object when the live second-order provider fails; unknown values remain unknown and no raw provider body, prompt, CV/transcript/JD or credentials are exposed.
- Provider behavior is unchanged: no prompt/schema/model/token/timeout/retry/fallback/semantic-validation changes. Existing first-order Candidate fallback remains intact.
- Controlled tests cover 429 rate limit, timeout, structured-output rejection, parsing failure, generic bounded failure, successful call without false failure metadata, passive diagnostics and production diagnostic projection. Full `fringe_health_check.js` passes. No Human Test.

## GM-02I — Private Beta Representation Reuse and Provider-Aware Rate-Limit Resilience

Status: IMPLEMENTED / DETERMINISTICALLY VERIFIED; Architect review pending.

- Professional Representation reuse eligibility is now evaluated from the existing canonical source / Knowledge / authorization / recipe fingerprint before CandidateProfile model preparation. A matching existing snapshot is reused even when `GROQ_API_KEY` is configured, so unchanged Representation executes zero CandidateProfile, PD-069L and PD-070L calls.
- Existing fingerprint invalidation semantics remain authoritative; no weaker fingerprint, alternate Representation or truth store was introduced.
- Shared Groq execution now retains bounded `Retry-After` plus available token/request remaining/reset headers, clamps provider-directed waits to 10 seconds, and retries the same serialized semantic request body under existing retry counts.
- PD-069L and PD-070L remain distinct and sequential. PD-070L receives a bounded pre-call wait only when the immediately preceding successful PD-069L response explicitly reports an active provider reset condition; no unconditional pacing or timing heuristic was introduced.
- Operator diagnostics expose bounded logical-call execution metadata (task/model/output mode/budget/attempts/elapsed/retry wait/input chars+UTF-8 bytes/rate-limit metadata) and Representation reuse/fresh-materialization status without raw prompts, CV/transcript/JD or credentials.
- Candidate fallback, semantic validators, PD-069/PD-070 authority, PD-070I2 composition breadth, Person Knowledge and Candidate-facing UI remain unchanged.
- Focused GM-02I tests and full `fringe_health_check.js` pass. No Human Test.


## GM-02V — Fresh Representation Verification Harness and Snapshot Completion-State Review (2026-09-23)
- Added operator-only volatile one-shot force-fresh control for Professional Representation; it bypasses matching snapshot reuse once without changing Candidate state or canonical fingerprint.
- Confirmed current snapshot reuse eligibility is fingerprint-only: a snapshot materialized from a Representation whose PD-070 provider status is failed can still match and be reused.
- Current snapshot schema has no canonical materialization-completeness/provider-degradation/Higher-Order-completed field. Status remains unknown rather than inferred from Candidate-facing wording.
- No semantic/provider/UI behavior changed beyond the operator-only verification bypass. A separate bounded authority/implementation completion is required before degradation/completeness may affect reuse eligibility.

## GM-03I — CandidateProfile Derived Preparation Reuse

Status: IMPLEMENTED / DETERMINISTICALLY VERIFIED.

- CandidateProfile source derivations are reusable derived preparation, not Evidence, Person Knowledge, or source truth.
- Added technical recipe identity `candidate_profile_derived_preparation:v1`.
- Per-source reuse keys exact source identity + parser-relevant content fingerprint + recipe identity.
- Aggregate CandidateProfile remains separately model-derived; its key covers ordered source identities/fingerprints + userNotes fingerprint + recipe identity.
- Professional Representation fresh materialization now reuses valid lower-level CandidateProfiles; GM-02V force-fresh still bypasses only the final Representation snapshot.
- Derived state persists in the existing Professional Identity continuity record; no raw source duplication/provider payload archive.
- CandidateProfile prompt/schema/model/token/retry semantics, PD-069/PD-070, Person Knowledge and Representation fingerprint remain unchanged.
- Focused GM-03I test PASS; full health PASS.

## GM-03I First Corrective — Progressive Valid Derived-Preparation Persistence

GM-03I now checkpoints validated CandidateProfile derived preparation after each newly computed source profile and after a newly computed aggregate profile. The continuity owner persists these derived-only checkpoints independently of later aggregate / PD-069L / PD-070L / Representation success. Failed or unvalidated parser output is never checkpointed. This does not imply Professional Representation completion and does not change Person Knowledge, source truth, Representation snapshot completion semantics, fingerprints, provider policy, or Candidate-facing behavior. GM-02V force-fresh continues to bypass only the final Representation snapshot and may reuse valid progressively persisted CandidateProfile preparation.

## GM-02I Second Corrective — Token-Headroom-Aware Dependent-Call Pacing

Status: COMPLETE / READY FOR ARCHITECT REVIEW.

- GM-02I provider-aware pacing now compares successful upstream `remainingTokens` with the configured completion budget of the next dependent call.
- Positive-but-insufficient token headroom is not treated as adequate.
- For PD-069L -> PD-070L, insufficient explicit token headroom uses explicit Retry-After when present, otherwise explicit token reset metadata.
- Dependent-call token-reset pacing is bounded at 65 seconds, distinct from the existing 10-second same-request retry clamp. Retry counts and retry policy are unchanged.
- Missing/malformed metadata invents no wait; adequate headroom proceeds immediately.
- Operator diagnostics expose previousTask, nextTask, remainingTokens, nextCompletionTokenBudget, tokenHeadroomSufficient, resetTokens, chosenWaitMs and pacingReason.
- No prompt/schema/model/token-budget/semantic/fingerprint/Candidate/Person Knowledge behavior changed.


## GM-04 — Professional Representation Materialization Completion Provenance and Reuse Eligibility (2026-09-24)

- Added explicit derived materialization completion provenance: `complete`, `degraded`, `incomplete`; this is execution provenance, not Candidate truth.
- Reusable snapshots persist bounded `providerFallbackUsed` and `higherOrderSynthesisCompleted` state.
- Ordinary display-safe degraded snapshots remain reusable; GM-02V force-fresh is the bounded path to retry full live materialization without forcing provider calls on every page view.
- Same-fingerprint COMPLETE materialization supersedes DEGRADED in place; later DEGRADED cannot downgrade COMPLETE.
- Canonical Representation fingerprint and semantic authorities are unchanged.

## PD-071 — Candidate-Facing Professional Representation Composition

- Candidate-facing Professional Representation composition updated without new professional inference.
- Primary reading remains bounded to up to three already-authorized Level-1 observations and may fill remaining slots with distinct non-subsumed Episode/Knowledge material.
- Higher-Order structures retain priority; explicitly consumed relationships/patterns are suppressed from competing primary presentation through existing contributor identity only.
- Renderer removes internal proposal identifiers from Candidate wording, applies bounded safe second-person transformation, and omits explicit internal guardrail phrasing when semantic safety is preserved by the underlying claim boundary.
- Provenance label is localized as “Da dove emerge” / “Where this comes from”. Source labels are grounded and human-readable; exact source text alone receives blockquote treatment.
- The detail section no longer replays all non-selected semantic threads as a second Representation; it keeps source/provenance support plus one consolidated grounding note.
- Bounded remaining gap: when a Higher-Order Structure and a supported Pattern are semantically repetitive but the Higher-Order structure does not explicitly consume/reference that Pattern, current canonical identity is insufficient to suppress the Pattern deterministically. PD-071 deliberately does not use lexical/fuzzy equivalence to infer redundancy.
- Focused PD-071 test and full fringe health check PASS.


## PD-071A — Explicit Cross-Type Primary Composition Subsumption Authority

- Added a Representation-only structural composition relation for supported Patterns consumed by an accepted Higher-Order Structure even when the Pattern was not a direct PD-070 contributor.
- Deterministic authority requires exact equality of the complete canonical professional-basis identity set and source identity set, plus accepted PD-069 relationship lineage in the Higher-Order structure.
- Partial overlap, lexical similarity, different professional bases, fuzzy/embedding/model judgment do not authorize suppression.
- The explicit relation is produced upstream as `explicitlySubsumedContributorRefs`; Candidate composition consumes that relation only.
- PD-069/PD-070 claim ceilings, Person Knowledge, Candidate truth, GM-04 and all semantic authorities remain unchanged.

### PD-071B — Candidate-facing wording and support alignment completion
- Candidate-facing presentation now deterministically weakens ownership-like wording when the accepted claim shape explicitly carries `responsibilityAssertion: none`; no new semantic claim is introduced.
- Episode Meaning is presented directly rather than through semantic-engine shell prose, with participation-preserving wording when canonical participation is `participated` or `contributed`.
- Primary cards require aligned visible support. Exact quote treatment is restricted to canonical exact support; Episode Meaning uses neutral structured support rather than an adjacent source excerpt.
- Surface punctuation is normalized deterministically. PD-071A subsumption and all upstream semantic authorities remain unchanged.

### PD-071B First Corrective — continuing people responsibility wording
- Candidate-facing `informal_operational` continuing people responsibility remains activity-framed (`coordini il lavoro di ...`) rather than a generic `responsabilità ... su X persone` noun phrase, because formal reporting authority is not established.
- Continuity, people scope and observed responsibility kinds remain visible; no formal line-management/leadership meaning is introduced.
- The persisted PD-056 reopen regression now explicitly protects this semantic ceiling in addition to its legacy positive wording assertion.

## PD-071B First Corrective Rework — production continuing-people wording

- Corrected the actual Professional Representation synthesis path for canonical `continuing_people_responsibility` with `responsibilityMode=informal_operational`: Candidate-facing Italian wording is activity-based (`coordini il lavoro di ...`) rather than a noun phrase implying responsibility over people.
- The bounded model reconciliation may no longer rewrite this semantic type's Candidate-facing claim/explanation; it preserves the deterministic activity-based realization, preventing responsibility-strength inflation while leaving the canonical semantic object unchanged.
- Scope, continuity and observed responsibility kinds remain represented; formal reporting/line-management/people-leadership authority is not introduced.
- Production regression, PD-071B focused and FHT-RS02 synthesis tests pass. Full health check progressed through PDIR-11 without failure but exceeded the available execution timeout before repository-wide completion.

## PD-072A — Target-relative confirmed absence authority

- Authority defined: `TARGET_RELATIVE_CONFIRMED_ABSENCE` is a recomputable Career-Direction/target-relative derived state, never generic negative Person Knowledge, capability deficiency, fit/readiness or a score.
- Confirmed absence requires positive canonical absence-capable Person Knowledge plus exact requirement/scope compatibility; unknown, missing CV/Evidence, insufficient observation, preference, Training or model inference never qualify.
- Explicit Candidate denial must pass through normal Acquisition -> Evidence -> authorised absence-capable Observation/Measurement/Knowledge before Career Direction can derive confirmed absence.
- Repository classification: current PD-056 continuing-people-responsibility is clarification-capable but not yet absence-capable in Person Knowledge. Although `contextual_non_responsibility` exists at Observation semantics, the current vertical slice intentionally marks it insufficient and emits no Measurement/KnowledgeSnapshot.
- Therefore one minimal PD-056 negative-Knowledge vertical slice is required before implementation of confirmed absence. No generic negative Knowledge was invented.
- Later Knowledge corrections/supersession must recompute the target-relative state; bounded absence may never be globalised into lack of leadership/capability.


## PD-072B — PD-056 bounded contextual non-responsibility negative-Knowledge vertical slice

- Extended only `continuing_people_responsibility` so accepted Evidence-grounded `contextual_non_responsibility` is admitted as `observationStatus=bounded_non_presence_observed` and can reach Measurement, KnowledgeSnapshot and Person Knowledge.
- Specialized Measurement preserves the semantic state with `stateKind=bounded_non_presence_observed`, `presence=0`, bounded `absenceScope`, Evidence lineage and anti-globalization limitations. Generic Measurement projection is deliberately non-evaluative (`normalizedValue=0`, `direction=neutral`); it is not a leadership/responsibility/capability score.
- Unknown/insufficient states remain non-measurable. Existing positive PD-056 behavior remains unchanged. Informal coordination and bounded non-presence of formal reporting authority may coexist without contradiction.
- Existing Career Direction resolution does not treat the new bounded negative Knowledge as positive people-responsibility support; full PD-072 composition remains out of scope.
- Focused PD-072B, PDIR-08, PDIR-10, PDIR-11 and PD-071B regressions pass. Full `fringe_health_check.js` passes.

## PD-072D — bounded formal people responsibility target requirement authority

PD-072D completed the target-side prerequisite identified by PD-072C. Current curated Operations Manager and Industrial Production Manager `people_responsibility` requirements now carry explicit structured `formal_continuing_people_responsibility` authority, including formality, continuity, scope, authority ref and source-basis refs. Unclassified requirements fail closed as unspecified in Career Direction evaluation metadata. No confirmed-absence consumer or UI was implemented. Full health check PASS.

## PD-072C Completion — bounded target-relative confirmed absence derivation (2026-09-25)
- PD-072C resumed after PD-072D and is complete for exactly one semantic slice: `continuing_people_responsibility`.
- Career Direction may derive `TARGET_RELATIVE_CONFIRMED_ABSENCE` only from canonical PD-072B `bounded_non_presence_observed` Knowledge plus a PD-072D `formal_continuing_people_responsibility` target requirement.
- Compatibility is structural and fail-closed: formal + continuing target authority, current-role bounded formal-reporting non-presence, and current temporal scope are required. No prose parsing, lexical matching, embedding, or LLM inference is used.
- Unknown/insufficient/silence/unspecified target authority never become confirmed absence. Informal operational coordination remains a separate supported meaning and is not collapsed into the formal requirement.
- The derived state is Career-Direction-only, recomputed from current Knowledge, non-evaluative, and exposes only `bridgeEligible`; no bridge recommendation or PD-072 UI composition is implemented here.
- Full `scripts/fringe_health_check.js`: PASS.

## PD-072E — Career Direction Candidate support map and hierarchical composition (2026-09-25)
- Candidate-facing Career Direction now uses two-level composition: concise direction overview cards first, expandable direction detail second. Multiple directions no longer render as two fully expanded evidence reports.
- Detail composition separates `Già ben supportato`, `Da chiarire`, and bounded `Da costruire`; `Supportato in parte` is intentionally omitted unless a future deterministic bounded partial-support authority exists.
- `Da costruire` is consumed only from PD-072C `TARGET_RELATIVE_CONFIRMED_ABSENCE` with `bridgeEligible=true`; missing support, budget unknowns, insufficient observation and unspecified target authority remain `Da chiarire`.
- The currently authorized formal-people-responsibility bridge is experiential-first and optional. No course is presented as a substitute for formal people responsibility.
- Preferences are a separate compact Candidate-controlled panel and remain non-Evidence. O*NET/BLS and Candidate provenance remain available under secondary `Fonti e dettagli` disclosure.
- Candidate-facing strings added by PD-072E are localized in IT/EN resources; no new Candidate UI strings are hardcoded.
- Direction acquisition now treats a valid target-relative confirmed absence as a completed clarification outcome, while preserving canonical Evidence -> Knowledge -> recomputation.
- Full `scripts/fringe_health_check.js`: PASS.

### PD-072F — Career Direction Candidate Actionability Completion
- Human-test corrective after PD-072E; PD-072A/B/C/D semantics remain closed.
- Overview counts now preserve clarification vs confirmed-absence state identity.
- Safe bounded unresolved requirements render as direct Candidate questions; only the existing authorized people-responsibility clarification exposes `Approfondisci`.
- Next steps are requirement-specific and state-derived; bridge action appears only for bridge-eligible PD-072C confirmed absence.
- Overview/detail rationale duplication reduced with separate localized overview wording.
- Full health check PASS; ready for final Human Acceptance.


## PD-072G — Career Direction Visual Hierarchy
Candidate-facing Career Direction rendering now provides explicit visual nesting for preferences, overview cards, expanded detail, support-map sections, clarification action blocks, next steps, and secondary traceability. Empty/whitespace-only detail fragments are filtered at rendering time; populated grounding is preserved. No PD-072 semantic authority changed.


## PD-073 — Career Direction Clarification Acquisition Runtime Completion (2026-09-28)
- Bounded Beta corrective after PD-072G Human Acceptance.
- First failing boundary: Groq strict structured-output rejection before a continuing-people-responsibility semantic candidate can enter canonical validation.
- Career Direction already routes `people_responsibility_scope_probe` through Knowledge Acquisition Execution and accepted Runtime Evidence; no parallel Career Direction Knowledge path is introduced.
- On `structured_output_rejected`, the CPR production semantic executor now performs one bounded `json_object` recovery call, then applies the same application validators, exact Evidence grounding/repair and canonical Observation → Measurement → Knowledge path.
- Non-structured provider failures remain fail-closed operational failures. Semantic insufficiency, number-only answers and coordination-only answers do not create unsupported Knowledge.
- PD-072D formal target-requirement semantics remain unchanged: operational responsibility is not promoted to formal line management.


## PD-073 First Corrective — Live Career Direction Clarification Diagnostic Completion (2026-09-28)

- Human Test remains not accepted for live answer interpretation; the current execution environment has no `GROQ_API_KEY`, so the exact live provider failure cannot be replayed or safely classified here.
- Pre-question latency root cause identified: production start performed provider-backed semantic reuse over `professionalSources` before rendering the already-deterministic clarification question.
- Corrective: question preparation remains canonical (Intent → Acquisition design/plan/runtime/execution) but performs no provider call before Candidate answer submission. Controlled timing regression: provider calls before question = 0; local deterministic preparation < 1 s.
- Provider/operator diagnostics now preserve bounded provider status/type/code/model/output mode/structured-output/timing information and whether the PD-073 recovery was entered when a provider error reaches the canonical production path.
- Retry UI now groups the current clarification question, technical-failure message, answer control and stop control in one visible context.
- No CPR/PD-072 semantic authority was broadened. Provider failures remain fail-closed.
- Full `fringe_health_check.js`: PASS.
- Remaining bounded blocker: rerun the real answer with live Groq credentials and capture the newly preserved diagnostic before any further recovery change.


## PD-073 Second Corrective — Career Direction Acquisition Operator Diagnostic Exposure

- Scope: observability only; CPR semantics, provider recovery, grounding, canonical Knowledge and Career Direction recomputation unchanged.
- Prior gap: `directionAcquisition.operationalFailure` was retained internally but was absent from both `/private-beta/operator/semantic-trace` and operator console output.
- When operator diagnostics are enabled, Career Direction acquisition failures are now projected as a sanitized `career_direction_people_responsibility_acquisition` trace and emitted once to the operator console.
- Safe projection includes stage/status/category/reason, bounded provider diagnostic fields, PD-073 recovery metadata, and semantic/provider category; Candidate answer, prompts, raw provider response, Evidence content and secrets are excluded.
- Existing FHT semantic trace records remain compatible and share the existing endpoint.
- Focused regression and full health check: PASS.


## PD-073 Third Corrective — CPR live candidate rejection diagnostic completion (2026-09-28)
- Scope is observability-only. CPR schema/prompt/authority, provider recovery, grounding and canonical Evidence → Knowledge behavior are unchanged.
- `candidate_rejected` operator diagnostics now expose the executor-owned bounded `validationErrors` plus a whitelisted structural candidate shape; professional context, event-time text, support excerpts, Evidence text, raw provider output and prompts are excluded.
- Successful provider-call metadata already available before validation (model, output mode, structured-output flag, elapsed time and HTTP attempts) is propagated without an additional provider call.
- Provider transport and structured-output failures remain distinct from semantic candidate rejection; diagnostics remain gated by operator mode.
- Focused regression and full health check: PASS.

## PD-073 Fourth Corrective — CPR grounding alignment (2026-09-28)

Status: implementation complete; full health PASS; next step is one live Human Test.

New bounded difference only: a CPR semantic candidate whose **only** validation defects are missing Evidence-support fields may reuse the existing application-owned exact Evidence support-grounding repair before final validation. `professionalContext` remains unacceptable without valid Evidence support. All non-grounding semantic/structural errors remain fail-closed. Provider recovery and PD-073 operator diagnostics are unchanged.

### PD-073 Fifth Corrective — CPR canonical Knowledge production completion
- Live failure moved downstream to `canonical_knowledge / measurement_insufficient` after provider, candidate validation and grounding succeeded.
- Exact rule: positive CPR Observation requires a non-`insufficient` responsibility mode; the live candidate had `continuing` + `work_assignment_or_priority_setting` + bounded scope/context but `responsibilityMode=insufficient`, so Observation remained `insufficient`, Measurement remained `insufficient`, and no Person Knowledge was produced.
- Existing PD-056 authority already includes `informal_operational`; no new ontology/semantic authority was added.
- Production extraction now explicitly maps only Evidence-supported recurring/continuing operational people-work responsibility such as assignment/prioritisation to `informal_operational` when formal reporting is not established. Generic coordination remains insufficient; formal line authority is not inferred.
- Canonical diagnostic now preserves safe Observation/Measurement insufficiency detail for operator traces.
- Controlled Career Direction recomputation uses the existing resolver and reaches `resolved_by_current_authorised_state` when canonical CPR Knowledge is produced; no UI state patch is introduced.


## PD-074 continuity

PD-074 adds only Candidate-facing presentation/routing composition over existing Career Direction evaluation/resolution. `people_responsibility_scope_probe` remains the sole bounded actionable clarification route. Budget/resource and production-planning questions remain visible but non-actionable until separate canonical acquisition authority exists. Queue state is recomputed and not persisted as Person Knowledge. PD-073 remains Human Accepted / closed.


## PD-074 First Corrective — Resolved Clarification Projection Alignment

- Career Direction Candidate-facing projection MUST recompute current people-responsibility condition resolution from persisted canonical Person Knowledge, rather than relying only on transient Acquisition resolutions.
- `resolved_by_current_authorised_state` and `target_relative_confirmed_absence` are excluded structurally from clarification queue, unresolved counts, `Da chiarire`, and unresolved next steps.
- The existing stale/direct Acquisition route guard remains defensive fallback protection.
- No PD-072/PD-073 semantic authority or acquisition behavior changes.


## PD-074 Second Corrective — current resolution state rehydration alignment (2026-09-29)

Repository-first diagnosis identified the restart-only stale boundary in `matrixFromReusableDirectionKnowledge()`: persisted `reusableKnowledgeResults` are canonicalized by `knowledgeRef`, while the Career Direction rehydration path selected `items.at(-1)` as if array position meant recency. The same-request Acquisition guard instead used the newly produced `personKnowledgeMatrix`, so guard and rehydrated page could disagree.

Career Direction CPR rehydration now selects the current persisted canonical CPR Knowledge result by canonical Knowledge timestamp (`knowledgeSnapshot.metadata.createdAt`, with existing ledger/event timestamps as bounded fallbacks) and deterministic ref tie-break, never by persistence-array position. Representation snapshots remain presentation/representation state and do not override newer Person Knowledge. No PD-056/PD-072/PD-073 semantic authority changed.

A restart/rehydration regression serializes persisted continuity, discards transient Acquisition resolutions, includes a lexically-later stale CPR snapshot plus newer PD-073 Knowledge, and proves page resolution and defensive Acquisition guard both resolve from the same current canonical Knowledge.

### PD-074 Third Corrective — Initial Career Direction current-resolution projection completion
- Initial `professional_direction_explore` preparation now projects current condition resolutions from persisted canonical Person Knowledge before Candidate-facing composition.
- `projectCurrentCareerDirectionState(...)` is the shared bounded projection used by initial preparation and subsequent direction outcomes; it is recomputable presentation/routing state, not Person Knowledge.
- The focused regression exercises fresh/restarted `POST /private-beta/journey` with persisted PD-073 CPR Knowledge and no transient Acquisition state. CPR is resolved on first render; only budget/resource and production-planning informational clarifications remain.
- PD-074/First/Second/Third Corrective, PD-072E/F/G, PD-073 regressions and full health PASS. No semantic authority or defensive Acquisition guard change.

## PD-075 — Career Direction information hierarchy and Candidate action surface completion

Status: COMPLETE / ready for Human Test.

Candidate-facing Career Direction composition was simplified without semantic changes: clarification queue is the early primary action surface; direction cards are compact and closed by default; unresolved detail is consolidated under one "what remains to understand" section; generic next steps are omitted when they only repeat clarification content; grounding/traceability remains available under collapsed details; structurally empty traceability presentation items are filtered. Current PD-074 state and all PD-072/PD-073 semantics remain unchanged. Full health PASS.


## PD-076 — Career Direction overview/detail UX pattern (2026-09-29)

PD-076 is Candidate-facing UX/information architecture only. Career Direction now uses a two-level navigation pattern: overview cards first, then an explicit selected-direction detail state with persistent sibling direction navigation and collapsed secondary grounding. Selected direction is application/UI navigation state only and is not Person Knowledge.

Bounded role descriptions are composed deterministically from existing target-side role requirement statements; Candidate-specific reasoning remains separate. No Career Direction semantics, resolution state, acquisition authority, target requirements, Person Knowledge, or PD-073 behavior changed.

The pattern is intentionally reusable later as: overview → primary choice → selected detail → primary state/action → secondary collapsible grounding. No other IMAGO surface is migrated by PD-076.

## PD-077 continuity
PD-077 is a bounded Candidate-facing UX/visual-system completion. Career Direction semantics, Person Knowledge, PD-073 Acquisition, PD-074 resolution logic and Career Preference Context semantics are unchanged. Overview now starts with direction choices; selected detail owns contextual unresolved presentation; support/clarify/build use expandable semantic rows; sources remain collapsed. A centralized semantic visual token layer is applied to Career Direction. Neutral role descriptions fail closed to bounded target-side activity/responsibility requirement content. Richer 3–5 line Candidate narrative remains bounded by existing representation authority and is not fabricated.

### PD-079 — Rich requirement support bridge

Career Direction now has a bounded requirement-specific support projection capable of preserving accepted PD-069 relationship and PD-070 higher-order lineage in addition to existing Pattern/Knowledge mappings. Rich target relevance is proposal-only and deterministically accepted; unsupported or strength-inflating mappings fail closed. Requirement support robustness is support-basis metadata, not Candidate scoring. No Requirement Map or target-priority ingestion is introduced.

### PD-079L — Live rich requirement-support proposal wiring

Production `professional_direction_explore` now performs the bounded rich-support proposal step after loading the current Professional Representation snapshot and before `evaluateCareerDirections`. One batch may propose zero or more PD-069/PD-070 → atomic requirement relations; PD-079 remains the deterministic acceptance authority and derives robustness from accepted lineage. The proposal layer has fingerprint reuse and graceful provider degradation to an empty enrichment. Preference-only Career Direction recomputation reuses the current derived proposals. No Candidate truth persistence, new Acquisition authority, Requirement Map, or target-priority authority was added. Focused PD-079L and full health PASS. Real Groq verification was not executed in the implementation environment because `GROQ_API_KEY` was unavailable.


## PD-080 — Target Requirement Priority Authority / O*NET Descriptor Integration (2026-09-30)

- Target requirement priority is TARGET ROLE KNOWLEDGE and remains distinct from Candidate support state and PD-079 documented-support robustness.
- Private Beta authority is a curated O*NET task-descriptor slice only: exact O*NET-SOC occupation identity + exact Task ID + source-native Task Type (Core/Supplemental) + raw Importance when available.
- O*NET Level is a distinct rating concept and must never be inferred from Importance; the current curated task slice does not fabricate Level where the selected task authority does not provide it.
- Occupation code or proposition prose alone is insufficient. Requirement-to-descriptor mapping is explicit and reconstructable; wrong occupation, unknown descriptor, or prose-only similarity fails closed.
- Multi-descriptor requirements preserve descriptor-level native ratings. PD-080 authorises no averaging, maximum-selection, weighted aggregation, or CENTRAL/RELEVANT/COMPLEMENTARY normalization.
- ESCO essential/optional is a legitimate future source-native authority but is not forced into the current Beta fixtures because no sufficiently reconstructable exact ESCO occupation-skill mapping is established here.
- Current role requirement semantics, Career Direction supported/clarify/confirmed-absence states, PD-079 robustness, PD-079L proposal behavior, Acquisition, and Candidate UI are unchanged.
- The structured priority records intentionally preserve occupation/descriptor identity and source-native priority semantics for later PD-081 sustained-role-exposure reasoning; PD-080 does not perform temporal inference.


## PD-081 — Sustained Role Exposure / Temporal Requirement Support Authority

PD-081 adds a derived chronology and target-relative temporal-depth authority. Exact/month-precise role dates are deterministically converted to duration; vague chronology fails closed. The initial bounded sustained threshold is 12 months. For exact PD-080 O*NET Core requirements, sustained formal-role occupancy may establish contextual role support, but it does not establish requirement-specific execution, competence, performance, employer approval, fit or readiness. `SUSTAINED_REQUIREMENT_SUPPORT` additionally requires an existing PD-079 requirement-specific support relation explicitly linked to that role exposure. Cross-role sustained recurrence requires at least two independent role refs with direct requirement support. PD-079 structural robustness remains a separate dimension. The current Professional Representation roleHistory does not yet carry sufficiently precise role dates in the Marco Beta fixture; therefore no temporal depth is fabricated for that current fixture until structured chronology is available.

## PD-081L — Live Role Chronology Integration — COMPLETE

Production chronology path is now source-grounded and restart-safe:

authorised professional source → source-bounded formal role → explicit chronology → Professional Representation roleHistory → representation snapshot → SustainedRoleExposure → PD-081 TemporalRequirementSupport.

Year-only chronology is supported conservatively with minimum/maximum duration. Generic years-of-experience signals remain excluded. The current Marco Beta-style material contains generic "circa 12 anni" but no safely role-bound explicit start/end range, so no real temporal depth is fabricated for that current case.

## PD-082 — Candidate-facing Requirement Map

PD-082 composes the already-authorised PD-079/080/081 axes into the Career Direction selected-detail UI. Each atomic requirement is rendered once with source-native target priority, Candidate support state, structural basis and temporal depth when available. No score, fit/readiness or new Person authority is introduced. Contextual-only role support remains distinct from direct support; absent chronology is not a gap. Overview hierarchy remains PD-077.


## PD-083 continuity
Canonical Candidate-facing visual authority now lives in `docs/20-product/IMAGO_VISUAL_DESIGN_SYSTEM.md`. The existing PD-077 CSS-variable layer was extended rather than replaced; PD-082 Career Direction is the first reference surface. Future UI tasks must read the design-system authority before rendering changes. Legacy surfaces remain migrate-on-touch.

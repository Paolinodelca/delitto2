# IMAGO Core Continuity

Status: **CURRENT**

Verified through: **Task 0100E-43**

Operational milestone: `origin/milestone/0100b-knowledge-foundation`

Last realignment: 2026-07-30 (`GOV-REALIGN-001`)

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

The sole planned task is `0100E-44 — Derived Dimension Knowledge State Construction Hardening Foundation`. Matrix, Coverage and all later consumers remain unauthorized.

## Private Beta Milestone 1 status — M1-06

Task M1-06 adds the minimum Application-level feedback boundary at the end of a completed Private Beta journey. `createPrivateBetaFeedback`, `submitPrivateBetaFeedback` and `skipPrivateBetaFeedback` expose an immutable, versioned state with `not_started`, `submitted` and `skipped` statuses, deterministic timestamps, a session reference, three compact groups of structured answers and one optional free-text comment limited to 500 characters. The feedback captures clarity, usefulness, report credibility, most valuable part, difficulty, reuse and recommendation intent without technical details, new personal data, analytics, telemetry or persistence claims.

`runPrivateBetaUserJourney` now prepares a `not_started` feedback state only after successful completion when a session identifier is available. Missing or skipped feedback never invalidates completion. The feedback state has no Professional Identity field and does not mutate Representation data. Dedicated M1-06 tests and M1-01 through M1-05 plus Beta Runtime Session, Beta Session Core, hardening and Builder readiness regressions pass. Repository-wide npm/Git verification remains non-reproducible because the handover archive has no `package.json` or Git metadata.

## Private Beta Milestone 1 status — M1-07

Task M1-07 adds the minimum Application-level operational logging boundary for the Private Beta. Immutable, versioned events cover `session_started`, `session_completed`, `application_error` and `session_interrupted`, with only `eventId`, technical `sessionId`, timestamp, boundary, outcome and an optional safe M1-03 error code. The sink is injected and failure-safe; logging failure never blocks or changes the Beta journey and no Professional Identity data is accepted by the event model.

The operational runbook documents the expected event sequence, manual distinction between application error, incomplete session and service unavailability, forbidden data, manual checks and escalation conditions. No production persistence, retention, analytics, dashboard, tracing, retry or alerting is claimed. Dedicated M1-07 tests and M1-01 through M1-06 plus Beta Runtime Session, Beta Session Core, hardening and Builder readiness regressions pass.

---

## Product Authority Consolidation

Status: IN PROGRESS

The Private Beta application foundations M1-01 through M1-07 are completed.

The current activity is the consolidation of existing product and architectural knowledge into the canonical Product Authority under:

`docs/20-product/`

Introduced or under consolidation:

- canonical Product Decisions;
- Observation Model;
- Representation Principles;
- minimal Representation Model;
- versioned Dimension Recipes;
- Private Beta Experience Flow.

Next planned activity:

Consolidate the existing repository knowledge into Product Authority before starting Beta Experience Integration.

Deferred:

- E-44;
- additional Core hardening not consumed by the Beta;
- Beta Experience Integration until the product flow is canonically defined.
## Private Beta integration status — BI-01

Task `BI-01 — Beta Journey Integration` integrates the existing Milestone 1 foundations into one Application-owned canonical path. A technical Beta Session is created before onboarding without personal input references; M1-04 onboarding and M1-05 consent are completed before the integration reads or forwards personal materials. The same session is then started in the existing Interview Runtime, completion is assessed and verified through M1-01/M1-02, M1-03 provides tester-safe execution failure handling, the existing Professional Perception reporting layer is materialized for the completed interview, M1-06 feedback remains optional, and M1-07 operational logging remains minimized and failure-safe.

BI-01 does not invent Professional Identity persistence: no existing Application boundary provides a dated persistent Professional Identity snapshot suitable for the canonical Beta journey, so the integrated result exposes `PROFESSIONAL_IDENTITY_SNAPSHOT_CAPABILITY_UNAVAILABLE`. Voice is likewise not implemented because no reusable voice subsystem is present in the handover baseline; text remains supported. Real parser/provider-backed end-to-end regression remains dependent on fixtures/configuration not contained in this handover archive.

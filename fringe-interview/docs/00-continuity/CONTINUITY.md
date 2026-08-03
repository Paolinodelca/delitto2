# IMAGO Core Continuity

Status: **CURRENT**

Verified through: **Task 0100E-25**

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
0100E-1 … 0100E-24
```

Tasks D-9, E-1, E-3, E-5, E-7, E-9, E-11, E-13, E-15, E-17, E-19, E-21 and E-23 are architecture reviews. D-10 is consolidation and freeze. E-2, E-4, E-6, E-8, E-10, E-12, E-14, E-16, E-18, E-20 and E-22 are the implemented downstream Foundations.

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

Task 0100E-15 approves and Task 0100E-16 implements Application-owned `KnowledgeAcquisitionExecution` as the first direct Session consumer and one semantic attempt for one exact active Session item. Its closed pre-invocation lifecycle is `created`, `selected`, `ready_for_invocation`; it is deeply immutable, identity-safe and effect-neutral. Task 0100E-17 approves and Task 0100E-18 implements `KnowledgeAcquisitionInvocationBoundary` as an Application-owned structural outbound port plus an ephemeral, immutable and integrity-fingerprinted input. Task 0100E-19 approves and Task 0100E-20 implements the first capability-specific Infrastructure Invocation Adapter for `capability:structured-input-v1`. Task 0100E-21 approves and Task 0100E-22 implements `KnowledgeAcquisitionProviderResult`. Task 0100E-23 approves and Task 0100E-24 implements the capability-specific Infrastructure Provider Result Evidence Extractor as the anti-corruption crossing into existing Core-owned `Evidence[]`. Extraction is deterministic, deeply immutable, side-effect free and preserves Invocation Input/Provider Result causality in Evidence provenance. Task 0100E-25 approves an Application-owned Knowledge Acquisition Evidence Intake operation as the first direct consumer: it must register Evidence immutably into the Core-owned, non-persistent EvidenceStore aggregate before any Observation processing. No concrete Provider, transport, persistence, Observation, Knowledge Update, Matrix/Coverage update or satisfaction flow exists. The next planned task is `0100E-26`, the effect-free Knowledge Acquisition Evidence Intake Foundation, and it is the only planned task. See `NEXT_PHASE.md`.

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

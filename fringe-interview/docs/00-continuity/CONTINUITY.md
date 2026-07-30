# IMAGO Core Continuity

Status: **CURRENT**

Verified through: **Task 0100E-11**

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
0100E-1 … 0100E-11
```

Tasks D-9, E-1, E-3, E-5, E-7, E-9 and E-11 are architecture reviews. D-10 is consolidation and freeze. E-2, E-4, E-6, E-8 and E-10 are the implemented downstream Foundations.

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

Task 0100E-11 approved `KnowledgeAcquisitionPlan` as the first downstream consumer. The Plan is Application-owned, declarative, post-Configuration and pre-Runtime. It preserves exact capability/configuration causality and composed logical semantics without executable order. It is **APPROVED, NOT IMPLEMENTED**. The next planned task is `0100E-12 — Knowledge Acquisition Plan Foundation`. See `NEXT_PHASE.md`.

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
- Capability Configuration is implemented. The declarative Plan boundary is approved with implementation pending; Runtime, Execution, Satisfaction and Knowledge Update remain unapproved downstream layers.
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

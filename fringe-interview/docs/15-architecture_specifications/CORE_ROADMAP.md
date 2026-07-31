# IMAGO Knowledge Engine Roadmap

Version: 2.0

Status: **CURRENT**

Verified through: **Task 0100E-15**

Next gate: **0100E-16**

Last updated: 2026-07-30 (`GOV-REALIGN-001`)

## Purpose

This is the current architectural and implementation roadmap for the IMAGO Knowledge Engine. Each task appears once with one status. Detailed specifications and historical completion evidence remain in task reports, manifests and Git.

This is not the Product/Beta roadmap and not the IMAGO Builder roadmap.

## Architectural direction

```text
Input / Evidence
→ Observation
→ Measurement / Dimension Contribution
→ Knowledge Snapshot
→ elementary and derived knowledge
→ PersonKnowledgeMatrix
→ Knowledge Acquisition analysis
→ Design and Capability Match
→ Application Solution Decision
→ Application Composition Design (composed only)
→ Application Capability Configuration (implemented)
→ Application Knowledge Acquisition Plan (implemented)
→ Application Knowledge Acquisition Runtime Session (implemented; stateful, pre-Execution)
→ Application Knowledge Acquisition Execution (approved; semantic attempt, not invocation)
```

Evidence is authoritative; knowledge and composed views are reconstructable. Runtime execution and Reporting integration are not implied by this roadmap.

## Completed Foundations

### Phase 0100A — Preliminary Foundations

| Task | Status | Result |
|---|---|---|
| 0100A-1B | COMPLETED | preliminary Foundation recorded by task report |
| 0100A-2 | COMPLETED | preliminary Foundation recorded by task report |

### Phase 0100B — Knowledge Engine Foundation

| Task | Status | Result |
|---|---|---|
| 0100B-1 | COMPLETED | Measurement and Capability Foundation |
| 0100B-2 | COMPLETED | Dimension Knowledge State Foundation |
| 0100B-3 | COMPLETED | Dimension Contribution Foundation |
| 0100B-4 | COMPLETED | Measurement-to-Dimension Mapping Foundation |
| 0100B-5 | COMPLETED | Elementary Dimension Aggregation Foundation |
| 0100B-6 | COMPLETED | Knowledge Ledger and Snapshot Foundation |
| 0100B-7 | COMPLETED | Derived Knowledge Foundation |
| 0100B-8 | COMPLETED | Capability Recipe Execution Foundation |
| 0100B-9 | COMPLETED | Derived Dimension State Foundation |
| 0100B-10 | COMPLETED | Person Knowledge Matrix Foundation |

Verified outcome:

```text
Observation
→ MeasurementResult
→ DimensionContribution
→ KnowledgeLedger / KnowledgeSnapshot
→ elementary and derived knowledge
→ PersonKnowledgeMatrix
```

### Phase 0100C — Matrix Query and Coverage

| Task | Status | Result |
|---|---|---|
| 0100C-1 | COMPLETED | Person Knowledge Matrix Query Foundation |
| 0100C-2 | COMPLETED | Knowledge Coverage Foundation |
| 0100C-3 | COMPLETED | Knowledge Coverage Query Foundation |

Queries are deterministic, read-only, allowlisted and non-interpretative. Coverage describes available knowledge without scoring or evaluating the person.

### Phase 0100D — Declarative Knowledge Acquisition Boundary

| Task | Type | Status | Result |
|---|---|---|---|
| 0100D-1 | Foundation | COMPLETED | Knowledge Opportunity |
| 0100D-2 | Foundation | COMPLETED | Opportunity Query |
| 0100D-3 | Foundation | COMPLETED | Acquisition Need |
| 0100D-4 | Foundation | COMPLETED | Need Query |
| 0100D-5 | Foundation | COMPLETED | Acquisition Strategy |
| 0100D-6 | Foundation | COMPLETED | Strategy Query |
| 0100D-7 | Foundation | COMPLETED | Acquisition Requirement |
| 0100D-8 | Foundation | COMPLETED | Requirement Query |
| 0100D-9 | Architecture Review | COMPLETED | boundary termination at Requirement confirmed |
| 0100D-10 | Consolidation / Freeze | COMPLETED | declarative boundary frozen and regression-protected |

Frozen pipeline:

```text
PersonKnowledgeMatrix
→ KnowledgeCoverage
→ KnowledgeOpportunity
→ KnowledgeAcquisitionNeed
→ KnowledgeAcquisitionStrategy
→ KnowledgeAcquisitionRequirement
```

Requirement is a declarative post-condition. It has no satisfaction, priority, source, method, plan or execution state.

### Phase 0100E — Post-Requirement Design and Decision

| Task | Type | Status | Result |
|---|---|---|---|
| 0100E-1 | Architecture Review | COMPLETED | Design approved as first downstream consumer |
| 0100E-2 | Foundation | COMPLETED | Knowledge Acquisition Design |
| 0100E-3 | Architecture Review | COMPLETED | Capability Match direction approved |
| 0100E-4 | Foundation | COMPLETED | Knowledge Acquisition Capability Match |
| 0100E-5 | Architecture Review | COMPLETED | Application Solution Decision direction approved |
| 0100E-6 | Foundation | COMPLETED | Knowledge Acquisition Solution Decision |
| 0100E-7 | Architecture Review | COMPLETED | composed-only Composition Design direction approved |
| 0100E-8 | Foundation | COMPLETED | Capability Composition Design |
| 0100E-9 | Architecture Review | COMPLETED | unified Application Capability Configuration direction approved |
| 0100E-10 | Foundation | COMPLETED | unified declarative Application Capability Configuration |
| 0100E-11 | Architecture Review | COMPLETED | declarative Application Knowledge Acquisition Plan direction approved |
| 0100E-12 | Foundation | COMPLETED | declarative Application Knowledge Acquisition Plan |
| 0100E-13 | Architecture Review | COMPLETED | Application Runtime Session approved as first operational Plan consumer |
| 0100E-14 | Foundation | COMPLETED | Application Knowledge Acquisition Runtime Session |
| 0100E-15 | Architecture Review | COMPLETED | Application Execution approved as first Session consumer; Invocation identified as first side-effect |

Current implemented extension:

```text
KnowledgeAcquisitionRequirement
→ KnowledgeAcquisitionDesign                       [Core]
→ KnowledgeAcquisitionCapabilityMatch              [Core]
→ KnowledgeAcquisitionSolutionDecision             [Application]
→ KnowledgeAcquisitionCapabilityCompositionDesign  [Application; composed only]
```

Discovery and candidate resolution remain Application-owned. Local and contextual validation have distinct guarantees. Planning and Execution are excluded.

## Current gate

### 0100E-16 — Knowledge Acquisition Execution Foundation

Type: **FOUNDATION**

Status: **PLANNED**

| Task | Type | Status | Result |
|---|---|---|---|
| 0100E-16 | Foundation | PLANNED | implement one provider-neutral semantic Execution attempt per active Session item |

Approved cardinality:

```text
single   Decision → 0 Composition Design → 1 Configuration
composed Decision → 1 Composition Design → 1 Configuration
none/deferred     → 0 Configuration
```

Configuration is Application-owned, declarative, immutable and pre-planning. It may bind explicit non-secret values to already selected capability refs, but may not resolve providers, order invocations, plan or execute.

Task 0100E-11 approved and E-12 implemented exactly one declarative `KnowledgeAcquisitionPlan` per valid Configuration, with one unit per selected capability. Task E-13 approved and E-14 implemented `KnowledgeAcquisitionRuntimeSession` as its first operational consumer: one Plan may cause zero or more Sessions, each Session refers to exactly one Plan, and each Plan Item has one Session item-state projection. No intermediate Runtime Definition is required.

Task E-15 approves `KnowledgeAcquisitionExecution` as the Application-owned first direct Session consumer and one provider-neutral semantic attempt for one exact active Session item. E-16 may implement only that Foundation. The separate Knowledge Acquisition Invocation Boundary is the first observable external effect and remains unapproved pending a later repository-first architecture review.

## Not approved

The following are not roadmap commitments and must not be implemented automatically:

- acquisition Action or executable Recipe beyond the approved declarative Plan;
- provider or adapter resolution;
- provider invocation or Runtime orchestration beyond the approved semantic Execution Foundation;
- Requirement satisfaction;
- Knowledge Update;
- integration with Runtime or Reporting legacy;
- Synthetic Evaluation Platform;
- Learning Engine.

## Guardrails

- preserve the Phase D freeze;
- keep Core matching separate from Application discovery and decisions;
- do not add downstream ambiguity to upstream contracts;
- keep elementary and derived knowledge separate;
- preserve deterministic identity, canonical ordering, provenance and caller-owned input immutability;
- no person score, ranking, recommendation, network, persistence or LLM in deterministic Foundations unless explicitly approved;
- perform the Continuity Impact Assessment for every task.

## Verification baseline

```powershell
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

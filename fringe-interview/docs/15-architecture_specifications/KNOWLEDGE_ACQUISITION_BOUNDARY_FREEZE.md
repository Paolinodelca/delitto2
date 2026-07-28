# Knowledge Acquisition Declarative Boundary Freeze

Status: **FROZEN**

## Purpose

This document protects the public semantic boundary of IMAGO Knowledge Analysis. The boundary describes knowledge coverage, incompleteness, missing layer, general transformation category and final required knowledge availability. It does not implement acquisition planning or execution.

## Frozen pipeline

```text
PersonKnowledgeMatrix
        ↓
KnowledgeCoverage
        ↓
KnowledgeOpportunity
        ↓
KnowledgeAcquisitionNeed
        ↓
KnowledgeAcquisitionStrategy
        ↓
KnowledgeAcquisitionRequirement
```

## Responsibilities

- `PersonKnowledgeMatrix`: structured elementary and derived knowledge available for a subject.
- `KnowledgeCoverage`: coverage configuration by dimension and capability.
- `KnowledgeOpportunity`: incomplete coverage configuration eligible for transformation.
- `KnowledgeAcquisitionNeed`: missing elementary or derived knowledge layer.
- `KnowledgeAcquisitionStrategy`: deterministic general transformation category.
- `KnowledgeAcquisitionRequirement`: final declarative knowledge condition that must become available.

## Direct causality

- Opportunity → `sourceCoverageRef`
- Need → `sourceOpportunityRef`
- Strategy → `sourceNeedRef`
- Requirement → `sourceStrategyRef`

Other propagated references are transitive traceability only.

## Cardinality

From Opportunity onward the frozen cardinality is strictly one-to-one:

```text
1 Opportunity → 1 Need → 1 Strategy → 1 Requirement
```

## Frozen mappings

```text
derived_layer_only
→ elementary_knowledge_required
→ elementary_knowledge_acquisition
→ elementary_knowledge_availability_required
→ elementary
```

```text
elementary_layer_only
→ derived_knowledge_required
→ derived_knowledge_composition
→ derived_knowledge_availability_required
→ derived
```

## Query Foundations

Each collection has a deterministic read-only Query Foundation using a flat allowlisted query, at least one filter, exact matching, AND semantics, canonical ordering, independent deep clones and valid empty results. Ranking, pagination and upstream reinterpretation are excluded.

## Summary invariants

Collection and Query Result summaries are descriptive, deterministic and recalculable. Opportunity summaries include exact sparse counts in `byOpportunityType`; unknown, missing or inconsistent entries are invalid.

## Prohibited semantic extensions

The Knowledge Core namespace must not expose Plan, Action, Execution, Orchestration, Fulfillment or Requirement Satisfaction contracts without a new Architecture Review. `KnowledgeAcquisitionRequirement` must not contain satisfaction, completion, status, progress, priority, ranking, source-selection, method, channel, question, plan or execution state.

## Core/Application boundary

Planning, source and method selection, channel selection, question generation, runtime execution, evidence ingestion and operational orchestration belong downstream in Application, Runtime or Adapter layers unless a future architecture decision establishes a separate deterministic Core service.

Requirement satisfaction is not internal state of `KnowledgeAcquisitionRequirement`. Any future satisfaction model requires a separate architecture decision and must be proven by new evidence and/or recalculated coverage.

## Change rules

Future changes to mappings, cardinality, direct causality, public exports or Requirement semantics require an explicit architecture task and corresponding regression updates. Technical fixes, validation hardening and internal refactoring remain possible when semantic invariants are preserved.

## Protection

The freeze is protected by:

- `scripts/test_knowledge_acquisition_boundary_freeze.js`
- `scripts/test_health_knowledge_acquisition_boundary.js`
- the exact shared export allowlist fixture
- specific Foundation and Query regression suites
- `scripts/test_all_core.js`
- `scripts/fringe_health_check.js`

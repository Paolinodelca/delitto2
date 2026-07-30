# Next Phase — IMAGO 0100E-9

Status: **CURRENT**

Task type: **ARCHITECTURE REVIEW — NO IMPLEMENTATION**

## Task

```text
0100E-9 — Post-Capability-Composition-Design Downstream Architecture Review
Status: PLANNED
```

## Objective

Perform a repository-first review after Task 0100E-8 and determine the first legitimate downstream consumer common to the `single` and `composed` Solution Decision modes.

Capability Configuration is a candidate to evaluate. It is not an approved contract, layer, ownership decision or implementation task.

## Required inputs

- current continuity package and Core roadmap;
- Knowledge Acquisition boundary freeze;
- reports/reviews E-5, E-6, E-7 and E-8;
- `KnowledgeAcquisitionDesign`;
- `KnowledgeAcquisitionCapabilityMatch`;
- `KnowledgeAcquisitionSolutionDecision`;
- `KnowledgeAcquisitionCapabilityCompositionDesign`;
- local and contextual Composition Design validators;
- passing Core aggregate suite and overall health check.

## Questions to decide

1. What is the first valid consumer of both `single` and `composed` Decisions?
2. Is a declarative Capability Configuration layer necessary?
3. Which layer owns it: Application, Runtime or another explicitly justified boundary?
4. What are its cardinality, identity, causal references and validation context?
5. How does `single` proceed without a Composition Design?
6. Which information remains provider/runtime-specific and therefore excluded?
7. What must be regression-protected before any implementation?

## Deliverables

- repository-first architecture review report;
- explicit `APPROVED DIRECTION`, `DEFERRED` or `STOP` decision;
- boundary diagram for all Solution Decision modes;
- responsibility matrix for Core, Application, Runtime and Adapter layers;
- approved invariants, cardinality, causality, public API and exclusions, if any;
- regression risks and required tests;
- exact next task name and perimeter only if a direction is approved;
- aligned roadmap, continuity and decisions.

## Out of scope

- new Foundation implementation;
- changes to existing contracts, mappings, cardinalities or public exports;
- capability discovery or reselection;
- provider or adapter implementation;
- acquisition planning, recipe or executable ordering;
- runtime orchestration or execution;
- Requirement satisfaction or Knowledge Update;
- Runtime/Reporting legacy integration;
- persistence, network or LLM integration.

## Completion criteria

- current repository state and tests verified;
- all Decision modes explicitly covered;
- Configuration remains a candidate unless approved by the review;
- frozen boundaries preserved;
- next implementation is not started;
- Continuity Impact Assessment completed.

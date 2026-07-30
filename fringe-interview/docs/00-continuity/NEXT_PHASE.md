# Next Phase — IMAGO 0100E-10

Status: **CURRENT**

Task type: **FOUNDATION IMPLEMENTATION**

## Task

```text
0100E-10 — Knowledge Acquisition Capability Configuration Foundation
Status: PLANNED
Ownership: Application
```

## Approved direction

Implement one unified declarative `KnowledgeAcquisitionCapabilityConfiguration` contract for applicable `single` and `composed` Solution Decisions.

- `single`: Decision + exact selected capability snapshots + explicit configuration definition/context → one Configuration;
- `composed`: Decision + exact Composition Design + exact selected capability snapshots + explicit configuration definition/context → one Configuration;
- `none` and `deferred`: builder rejection and no Configuration.

This is an approved direction, not current implementation. The exact contract must be derived repository-first within the invariants frozen by the E-9 review.

## Minimum scope

- deterministic Application builder;
- local validator;
- pure Application contextual validator against Decision and, when composed, Composition Design;
- declarative parameter allowlist/type/requiredness checks from explicit caller-supplied definitions;
- deterministic identity, canonical ordering, provenance and input immutability;
- fixture, focused tests, regression, public Application export check and health integration;
- continuity impact assessment.

Candidate public API is limited to build, local validate, contextual validate and health. No query or collection API is approved.

## Out of scope

- Core contract or export changes;
- candidate discovery, registry lookup, selection or reselection;
- provider/adapter resolution or availability;
- credentials, secrets or secret references;
- environment lookup, endpoint, payload, prompt or model;
- fallback, retry, timeout or failure policy;
- invocation, ordering, planning, recipe, orchestration or execution;
- result collection, satisfaction or Knowledge Update;
- Runtime, Beta Session or Reporting integration;
- persistence, network, UI or LLM invocation.

## Completion criteria

- single and composed paths preserve their distinct causal inputs under one contract;
- no one-node composition is created for single;
- none/deferred produce no artifact;
- composed Configuration exactly references its Composition Design;
- no Composition Design topology is duplicated;
- local and contextual validation guarantees remain separate;
- upstream contracts and freeze remain unchanged;
- dedicated, aggregate, health and continuity governance checks pass.

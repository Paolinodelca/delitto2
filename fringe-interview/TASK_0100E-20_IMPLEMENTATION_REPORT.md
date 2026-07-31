# Task 0100E-20 — Knowledge Acquisition Capability-Specific Invocation Adapter Foundation

## Executive Summary

The first capability-specific Infrastructure invocation adapter is implemented for the repository-established `capability:structured-input-v1`. It concretely satisfies `KnowledgeAcquisitionInvocationPort`, accepts only a valid immutable `KnowledgeAcquisitionInvocationInput`, rejects incompatible capabilities, and delegates to one Provider supplied before invocation.

No concrete Provider, client, SDK, transport, network, filesystem, database, registry, resolver, discovery or runtime routing is introduced.

## Repository Review

The implementation was derived from the Application Invocation Port/Input, validators, identity fingerprint, health, fixture, tests and public APIs; Infrastructure and bootstrap conventions; authority documents; and Tasks E-15 through E-19. The fixture establishes `capability:structured-input-v1` as the first concrete capability reference. E-19 requires a capability-specific Adapter and separates it from the Provider.

## Adapter Responsibility

`StructuredInputKnowledgeAcquisitionInvocationAdapter` is Infrastructure-owned. Its frozen public shape exposes only `invoke`, so it satisfies the structural Application port. Each call validates the complete Invocation Input, checks the exact supported capability, and delegates once. It does not select or construct a Provider and owns no registry, resolver, routing, discovery, retry, timeout, lifecycle, persistence, output normalization or Knowledge Update.

## Provider Contract

The minimum Provider contract is a closed object exposing only `acquireKnowledge(input)`. It is validated when the Adapter is created. The Provider is distinct from the port because it does not expose `invoke` and does not implement `KnowledgeAcquisitionInvocationPort`. The contract is abstract and tested only with an in-memory stub.

## Bootstrap Strategy

Composition/bootstrap calls `createStructuredInputKnowledgeAcquisitionInvocationAdapter({ provider })` with one already selected compatible Provider. The factory validates and captures that dependency; `invoke` performs no selection or lookup. Lifecycle is Infrastructure-managed, with exactly one injected Provider per Adapter instance and one capability per Adapter implementation.

## Side-Effect Boundary

The Adapter's delegation to `provider.acquireKnowledge` is the first authorized effect boundary. Tests confine the observable effect to an in-memory array owned by the stub. The Adapter performs no external I/O itself and returns the Provider call unchanged without defining result semantics.

## Validation

- invalid or integrity-tampered Invocation Inputs are rejected before delegation;
- a valid input for another capability is rejected before delegation;
- incompatible Provider shapes are rejected during construction;
- the exact original input object is delegated, preserving fingerprint and traceability;
- input and Adapter immutability are verified;
- the Adapter itself is validated as an Invocation Port.

## Public API

Infrastructure CommonJS and ESM entry points expose only the Adapter factory, Provider validator and Adapter health function. Application and Core APIs remain unchanged and do not export Infrastructure artifacts.

## Tests

Dedicated behavior, public API and health tests pass. `test_all_core.js` includes all three new checks and passes. `fringe_health_check.js` includes the new Infrastructure health check and reports all checks passing. Continuity governance direct and aggregate checks pass with E-21 as the sole planned task.

## Self Review

- capability-specific Adapter exists and implements the port: PASS;
- Provider injected before invocation and never selected dynamically: PASS;
- Provider stub receives the original Invocation Input: PASS;
- side-effect confined to Provider stub in tests: PASS;
- no concrete Provider, transport, network, filesystem or database: PASS;
- no registry, resolver, discovery or routing: PASS;
- no retry, timeout, result, persistence or Knowledge Update: PASS;
- Application/Core dependency direction preserved: PASS;
- aggregate Core, overall health and continuity governance: PASS.

## Continuity Impact

Classification: **BOUNDARY** — E-20 materializes the previously approved Infrastructure boundary.

| Document | Impact | Action | Reason |
|---|---|---|---|
| `CONTINUITY.md` | status/boundary | updated | records implemented Adapter and E-21 |
| `CORE_ARCHITECTURE.md` | architecture | updated | records responsibility and dependency direction |
| `DECISIONS.md` | decision | updated | records ADR-034 implementation choice |
| `CORE_ROADMAP.md` | status | updated | completes E-20 and plans E-21 |
| `NEXT_PHASE.md` | status | replaced current task | identifies the single next gate |

## Residual Risks

The Provider contract deliberately receives the whole immutable Invocation Input because the current port exposes configuration references rather than resolved values. A future concrete Provider may require a reviewed translation/configuration mechanism. Return, error and outcome semantics remain intentionally undefined. These gaps must not be filled implicitly.

## Next Gate

`0100E-21 — Post-Invocation-Adapter Downstream Architecture Review` must determine the next legitimate boundary. It does not pre-authorize a concrete Provider, vendor, SDK, transport, retry, timeout, Result, persistence, Requirement satisfaction or Knowledge Update.

## Git and Governance

Work was performed on `task/0100e-20` from required HEAD `2fab8028a58228c23028691f43db45add034e1e0`. No staging, commit, push or milestone integration was performed.

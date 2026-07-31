# Next Phase — IMAGO 0100E-20

Status: **CURRENT**

Task type: **FOUNDATION**

## Task

```text
0100E-20 — Knowledge Acquisition Capability-Specific Invocation Adapter Foundation
Status: PLANNED
```

## Purpose

Establish repository-first the minimum capability-specific Infrastructure Invocation Adapter that implements the Application-owned `KnowledgeAcquisitionInvocationPort`.

The Foundation must preserve the ephemeral input contract and dependency direction `Infrastructure → Application`. It must keep Adapter and Provider distinct, receive Adapter/Provider bindings from Infrastructure composition/bootstrap before `invoke`, and exclude dynamic resolution, registry and generic routing.

## Current state

Task 0100E-18 implements the structural `invoke` port and deeply immutable `KnowledgeAcquisitionInvocationInput`. Task 0100E-19 approves a capability-specific Invocation Adapter as the first Infrastructure consumer and concrete port implementation. The Adapter is the first location of a future real side-effect; a Provider remains behind it, and no additional semantic boundary is required before the Provider. E-19 implements no Adapter, Provider or side-effect.

## Not authorized

E-20 does not pre-authorize a Provider abstraction, generic Adapter, dynamic selection, registry, resolver, factory, routing, retry, persistence, Result, Outcome, Requirement satisfaction or Knowledge Update. Its exact implementation scope remains subject to explicit task authorization and repository-first verification.

# Next Phase — IMAGO 0100E-24

Status: **CURRENT**

## Task

0100E-24 — Structured Input Provider Result Evidence Extractor Foundation
Status: PLANNED

## Objective

Implement the smallest effect-free capability-specific Infrastructure extractor approved by E-23, translating a valid structured-input Provider Result into zero or more existing Core-owned Evidence values.

## Current State

Task 0100E-23 approves a capability-specific Provider Result Evidence Extractor as the anti-corruption crossing after the technical Provider Result. Infrastructure owns payload interpretation; Core owns the emitted `Evidence[]` and remains unaware of Provider Result and provider schema. Direct Knowledge, Knowledge Candidate and generic normalization are rejected.

## Guardrails

E-24 may implement only an effect-free extractor for `capability:structured-input-v1`, contextual Provider Result validation, minimal fixture-backed payload decoding, existing Evidence construction/validation, focused tests, health and Infrastructure exports. It must not modify Provider Result, Provider, Adapter or Core Evidence contracts; implement a concrete Provider, transport or I/O; create Knowledge/Candidates; update stores, Ledger, Matrix or Coverage; decide satisfaction; mutate Runtime; persist; score; or normalize Provider failures. If mandatory provenance cannot fit the existing Evidence contract, the task must stop for architecture review.

KnowledgeAcquisitionCapabilityConfiguration is IMPLEMENTED and remains declarative.

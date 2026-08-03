# Next Phase — IMAGO 0100E-28

Status: **CURRENT**

## Task

0100E-28 — Registered Evidence Selection Foundation
Status: PLANNED

## Objective

Implement the minimum Application-owned read boundary over an explicitly supplied valid Core EvidenceStore: exact registered-Evidence selection returning unchanged Core `Evidence[]`.

## Current State

E-27 is COMPLETED with outcome APPROVED WITH NOTES. Observation is a first interpretation and is not the direct Store consumer at this gate. The approved first consumer is an effect-free Application operation accepting `0..N` unique exact Evidence IDs and returning a fresh deeply immutable canonical subset of registered Evidence. No new domain result contract, selector identity or persistence is introduced.

## Guardrails

E-28 may implement only exact membership selection, contextual validation, immutability, canonical ordering and the minimum public API/health/tests required by existing conventions. It must preserve Evidence unchanged, including nullable confidence, and treat empty/no-match selection as an empty result without absence semantics. It must not implement semantic filtering/grouping/deduplication, Evidence deletion, Observation or Measurement construction, confidence/quality/reliability assignment, persistence/I/O, Provider/Adapter/LLM work, Requirement satisfaction, Knowledge/Ledger/Snapshot/Matrix/Coverage updates or Runtime mutation.

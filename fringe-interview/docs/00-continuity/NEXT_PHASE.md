# Next Phase — IMAGO 0100E-26

Status: **CURRENT**

## Task

0100E-26 — Knowledge Acquisition Evidence Intake Foundation
Status: PLANNED

## Objective

Implement the effect-free Application-owned Knowledge Acquisition Evidence Intake operation approved by E-25 and the minimum Core immutable registration primitive required to return a valid existing EvidenceStore.

## Current State

E-25 is COMPLETED with outcome APPROVED WITH NOTES. It decides that extracted Core-owned `Evidence[]` must first be consumed by a narrow Application intake operation and atomically registered into the Core-owned EvidenceStore aggregate/collection. EvidenceStore is not persistence. Observation cannot consume the extractor array directly, and no new Evidence Collection or intake-result domain contract is required.

## Guardrails

E-26 may consume immutable `Evidence[]`, validate Evidence and acquisition-batch coherence, reject exact ID collisions within the batch and against an explicit current Store, and return one fresh valid EvidenceStore without mutation. Empty input is a valid no-op and has no absence or satisfaction meaning.

E-26 must not modify Evidence or EvidenceStore contracts unless it stops for another architecture review. It must not persist, perform I/O, silently merge duplicates, infer semantic equivalence, assign confidence/quality/reliability, create Observation/Measurement/Contribution/Knowledge, update Ledger/Snapshot/Matrix/Coverage, decide Requirement satisfaction, mutate Runtime, or integrate a concrete Provider/transport.

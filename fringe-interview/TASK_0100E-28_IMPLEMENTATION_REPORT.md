# Task 0100E-28 — Registered Evidence Selection Foundation

Status: **COMPLETED**

## 1. Executive Summary

Implemented the minimal deterministic Application-owned Registered Evidence Selection. It validates one explicit Core EvidenceStore and `0..N` exact unique Evidence IDs, proves exact membership, and returns a fresh deeply immutable canonical `Evidence[]`. Review outcome: **CONFORMING**.

## 2. Repository-First Review

Reviewed Core Evidence construction/validation, Evidence identity, EvidenceStore builder/validator/API/health, E-24 extraction, E-26 intake, E-25/E-26/E-27 reports, Application query/validation conventions, canonical ordering, cloning/deep-freeze patterns, aggregate/overall health, continuity governance, `CONTINUITY`, `CORE_ARCHITECTURE`, `DECISIONS`, `NEXT_PHASE`, and `CORE_ROADMAP` before implementation.

## 3. Architectural Decision

Adopted `selectRegisteredKnowledgeAcquisitionEvidence({ evidenceStore, evidenceIds })`. It returns the selected Evidence array directly. No outcome wrapper, query language, selection identity, intermediate domain contract, or Core API change was introduced.

## 4. Selection Responsibility

The operation only validates, proves exact unique membership, clones registered members, sorts by exact Evidence ID, verifies cardinality, and deep-freezes the output.

## 5. Ownership

Selection, its local/context validators, and health are Application-owned. Evidence and EvidenceStore remain Core-owned. Infrastructure stays upstream.

## 6. Input and Output

Input is the closed shape `{ evidenceStore, evidenceIds }`; output is a new `Evidence[]`. Invalid input throws `INVALID_REGISTERED_EVIDENCE_SELECTION` without partial output.

## 7. Cardinality

`1 EvidenceStore + 0..N unique IDs → 0..N Evidence`. Every requested ID produces exactly one member and no unrequested member is returned.

## 8. Exact Membership

Membership uses exact JavaScript string equality through `Map`/`Set`. Missing IDs, duplicate requested IDs, and duplicate registered IDs that make a reference ambiguous are rejected. No case folding, partial, fuzzy, content, provenance, confidence, or similarity matching exists.

## 9. Empty Selection Semantics

Zero IDs is valid and returns a fresh frozen empty array. It carries no absence, failure, `not_observed`, negative Evidence, coverage, or Requirement-satisfaction meaning.

## 10. Canonical Ordering

Output is sorted by `Evidence.id` with `localeCompare`, matching E-26 EvidenceStore ordering. Input permutations of the same ID set produce structurally equal output.

## 11. Causality

The only new causal proof is requested ID → registered Evidence with the same ID. No selection, batch, transaction, or fingerprint identity is created.

## 12. Confidence and Provenance

Every selected Evidence is value-preserved. `confidence`, including `null`, source fields, extraction data, metadata, extensions, and acquisition provenance remain unchanged.

## 13. Immutability

Store and reference inputs are never mutated. Evidence are deep-cloned because the Core validator accepts valid but mutable Stores; recursively freezing the clones prevents later input mutation from reaching the output and avoids mutable aliases.

## 14. Validation

`validateRegisteredEvidenceSelection` enforces closed shape, required fields, a valid Core Store, array input, non-empty string IDs, and unique refs. `validateRegisteredEvidenceSelectionContext` additionally rejects ambiguous Store IDs and missing membership. The operation verifies final cardinality after construction.

## 15. Public API

Application CommonJS and ESM export exactly the selector, local validator, contextual validator, and dedicated health. Core public exports are unchanged.

## 16. Health Integration

Dedicated health covers multiple, empty and permuted selections, canonical ordering, duplicate and missing rejection, deep immutability, input preservation, exact membership, and an empty forbidden-responsibility set. It is included in the existing aggregate test runner.

## 17. Test Coverage

Focused suites cover one/partial/all/empty selection, permutation invariance, exact value preservation, cardinality, invalid Store/refs/IDs, duplicate/missing/ambiguous IDs, extra properties, mutation isolation, deep freeze, boundary exclusions, CommonJS/ESM API, and health. E-24, E-26, Evidence, EvidenceStore, Core aggregate, overall health, and governance regressions are part of final verification.

## 18. Forbidden Responsibility Review

No Observation, Observation Collection/Store, Measurement, Contribution, Knowledge, Evidence deletion, semantic filtering/grouping/deduplication, confidence calculation, persistence, I/O, Provider/Adapter/LLM, Ledger/Snapshot/Matrix/Coverage update, Requirement satisfaction, or Runtime mutation is present.

## 19. Critical Review

Independent review checked silent missing IDs, duplicates, non-exact matching, input-order dependence, mutations, confidence/provenance changes, extra properties, empty semantics, Observation leakage, excessive APIs, and regressions. It found and corrected a stale architecture-map extractor marker and strengthened post-selection mutation isolation. Outcome: **CONFORMING**.

## 20. Self Review

The implementation conforms to E-27, keeps dependency direction inward, limits exports to Application, preserves Core contracts, and performs no staging, commit, push, fast-forward, milestone integration, or other-worktree mutation.

## 21. Residual Risks

The legacy Core Evidence validator accepts truthy non-string IDs and the Store validator does not independently reject duplicate IDs or enforce statistics coherence. Selection adds the required Application-level string-reference and ambiguity guarantees without changing frozen Core behavior. Locale ordering follows the already implemented E-26 convention.

## 22. Next Gate

`0100E-29 — Post-Registered-Evidence-Selection Downstream Architecture Review` is the sole PLANNED gate. It is review-only and does not automatically authorize Observation or any other semantic consumer.

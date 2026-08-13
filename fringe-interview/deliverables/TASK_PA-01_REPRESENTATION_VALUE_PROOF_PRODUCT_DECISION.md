# PA-01 — Representation Value Proof Product Decision

## 1. Authority inspected
Read in full: `docs/20-product/PRODUCT_VISION.md`, `PRODUCT_PRINCIPLES.md`, `PRODUCT_DECISIONS.md`, `REPRESENTATION_MODEL.md`, `RECIPES.md`, `PRIVATE_BETA_USER_EXPERIENCE.md`, `PLATFORM_EVOLUTION.md`, and `VALIDATION_STRATEGY.md`. Relevant `docs/00-continuity/` material was inspected only for context.

## 2. Existing decisions reused
PA-01 reuses rather than duplicates: PD-003 Representation first; PD-005/006 target observability and minimum intrusiveness; PD-013 progressive reporting; PD-014 Professional Perception first; PD-015 credibility assets; PD-016 target-relative interpretation; PD-020 product-led sequencing; P-03 evidence before interpretation; P-04 non-observed is not absent; P-06 no person score; P-09 progressive explanation; P-13 observation before evaluation; P-14 perspective does not rewrite knowledge. `REPRESENTATION_MODEL.md` already defines explainable/traceable Representation, evidence authority, separation of coverage/confidence/value, and Professional Perception.

## 3. Decisions added
Three minimal canonical decisions were added to `PRODUCT_DECISIONS.md`:

- **PD-021 — Representation Value Proof:** the Beta must expose, through progressive disclosure, what emerges, why IMAGO sees it, what remains insufficiently observed, and target relation. It explicitly separates internal traceability from user-facing explainability and preserves non-observed != absent / no person score.
- **PD-022 — Dynamic characterization first:** Beta characterization is a dynamic derived view of existing canonical structures; no new persistent characterization object, lifecycle, versioning or Core contract is authorized by PA-01.
- **PD-023 — Representation-to-target comparison is not score-first:** the primary comparison communicates support, distances, insufficient observation and meaningful contradiction rather than collapsing to a synthetic fit/match/person score.

## 4. Decisions consolidated
The candidate decisions were not already fully canonical as one implementable product boundary. Existing principles established the direction, but did not explicitly require the four-part Representation Value Proof, did not decide dynamic characterization before first-class persistence, and did not explicitly define the minimum semantics of Representation-to-Target comparison. PA-01 therefore adds only these missing boundaries while referring to existing principles instead of restating their full content.

No change to `REPRESENTATION_MODEL.md` was necessary: its current semantics are compatible and sufficient. No change to `PRIVATE_BETA_USER_EXPERIENCE.md` was necessary: its progressive report behavior is already aligned. No `README.md` update was structurally required.

## 5. Decisions deliberately NOT added
PA-01 does not authorize or reject future product ideas outside its scope. It deliberately adds no Talent Passport, Digital Twin, Professional View, Evidence Challenges, Career Exploration, psychometrics, B2B recruiter workflow, LinkedIn/ATS/HRIS integration, billing/pricing, new confidence score, voice requirement, new persistence layer, or first-class persistent Emergent Characterization.

It also does not define UI layout, rendering, technical trace graphs, contract IDs, recipe presentation, new dimensions, or a new scoring model.

## 6. Exact files changed
- `docs/20-product/PRODUCT_DECISIONS.md`
- `deliverables/TASK_PA-01_REPRESENTATION_VALUE_PROOF_PRODUCT_DECISION.md`
- `deliverables/TASK_PA-01_MANIFEST.txt`

## 7. Code/contracts/tests confirmation
Confirmed: no source code, contracts, tests, Beta implementation, canonical roadmap, continuity file, `REPRESENTATION_MODEL.md`, or Product Authority file other than `PRODUCT_DECISIONS.md` was modified.

## 8. Remaining open product questions
- Whether Beta evidence later justifies a first-class non-persistent or persistent/versioned Emergent Characterization.
- The exact user-facing vocabulary and interaction for observed, derived/inferred, insufficiently observed and contradictory evidence; PA-01 defines semantics, not UI copy/design.
- The minimum evidence-selection/projection rules needed to explain each visible conclusion without exposing technical internals.
- Whether and which secondary contextual metrics are useful without competing with the Representation-first primary outcome.
- The later persistence/snapshot boundary for Professional Identity remains outside PA-01.

## Verification
- Full Product Authority read: PASS.
- Existing-equivalent decision check: PASS; consolidation preferred over duplication.
- `git diff --check`: PASS.
- Trailing-whitespace check: PASS.
- Manifest ↔ changed files: PASS.
- Overlay ↔ manifest: PASS after overlay generation.
- Commit: NOT RUN.
- Push: NOT RUN.

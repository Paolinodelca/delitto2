# FHT-RS02 — Canonical Professional Representation Synthesis Boundary

## Verdict
**B — IMPLEMENTATION COMPLETE; CONTROLLED LIVE VERIFICATION REQUIRED**

## Implementation
- Added a bounded synthesis input built only from authorized `decision_accountability` / `quantified_outcome` semantic material. It preserves semantic state, normalized facts, quantitative value/unit, context, contribution/causality boundary, limitations, confidence/inference support when available, Evidence refs and Knowledge provenance. Target material is separate and currently null unless independently authorized.
- Added structured Professional Representation claims separating `professionalClaim`, `explanation`, semantic support refs, Evidence refs, epistemic state, limitations, target relation and provenance.
- DA + QO can be grouped into one bounded multi-Knowledge claim instead of one transcript-derived paragraph per Evidence item.
- Added a new bounded synthesis prompt and Groq adapter. The legacy Professional Perception prompt/model path is not reused. Model realization is optional and is not semantic authority.
- Added deterministic reconciliation: fixed claim IDs/contracts are authoritative; malformed output, unsupported IDs, fabricated numbers, technical-unit leakage and protected amplification semantics are rejected. Rejection never triggers a second free semantic inference.
- Added deterministic fail-closed fallback from the same synthesis input. Provider failure or reconciliation failure returns the bounded deterministic Representation.
- Migrated Private Beta UI to prefer the new canonical `professionalRepresentation`; legacy Value Proof / `perceptionV2` remain compatibility fallbacks.
- Externalized new synthesis/presentation copy in IT/EN resources.

## QO / Marco acceptance
The deterministic controlled fixture produces a combined DA+QO Professional Representation with localized `circa 20%`, preserves contribution-only causality, does not use the raw accepted answer as the professional claim, and keeps supporting Evidence distinct from claim/explanation. `20percent` is absent.

A live-shape defect was also corrected at the existing QO executor boundary: the executor now emits the canonical `approximate` boolean/direction shape expected by the QO Observation builder, so `circa` can survive into synthesis without changing QO semantic authority.

## LLM authority envelope
The model receives only canonical synthesis input plus a fixed deterministic claim contract. It may rewrite/group wording. It cannot create Evidence, Knowledge, dimensions, target requirements, magnitude/unit, confidence, ownership, causality, weaknesses, scores or stable traits. Semantic correctness does not depend on provider availability.

## Tests
PASS:
- FHT-RS02 focused deterministic synthesis/reconciliation/fallback/UI tests;
- FHT-RS01;
- FHT-AS01 adaptive grounding + corrective lifecycle;
- FHT-AI01;
- FHT-KC01;
- staged Private Beta journey;
- FHT-DR02 final Representation + target authority;
- FHT-PA01;
- Representation Value Proof regression;
- full `fringe_health_check.js` — **All health checks passed.**

## Residual limitations
- The current vertical slice intentionally supports only DA and QO.
- Model realization is an optional seam; the Private Beta path defaults safely to deterministic realization unless explicitly enabled/injected. Controlled live verification is still required before closing the task.
- The bounded deterministic fallback preserves authorized DA/QO meaning but is intentionally less expressive than a validated model realization.

No Product Authority documents changed. No Knowledge architecture, DA/QO semantic policy, AS01 authority, or Value Proof compatibility implementation was redesigned.

No commit. No push.

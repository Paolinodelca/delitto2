# TASK ME-02 — Representation Value Proof Projection

## Final verdict

**B — REPRESENTATION VALUE PROOF IMPLEMENTED WITH NON-BLOCKING GAPS**

## Canonical structures consumed

ME-02 was implemented repository-first after reading `docs/20-product/` in full and pertinent continuity. The implementation consumes the existing Professional Perception/report projection produced by the staged canonical journey: `perceptionV2.whoEmerges`, `perceptionV2.credibilityAssets`, `perceptionV2.targetDistance`, `visibleSignals`, `underVisibleSignals`, `perceptionGap`, `emergingImage.roleTarget`, and the declared target role.

Repository inspection also confirmed the existing Core Evidence Store, Observation/Measurement, Dimension Contribution, Knowledge Ledger/Snapshot, PersonKnowledgeMatrix and Coverage implementations. Those Core structures are not currently carried into the live Beta Professional Perception report path. ME-02 therefore does not create a parallel evidence model or falsely claim raw-evidence traceability that the current pipeline does not provide.

## Dynamic projection design

`buildRepresentationValueProofProjection` is a small immutable, non-persistent downstream view. It is explicitly marked `persistent:false` and `sourceOfTruth:false`. It does not mutate Professional Perception or canonical Knowledge/Evidence and introduces no lifecycle, persistence, versioned characterization entity or Core contract.

The projection yields at most four claims; the current strategy normally produces three: what emerges, credibility assets, and limited target relation/distance.

## Visible claim structure

Each claim contains:

- concise existing Professional Perception narrative (`claim`);
- `supportingEvidence`: only explicit existing derived signal/gap labels;
- restrained `epistemicStatus` (`derived` or `insufficiently_observed`);
- qualitative `supportStrength`, never a new numeric confidence;
- `uncertainty`: existing under-visible signals;
- optional limited `targetRelation`;
- internal `traceability` source paths for deterministic tests.

Internal source paths are not rendered to the tester.

## Evidence selection strategy

Evidence is selected only from explicit Professional Perception relationships already present in the report: `visibleSignals` support emergence/credibility; `perceptionGap` and `underVisibleSignals` support insufficient-observation/target-distance claims. Selection is deduplicated and capped at three evidence items per claim.

If explicit support is absent, the projection returns no fabricated evidence and marks support as limited. It does not perform keyword-based post-hoc matching or generate plausible evidence with an LLM.

## Observed / derived / insufficient handling

The current live report inputs consumed by ME-02 are themselves downstream/derived Professional Perception signals, so ME-02 truthfully labels them `derived`; it does not relabel them as direct observation. Existing under-visible/gap data is represented as `insufficiently_observed`. This preserves **NOT OBSERVED != ABSENT**.

Direct `observed` status is deliberately not emitted unless a future canonical report input explicitly carries that provenance.

## Contradictions

The current Professional Perception output does not expose a claim-specific contradiction relation. ME-02 does not invent one. Existing `perceptionGap`/under-visible tension is retained; a new contradiction engine is out of scope.

## Target relation

The projection uses only the existing target role and target-distance/perception-gap material. It provides contextual distance/insufficient-observation information and never introduces a primary Match Score, Job Fit score or person score. The richer target-relative view remains ME-03 scope.

## Report integration / progressive disclosure

The canonical `/private-beta` report/feedback phase now prefers the Value Proof projection when present. Level 1 shows only the 2–4 claims. Each claim uses native `<details>` progressive disclosure for “Why”, evidence, observation/uncertainty and limited target relation. The historical fallback Professional Perception rendering remains available if the projection is absent.

## Localization compliance

All new visible labels/copy are externalized in the existing `config/private_beta_ui.it.json` and `.en.json`. No parallel localization framework was introduced. Tests verify that the renderer source does not contain the Italian “Perché IMAGO vede questo?” string and that internal traceability refs are not rendered.

## Tests executed

PASS:

- `test_representation_value_proof_projection.js` — dynamic immutable projection, 2–4 cap, real source refs, no invented evidence on sparse input, insufficient-observation semantics, target relation, no score, UI progressive disclosure/localization.
- M1-01 assessment / M1-02 verification / M1-03 safe errors.
- M1-04 onboarding / M1-05 privacy-consent / M1-06 feedback / M1-07 logging.
- BI-01 Beta Journey Integration.
- ME-01B Real Beta UI Journey Integration.
- ME-01D staged UI journey.
- Beta Runtime Session Integration.
- Beta Session Core and hardening.
- Builder Beta Readiness Regression.
- Evidence Store health/test.
- PersonKnowledgeMatrix.
- Knowledge Coverage.
- Parser mock runner.
- syntax checks for new/modified JS.
- `fringe_health_check.js` → **All health checks passed.**

The baseline does not contain a separately named ME-01C test script; its diagnostic behavior remains embedded in the staged adapter and covered by the downstream staged/UI regressions.

## Live smoke evidence

The authorized baseline records the post-ME-01D local smoke test as **LIVE SMOKE TEST PASS** with real `/private-beta`, local `GROQ_API_KEY`, live Groq, real CV, staged one-answer-at-a-time Runtime, completed interview, Professional Perception and experience completion. This evidence is now recorded in readiness continuity.

The Builder environment used for ME-02 has no `GROQ_API_KEY`; no secret was simulated. After applying the overlay locally, run the existing Private Beta server with the real key and verify:

`staged interview → report → 2–4 claims → Why/evidence → insufficient observation where applicable → limited target relation → feedback → closure`.

## Limitations deliberately not solved

- Raw Core Evidence Store / Observation / Measurement / Knowledge Ledger / PersonKnowledgeMatrix are not wired into claim-specific live report inputs; ME-02 refuses to fabricate that relationship.
- No new contradiction engine.
- No ME-03 full target-relative view.
- No ME-04 Evidence Trust UX validation.
- No Professional Identity snapshot/persistence.
- No voice, Tutor expansion, analytics, new confidence model or Emergent Characterization object.

## Files changed

See `TASK_ME-02_MANIFEST.txt`.

## Exact Value Proof status

The real Beta report can now expose **what emerges + why IMAGO sees it + what is insufficiently observed + a limited meaningful relation to target**, using only existing report-level canonical data and without a primary score. The non-blocking limitation is depth of evidence provenance: current live reporting does not yet propagate raw Core Evidence/Knowledge objects into claim-specific output.

## Recommended next task

Perform the local post-overlay live smoke test. If it passes, proceed to **ME-03 — Target-relative Representation View**; do not expand ME-02 into an evidence-relevance engine.

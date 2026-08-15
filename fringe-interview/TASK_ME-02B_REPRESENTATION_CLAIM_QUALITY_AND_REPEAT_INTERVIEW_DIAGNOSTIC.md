# TASK ME-02B — Representation Claim Quality Refinement + Repeat Interview Diagnostic

## Verdicts

**B — CLAIM QUALITY IMPROVED WITH NON-BLOCKING GAPS**

**REPEAT INTERVIEW: EXISTING VARIATION CAPABILITY NOT YET CONSUMED**

## 1. Why ME-02 claims were repetitive

ME-02 independently projected `whoEmerges`, `credibilityAssets` and `targetDistance`. Both first claims consumed the same first three `professionalPerception.visibleSignals`, so semantically adjacent narratives could become separate claims with effectively identical evidence. There was no semantic distinctness gate and no evidence allocation across claims.

ME-02B adds bounded downstream semantic consolidation. A candidate claim is retained only when materially distinct from already selected claims; evidence already used by a preceding main claim is not blindly reused for another equivalent claim. Fewer than four claims are intentionally allowed.

## 2. Why optics became simply "insufficiently observed"

The ME-02 projection consumed `underVisibleSignals` as a terminal epistemic classification. At projection time it did not inspect parser-level candidate context, although that context already exists upstream in the live session. Therefore an interview/report under-visible signal such as optics could erase the distinction between "not deeply characterized in interview" and "unsupported by professional history".

ME-02B passes the already available canonical `candidateProfile` into the downstream projection. It does not read raw CV again and does not create a new evidence model.

## 3. Existing information used for contextual interpretation

Only existing parser/report fields are consumed:

- `professionalPerception.visibleSignals`, `underVisibleSignals`, `perceptionGap`, `perceptionV2`;
- `candidateProfile.domainSignals`;
- `candidateProfile.skills.technical`;
- `candidateProfile.education`;
- `candidateProfile.evidence.evidenceRichAreas`;
- `candidateProfile.experienceSignals.yearsDetected`;
- existing target role / target-distance narrative.

A professional-history context is treated as meaningful only when the domain signal converges across at least two distinct candidate-profile source families. Duration is added as context only after that multi-source condition is met. No arbitrary numerical confidence or weighting was introduced.

## 4. Claim deduplication

ME-02B normalizes claim text and uses a small token-overlap distinctness check solely inside the non-persistent projection. It does not alter Core semantics. Semantically overlapping claims are consolidated by omission; the system prefers two useful claims to multiple paraphrases.

Evidence is normalized/deduplicated and allocated so equivalent claims do not automatically repeat the same list.

## 5. Professional-history support vs interview characterization

An under-visible domain can now have one of two bounded states:

- `insufficiently_observed`: no meaningful convergent professional-history context is available to the projection;
- `historically_supported_partially_characterized`: multiple existing candidate-profile source families support the domain, while exact depth/specialization remains uncharacterized.

This preserves both rules: **NOT DIRECTLY TESTED IN INTERVIEW != NOT OBSERVED** and **NOT FULLY CHARACTERIZED != UNSUPPORTED**. It does not certify expertise or mastery.

The deterministic optics regression includes technical education, approximately eight years in optics-focused R&D, multiple optics-related candidate-profile signals, and no deep interview characterization. The output preserves historical support and the remaining characterization gap.

## 6. Non-tautological "Why"

The UI now introduces the evidence list with localized relationship copy explaining that the reading derives from the convergence of the displayed signals. If no specific evidence can be shown, the UI explicitly keeps the reading cautious rather than fabricating support.

A claim cannot be repeated as its own supporting evidence; target-gap evidence equal to the claim is filtered. Contextual uncertainty shows the distinct source facts that support professional history.

All new visible copy is externalized in the existing IT/EN `private_beta_ui` resources.

## 7. Deep provenance limitation

Deep claim → Core Evidence/Observation/Measurement/Knowledge provenance is still not propagated claim-by-claim into the live Professional Perception report. ME-02B therefore uses only traceable Professional Perception and parser-profile context already available at projection time. It does not fabricate a raw evidence chain or mutate canonical Evidence/Knowledge.

A future provenance enhancement may make the explanation more precise, but this is a non-blocking gap for the current Beta claim-quality refinement.

## 8. Why successive interviews repeated questions

Repository inspection confirms deterministic selection for identical inputs. `runFringeInterviewMVP` calls `buildInterviewQuestionSet` without `recentQuestionKeys` or `recentQuestionHistory`; therefore successive independent sessions start with no knowledge of previously used questions.

The question-selection layer itself already supports recent-question avoidance. `buildInterviewQuestionSet`, `deriveQuestionSelectionStrategy` and `rankStructuredQuestions` accept recent question keys/history and alter ranking/rationale accordingly. A deterministic diagnostic proves that identical inputs rank identically, while supplying recent keys/history changes the ranking.

## 9. Existing variation capabilities

The repository already contains:

- multiple structured questions/question families;
- follow-up packs;
- contextual ranking;
- recent-question-key avoidance;
- recent-question-history context including category/signals;
- adaptive follow-up generation/selection;
- gap-driven question generation.

The missing piece is not question variety itself. Previous-session question history is not available to the top-level MVP/session planning call, so the existing avoidance mechanism cannot operate across independent simulations.

## 10. Future progressive acquisition architecture

The existing Knowledge Coverage, Knowledge Opportunity and Knowledge Acquisition layers leave the architecture open to a future loop from current unknowns/coverage to useful next acquisition and new evidence. ME-02B found no need to redesign those contracts.

That loop is not currently wired to cross-session Interview planning, and ME-02B deliberately does not implement it.

## 11. Is a separate repeat-interview task recommended?

Yes. A separate, explicitly authorized task should connect bounded previous-session question history to the already existing `recentQuestionKeys` / `recentQuestionHistory` inputs and define the minimum session-history boundary. It should reuse the existing planner/ranker rather than add random shuffling or a second Interview Planner.

## 12. Tests executed

PASS:

- `test_me02b_representation_claim_quality.js`;
- `test_me02b_repeat_interview_diagnostic.js`;
- ME-02 Representation Value Proof regression;
- staged Beta application/UI journey;
- ME-01B real Beta UI integration;
- BI-01;
- M1-01…M1-07 pertinent tests;
- Beta Runtime Session Integration;
- Beta Session Core + hardening;
- Evidence Store;
- Measurement/Observation foundation;
- Knowledge Ledger;
- PersonKnowledgeMatrix;
- Knowledge Coverage;
- parser mock;
- Builder Beta Readiness Regression;
- `node --check` for changed JS files;
- `fringe_health_check.js`: **All health checks passed.**

The authorized live ME-01D/ME-02 smoke-test evidence remains the live-provider evidence. No secret was added or simulated in Builder.

## 13. Files changed

See `TASK_ME-02B_MANIFEST.txt`.

## 14. Remaining product limitations

- Deep claim-specific Core Evidence/Knowledge provenance is not yet propagated to the live report.
- Contextual historical support is deliberately bounded to existing parser-profile structure and cannot reconstruct detail absent from those structures.
- Cross-session question history is not supplied to Interview planning.
- No persistent interview-history architecture was introduced.
- No full ME-03 target-relative view was implemented.

## 15. Recommended next task

Before expanding Representation further, authorize a focused **Repeat Interview Variation Integration** task: pass bounded previous-session question history into the existing ranking/selection capability, prove materially different but strategically relevant repeat sessions, and avoid randomization as a substitute for acquisition strategy.

ME-03 can remain separate from this operational repeat-interview improvement.

# FHT-03 Corrective Rework Report

## Status

**IMPLEMENTATION COMPLETE; REQUIRED LIVE PRODUCTION VERIFICATION NOT EXECUTABLE IN THIS isolated handoff environment.**

No FHT-04 was opened. No commit or push was performed.

The previous FHT-03 PASS was reopened because the Marco Bianchi production diagnostic demonstrated that prompt-only guardrails were not deterministic enforcement: bounded project-level no-direct-report evidence was still amplified into global person claims, and a contextual Six Sigma methodology was still promoted into a target gap / missing skill / risk.

## Repository-first finding

The existing parser application boundary is the narrowest suitable enforcement point. `runCandidateProfileParser` and `runJobFitAnalysis` already sit immediately after probabilistic LLM interpretation and before downstream consumption. Existing canonical authority is sufficient: bounded/non-observed evidence must not become absence/weakness, and target gap authority comes from `RoleProfile.requirements` rather than `RoleProfile.skills` alone. No new Core state, interpretation engine, Representation architecture, or semantic authority was introduced.

## Deterministic enforcement introduced

A new narrow parser semantic-integrity normalizer is applied after validated model output:

1. **CandidateProfile bounded leadership** — when source evidence explicitly denies direct/hierarchical people responsibility only in a bounded project/experience/context, model-emitted global `peopleLeadership = none|weak` and `leadershipExposure = none|limited` are normalized to `unclear`; global absence-style leadership risks caused by that bounded evidence are removed; an ambiguity records that global direct people leadership remains unestablished.
2. **JobFit target requirement authority** — gaps may propagate only when their `roleItem` has semantic membership in `requirements.mustHave`, `requirements.preferred`, or `requirements.bonus`. Items that exist only under `RoleProfile.skills.*` cannot propagate as gap/missingSkill/weakSignal/risk merely from that contextual skill authority.
3. **HELP preserved** — `cvImprovementHints` and other HELP surfaces are not stripped by the target-requirement filter, so contextual Six Sigma guidance remains possible.
4. **Representation referent fix preserved** — the previously implemented referent-preservation path was not changed.

The enforcement is generic; it does not hardcode Marco Bianchi or Six Sigma.

## Adversarial regression

Added `scripts/test_fht03_corrective_semantic_enforcement.js`. It deliberately simulates an LLM that violates both invariants:

- bounded project evidence -> `peopleLeadership: none`, `leadershipExposure: limited`, global people-management risk;
- skills-only Six Sigma -> missing gap, missingSkill, weakSignal, certification risk.

The test verifies those violations cannot propagate, while a real requirement (`team leadership`) and Six Sigma HELP remain available.

## Verification executed

PASS:

- `node scripts/test_fht03_corrective_semantic_enforcement.js`
- `node scripts/test_fht03_semantic_integrity.js`
- `node scripts/test_representation_value_proof_projection.js`
- `node scripts/test_parser_prompts.js`
- `node scripts/fringe_health_check.js` -> `All health checks passed.`

The parser prompt test created local `tmp/parser-debug` output during verification; it is **not included** in the overlay/deliverables.

## Live Marco production verification

The repository uses the configured Groq provider through `runGroqParserModel` / `runGroqChatCompletion`. This isolated handoff environment contains no Groq credential/environment configuration, so the mandatory provider-real Marco diagnostic cannot be truthfully executed here. The canonical model/provider was not changed and no substitute provider was used.

Therefore the requested verdict **A — FHT-03 CORRECTIVE REWORK IMPLEMENTED; LIVE SEMANTIC INTEGRITY VERIFIED** is not claimed yet. The repository changes and deterministic regressions are ready for the mandatory live Marco verification in the user's configured local environment. This is an execution-environment limitation, **not** a missing-canonical-authority blocker; consequently verdict B would also be inaccurate.

## Residual limitation

The deterministic boundary intentionally uses existing parser structures and conservative semantic matching. It prevents the demonstrated unauthorized propagation without creating a general interpretation engine. Production live verification remains the final gate before FHT-03 can receive verdict A.

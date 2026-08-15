# TASK ME-02C — Repeat Interview Variation Integration

## Final verdict

**B — REPEAT INTERVIEW VARIATION INTEGRATED WITH NON-BLOCKING GAPS**

ME-02C consumes the existing recent-question avoidance/ranking capability rather than creating a new planner or randomizer. The integration is deterministic and Beta-specific. A live two-simulation smoke test remains required because the Builder environment does not provide `GROQ_API_KEY`.

## Repository-first inspection

All files under `docs/20-product/` were read in full before implementation and pertinent `docs/00-continuity/` was inspected. No Product Authority contradiction was found and no Product Authority file was changed.

The supplied ZIP places project files at archive root rather than under the documented `repository/` wrapper; the root nevertheless contains the expected `docs/`, `src/`, `scripts/`, `config/`, `fixtures/`, `bin/` and `tools/` project structure and was treated as the supplied repository content.

ME-02B's diagnosis was confirmed: `buildInterviewQuestionSet`, `deriveQuestionSelectionStrategy` and `rankStructuredQuestions` already accept `recentQuestionKeys` / `recentQuestionHistory`, prefer alternatives where available and preserve relevance-driven fallback. The missing link was upstream: `runFringeInterviewMVP` and the staged Beta entry path did not carry prior-session history into question selection.

## 1. Where recent-question history is stored

For the Private Beta only, recent-question history is held by `privateBetaUiServer` in a process-local `Map`. It is associated with an opaque Beta repeat-context ID carried in an `HttpOnly; SameSite=Lax` cookie scoped to `/private-beta`.

The stored records contain only the minimum technical question metadata required by existing ranking semantics:

- stable/canonical question `key` where available;
- category/family context;
- expected-signal labels already attached to the question.

The store is bounded to the latest 24 unique question identities for the context.

## 2. Why this boundary was selected

The current Beta has no canonical persistent Professional Identity boundary that should own cross-session interview history. Attaching this feature to Professional Identity, Knowledge or Representation would invent lifecycle semantics explicitly forbidden by ME-02C.

The UI server already owns the process-local staged-session store required by ME-01D. A parallel, minimal process-local technical history at that same Beta application boundary is therefore the narrowest mechanism that:

- survives one simulation long enough to affect the immediately successive simulation;
- requires no database or persistence architecture;
- avoids changing Core contracts;
- isolates unrelated browser contexts;
- can be replaced later by an authorized canonical cross-session model.

## 3. Persistence lifecycle

The mechanism is **not persistent across process restart**. It exists only within the current Beta server process and browser repeat-context cookie lifecycle.

This is deliberate. ME-02C does not claim durable candidate memory, Professional Identity ownership, Knowledge persistence or Representation persistence.

## 4. Isolation of unrelated sessions

A browser without a repeat-context cookie receives a new opaque context ID. Successive simulations presenting that cookie reuse only that context's recent-question history. A different browser/context receives a different ID and an empty history.

Deterministic tests prove that two unrelated contexts do not inherit each other's question history.

This is technical Beta scoping, not user identity/authentication.

## 5. Existing capability consumed

ME-02C forwards existing history semantics through:

`privateBetaUiServer`
→ `prepareStagedPrivateBetaJourney`
→ `runFringeInterviewMVPSession`
→ `runFringeInterviewMVP`
→ `buildInterviewQuestionSet`
→ existing `deriveQuestionSelectionStrategy` / `rankStructuredQuestions` behavior.

No duplicate ranking algorithm was added.

## 6. What is passed into Interview planning/selection

The staged preparation receives:

- `recentQuestionKeys`: stable keys extracted from prior successfully answered Runtime questions;
- `recentQuestionHistory`: minimal records `{ key, category, signals }`.

`runFringeInterviewMVP` forwards those unchanged to `buildInterviewQuestionSet`, where the existing canonical selection logic consumes them.

No random seed, random shuffle or new weighting system was introduced.

## 7. Which questions become history

Only a question that was actually the authoritative Runtime `currentStep` and for which `advanceInterviewRuntime` successfully accepted an answer becomes eligible for recent history.

Planned but unseen questions are not recorded. Merely rendering a planned question without a successful answer does not add it through this integration.

Question identity is taken from the Runtime payload's existing canonical identity fields (`questionKey`, `key`, `resolvedQuestionKey`, `structuredQuestionKey`, `familyKey`, `blockType`, with step type only as final fallback), rather than comparing rendered natural-language strings.

## 8. Interrupted sessions

History is merged after each successfully answered question, not only at final session closure. Therefore an interrupted session can contribute the questions that were genuinely answered before interruption, while unseen/planned questions do not become consumed.

No new interruption lifecycle was introduced. Existing M1/Runtime interruption semantics remain unchanged.

## 9. Deterministic variation

Variation remains deterministic. With the same candidate/target and **no history**, existing ranking produces the same baseline. When recent history is supplied, existing ranking/selection penalizes or avoids recent eligible questions where alternatives exist.

The ME-02C test proves causality:

`previous question history → existing rank/selection capability → changed eligible ranking`.

There is no `Math.random`-based solution in the modified MVP path.

## 10. Legitimate repetition

ME-02C does not require 100% uniqueness. A question can legitimately recur when existing canonical behavior determines that:

- alternatives are exhausted;
- relevance remains dominant;
- a family/dimension remains necessary;
- existing fallback semantics permit reuse;
- opening/adaptive semantics are not represented as replaceable alternatives.

The task removes unnecessary repetition caused by immediate session amnesia; it does not redefine interview strategy.

## 11. Personal data retained for variation

No CV text, JD text, candidate answer, model prompt, hidden reasoning, provider response or secret is retained by the new recent-question store.

The store contains only opaque context ID plus minimal question identity/category/signal metadata. Tests inspect the store and reject answer/content fields.

## 12. Deliberately unimplemented future capabilities

ME-02C does not implement:

- persistent cross-session Professional Identity memory;
- general Representation persistence;
- PersonKnowledgeMatrix/Knowledge persistence changes;
- progressive cross-session Knowledge Acquisition planning;
- a new Interview Planner or question-generation engine;
- random question shuffling;
- Professional Identity snapshot;
- ME-03 Target-relative Representation;
- voice or broader UI redesign.

The future architecture remains free to evolve toward Representation → Coverage/unknowns → next observation → acquisition strategy → probe → evidence → updated Representation. ME-02C remembers primarily **what was recently asked**, not **what IMAGO should learn next across all sessions**.

## 13. Tests executed

PASS:

- `scripts/test_me02c_repeat_interview_variation.js` — first-run baseline, deterministic causal variation, process-context handoff, isolation and data minimization;
- `scripts/test_me02b_repeat_interview_diagnostic.js` — existing variation capability remains observable and is now consumed;
- `scripts/test_me02b_representation_claim_quality.js` — ME-02B claim-quality regression;
- `scripts/test_staged_private_beta_journey.js` — authoritative Runtime question history plus staged handoff;
- `scripts/test_staged_private_beta_ui_journey.js`;
- `scripts/test_beta_journey_integration.js`;
- `scripts/test_beta_runtime_session_integration.js`;
- `scripts/test_beta_session_core.js`;
- `scripts/test_beta_session_core_hardening.js`;
- M1-04 onboarding;
- M1-05 privacy/consent;
- M1-06 feedback;
- M1-07 operational logging;
- M1-03 safe application error handling;
- M1-02 user journey verification;
- `scripts/test_builder_beta_readiness_regression.js`;
- `scripts/test_parser_runner_mock.js`;
- `scripts/fringe_health_check.js` — **All health checks passed.**

Syntax checks were run on all modified JavaScript files. Forbidden-scope inspection found no new planner, randomization, persistence, voice, ME-03 or Core-contract implementation.

## 14. Files changed

- `src/app/privateBetaUiServer.js`
- `src/app/privateBetaStagedInterviewJourney.js`
- `src/app/runFringeInterviewMVPSession.js`
- `src/app/runFringeInterviewMVP.js`
- `scripts/test_me02c_repeat_interview_variation.js`
- `scripts/test_me02b_repeat_interview_diagnostic.js`
- `scripts/test_staged_private_beta_journey.js`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_ME-02C_REPEAT_INTERVIEW_VARIATION_INTEGRATION.md`
- `TASK_ME-02C_MANIFEST.txt`

No UI renderer/localization resource was modified because ME-02C requires no new user-facing copy.

## 15. Live smoke-test status

**NOT EXECUTED IN BUILDER — live provider secret unavailable.**

No secret was simulated or inserted. Deterministic application/integration regressions are green.

### Precise local post-overlay smoke test

1. Apply the ME-02C overlay to the same local repository/environment where the previous real Groq staged smoke test passed.
2. Start the normal Private Beta server with the existing local `GROQ_API_KEY` environment configuration.
3. Open `/private-beta` in one browser context.
4. **Simulation A:** use the same real CV and same target used for the previous Beta smoke test; complete the interview and record the actual questions shown in order.
5. Complete report/feedback/closure normally.
6. Without clearing cookies or restarting the Beta server, start **Simulation B** from `/private-beta` in the same browser context with the same candidate and same target.
7. Record the actual questions shown in order.
8. Verify that the complete questionnaire is not reproduced when alternatives exist. Some questions/dimensions may legitimately recur; 100% uniqueness is not expected.
9. Verify adaptive follow-ups remain relevant to the current answers rather than being varied artificially.
10. Complete Simulation B and inspect the ME-02B Representation Value Proof for claim quality, historical-context nuance and non-tautological Why/evidence.
11. Optional isolation check: open a fresh private/incognito browser context against the same running server; its first simulation should behave as a no-history context rather than inheriting the first browser's recent-question memory.
12. Optional lifecycle check: restart the server and confirm the temporary repeat-question memory is gone; this is expected for ME-02C.

## 16. Remaining limitations

- Recent-question memory is process-local and Beta-specific; server restart clears it.
- The opaque browser context is not authentication or canonical person identity.
- History tracks stable question metadata, not cross-session knowledge/Representation learning.
- Adaptive generated questions are recorded only to the extent their existing Runtime payload exposes stable identity semantics; ME-02C does not redesign adaptive follow-up identity.
- No live Groq A/B repeat-interview run was possible in Builder.
- Existing Professional Identity snapshot and voice gaps remain outside scope.

## 17. Recommended next task

First execute the local Simulation A/B smoke test above. If meaningful variation is confirmed, ME-02C can be considered live-validated and the roadmap can proceed to the next authorized Representation task (for example ME-03) rather than expanding repeat-interview infrastructure.

If the live test still shows substantial avoidable repetition, diagnose the exact repeated question keys/families against the existing ranking output before authorizing any broader cross-session strategy. Do not add randomization as a fallback.

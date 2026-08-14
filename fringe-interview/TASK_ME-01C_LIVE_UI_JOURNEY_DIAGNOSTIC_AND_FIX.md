# TASK ME-01C — Live UI Journey Diagnostic and Fix

## 1. Final verdict

**C — LIVE UI INTERVIEW JOURNEY STILL BLOCKED**

The repository proves that the Interview Runtime itself is stepwise and exposes a real `currentStep` before any answer. The `/private-beta` integration introduced by ME-01B does not expose that state. Instead, it accepts a textarea containing a pre-baked answer list and invokes BI-01 once. Consequently the tester is asked for answers without seeing the corresponding authoritative Runtime questions.

ME-01C did not create a second Interview orchestrator or replace the observability-driven Runtime with a static questionnaire. The minimum safe change implemented is diagnostic instrumentation at the existing UI model-adapter boundary, plus deterministic tests proving the exact integration mismatch and privacy-safe diagnostics. A genuinely live Question→Answer cycle requires a staged application boundary over the existing Runtime and is the single remaining blocker.

## 2. Exact technical root cause of the observed SERVICE_UNAVAILABLE

The previously observed safe result `SERVICE_UNAVAILABLE` is **not caused by the absence of the UI question loop**.

Repository evidence shows:

- `runPrivateBetaUserJourney` maps to `SERVICE_UNAVAILABLE` only when the thrown technical message matches provider/network conditions such as 429, HTTP 5xx, timeout, network/fetch failure, or explicit service/provider unavailability.
- An incomplete interview is mapped separately to `JOURNEY_INCOMPLETE` through the `PRIVATE_BETA_E2E_*` / `INTERVIEW_NOT_COMPLETED` family.
- Therefore a missing/insufficient pre-baked answer list cannot by itself produce the observed `SERVICE_UNAVAILABLE`; it produces an incomplete-journey failure.
- The exact provider subtask/failure kind from the historical live run cannot be reconstructed after the fact because M1-03 intentionally discarded raw technical exception details at the safe user-facing boundary.

The supplied live evidence materially establishes that Groq parser, historical full MVP session and Professional Perception all work in the authorized local environment. The failure was therefore a provider/network-like exception occurring during the canonical UI request, but the old safe result does not retain enough information to identify which provider task failed.

ME-01C adds an optional server/test-only `technicalDiagnosticSink` around the **existing** model adapter. It records only:

- boundary = `model_adapter`;
- model task name;
- coarse failure kind (`provider_rate_limit`, `provider_http_5xx`, `provider_timeout`, `provider_network`, or generic adapter error).

It never records raw exception text, prompt content, CV, JD, answers or secrets. This makes the next live reproduction diagnostically conclusive without weakening M1-03.

## 3. Working historical path vs failing BI-01/UI path

### Historical working path

`test_run_fringe_interview_mvp_session.js`
→ `runFringeInterviewMVPSession`
→ `runFringeInterviewMVP`
→ parser/profile/fit
→ Interview Plan / Question Set / Interview Session
→ `createInterviewRuntime`
→ Runtime already exposes `currentStep`
→ loop over supplied synthetic answers
→ `advanceInterviewRuntime` per answer
→ adaptive follow-up / next Runtime step
→ report / Professional Perception.

This path works live according to the supplied local evidence, but its test harness owns the answer loop and can inspect Runtime state between advances.

### ME-01B UI path

`GET /private-beta`
→ one HTML form
→ tester enters CV/JD **and an answer list in advance**
→ one POST `/private-beta/journey`
→ `runPrivateBetaUiJourneyEntryPoint`
→ `runIntegratedPrivateBetaJourney`
→ `runFringeInterviewMVPSession`
→ internal Runtime loop consumes the pre-baked answers
→ BI-01 requires the interview to be complete before returning.

The browser never receives `interviewRuntime.currentStep` before supplying an answer.

## 4. Exact integration mismatch

The mismatch is not an input schema error in Groq/parser. It is the execution granularity at the UI/application boundary:

- Runtime granularity: **prepare → current question → one answer → advance → next/adaptive question → repeat**.
- ME-01B UI/BI-01 granularity: **submit all materials + all anticipated answers once → run complete session → return final result**.

`runFringeInterviewMVPSession` internally performs the correct per-answer `advanceInterviewRuntime` calls, but only after all answer strings have already been collected by the UI. This preserves Runtime semantics internally while failing to expose the intended conversation externally.

## 5. Are missing questions and SERVICE_UNAVAILABLE the same issue?

**No. They are separate symptoms at the same broad UI→application integration area.**

- Missing questions are deterministic and structural: the UI never receives Runtime `currentStep`.
- `SERVICE_UNAVAILABLE` is a provider/network-like technical exception mapped by M1-03. The exact historical provider subtask was not retained.
- The missing question loop would remain a blocker even if every provider call succeeded.
- Conversely, a transient provider failure can occur even after a staged question loop is implemented and must continue to be handled safely.

## 6. Fix implemented in ME-01C

Implemented only the minimum authorized diagnostic correction:

1. added optional privacy-safe technical diagnostics to `runPrivateBetaUiJourneyEntryPoint` around the existing model adapter;
2. added deterministic ME-01C tests proving that the real Runtime has a current question before answers;
3. proved that ME-01B forwards a pre-baked answer array to the batch session runner;
4. proved diagnostics contain no CV/JD/answer/secret/raw error content;
5. updated pertinent Beta readiness continuity.

ME-01C deliberately did **not** implement a second staged Interview orchestrator because the current BI-01 contract returns only after a complete journey. Doing so solely inside the UI would duplicate the authoritative Runtime/session orchestration prohibited by the task.

## 7. Question→answer Runtime behavior after the fix

Underlying Runtime behavior is verified:

- `runFringeInterviewMVP` prepares parser/profile/plan/session;
- `createInterviewRuntime` exposes a non-null `currentStep` before answers;
- `advanceInterviewRuntime` accepts one answer against that current step and can inject an adaptive follow-up / advance to the next canonical step.

However, `/private-beta` still does not expose this cycle across browser requests. Therefore the success criterion is not yet met and verdict C is required.

## 8. Provider / parser / report status

- `config/` is present in this handover.
- Deterministic parser runner: PASS.
- Historical live Groq parser/MVP/Professional Perception: accepted as materially demonstrated by supplied authorized evidence.
- Builder environment: `GROQ_API_KEY` unavailable, so no new live call was made and no secret was simulated.
- BI-01 and ME-01B deterministic integration regressions: PASS.
- Professional Perception/report can be reached by completed deterministic BI-01 tests; full legacy report smoke scripts that depend on absent `tmp/` artifacts remain non-reproducible from a clean handover.

## 9. Localization compliance

No new tester-visible text was introduced. Existing `/private-beta` copy continues to come from `config/private_beta_ui.it.json` / `.en.json` through the existing localization loader.

The new diagnostic vocabulary is server/test-only and never rendered to the tester.

## 10. Privacy / logging compliance

Consent gating remains unchanged and ME-01B regression proves refused consent does not read CV/JD getters.

The new technical diagnostic hook intentionally emits only task name and coarse failure category. Tests inject an exception containing fake CV/answer/secret material and verify none of that content reaches diagnostics.

M1-07 operational logging remains unchanged and minimized.

## 11. Tests executed

### PASS

- `scripts/test_live_ui_journey_diagnostic.js` — new ME-01C diagnostic/integration test.
- `scripts/test_real_beta_ui_journey_integration.js` — ME-01B regression.
- `scripts/test_beta_journey_integration.js` — BI-01 regression.
- M1-04 onboarding.
- M1-05 privacy/consent.
- M1-06 feedback.
- M1-07 operational logging.
- Beta Runtime Session Integration.
- Beta Session Core.
- Beta Session Core hardening.
- Builder Beta Readiness Regression.
- deterministic parser runner.
- `fringe_health_check.js` — **All health checks passed**.
- `node --check` for modified/new JavaScript.

### Live-provider distinction

No `GROQ_API_KEY` is present in the Builder environment. Per task authority, this does not invalidate the supplied live-provider evidence and no fake secret was introduced.

### Baseline artifact limitation

Legacy report scripts requiring generated `tmp/` session/report artifacts are not reproducible from the clean handover without first executing the live historical session. This is not a product blocker and no fake `tmp/` report was created.

## 12. Remaining blocker

**One minimum blocker remains:** expose the existing Runtime as a staged canonical application interaction consumed by `/private-beta`:

`prepare authorized session → return current Runtime question → submit one answer → advance existing Runtime/Beta Session → return next/adaptive question → finalize existing BI-01 report/feedback/closure`.

This must reuse `createInterviewRuntime` / `advanceInterviewRuntime` and Beta Session semantics; it must not introduce a static question list or parallel Interview state machine.

## 13. Known non-blocking gaps

Unchanged:

- `VOICE_SUBSYSTEM_UNAVAILABLE`;
- `PROFESSIONAL_IDENTITY_SNAPSHOT_CAPABILITY_UNAVAILABLE`;
- integrated resume not exposed in the current minimal UI;
- legacy renderer/UI debt outside the canonical path.

## 14. Exact live Beta status

**C — LIVE UI INTERVIEW JOURNEY STILL BLOCKED**

The provider/runtime/report capabilities are not generally blocked. The remaining blocker is specifically the missing staged canonical Runtime interaction between the browser and BI-01/session execution.

## 15. Recommended next task

A narrowly scoped **ME-01D — Staged Canonical Interview UI Integration** should expose the already-existing Runtime sequence without redesigning the UI or creating new Core contracts. Exit criterion: the browser renders the authoritative Runtime question before each answer, submits exactly one answer to that Runtime state, receives the next/adaptive question, and after completion continues through the existing report → feedback → session closure path.

Do not begin ME-02 until this blocker is closed.

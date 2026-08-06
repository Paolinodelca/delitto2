# TASK M1-07 — Private Beta Operational Logging and Runbook Foundation

## Result

M1-07 is implemented at the Application boundary. The implementation is deliberately minimal, immutable, allowlist-based and failure-safe.

## Implementation

- Added a versioned `private_beta_operational_event` model.
- Added event categories: `session_started`, `session_completed`, `application_error`, `session_interrupted`.
- Added allowlisted boundaries: `privacy_consent`, `beta_journey`, `feedback`, `runtime_session`.
- Events contain only version/type, format version, `eventId`, technical `sessionId`, ISO timestamp, event type, boundary, outcome and optional safe application `errorCode`.
- Added injected sink support, an in-memory test sink and a no-op fallback when no sink is supplied.
- Sink exceptions are swallowed and never alter the journey outcome.
- Integrated start, completion and safe application-error events into `runPrivateBetaUserJourney`.
- Added an explicit interruption recorder for the runtime/operator boundary.
- Exported the operational API from `src/app/index.js`.
- Added a concise manual Private Beta runbook.

## Observable behaviour

A normal completed journey emits `session_started` followed by `session_completed`. A safely classified M1-03 failure emits `session_started` followed by `application_error`, containing only the public application error code. Interruption can be recorded independently. Missing or failed logging never blocks completion and never changes the user-visible M1-03 result.

## Excluded data

The event model does not accept CV data, full answers, reports, feedback comments, prompts, tokens, secrets, stack traces, Professional Identity or Representation payloads. No arbitrary metadata bag is available.

## Verification

PASS:

- dedicated M1-07 tests;
- start, completion, application-error and interruption events;
- data minimization and forbidden-field exclusion;
- injected sink and failure-safe behaviour;
- logging does not block completion;
- Professional Identity unchanged;
- M1-01, M1-02, M1-03, M1-04, M1-05 and M1-06 regressions;
- Beta Runtime Session Integration;
- Beta Session Core and hardening;
- Builder Beta Readiness Regression;
- JavaScript syntax checks;
- forbidden-scope scan;
- manifest/file exact match;
- overlay/manifest exact match.

## Open limits

No production persistence, retention, external observability, dashboard, analytics, distributed tracing, retry, alerting or automated incident workflow is implemented or claimed. Runtime/UI wiring of explicit interruption and selection of a real Beta sink remain deployment responsibilities. Legal/privacy review of the operational process remains outside this technical foundation.

## Residual Milestone 1 state

The minimum foundations for journey completion, verification, safe errors, onboarding, consent, feedback and operational diagnosis are present. Remaining Milestone 1 work is primarily real UI/environment integration, controlled Beta operation and closure validation, without expanding into Milestone 2/3 or Core hardening.

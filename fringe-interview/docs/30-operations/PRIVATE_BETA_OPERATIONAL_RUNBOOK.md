# Private Beta Operational Runbook

Status: M1-07 foundation; manual Private Beta use only. This runbook does not claim production persistence, retention, monitoring or legal compliance.

## Identify the session

Use the technical `sessionId` supplied by the Beta journey. Do not copy CV text, answers, report contents, feedback comments, names, contact details, prompts, tokens, secrets or stack traces into operational notes.

## Expected normal sequence

1. `session_started` — boundary `beta_journey`, outcome `started`.
2. `session_completed` — boundary `beta_journey`, outcome `completed`.

A `session_interrupted` event may be recorded explicitly by the runtime/operator boundary when the tester stops before completion. A completed session may later expose optional feedback, but M1-07 does not aggregate or analyse it.

## Distinguish operational cases

- **Application error:** `application_error`, outcome `failed`, with an allowlisted safe M1-03 `errorCode`. The tester must see only the existing safe M1-03 message.
- **Incomplete session:** `session_started` without `session_completed`, or an explicit `session_interrupted`. Confirm whether the tester intentionally stopped and whether the runtime session remains resumable.
- **Service unavailable:** `application_error` with `SERVICE_UNAVAILABLE`. Do not expose provider details; confirm service availability manually and invite a later restart according to the M1-03 fallback.
- **Logging unavailable:** no event or a failed sink write. Logging failure is non-blocking; determine session outcome from the application result, not from the log alone.

## Manual checks

1. Match events by `sessionId`.
2. Verify event order and timestamp plausibility.
3. Check `boundary`, `outcome` and safe `errorCode` only.
4. Confirm the application result and the M1-03 user-safe fallback.
5. Confirm that no forbidden personal or technical payload was copied into operational records.
6. Reproduce only with synthetic/minimized data when escalation is required.

## Stop and contact the technical owner

Stop the Beta test and contact the technical owner when:

- repeated `SERVICE_UNAVAILABLE` events affect multiple sessions;
- the same session produces contradictory completion/error outcomes;
- a sink failure is persistent and manual diagnosis is no longer reliable;
- any CV, full answer, report, feedback comment, prompt, token, secret, stack trace or Professional Identity content appears in operational data;
- an error shown to the tester contains technical/internal details;
- logging changes the session result or blocks the journey.

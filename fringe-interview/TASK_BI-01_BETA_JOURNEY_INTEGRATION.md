# BI-01 — Beta Journey Integration

## Result

BI-01 integrates the existing Milestone 1 foundations into one canonical Application-level Private Beta path without introducing a new UI framework, persistence layer, authentication system, analytics system, voice subsystem, Tutor workspace, Core contract or E-44 work.

Canonical integrated path:

`Beta Session → Onboarding → Privacy/Consent → Authorised material acquisition → Session preparation → Interview Runtime → Professional Perception report → Professional Identity snapshot capability check → Optional feedback → Experience closure`

The technical Beta Session is created at access time with no personal input references. Personal material is not read or forwarded until M1-04 onboarding is complete and M1-05 consent is valid. The same technical session is then started in the existing Runtime.

## Foundations consumed

- M1-01 — `assessBetaUserJourney` remains the completion gate used by the real session output.
- M1-02 — `verifyPrivateBetaUserJourney` verifies the precomputed real session output without rerunning the session.
- M1-03 — `runPrivateBetaUserJourney` wraps Interview execution and converts technical failures into tester-safe outcomes.
- M1-04 — existing onboarding state/choices are executed before privacy and data use.
- M1-05 — consent is created, decided and asserted before material acquisition; refusal/revocation blocks material reads.
- M1-06 — existing optional feedback is created after the completed report and may be submitted, skipped or left not-started without invalidating completion.
- M1-07 — minimized failure-safe operational events cover experience start/completion plus application errors and interruptions.

## Integration changes

### Canonical journey orchestrator

`src/app/privateBetaJourneyIntegration.js` adds `runIntegratedPrivateBetaJourney`.

It:

- creates the existing Beta Session before onboarding;
- advances the technical session through pre-interview steps without personal input references;
- enforces consent before reading/spreading the `materials` object;
- passes the created Beta Session into the existing Interview runner;
- captures the real session result once and verifies that same result through M1-02;
- exposes the existing final report and Professional Perception report;
- constructs a progressive first view with at most three high-value perception messages and three actions;
- applies M1-06 feedback after the report;
- leaves feedback optional/non-blocking;
- emits M1-07 operational events without personal payloads;
- explicitly reports unavailable capabilities rather than simulating them.

### Existing Beta Session → Runtime integration

`startBetaRuntimeSession` starts an already-created Beta Session when Interview Runtime becomes available. The session identity is preserved and authorised input references are attached only at Runtime start, after consent.

`runFringeInterviewMVPSession` now accepts either:

- an existing `created` Beta Session, which it starts; or
- an existing `interrupted` Beta Session, which it resumes as before.

### Professional Perception report

The session runner now materializes the existing `buildProReportV2` output alongside the existing final candidate report. BI-01 does not replace or redesign the reporting layer.

The integrated first view exposes only:

- who emerges;
- credibility assets;
- target-distance bridge;
- at most three operational actions.

### Operational logging

The M1-07 boundary allowlist is extended only with integration-relevant Application boundaries (`onboarding`, `material_acquisition`, `report`, `professional_identity_snapshot`). The event model and minimized field set are unchanged.

## Observable behaviour

### Positive path

A caller can provide onboarding choices, explicit consent, already-supported session materials/answers and an optional feedback action in one application call. No manual handoff is required between M1-04, M1-05, Interview execution, report presentation and M1-06 feedback.

### Consent refusal/revocation

Refusal and revocation terminate the path before the integration reads personal material. Dedicated tests use accessor-backed material objects and verify zero reads in both cases.

### Interrupted path

A pre-interview operational interruption leaves the existing Beta Session in the existing `interrupted` lifecycle state and records the corresponding minimized operational event.

### Application error

Provider/service failures are returned through the existing M1-03 safe classification; technical message, path and secret-like content are not exposed.

### Feedback

Submitted and skipped feedback consume M1-06 directly. Invalid feedback does not invalidate an already completed interview/session; it is reported as a safe feedback recording error.

## Capabilities intentionally not simulated

### Professional Identity dated snapshot

No existing Application-level boundary in the supplied repository provides a dated persistent Professional Identity snapshot suitable for the canonical Beta journey. Core knowledge snapshots and historical identity draft/model builders are not equivalent to a persisted personal Professional Identity snapshot and were not repurposed.

BI-01 therefore returns:

`PROFESSIONAL_IDENTITY_SNAPSHOT_CAPABILITY_UNAVAILABLE`

with `persisted: false`.

This remains a concrete blocker/decision for Beta Experience Validation.

### Voice

No reusable voice/speech subsystem is present in the supplied baseline. BI-01 keeps text supported and reports `VOICE_SUBSYSTEM_UNAVAILABLE`; it does not add speech-to-text, audio analysis or a new provider.

## Verification

PASS:

- `scripts/test_beta_journey_integration.js`
  - canonical orchestration;
  - created Beta Session preserved into Runtime start boundary;
  - no material read before valid consent;
  - consent refusal;
  - consent revocation;
  - positive completed path;
  - interrupted path;
  - M1-03 safe service error;
  - Professional Perception first view max 3 messages/actions;
  - explicit non-persisted Professional Identity snapshot gap;
  - feedback submitted;
  - feedback skipped;
  - feedback omitted/non-blocking;
  - operational logging start/completion;
  - data minimization;
  - sink failure-safe;
  - Professional Identity input remains unchanged.
- M1-01 regression: `scripts/test_assess_beta_user_journey.js`.
- M1-02 regression: `scripts/test_verify_private_beta_user_journey.js`.
- M1-03 regression: `scripts/test_run_private_beta_user_journey.js`.
- M1-04 regression: `scripts/test_private_beta_onboarding.js`.
- M1-05 regression: `scripts/test_private_beta_privacy_consent.js`.
- M1-06 regression: `scripts/test_private_beta_feedback.js`.
- M1-07 regression: `scripts/test_private_beta_operational_logging.js`.
- Beta Runtime Session Integration: `scripts/test_beta_runtime_session_integration.js`.
- Beta Session Core: `scripts/test_beta_session_core.js`.
- Beta Session Core hardening: `scripts/test_beta_session_core_hardening.js`.
- Builder Beta Readiness Regression: PASS.
- Syntax checks for every changed JavaScript integration file: PASS.
- Professional Perception builder smoke test: PASS.
- forbidden-scope scan: PASS.
- manifest ↔ modified files exact match: PASS after deliverable generation.
- overlay ↔ manifest exact match: PASS after overlay generation.

Not reproducible from this handover archive:

- the historical parser-backed `test_run_fringe_interview_mvp_session*.js` scripts require `fixtures/sample_cv_01.txt`, absent from the supplied archive;
- `test_build_final_candidate_report.js` requires generated `tmp/parser-pipeline-groq/full_parser_pipeline_result.json`, also absent.

These missing test fixtures are baseline packaging limitations, not BI-01-created failures.

## Beta Experience Validation blockers remaining

1. Validate the integrated path against the real Beta parser/model-provider configuration and real Beta UI/environment.
2. Resolve or explicitly scope the missing dated Professional Identity snapshot capability; BI-01 correctly does not simulate persistence.
3. Voice remains unavailable unless an already-approved reusable voice capability is later supplied; text remains the supported Beta path.
4. Legal validation/final wording of the provisional privacy notice remains outside BI-01 as already documented by M1-05.

No commit or push was executed.

# TASK M1-04 — Private Beta Onboarding Foundation

## Status

IMPLEMENTED

## Authorized base

`0f7dc33ce73a50da3c664a9660a9d091750b7800`

The handover archive does not contain Git metadata, so the base hash cannot be independently verified inside the archive.

## Product authority reviewed

All files in `docs/20-product/` were read before implementation. The implementation follows the canonical three-step entry path defined in `PRIVATE_BETA_USER_EXPERIENCE.md` and preserves person ownership and delegated Tutor access boundaries.

## Implementation

A minimal Application-owned onboarding boundary was added in `src/app/privateBetaOnboarding.js`.

It exposes:

- `startPrivateBetaOnboarding()`;
- `advancePrivateBetaOnboarding(state, choiceId)`;
- `resumePrivateBetaOnboarding(resumeToken)`.

The deterministic path is:

1. Professional Identity state: create or recover;
2. working mode: independently or with a Tutor;
3. immediate goal: up to three mode-specific choices.

Every returned state is deeply frozen. The current step, allowed choices, optional help metadata, selections and a versioned resume token are explicit. Invalid choices, malformed states, invalid resume sequences and attempts to advance a completed flow are rejected with stable errors.

Tutor mode is intentionally declarative only. It does not grant access, create permissions, implement consent or imply ownership.

## Observable experience

A new beta tester can begin from one clear question, move linearly through three lightweight decisions and resume from the last valid selection. Each screen-equivalent state exposes no more than three choices. Explanations are available as optional help metadata rather than forced tutorial content.

The boundary does not claim that persistence, Tutor authorization or a complete UI already exists.

## Files changed

See `TASK_M1-04_MANIFEST.txt`.

## Verification

Passed:

- dedicated onboarding foundation tests;
- allowed-step and allowed-choice verification;
- independent and Tutor goal-path verification;
- resume-token verification, including completed flows;
- invalid state, invalid choice and invalid resume rejection;
- M1-01 regression: `test_assess_beta_user_journey.js`;
- M1-02 regression: `test_verify_private_beta_user_journey.js`;
- M1-03 regression: `test_run_private_beta_user_journey.js`;
- Beta Runtime Session Integration regression;
- Beta Session Core regression;
- Beta Session hardening regression;
- syntax checks for every modified JavaScript file;
- forbidden-scope scan;
- continuity checks;
- manifest ↔ modified files exact match;
- overlay contents ↔ manifest exact match.

## Scope exclusions confirmed

No privacy or consent flow, Tutor permissions, feedback, advanced logging, E-44, Core hardening, evolved Professional Identity, Milestone 2/3 functionality, persistence layer or new UI framework was introduced.

## Anomalies

- The archive has no `.git` directory, so `git status`, branch and base-commit verification are unavailable.
- The archive has no `package.json`, so repository-wide npm scripts cannot be executed.
- No complete product UI or persistence adapter is present; M1-04 therefore implements the authorized deterministic Application boundary only.

## Remaining Milestone 1 responsibilities

- privacy and consent;
- minimum feedback collection;
- minimum operational logging/runbook.

UI integration of the M1-03 error boundary and M1-04 onboarding boundary remains an integration concern, not a new responsibility implemented by this task.

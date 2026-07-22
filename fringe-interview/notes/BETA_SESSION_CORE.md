# IMAGO Beta Session Core

## Scope

`BetaSession` is the current operational state of one internal Beta session. It is not an event stream, telemetry container, analytics model, learning store, or repository of interview evidence.

Clients must send commands to the exported domain functions. They must not submit or replace a complete `BetaSession` as an application update. Persistence adapters validate and store domain-produced state; they do not implement domain transitions.

## Contract and lifecycle

Schema version `1.1` has a closed contract. Unsupported properties are rejected at the session root, inside `interview`, inside `lifecycle`, and inside typed references. References contain only `{ type, id }`.

Lifecycle:

- `created` + interview `not_started`;
- `in_progress` + interview `in_progress`;
- `interrupted` + interview `not_started` or `in_progress`;
- `completed` + interview `completed`, `resultRef`, and `completedAt`.

`runtimeRef` is optional after the interview starts because the runtime can be attached after the start transition. It is forbidden while the interview is `not_started`. `resultRef` cannot be attached while the session is `created`. Completion is terminal.

Timestamps are canonical ISO strings. `updatedAt`, `interruptedAt`, and `completedAt` cannot precede `createdAt`; event timestamps cannot follow `updatedAt`. Only interrupted sessions carry `interruptedAt`, and only completed sessions carry `completedAt`.

## Revision semantics

A new session starts at `revision: 1`. Every successful domain command returns a new immutable session with revision `previous + 1`. Revisions, not timestamps, define write order.

Both stores implement optimistic revision control:

- first save requires revision `1` and may explicitly use `expectedRevision: 0`;
- an update must provide a session whose revision is exactly stored revision + 1;
- `expectedRevision`, when supplied, must equal the stored revision;
- stale, duplicate, skipped, or concurrent incompatible updates are rejected, including updates sharing the same timestamp.

The optional `expectedRevision` argument preserves the existing `save({ session, resumeToken })` API while allowing callers to state the revision they loaded.

## Domain functions

- `createBetaSession` creates revision 1 and returns the raw resume token separately.
- `transitionBetaSession` applies allowed lifecycle transitions.
- `updateBetaSessionProgress` updates step, input references, interview status, and runtime reference.
- `attachBetaSessionResult` links a typed result while the session is in progress.
- `buildBetaSessionResumeState` returns a safe resumable projection including revision, without token hash.

All functions validate input and output, clone references consistently, preserve the source object, update `updatedAt`, and increment revision.

## Persistence adapters

The in-memory and JSON filesystem stores enforce the same identity, resume-token, validation, and revision rules. The JSON store validates existing documents before overwriting, rejects malformed or semantically invalid JSON sessions, and preserves temporary-file plus rename writes.

The raw resume token is never persisted. Only its SHA-256 hash is stored and comparisons use timing-safe equality.

## Compatibility decision

Schema version changed from `1.0` to `1.1` because `revision` is now mandatory and the contract is closed. There are no real Beta sessions to migrate, so no migration layer was introduced. Public function and adapter names remain unchanged; `expectedRevision` is additive.

## Explicit exclusions

This module does not add SessionEvent, event sourcing, observations, knowledge evidence, learning, analytics, telemetry, queues, database storage, HTTP APIs, authentication, or UI behavior.

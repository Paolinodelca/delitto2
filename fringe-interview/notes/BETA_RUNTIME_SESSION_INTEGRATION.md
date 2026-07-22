# Beta Runtime Session Integration

## Purpose

`BetaSession` is the authoritative operational state for the Beta interview lifecycle. The interview runtime remains a separate execution object and is referenced through `interview.runtimeRef`; it is not embedded in the session.

## Lifecycle

The application integration creates a session, starts it through `transitionBetaSession`, and records runtime progress through `updateBetaSessionProgress`.

- `created`: produced only by `createBetaSession`.
- `in_progress`: runtime initialized or resumed.
- `interrupted`: runtime execution paused while identity, revision and current step remain available.
- `completed`: allowed only when the runtime reports completion and a Final Candidate Report reference has been attached.

## Progress and revision

Every lifecycle or progress command is delegated to the Session Core and increments `revision`. `currentStep`, `interview.status`, `updatedAt` and `runtimeRef` are therefore updated without directly mutating a `BetaSession`.

## Result

The Final Candidate Report is not embedded in the session. Completion attaches a reference shaped as:

```js
{ type: "final_candidate_report", id: "<session-id>_final_candidate_report" }
```

## Resume

An interrupted session can be resumed with `resumeBetaRuntimeSession`. Session identity, references and lifecycle history are preserved; `interruptedAt` is cleared by the existing Session Core transition and revision continues monotonically. Resume UI and durable runtime serialization remain outside this task.

## Application rule

Clients issue runtime commands and receive a new `BetaSession`. They must not submit or replace arbitrary complete session objects. Persistence remains the responsibility of Session Core adapters.

## Excluded

No events, event sourcing, observations, knowledge model, analytics, telemetry, database, HTTP API, UI or new dependency is introduced.

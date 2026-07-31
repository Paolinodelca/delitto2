# Task 0100E-15 — Post-Runtime-Session Downstream Architecture Review

## Executive Summary

Repository-first outcome: **APPROVED WITH NOTES**.

The first legitimate downstream consumer of `KnowledgeAcquisitionRuntimeSession` is an Application-owned `KnowledgeAcquisitionExecution`. It represents exactly one explicitly authorized attempt for exactly one Session item. No additional readiness, preparation, action, runtime-definition or execution-request contract is required between Session and Execution.

Execution is not itself the first observable external side-effect. The first such effect arises only when an authorized Execution crosses a separate **Knowledge Acquisition Invocation Boundary** and an infrastructure-owned adapter invokes a concrete provider or capability. Creating or validating an Execution remains an internal state description; network, process, device, filesystem, database or other external I/O is the architectural transition from description to effect.

Task `0100E-16 — Knowledge Acquisition Execution Foundation` is the next authorized task. It may establish only the semantic Execution contract described here. It does not authorize provider selection, adapter binding, invocation, retry policy, timeout, scheduler, queue, orchestration, persistence, results, Reporting, Requirement satisfaction or Knowledge Update.

## Repository-First Evidence

The decision is derived only from the repository:

- `KnowledgeAcquisitionRuntimeSession` is Application-owned, stateful and explicitly pre-Execution;
- its local validator recursively forbids execution, attempt, retry, timeout, scheduler, queue, dispatch, provider, adapter, registry, orchestration, invocation, payload, event, result, output, error, persistence, reporting and Knowledge Update structures;
- its contextual validator proves exact Plan and Plan Item causality, but no executability or integration readiness;
- the Plan remains immutable and mechanism-neutral with one item per selected capability;
- Capability Configuration binds only explicit non-secret declarative values and cannot resolve provider or adapter availability;
- Solution Decision selects a semantic solution but does not configure, plan or execute it;
- Design remains mechanism-neutral and Core-owned;
- ADR-030 and Tasks E-13/E-14 explicitly place attempts, provider/adapter binding, invocation, errors and outputs downstream of Session;
- E-13 distinguishes future Execution from provider/adapter invocation and rejects an intermediate `ExecutionRequest` or `ExecutionPreparation`;
- existing generic Capability Execution, legacy Runtime, Beta Session and Reporting code is not causally connected to this Knowledge Acquisition pipeline and therefore cannot be adopted implicitly;
- health, regression, contextual validation and public exports confirm that the implemented pipeline terminates at Runtime Session.

The repository contains no Knowledge Acquisition Execution, invocation, provider, adapter, result or update contract. This review therefore approves only the minimum next semantic boundary and names, but does not implement, the later side-effect boundary.

## Current Architecture

```text
KnowledgeAcquisitionRequirement                    [Core; declarative]
→ KnowledgeAcquisitionDesign                       [Core; declarative]
→ KnowledgeAcquisitionCapabilityMatch              [Core; pure evaluation]
→ KnowledgeAcquisitionSolutionDecision             [Application; decision]
→ KnowledgeAcquisitionCapabilityCompositionDesign  [Application; composed only]
→ KnowledgeAcquisitionCapabilityConfiguration      [Application; declarative configuration]
→ KnowledgeAcquisitionPlan                         [Application; declarative planning]
→ KnowledgeAcquisitionRuntimeSession               [Application; stateful, passive, pre-Execution]
```

The upstream chain is conforming. Need through Plan are deeply immutable declarative artifacts. Runtime Session is a deeply frozen operational snapshot with stable identity, lifecycle, active-item selection and an exact state projection for every Plan Item. It describes operational state but performs no work.

## Runtime Session Boundary Analysis

Runtime Session already has its complete minimum responsibility:

- identify one operational session independently from its source Plan;
- reference exactly one Plan;
- project exactly one item-state for each Plan Item;
- own the closed Session and item lifecycle;
- identify the currently active Plan Item;
- retain explicit operational timestamps;
- preserve reconstruction/resume identity;
- remain immutable as a snapshot and validate exact Plan causality.

It must continue to be completely passive. “Active” means locally selected in Session state; it does not mean dispatched, invoked, running on a provider or producing knowledge. Adding an execution factory, callback, invocation payload, provider binding, attempt collection, error, output or result to Session would violate its closed validator, ADR-030 and the Plan/Session boundary already approved by the Cross-Pipeline review.

No missing Runtime Session responsibility was found. The gap is downstream: representing a concrete, explicitly authorized attempt without contaminating Session state.

## First Downstream Consumer

The first direct consumer is:

```text
KnowledgeAcquisitionExecution
```

Its minimum semantic meaning is one explicitly authorized attempt to realize one active Session item under one exact Runtime Session snapshot.

Execution is required because Session lifecycle and active-item selection do not establish that an external action was authorized or attempted. Conversely, a provider invocation cannot be the direct consumer of Session because it would collapse semantic authorization, attempt identity, integration binding and I/O into one infrastructure operation.

No autonomous boundary is justified between Session and Execution:

- the Plan already authoritatively describes scope, capability and configuration causality;
- the Session already owns eligibility and active-item state;
- a readiness contract would duplicate validators or introduce provider availability prematurely;
- an execution request would be a second name for the authorization represented by Execution;
- an action or executable recipe would reinterpret the Plan and selected capability;
- provider binding belongs after semantic Execution, at the invocation boundary.

## First Observable Side-Effect

The first observable external effect does **not** occur when an Execution DTO is built, validated or recorded in memory. Those operations remain deterministic internal state description.

The first effect occurs at:

```text
KnowledgeAcquisitionExecution
→ Knowledge Acquisition Invocation Boundary
→ infrastructure-owned Provider Adapter
→ external capability/provider
```

Crossing the Invocation Boundary is observable because it performs I/O or causes work outside the pure Application model: for example a provider call, process invocation, device interaction, external write or capability execution with externally visible behavior.

This boundary is later than Runtime Session because:

1. Session contains no authorization-to-invoke, attempt identity or integration binding.
2. Session state can be constructed, validated, suspended, resumed or abandoned without any external effect.
3. Plan, Configuration, Decision and Design are immutable descriptions and decisions, not commands.
4. Only an explicitly authorized Execution may be translated by infrastructure into a concrete invocation.
5. The adapter/provider boundary, not Application state, owns technical I/O.

The Invocation Boundary must not be anticipated upstream because doing so would make Plan or Session depend on availability, credentials, endpoints, transport, provider-specific payloads or failure semantics.

## Responsibility of the Next Component

`KnowledgeAcquisitionExecution` has only these responsibilities:

- identify one execution attempt independently from Session identity;
- causally reference exactly one Runtime Session snapshot and exactly one active Session item;
- preserve the exact source Plan Item and selected capability references already established upstream;
- represent explicit Application authorization for that single attempt;
- expose a closed, minimal attempt lifecycle that remains distinct from Session lifecycle;
- remain serializable, deterministic in validation and immutable as a snapshot;
- support local validation and separate contextual validation against Session and Plan;
- remain provider-, adapter-, transport- and result-neutral.

The Foundation must not define an invocation payload or perform an invocation. “Execution” is the semantic authorization/attempt boundary; “Invocation” is the later effect boundary.

## Responsibilities Explicitly Excluded

| Responsibility | Decision | Owner/boundary |
|---|---|---|
| retry policy or automatic retry | excluded | future orchestration policy |
| interpreting another Execution as a retry | excluded | future reviewed policy; repeated attempts do not imply automatic retry |
| timeout policy or enforcement | excluded | future invocation/orchestration infrastructure |
| scheduler | excluded | future orchestration |
| queue or dispatch | excluded | future infrastructure |
| multi-item orchestration | excluded | future orchestration; Session only exposes local active state |
| provider discovery or selection | excluded | future Application integration decision |
| adapter binding | excluded | Invocation Boundary/infrastructure |
| credentials, endpoint or transport | excluded | infrastructure |
| invocation or callback execution | excluded from E-16 | later Invocation Boundary |
| persistence, repository or event log | excluded | future persistence boundary |
| technical output, error or result | excluded | future Invocation/Execution Result contract |
| acquired knowledge observation | excluded | future semantic result/evidence boundary |
| reporting | excluded | existing/future Reporting integration |
| Requirement satisfaction | excluded | future reviewed assessment |
| Knowledge Update | excluded | future evidence ingestion and reconstructable knowledge pipeline |

An Execution may be one of multiple attempts referring to the same Session item, but E-16 must not decide why another attempt exists, schedule it, call it a retry or automate it.

## Ownership

`KnowledgeAcquisitionExecution` is **Application-owned**.

It consumes an Application-owned Runtime Session and expresses use-case authorization and semantic attempt identity. It must not be Core-owned because Core has no runtime, provider or use-case coordination responsibility.

The **Knowledge Acquisition Invocation Boundary** is an Application-to-Infrastructure port boundary. The semantic port may be owned by Application; concrete provider adapters and external I/O are infrastructure-owned. No provider-specific contract belongs in Core, Plan, Session or Execution.

## Cardinality

```text
1 KnowledgeAcquisitionPlan
→ 0..N KnowledgeAcquisitionRuntimeSession

1 KnowledgeAcquisitionRuntimeSession
→ 0..N KnowledgeAcquisitionExecution

1 KnowledgeAcquisitionExecution
→ exactly 1 source Runtime Session
→ exactly 1 source Session item-state
→ exactly 1 source Plan Item

1 Session item-state
→ 0..N KnowledgeAcquisitionExecution over time

1 KnowledgeAcquisitionExecution
→ 0..1 future concrete invocation
```

Zero Executions is valid for a created, suspended or abandoned Session. Multiple Executions for one item express only historical cardinality; no retry or scheduling policy is inferred. Whether an invocation record is required, and its final cardinality, must be reviewed before implementation of the Invocation Boundary.

## Causality

The minimum causal chain is:

```text
Plan
→ Runtime Session
→ active Session item-state
→ KnowledgeAcquisitionExecution
→ future Invocation
→ future technical outcome
→ future semantic result/evidence
→ future Knowledge Update assessment
```

Execution must receive explicit resolved context. It may not look up a Session, Plan Item, provider or adapter implicitly. Contextual validation must prove that:

- the supplied Session is valid;
- the referenced item belongs to that Session;
- the item is the exact active item authorized for execution;
- the item maps to the exact source Plan Item;
- all copied causal references are exact and no upstream semantic content is reinterpreted.

Session transition after an Execution or outcome is not authorized by this review. That interaction requires an explicit state-transition contract or later architecture decision; Execution must not mutate Session.

## Alternatives Considered

### Invoke directly from Runtime Session

Rejected. It would combine lifecycle state, authorization, provider binding and external I/O, violating the passive closed Session contract.

### Add ExecutionPreparation, ExecutionRequest or Readiness

Rejected. Repository validators already establish semantic validity and exact causality, while provider readiness is downstream infrastructure knowledge. Such a contract would either duplicate Session/Plan or prematurely introduce integration state.

### Make provider invocation the first consumer

Rejected. It omits an Application-owned semantic authorization and attempt identity, making infrastructure the owner of use-case causality.

### Treat Execution as the side-effect itself

Rejected. Existing repository terminology includes pure execution-result construction, and building an immutable Execution description is not externally observable. The architecture must name invocation as the first effect boundary.

### Reuse legacy Runtime, Beta Session or Capability Execution

Rejected. None is causally connected to Knowledge Acquisition Plan/Session, and their product- or subsystem-specific semantics are not implicit public contracts for this pipeline.

## Risks for the Entry into Execution

- naming a DTO “Execution” may be misread as authorization to invoke;
- attempt lifecycle may accidentally duplicate Session lifecycle;
- multiple attempts may silently introduce retry semantics;
- an adapter-neutral contract may still leak provider fields through extensions;
- Session completion may be coupled to technical execution success;
- technical outputs may be confused with acquired knowledge or evidence;
- a convenient callback in a builder may create the first side-effect in Application code;
- existing legacy execution code may be reused without proving causal compatibility;
- persistence or events may be introduced as an assumed requirement rather than reviewed boundaries.

## Binding Guardrails for 0100E-16

1. Implement only `KnowledgeAcquisitionExecution` as an Application-owned immutable semantic attempt snapshot.
2. Consume one explicit Runtime Session and one exact active Session item; preserve exact Plan Item causality.
3. Do not mutate Runtime Session, Plan, Configuration, Decision, Design or Core.
4. Keep Execution identity distinct from Session and Plan identity.
5. Use closed shapes and recursively reject provider, adapter, invocation, payload, endpoint, credentials, callback and transport structures, including extensions.
6. Do not invoke a capability, provider, adapter, function, process, network, database, filesystem or external service.
7. Do not introduce retry, timeout, scheduler, queue, dispatch, concurrency or orchestration.
8. Do not introduce output, error, result, event, persistence, Reporting, satisfaction or Knowledge Update.
9. Do not infer Session transitions from Execution lifecycle and do not add attempt collections to Session.
10. Keep local validation separate from contextual validation against Session and Plan.
11. Add only minimal Application public exports; Core exports remain unchanged.
12. Require a new repository-first architecture review before implementing the Invocation Boundary or any observable side-effect.

## Next Authorized Component and Task

Next authorized component:

```text
KnowledgeAcquisitionExecution
```

Next task:

```text
0100E-16 — Knowledge Acquisition Execution Foundation
```

Newly identified architectural boundary:

```text
Knowledge Acquisition Invocation Boundary
```

The Invocation Boundary is the first observable side-effect boundary. It is identified but **not authorized for implementation** by E-15 or E-16.

## Continuity Impact Assessment

Continuity must advance from completed review E-15 to planned Foundation E-16. The minimum current-state documents are updated to:

- record E-15 as completed;
- record ADR-031;
- identify `KnowledgeAcquisitionExecution` as the approved next component;
- distinguish semantic Execution from the later Invocation Boundary;
- keep invocation and all external effects unapproved;
- make E-16 the single planned next task.

No production code, contract, validator, builder, API, test, Core or Runtime Session file is changed.

## Self-Review

- Repository-first scope: PASS.
- Runtime Session, Plan, Configuration, Solution Decision and Design inspected: PASS.
- Continuity, roadmap, decisions and E-series reports inspected: PASS.
- Health, tests, validators and public exports inspected: PASS.
- First direct consumer identified: PASS.
- First observable side-effect identified separately: PASS.
- Ownership, cardinality and causality stated: PASS.
- Required exclusions stated: PASS.
- No implementation or API change: PASS.
- E-16 guardrails prevent premature invocation: PASS.
- Continuity governance static check: PASS (`plannedTask: 0100E-16`, zero errors).
- Core aggregate: PASS.
- Overall health: PASS.
- Document static checks: PASS.
- `git diff --check`: PASS.
- Continuity governance direct test: expected-state mismatch. The unchanged test still hardcodes `0100E-15`; modifying it is prohibited by this review's explicit no-test-change constraint. The state-driven governance check is authoritative and passes with E-16 as the single planned task.

The note in the outcome is material: approving semantic Execution does not approve the Invocation Boundary. A separate repository-first review remains mandatory before any external effect.

## Final Outcome

**APPROVED WITH NOTES**

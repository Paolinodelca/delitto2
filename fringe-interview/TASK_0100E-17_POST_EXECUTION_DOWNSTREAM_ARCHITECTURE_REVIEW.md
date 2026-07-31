# Task 0100E-17 — Post-Execution Downstream Architecture Review

## Executive Summary

Repository-first outcome: **APPROVED WITH NOTES**.

The first architectural boundary after `KnowledgeAcquisitionExecution` is **`KnowledgeAcquisitionInvocationBoundary`** (Knowledge Acquisition Invocation Boundary), expressed as an Application-owned outbound port and a minimal invocation input contract. It is not a Provider and it is not an Adapter. A concrete infrastructure Adapter is the first technological consumer of the port; only behind that Adapter may a Provider be bound and an external capability be called.

The minimum contract accepts one valid `ready_for_invocation` Execution plus explicitly supplied, contextually consistent upstream artifacts needed to resolve its exact selected capability and declarative configuration. It does not copy those artifacts into Execution, persist an Invocation artifact, select a provider, describe a technical request or prescribe a return/result contract.

The first observable side-effect occurs when an infrastructure Adapter, reached through the Invocation port, invokes an external capability. Port input construction and validation remain effect-free. Task `0100E-18 — Knowledge Acquisition Invocation Boundary Foundation` is authorized only to establish the Application-owned port/input contract, contextual validation and an effect-free test double. Concrete adapters, providers, transport, prompts, models, vendor bindings and result ingestion remain unapproved.

## Repository-First Evidence

The decision is derived exclusively from the repository at `90ac6395fad21c38ab027060eb847ba23ca33cce`:

- Execution is Application-owned, deeply immutable and explicitly `sideEffectFree`;
- its terminal state is `ready_for_invocation`, not `invoked`, `running` or `completed`;
- its closed validator recursively forbids provider, adapter, endpoint, request, response, prompt, model, transport, callback, result, persistence and Knowledge Update structures;
- its contextual validator proves exact Runtime Session, Plan and active Plan Item causality;
- Runtime Session owns operational progress but is passive and cannot invoke;
- Plan preserves one item per selected capability without executable ordering or provider binding;
- Capability Configuration contains explicit non-secret declarative values, but cannot resolve a provider or adapter;
- E-15 and ADR-031 identify Invocation as the first side-effect and require this separate review;
- E-16 implements Execution exactly as the pre-invocation terminal described by E-15;
- health, validators, fixtures and Application public exports terminate at `ready_for_invocation`;
- the roadmap and continuity documents list E-17 as the only planned gate and do not authorize Provider, Adapter, Registry or invocation implementation;
- existing generic Capability Execution, Runtime, Reporting and product adapters are not causally connected to this Knowledge Acquisition pipeline.

No repository evidence authorizes a provider-specific contract, transport, prompt, LLM, MCP or plugin as the direct consumer of Execution.

## Pipeline corrente

```text
KnowledgeAcquisitionNeed                            [Core]
→ KnowledgeAcquisitionStrategy                      [Core]
→ KnowledgeAcquisitionRequirement                   [Core]
→ KnowledgeAcquisitionDesign                        [Core]
→ KnowledgeAcquisitionSolutionDecision              [Application]
→ KnowledgeAcquisitionCapabilityConfiguration       [Application]
→ KnowledgeAcquisitionPlan                          [Application]
→ KnowledgeAcquisitionRuntimeSession                [Application]
→ KnowledgeAcquisitionExecution                     [Application; pre-invocation]
→ Knowledge Acquisition Invocation Boundary         [Application outbound port]
→ concrete Invocation Adapter                       [Infrastructure; not yet authorized]
→ Provider / external capability                    [External; not yet authorized]
```

For composed decisions, `KnowledgeAcquisitionCapabilityCompositionDesign` remains a causal Application artifact between Decision and Configuration. `KnowledgeAcquisitionCapabilityMatch` remains the Core evaluation preceding the Decision. Neither changes the direct post-Execution conclusion.

## Boundary Analysis

### `KnowledgeAcquisitionInvocationBoundary` — approved

- **Responsibility:** receive one semantically ready Execution and explicit causal context, validate exact correspondence, and expose one technology-neutral outbound invocation operation.
- **Ownership:** Application owns the port and its input semantics; Infrastructure implements the port.
- **Creator:** an Application invocation coordinator creates the ephemeral port input from already supplied artifacts. It does not mutate Execution.
- **Consumer:** exactly one injected Infrastructure adapter implementation per call.
- **Mutability:** immutable input view; upstream snapshots remain unchanged.
- **Cardinality:** one Execution permits zero or one invocation crossing in this minimum Foundation. Repeated crossings, retries and idempotency policy require a later decision.
- **Causality:** exact `Execution → Runtime Session → Plan Item → selected capability → Capability Configuration` correspondence must be proven contextually.
- **Lifecycle:** no autonomous persisted Invocation lifecycle is justified. Input validation precedes a single port call; technical completion belongs downstream.
- **Visibility:** public to the Application composition boundary and Infrastructure implementations; absent from Core and upstream artifact shapes.
- **Who must NOT know it:** Core, Need, Strategy, Requirement, Design, Match, Solution Decision, Composition Design, Capability Configuration, Plan, Runtime Session and Execution contracts.

The approved boundary is a port, not a new domain aggregate and not a durable invocation record.

### Provider — rejected as first boundary

- **Responsibility:** perform or expose a concrete external capability.
- **Ownership:** external system or Infrastructure integration.
- **Creator:** external/vendor implementation or infrastructure composition.
- **Consumer:** concrete Adapter, never Execution directly.
- **Mutability:** provider-defined and outside Application guarantees.
- **Cardinality:** potentially many providers per semantic capability; unresolved by the repository.
- **Causality:** downstream of port implementation and adapter binding.
- **Lifecycle:** provider-specific and outside the Execution lifecycle.
- **Visibility:** Infrastructure only.
- **Who must NOT know it:** Core and every declarative/Application pipeline artifact, including Execution.

A Provider cannot be first because direct knowledge would collapse semantic authorization and vendor-specific I/O.

### Adapter — required consumer, rejected as the semantic boundary itself

- **Responsibility:** translate the technology-neutral Invocation input into a provider-specific call and isolate I/O.
- **Ownership:** Infrastructure.
- **Creator:** infrastructure composition/bootstrap code.
- **Consumer:** the Application-owned outbound port dispatches to one injected implementation; the Adapter consumes port input and calls a Provider.
- **Mutability:** implementation may hold technical clients, but may not mutate supplied snapshots.
- **Cardinality:** zero or more implementations may exist; exactly one is selected/injected for one crossing.
- **Causality:** after valid ready Execution and port input; before Provider call.
- **Lifecycle:** infrastructure-managed, separate from Execution and Session.
- **Visibility:** Application knows only the port abstraction; Provider details stay inside Infrastructure.
- **Who must NOT know it:** Core and all upstream contracts, builders and validators, including Execution.

The Adapter is the first technological component, but the Application-owned port is the first architectural boundary.

### New persistent `KnowledgeAcquisitionInvocation` aggregate — rejected

- **Responsibility:** would duplicate attempt identity, readiness or technical call state.
- **Ownership:** ambiguous without a result/persistence policy.
- **Creator/consumer:** not established by current repository causality.
- **Mutability/lifecycle:** would require unapproved dispatch, completion, error and retry semantics.
- **Cardinality:** unresolved beyond the minimal zero-or-one crossing.
- **Visibility:** would unnecessarily broaden the public model.
- **Who must NOT know it:** all upstream artifacts; no component is authorized to persist or reconstruct it.

The repository justifies an ephemeral input contract at the port, not a second attempt aggregate between Execution and effect.

## Ownership Matrix

| Element | Owner | Creator | Consumer | Explicit non-owner |
|---|---|---|---|---|
| Execution | Application | Execution builder/coordinator | Invocation coordinator | Core, Infrastructure provider |
| Invocation port and input semantics | Application | Application boundary module | Infrastructure Adapter | Core, upstream artifacts |
| Provider/adapter binding policy | not decided by this task | future composition boundary | future Adapter dispatch | Execution and all upstream contracts |
| Concrete Adapter | Infrastructure | infrastructure composition | Provider | Core and Application artifacts |
| Provider | External/Infrastructure integration | vendor/external system | Adapter | Core and pipeline artifacts |

## Lifecycle Matrix

| Element | Lifecycle |
|---|---|
| Runtime Session | `created`, `active`, `suspended`, `completed`, `abandoned` |
| Execution | `created` → `selected` → `ready_for_invocation` |
| Invocation input | ephemeral: construct → validate → pass once |
| Adapter call | begins at port crossing; technical lifecycle deferred |
| Provider operation | provider-specific; outside Application lifecycle |

No Invocation completion, failure or retry state may be added to Execution. Session transition after an external outcome remains unapproved.

## Visibility Matrix

| Concern | Core | Application artifacts | Invocation coordinator/port | Infrastructure Adapter | Provider |
|---|---:|---:|---:|---:|---:|
| semantic Execution identity | no | yes | yes | yes, read-only | no requirement |
| exact Plan/Configuration causality | no new knowledge | refs only | yes | technology-neutral input | no requirement |
| provider selection | no | no | no in E-18 | future only | n/a |
| adapter implementation | no | no | abstraction only | yes | no |
| transport/network/credentials | no | no | no | future only | yes |
| prompt/model/vendor | no | no | no | future provider-specific only | possible |

## Side-effect Analysis

The following remain effect-free:

1. building or transitioning Execution;
2. validating `ready_for_invocation`;
3. resolving the exact Plan Item, capability and declarative Configuration from explicitly supplied snapshots;
4. constructing and validating the ephemeral Invocation input;
5. calling an effect-free test double in E-18.

The first real observable effect is:

```text
Infrastructure Adapter invokes external capability/provider
```

That is the first point at which capability invocation and potentially transport, network, prompt, LLM, process, device, filesystem, database or another external call can occur. Provider selection and adapter binding may precede the call in a future composition layer, but they are integration decisions, not Execution responsibilities. The repository contains no causally connected implementation selecting them today.

## Architectural Decision

1. The first post-Execution boundary is **`KnowledgeAcquisitionInvocationBoundary`**.
2. It is an Application-owned outbound port with an Infrastructure-owned implementation.
3. Its minimum input is one valid `ready_for_invocation` Execution plus explicit resolved Runtime Session, Plan, Capability Configuration and selected capability context sufficient to prove exact causality.
4. The input contains semantic references and declarative values only. It contains no endpoint, credentials, provider id, adapter id, request/response, transport payload, prompt or model.
5. The port has no approved result contract yet. Technical output, semantic acquisition result, evidence ingestion and Knowledge Update require later repository-first reviews.
6. No persistent Invocation aggregate, provider registry or automatic selection policy is introduced.
7. A concrete Adapter and real side-effect are not authorized by E-18; they require a subsequent review after the port contract exists.

## Execution Guardrail

Execution must remain completely ignorant of:

- provider;
- adapter;
- transport;
- network;
- HTTP;
- REST;
- MCP;
- plugin;
- prompt;
- model;
- vendor.

This is binding because the Execution validator already rejects the corresponding downstream structures, metadata declares the artifact side-effect-free, E-15/ADR-031 separates semantic attempt from invocation, and E-16 terminates at readiness. Moving any of these concerns into Execution would change a closed implemented contract, reverse Application/Infrastructure dependency direction and make semantic identity depend on technology.

## Guardrail del task successivo

Task `0100E-18 — Knowledge Acquisition Invocation Boundary Foundation` may:

1. add only an Application-owned outbound port and minimal ephemeral input contract;
2. require an Execution in exact `ready_for_invocation` state;
3. validate explicit Runtime Session, Plan, Capability Configuration and selected capability causality;
4. preserve deep immutability and never mutate upstream artifacts;
5. use an effect-free fake/test double to verify the port contract;
6. add only minimal Application exports, validators, health and tests.

It must not:

1. add a concrete provider or adapter;
2. select or discover providers/adapters or introduce a registry;
3. invoke network, HTTP, REST, MCP, plugin, process, filesystem, database or external services;
4. add credentials, endpoints, secrets, callbacks, prompt, LLM, model or vendor fields;
5. define retry, timeout, queue, scheduler, dispatch, concurrency or orchestration;
6. persist an Invocation or add events;
7. add request/response, technical outcome, semantic result, evidence ingestion, Reporting, satisfaction or Knowledge Update;
8. change Execution, Runtime Session, Plan, Configuration, Core or their public contracts.

## Continuity Impact Assessment

Classification: **STATUS + ARCHITECTURE + DECISION**.

| Document | Impact | Action | Reason |
|---|---|---|---|
| `CONTINUITY.md` | status | update | E-17 completes and E-18 becomes the next gate |
| `CORE_ARCHITECTURE.md` | architecture | update | the port is the approved first post-Execution boundary |
| `DECISIONS.md` | decision | update | ADR-032 records ownership and exclusions |
| `NEXT_PHASE.md` | status | replace current gate | describe E-18 Foundation guardrails |
| `CORE_ROADMAP.md` | status/architecture | update | close E-17 and plan E-18 |
| `README.md` | none | no change | its authority table remains correct |
| boundary freeze | none | no change | the frozen declarative Core boundary is unchanged |

## Decisione finale

Prossimo componente autorizzato:

```text
KnowledgeAcquisitionInvocationBoundary
(Application-owned outbound port and minimal invocation input contract)
```

Prossimo task numerato:

```text
0100E-18 — Knowledge Acquisition Invocation Boundary Foundation
```

Nuovo boundary:

```text
Application → Infrastructure Invocation Port
```

Note: the Foundation may prove the port with an effect-free double, but does not authorize the concrete Adapter or the first real external effect. A later repository-first review remains mandatory.

## Self-Review

- Repository-only evidence: PASS.
- Execution, Runtime Session, Plan and Capability Configuration: PASS.
- Continuity, roadmap, ADRs, E-15 and E-16: PASS.
- Validators, health, fixtures and public exports: PASS.
- Candidate responsibilities and non-visibility: PASS.
- Ownership, lifecycle, visibility, cardinality and causality: PASS.
- First side-effect located separately from state construction: PASS.
- Execution technology guardrail: PASS.
- No code, contract, builder, validator, API, test, Core or Execution modification: PASS.

Self-review outcome: **CONFORMING WITH NOTES**. The note is intentional and binding: E-18 may establish the Invocation port contract, but the first real external effect remains gated behind a later review of concrete Adapter/Provider integration.

## Verification Results

- Continuity governance static: PASS (`plannedTask: 0100E-18`, zero errors).
- Continuity governance aggregate: PASS.
- Core aggregate: PASS (`IMAGO Core all tests PASSED`).
- Overall health: PASS (`All health checks passed`).
- Document static checks: PASS (all required sections, manifest, terminal outcome and documentation-only scope).
- `git diff --check`: PASS.

## Final Outcome

**APPROVED WITH NOTES**

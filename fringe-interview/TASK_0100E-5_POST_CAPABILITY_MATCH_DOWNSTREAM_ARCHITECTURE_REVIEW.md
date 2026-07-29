# TASK 0100E-5 — Post Capability Match Downstream Architecture Review

## 1. Executive Summary

The repository-first inspection confirms that `KnowledgeAcquisitionCapabilityMatch` is the terminal deterministic evaluation boundary of the current Knowledge Acquisition Core.

The Match answers one complete Core question:

```text
Is this already-resolved capability candidate snapshot
semantically compatible with this KnowledgeAcquisitionDesign?
```

It does not discover, retain, rank, select, configure or execute the candidate. The implemented cardinality is:

```text
1 KnowledgeAcquisitionDesign
  → 0..N independent KnowledgeAcquisitionCapabilityMatch

1 Match
  → exactly 1 candidateCapabilityRef
```

The first unavoidable consumer of these Match results is therefore not another Core interpretation layer. It is the Application decision that determines which acquisition solution to adopt among the evaluated candidates. That solution may involve zero, one or multiple capabilities.

```text
APPROVED DIRECTION:
KnowledgeAcquisitionSolutionDecision
```

This direction does **not** move decision-making into Core. It explicitly freezes the boundary as:

```text
Discovery             → Application
Candidate Resolution  → Application
Matching              → Core
Solution Decision     → Application
```

The Candidate must not become a public Knowledge Core contract. It remains an immutable Application-owned snapshot passed into the Core matcher. A Candidate Collection is likewise an Application discovery/resolution concern, not a Core domain. A Match Collection contract is not required: grouping independent Matches would add no semantic decision beyond their existing compatibility states and shared `sourceDesignRef`.

The Solution Decision establishes which solution to adopt and which capability references participate. It does not define how multiple capabilities cooperate. Any future `KnowledgeAcquisitionCapabilityCompositionDesign` remains a distinct downstream domain whose Core/Application placement must be reviewed separately.

The next Foundation task should establish the Application Solution Decision boundary only, without composition design, configuration, planning, recipe, runtime or execution.

```text
Task 0100E-6 — Knowledge Acquisition Solution Decision Foundation
```

---

## 2. Repository First Inspection

### 2.1 Areas inspected

The review inspected the current implementations and surrounding domains in:

```text
src/core/knowledge/
src/core/capability/
src/core/measurement/
src/core/observation/
src/core/runtime/
src/core/roleEngine/
src/core/interview/
src/core/evidence/
src/core/input/
src/interview/
src/app/
scripts/
docs/00-continuity/
docs/15-architecture_specifications/
tools/imago-builder/
```

The current handover manifest confirms the presence of the complete Knowledge chain through:

```text
src/core/knowledge/buildKnowledgeAcquisitionCapabilityMatch.js
src/core/knowledge/validateKnowledgeAcquisitionCapabilityMatch.js
src/core/knowledge/healthKnowledgeAcquisitionCapabilityMatch.js
```

It also confirms the absence of dedicated generic Core domains named:

```text
src/core/planning/
src/core/generation/
src/core/execution/
```

Planning-like and generation responsibilities exist in domain-specific or Builder locations, not as a generic Knowledge Acquisition continuation.

### 2.2 Implemented Match behaviour

`buildKnowledgeAcquisitionCapabilityMatch({ design, capabilityCandidate })`:

- validates one `KnowledgeAcquisitionDesign`;
- validates one candidate snapshot through an internal helper;
- compares design type support;
- compares knowledge layer support;
- partitions required obligations into satisfied and unsatisfied;
- compares output topology;
- compares prerequisite mode;
- emits deterministic compatibility reasons;
- returns `compatible`, `incompatible` or `indeterminate`;
- propagates causal traceability;
- fingerprints the semantic result deterministically.

The candidate snapshot is not returned as a Core object. The Match preserves only:

```text
candidateCapabilityRef
```

This is deliberate: the Core evaluates candidate semantics but does not own candidate discovery or lifecycle.

### 2.3 Match validator boundary

`validateKnowledgeAcquisitionCapabilityMatch.js` rejects responsibilities including:

```text
selection
selectedCapability
ranking
priority
score
cost
latency
availability
provider
credentials
configuration
plan
steps
sequence
recipe
execution
observation
result
satisfaction
knowledgeUpdate
fallback
retry
schedule
runtimeState
```

This is direct repository evidence that the current Match cannot and should not evolve into selection, configuration, planning or runtime.

### 2.4 Existing Capability domain

The existing Capability Foundation contains:

```text
CapabilityDefinition
CapabilityDesign
CapabilityProjection
CapabilityRecipe
CapabilityExecutionResult
CapabilityResult
CapabilityContribution
CapabilityContributionMatch
```

These are not generic candidate discovery or selection contracts for Knowledge Acquisition.

In particular:

- `CapabilityDesign` describes internal capability structure;
- `CapabilityProjection` configures a capability design against a target;
- `CapabilityRecipe` is execution-adjacent;
- `executeCapabilityRecipe` performs execution;
- `CapabilityContributionMatch` evaluates already-produced contributions and includes satisfaction-like decisions.

None is the correct direct consumer of a pre-execution Knowledge Acquisition Match.

### 2.5 Existing Application selection patterns

The repository contains concrete selection logic in the Interview application domain, including question ranking, family selection, fallback pools and product-capability resolution. These implementations demonstrate that selection depends on application policy and context. They are useful as boundary evidence but are not reusable as a generic Knowledge Acquisition selector.

---

## 3. Current Frozen Pipeline

The implemented Core pipeline remains:

```text
PersonKnowledgeMatrix
    ↓
KnowledgeCoverage
    ↓
KnowledgeOpportunity
    ↓
KnowledgeAcquisitionNeed
    ↓
KnowledgeAcquisitionStrategy
    ↓
KnowledgeAcquisitionRequirement
    ↓
KnowledgeAcquisitionDesign
    ↓
KnowledgeAcquisitionCapabilityMatch
```

The correct broader cross-boundary flow is:

```text
APPLICATION
Capability Discovery
    ↓
Capability Candidate Resolution
    ↓
Immutable Capability Candidate Snapshots
    ↓

CORE
KnowledgeAcquisitionCapabilityMatch
(one Match per Design/candidate pair)
    ↓

APPLICATION
KnowledgeAcquisitionSolutionDecision
    ↓
eventual Capability Composition Design
    ↓
Capability Configuration
    ↓
Knowledge Acquisition Plan
    ↓
Recipe / Execution Preparation
    ↓
Execution
    ↓
Observation / Result
    ↓
Satisfaction Evaluation
    ↓
Knowledge Update
```

The Core chain ends at semantic compatibility. Operational choice begins in Application.

---

## 4. Capability Candidate Decision

### 4.1 Decision

```text
Capability Candidate must NOT become a public Knowledge Core contract.
```

### 4.2 Rationale

The candidate snapshot currently exists only as matcher input and is validated by a private builder helper. This is appropriate because its origin and lifecycle are external to Core.

A candidate may be produced from:

```text
registry
catalog
provider integration
feature configuration
installed modules
human-operated tools
external systems
runtime environment
```

These are Application or Adapter concerns.

Making `CapabilityCandidate` a public Core contract would create several problems:

1. **Ownership inversion** — Core would appear to own objects discovered by Application infrastructure.
2. **Registry coupling pressure** — future candidate fields would tend to absorb provider, availability, credential and environment semantics.
3. **Duplicate capability modelling** — the repository already contains `CapabilityDefinition`, `CapabilityDesign` and `CapabilityProjection`; a public generic Candidate could become a competing capability model.
4. **Premature global taxonomy** — candidate families currently include broad technology-neutral labels, but no repository-wide capability catalog has been approved.
5. **No independent Core lifecycle** — the candidate is not persisted, queried, updated or consumed independently by Core; only its declared support snapshot matters during matching.

The correct interpretation is:

```text
Capability Candidate Snapshot
= Application-owned immutable input DTO at the Core boundary
```

It may later receive an Application-level public contract if discovery and selection require a stable shared schema. That would not make it a Knowledge Core entity.

### 4.3 What Core may require

Core may document and validate the minimum boundary shape required by the matcher, as it does today. It should not own:

```text
candidate creation
candidate cataloguing
candidate persistence
candidate availability
candidate provider lifecycle
candidate ranking
```

---

## 5. Candidate Collection Analysis

### 5.1 Does a Candidate Collection domain exist?

No generic `CapabilityCandidateCollection` exists in the repository.

The current matcher accepts exactly one candidate snapshot per invocation. There is no public collection builder, validator, query or registry associated with Knowledge Acquisition candidates.

### 5.2 Should one be introduced in Core?

```text
No.
```

A Candidate Collection is produced by discovery or resolution. Its membership can depend on:

```text
installed capability modules
provider configuration
feature flags
environment
credentials
user permissions
runtime availability
commercial entitlements
application policy
```

Therefore it belongs to Application or Adapter infrastructure.

### 5.3 Must it exist before Selection?

Selection needs a finite candidate context, but this does not require a new Core domain contract. Application can retain an immutable candidate snapshot list produced by discovery and pair it with the independent Match results.

A future Application Candidate Collection contract may be justified when at least one of these becomes necessary:

- stable catalog snapshot identity;
- provider-independent deduplication;
- audit of discovery provenance;
- application persistence;
- cross-module selection interoperability.

None is required to determine the present architecture boundary.

---

## 6. Consumer Alternatives

## 6.1 Candidate Collection

**Responsibility:** group discovered candidate snapshots.

**Dependencies:** discovery source, registry/catalog/provider and Application configuration.

**Position:** before matching, not after it.

**Decision:** rejected as consumer of Match. A candidate collection is an upstream discovery product; it does not consume compatibility evaluations.

## 6.2 Capability Pool

**Responsibility:** represent currently available capabilities.

**Dependencies:** registry, provider availability, environment, credentials, feature flags and possibly entitlements.

**Position:** Application discovery/resolution, before matching and possibly refreshed before the Solution Decision.

**Decision:** rejected as the next Core domain. “Pool” conflates catalog membership with live availability and is environment-dependent.

## 6.3 Capability Resolution

**Responsibility:** turn capability references or registrations into usable candidate snapshots.

**Dependencies:** registry/catalog/provider and adapters.

**Position:** Application, before matching.

**Decision:** rejected as downstream consumer. Resolution creates the objects that matching evaluates; it does not naturally follow Match.

## 6.4 Capability Match Collection

**Responsibility:** group N Matches for one Design and perhaps summarize their states.

**Dependencies:** only Match objects.

**Position:** potentially between matching and selection.

**Decision:** rejected as a separate Foundation domain.

Reasons:

- each Match already contains `sourceDesignRef`;
- each Match already contains `candidateCapabilityRef` and compatibility state;
- grouping adds no new semantic decision;
- compatible/incompatible/indeterminate partitions are directly derivable;
- a collection risks becoming a hidden ranking or recommendation layer;
- Application can pass an immutable array of validated Matches to selection.

A collection helper may be introduced later for validation convenience, but it is not an inevitable architectural domain.

## 6.5 Candidate Filtering

**Responsibility:** remove explicitly incompatible candidates or separate them by Match state.

**Dependencies:** Match states.

**Position:** immediately before the Solution Decision.

**Decision:** not a standalone domain. State partitioning is a deterministic projection of existing Match semantics. It may be performed by the Application solution-decision boundary without creating a new contract.

Important distinction:

```text
semantic exclusion because Match = incompatible
```

is not the same as:

```text
application exclusion because unavailable, too costly or disallowed by policy
```

The first is already expressed by Core. The second belongs to Application selection.

## 6.6 Capability Composition

**Responsibility:** define how multiple adopted capabilities cooperate to realize one acquisition solution.

**Dependencies:** a prior Solution Decision that identifies a multi-capability solution, plus later composition-specific constraints and topology.

**Position:** downstream of Solution Decision and upstream of configuration/planning.

**Decision:** rejected as the immediate universal consumer and frozen as a distinct later domain.

Composition is conditional rather than inevitable. A single compatible capability may satisfy the Design alone, while another solution may require multiple capabilities. The Solution Decision may declare that a composed solution is required and which capability references belong to it, but must not define operational topology, execution order, data flow, contribution routing, executable dependencies or failure handling.

The future Core/Application placement of `KnowledgeAcquisitionCapabilityCompositionDesign` is intentionally not decided by this review and requires a separate architecture review.

## 6.7 Acquisition Planning

**Responsibility:** define steps, order, orchestration, dependencies, retries, fallback, resources or timing.

**Dependencies:** an adopted solution, any required composition design and configuration.

**Position:** after Solution Decision and composition/configuration.

**Decision:** rejected as immediate consumer because it skips the unresolved acquisition-solution decision.

## 6.8 Knowledge Acquisition Solution Decision

**Responsibility:** determine which acquisition solution the Application adopts on the basis of validated Match results, corresponding candidate snapshots and explicit Application decision context.

**Dependencies:** one Design context, zero or more validated Match results, zero or more corresponding immutable candidate snapshots and one explicit Application decision context/policy snapshot.

**Position:** directly after matching.

**Decision:** approved.

The Solution Decision is the first layer that must consume Match semantics rather than merely transport or regroup them. It must not presume that the answer is always one selected capability. The adopted solution may reference zero, one or multiple capabilities.

---

## 7. Approved Consumer Responsibility

```text
APPROVED DIRECTION:
KnowledgeAcquisitionSolutionDecision
```

### 7.1 Problem solved

The Solution Decision domain resolves this question:

```text
Given the semantic Match results for one Design,
and the Application context currently in force,
which acquisition solution should the Application adopt?
```

It transforms compatibility evidence into an explicit Application decision. The decision may conceptually represent:

```text
a single-capability solution
a composed multi-capability solution
no practicable solution
a deferred decision
```

These are conceptual outcomes only. Their final state names and contract representation are not frozen in Task 0100E-5 and must be designed in Task 0100E-6.

### 7.2 Information it may consider

Unlike Core matching, the Application Solution Decision may legitimately consider:

```text
current availability
feature flags
credentials and access
cost and commercial policy
latency
user preferences
organizational policy
provider restrictions
fallback policy
application mode
human approval requirements
```

These factors must not be retrofitted into the Match.

### 7.3 Capability cardinality

The Solution Decision must not assume:

```text
N Match → 1 selected capability
```

It must be capable of recording an adopted solution that refers to:

```text
zero capabilities
one capability
multiple capabilities
```

The Decision may conceptually identify capability references, whether the solution is single or composed, and whether a separate composition design is required. It must not define how those capabilities cooperate.

### 7.4 What it must not do

The Solution Decision domain must not:

```text
create or discover candidates
access a registry implicitly inside Core
reinterpret Design obligations
change Match compatibility
define operational topology
define execution order or data flow
define contribution routing or executable dependencies
define failure handling
configure executable parameters
create ordered steps
build a recipe
orchestrate execution
schedule work
invoke providers
invoke an LLM
produce observations or results
evaluate satisfaction
update knowledge
```

The Solution Decision decides **which acquisition solution to adopt**, not **how to compose, configure or execute it**.

---

## 8. Matching versus Solution Decision

The repository boundary remains correct:

```text
Matching ≠ Solution Decision
```

### Matching

Core matching is:

- semantic;
- deterministic;
- pure;
- snapshot-based;
- provider-neutral;
- policy-neutral;
- one Design plus one candidate per invocation.

It produces:

```text
compatible
incompatible
indeterminate
```

with explicit reasons.

### Solution Decision

Application Solution Decision is:

- contextual;
- policy-bearing;
- potentially environment-dependent;
- potentially user-mediated;
- able to adopt a solution with zero, one or multiple capabilities;
- able to record no practicable solution;
- able to defer the decision when Application conditions are insufficient.

The Solution Decision must consume Match results as immutable facts. It must not rewrite an `incompatible` Match as usable or treat `indeterminate` as equivalent to compatible without an explicit Application policy and audit reason.

---

## 9. Core/Application Boundary

## 9.1 Core responsibilities

```text
Design interpretation
candidate semantic eligibility
obligation compatibility
output topology compatibility
prerequisite topology compatibility
declarative constraint compatibility
compatibility state
stable incompatibility/indeterminacy reasons
causal traceability
```

Core ends at `KnowledgeAcquisitionCapabilityMatch`.

## 9.2 Application responsibilities

```text
candidate discovery
registry/catalog access
candidate resolution
candidate collection ownership
live availability
provider and credentials
feature flags
policy filtering
cost and latency evaluation
ranking and preference
selection
fallback choice
human approval
configuration
planning
orchestration
execution
```

## 9.3 Candidate filtering

Candidate filtering is split by reason:

- semantic incompatibility is already a Core Match result;
- operational or policy exclusion belongs to Application Selection.

No separate Core filtering domain is needed.

## 9.4 Capability resolution

Resolution belongs before matching and in Application. It creates immutable candidate snapshots from live or configured sources. The matcher must continue to receive resolved snapshots and must never access the resolver itself.

## 9.5 Orchestration and planning

Both remain later than selection. Orchestration coordinates actions; planning defines operational structure. Neither is a valid direct consumer while the capability choice remains unresolved.

---

## 10. Cardinality Decision

The architecture must distinguish evaluation cardinality from decision cardinality.

### 10.1 Matching cardinality

Already frozen:

```text
1 Design
  → 0..N Matches

1 Match
  → exactly 1 candidate
```

### 10.2 Solution Decision input and output cardinality

The approved Application boundary is:

```text
1 KnowledgeAcquisitionDesign
+
0..N KnowledgeAcquisitionCapabilityMatch
+
0..N corresponding immutable candidate snapshots
+
1 Application decision context
  →
1 KnowledgeAcquisitionSolutionDecision
```

The resulting decision may refer to:

```text
0 capabilities
1 capability
N capabilities
```

The final contract states and field names are intentionally deferred to Task 0100E-6.

### 10.3 Why no Match Collection contract is required

A Match Collection would only package N already-independent evaluations. It is not required for causal integrity because all Matches identify the same Design through `sourceDesignRef`. It is not required for decision semantics because the Application consumer must also receive corresponding candidate snapshots and explicit Application context that a Core Match Collection must not own.

Therefore:

```text
N Matches → Application Solution Decision
```

is the correct architectural relationship.

---

## 11. Elementary and Derived Implications

### 11.1 Elementary Design

For elementary acquisition, the Solution Decision will commonly adopt one compatible capability, such as a future structured-input, document-ingestion, human-mediated or retrieval capability.

However, the architecture must not assume exactly one in all cases. An Application may require confirmation plus ingestion, or a primary capability plus a fallback. Those are Solution Decision and later configuration concerns, not matching semantics.

### 11.2 Derived Design

For derived acquisition, a candidate may already declare support for prerequisite composition and be compatible as a single candidate. Alternatively, multiple compatible candidates may eventually need to be composed.

Therefore:

- Match continues to evaluate one candidate independently;
- Solution Decision determines whether one candidate is sufficient or a multi-capability solution is required;
- Composition, when needed, follows selection as a separate configuration concern;
- the next domain must not build dependency order or executable composition.

---

## 12. Technology Neutrality

The approved Solution Decision direction remains technology-neutral.

It may choose among candidates representing:

```text
deterministic capability
LLM-assisted capability
LLM-native capability
human-mediated capability
external-system capability
measurement capability
document-ingestion capability
structured-input capability
```

Technology family may be part of Application policy, but the Solution Decision Foundation must not embed:

```text
specific provider
specific model
prompt
temperature
token limit
API key
invocation protocol
tool implementation
runtime response
```

These belong to later configuration, adapters and execution.

---

## 13. Boundary Review

The next domain must explicitly reject premature introduction of:

### Runtime

Solution Decision is a decision artifact, not mutable execution state.

### Recipe

A recipe defines executable behaviour. It requires a decided solution and any required configuration.

### Provider

Provider resolution and availability belong to Application/Adapter context. A provider identifier may influence Application policy but must not become a Core matching dependency.

### Registry

Discovery and resolution may access registries before matching. Selection should consume resolved snapshots and explicit context, not perform hidden registry lookup.

### Execution

Solution Decision authorizes a future path; it performs no action.

### Observation and Measure Result

These are post-execution outputs and cannot be produced by the Solution Decision.

### Orchestration

Orchestration coordinates multiple executable actions and belongs after the Solution Decision and any required composition/configuration.

### Scheduling

Timing and scheduling require operational resources and runtime context and belong after planning.

---

## 14. Rejected Direct Consumers

| Alternative | Decision | Architectural reason |
|---|---|---|
| `CapabilityCandidateCollection` | Rejected | Upstream Application discovery product, not a Match consumer |
| `CapabilityPool` | Rejected | Environment-dependent registry/availability abstraction |
| `CapabilityResolution` | Rejected | Produces candidate snapshots before matching |
| `KnowledgeAcquisitionCapabilityMatchCollection` | Rejected | Packages existing facts without a new semantic decision |
| `CandidateFiltering` | Rejected as domain | Semantic filtering is already encoded; policy filtering belongs inside Application Selection |
| `CapabilityComposition` | Rejected as immediate universal consumer | Conditional; follows a multi-capability Solution Decision and remains a distinct later domain |
| `KnowledgeAcquisitionPlan` | Rejected | Premature ordering/orchestration before choice |
| `CapabilityRecipe` | Rejected | Execution-adjacent and requires selected/configured capability |
| `Execution` | Rejected | Skips selection, configuration and planning |
| `MeasurementDefinition` | Rejected | Assumes Measurement has already been chosen |
| `Question Generation` | Rejected | Concrete capability/artifact path, not universal consumer |
| `KnowledgeAcquisitionSolutionDecision` | Approved | First layer that uses Match facts to determine the acquisition solution adopted by Application |

---

## 15. Non-Duplication Analysis

### Candidate versus existing Capability contracts

A public Core Candidate would overlap with `CapabilityDefinition`, `CapabilityDesign` and `CapabilityProjection` without owning a distinct Core lifecycle. Keeping it as an Application boundary snapshot avoids a competing generic capability model.

### Match Collection versus Match

A Match Collection would duplicate:

```text
sourceDesignRef
candidateCapabilityRef
compatibilityState
reasons
```

and add only grouping or derived counts. This is not sufficient semantic value for a new Foundation domain.

### Solution Decision versus Match

Solution Decision adds a genuinely new decision:

```text
which acceptable candidate or candidate set
will the Application proceed with?
```

Match never represents preference, availability, policy or choice. Solution Decision therefore does not duplicate Match.

### Solution Decision versus Plan

Solution Decision identifies the adopted acquisition solution and its capability membership. It does not define steps, sequence, scheduling, retries, resource allocation or runtime state. Planning remains later.

---

## 16. Updated Architecture Boundary

```text
APPLICATION
Capability Discovery
    ↓
Capability Candidate Resolution
    ↓
Immutable Capability Candidate Snapshots
    ↓

CORE
KnowledgeAcquisitionDesign
    ↓
0..N KnowledgeAcquisitionCapabilityMatch
    ↓

APPLICATION
KnowledgeAcquisitionSolutionDecision
    ↓
eventual Capability Composition Design
    ↓
Capability Configuration
    ↓
Knowledge Acquisition Plan
    ↓
Recipe / Execution Preparation
    ↓
Execution
    ↓
Observation / Result
    ↓
Satisfaction Evaluation
    ↓
Knowledge Update
```

The current Knowledge Core remains complete at Match for this concern. The future placement of `KnowledgeAcquisitionCapabilityCompositionDesign` is not frozen here and must be reviewed separately.

The boundary is:

```text
Discovery             → Application
Candidate Resolution  → Application
Matching              → Core
Solution Decision     → Application
```

---

## 17. Proposed Next Foundation Task

```text
Task 0100E-6
Knowledge Acquisition Solution Decision Foundation
```

### Objective

Introduce the first Application Foundation consumer of `KnowledgeAcquisitionCapabilityMatch`: an explicit, immutable and auditable decision that determines which acquisition solution the Application adopts.

The adopted solution may refer to zero, one or multiple capabilities. Task 0100E-6 must define the final contract states and field names repository-first. Task 0100E-5 does not freeze them.

### Required architectural inputs

The task should consume, at minimum, already-resolved and immutable inputs representing:

```text
1 KnowledgeAcquisitionDesign
+
0..N validated KnowledgeAcquisitionCapabilityMatch objects
+
0..N corresponding Application-owned candidate snapshots
+
1 explicit Application decision context or policy snapshot
```

### Required responsibilities

- verify that all Matches refer to the same Design;
- preserve Match compatibility facts without reinterpretation;
- distinguish semantic compatibility from Application viability;
- support conceptually a single-capability solution;
- support conceptually a multi-capability solution;
- support conceptually no practicable solution;
- support conceptually a deferred decision;
- identify which capability references participate in the adopted solution;
- indicate whether a separate composition design is required;
- remain auditable, immutable and technology-neutral.

The final state names and exact contract shape must be defined by Task 0100E-6.

### Mandatory non-responsibilities

The task must not implement:

```text
candidate discovery
registry or catalog
provider resolution
Capability Candidate Collection
KnowledgeAcquisitionCapabilityMatchCollection
capability composition design
operational topology
execution order
data flow
contribution routing
executable dependencies
failure handling
capability configuration
plan
steps
sequence
recipe
orchestration
schedule
runtime
execution
observation
result
satisfaction
knowledge update
LLM invocation
```

The placement of a future `KnowledgeAcquisitionCapabilityCompositionDesign` must be decided in a separate architecture review and is not frozen by Task 0100E-5.

---

## 18. Formal Correction Statement

This deliverable formally supersedes the earlier E-5 wording that named `KnowledgeAcquisitionCapabilitySelection` as the approved next domain.

The final approved direction is:

```text
KnowledgeAcquisitionCapabilityMatch
        ↓
KnowledgeAcquisitionSolutionDecision
```

No implementation, contract, builder, validator, health check, fixture, test or export is introduced by this correction.

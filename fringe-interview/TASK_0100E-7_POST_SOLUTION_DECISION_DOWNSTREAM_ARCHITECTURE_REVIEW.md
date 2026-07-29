# TASK 0100E-7 — Post Solution Decision Downstream Architecture Review

## Status

**COMPLETED — REPOSITORY-FIRST ARCHITECTURE REVIEW / BRANCHING APPROVED / NO CODE CHANGED**

## 1. Executive decision

The repository-first review establishes that `KnowledgeAcquisitionSolutionDecision` has **no single universal downstream artifact** that is both semantically necessary and minimal for all four decision modes.

The approved model is therefore:

```text
KnowledgeAcquisitionSolutionDecision
        ↓
Application-owned outcome branching
        ├── single   → no new composition artifact
        ├── composed → KnowledgeAcquisitionCapabilityCompositionDesign
        ├── none     → terminal unresolved outcome represented by the Decision
        └── deferred → suspended outcome represented by the Decision
```

This is **Model 2 — immediate branching**, with an important qualification: the branching itself is ordinary Application control flow derived directly from `decisionMode`; it is not a new domain contract and must not be materialized as a `Routing`, `Resolution`, `Outcome` or empty normalization object.

The only new downstream domain proven inevitable by the current repository is:

```text
KnowledgeAcquisitionCapabilityCompositionDesign
```

and only for:

```text
decisionMode = composed
```

Its semantic question is:

> How must the adopted capabilities cooperate, at a declarative and technology-neutral level, so that together they can realize the already-approved Knowledge Acquisition Design?

This question is distinct from the Decision question:

> Which acquisition solution is adopted?

The Composition Design must describe cooperation semantics that are absent from the Decision: capability roles, contribution responsibilities, logical dependencies, abstract input/output relationships and integration obligations. It must not configure providers, create execution steps, schedule work, invoke capabilities or define runtime behavior.

The next proposed Foundation task is:

```text
Task 0100E-8 — Knowledge Acquisition Capability Composition Design Foundation
```

with **Application ownership**, because it materializes cooperation among concrete capability references already selected by an Application-owned Decision. Its content must nevertheless remain declarative and technology-neutral.

---

## 2. Repository-first inspection

### 2.1 Repository root and source of truth

The ZIP was materially extracted and inspected. The internal directory:

```text
repository/
```

was treated as the project root and source of truth. `HANDOVER_MANIFEST.txt` was used only as an archive-control aid, not as an architectural authority.

### 2.2 Principal artifacts inspected

The review inspected, among others:

```text
TASK_0100E-5_POST_CAPABILITY_MATCH_DOWNSTREAM_ARCHITECTURE_REVIEW.md
TASK_0100E-6_IMPLEMENTATION_REPORT.md
TASK_0100E-6_MANIFEST.txt

src/app/knowledge/buildKnowledgeAcquisitionSolutionDecision.js
src/app/knowledge/validateKnowledgeAcquisitionSolutionDecision.js
src/app/knowledge/healthKnowledgeAcquisitionSolutionDecision.js
src/app/knowledge/publicApi.js
src/app/knowledge/index.js
src/app/index.js

src/core/knowledge/buildKnowledgeAcquisitionDesign.js
src/core/knowledge/validateKnowledgeAcquisitionDesign.js
src/core/knowledge/buildKnowledgeAcquisitionCapabilityMatch.js
src/core/knowledge/validateKnowledgeAcquisitionCapabilityMatch.js

scripts/knowledge_acquisition_solution_decision_fixture.js
scripts/test_knowledge_acquisition_solution_decision.js
scripts/test_knowledge_acquisition_solution_decision_regression.js
scripts/test_knowledge_acquisition_solution_decision_public_api.js
scripts/test_health_knowledge_acquisition_solution_decision.js

docs/00-continuity/CONTINUITY.md
docs/00-continuity/CORE_ARCHITECTURE.md
docs/15-architecture_specifications/CORE_ROADMAP.md
docs/15-architecture_specifications/KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md
```

The surrounding Capability, Runtime, Measurement, Observation and Application areas were also inspected to verify whether an already-existing contract could legitimately consume the Decision.

### 2.3 Implemented Decision contract

The repository implements the Application-owned contract:

```text
KnowledgeAcquisitionSolutionDecision {
  id
  decisionVersion
  type
  sourceDesignRef
  decisionMode
  decisionState
  consideredMatchRefs[]
  consideredCandidateRefs[]
  selectedCapabilityRefs[]
  compositionRequired
  decisionReasons[]
  decisionContextSummary
  traceability
  provenance
  dependencyRefs[]
  metadata
  extensions
}
```

The builder and validator freeze these mode/cardinality invariants:

```text
single   → exactly 1 selected capability
composed → at least 2 selected capabilities
none     → 0 selected capabilities
           and at least 1 blocking reason
deferred → 0 selected capabilities
           and at least 1 pending_condition reason
```

The implemented field:

```text
compositionRequired
```

is not an independent state. It is derived exactly as:

```text
compositionRequired === (decisionMode === "composed")
```

This is decisive repository evidence that composition is branch-specific, not universal.

### 2.4 Explicit downstream exclusions already protected

The Decision validator rejects operational structures including:

```text
registry
providerLookup
providerInvocation
prompt
model
token
apiKey
recipe
plan
execution
runtime
observation
result
satisfaction
knowledgeUpdate
steps
stepOrder
schedule
scheduling
retry
orchestration
dataFlow
failureHandling
configuration
```

The Match validator independently excludes selection, provider data, configuration, planning, recipe, execution, fallback, retry, scheduling and runtime state.

The existing `KnowledgeAcquisitionDesign` is mechanism-neutral and predates candidate matching and solution choice. It already describes the required abstract acquisition shape; therefore a post-Decision artifact cannot merely restate that same design under a new name.

### 2.5 Existing Capability contracts do not fill the gap

The repository contains Capability contracts such as:

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

None is the direct post-Decision domain:

- `CapabilityDesign` describes a capability, not cooperation among selected capabilities for one acquisition decision;
- `CapabilityProjection` is capability/target-specific and does not represent a multi-capability solution topology;
- `CapabilityRecipe` is execution-adjacent and therefore too late;
- execution/result/contribution contracts occur after preparation or execution;
- no existing universal solution specification or outcome routing contract is present.

The repository therefore contains a real semantic gap only when multiple adopted capabilities must cooperate.

---

## 3. Current frozen architecture

The implemented Knowledge Acquisition pipeline is:

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
        ↓
KnowledgeAcquisitionSolutionDecision
```

The frozen ownership boundaries are:

```text
Discovery             → Application
Candidate Resolution  → Application
Matching              → Core
Solution Decision     → Application
```

The Decision completes solution adoption. It does not yet establish cooperation, configuration, planning or execution.

---

## 4. Decision versus downstream semantics

### 4.1 Question answered by the Decision

```text
Which acquisition solution is adopted?
```

The Decision records:

- which mode applies;
- which capability references are adopted, if any;
- which Match and candidate references were considered;
- why the decision was made;
- whether composition is required.

### 4.2 Question that remains unanswered

For a composed decision only:

```text
How must the adopted capabilities cooperate declaratively
so that their combined contribution realizes the source
KnowledgeAcquisitionDesign?
```

This question introduces autonomous semantics not derivable from the selected references alone.

For `single`, `none` and `deferred`, no equivalent universally missing design question is proven:

- a single capability has no inter-capability cooperation to design;
- `none` adopts no solution;
- `deferred` intentionally postpones adoption.

### 4.3 Why a universal post-Decision object is rejected

A universal object would have to do one of three things:

1. copy the Decision mode and selected references;
2. contain empty or not-applicable structures for `none`, `deferred` or `single`;
3. mix terminal outcome state, composition semantics, configuration and planning in one polymorphic contract.

All three are architecturally weaker than immediate branching:

- copying adds no new semantics;
- empty objects preserve a false linear pipeline;
- a polymorphic universal contract creates an oversized domain with mode-specific responsibilities and unstable boundaries.

---

## 5. Analysis of the four decision modes

## 5.1 `single`

### Repository state

A valid `single` Decision contains exactly one `selectedCapabilityRef` and:

```text
compositionRequired: false
```

### Missing information after the Decision

The Decision still does not contain:

- concrete provider binding;
- environment-specific parameters;
- credentials or entitlement;
- operational invocation parameters;
- execution order or steps;
- runtime fallback and retry rules;
- schedule or orchestration.

Those omissions do not prove the need for a new declarative solution artifact. They prove only that later configuration/planning boundaries remain to be reviewed.

### Approved treatment

```text
single
→ no KnowledgeAcquisitionCapabilityCompositionDesign
→ eligible for a future post-single review of configuration versus planning
```

A single capability must not be wrapped in an artificial one-node composition merely to normalize the pipeline.

### Why direct planning is not approved now

The repository does not yet define the minimal inputs of a generic `KnowledgeAcquisitionPlan`. A Plan may require configuration, invocation constraints, operational dependencies or policy that are not present in the Decision. This review therefore does not authorize a direct Decision-to-Plan Foundation.

### Cardinality

```text
1 single SolutionDecision
→ 0 CompositionDesign
```

No new artifact is required at the reviewed boundary.

---

## 5.2 `composed`

### Repository state

A valid `composed` Decision contains:

```text
selectedCapabilityRefs.length >= 2
compositionRequired: true
```

It identifies the adopted participants but does not describe their cooperation.

### Information that is necessarily missing

Before a composed solution can be configured or planned, the system must know at least the declarative cooperation shape, including concepts such as:

- role of each selected capability in the composed solution;
- which contribution obligation each capability is responsible for;
- logical prerequisites between capability contributions;
- whether outputs are independent, cumulative or integrated;
- abstract input/output compatibility obligations;
- integration responsibility for the final acquisition output;
- declarative constraints that must remain true across the composition.

The exact contract fields belong to the Foundation task, but the semantic category is unavoidable.

### Approved treatment

```text
composed SolutionDecision
        ↓
KnowledgeAcquisitionCapabilityCompositionDesign
```

### What the Composition Design must solve

It must answer:

> How do the selected capability references cooperate as one declarative acquisition solution?

### What it must not do

It must not introduce:

- provider selection or resolution;
- registry lookup;
- concrete configuration;
- credentials, environment or entitlement;
- prompts, models, tokens or APIs;
- execution steps or recipes;
- scheduling or orchestration;
- runtime state;
- fallback/retry execution policy;
- observation, result or satisfaction;
- knowledge update.

### Consumer relationship

The Composition Design is a **direct consumer of the composed Solution Decision**. No intermediate universal `SolutionDesign`, `SolutionSpecification` or `OutcomeRouting` artifact is needed.

### Cardinality

```text
1 composed SolutionDecision
→ exactly 1 CapabilityCompositionDesign
```

The initial Foundation should not allow multiple competing Composition Designs for one final Decision. Alternatives belong before solution adoption or in a later explicit redesign/versioning decision, not in the base cardinality.

---

## 5.3 `none`

### Repository state

A valid `none` Decision contains zero selected capabilities and at least one structured blocking reason.

### Approved treatment

```text
none
→ terminal unresolved acquisition outcome
→ represented completely by the SolutionDecision
```

The pipeline may legitimately terminate at this point.

### Rejected automatic consequences

The review does not authorize automatic creation of:

- a new `KnowledgeOpportunity`;
- a new `KnowledgeAcquisitionNeed`;
- a new Discovery cycle;
- retry or fallback loops;
- an `UnresolvedOutcome` contract.

The Decision already preserves the blocking reasons. Any future business action—manual escalation, renewed discovery, policy change or abandonment—is Application orchestration and requires its own explicit decision or task.

### Cardinality

```text
1 none SolutionDecision
→ 0 downstream design artifacts
```

---

## 5.4 `deferred`

### Repository state

A valid `deferred` Decision contains zero selected capabilities and at least one `pending_condition` reason.

The contract still has:

```text
decisionState: decided
```

This means the current decision outcome is definitively “deferred”; it does not mean that the selected solution exists in a hidden pending state.

### Approved treatment

```text
deferred
→ suspended downstream progression
→ represented completely by the SolutionDecision
```

### Re-evaluation

A later re-evaluation may be initiated by Application policy when relevant conditions change, but no new domain is inevitable at this boundary.

The review does not authorize:

- watcher;
- polling;
- scheduler;
- retry engine;
- event listener;
- monitoring contract;
- `ReevaluationEligibility` Foundation;
- pending-state artifact duplicating the Decision.

### Cardinality

```text
1 deferred SolutionDecision
→ 0 downstream design artifacts
```

---

## 6. Universal consumer versus branching

## 6.1 Model 1 — Universal consumer

```text
SolutionDecision
        ↓
X
```

### Potential advantage

- visually linear pipeline;
- one apparent handoff point for later processing.

### Defects

- `none` and `deferred` have no adopted solution to design or specify;
- `single` has no cooperation topology;
- a universal object would mostly repeat `decisionMode`, reasons and selected references;
- empty/not-applicable fields would preserve false uniformity;
- mode-dependent validation would make `X` an artificial union of unrelated responsibilities.

### Decision

**REJECTED.**

No universal artifact introduces new, autonomous semantics for every mode.

---

## 6.2 Model 2 — Immediate branching

```text
SolutionDecision
        ↓
branch by decisionMode
```

### Advantages

- exactly matches the closed mode/cardinality invariants already implemented;
- creates an artifact only where new semantics are necessary;
- avoids empty objects and duplicate outcome contracts;
- preserves terminal/suspended outcomes as first-class Decisions;
- allows composition to evolve without contaminating single-capability flow.

### Disadvantage

- the pipeline is no longer represented as one simple linear chain.

This is not a real architectural defect: the Decision contract already intentionally models non-linear outcomes.

### Decision

**APPROVED.**

Branch dispatch remains Application logic, not a new domain object.

---

## 6.3 Model 3 — Common consumer followed by branching

```text
SolutionDecision
        ↓
X
        ↓
mode branches
```

### Potential advantage

- common validation or traceability checkpoint.

### Defects

- Decision validation already supplies the common checkpoint;
- source Design, Match and candidate references are already present;
- a new `X` would duplicate validated facts before making the same branch decision;
- no repository evidence shows additional universal normalization is required.

### Decision

**REJECTED.**

Common validation and routing do not justify a new semantic domain.

---

## 7. Alternative domains considered

## A. `KnowledgeAcquisitionCapabilityCompositionDesign`

### As universal consumer

**Rejected.** A single capability does not require inter-capability composition, while `none` and `deferred` have no selected capabilities.

### As composed-branch consumer

**Approved.** It introduces the exact missing semantics for multiple adopted capabilities.

A one-capability composition would be artificial normalization and a violation of domain minimality.

---

## B. `KnowledgeAcquisitionSolutionDesign`

**Rejected at this boundary.**

The pre-existing `KnowledgeAcquisitionDesign` already describes the mechanism-neutral form required by the Requirement. A post-Decision `SolutionDesign` would either:

- restate selected references and mode, duplicating the Decision; or
- absorb composition, configuration and planning into an ambiguous umbrella.

No distinct universal design responsibility is proven.

---

## C. `KnowledgeAcquisitionSolutionSpecification`

**Rejected.**

A Specification would be legitimate only if a concrete, stable body of declarative information were required for every mode. The repository proves no such universal body.

Terminology boundary:

```text
Decision      = which solution is adopted
Design        = required declarative structure or cooperation
Specification = frozen detailed declarative requirements for a later materialization
Configuration = concrete capability/provider/environment parameters
Plan          = ordered or conditional preparation for execution
```

At present, `Specification` would differ from `Decision` or `CompositionDesign` mainly by name.

---

## D. `KnowledgeAcquisitionCapabilityConfiguration`

**Rejected as the universal and immediate consumer.**

Configuration is not applicable to `none` or `deferred`; for `composed`, it is premature until cooperation semantics exist. It is also likely to include Application-owned facts such as concrete capability/provider settings, environment, entitlement and invocation parameters.

For `single`, configuration may eventually be the next operational domain, but this must be established by a dedicated later review rather than assumed here.

---

## E. `KnowledgeAcquisitionPlan`

**Rejected as the immediate universal consumer.**

A Plan would likely need facts absent from the Decision, such as:

- operational ordering;
- configured inputs;
- dependency realization;
- routing;
- conditions;
- fallback and failure policy;
- execution readiness.

For a composed solution, planning before declarative composition would force the Plan to invent composition semantics and violate separation of responsibilities.

---

## F. Capability Preparation / Execution Preparation

**Rejected.**

These names are execution-adjacent and would invite recipe, invocation, provider adapter, prompt, scheduling or orchestration semantics that the current boundary explicitly excludes.

---

## G. Decision Outcome Routing

**Rejected as a domain contract.**

The routing rule is exactly and exhaustively derivable from:

```text
decisionMode
compositionRequired
selectedCapabilityRefs.length
```

Materializing a routing object would duplicate the Decision without introducing autonomous domain meaning. Routing remains simple Application control flow.

---

## H. Other domain considered: `KnowledgeAcquisitionSolutionMaterialization`

**Rejected.**

“Materialization” implies conversion toward concrete, configured or executable form and is too broad for the first post-Decision semantic step.

---

## 8. Cardinality decision

There is no one universal cardinality because there is no universal downstream artifact.

The approved mode-specific cardinality is:

```text
1 single SolutionDecision
→ 0 CapabilityCompositionDesign

1 composed SolutionDecision
→ 1 CapabilityCompositionDesign

1 none SolutionDecision
→ 0 downstream design artifacts

1 deferred SolutionDecision
→ 0 downstream design artifacts
```

Equivalent aggregate statement:

```text
1 KnowledgeAcquisitionSolutionDecision
→ 0..1 KnowledgeAcquisitionCapabilityCompositionDesign
```

with the strict invariant:

```text
CompositionDesign exists
if and only if
decisionMode === "composed"
```

No empty artifact may be produced to preserve linearity.

---

## 9. Core/Application boundary

## 9.1 Abstract semantics that could appear Core-compatible

The following concepts are technology-neutral:

- capability roles;
- contribution obligations;
- logical prerequisite relations;
- abstract output integration;
- declarative dependency constraints;
- cooperation invariants.

Technology neutrality alone, however, is not sufficient to make a contract Core-owned.

## 9.2 Ownership evidence

The Composition Design is produced from:

- an Application-owned `KnowledgeAcquisitionSolutionDecision`;
- concrete capability references selected by Application policy;
- a solution adoption that may depend on availability, approval or contextual policy outside Core.

Its purpose is not to determine the abstract acquisition requirement—that is already Core-owned in `KnowledgeAcquisitionDesign`. Its purpose is to materialize how the **selected concrete participants** cooperate.

## 9.3 Approved ownership

```text
KnowledgeAcquisitionCapabilityCompositionDesign
→ Application
```

The contract should live in an Application Knowledge boundary, while retaining declarative and technology-neutral content.

This placement avoids moving concrete selected-capability topology into the neutral Knowledge Core and preserves the frozen boundary:

```text
Matching          → Core
Solution Decision → Application
Composition Design→ Application
```

## 9.4 What would force a deeper split

A later review may discover two distinct levels:

```text
Abstract Composition Design
Concrete Capability Composition
```

That split is not frozen now because only one level is currently inevitable. The first Foundation should remain declarative and reference selected capabilities without provider/environment configuration.

A second concrete composition/configuration layer must not be introduced until repository evidence demonstrates a distinct responsibility.

---

## 10. Abstract versus concrete composition

## 10.1 Approved first-level semantics

The proposed Composition Design may describe:

- selected capability role assignments;
- contribution responsibility mapping;
- prerequisite relations;
- abstract input/output relationship obligations;
- final output integration responsibility;
- logical dependency constraints;
- source Design conformity.

## 10.2 Excluded concrete semantics

It must not describe:

- provider identities or lookup;
- credentials;
- environment-specific settings;
- concrete API or adapter mapping;
- executable step order;
- invocation contracts;
- payloads, prompts or models;
- runtime synchronization;
- scheduling;
- retry/failure execution behavior.

## 10.3 One level only for now

The review does not approve two new composition layers. The Foundation must introduce only the minimal declarative Application artifact. Any future concrete composition or configuration requires a separate architecture review.

---

## 11. Relationship with `KnowledgeAcquisitionDesign`

The downstream Composition Design must be grounded in the source Design because cooperation exists to realize its:

```text
targetKnowledge
solutionShape
capabilityObligations
```

However, the Decision already contains:

```text
sourceDesignRef
```

and transitive traceability through Requirement, Strategy, Need, Opportunity, Coverage and PersonKnowledgeMatrix.

### Minimum direct references

The proposed artifact should require, at minimum:

```text
sourceSolutionDecisionRef
sourceDesignRef
selectedCapabilityRefs[]
```

`sourceDesignRef` is justified as a direct semantic dependency because Composition Design validation must check conformity against the required solution shape, not merely preserve historical traceability.

### Avoided duplication

The artifact should not blindly duplicate every upstream traceability field if they are transitively available through the Decision. A compact traceability representation may preserve only direct causal references unless repository conventions require a standard propagated traceability block.

The Foundation task must explicitly decide this using existing contract conventions; this review does not freeze redundant field-level duplication.

---

## 12. Relationship with Match and candidate snapshots

### Required logical inputs

The minimum logical inputs for building a Composition Design are:

```text
composed KnowledgeAcquisitionSolutionDecision
source KnowledgeAcquisitionDesign
selected capability declarative snapshots
```

### Why the Decision alone is not always enough

The Decision stores capability references, not the declarative capability facts needed to assign roles and verify cooperation. A builder cannot presume an implicit registry or repository lookup.

### Role of Match

Full Match objects need not be mandatory inputs if all required compatibility facts can be reconstructed from explicit selected capability snapshots and the source Design. The Decision already records considered Match refs and guarantees that selected capabilities were compatibly matched.

A Foundation builder may accept selected Match snapshots for referential verification, but it must not require all considered Matches or all candidates again unless the contract semantics truly use them.

### Approved input principle

```text
No implicit registry access.
No re-discovery.
No full candidate universe.
Only explicit snapshots required to construct and validate the composition.
```

The exact builder signature belongs to Task 0100E-8.

---

## 13. Technology neutrality

The approved Composition Design must support, without special-case provider semantics:

```text
deterministic capabilities
LLM-assisted capabilities
LLM-native capabilities
human-mediated capabilities
external-system capabilities
measurement capabilities
document-ingestion capabilities
structured-input capabilities
future capability types
```

It must not contain:

```text
provider
model
prompt
token
API
adapter runtime
invocation protocol
library
infrastructure
credentials
network endpoint
```

Capability roles and contribution obligations must be expressed in domain terms, not technology categories.

---

## 14. Updated pipeline

The accurate post-Decision architecture is branching, not falsely linear:

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
        ↓
KnowledgeAcquisitionSolutionDecision
        ↓
Application branch by decisionMode
        ├── single
        │     ↓
        │   future configuration/planning boundary review
        │
        ├── composed
        │     ↓
        │   KnowledgeAcquisitionCapabilityCompositionDesign
        │     ↓
        │   future configuration/planning boundary review
        │
        ├── none
        │     ↓
        │   terminal unresolved Decision outcome
        │
        └── deferred
              ↓
            suspended Decision outcome
```

No `Routing` artifact is inserted between Decision and branches.

---

## 15. Approved direction

### Main approved domain name

```text
KnowledgeAcquisitionCapabilityCompositionDesign
```

### Why this name is preferred

- `KnowledgeAcquisition` preserves bounded-context clarity;
- `Capability` identifies the concrete selected participant class;
- `Composition` states that the domain exists only for multiple cooperating capabilities;
- `Design` states that the artifact remains declarative and pre-operational.

### Question answered

> How must the selected capabilities cooperate declaratively to realize the adopted acquisition solution?

### Why it is inevitable

A `composed` Decision selects multiple capabilities and explicitly declares that composition is required, but supplies no cooperation topology or responsibility mapping.

### Why it does not duplicate the Decision

The Decision identifies participants and adoption rationale. The Composition Design assigns cooperation semantics among those participants.

### Why it does not anticipate Planning

It describes logical structure and obligations, not executable ordering, scheduling, runtime conditions or steps.

### Why it does not incorporate Execution

It contains no invocation, provider, adapter, recipe, prompt, API, runtime, result or observation semantics.

### Why it is preferable to broader names

`SolutionDesign` and `SolutionSpecification` obscure the branch-specific nature of the gap. `Configuration`, `Plan`, `Preparation` and `Materialization` move too close to operational concerns. `Routing` adds no domain semantics.

---

## 16. Rejected alternatives summary

| Alternative | Decision | Reason |
|---|---|---|
| Universal Capability Composition Design | Rejected | Artificial for single; impossible for none/deferred |
| KnowledgeAcquisitionSolutionDesign | Rejected | Duplicates Decision or pre-existing KnowledgeAcquisitionDesign |
| KnowledgeAcquisitionSolutionSpecification | Rejected | No universal specification semantics proven |
| Capability Configuration | Rejected now | Concrete/Application and premature for composed |
| KnowledgeAcquisitionPlan | Rejected now | Requires structure/configuration not yet available |
| Capability/Execution Preparation | Rejected | Execution-adjacent and boundary-unsafe |
| Decision Outcome Routing contract | Rejected | Directly derivable from decisionMode |
| Universal outcome object | Rejected | Empty/duplicate artifacts for terminal modes |
| One-node composition for single | Rejected | Violates minimality and semantic truth |

---

## 17. Proposed next Foundation task

# Task 0100E-8 — Knowledge Acquisition Capability Composition Design Foundation

## Ownership

```text
Application
```

## Responsibility

Create a deterministic, immutable and declarative composition design for one valid `composed` `KnowledgeAcquisitionSolutionDecision`, describing how the selected capability references cooperate to satisfy the source `KnowledgeAcquisitionDesign`.

## Logical inputs

At minimum:

```text
1 composed KnowledgeAcquisitionSolutionDecision
1 source KnowledgeAcquisitionDesign
selected capability declarative snapshots
```

Optional selected Match snapshots may be used only if required for explicit referential validation; no implicit lookup is permitted.

## Logical output

```text
1 KnowledgeAcquisitionCapabilityCompositionDesign
```

## Cardinality

```text
1 composed SolutionDecision
→ exactly 1 CompositionDesign
```

The builder must reject `single`, `none` and `deferred` decisions rather than creating empty or normalized compositions.

## Required semantic scope

The Foundation should establish only the minimum stable concepts needed to represent:

- source Decision identity;
- source Design identity;
- exact selected capability references;
- capability role assignments;
- contribution responsibility mapping;
- declarative prerequisite/dependency relations;
- abstract output integration obligations;
- deterministic identity, provenance and dependency references;
- closed validation and boundary protection.

The exact field names and shapes must be derived repository-first during implementation.

## Exclusions

Do not introduce:

```text
universal SolutionDesign
SolutionSpecification
Routing artifact
none/deferred outcome artifact
single-capability composition
provider or registry
provider resolution
configuration
credentials
environment
entitlement
prompt
model
token
API
adapter
plan
steps
sequence
recipe
execution
runtime
orchestration
scheduling
retry
fallback execution
observation
result
satisfaction
Knowledge Update
UI
networking
infrastructure persistence
```

## Boundary to protect

```text
KnowledgeAcquisitionSolutionDecision → Application
KnowledgeAcquisitionCapabilityCompositionDesign → Application

Composition Design = declarative cooperation semantics
Configuration      = later concrete capability/application parameters
Plan               = later execution preparation
Recipe/Execution   = later operational behavior
```

---

## 18. Boundary freeze resulting from this review

The following decisions are frozen for the next Foundation:

1. There is no universal downstream artifact for all Decision modes.
2. Branching is derived directly from `decisionMode` in Application logic.
3. No `DecisionOutcomeRouting` domain is introduced.
4. `single` does not create a Composition Design.
5. `composed` creates exactly one declarative Capability Composition Design.
6. `none` remains a valid terminal unresolved Decision outcome.
7. `deferred` remains a valid suspended Decision outcome.
8. No automatic loop, retry, rediscovery or new Need/Opportunity is introduced.
9. Composition Design is Application-owned.
10. Composition Design remains technology-neutral and pre-configuration.
11. No provider, registry, configuration, planning, recipe, execution or runtime semantics are introduced.
12. The source `KnowledgeAcquisitionDesign` remains the normative acquisition-shape reference.
13. No implicit registry or repository access may be assumed by future builders.
14. No code or existing contract is modified by Task 0100E-7.

---

## 19. Non-blocking notes

### 19.1 Future single-branch review

After Task 0100E-8, a later architecture review should determine whether the first operational consumer for `single` and composed solutions is:

```text
Capability Configuration
Solution Configuration
Knowledge Acquisition Plan
```

or another minimal domain. This review deliberately does not decide that question.

### 19.2 Potential common later input

A future planning layer may consume a normalized logical view of:

- one selected capability for `single`; or
- one Composition Design for `composed`.

That does not justify creating a universal post-Decision artifact now. Normalization should occur only where a later consumer proves it necessary.

### 19.3 Versioning and redesign

The initial cardinality is one Composition Design per composed Decision. Future redesign/version history should be handled through deterministic identity/versioning or a new Decision, not by allowing an unbounded collection in the first Foundation.

---

## 20. Final architecture statement

The `KnowledgeAcquisitionSolutionDecision` is intentionally a branching boundary.

It does not require a universal semantic consumer.

```text
single
```

has no composition problem.

```text
none
```

has no adopted solution to materialize.

```text
deferred
```

has no current solution to advance.

Only:

```text
composed
```

creates an inevitable new semantic obligation: describing how multiple adopted capabilities cooperate before any concrete configuration, planning or execution can occur.

Therefore the approved direction is:

```text
KnowledgeAcquisitionSolutionDecision (composed)
        ↓
KnowledgeAcquisitionCapabilityCompositionDesign
```

with Application ownership, declarative technology-neutral semantics and strict exclusion of operational concerns.

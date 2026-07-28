# TASK 0100E-3 — Post-Design Downstream Architecture Review

## 1. Executive Summary

The repository-first inspection confirms the frozen Knowledge boundary:

```text
PersonKnowledgeMatrix
  → KnowledgeCoverage
  → KnowledgeOpportunity
  → KnowledgeAcquisitionNeed
  → KnowledgeAcquisitionStrategy
  → KnowledgeAcquisitionRequirement
  → KnowledgeAcquisitionDesign
```

`KnowledgeAcquisitionDesign` is implemented in `src/core/knowledge/buildKnowledgeAcquisitionDesign.js` and validated by `src/core/knowledge/validateKnowledgeAcquisitionDesign.js`. It already declares the target knowledge, output topology, contribution requirements, prerequisite topology, and abstract capability obligations. It deliberately contains no capability reference, registry dependency, selection, plan, recipe, execution, result, or satisfaction state.

The first legitimate downstream responsibility is therefore not another specification, intent, method, mechanism, plan, recipe, or execution definition. The missing responsibility is the deterministic semantic evaluation of whether one already-resolved capability candidate can satisfy one Design.

```text
APPROVED DIRECTION:
KnowledgeAcquisitionCapabilityMatch
```

The approved contract represents **one evaluation of one candidate capability against one KnowledgeAcquisitionDesign**. Discovery is external to this contract. Selection is later and separate. The initial cardinality is:

```text
1 KnowledgeAcquisitionDesign
  → 0..N KnowledgeAcquisitionCapabilityMatch

1 KnowledgeAcquisitionCapabilityMatch
  → exactly 1 evaluated capability candidate
```

The next implementation task must therefore be:

```text
Task 0100E-4 — Knowledge Acquisition Capability Match Foundation
```

Its builder input must be a Design plus one immutable, already-resolved capability candidate snapshot. It must not access a registry, discover candidates, rank matches, select a winner, check runtime availability, create a plan, configure a recipe, or execute anything.

---

## 2. Repository First Inspection

### 2.1 Inspected areas

The following repository areas were inspected directly:

```text
src/core/knowledge/
src/core/capability/
src/core/measurement/
src/core/observation/
src/core/roleEngine/
src/core/interview/
src/core/runtime/
src/core/evidence/
src/core/input/
scripts/
docs/00-continuity/
docs/15-architecture_specifications/
tools/imago-builder/
TASK_0100E-1_POST_REQUIREMENT_DOWNSTREAM_ARCHITECTURE_REVIEW.md
TASK_0100E-2_IMPLEMENTATION_REPORT.md
```

The following requested directories do not exist:

```text
src/core/planning/
src/core/generation/
src/core/execution/
```

Generation and planning-like responsibilities do exist, but inside `tools/imago-builder/`, not as IMAGO Core domains.

### 2.2 Frozen Design implementation

`src/core/knowledge/buildKnowledgeAcquisitionDesign.js` consumes:

```js
{
  requirement,
  resolvedContext: {
    strategy,
    need,
    opportunity,
    coverage,
    personKnowledgeMatrix
  }
}
```

It verifies the full causal chain and produces a deterministic Design with:

```text
designType
targetKnowledge
solutionShape
capabilityObligations
traceability
```

The elementary branch produces an `elementary_knowledge_contribution_set`. The derived branch produces a `derived_knowledge_composition` with `all_required` prerequisite topology.

`src/core/knowledge/validateKnowledgeAcquisitionDesign.js` explicitly rejects planning, selection, concrete capability references, source/method/channel selection, recipe, evaluator, algorithm, execution, result, observation, satisfaction, and knowledge update fields.

This confirms that the Design is complete as a mechanism-neutral declaration and that the next layer must add a decision about compatibility, not repeat the Design.

---

## 3. Current Frozen Boundary

The current last Core object answers:

```text
What abstract solution shape would be valid for this Requirement?
```

It does not answer:

```text
Which available capability candidates exist?
Can a specific candidate satisfy the Design?
Which candidate should be preferred?
How should a chosen capability be configured?
How should it be planned or executed?
Did execution produce a result?
Did that result satisfy the Requirement?
Should PersonKnowledgeMatrix be updated?
```

These questions belong to distinct boundaries.

---

## 4. Existing Downstream Inventory

| Component | Path | Real responsibility | Input → Output | Determinism / side effects | Selection / planning / execution | Compatibility judgment |
|---|---|---|---|---|---|---|
| CapabilityDesign | `src/core/capability/buildCapabilityDesign.js` | Defines a domain capability from measurement/capability components, boundaries and design principles | Capability design input → CapabilityDesign | Mostly normalization-oriented and deterministic; no external side effects | No runtime selection; describes an already modelled capability | **REFERENCE ONLY** — useful Design precedent, but its semantics describe capabilities, not acquisition compatibility |
| CapabilityRecipe | `src/core/capability/buildCapabilityRecipe.js` | Converts rules into an executable recipe using `evaluate_all_rules` | capability rules → CapabilityRecipe | Identity deterministic; timestamp may be environmental unless supplied | Introduces executable rules and execution strategy | **INCOMPATIBLE as direct consumer** |
| executeCapabilityRecipe | `src/core/capability/executeCapabilityRecipe.js` | Executes a CapabilityRecipe | recipe + inputs → execution result | Execution concern | Explicit execution | **INCOMPATIBLE** |
| CapabilityContributionMatch | `src/core/capability/buildCapabilityContributionMatch.js` | Matches already-produced contributions to requirements, chooses the best contribution and assigns `satisfied`, `partially_satisfied`, `missing`, or `incompatible` | capability definition + contributions → match/result structure | Deterministic over supplied data | Contains best-choice logic and satisfaction-like states | **REFERENCE ONLY / semantically incompatible** |
| CapabilityDefinition / Projection | `src/core/capability/buildCapabilityDefinition.js`, `buildCapabilityProjection.js` | Defines and projects already-established capability models | capability model inputs → definitions/projections | Core deterministic transformations | No acquisition discovery; domain-specific | **REFERENCE ONLY** |
| MeasurementDefinition | `src/core/measurement/buildMeasurementDefinition.js` | Defines a concrete measurement | measurement specification → MeasurementDefinition | Core builder; no required registry | Already commits to measurement as mechanism | **INCOMPATIBLE as universal direct consumer** |
| MeasurementProfile | `src/core/measurement/buildMeasurementProfile.js` | Configures measurement interpretation/profile | profile input → MeasurementProfile | Core transformation | Mechanism-specific configuration | **INCOMPATIBLE as direct consumer** |
| Observation | `src/core/observation/buildObservation.js` | Builds an observed event/value | observation input → Observation | Post-acquisition data object | Observation/result boundary | **INCOMPATIBLE** |
| MeasurementResult | `src/core/observation/buildMeasurementResult.js` | Builds a result from measurement output | measurement data → MeasurementResult | Post-execution | Result boundary | **INCOMPATIBLE** |
| MeasureResult | `src/core/measurement/buildMeasureResult.js` | Produces measurement-domain result | measurement inputs → result | Result-producing | Post-mechanism | **INCOMPATIBLE** |
| EvidenceCollectionPlan | `src/core/roleEngine/buildEvidenceCollectionPlan.js` | Builds interview collection goals, priority, preferred question types, execution modes, follow-up actions and stop conditions | RoleCredibilityMap → collection plan | Deterministic but application/legacy specific | Explicit priority, planning and execution policy | **LEGACY / INCOMPATIBLE** |
| Interview Coverage State | `src/core/interview/buildInitialCoverageState.js`, `updateCoverageState.js` | Maintains operational collection coverage during interview | plan/results → mutable-session-style state transitions | Runtime-oriented | Operational state and recommendations | **INCOMPATIBLE** |
| IMAGO Runtime | `src/core/runtime/buildImagoRuntime.js` | Builds runtime integration object | runtime inputs → runtime object | Runtime domain | Runtime concern | **OUT OF SCOPE** |
| MeasurementModuleSpec | `tools/imago-builder/plugins/measurement-module/buildMeasurementModuleSpec.js` | Builder specification for generating source files of a measurement module | plugin input → module spec | Builder-oriented | Artifact-generation specification | **INCOMPATIBLE** |
| MeasurementModulePlan | `tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan.js` | Produces a concrete generated-file plan | module spec/context → files/plan | Builder deterministic pipeline with generation concerns | Explicit generation planning | **INCOMPATIBLE** |
| GenerationPlan | `tools/imago-builder/core/buildGenerationPlan.js` | Plans file generation and overwrite behavior | files + target root → generation plan | Contains timestamp; Builder domain | Explicit file planning | **INCOMPATIBLE** |
| EvidenceStore | `src/core/evidence/buildEvidenceStore.js` | Extracts and stores evidence from InputBundle/source inputs | input sources → EvidenceStore | Uses environmental timestamp | Evidence ingestion after acquisition/import | **INCOMPATIBLE as direct consumer** |
| InputBundle | `src/core/input/buildInputBundle.js` | Normalizes incoming sources, history, discovery and updates | raw input → InputBundle | Uses timestamps | Intake boundary | **INCOMPATIBLE as direct consumer** |
| Question generators | `src/interview/` and related interview files | Generate concrete interview questions/prompts using application context, banks and sometimes LLM services | interview context → question artifacts | Application and potentially LLM/environment dependent | Artifact generation / preparation | **INCOMPATIBLE as direct consumer** |

No inspected component is directly reusable as the consumer of `KnowledgeAcquisitionDesign`.

---

## 5. Reusable Components

No existing downstream component is reusable without semantic distortion.

The following patterns are reusable only as architectural references:

1. **Pure builder plus validator pattern** from the Knowledge Foundation.
2. **Design → Recipe → Execution → Result separation** visible in `src/core/capability/`.
3. **Deterministic identity and immutable input handling** used by recent Knowledge contracts.
4. **Explicit source references and traceability** used throughout Knowledge contracts.
5. **Single-object validators returning `{ valid, errors, warnings }`**.

`CapabilityContributionMatch` may inform naming around compatibility reasons and missing requirements, but its implementation and contract must not be reused because it:

- evaluates contributions already produced;
- chooses a best contribution;
- uses satisfaction-like statuses;
- is tied to capability/measurement contribution semantics;
- is downstream of execution or observation, not upstream of acquisition.

---

## 6. Legacy and Incompatible Components

### 6.1 Legacy

`src/core/roleEngine/buildEvidenceCollectionPlan.js` is legacy relative to the new Knowledge Foundation. It consumes a `RoleCredibilityMap`, not a `KnowledgeAcquisitionDesign`, and directly introduces:

```text
priority
preferredQuestionTypes
executionModes
followupPolicy
allowedActions
stopCondition
coverageTarget
```

It is therefore both semantically too concrete and tied to FRINGE Interview.

### 6.2 Builder-only components

`MeasurementModuleSpec`, `MeasurementModulePlan`, and `GenerationPlan` belong to `tools/imago-builder/`. They design or plan **source-code artifacts**, not knowledge acquisition at runtime or application level. Their names cannot justify reuse in IMAGO Core.

### 6.3 Post-execution components

`Observation`, `MeasurementResult`, `MeasureResult`, `EvidenceStore`, and `CapabilityContributionMatch` require data that exists only after a source has been acquired, a method has run, or contributions have been produced. They cannot be the first Design consumer.

---

## 7. Design Consumer Responsibility

The minimum new responsibility that justifies a downstream layer is:

> Evaluate whether one already-resolved capability candidate semantically supports the obligations, topology and constraints declared by one `KnowledgeAcquisitionDesign`.

This responsibility is absent from the repository.

It introduces new semantics:

```text
candidate eligibility
obligation compatibility
missing obligations
topology compatibility
constraint compatibility
explicit incompatibility reasons
```

It does not duplicate:

- the Requirement, which declares the required knowledge condition;
- the Design, which declares the abstract valid solution shape;
- CapabilityDesign, which models what a capability is;
- CapabilityRecipe, which configures executable rules;
- CapabilityContributionMatch, which evaluates already-produced contributions.

---

## 8. Capability Discovery Analysis

Capability discovery answers:

```text
Which candidate capabilities are available in the current application/environment?
```

It can depend on:

```text
registry
catalog providers
feature flags
environment
credentials
installed modules
external provider availability
runtime readiness
```

These dependencies are not present in the Knowledge Foundation and are inherently application- or environment-dependent.

### Decision

Capability discovery does **not** belong in the next Core contract or builder.

The Core must receive one or more candidate snapshots already resolved by the Application. The next builder must not access a registry or catalog.

Discovery may later produce an immutable `capabilityCandidates` snapshot, but defining a registry/catalog contract is premature and outside Task 0100E-4.

---

## 9. Capability Matching Analysis

Capability matching answers:

```text
Given this Design and this candidate description, is the candidate semantically compatible?
```

This can be deterministic when both inputs are immutable snapshots and the candidate exposes declarative support information.

The matching decision must compare at least:

```text
Design.capabilityObligations
Design.solutionShape.outputTopology
Design.solutionShape.prerequisiteTopology
Design target layer/type
candidate supported obligations
candidate supported topologies
candidate declared constraints
```

It must not consider:

```text
cost
latency
credentials
current availability
user preference
policy priority
fallback
provider health
```

Those factors belong to Application selection or runtime readiness.

### Decision

Deterministic semantic matching belongs to IMAGO Core.

---

## 10. Matching versus Selection

The repository provides a warning example in `buildCapabilityContributionMatch.js`: that component chooses a “best” contribution while evaluating matches. Such coupling is unacceptable for acquisition capability matching.

The correct separation is:

```text
CapabilityCandidate
  = an externally resolved immutable description

KnowledgeAcquisitionCapabilityMatch
  = one Core semantic evaluation

CapabilitySelection
  = a later Application decision among compatible matches
```

Matching may state:

```text
compatible
incompatible
indeterminate
```

and provide reasons. It must not rank, prefer, or select.

Selection may later consider:

```text
policy
cost
availability
latency
credentials
user preferences
fallback
runtime readiness
```

Selection is not part of Task 0100E-4.

---

## 11. Elementary Branch

For `elementary_acquisition_design`, a candidate may declare support for mechanisms such as structured input, document ingestion, interview question delivery, source retrieval, user confirmation, imported observation, or deterministic extraction.

Those are candidate capability families, not Design fields and not mandatory repository components.

The match must only evaluate whether the candidate can satisfy abstract elementary obligations, for example:

```text
must_produce_elementary_contribution
must_preserve_source_traceability
```

and whether it supports the Design output topology:

```text
elementary_knowledge_contribution_set
```

It must not choose the person, document, source, question, channel or method.

---

## 12. Derived Branch

For `derived_acquisition_design`, a candidate may represent deterministic derivation, evidence aggregation, rule evaluation, prerequisite synthesis, LLM-supported inference, or another technology-neutral derivation mechanism.

The match must evaluate whether the candidate supports:

```text
must_produce_derived_output
must_support_prerequisite_composition
must_preserve_source_traceability
```

and the declared prerequisite topology:

```text
all_required
```

The matcher must not receive or generate executable formulas, evaluator code, recipes, or runtime dependency order.

---

## 13. Capability Composition

A derived Design may eventually require more than one capability. However, the repository currently has no generic acquisition capability catalog, no acquisition composition contract, and no composition selection policy.

The first matching Foundation must therefore evaluate **one candidate at a time**. A candidate may itself declare that it supports composition, but the matcher must not build a composition.

Future composition should remain separate:

```text
N compatible matches
  → later CapabilityComposition or Selection/Configuration decision
```

Introducing composition in Task 0100E-4 would prematurely combine matching, selection and planning.

---

## 14. Cardinality Analysis

Rejected cardinalities:

```text
1 Design → 1 Match
```

This incorrectly assumes exactly one candidate.

```text
1 Design → 1 SelectedCapability
```

This collapses matching into selection.

```text
1 Design → 1 CapabilityComposition
```

This introduces composition before candidate evaluation.

Approved cardinality:

```text
1 Design → 0..N KnowledgeAcquisitionCapabilityMatch
1 Match → 1 Design
1 Match → 1 candidate capability snapshot
```

The initial builder should produce one Match per call. A collection contract is not needed in Task 0100E-4; the caller can map deterministically over an immutable candidate snapshot list. A future collection/query layer may be added only if repository use cases justify it.

---

## 15. Core/Application Boundary

### IMAGO Core

```text
Design interpretation
obligation matching
topology compatibility
constraint compatibility
deterministic candidate eligibility
missing-obligation reporting
semantic incompatibility reasons
traceability
```

### Application

```text
registry access
catalog discovery
provider resolution
feature flags
credentials
current availability
cost
latency
user preferences
policy
ranking
selection
fallback
configuration
planning
execution
```

The proposed model in the task prompt is therefore confirmed, with one refinement: the Core should evaluate only a **candidate snapshot**, not a live capability provider.

---

## 16. Determinism Boundary

| Operation | Boundary |
|---|---|
| obligation matching | Pure and deterministic Core |
| topology compatibility | Pure and deterministic Core |
| declarative constraint compatibility | Pure and deterministic Core |
| candidate catalog lookup | Application, snapshot-producing |
| provider availability | Environment/application dependent |
| credentials check | Application/runtime |
| cost evaluation | Application policy |
| latency evaluation | Application/runtime |
| ranking and selection | Application policy |
| external provider resolution | Application/runtime |
| execution readiness | Runtime-only |

Task 0100E-4 must be deterministic and snapshot-based.

---

## 17. Measurement Position

Measurement is neither the universal downstream path nor the direct consumer of `KnowledgeAcquisitionDesign`.

It is:

```text
an optional capability family
```

A measurement capability candidate may be matched when its declared support satisfies the Design obligations and topology. Other candidates may use structured input, document ingestion, deterministic extraction, human mediation, or LLM inference.

Existing `MeasurementDefinition` and Builder `MeasurementModuleSpec` are too concrete to represent this generic candidate boundary.

---

## 18. Question Generation Position

Question generation is not matching.

It is best positioned as one of:

```text
a concrete acquisition capability implementation
or
artifact generation performed after capability selection/configuration
```

A future interview-question capability could be matched abstractly to an elementary Design. Only after selection and configuration should the system generate a question set or prompt artifact.

Therefore Question Generator and Interview Runtime are explicitly rejected as direct Design consumers.

---

## 19. LLM Boundary

The matching contract must remain technology-neutral and support candidate kinds such as:

```text
deterministic
LLM-assisted
LLM-native
human-mediated
external-system
```

These kinds may be descriptive metadata or constraints of a future candidate snapshot. Compatibility must be based on declared obligations and topology support, not on technology preference.

LLM invocation, provider choice, model selection, prompting, token limits, cost and runtime availability remain outside Core matching.

---

## 20. Alternative Comparison

| Alternative | New semantic value | Main problem | Decision |
|---|---|---|---|
| Direct `KnowledgeAcquisitionCapabilityMatch` | Evaluates one candidate against Design obligations/topology | Requires a minimal candidate snapshot input | **APPROVED** |
| Intermediate `KnowledgeAcquisitionSpecification` | Could restate requirements for matching | Design already contains target, topology, contribution requirements and obligations; high duplication risk | Rejected |
| `KnowledgeAcquisitionCapabilityCriteria` projection | Could extract match criteria from Design | Current Design is already an explicit criteria-bearing object; projection adds no necessary decision | Rejected |
| `KnowledgeAcquisitionPlan` | Organizes concrete satisfaction path | Premature sequence, selection and operational coupling | Rejected |
| `KnowledgeAcquisitionIntent` | Expresses intent to act | Duplicates Need/Strategy/Requirement and adds no compatibility decision | Rejected |
| `KnowledgeAcquisitionMethod` | Names a method | Premature method selection | Rejected |
| `KnowledgeAcquisitionMechanism` | Defines concrete mechanism | Conflates candidate description with selection/configuration | Rejected |
| `KnowledgeAcquisitionRecipe` | Configures executable behavior | Already execution-adjacent; analogous repository Recipe contains rules and execution strategy | Rejected |
| `KnowledgeAcquisitionExecutionDefinition` | Prepares execution | Skips discovery, matching, selection and configuration boundaries | Rejected |

---

## 21. Rejected Consumers

### EvidenceCollectionPlan

Rejected because it consumes RoleCredibilityMap and introduces priorities, question types, execution modes and follow-up policy.

### MeasurementDefinition

Rejected because it assumes measurement has already been selected as the acquisition mechanism.

### MeasurementModuleSpec

Rejected because it is a Builder source-generation specification, not a Core acquisition compatibility object.

### MeasurementModulePlan

Rejected because it plans concrete generated files.

### GenerationPlan

Rejected because it plans filesystem artifacts and overwrite behavior.

### CapabilityRecipe

Rejected because it contains rules and an execution strategy.

### executeCapabilityRecipe

Rejected because it performs execution.

### CapabilityContributionMatch

Rejected because it consumes produced contributions, chooses a best contribution and assigns satisfaction-like statuses.

### Observation / MeasurementResult

Rejected because they represent post-execution observations/results.

### EvidenceStore / InputBundle

Rejected because they belong to input normalization and evidence ingestion, after acquisition/import boundaries.

### Question Generator

Rejected because it creates a concrete artifact and may depend on application context or LLM services.

### Interview Runtime

Rejected because it orchestrates interaction and runtime state.

---

## 22. Non-Duplication Analysis

### Versus KnowledgeAcquisitionRequirement

Requirement says which knowledge condition must become true. Match does not redefine that condition.

### Versus KnowledgeAcquisitionDesign

Design says what shape a valid solution must have. Match determines whether one candidate supports that shape.

### Versus CapabilityDesign

CapabilityDesign models the internal design of a capability domain object. Acquisition Match evaluates an externally supplied candidate description against an acquisition Design.

### Versus CapabilityRecipe

Recipe defines executable rules/configuration. Match contains no executable parameters.

### Versus CapabilityContributionMatch

ContributionMatch evaluates produced evidence contributions and satisfaction. Acquisition Match evaluates pre-execution candidate eligibility.

The new semantic decision is:

```text
candidate X is compatible / incompatible / indeterminate
with Design Y for these explicit reasons
```

It does not represent selection, readiness, execution success, Requirement satisfaction or knowledge update.

---

## 23. Approved Direction

```text
APPROVED DIRECTION:
KnowledgeAcquisitionCapabilityMatch
```

Definition:

> A deterministic, read-only Core evaluation of the semantic compatibility between one `KnowledgeAcquisitionDesign` and one immutable, already-resolved acquisition capability candidate snapshot.

---

## 24. Proposed Input

The precise input for the future builder is:

```js
{
  design: KnowledgeAcquisitionDesign,

  capabilityCandidate: {
    capabilityRef,
    capabilityType,

    supportedDesignTypes: [],
    supportedKnowledgeLayers: [],
    supportedOutputTopologies: [],
    supportedPrerequisiteModes: [],
    supportedObligations: [],

    constraints: {},

    metadata: {
      version
    },

    extensions: {}
  }
}
```

The final candidate field names must be aligned with real repository conventions during Task 0100E-4. The semantic requirements are fixed:

- candidate already resolved by the caller;
- immutable snapshot;
- stable `capabilityRef`;
- declarative support data only;
- no provider handle;
- no credentials;
- no live availability;
- no price or latency;
- no executable recipe;
- no registry access by the builder.

`KnowledgeAcquisitionDesign` is sufficiently self-contained for matching. The earlier Requirement/Strategy/Need context must not be passed again. Traceability is inherited through `sourceDesignRef`; duplicating the entire causal context would increase coupling without adding matching semantics.

---

## 25. Proposed Output

The next contract must represent one evaluation:

```js
{
  id,
  type: "knowledge_acquisition_capability_match",

  sourceDesignRef,
  candidateCapabilityRef,

  compatibilityState,

  obligationCompatibility: {
    satisfiedObligations: [],
    unsatisfiedObligations: []
  },

  topologyCompatibility: {
    outputTopologySupported,
    prerequisiteTopologySupported
  },

  constraintCompatibility: {
    compatible,
    reasons: []
  },

  reasons: [],

  traceability: {
    sourceRequirementRef,
    sourceStrategyRef,
    sourceNeedRef,
    sourceOpportunityRef,
    sourceCoverageRef,
    sourcePersonKnowledgeMatrixRef
  },

  metadata: {
    version
  },

  extensions: {}
}
```

Recommended allowlisted compatibility states:

```text
compatible
incompatible
indeterminate
```

The output must not contain:

```text
rank
score for preference
selected
priority
cost
availability
plan
recipe
configuration
execution state
result
satisfaction
```

---

## 26. Proposed Task 0100E-4

```text
Task 0100E-4 — Knowledge Acquisition Capability Match Foundation
```

### Objective

Implement the deterministic Core contract that evaluates one resolved capability candidate snapshot against one `KnowledgeAcquisitionDesign`.

### Input

```js
{
  design,
  capabilityCandidate
}
```

### Output

```text
1 KnowledgeAcquisitionCapabilityMatch
```

### Cardinality

```text
1 Design → 0..N Matches
1 builder call → exactly 1 Match
1 Match → exactly 1 candidate
```

### Responsibility

- verify `sourceDesignRef` input validity;
- compare design type and knowledge layer support;
- compare capability obligations;
- compare output topology;
- compare prerequisite topology;
- evaluate declarative constraints;
- produce explicit reasons;
- preserve traceability;
- remain deterministic and immutable.

### Non-responsibilities

- discovery;
- registry access;
- candidate collection building;
- ranking;
- selection;
- availability checking;
- cost/latency policy;
- configuration;
- composition;
- planning;
- recipe generation;
- execution;
- observation;
- result;
- satisfaction;
- knowledge update.

### Expected builder and validator

```text
buildKnowledgeAcquisitionCapabilityMatch
validateKnowledgeAcquisitionCapabilityMatch
healthKnowledgeAcquisitionCapabilityMatch
```

### Minimum tests

- compatible elementary candidate;
- incompatible elementary candidate;
- compatible derived candidate;
- missing obligation;
- unsupported output topology;
- unsupported prerequisite topology;
- indeterminate declarative constraint;
- deterministic identity;
- immutability;
- invalid Design;
- invalid candidate snapshot;
- rejection of ranking/selection/planning/execution/satisfaction fields;
- public API regression;
- health integration.

### Public APIs

Only the builder, validator and health function above.

### Indicative files

```text
src/core/knowledge/buildKnowledgeAcquisitionCapabilityMatch.js
src/core/knowledge/validateKnowledgeAcquisitionCapabilityMatch.js
src/core/knowledge/healthKnowledgeAcquisitionCapabilityMatch.js
scripts/test_knowledge_acquisition_capability_match.js
scripts/test_knowledge_acquisition_capability_match_regression.js
scripts/test_health_knowledge_acquisition_capability_match.js
```

No query, collection, discovery, selector, plan, recipe, execution or result module should be created.

### Explicitly excluded existing components

```text
buildCapabilityContributionMatch.js
buildCapabilityRecipe.js
executeCapabilityRecipe.js
buildEvidenceCollectionPlan.js
buildMeasurementDefinition.js
buildMeasurementModuleSpec.js
buildMeasurementModulePlan.js
buildGenerationPlan.js
```

---

## 27. Risks Avoided

The approved direction avoids:

- duplicating the Design with an intermediate Specification;
- coupling Core to a registry;
- conflating discovery with matching;
- conflating matching with selection;
- making Measurement the universal acquisition path;
- making Question Generation the direct consumer;
- introducing composition before candidate eligibility exists;
- importing legacy FRINGE planning semantics;
- reusing a post-result satisfaction matcher;
- introducing live provider/environment concerns into deterministic Core;
- introducing Plan, Recipe or Execution prematurely;
- making LLM technology mandatory.

---

## 28. Explicit Non-Implementation Statement

Task 0100E-3 created documentation only.

No new Core contract, builder, validator, query, collection, matcher, selector, plan, recipe, runtime, execution, observation, result, satisfaction evaluator or knowledge update was implemented.

No existing source code, tests, scripts, documentation or public exports were modified.

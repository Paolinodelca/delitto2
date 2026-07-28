# TASK 0100E-1 — Post-Requirement Downstream Architecture Review

## 1. Executive Summary

This review was performed repository-first against the real handover repository. No downstream implementation was introduced.

The frozen declarative Knowledge Analysis boundary is confirmed as:

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
```

`KnowledgeAcquisitionRequirement` correctly states the final knowledge condition that must become available. It must remain free of planning, source/method/channel selection, generated artifacts, runtime state, execution, observation and satisfaction state.

The repository contains several apparently downstream components, but none is a legitimate direct consumer of the Requirement:

- `src/core/roleEngine/buildEvidenceCollectionPlan.js` is an older role/interview collection plan driven by `RoleCredibilityMap`; it contains priority, question preferences, execution modes and follow-up policy and is therefore semantically too operational and incompatible as a direct consumer.
- `src/interview/generateGapDrivenInterviewQuestion.js` and `generateAdaptiveFollowupQuestion.js` are FRINGE Application/LLM question-generation components; they consume interview gaps and runtime answer analysis, not Knowledge Requirements.
- `tools/imago-builder/plugins/measurement-module/buildMeasurementModuleSpec.js` and `buildMeasurementModulePlan.js` belong to the Builder and already assume a concrete measurement module and code generation target.
- `tools/imago-builder/core/buildGenerationPlan.js` is a file-generation plan and cannot represent knowledge acquisition semantics.
- `src/core/measurement/*` and `src/core/observation/*` represent measurement definitions, observations and results, but assume that a measurement route has already been selected.
- `src/core/capability/buildCapabilityDesign.js` is the closest architectural precedent because it separates declarative design from recipes and execution, but its contract is capability-domain specific and cannot be reused directly.
- `src/core/capability/buildCapabilityContributionMatch.js` evaluates existing contributions against a capability definition, including satisfaction-like statuses and best-contribution selection; it is not acquisition-capability matching and cannot consume a Knowledge Requirement directly.

The semantic gap is therefore not “make a plan”. It is:

> define the abstract acquisition solution shape that can make the required knowledge available, before selecting a concrete capability, source, method, channel, generated artifact or runtime procedure.

## Final Architecture Decision

```text
APPROVED DIRECTION:
Knowledge Acquisition Design
```

A future `KnowledgeAcquisitionDesign` is justified as the first downstream object because it introduces one autonomous responsibility not represented by Need, Strategy or Requirement:

> transform one validated KnowledgeAcquisitionRequirement and its resolved causal context into a mechanism-neutral design of the acquisition solution, describing the required output topology and capability classes without selecting or executing any concrete mechanism.

It does not duplicate:

- **Need**, which explains why knowledge must be acquired;
- **Strategy**, which classifies the general transformation as elementary acquisition or derived acquisition;
- **Requirement**, which states which final knowledge availability condition must become true.

The Design instead defines the *shape of a valid downstream solution*: what kind of output units must be produced, which prerequisite relationships must be represented, and which abstract capability obligations a later matching layer must satisfy.

Initial cardinality should be:

```text
1 KnowledgeAcquisitionRequirement
    →
1 KnowledgeAcquisitionDesign
```

The same contract should support both elementary and derived requirements through two allowlisted design modes, without splitting the frozen upstream Foundation.

---

## 2. Repository First Inspection

### 2.1 Areas inspected

The review inspected real files under:

```text
src/core/knowledge/
src/core/measurement/
src/core/observation/
src/core/capability/
src/core/roleEngine/
src/interview/
src/app/
scripts/
docs/00-continuity/
docs/15-architecture_specifications/
tools/imago-builder/
```

Key inspected files included:

### Frozen Knowledge boundary

```text
src/core/knowledge/buildKnowledgeAcquisitionRequirement.js
src/core/knowledge/validateKnowledgeAcquisitionRequirement.js
src/core/knowledge/evaluateKnowledgeAcquisitionRequirements.js
src/core/knowledge/validateKnowledgeAcquisitionRequirementCollection.js
src/core/knowledge/buildKnowledgeAcquisitionRequirementQuery.js
src/core/knowledge/queryKnowledgeAcquisitionRequirements.js
src/core/knowledge/validateKnowledgeAcquisitionRequirementQueryResult.js
src/core/knowledge/index.js
```

### Existing collection/interview components

```text
src/core/roleEngine/buildEvidenceCollectionPlan.js
src/core/roleEngine/validateEvidenceCollectionPlan.js
src/interview/generateGapDrivenInterviewQuestion.js
src/interview/generateAdaptiveFollowupQuestion.js
src/interview/selectAdaptiveFollowup.js
src/interview/createInterviewRuntime.js
src/interview/advanceInterviewRuntime.js
```

### Measurement and observation components

```text
src/core/measurement/buildMeasurementDefinition.js
src/core/measurement/buildMeasurementFactorDefinition.js
src/core/measurement/buildMeasurementProfile.js
src/core/measurement/buildMeasureResult.js
src/core/observation/buildObservation.js
src/core/observation/buildMeasurement.js
src/core/observation/buildMeasurementResult.js
```

### Capability components

```text
src/core/capability/buildCapabilityDefinition.js
src/core/capability/buildCapabilityDesign.js
src/core/capability/buildCapabilityRecipe.js
src/core/capability/executeCapabilityRecipe.js
src/core/capability/buildCapabilityContributionMatch.js
src/core/capability/buildCapabilityExecutionResult.js
```

### Builder/generation components

```text
tools/imago-builder/plugins/measurement-module/buildMeasurementModuleSpec.js
tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan.js
tools/imago-builder/plugins/measurement-module/generateMeasurementModuleScaffold.js
tools/imago-builder/core/buildGenerationPlan.js
tools/imago-builder/core/writeGenerationPlan.js
```

### Authoritative architecture documents

```text
docs/15-architecture_specifications/KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md
docs/15-architecture_specifications/CORE_ROADMAP.md
docs/00-continuity/CONTINUITY.md
TASK_0100D-9_ARCHITECTURE_BOUNDARY_REVIEW.md
TASK_0100D-10_IMPLEMENTATION_REPORT.md
```

### 2.2 Repository state confirmed

The repository contains the completed and frozen D-series boundary, including:

- Requirement Foundation and Query Foundation;
- boundary freeze regression;
- boundary health check;
- exact public-export allowlist;
- authoritative freeze document.

No existing `KnowledgeAcquisitionPlan`, `KnowledgeAcquisitionDesign`, `KnowledgeAcquisitionSpecification`, acquisition-capability registry, acquisition artifact contract, requirement-satisfaction evaluator or knowledge-update service exists in the Knowledge namespace.

---

## 3. Current Downstream Inventory

| Component | Path/domain | Real responsibility | Current input/output | Compatibility as direct Requirement consumer | Decision |
|---|---|---|---|---|---|
| Evidence Collection Plan | `src/core/roleEngine/buildEvidenceCollectionPlan.js`; legacy role/interview Core | Converts `RoleCredibilityMap` signals into prioritized collection goals, preferred question types, execution modes, follow-up policies and coverage targets | Role map → operational interview collection plan | Low. It embeds planning, priority, question and runtime policy; input semantics do not match Requirement | **Excluded; legacy-specific** |
| Interview question generation | `src/interview/generateGapDrivenInterviewQuestion.js`, `generateAdaptiveFollowupQuestion.js`; Application/LLM | Produces concrete questions from candidate gaps or runtime answer weakness | Candidate/job/interview state → question text | None. It is generated artifact production plus LLM/runtime behavior | **Excluded; downstream Application** |
| Interview runtime | `src/interview/createInterviewRuntime.js`, `advanceInterviewRuntime.js`; Runtime | Executes interview flow and state transitions | Interview plan/session → runtime state | None. Too late and operational | **Excluded; Runtime** |
| Measurement Definition | `src/core/measurement/buildMeasurementDefinition.js`; Measurement Core | Defines a concrete measure and aggregation/scoring configuration | Dimension/measure-specific input → measurement definition | Partial only after route selection. It assumes measurement is the mechanism | **Not direct; possible later capability** |
| Measurement Profile/Factor | `src/core/measurement/*`; Measurement Core | Configures factors, weights, benchmarks and result interpretation | Measurement configuration → measure contracts/results | Too concrete and measurement-only | **Not direct; later implementation domain** |
| Observation | `src/core/observation/buildObservation.js`; Observation Core | Records an observed/not-observed signal with evidence metadata | Execution-produced signal → observation | Observation occurs after execution | **Excluded as first consumer** |
| Measurement Result | `src/core/observation/buildMeasurementResult.js`; Observation/Measurement | Aggregates observations into a calculated/insufficient-data result | Observation refs → result | Result is post-execution and not Requirement satisfaction | **Excluded as first consumer** |
| Capability Design | `src/core/capability/buildCapabilityDesign.js`; Capability Core | Describes a draft capability composition with components, boundaries and design principles | Capability design input → capability-domain design | Strong architectural precedent but wrong domain and non-deterministic timestamps | **Do not reuse directly; pattern adaptable** |
| Capability Definition | `src/core/capability/buildCapabilityDefinition.js`; Capability Core | Defines required/optional contributions and aggregation/coverage policies | Capability schema → definition | Represents evaluation capability, not acquisition solution demand | **Possible later registry input** |
| Capability Recipe | `src/core/capability/buildCapabilityRecipe.js`; Capability Core | Packages derivation rules for execution | Rules → executable recipe | Derived-only and already execution-oriented | **Later derived branch, not first consumer** |
| Capability execution | `src/core/capability/executeCapabilityRecipe.js`; Capability Core service | Executes rules against KnowledgeSnapshot and returns execution result | Snapshot + recipe → execution result | Explicit execution; too late | **Excluded as first consumer** |
| Capability Contribution Match | `src/core/capability/buildCapabilityContributionMatch.js`; Capability Core | Matches existing contributions to capability definition requirements, selects best contribution and emits satisfied/partial/missing/incompatible statuses | Definition + contributions → match | Semantically incompatible: evaluation of existing contributions, not matching acquisition capabilities to Requirement | **Excluded; no automatic reuse** |
| Measurement Module Spec | `tools/imago-builder/plugins/measurement-module/buildMeasurementModuleSpec.js`; Builder plugin | Specifies a concrete measurement code module, factors, scoring, generation flags and semantic completion | Module configuration → generation-ready spec | Too concrete, Builder-specific and measurement-only | **Excluded as direct consumer** |
| Measurement Module Plan | `tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan.js`; Builder plugin | Renders template registry into generated-file plan | Measurement module spec → GenerationPlan | File/code generation, not knowledge acquisition architecture | **Excluded; Builder only** |
| Generation Plan | `tools/imago-builder/core/buildGenerationPlan.js`; Builder | Lists files and generation metadata for atomic writing | Generator input → file plan | Name collision only; no semantic compatibility | **Excluded; Builder only** |
| Input/Evidence Store | `src/core/input/*`, `src/core/evidence/*`; Intake Core | Normalizes sources and stores extracted evidence | Sources/input bundle → evidence | Relevant after acquisition execution or external input arrival | **Later ingestion boundary** |
| Knowledge update/dimension aggregation | `src/core/dimension/*`; Knowledge derivation | Builds contributions, snapshots and derived states | Evidence/measurement contributions → knowledge state | Occurs after evidence/result exists | **Later update boundary** |

---

## 4. Existing Architecture Compatibility

### 4.1 Capability architecture precedent

The strongest compatible pattern in the repository is:

```text
CapabilityDesign
    →
CapabilityRecipe / CapabilityDefinition
    →
execution or aggregation
```

`buildCapabilityDesign.js` demonstrates that IMAGO Core already distinguishes:

- declarative design;
- concrete components;
- executable recipe;
- execution result.

This supports using **Design** as a domain term before generation and execution. However, `CapabilityDesign` itself cannot be reused because it is tied to capability composition, component roles, evidence directions and capability-specific provenance.

### 4.2 Measurement architecture

Measurement contracts are mature but concrete. They include factors, scoring configuration, thresholds, benchmarks, observation policies and result calculation. Therefore measurement can be one acquisition capability family, but the Knowledge Requirement cannot be translated directly into measurement without excluding valid non-measurement routes such as:

- human-provided statements;
- imported structured records;
- document evidence;
- deterministic derivation from existing knowledge;
- runtime interview evidence.

### 4.3 Builder architecture

The Builder has a clean `Spec → Plan → Generated Files → Write` separation. This is useful as a structural analogy, but its contracts describe software artifact generation, not knowledge acquisition. Reusing Builder plan/spec objects would contaminate the Knowledge/Application boundary with paths, templates, files and generation flags.

### 4.4 Interview architecture

FRINGE Interview already implements concrete question generation, follow-up selection and runtime execution. These components are consumers of candidate/job/interview state and include product behavior, LLM prompting and runtime decisions. They must remain possible downstream adapters, not the architectural center of generic Knowledge Acquisition.

---

## 5. Semantic Gap

`KnowledgeAcquisitionRequirement` provides:

- requirement type;
- required knowledge layer;
- scope and scope reference;
- direct causal Strategy reference;
- transitive traceability;
- deterministic identity and provenance.

It deliberately does not provide:

- the structural form of the acquisition solution;
- the output units a downstream mechanism must produce;
- the prerequisite topology for derived acquisition;
- the abstract capability obligations that a concrete mechanism must meet;
- the boundary between a valid acquisition result and unrelated output;
- a mechanism-neutral handoff to capability matching or artifact generation.

The first operational components in the repository already assume choices that have not yet been represented:

- `EvidenceCollectionPlan` assumes interview collection goals and question behavior;
- Measurement contracts assume measurement;
- Builder specs assume a software module to generate;
- Capability recipes assume executable derivation rules;
- Interview generators assume questions and LLM/runtime context.

The missing responsibility is therefore a **design handoff**, not an operational plan.

---

## 6. Candidate Concepts

### A. Knowledge Acquisition Specification

**Strengths**

- could define expected output constraints;
- resembles Builder `MeasurementModuleSpec` naming.

**Weaknesses**

- “Spec” in the repository is strongly associated with a concrete generator input;
- likely to drift toward factors, scoring, generation flags or artifact schemas;
- if kept purely abstract, it risks restating Requirement fields without adding autonomous responsibility.

**Decision:** rejected as first layer. A later concrete acquisition artifact or module may legitimately have a specification.

### B. Knowledge Acquisition Plan

**Strengths**

- familiar orchestration term;
- could organize multiple activities.

**Weaknesses**

- repository plans (`EvidenceCollectionPlan`, `MeasurementModulePlan`, `GenerationPlan`) contain priority, sequence, execution modes, generation or concrete targets;
- would prematurely introduce method/source/channel/artifact choices;
- is too close to execution and orchestration.

**Decision:** rejected as first layer.

### C. Knowledge Acquisition Design

**Strengths**

- aligned with the existing `CapabilityDesign` precedent;
- can describe solution structure while remaining before capability matching, generation and runtime;
- supports both elementary and derived paths in one contract;
- can remain deterministic and mechanism-neutral;
- adds a genuine new responsibility: solution-shape definition.

**Weaknesses/risks**

- must be tightly bounded to prevent it becoming a Plan;
- must not copy the broad, timestamped normalization style of current `CapabilityDesign` without adapting it to frozen Knowledge conventions;
- must not contain concrete sources, methods, channels, questions or selected capability IDs.

**Decision:** approved.

### D. Knowledge Acquisition Intent

**Weaknesses**

- Need already expresses why acquisition is necessary;
- Strategy expresses transformation class;
- Requirement expresses the demanded final condition;
- “Intent” adds no independently testable domain information.

**Decision:** rejected as redundant.

### E. Acquisition Capability Matching

**Strengths**

- grounded in an existing Capability domain;
- introduces demand/supply association without execution;
- can be deterministic and non-ranked.

**Weaknesses**

- no acquisition-capability registry or compatibility contract currently exists;
- Requirement alone does not define enough solution-shape constraints to distinguish, for example, acceptable elementary evidence capture from derived composition;
- direct matching would force each capability adapter to reinterpret Requirement semantics independently;
- existing `CapabilityContributionMatch` is semantically incompatible and satisfaction-oriented.

**Decision:** valid later layer, after Knowledge Acquisition Design.

### F. Measurement-oriented bridge

**Strengths**

- measurement architecture already exists;
- appropriate for behavioral observation and quantified factors.

**Weaknesses**

- not all knowledge acquisition is measurement;
- would make elementary acquisition unnecessarily measurement-centric;
- derived acquisition may use deterministic composition without observation;
- direct coupling would narrow future source and evidence mechanisms.

**Decision:** rejected as generic first layer; measurement remains one downstream capability family.

### G. Artifact-generation bridge

**Strengths**

- tangible outputs such as question sets, evidence requests or observation protocols;
- Builder already supports artifact generation patterns.

**Weaknesses**

- an artifact type cannot be selected before solution shape and capability compatibility are defined;
- generation is distinct from design;
- derived acquisition may require no collection artifact at all.

**Decision:** rejected as first layer; valid after design and capability selection.

---

## 7. Comparison Matrix

Scale: High is favorable except in the two risk columns.

| Candidate | Semantic purity | Non-redundancy | Elementary support | Derived support | Runtime separation | Generation separation | Capability compatibility | Measurement neutrality | Deterministic testability | Premature abstraction risk | Overlap risk |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Acquisition Specification | Medium | Low–Medium | High | Medium | High | Medium | Medium | Medium | High | Medium | High |
| Acquisition Plan | Low | Medium | High | High | Medium | Medium | High | High | High | High | High |
| **Acquisition Design** | **High** | **High** | **High** | **High** | **High** | **High** | **High** | **High** | **High** | **Medium, controllable** | **Low–Medium** |
| Acquisition Intent | High | Low | Medium | Medium | High | High | Low | High | High | High | Very high |
| Capability Matching | Medium–High | High | High | High | High | High | Very high | High | High | Medium | Medium |
| Measurement Bridge | Medium | High | High for observed data | Low–Medium | High | High | Medium | Low | High | Medium | High |
| Artifact Generation Bridge | Medium | High | High | Low–Medium | Medium | Low | Medium | Medium | Medium | High | Medium |

---

## 8. Elementary Requirement Path

For:

```text
elementary_knowledge_availability_required
```

the downstream architecture may eventually support:

- human-provided evidence;
- structured source import;
- document evidence extraction;
- runtime interview observation;
- measurement/observation;
- generated evidence requests or question sets.

The first Design must not choose among these routes. It should only define an elementary acquisition solution shape, including:

- direct causal Requirement reference;
- target scope and target knowledge unit references resolvable from the causal context;
- expected output topology as primary evidence/elementary knowledge contribution;
- abstract evidence obligations and admissibility boundaries;
- required capability classes expressed as obligations, not selected implementations;
- trace references to the resolved upstream context.

It must not contain source IDs, method IDs, channel IDs, question text, execution steps, priority or selection.

---

## 9. Derived Requirement Path

For:

```text
derived_knowledge_availability_required
```

the downstream architecture may eventually support:

- prerequisite elementary knowledge resolution;
- dependency graph evaluation;
- deterministic derivation rules;
- capability recipe generation or selection;
- derived result production;
- provenance-preserving knowledge update.

The same Design contract should use a derived design mode and define:

- direct causal Requirement reference;
- target derived knowledge unit;
- prerequisite topology or prerequisite obligations;
- expected derived output topology;
- abstract derivation-capability obligations;
- constraints ensuring provenance and dependency traceability.

It must not select a concrete evaluator or recipe, execute rules, declare satisfaction or update the matrix.

### Shared first object vs split branches

Elementary and derived Requirements should share the same first downstream contract because both need the same architectural handoff:

```text
required final condition
    →
abstract solution shape
```

They may diverge through an allowlisted `designMode` and mode-specific invariant sections inside the Design. The bifurcation must occur downstream of Requirement and must not alter the frozen Strategy → Requirement cardinality.

---

## 10. Recommended First Downstream Object

### Name

```text
KnowledgeAcquisitionDesign
```

### Definition

A deterministic, read-only Core declarative contract that transforms one validated `KnowledgeAcquisitionRequirement`, together with its explicitly resolved causal context, into the abstract structure and obligations of a valid acquisition solution without selecting concrete capabilities or creating executable artifacts.

### Minimal autonomous responsibility

```text
Define the mechanism-neutral solution shape required to produce
knowledge that could later satisfy one Requirement.
```

This responsibility is absent from all frozen upstream levels:

- Need does not define a solution;
- Strategy only classifies elementary vs derived transformation;
- Requirement only declares the final knowledge availability condition.

### Initial cardinality

```text
1 Requirement → 1 Design
```

No aggregation, splitting, alternatives or ranking in the first version.

### Direct causal reference

```text
sourceRequirementRef
```

### Transitive trace references

Where available and resolved from the supplied causal context:

```text
sourceStrategyRef
sourceNeedRef
sourceOpportunityRef
sourceCoverageRef
sourcePersonKnowledgeMatrixRef
```

These remain traceability only.

### Initial design modes

Names must be finalized by Task 0100E-2 after checking naming conventions, but the semantic branches should be exactly:

```text
elementary acquisition design
derived acquisition design
```

No additional route type is justified initially.

### Properties that may be admitted

The future contract may contain only fields needed to represent:

- deterministic identity and version;
- design mode;
- direct Requirement reference;
- target scope and target knowledge-unit references;
- expected output topology;
- prerequisite topology for derived mode;
- abstract capability obligations;
- semantic boundaries/non-claims;
- provenance, dependency references, metadata and extensions following frozen conventions.

### Explicitly forbidden properties/responsibilities

The Design must not contain:

```text
priority
rank
score
selected/best capability
concrete capability ID
source selection
method selection
channel selection
question text or prompt
artifact files or templates
execution steps or sequence
runtime state
observation values
measurement result
satisfaction/fulfillment/completion state
knowledge update mutation
network, persistence or LLM behavior
```

### Relationship to capability

The Design states capability **obligations**. A later matching layer compares those obligations with available acquisition capabilities. It does not select a capability itself.

### Relationship to planning

A Plan, if later justified, consumes an approved Design plus matched/selected capabilities. It must not be the first consumer of Requirement.

### Relationship to generation

Generated acquisition artifacts consume a Design and a concrete capability/configuration decision. Design itself contains no question set, protocol, source request or code-generation file.

### Relationship to runtime

Runtime executes generated or configured acquisition artifacts. Runtime cannot mutate or be embedded in Design.

### Relationship to satisfaction evaluation

Satisfaction evaluation consumes the Requirement and post-acquisition knowledge/coverage evidence. It must not be inferred from Design creation, artifact generation or execution completion.

---

## 11. Precise Input for Future Task 0100E-2

The future Task 0100E-2 must start from the following explicit input boundary:

```text
{
  requirement: KnowledgeAcquisitionRequirement,
  resolvedContext: {
    strategy: KnowledgeAcquisitionStrategy,
    need: KnowledgeAcquisitionNeed,
    opportunity: KnowledgeOpportunity,
    coverage: KnowledgeCoverage,
    personKnowledgeMatrix: PersonKnowledgeMatrix
  }
}
```

Requirements for this input:

1. `requirement` must be valid under the frozen Requirement validator.
2. `strategy.id` must match `requirement.sourceStrategyRef`.
3. Each upstream object must match the next direct causal reference.
4. Transitive references in Requirement must match the resolved chain.
5. All input objects must be treated as read-only and remain unmodified.
6. The resolved context is supplied explicitly; the builder must not use persistence, registries, network calls or implicit resolvers.
7. Task 0100E-2 must decide whether this input envelope remains a function input only or deserves a private/standalone context validator; it must not add a second public domain object merely for convenience.

This input is necessary because the Requirement contains stable references and scope identity but deliberately does not embed the full knowledge-unit and dependency information needed to build a non-duplicative Design.

Expected Task 0100E-2 output:

```text
KnowledgeAcquisitionDesign
```

with one Design per Requirement and no collection/evaluator/query foundation unless separately justified by subsequent tasks.

---

## 12. Components Explicitly Excluded as Direct Consumers

The following components are explicitly excluded:

1. **`buildEvidenceCollectionPlan`** — because it introduces priority, preferred question types, execution modes, follow-up policies and coverage targets and consumes RoleCredibilityMap rather than Requirement.
2. **Interview question generators** — because they produce concrete artifacts, use product/interview context and may invoke LLM adapters.
3. **Interview runtime** — because it executes and maintains operational state.
4. **MeasurementDefinition / MeasurementProfile / MeasurementModuleSpec** — because they assume measurement has already been chosen.
5. **MeasurementModulePlan / GenerationPlan** — because they are Builder file-generation structures.
6. **Observation / MeasurementResult** — because they are post-execution outputs.
7. **CapabilityRecipe / executeCapabilityRecipe** — because they are derived execution mechanisms.
8. **CapabilityContributionMatch** — because it evaluates existing contributions and uses satisfaction-like statuses and best-match selection, not acquisition-capability compatibility.
9. **EvidenceStore/InputBundle** — because they ingest material after or independently of acquisition execution; they do not design how a Requirement will be addressed.
10. **KnowledgeSnapshot/update/aggregation services** — because they update or derive knowledge after evidence/results exist.

None should be wired directly to `KnowledgeAcquisitionRequirement` in Task 0100E-2.

---

## 13. Rejected Alternatives

### Knowledge Acquisition Specification

Rejected because it either duplicates Requirement or becomes a concrete artifact/module specification too early. In this repository, `Spec` already carries generation readiness and concrete configuration semantics.

### Knowledge Acquisition Plan

Rejected because repository plan objects are operational or generative. A Plan before capability matching would either be empty or would prematurely choose methods, sources, channels or sequence.

### Knowledge Acquisition Intent

Rejected because Need, Strategy and Requirement already encode motivation, transformation class and desired condition.

### Direct Acquisition Capability Matching

Rejected as immediate next task because no acquisition-capability contract/registry exists and Requirement alone lacks a normalized solution-shape handoff. It is recommended after Design.

### Direct Measurement Bridge

Rejected because acquisition is broader than measurement and derived knowledge may require composition rather than observation.

### Direct Artifact Generation Bridge

Rejected because generated artifacts require a prior design and mechanism decision. Derived acquisition may not generate a collection artifact.

### Direct reuse of CapabilityDesign

Rejected because its fields and invariants are capability-specific, include draft status and ambient timestamps, and do not carry the frozen Requirement causal chain. Its separation pattern is reusable, not its contract.

---

## 14. Migration and Compatibility Risks

### Risk 1 — Design becomes a renamed Plan

Mitigation: prohibit sequence, priority, methods, sources, channels, selected capability and runtime fields.

### Risk 2 — Design duplicates Requirement

Mitigation: require the Design to add normalized output topology, prerequisite topology and capability obligations. A Design containing only copied Requirement fields must be invalid.

### Risk 3 — Measurement becomes the default route

Mitigation: keep capability obligations generic and treat measurement as one later capability family.

### Risk 4 — Legacy EvidenceCollectionPlan is reused automatically

Mitigation: classify it explicitly as role/interview-specific and require an adapter after capability/artifact decisions.

### Risk 5 — Existing capability match semantics are reused

Mitigation: do not reuse `CapabilityContributionMatch`; a future acquisition-capability match must not emit satisfaction statuses or choose a “best contribution”.

### Risk 6 — Derived design embeds executable rules

Mitigation: derived Design may define prerequisite topology and capability obligations but not rule bodies, recipes or execution results.

### Risk 7 — satisfaction leaks upstream

Mitigation: Design creation, capability matching, artifact generation and execution completion must never imply Requirement satisfaction.

### Risk 8 — deterministic conventions regress

Mitigation: Task 0100E-2 should follow D-series stable serialization, deterministic ID, deep cloning, standalone validation, canonical ordering and no ambient timestamps.

---

## 15. Recommended Task Sequence

### 0100E-2 — Knowledge Acquisition Design Foundation

**Layer:** IMAGO Core, downstream declarative design.

**Responsibility:** build and validate one deterministic `KnowledgeAcquisitionDesign` from one Requirement and its explicitly resolved causal context.

**Input:** exactly the envelope defined in Section 11.

**Output:** one Design with elementary or derived design mode.

**Exclusions:** collection evaluator, query, capability matching, selected mechanisms, artifacts, planning, runtime, satisfaction and matrix update.

### 0100E-3 — Knowledge Acquisition Design Collection and Evaluation Foundation

Justified only after E-2 contract stability. Deterministically map Requirement collections/query results to 1:1 Design collections.

### 0100E-4 — Knowledge Acquisition Design Query Foundation

Read-only exact-match querying over Designs, following the frozen D-series Query conventions.

### 0100E-5 — Acquisition Capability Contract and Matching Review/Foundation

First define or approve a generic acquisition-capability supply contract, then produce non-ranked compatibility matches against Design obligations. Do not reuse CapabilityContributionMatch automatically.

### 0100E-6 — Acquisition Artifact Design/Generation Boundary Review

Determine when matched capability plus Design can produce question sets, evidence requests, observation protocols, derivation instructions or measurement-module specifications.

### 0100E-7 — Acquisition Execution Boundary Review

Separate generated/configured artifacts from runtime execution and execution state.

### 0100E-8 — Acquisition Observation/Result Boundary

Normalize execution outputs as evidence, observations or derived results without declaring satisfaction.

### 0100E-9 — Requirement Satisfaction Evaluation Boundary Review

Evaluate Requirement against updated knowledge/coverage as a separate deterministic decision contract. Do not add state to Requirement.

### 0100E-10 — Knowledge Update Boundary Review

Define explicit ingestion/update from accepted evidence/results into EvidenceStore, Dimension contributions, KnowledgeSnapshot and eventually PersonKnowledgeMatrix recalculation.

This sequence is directional, not an authorization to implement beyond E-2.

---

## 16. Final Architecture Decision

```text
APPROVED DIRECTION:
Knowledge Acquisition Design
```

The first legitimate consumer of `KnowledgeAcquisitionRequirement` is a mechanism-neutral Design contract because it introduces the minimum missing responsibility: defining the abstract acquisition solution shape and capability obligations required to make the declared knowledge condition achievable.

It is compatible with the repository's existing separation between declarative `CapabilityDesign`, executable `CapabilityRecipe`, generated Builder plans and runtime results, while avoiding direct reuse of semantically incompatible contracts.

The exact next task is:

```text
0100E-2 — Knowledge Acquisition Design Foundation
```

Its precise input is the validated Requirement plus the explicitly resolved and causally coherent Strategy → Need → Opportunity → Coverage → PersonKnowledgeMatrix context defined in Section 11.

---

## 17. Verification

No downstream implementation was introduced.

No files under these namespaces were modified:

```text
src/
scripts/
tools/
docs/
```

except for creation of this task review at repository root and its manifest.

No public export was added.

No builder, validator, evaluator, query, health module, orchestrator, plan, action, execution, satisfaction evaluator or runtime contract was created.

Existing gates were executed against the untouched repository:

```text
node scripts/test_all_core.js
→ IMAGO Core all tests PASSED

node scripts/fringe_health_check.js
→ All health checks passed.
```

No Git write operation was executed.

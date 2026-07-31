# IMAGO Core — Architecture Map

Status: **CURRENT**

Verified through: **Task 0100E-16**

## Principle

IMAGO does not evaluate a person in the absolute. The Core organizes reconstructable knowledge while preserving evidence, origin, confidence, version, provenance and dependencies.

```text
Evidence → Measurement → Knowledge → Derived Knowledge → Composed View
```

Evidence remains authoritative. Knowledge is reconstructable. Elementary and derived knowledge remain distinct. Deterministic Foundations do not introduce person scores, implicit evaluation or LLM inference.

## Current end-to-end map

```text
Input / Evidence                                      [Core]
→ Observation                                         [Core]
→ MeasurementResult / MeasurementDimensionMapping    [Core]
→ DimensionContribution / KnowledgeLedger             [Core]
→ KnowledgeSnapshot / DimensionKnowledgeState         [Core]
→ CapabilityRecipe / DerivedDimensionKnowledgeState   [Core]
→ PersonKnowledgeMatrix                               [Core]
→ KnowledgeCoverage                                   [Core]
→ KnowledgeOpportunity                                [Core]
→ KnowledgeAcquisitionNeed                            [Core]
→ KnowledgeAcquisitionStrategy                        [Core]
→ KnowledgeAcquisitionRequirement                     [Core]
→ KnowledgeAcquisitionDesign                          [Core]
→ KnowledgeAcquisitionCapabilityMatch                 [Core]
→ KnowledgeAcquisitionSolutionDecision                [Application]
→ KnowledgeAcquisitionCapabilityCompositionDesign     [Application; composed only]
→ KnowledgeAcquisitionCapabilityConfiguration         [Application; single/composed]
→ KnowledgeAcquisitionPlan                            [Application; implemented]
→ KnowledgeAcquisitionRuntimeSession                  [Application; implemented, stateful, pre-Execution]
→ KnowledgeAcquisitionExecution                       [Application; implemented, pre-invocation]
```

Query Foundations provide deterministic, read-only access for Matrix, Coverage, Opportunity, Need, Strategy and Requirement without reinterpreting upstream semantics.

## Core-owned layers

### Evidence, Measurement and Contribution

`InputBundle`, sources, Evidence, Observation, MeasurementResult, declarative mappings and DimensionContribution preserve the distinction between facts, measures and contributions. Raw source content is not copied into PersonKnowledgeMatrix.

### Elementary and derived knowledge

```text
DimensionContribution[]
→ KnowledgeLedger
→ KnowledgeSnapshot
→ DimensionKnowledgeState[]
```

```text
KnowledgeSnapshot
→ DerivedKnowledgeRule / CapabilityRecipe
→ CapabilityExecutionResult
→ DerivedDimensionKnowledgeState[]
```

Ledger and Snapshot are not mutated. Derived states are not appended to the elementary Contribution Ledger.

### PersonKnowledgeMatrix

The matrix is a deterministic, reconstructable materialized view. It preserves elementary and derived layers, shared dimensions without fusion, lineage, version context and dependency references. It is not an evidence store and does not create a person-level score.

### Declarative Knowledge Acquisition boundary

```text
PersonKnowledgeMatrix
→ Coverage
→ Opportunity
→ Need
→ Strategy
→ Requirement
```

This boundary describes available knowledge, incomplete composition, the missing layer, a general transformation category and the required knowledge availability. It does not prescribe method, source, channel, priority, plan or execution. Its mappings, cardinality and causality are frozen by `KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md`.

### Design and Match

`KnowledgeAcquisitionDesign` is the mechanism-neutral declarative consumer of Requirement. It receives explicitly resolved causal context and performs no lookup.

`KnowledgeAcquisitionCapabilityMatch` evaluates one immutable candidate snapshot per invocation. It returns `compatible`, `incompatible` or `indeterminate`. Discovery, availability, ranking and selection are not Core responsibilities.

## Application-owned layers

### Solution Decision

Application owns candidate discovery/resolution and the deterministic, auditable `KnowledgeAcquisitionSolutionDecision`. Supported modes are `single`, `composed`, `none` and `deferred`. The Decision does not configure, plan or execute a solution.

### Capability Composition Design

For `composed` only, Application builds exactly one declarative Composition Design from the Decision, source Design and selected capability snapshots. It records roles, contribution responsibilities, logical dependencies and declarative conditions.

Local validation proves only self-contained contract invariants. Contextual validation separately proves correspondence with the supplied Decision and Design. Neither validation performs discovery, matching or reselection.

## Runtime and Reporting legacy

The repository contains existing, health-checked Runtime, Beta Session and Reporting pipelines. They predate the Phase D/E downstream architecture and are not currently consumers of Solution Decision or Composition Design.

Their existence does not imply integration with Knowledge Acquisition. Any connection requires an explicitly reviewed Application/Runtime/Adapter boundary.

## Capability Configuration

Task 0100E-10 implements `KnowledgeAcquisitionCapabilityConfiguration` as one unified Application-owned declarative artifact for applicable `single` and `composed` Decisions. The composed path requires the corresponding Composition Design; the single path does not fabricate one. `none` and `deferred` produce no Configuration.

Configuration binds only explicit non-secret declarative values to already selected capability references. It does not repeat composition topology, resolve providers or adapters, order invocations, plan or execute.

## Knowledge Acquisition Plan

Task 0100E-12 implements `KnowledgeAcquisitionPlan` as the first consumer of a valid Configuration. It is an immutable Application-owned declarative organization of one item per selected capability. Plan scope is exactly the Configuration capability scope; Plan Dependencies reference and preserve composed logical dependencies without converting them into executable ordering. The Plan contains no state, scheduling, Runtime, execution, results, provider binding or invocation payload. No intermediate contract is introduced.

## Knowledge Acquisition Runtime Session

Task 0100E-13 approves and E-14 implements `KnowledgeAcquisitionRuntimeSession` as the first operational boundary and first consumer of a valid Plan. It is Application-owned and holds a distinct stable session identity, exact Plan/Plan Item causal refs, closed lifecycle, item-state progress, active-item selection and explicit operational timestamps. One Plan may cause zero or more Sessions; each Session refers to exactly one Plan. Resume/reconstruction preserves Session identity, while a new `sessionKey` creates a new Session for the same immutable Plan.

The Session is pre-Execution. It does not bind providers, create invocation payloads, execute, retry, collect results, persist events, update knowledge or assess Requirement satisfaction. No declarative Runtime Definition is required between Plan and Session.

## Approved Execution Direction and Side-Effect Boundary

Task 0100E-15 approves `KnowledgeAcquisitionExecution` as the Application-owned first direct Session consumer. It represents one explicitly authorized semantic attempt for one exact active Session item and preserves exact Session and Plan Item causality. No intermediate readiness, preparation, action or execution-request contract is required.

Task 0100E-16 implements Execution as an immutable, integration-neutral description with stable causal identity and the closed lifecycle `created`, `selected`, `ready_for_invocation`. It never mutates Session or Plan and stops before the separate Knowledge Acquisition Invocation Boundary. Invocation and every external effect require the repository-first Task 0100E-17 architecture review.

## Not approved or implemented downstream

- acquisition Action or executable Recipe beyond the approved semantic Execution;
- provider/adapter resolution;
- invocation and runtime orchestration;
- execution result and observation ingestion for this boundary;
- Requirement satisfaction;
- Knowledge Update;
- Runtime/Reporting legacy integration.

The next gate is a post-Runtime-Session architecture review only; it does not pre-authorize Execution, provider binding, invocation, persistence or results.

## Dependency direction

Lower layers must not import higher composed views. Core does not discover Application candidates. Application decisions may consume immutable Core outputs. Runtime concerns must not be added to Core contracts to absorb downstream ambiguity.

## Identity, versioning and immutability

- contract version and instance identity remain distinct;
- identities are deterministic, canonical and independent of input order and timestamps;
- inputs are not mutated in place;
- transferred structures are caller-owned deep clones where the contracts require it;
- runtime freezing is not inferred from immutability guarantees.

## Guardrails

Without an explicit implementation task, do not introduce person scoring, ranking, recommendation, diagnosis, automatic decision-making, Planning, Execution, Requirement satisfaction or Knowledge Update.

`not observed` does not mean `absent`.

## Verification

```powershell
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

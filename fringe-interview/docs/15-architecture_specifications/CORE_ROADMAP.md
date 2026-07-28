# IMAGO Knowledge Engine Roadmap

Version: 1.0

Status: COMPLETED

Owner: Architect

Last Updated: 2026-07-23

---

# Purpose

Questo documento rappresenta la roadmap architetturale e implementativa
del Knowledge Engine di IMAGO.

Non descrive la roadmap del Builder.

Non sostituisce le specifiche dei singoli task.

Non rappresenta lo storico completo del prodotto FRINGE Interview.

Il repository reale rimane la fonte di verità per lo stato implementativo.

---

# Architectural Direction

Observation
↓
MeasurementResult
↓
DimensionContribution
↓
Elementary DimensionKnowledgeState
↓
KnowledgeSnapshot
↓
CapabilityRecipe
↓
DerivedKnowledgeResult
↓
Derived DimensionKnowledgeState
↓
Person Knowledge Matrix

---

# Persistence Direction

Authoritative history:

Observation Ledger
↓
Dimension Contribution Ledger

Reconstructable state:

DimensionKnowledgeState
CapabilityResult
Person Knowledge Matrix Snapshot

---

# Completed Foundation

## 0100B-1 — Measurement and Capability Foundation

Status: COMPLETED

[breve descrizione coerente col repository]

## 0100B-2 — Dimension Knowledge State Foundation

Status: COMPLETED

[breve descrizione coerente col repository]


## 0100B-3 — Dimension Contribution Foundation

Status: COMPLETED

Introduced the immutable, deterministic DimensionContribution contract connecting one Measurement and its normalized MeasurementResult provenance to one Dimension without aggregation or automatic mapping.

---

## 0100B-4 — Measurement-to-Dimension Mapping Foundation

Status: COMPLETED

Introduced a deterministic, declarative mapping contract and mapper that converts a valid MeasurementResult into one or more validated DimensionContribution objects without updating DimensionKnowledgeState.

---

## 0100B-5 — Elementary Dimension Aggregation Foundation

Status: COMPLETED

Introduced deterministic aggregation of validated DimensionContribution objects into a valid elementary DimensionKnowledgeState, preserving declarative direction, stable provenance, order independence, and conservative coverage.

---

## 0100B-6 — Knowledge Ledger and Snapshot Foundation

Status: COMPLETED

Introduced an immutable in-memory KnowledgeLedger with canonical ordering and duplicate protection, plus deterministic KnowledgeSnapshot reconstruction through the existing elementary dimension aggregator.

---

## 0100B-7 — Derived Knowledge Foundation

Status: COMPLETED

Introduced declarative derived-knowledge rules evaluated deterministically over a validated KnowledgeSnapshot, producing explicit DerivedKnowledgeResult objects with conservative confidence, compact dependency tracking, derived provenance, single-pass execution, and no Capability integration or automatic Ledger append.

Pipeline introduced:

KnowledgeSnapshot
↓
DerivedKnowledgeRule[]
↓
DerivedKnowledgeResult[]

---

## 0100B-8 — Capability Recipe Execution Foundation

Status: COMPLETED

Introduced versioned CapabilityRecipe execution over KnowledgeSnapshot through the existing Derived Knowledge evaluator, producing validated CapabilityExecutionResult objects without mutating source knowledge or creating derived DimensionKnowledgeState objects.

Pipeline introduced:

KnowledgeSnapshot
↓
CapabilityRecipe
↓
DerivedKnowledgeRule[]
↓
CapabilityExecutionResult

---

## 0100B-9 — Derived Dimension State Foundation

Status: COMPLETED

Introduced explicit DerivedDimensionKnowledgeState objects reconstructed from validated CapabilityExecutionResult objects through declarative derived-dimension mappings, deterministic grouping and aggregation, conservative confidence, versioned Capability/Recipe provenance, and no mutation of elementary knowledge or Contribution Ledger append.

Pipeline introduced:

CapabilityExecutionResult
↓
DerivedDimensionKnowledgeState[]

Elementary DimensionKnowledgeState remains reconstructed from evidence, while DerivedDimensionKnowledgeState is reconstructed from KnowledgeSnapshot + CapabilityRecipe + rule versions.

---

## 0100B-10 — Person Knowledge Matrix Foundation

Status: COMPLETED

Introduced a deterministic, reconstructable PersonKnowledgeMatrix composed from one validated KnowledgeSnapshot, a minimal technical subject reference, and validated DerivedDimensionKnowledgeState objects. The matrix preserves explicit elementary and derived layers, shared dimensions without fusion, compact indexes, technical summary, lineage, version context, provenance, and dependency references. It does not modify the Ledger or Snapshot and does not introduce a person-level score.

Pipeline introduced:

KnowledgeSnapshot + DerivedDimensionKnowledgeState[] + subjectRef
↓
PersonKnowledgeMatrix

Phase 0100B — Knowledge Engine Foundation

Status: COMPLETED

The repository now provides the tested pipeline from Observation through PersonKnowledgeMatrix.

# Current Task

## 0100C-1 — Person Knowledge Matrix Query Foundation

Status: COMPLETED

Introduced deterministic, validated and read-only queries over PersonKnowledgeMatrix using allowlisted filters for Dimension, knowledge layer, Capability, Recipe and Recipe version. Multiple filters use AND semantics; results preserve elementary/derived separation, canonical ordering and caller-owned input immutability, without scoring, ranking, inference, LLM or network access.

Pipeline introduced:

PersonKnowledgeMatrix
↓
PersonKnowledgeQuery
↓
PersonKnowledgeQueryResult

## 0100C-2 — Knowledge Coverage Foundation

Status: COMPLETED

Introduced deterministic, read-only KnowledgeCoverage evaluation over a validated PersonKnowledgeMatrix, optionally restricted through the existing PersonKnowledgeQuery. Coverage describes only the amount and structure of knowledge currently available through categorical states, technical counts, existing state coverage/confidence references, compact lineage and deterministic identity. It does not evaluate the person and introduces no score, ranking, recommendation, inference, LLM, network access or persistence.

Pipeline introduced:

PersonKnowledgeMatrix
↓
PersonKnowledgeQuery (optional)
↓
KnowledgeCoverage

## 0100C-3 — Knowledge Coverage Query Foundation

Status: COMPLETED

Introduced deterministic, validated and read-only queries over KnowledgeCoverage using allowlisted filters for Dimension, Capability, coverage state, knowledge layer and overall coverage state. Multiple filters use AND semantics; results are deep-cloned, canonically ordered and descriptive only, without scoring, ranking, priority, recommendation, inference, LLM, network access or persistence.

Pipeline introduced:

KnowledgeCoverage
↓
KnowledgeCoverageQuery
↓
KnowledgeCoverageQueryResult

## 0100D-1 — Knowledge Opportunity Foundation

Status: COMPLETED

Introduced deterministic, neutral and read-only KnowledgeOpportunity and KnowledgeOpportunityCollection contracts derived exclusively from validated KnowledgeCoverage states. The implemented opportunity types are `elementary_layer_only` and `derived_layer_only`; `knowledge_not_available` was not introduced because the current KnowledgeCoverage contract does not retain absent Dimension or Capability entities. Opportunities describe only non-composed knowledge availability and never a gap, weakness or insufficiency of the person. No ranking, priority, weighting, recommendation, question strategy, acquisition strategy, inference, LLM, network access or persistence was introduced.

Pipeline introduced:

KnowledgeCoverage
↓
KnowledgeOpportunity
↓
KnowledgeOpportunityCollection

## 0100D-2 — Knowledge Opportunity Query Foundation

Status: COMPLETED

Implemented deterministic read-only querying of KnowledgeOpportunityCollection through allowlisted filters and AND semantics.

## 0100D-3 — Knowledge Acquisition Need Foundation

Status: COMPLETED

Implemented deterministic KnowledgeAcquisitionNeed and KnowledgeAcquisitionNeedCollection contracts derived exclusively from validated KnowledgeOpportunity entities. Effective mappings are `elementary_layer_only → derived_knowledge_required` and `derived_layer_only → elementary_knowledge_required`. Each source opportunity produces exactly one traceable need. No acquisition method, strategy, question, selection, ranking, priority, scoring, inference, LLM, network access or persistence was introduced.

## 0100D-4 — Knowledge Acquisition Need Query Foundation

Status: COMPLETED

Implemented deterministic, read-only querying of KnowledgeAcquisitionNeedCollection through eight allowlisted filters and AND semantics. Query results are validated, deep-cloned, canonically ordered and descriptive only. `sourceOpportunityType` is treated exclusively as a derived technical traceability and contract-validation field. No ranking, priority, recommendation, selection, strategy, method, question, inference, LLM, network access or persistence was introduced.

## 0100D-5 — Knowledge Acquisition Strategy Foundation

Status: COMPLETED

Implemented deterministic KnowledgeAcquisitionStrategy and KnowledgeAcquisitionStrategyCollection contracts derived exclusively from validated KnowledgeAcquisitionNeed entities. Effective mappings are `elementary_knowledge_required → elementary_knowledge_acquisition → elementary` and `derived_knowledge_required → derived_knowledge_composition → derived`. Each source need produces exactly one traceable strategy category. The Foundation does not execute acquisition or composition and introduces no plan, method, channel, question, selection, ranking, priority, recommendation, inference, LLM, network access or persistence.

## 0100D-6 — To be defined by Architect

Status: PLANNED

No implementation has been started and no perimeter has been assigned.

---

# Architectural Guardrails

[...]

---

# Maintenance Rules

- Il Builder aggiorna questo documento quando un task cambia stato.
- I task completati restano visibili.
- Non registrare come completato ciò che non è presente e testato nel repository.
- Non duplicare qui la specifica completa del task.
- Le modifiche di direzione architetturale sono approvate dall’Architect.


Phase 0100B — Knowledge Engine Foundation (Revised)
Vision

The objective of this phase is to transform IMAGO from an interview analysis engine into a general-purpose Knowledge Engine.

The system must not simply calculate scores.

Its primary responsibility is to progressively build a structured and explainable representation of a person's professional knowledge.

The fundamental architectural principle becomes:

Observations are immutable.

Knowledge evolves.

Models evolve.

Recipes evolve.

Knowledge can always be recomputed.

The persistent value of IMAGO is therefore the accumulated evidence, not the temporary interpretation produced by a specific model version.

Knowledge Engine Pipeline

The complete pipeline becomes:

                 INPUT SOURCES

 CV
 JD
 Interview
 LinkedIn
 Assessments
 Tests
 Future Sources
        │
        ▼

 Observation Layer
        │
        ▼

 Measurement Engine
        │
        ▼

 MeasurementResult
        │
        ▼

 DimensionContribution
        │
        ▼

 Elementary DimensionKnowledgeState
        │
        ▼

 Capability Engine
 (Recipe Engine)
        │
        ▼

 Derived DimensionKnowledgeState
        │
        ▼

 Person Knowledge Matrix
        │
        ▼

 Reports
 Matching
 Guidance
 Future AI Services
Architectural Principles

The following principles become permanent design constraints.

Evidence is immutable

Observations represent historical facts.

They must never be rewritten.

Knowledge is reconstructable

Knowledge must always be rebuildable from stored evidence.

No derived state becomes the single source of truth.

Recipes are versioned

Every capability represents an interpretation model.

Interpretation models may evolve without invalidating historical evidence.

Separation of responsibilities

Each architectural layer has one responsibility only.

Observation

captures facts

Measurement

evaluates observations

Contribution

connects measurements to Dimensions

Dimension

accumulates knowledge

Capability

interprets knowledge

Person Model

represents the complete professional profile
Phase 0100B Roadmap
0100B-3
Dimension Contribution Foundation
Objective

Introduce the fundamental contract connecting measurements to elementary Dimensions.

A single MeasurementResult may contribute to one or multiple Dimensions.

DimensionContribution becomes the smallest reusable unit of professional knowledge.

Responsibilities

Introduce:

DimensionContribution

Builder

Validator

Health Check

Public API

Regression Tests

Guarantee:

immutability
provenance
deterministic behaviour
one-to-many support
version compatibility
Deliverable
MeasurementResult

↓

DimensionContribution[]
0100B-4
Measurement Mapping Foundation
Objective

Create the deterministic mapper converting MeasurementResult objects into DimensionContribution collections.

Responsibilities

Implement:

Measurement → Dimension mapping
multiple contributions
contribution direction
contribution strength
contribution confidence
source reliability
evidence quality
context binding
mapper versioning
Deliverable
MeasurementResult

↓

DimensionContribution[]
0100B-5
Elementary Knowledge Aggregation Foundation
Objective

Build the elementary knowledge matrix.

This task transforms multiple contributions into a coherent DimensionKnowledgeState.

Responsibilities

Implement:

contribution grouping
duplicate detection
independence groups
aggregation
contradiction management
estimate computation
confidence computation
coverage computation
stability computation
consistency computation
deterministic updates
Deliverable
DimensionContribution[]

↓

DimensionKnowledgeState
0100B-6
Knowledge Ledger & Snapshot Foundation
Objective

Separate immutable history from reconstructed knowledge.

The system stores:

observations
contributions
reconstructable knowledge
optional snapshots
Responsibilities

Introduce:

Observation Ledger

Contribution Ledger

Knowledge Snapshot

Snapshot Versioning

Historical Reconstruction

Deliverable
Observation Ledger

↓

Contribution Ledger

↓

Knowledge Snapshot
0100B-7
Derived Knowledge Foundation
Objective

Connect the Capability Core with the Knowledge Engine.

Capabilities become recipe executors producing derived professional knowledge.

Responsibilities

Implement:

CapabilityResult integration
Derived DimensionKnowledgeState
provenance
recipe versioning
explainability
dependency tracking
Deliverable
Elementary Knowledge Matrix

↓

Capability Engine

↓

Derived Knowledge Matrix
Architectural Guardrails

The following rules become permanent.

Knowledge is never directly edited

Knowledge is always produced from evidence.

Contributions are never manually aggregated

Aggregation is performed only by deterministic aggregators.

Capability models never overwrite evidence

Changing a recipe changes only derived knowledge.

Historical evidence remains untouched.

Every derived result is reproducible

Every score must always be reproducible from:

Observations

↓

Measurements

↓

Contributions

↓

Recipe Version
Long-Term Vision

The final objective is not to compute interview scores.

The final objective is to build the Person Knowledge Matrix.

The Person Knowledge Matrix represents the complete structured professional knowledge available about an individual.

Reports, interview simulations, career guidance, matching algorithms, role comparisons and future AI assistants become different views over the same underlying knowledge base.

Note Architetturale (Decisione 2026-07-23)

Da questa data il Knowledge Engine diventa il centro dell'architettura IMAGO.

Il Capability Core non viene sostituito ma ridefinito come Recipe Engine del sistema: il suo ruolo è interpretare la conoscenza elementare per produrre conoscenza derivata.

La Person Knowledge Matrix diventa l'asset principale della piattaforma.

Il valore persistente di IMAGO non risiede nei punteggi, ma nella raccolta strutturata, spiegabile e ricostruibile delle evidenze professionali.
---

## 0100D-6 — Knowledge Acquisition Strategy Query Foundation

Status: **COMPLETED**

Implemented the deterministic, read-only query layer:

```text
KnowledgeAcquisitionStrategyCollection
        ↓
KnowledgeAcquisitionStrategyQuery
        ↓
KnowledgeAcquisitionStrategyQueryResult
```

The query uses the consolidated flat allowlisted-filter convention, exact comparison and AND-only semantics. Supported filters: `strategyType`, `sourceNeedType`, `scope`, `scopeRef`, `targetKnowledgeLayer`, `reasonCode`, `sourceNeedRef`, `sourceOpportunityRef`, `sourceCoverageRef`.

No strategy evaluation, ranking, priority, recommendation, plan, execution, method, channel, question generation, inference or runtime is implemented.

## 0100D-7 — Knowledge Acquisition Requirement Foundation

Status: **COMPLETED**

Implemented the deterministic declarative post-condition layer:

```text
KnowledgeAcquisitionStrategy
        ↓
KnowledgeAcquisitionRequirement
```

Mappings are `elementary_knowledge_acquisition → elementary_knowledge_availability_required → elementary` and `derived_knowledge_composition → derived_knowledge_availability_required → derived`. Cardinality is strictly `1 Strategy → 1 Requirement`. `sourceStrategyRef` is the direct causal reference; Need, Opportunity and Coverage references are transitive traceability only. No satisfaction state, planning, execution, methods, channels, sources, questions, ranking or priority is implemented.

## 0100D-8 — Knowledge Acquisition Requirement Query Foundation

Status: **COMPLETED**

Implemented the deterministic, read-only query layer:

```text
KnowledgeAcquisitionRequirementCollection
        ↓
KnowledgeAcquisitionRequirementQuery
        ↓
KnowledgeAcquisitionRequirementQueryResult
```

The query is flat, requires at least one allowlisted filter, uses exact matching and AND-only semantics, preserves canonical ordering, deep-clones results, and treats empty results as valid. No satisfaction state, ranking, priority, planning, runtime or execution is implemented.

## 0100D-9 — Knowledge Acquisition Pipeline Boundary Review

Status: **COMPLETED**  
Type: **ARCHITECTURE REVIEW**

Repository-first review confirmed that the declarative Knowledge Analysis boundary terminates correctly at `KnowledgeAcquisitionRequirement`. The complete block is:

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

Decision: **Knowledge pipeline complete — freeze the boundary**. Future acquisition planning, source or method selection, execution, evidence ingestion and requirement-satisfaction evaluation belong to downstream Application, Runtime, Adapter or separately justified deterministic services; they are not additional fields of the Requirement contract.

## 0100D-10 — Knowledge Acquisition Boundary Consolidation and Freeze

Status: **COMPLETED**

Boundary status: **FROZEN**

Completed the non-semantic hardening of the Knowledge Acquisition block: Opportunity summary validation now recalculates `byOpportunityType`; the explicit public-export allowlist is shared by historical regressions; mapping, cardinality, causality, Requirement and Query invariants are protected by a dedicated freeze regression and health gate; the declarative boundary is formally documented and frozen.

## Next architecture phase — To be defined by Architect

Status: **PLANNED**

# CONTINUITY — IMAGO CORE

## Stato del progetto

La Phase `0100B — Knowledge Engine Foundation` è completata.

Pipeline Core verificata:

```text
Observation
    ↓
MeasurementResult
    ↓
MeasurementDimensionMapping
    ↓
DimensionContribution
    ↓
KnowledgeLedger
    ↓
KnowledgeSnapshot
    ↓
Elementary DimensionKnowledgeState
    ↓
DerivedKnowledgeRule
    ↓
CapabilityRecipe
    ↓
CapabilityExecutionResult
    ↓
DerivedDimensionKnowledgeState
    ↓
PersonKnowledgeMatrix
```

Root applicativa reale:

```text
repository/
```

Roadmap Core:

```text
repository/docs/15-architecture_specifications/CORE_ROADMAP.md
```

## Task completati

- `0100B-3 — Dimension Contribution Foundation`
- `0100B-4 — Measurement Mapping Foundation`
- `0100B-5 — Elementary Knowledge Aggregation Foundation`
- `0100B-6 — Knowledge Ledger & Snapshot Foundation`
- `0100B-7 — Derived Knowledge Rule Foundation`
- `0100B-8 — Capability Recipe Execution Foundation`
- `0100B-9 — Derived Dimension State Foundation`
- `0100B-10 — Person Knowledge Matrix Foundation`

Roadmap:

```text
Phase 0100B — Knowledge Engine Foundation
Status: COMPLETED
```

Task completato:

```text
0100C-1 — Person Knowledge Matrix Query Foundation
Status: COMPLETED
```

La Query Foundation legge la matrice senza reinterpretare la persona. Supporta filtri allowlisted per `dimensionId`, `knowledgeLayer`, `capabilityId`, `recipeId` e `recipeVersion`, con semantica AND, ordinamento canonico, risultato vuoto valido e separazione elementary/derived preservata.

API pubbliche:

```text
buildPersonKnowledgeQuery
validatePersonKnowledgeQuery
queryPersonKnowledgeMatrix
validatePersonKnowledgeQueryResult
```

Il task successivo non è ancora nominato nella roadmap approvata ed è registrato come `0100C-2 — To be defined by Architect`. Nessuna implementazione successiva è stata iniziata.

## Decisioni fondamentali

1. `DimensionKnowledgeState` e `DerivedDimensionKnowledgeState` sono distinti.
2. La conoscenza elementare deriva da Observation, Measurement e Contribution.
3. La conoscenza derivata deriva da Snapshot, regole e CapabilityRecipe.
4. Gli stati derivati non vengono aggiunti al Ledger.
5. La PersonKnowledgeMatrix è una vista materializzata ricostruibile, non un evidence store.
6. Elementary e derived possono coesistere sulla stessa Dimension.
7. Non si calcolano medie automatiche tra layer.
8. Non si sceglie automaticamente lo stato “migliore”.
9. Non esiste un Person Score.
10. Non esistono ancora matching, ranking, recommendation o report narrativi nel Knowledge Core.
11. Confidence, coverage e consistency globali non devono essere inventate.
12. Identity deterministiche e indipendenti dall’ordine degli input.
13. Timestamp esclusi dall’identità logica.
14. Ledger, Snapshot e stati restano immutabili.
15. Nessun LLM nelle Foundation deterministiche.

## PersonKnowledgeMatrix

Namespace:

```text
src/core/knowledge/
```

API pubbliche:

```text
buildPersonKnowledgeMatrix
validatePersonKnowledgeMatrix
```

Shape:

```text
PersonKnowledgeMatrix
├── id
├── subjectRef
├── matrixVersion
├── sourceSnapshotRef
├── knowledgeLayers
│   ├── elementary
│   └── derived
├── indexes
├── summary
├── lineage
├── versionContext
├── provenance
├── dependencyRefs
├── builtAt
├── metadata
└── extensions
```

Indici:

```text
byDimensionId
byKnowledgeLayer
byCapabilityId
byRecipeId
```

Summary tecnica:

```text
elementaryStateCount
derivedStateCount
totalStateCount
dimensionCount
elementaryDimensionCount
derivedDimensionCount
sharedDimensionCount
capabilityCount
recipeCount
dependencyCount
status
```

Subject reference tecnico:

```javascript
{
  type: "person",
  id: "subject-001"
}
```

## Punto tecnico da monitorare

`DimensionKnowledgeState` elementare non possiede attualmente un campo `id`.
La matrice crea quindi una reference deterministica locale dalla fingerprint canonica dello stato.

La scelta è accettata per la Foundation. Una identity nativa potrà essere valutata solo con task dedicato e regression completa.

## Test di chiusura

```powershell
node scripts/test_person_knowledge_matrix.js
node scripts/test_person_knowledge_matrix_regression.js
node scripts/test_health_person_knowledge_matrix.js
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

Esiti attesi:

```text
PASS
IMAGO Core all tests PASSED
All health checks passed
```

## Ripresa futura

1. Usare il repository reale come fonte di verità.
2. Leggere `CORE_ROADMAP.md`.
3. Leggere i documenti in `docs/00-continuity/`.
4. Verificare branch, ultimo commit e working tree.
5. Eseguire `node scripts/test_all_core.js`.
6. Eseguire `node scripts/fringe_health_check.js`.
7. Riprendere dal task successivo approvato dall’Architect senza ampliare retroattivamente `0100C-1`.

## Governing development loop added after Phase 0100B

The following documents are mandatory inputs for future Core tasks:

```text
docs/00-continuity/IMAGO_CORE_MANIFESTO.md
docs/00-continuity/DEVELOPMENT_LOOP_PROTOCOL.md
docs/00-continuity/MANIFESTO_REVIEWS.md
docs/00-continuity/BUILDER_TASK_PREAMBLE.md
```

Every Builder completion report must include a `Manifesto Review`.
The Builder may propose amendments but must not modify the Manifesto automatically.

Generate the standard continuity ZIP with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-imago-continuity-package.ps1
```


## Strategic architecture notes added after Phase 0100B

The following notes record approved principles and active architectural hypotheses discussed after completion of the Knowledge Engine Foundation. They do not claim implemented capability.

### AI boundary and evolution strategy — APPROVED PRINCIPLE

The document:

```text
docs/00-continuity/AI_BOUNDARY_AND_EVOLUTION_STRATEGY.md
```

is now part of the continuity package and must be considered during future architectural planning.

Boundary:

```text
IMAGO Core owns:
- stable knowledge representation
- evidence, provenance and confidence contracts
- deterministic state reconstruction
- gap, coverage, policy and traceability structures
- versioning and architectural contracts

AI owns, whenever practical:
- natural-language understanding
- semantic extraction
- CV and document interpretation
- answer interpretation
- question and report generation
- adaptive and multilingual communication
```

The Core must remain independent from a specific model provider. Future tasks should not hard-code deterministic replicas of capabilities that an AI layer can perform more effectively, unless determinism, auditability or safety requires it.

A future Learning Engine remains outside Beta scope. The current architectural obligation is to preserve the data and lineage required to support it later.

### Knowledge acquisition loop — ARCHITECTURAL DIRECTION, NOT IMPLEMENTED

The current discussion extends the future reasoning loop beyond direct gap-to-question generation:

```text
Observed Knowledge Representation
    ↓
Target Knowledge Representation
    ↓
Gap Analysis
    ↓
Opportunity Prioritization
    ↓
Knowledge Acquisition Strategy
    ↓
Question / Probe Selection
    ↓
Question Rendering
    ↓
New Observation
    ↓
Knowledge Update
```

Key distinction:

- the Gap Engine identifies what is missing, weak, uncertain or contradictory;
- an Opportunity layer prioritizes where the next observation can add the greatest value;
- a Knowledge Acquisition Strategy selects the type of action;
- the final question is a probe chosen or generated for that strategy.

Possible reusable strategies include:

```text
Evidence Expansion
Depth Exploration
Stress Validation
Contradiction Probe
Recovery Prompt
Context Shift
```

Questions should progressively become structured probes with versioned metadata such as:

```text
questionId
roleFamilies
targetDimensions
secondaryDimensions
applicableStrategies
pressureLevel
cognitiveLoad
episodicRecallDemand
abstractionLevel
expectedEvidenceTypes
stereotypedAnswerRisk
expectedInformationGain
contraindications
```

Initial metadata may be designed by humans or AI. Observed effectiveness must remain separate and be accumulated from simulations and, later, real usage.

### Synthetic Evaluation Platform — STRATEGIC CANDIDATE, NOT IMPLEMENTED

A Synthetic Evaluation Platform is considered a potentially high-value accelerator for Beta validation and future architectural research.

Reference loop:

```text
Scenario Designer / Candidate Generator
    ↓
Synthetic CV
    ↓
Hidden structured ground truth
    ↓
Candidate Actor
    ↓
IMAGO Beta interview
    ↓
Knowledge Matrix and report
    ↓
Deterministic Evaluation
    ↓
AI Critic
    ↓
Comparison with ground truth and improvement proposals
```

The platform should support versioned candidate families and behavioural styles, for example:

```text
professional archetypes:
- strong junior with low confidence
- strong senior with weak communication
- strong CV with shallow experience
- weak CV with high latent potential
- overclaiming profile
- self-undervaluing profile
- inconsistent or adversarial profile

interaction styles:
- collaborative
- evasive
- stressed
- assertive
- highly precise
- creative
- extremely concise
- highly verbose
```

Primary near-term purpose:

- test IMAGO architecture and runtime;
- expose regressions and blind spots;
- compare alternative policies, questions and model versions;
- measure coverage, false inference, wasted questions and report consistency.

Synthetic data may produce reliable knowledge about software behaviour and useful hypotheses about acquisition strategies. It must not be treated as validated knowledge about real people or recruiting outcomes without real-world confirmation.

Required separation of roles:

```text
Scenario Designer
Candidate Actor
IMAGO
Deterministic Evaluator
AI Critic
```

The same model may initially perform more than one role through isolated prompts, but the architecture must avoid treating a single AI's self-consistent judgement as ground truth.

### Future learning direction — HYPOTHESIS GENERATION, NOT AUTONOMOUS CORE MUTATION

Simulations and real usage may later support analysis of:

- which questions reveal specific dimensions more effectively;
- which acquisition strategies fit specific targets or candidate styles;
- which sequences reduce uncertainty with fewer interactions;
- whether designed question metadata matches observed behaviour;
- which policy changes deserve controlled validation.

Outputs should be reviewable candidate knowledge, for example:

```text
PolicyCandidate
QuestionEffectivenessCandidate
StrategyTargetCompatibilityCandidate
InferenceRuleCandidate
```

They must preserve:

```text
supporting sessions
source type: synthetic / real / mixed
model and prompt versions
scenario versions
sample size
confidence or uncertainty
known limitations
review status
```

No synthetic or learned proposal may automatically modify stable Core knowledge or production Policy.

## Documentation & Builder Governance v1.0 — PENDING DEDICATED TASK

A separate documentation-governance task remains required before renaming or consolidating the existing governance files.

Provisional task name:

```text
Documentation & Builder Governance v1.0
```

Expected final deliverables:

1. definitive `BUILDER_PROTOCOL.md`;
2. definitive documentation names and repository structure;
3. exact patch for the continuity ZIP PowerShell script;
4. complete standard Builder handover prompt;
5. concise `docs/00-continuity/README.md`;
6. final policy confirming that `CONTINUITY.md` represents current verified state and is rewritten by milestone rather than maintained as an unlimited append-only history.

Until that task is completed:

- do not rename `DEVELOPMENT_LOOP_PROTOCOL.md`;
- do not treat `BUILDER_TASK_PREAMBLE.md` as the final Builder Protocol;
- do not redesign the ZIP script incrementally;
- do not present provisional governance naming as approved architecture.


---

# Documentation and Builder Governance v1.0

Status: **APPROVED AND DOCUMENTED**

The continuity package now includes:

- `README.md`;
- authoritative `BUILDER_PROTOCOL.md`;
- compatibility pointer `DEVELOPMENT_LOOP_PROTOCOL.md`;
- updated `BUILDER_TASK_PREAMBLE.md`;
- reusable `STANDARD_HANDOVER_PROMPT.md`;
- updated package index.

Operational direction through Beta:

```text
Implement present roadmap value.
Preserve future compatibility.
Do not implement deferred future systems.
```

The Synthetic Evaluation Platform and Learning Engine remain deferred until a functioning Beta can be tested by real users. Current tasks may preserve traceability, versioning, provenance and replaceable boundaries where useful, but must not introduce speculative simulator or learning subsystems.

---

# Verified Core State — Task 0100C-2

Status: **COMPLETED**

Implemented deterministic Knowledge Coverage Foundation in:

```text
src/core/knowledge/
```

Public API:

```text
buildKnowledgeCoverage
validateKnowledgeCoverage
evaluateKnowledgeCoverage
healthKnowledgeCoverage
```

Implemented pipeline:

```text
PersonKnowledgeMatrix
    ↓
PersonKnowledgeQuery (optional)
    ↓
KnowledgeCoverage
```

The contract describes only the knowledge currently available in the matrix. It preserves categorical elementary/derived/composed coverage states, technical dimension and Capability counts, existing elementary state coverage/confidence values, deterministic ordering, provenance, dependency references and immutable inputs.

It does not evaluate the person and does not introduce person score, ranking, recommendation, priority, weighting, matching, inference, LLM, network access, persistence, Opportunity Engine, Learning Engine or Synthetic Evaluation Platform.

Next task:

```text
0100C-3
Status: PLANNED
```

Its perimeter has not been implemented and requires Architect definition.



---

# Verified Core State — Task 0100C-3

Status: **COMPLETED**

Implemented deterministic Knowledge Coverage Query Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeCoverageQuery`, `validateKnowledgeCoverageQuery`, `queryKnowledgeCoverage`, `validateKnowledgeCoverageQueryResult`, `healthKnowledgeCoverageQuery`.

Pipeline: `KnowledgeCoverage → KnowledgeCoverageQuery → KnowledgeCoverageQueryResult`. Filters are allowlisted (`dimensionId`, `capabilityId`, `coverageState`, `knowledgeLayer`, `overallCoverageState`) and combined exclusively with AND semantics. Results are deep-cloned, canonically ordered and descriptive only. No score, ranking, priority, recommendation, question selection, inference, LLM, network, persistence, Opportunity Engine, Learning Engine or Synthetic Evaluation Platform was introduced.

Next task: `0100D-1`, status PLANNED. Its perimeter has not been implemented and requires Architect definition.


---

# Verified Core State — Task 0100D-1

Status: **COMPLETED**

Implemented deterministic Knowledge Opportunity Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeOpportunity`, `validateKnowledgeOpportunity`, `evaluateKnowledgeOpportunities`, `validateKnowledgeOpportunityCollection`, `healthKnowledgeOpportunity`.

Pipeline: `KnowledgeCoverage → KnowledgeOpportunity → KnowledgeOpportunityCollection`. The Foundation derives only neutral technical conditions already represented by Coverage. Effective opportunity types are `elementary_layer_only` and `derived_layer_only`, with allowlisted reason codes `NO_ELEMENTARY_LAYER`, `NO_DERIVED_LAYER` and `SINGLE_LAYER_COVERAGE`. `knowledge_not_available` is intentionally not implemented because the current Coverage contract does not retain Dimension or Capability entities with zero knowledge; inventing them would violate repository-first determinism.

A Knowledge Opportunity means that IMAGO's available knowledge is not composed across both layers. It does not mean that the person lacks a capability or Dimension. Outputs are validated, deep-cloned, canonically ordered, deterministic, serializable, versioned and descriptive only. No score, ranking, priority, weighting, recommendation, question, acquisition strategy, inference, matching, LLM, network, persistence, callback or global registry was introduced.

Next task: `0100D-2`, status PLANNED. Its perimeter has not been implemented and requires Architect definition.


---

# Verified Core State — Task 0100D-2

Status: **COMPLETED**

Implemented deterministic Knowledge Opportunity Query Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeOpportunityQuery`, `validateKnowledgeOpportunityQuery`, `queryKnowledgeOpportunities`, `validateKnowledgeOpportunityQueryResult`, `healthKnowledgeOpportunityQuery`.

Pipeline: `KnowledgeOpportunityCollection → KnowledgeOpportunityQuery → KnowledgeOpportunityQueryResult`. Supported filters are `opportunityType`, `scope`, `scopeRef`, `coverageState`, `knowledgeLayer`, `reasonCode`, and `sourceCoverageRef`; multiple filters use AND semantics only. Results are deep-cloned, canonically ordered, deterministic, descriptive, and read-only. No score, ranking, priority, recommendation, opportunity selection, question, strategy, inference, LLM, network, persistence, callback, or global registry was introduced.

Next task: `0100D-3`, status PLANNED. Its perimeter has not been implemented and requires Architect definition.


---

# Verified Core State — Task 0100D-3

Status: **COMPLETED**

Implemented deterministic Knowledge Acquisition Need Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeAcquisitionNeed`, `validateKnowledgeAcquisitionNeed`, `evaluateKnowledgeAcquisitionNeeds`, `validateKnowledgeAcquisitionNeedCollection`, `healthKnowledgeAcquisitionNeed`.

Pipeline: `KnowledgeOpportunity → KnowledgeAcquisitionNeed` and `KnowledgeOpportunityCollection | KnowledgeOpportunityQueryResult → KnowledgeAcquisitionNeedCollection`. Effective mappings are `elementary_layer_only → derived_knowledge_required` and `derived_layer_only → elementary_knowledge_required`. Every opportunity produces exactly one independently cloned and stably traceable need.

The contract describes only which knowledge layer is technically required to complete composition. It does not prescribe how, where, when or through whom knowledge should be acquired. No score, ranking, priority, selection, recommendation, acquisition method, strategy, question, inference, LLM, network, persistence, callback or global registry was introduced.

Next task: `0100D-4`, status PLANNED. Its perimeter has not been implemented and requires Architect definition.

---

# Verified Core State — Task 0100D-4

Status: **COMPLETED**

Implemented deterministic Knowledge Acquisition Need Query Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeAcquisitionNeedQuery`, `validateKnowledgeAcquisitionNeedQuery`, `queryKnowledgeAcquisitionNeeds`, `validateKnowledgeAcquisitionNeedQueryResult`, `healthKnowledgeAcquisitionNeedQuery`.

Pipeline: `KnowledgeAcquisitionNeedCollection → KnowledgeAcquisitionNeedQuery → KnowledgeAcquisitionNeedQueryResult`. Supported filters are `needType`, `scope`, `scopeRef`, `requiredKnowledgeLayer`, `reasonCode`, `sourceOpportunityRef`, `sourceOpportunityType`, and `sourceCoverageRef`; multiple filters use AND semantics only. `sourceOpportunityType` remains exclusively a derived technical field for traceability and standalone contract consistency validation, not autonomous business information. Results are deep-cloned, canonically ordered, deterministic, serializable, descriptive, and read-only.

No score, ranking, priority, recommendation, selection, acquisition method, strategy, question, inference, LLM, network, persistence, callback, or global registry was introduced.

Next task: `0100D-5`, status PLANNED. Its perimeter has not been implemented and requires Architect definition.


---

# Verified Core State — Task 0100D-5

Status: **COMPLETED**

Implemented deterministic Knowledge Acquisition Strategy Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeAcquisitionStrategy`, `validateKnowledgeAcquisitionStrategy`, `evaluateKnowledgeAcquisitionStrategies`, `validateKnowledgeAcquisitionStrategyCollection`, `healthKnowledgeAcquisitionStrategy`.

Pipeline: `KnowledgeAcquisitionNeed → KnowledgeAcquisitionStrategy` and `KnowledgeAcquisitionNeedCollection | KnowledgeAcquisitionNeedQueryResult → KnowledgeAcquisitionStrategyCollection`. Effective mappings are `elementary_knowledge_required → elementary_knowledge_acquisition → elementary` and `derived_knowledge_required → derived_knowledge_composition → derived`. Every valid need produces exactly one independently cloned and stably traceable strategy. `sourceNeedType` is exclusively a derived technical field for traceability and standalone contract consistency validation, not autonomous business information.

The Strategy describes only the general technical category of a future knowledge action. It does not acquire evidence, compose derived knowledge, choose methods or channels, generate questions, create plans, schedule execution, rank needs, evaluate people, infer potential, call LLMs, access networks or persist state.

Next task: `0100D-6`, status PLANNED. Its perimeter has not been implemented and requires Architect definition.

---

# Verified Core State — Task 0100D-6

Status: **COMPLETED**

Implemented deterministic Knowledge Acquisition Strategy Query Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeAcquisitionStrategyQuery`, `validateKnowledgeAcquisitionStrategyQuery`, `queryKnowledgeAcquisitionStrategies`, `validateKnowledgeAcquisitionStrategyQueryResult`, `healthKnowledgeAcquisitionStrategyQuery`.

Pipeline: `KnowledgeAcquisitionStrategyCollection → KnowledgeAcquisitionStrategyQuery → KnowledgeAcquisitionStrategyQueryResult`. The consolidated flat-query convention is preserved. Supported exact allowlisted filters are `strategyType`, `sourceNeedType`, `scope`, `scopeRef`, `targetKnowledgeLayer`, `reasonCode`, `sourceNeedRef`, `sourceOpportunityRef`, and `sourceCoverageRef`; multiple filters use AND semantics only. `sourceNeedType` remains exclusively a derived technical field for traceability and standalone consistency validation, not autonomous business information.

Results are validated, deep-cloned, canonically ordered, deterministic, serializable, descriptive and read-only. Existing source references are propagated only when actually present in the Strategy Collection. No score, ranking, priority, recommendation, selection, alternative strategy, plan, execution, method, channel, question, prompt, runtime, inference, LLM, network, persistence, callback or global registry was introduced.

Next task: `0100D-7`, status PLANNED. Its perimeter has not been implemented and requires Architect definition.


---

# Verified Core State — Task 0100D-7

Status: **COMPLETED**

Implemented deterministic Knowledge Acquisition Requirement Foundation in `src/core/knowledge/`.

Public API: `buildKnowledgeAcquisitionRequirement`, `validateKnowledgeAcquisitionRequirement`, `evaluateKnowledgeAcquisitionRequirements`, `validateKnowledgeAcquisitionRequirementCollection`, `healthKnowledgeAcquisitionRequirement`.

Pipeline: `KnowledgeAcquisitionStrategy → KnowledgeAcquisitionRequirement` and `KnowledgeAcquisitionStrategyCollection | KnowledgeAcquisitionStrategyQueryResult → KnowledgeAcquisitionRequirementCollection`. Every valid Strategy produces exactly one Requirement. The Requirement is an autonomous declarative post-condition: it states which knowledge layer must become available, without prescribing how that condition will be achieved.

Mappings: `elementary_knowledge_acquisition → elementary_knowledge_availability_required → elementary`; `derived_knowledge_composition → derived_knowledge_availability_required → derived`. `sourceStrategyType` is only a derived technical field for traceability and standalone mapping validation. `sourceStrategyRef` is the direct causal reference; `sourceNeedRef`, `sourceOpportunityRef`, and `sourceCoverageRef` are transitive traceability references.

No `requiredKnowledgeState`, satisfaction/fulfillment/completion state, ranking, priority, source selection, method, channel, question, plan, runtime or execution was introduced. Requirement Query Foundation remains unimplemented and is planned as Task 0100D-8.

## Verified Core State — Task 0100D-8

`KnowledgeAcquisitionRequirementQuery` completa il confine dichiarativo della pipeline Knowledge Acquisition:

```text
KnowledgeAcquisitionRequirementCollection
        ↓
KnowledgeAcquisitionRequirementQuery
        ↓
KnowledgeAcquisitionRequirementQueryResult
```

La query è piatta, read-only e richiede almeno un filtro allowlisted. Sono supportati esclusivamente `requirementType`, `sourceStrategyType`, `scope`, `scopeRef`, `requiredKnowledgeLayer`, `reasonCode`, `sourceStrategyRef`, `sourceNeedRef`, `sourceOpportunityRef` e `sourceCoverageRef`. Il matching è esatto, più filtri applicano esclusivamente semantica `AND` e `reasonCode` verifica la presenza esatta nell'array `reasonCodes`.

Un risultato senza corrispondenze e una collection vuota producono Query Result validi e descrittivi. I risultati mantengono l'ordinamento canonico della Requirement Collection, propagano soltanto riferimenti realmente presenti, sono deep-cloned e deterministici. Non sono presenti ranking, priorità, selezione, satisfaction state, planning, runtime o execution.

Il health check ufficiale include la voce reale `Knowledge Acquisition Requirement Query core`. Dopo questo task il blocco Coverage → Opportunity → Need → Strategy → Requirement, con le rispettive Query Foundation, costituisce un confine architetturale completo da rivalutare prima di introdurre ulteriori livelli.

---

## Verified Core State — Task 0100D-10

The Knowledge Acquisition declarative boundary is now **CONSOLIDATED, REGRESSION PROTECTED, DOCUMENTED and FROZEN**.

Frozen boundary:

```text
PersonKnowledgeMatrix
→ KnowledgeCoverage
→ KnowledgeOpportunity
→ KnowledgeAcquisitionNeed
→ KnowledgeAcquisitionStrategy
→ KnowledgeAcquisitionRequirement
```

The task introduced no new domain contract and no new public API. It hardened standalone Opportunity summary validation, consolidated the explicit test-only public export allowlist, added a boundary freeze regression and health gate, and documented the semantic invariants. New Core declarative levels, mapping changes, cardinality changes, Requirement satisfaction state, and Plan/Action/Execution APIs require a new Architecture Review.

---

## Verified Core State — Task 0100E-2

Status: **COMPLETED**

`KnowledgeAcquisitionDesign` is the first approved declarative consumer downstream of `KnowledgeAcquisitionRequirement`:

```text
KnowledgeAcquisitionRequirement
→ KnowledgeAcquisitionDesign
```

The builder receives an explicit `{ requirement, resolvedContext }` bundle containing the causally linked Strategy, Need, Opportunity, Coverage and PersonKnowledgeMatrix. It validates the complete direct causal chain and never performs implicit resolution, persistence access, network access or global lookup.

The Foundation supports exactly two deterministic mappings:

```text
elementary_knowledge_availability_required
→ elementary_acquisition_design
```

```text
derived_knowledge_availability_required
→ derived_acquisition_design
```

The Design adds mechanism-neutral solution semantics through target knowledge, output topology, contribution requirements, prerequisite topology and abstract capability obligations. Elementary Designs require primary knowledge contributions and no prerequisite topology. Derived Designs require an explicit, non-empty prerequisite topology derived from the resolved Coverage context.

No Plan, capability match, capability selection, source or method selection, question or artifact generation, runtime, execution, observation, result, satisfaction state or knowledge update was introduced. The public API adds only `buildKnowledgeAcquisitionDesign`, `validateKnowledgeAcquisitionDesign` and `healthKnowledgeAcquisitionDesign`.

## Task 0100E-4 — Knowledge Acquisition Capability Match Foundation

Completed the pure deterministic `KnowledgeAcquisitionCapabilityMatch` boundary:

`KnowledgeAcquisitionDesign -> 0..N KnowledgeAcquisitionCapabilityMatch`

Each invocation evaluates one immutable capability candidate snapshot. Discovery and selection remain Application concerns. The Match evaluates eligibility, obligations, output/prerequisite topology, conservative constraints, explicit reasons, and the strict states `compatible`, `incompatible`, `indeterminate`. It introduces no registry access, ranking, planning, recipe, execution, result, satisfaction, Measurement dependency, question generation, or LLM invocation.

## Task 0100E-6 — Knowledge Acquisition Solution Decision Foundation

Boundary congelato:

```text
Discovery → Application
Candidate Resolution → Application
Matching → Core
Solution Decision → Application
```

`KnowledgeAcquisitionSolutionDecision` è un contratto applicativo deterministico e auditabile. Può adottare zero, una o più capability tramite i mode `single`, `composed`, `none`, `deferred`. Non introduce CandidateCollection o MatchCollection nel Core e non progetta la composizione, la configurazione, il planning, recipe, execution o runtime. Il candidate snapshot resta Application-owned e viene usato come boundary input immutabile.

# TASK 0100D-9 — Knowledge Acquisition Pipeline Boundary Review

## 1. Executive conclusion

The repository-first review confirms that the declarative Knowledge Analysis pipeline terminates correctly at `KnowledgeAcquisitionRequirement`.

`KnowledgeAcquisitionRequirement` is not a renamed Strategy. It expresses the final domain post-condition that must become true — availability of elementary or derived knowledge — while remaining independent from acquisition method, source, channel, question, plan, runtime and execution.

**Decision: A. Knowledge pipeline complete — freeze the boundary.**

**Classification outcome: CONFORMING WITH NON-BLOCKING NOTES.**

No new Core contract is required between Strategy and Requirement or after Requirement inside the current declarative Knowledge Analysis domain. The next missing responsibilities are operational or evaluative and belong downstream, or require a separate future architectural decision.

No application or Core contract code was modified during this review. The only repository modification is the authoritative roadmap correction and review registration.

## 2. Repository First Inspection

The review inspected the real implementation, not only continuity or task reports.

Primary files inspected included:

- all 58 JavaScript files in `src/core/knowledge/`;
- `src/core/knowledge/index.js`;
- builders, validators, evaluators, collection validators, query builders, query executors, query-result validators and health checks for every Knowledge level;
- `scripts/test_all_core.js`;
- `scripts/fringe_health_check.js`;
- all principal and regression scripts for PersonKnowledgeMatrix, Coverage, Opportunity, Need, Strategy, Requirement and their Query Foundations;
- `scripts/test_person_knowledge_matrix_regression.js`;
- `scripts/test_person_knowledge_matrix_query_regression.js`;
- `scripts/test_knowledge_coverage_regression.js`;
- `docs/00-continuity/CONTINUITY.md`;
- `docs/15-architecture_specifications/CORE_ROADMAP.md`;
- Task 0100D-7 and 0100D-8 implementation artifacts available in the repository/session.

## 3. Complete pipeline map

```text
KnowledgeSnapshot
        ↓
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

Read-only Query Foundations exist for:

```text
PersonKnowledgeMatrix
KnowledgeCoverage
KnowledgeOpportunity
KnowledgeAcquisitionNeed
KnowledgeAcquisitionStrategy
KnowledgeAcquisitionRequirement
```

Each Query operates only on its own contract or collection boundary and does not run upstream evaluators.

## 4. Responsibility matrix

| Contract | Autonomous responsibility | Input | Output meaning |
|---|---|---|---|
| PersonKnowledgeMatrix | Canonical structured view of elementary and derived knowledge available for a person | KnowledgeSnapshot plus validated derived states | Reconstructable knowledge matrix and indexes |
| KnowledgeCoverage | Describes the configuration of knowledge currently represented for dimensions and capabilities | PersonKnowledgeMatrix, optionally filtered | Coverage state and descriptive counts |
| KnowledgeOpportunity | Declares a coverage configuration that is incomplete for composition | KnowledgeCoverage or filtered coverage | A deterministic incomplete-knowledge opportunity |
| KnowledgeAcquisitionNeed | Declares which knowledge layer is missing | KnowledgeOpportunity | Elementary or derived knowledge need |
| KnowledgeAcquisitionStrategy | Declares the general technical nature of the required transformation | KnowledgeAcquisitionNeed | Elementary acquisition or derived composition strategy |
| KnowledgeAcquisitionRequirement | Declares the final knowledge availability condition required | KnowledgeAcquisitionStrategy | Elementary or derived knowledge availability post-condition |

The responsibilities are distinct. Removing any of Opportunity, Need, Strategy or Requirement would collapse a meaningful semantic distinction:

```text
observed incomplete configuration
→ missing layer
→ general transformation nature
→ required final domain condition
```

## 5. Causal reference matrix

| Contract | Direct causal reference | Meaning |
|---|---|---|
| KnowledgeCoverage | `sourceMatrixRef` | Matrix being evaluated |
| KnowledgeOpportunity | `sourceCoverageRef` | Coverage that directly produced the opportunity |
| KnowledgeAcquisitionNeed | `sourceOpportunityRef` | Opportunity that directly produced the need |
| KnowledgeAcquisitionStrategy | `sourceNeedRef` | Need that directly produced the strategy |
| KnowledgeAcquisitionRequirement | `sourceStrategyRef` | Strategy that directly produced the requirement |

No lateral causal relationship was found in the downstream chain.

## 6. Transitive reference matrix

| Contract | Transitive references | Source of propagation |
|---|---|---|
| Opportunity | none beyond Coverage dependencies | Coverage evaluation input |
| Need | `sourceCoverageRef` | Propagated from Opportunity |
| Strategy | `sourceOpportunityRef`, `sourceCoverageRef` | Propagated from Need |
| Requirement | `sourceNeedRef`, `sourceOpportunityRef`, `sourceCoverageRef` | Propagated from Strategy |

`dependencyRefs` include the direct causal reference and the available upstream traceability references. Builders do not infer new semantic causes from those references.

Requirement Collection and Query Result propagation follows the same rule: only references present in the validated source collection are copied.

## 7. Cardinality matrix

| Transition | Effective cardinality | Enforcement |
|---|---|---|
| Coverage → Opportunity | One coverage may produce zero or multiple opportunities, one per incomplete dimension/capability scope record | Opportunity evaluator iterates canonical coverage entries |
| Opportunity → Need | `1 → 1` | Collection validator requires distinct `sourceOpportunityRef` |
| Need → Strategy | `1 → 1` | Collection validator requires distinct `sourceNeedRef` |
| Strategy → Requirement | `1 → 1` | Collection validator requires distinct `sourceStrategyRef` |

No aggregation, splitting, merge, semantic deduplication, alternative generation, fallback, ranking or selection is implemented in the acquisition chain.

Coverage may generate several opportunities because it evaluates multiple independent scopes. That does not violate downstream one-to-one cardinality.

## 8. Mapping matrix

| Opportunity type | Need type | Need layer | Strategy type | Strategy target layer | Requirement type | Requirement layer |
|---|---|---|---|---|---|---|
| `elementary_layer_only` | `derived_knowledge_required` | `derived` | `derived_knowledge_composition` | `derived` | `derived_knowledge_availability_required` | `derived` |
| `derived_layer_only` | `elementary_knowledge_required` | `elementary` | `elementary_knowledge_acquisition` | `elementary` | `elementary_knowledge_availability_required` | `elementary` |

Associated technical reason-code progression:

```text
elementary_layer_only
→ DERIVED_KNOWLEDGE_REQUIRED
→ DERIVED_KNOWLEDGE_COMPOSITION_REQUIRED
→ DERIVED_KNOWLEDGE_AVAILABILITY_REQUIRED
```

```text
derived_layer_only
→ ELEMENTARY_KNOWLEDGE_REQUIRED
→ ELEMENTARY_KNOWLEDGE_ACQUISITION_REQUIRED
→ ELEMENTARY_KNOWLEDGE_AVAILABILITY_REQUIRED
```

All downstream mappings are deterministic, allowlisted and validated standalone. No LLM, free-text interpretation or silent fallback is used.

## 9. Query Foundation consistency matrix

| Query | Flat | ≥1 filter | Exact match | AND | Empty valid | Own boundary only | Canonical output |
|---|---:|---:|---:|---:|---:|---:|---:|
| PersonKnowledgeQuery | yes | yes | yes | yes | yes | yes | yes |
| KnowledgeCoverageQuery | yes | yes | yes | yes | yes | yes | yes |
| KnowledgeOpportunityQuery | yes | yes | yes | yes | yes | yes | yes |
| KnowledgeAcquisitionNeedQuery | yes | yes | yes | yes | yes | yes | yes |
| KnowledgeAcquisitionStrategyQuery | yes | yes | yes | yes | yes | yes | yes |
| KnowledgeAcquisitionRequirementQuery | yes | yes | yes | yes | yes | yes | yes |

All acquisition Query Foundations:

- use allowlisted top-level fields;
- require at least one recognized filter;
- use exact comparisons;
- combine filters with AND semantics;
- return valid empty results;
- preserve canonical technical ordering;
- deep-clone filters and matched contracts;
- reject ranking, selection and operational query language;
- do not translate one filter into a correlated upstream field;
- do not build upstream or downstream contracts.

Non-blocking historical difference: `PersonKnowledgeQuery` contains a domain-specific validation rule preventing elementary-only queries from using capability/recipe filters. Later acquisition queries generally permit individually valid but mutually non-matching filters and return an empty result. This difference is intentional and does not affect the acquisition boundary.

## 10. Collection and summary review

All collection and Query Result summaries are descriptive and recalculable from contained elements. They contain counts by scope/type/layer and an `empty` flag, not scores or recommendations.

Need, Strategy and Requirement collection validators recompute their type maps and principal counts.

Non-blocking hardening note: `validateKnowledgeOpportunityCollection` verifies total, dimension, capability and empty counts but does not currently compare the complete `byOpportunityType` map against a recalculated map. The Opportunity Query Result validator does perform that comparison. This is a validator strictness inconsistency, not a pipeline-boundary flaw, and should be closed in a dedicated non-semantic consolidation task.

No satisfaction, completion, priority or progress summary was found.

## 11. Validator review

The single-contract validators are standalone. They validate object shape, required properties, unknown fields, enum allowlists, mapping coherence, reason codes, direct/transitive references, provenance, metadata, dependency references, extensions and prohibited concepts.

Collection validators validate contained contracts, canonical order, source cardinality and summaries. Query Result validators validate filters, matched elements, canonical order and summaries without requiring the source collection.

Non-blocking consistency notes:

1. Validator strictness has evolved over the task series. Later Strategy and Requirement validators perform stronger serializability, dependency ordering and prohibited-field checks than some earlier Opportunity/Need validators.
2. Some older collection validators check required dependency inclusion but not all of uniqueness, ordering and exact summary-key shape with the same strictness as Requirement.
3. These differences do not permit semantic overlap or premature operational behavior, but they justify a consolidation/freeze task.

No validator requires the original causal source object to validate a downstream contract.

## 12. Identity and determinism review

Coverage, Opportunity, Need, Strategy, Requirement and their collections use SHA-256 identities derived from stable serialized semantic inputs.

Examples of identity inputs include:

- direct causal reference;
- contract type;
- scope and scope reference;
- required or target knowledge layer;
- contract version;
- canonically ordered child IDs for collections.

No `Math.random`, random UUID, `Date.now`, ambient timestamp, counter or shared mutable state was found in `src/core/knowledge/`.

`PersonKnowledgeMatrix.builtAt` is derived from an explicit option/input or the source snapshot timestamp; its ID is based on semantic matrix composition rather than the display timestamp.

No identity was found to depend on ranking, priority or application state.

## 13. Immutability review

Builders and evaluators recursively clone nested objects and arrays. Query executors clone filters and returned contracts. Collection evaluators clone source elements before downstream construction.

Tests cover both directions:

```text
modify output → input unchanged
modify input after build → output unchanged
```

Extensions are deep-cloned in builders and collection evaluators. No mutation of the causal source contracts was identified.

No unsafe shared registry or module-level mutable collection was found.

## 14. Provenance, metadata and dependency references

The acquisition chain uses deterministic, non-interpretive provenance:

```text
deterministic: true
interpretive: false
```

Collections use corresponding collection-evaluation provenance. Query Results follow the established repository convention of deterministic metadata rather than adding a separate provenance object.

Metadata marks contracts read-only and records contract/evaluation or query strategy versions.

Dependency references are canonical technical traceability, not business classification.

## 15. Public export review

`src/core/knowledge/index.js` exports 55 public functions grouped as follows:

- PersonKnowledgeMatrix: builder and validator;
- PersonKnowledge Query: builder, validator, executor and result validator;
- Coverage: builder, validator, evaluator and health;
- Coverage Query: builder, validator, executor, result validator and health;
- Opportunity: builder, validator, evaluator, collection validator and health;
- Opportunity Query: builder, validator, executor, result validator and health;
- Need: builder, validator, evaluator, collection validator and health;
- Need Query: builder, validator, executor, result validator and health;
- Strategy: builder, validator, evaluator, collection validator and health;
- Strategy Query: builder, validator, executor, result validator and health;
- Requirement: builder, validator, evaluator, collection validator and health;
- Requirement Query: builder, validator, executor, result validator and health.

No Plan, Action, Execution, Orchestration, satisfaction evaluator or placeholder API is exported.

No duplicate public API or unresolved scaffold was identified.

## 16. Historical regression test review

The following files were compared between the Task 0100D-7 and Task 0100D-8 overlays:

```text
scripts/test_person_knowledge_matrix_regression.js
scripts/test_person_knowledge_matrix_query_regression.js
scripts/test_knowledge_coverage_regression.js
```

The only changes are additions of the five approved Requirement Query public APIs to the expected export allowlists:

```text
buildKnowledgeAcquisitionRequirementQuery
validateKnowledgeAcquisitionRequirementQuery
queryKnowledgeAcquisitionRequirements
validateKnowledgeAcquisitionRequirementQueryResult
healthKnowledgeAcquisitionRequirementQuery
```

Confirmed:

- no assert removed;
- no assert weakened;
- no guardrail commented out;
- no catch added to hide errors;
- no throw or exit behavior removed;
- no failure converted into warning.

The apparent full-line replacement in one minified regression file is caused by its one-line formatting.

## 17. Documentation consistency review

`CONTINUITY.md` correctly records the completed Requirement and Requirement Query Foundations and identifies the block as a boundary requiring reassessment.

`CORE_ROADMAP.md` was stale: it still marked Task 0100D-8 as `PLANNED` despite the complete code, tests and health integration.

Classification:

```text
CORE_ROADMAP 0100D-8 status
→ documentation stale
```

The roadmap was corrected to:

```text
0100D-8 — COMPLETED
0100D-9 — COMPLETED / ARCHITECTURE REVIEW
0100D-10 — PLANNED
```

No implementation divergence was found.

## 18. Future Compatibility Review

Classification: **CONFORMING WITH NON-BLOCKING NOTES**.

| Future capability | Compatibility assessment |
|---|---|
| Multiple acquisition mechanisms | Supported by downstream consumers; Requirement does not prescribe one |
| Human-provided evidence | Supported through future ingestion/adapters; no Requirement change needed |
| Structured sources | Supported downstream; no source-selection field is embedded |
| Document sources | Supported downstream; no document-specific dependency in Requirement |
| Runtime interview evidence | Supported by Runtime/Application ingestion; Core contract remains unchanged |
| Derived knowledge composition | Explicitly represented by Strategy and Requirement types |
| Incremental knowledge updates | Compatible with new snapshots/matrices and deterministic recalculation |
| Coverage recalculation | Existing Coverage service can evaluate an updated matrix |

No breaking change is required for these capabilities. They require consumers and orchestration outside the declarative boundary.

## 19. Core / Application / Runtime boundary

| Concept | Correct architectural ownership |
|---|---|
| Acquisition plan | Application or separately approved orchestration contract; not yet justified in Core |
| Acquisition action | Application/Runtime responsibility |
| Source selection | Adapter/Application responsibility |
| Method selection | Application/Orchestration responsibility |
| Channel selection | Application responsibility |
| Question generation | Application/Runtime responsibility |
| Runtime execution | Runtime responsibility |
| Evidence ingestion | Adapter plus existing/future deterministic Core intake service |
| Requirement satisfaction evaluation | Potential separate deterministic Core service, but premature until updated knowledge evidence and comparison semantics are approved |
| Coverage recalculation | Existing Core deterministic service over an updated matrix |

`KnowledgeAcquisitionRequirement` must not absorb any of these responsibilities.

## 20. Requirement satisfaction boundary

1. Satisfaction must **not** become mutable internal state of `KnowledgeAcquisitionRequirement`.
2. If justified later, it should be a separate immutable evaluation result.
3. It should derive from a later authoritative knowledge state — likely an updated Matrix/Coverage — compared against the Requirement.
4. The comparison logic may belong to a deterministic Core service; execution timing and event handling belong to Application/Runtime.
5. Defining it now is premature because the accepted proof event and post-acquisition update boundary are not yet specified.
6. Potential evidence would be a validated updated knowledge state containing the required elementary layer or derived composition for the same scope, with traceable provenance.

Current guardrail remains valid:

```text
KnowledgeAcquisitionRequirement contains no satisfaction state.
```

## 21. First real gap after Requirement

The first real gap is not another declarative Knowledge Analysis contract.

The missing responsibility is:

> Coordinate how an application chooses and invokes a mechanism that may produce new evidence or derived knowledge, then submit the resulting validated knowledge update back to the existing deterministic Core pipeline.

This responsibility belongs primarily outside the current Core boundary.

Options reviewed:

| Hypothesis | Decision |
|---|---|
| Knowledge Acquisition Specification | Not currently necessary; risks duplicating Requirement or prescribing method |
| Knowledge Acquisition Plan | Operational; downstream and not yet justified |
| Knowledge Acquisition Action | Runtime/Application concern |
| Knowledge Acquisition Request | Possible future Application contract, only when a concrete consumer exists |
| Knowledge Acquisition Fulfillment | Premature; proof semantics not defined |
| Requirement Satisfaction Evaluation | Plausible future separate Core service, but premature now |
| Evidence Acquisition Boundary | Real downstream architectural concern, but requires Application/Adapter design |
| Application Adapter | Concrete next product-layer concern, not a new Knowledge contract |

## 22. Risks

No blocking architectural inconsistency was found.

Non-blocking risks:

- validator strictness differs slightly across generations of the Knowledge chain;
- one Opportunity collection summary sub-map is not recalculated by its collection validator;
- repeated local helper implementations may drift over time;
- public API allowlists are duplicated in three historical regression scripts, increasing maintenance cost;
- the roadmap had become stale after Task 0100D-8.

These risks justify consolidation, not another semantic layer.

## 23. Corrections performed

Only one authorized, non-semantic documentation correction was made:

```text
docs/15-architecture_specifications/CORE_ROADMAP.md
```

Changes:

- Task 0100D-8 corrected from `PLANNED` to `COMPLETED`;
- Task 0100D-9 recorded as completed architecture review;
- a single next task recorded as planned.

No JavaScript source, contract, mapping, cardinality, validator, API or test was modified.

## 24. Final decision

### A. Knowledge pipeline complete — freeze the boundary

The current block is semantically complete:

```text
Coverage
→ Opportunity
→ Need
→ Strategy
→ Requirement
```

Requirement is the correct final declarative post-condition of Knowledge Analysis.

Anything that decides how to satisfy it, performs acquisition, ingests evidence, composes knowledge in response to an operational request, or evaluates later satisfaction is a separate responsibility and must not be inserted into the Requirement contract.

## 25. Recommended next task

```text
Task identifier: 0100D-10
Task name: Knowledge Acquisition Boundary Consolidation and Freeze
Architectural layer: IMAGO Core — architecture hardening
Responsibility: normalize non-semantic validator strictness and freeze the completed public boundary
Input: completed PersonKnowledgeMatrix → Requirement pipeline, Query Foundations, validators and regression suites
Output: strengthened validators/tests/documentation and an explicit frozen API/contract boundary
Explicit exclusions: no new domain contract, no mapping changes, no cardinality changes, no planning, no source/method selection, no execution, no satisfaction state
Reason now necessary: the semantic boundary is complete; consolidation should occur before downstream Application/Runtime design begins
```

## 26. Tests executed

All targeted tests passed:

```text
PersonKnowledgeMatrix tests PASSED
PersonKnowledgeMatrix query tests PASSED
PersonKnowledgeMatrix regression PASSED
PersonKnowledgeMatrix query regression PASSED

Knowledge Coverage tests PASSED
Knowledge Coverage Query tests PASSED
Knowledge Coverage regression PASSED
Knowledge Coverage Query regression tests PASSED

Knowledge Opportunity tests PASSED
Knowledge Opportunity Query tests PASSED
Knowledge Opportunity regression tests PASSED
Knowledge Opportunity Query regression tests PASSED

Knowledge Acquisition Need tests PASSED
Knowledge Acquisition Need Query tests PASSED
Knowledge Acquisition Need regression tests PASSED
Knowledge Acquisition Need Query regression tests PASSED

Knowledge Acquisition Strategy tests PASSED
Knowledge Acquisition Strategy Query tests PASSED
Knowledge Acquisition Strategy regression tests PASSED
Knowledge Acquisition Strategy Query regression tests PASSED

Knowledge Acquisition Requirement tests PASSED
Knowledge Acquisition Requirement Query tests PASSED
Knowledge Acquisition Requirement regression tests PASSED
Knowledge Acquisition Requirement Query regression tests PASSED
```

General gates:

```text
IMAGO Core all tests PASSED
All health checks passed.
```

The official health check includes every Knowledge Foundation and Query Foundation through Requirement Query.

## 27. Static audit

A namespace-wide audit of `src/core/knowledge/` found no effective implementation of:

```text
network access
LLM calls
filesystem access
random identity
ambient timestamp generation
global mutable state
callbacks
ranking
priority
recommendation
source/method/channel selection
question generation
planning
runtime execution
requirement satisfaction state
fulfillment/completion state
persistence
```

Architectural terms found in production files occur in:

- validator negative allowlists;
- validator error text;
- health assertions;
- upstream immutable lineage fields such as historical `executionRefs` already present in derived knowledge states.

They do not constitute acquisition planning or execution behavior.

## 28. Confirmation of no premature implementation

No Plan, Action, Request, Fulfillment, Satisfaction, Execution or Orchestration contract was created.

No scaffold, placeholder, empty export or future API was introduced.

No Git commit, push, tag, merge or rebase was executed.

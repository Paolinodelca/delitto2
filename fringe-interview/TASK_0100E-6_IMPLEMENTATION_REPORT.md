# TASK 0100E-6 — Knowledge Acquisition Solution Decision Foundation

## Status

**COMPLETED — APPLICATION FOUNDATION IMPLEMENTED / TESTED / BOUNDARY PROTECTED**

## Repository-first inspection

The implementation was based on the real repository contracts and conventions for:

- `KnowledgeAcquisitionDesign`;
- `KnowledgeAcquisitionCapabilityMatch`;
- deterministic SHA-256 identities;
- closed validators and structured reasons;
- traceability, provenance, dependency references, metadata and extensions;
- CommonJS Knowledge contracts and the existing ESM Application entry point;
- health, fixture, regression and aggregate-test integration.

The Match remains in `src/core/knowledge`. The Decision is implemented in `src/app/knowledge` and is not exported by `src/core/knowledge/index.js`.

## Frozen boundary

```text
Discovery → Application
Candidate Resolution → Application
Matching → Core
Solution Decision → Application
```

## Final contract

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

The contract stores references and summaries, not full Design, Match or candidate objects.

## Decision modes

Closed modes:

- `single`: exactly one adopted capability;
- `composed`: at least two adopted capabilities and `compositionRequired: true`;
- `none`: zero adopted capabilities and at least one structured blocking reason;
- `deferred`: zero adopted capabilities and at least one `pending_condition` reason.

All four are valid decisions. `none` and `deferred` are not represented as errors or null outputs.

## Decision policy and request

The builder separates:

- materialized `decisionContext`;
- declarative `decisionPolicy`;
- explicit `decisionRequest`.

The minimal policy supplies:

- `policyRef`;
- allowed modes;
- whether composition is allowed;
- ordered, explicit criteria.

No general ranking, optimization or recommendation engine was introduced.

## Referential consistency

The builder verifies:

- all Match contracts are valid;
- all Matches reference the source Design;
- every Match has a candidate snapshot;
- candidate identities are unique;
- conflicting duplicate Matches are rejected;
- every adopted capability is present;
- every adopted capability has a valid compatible Match;
- incompatible or indeterminate candidates cannot be adopted;
- cardinality is coherent with the mode;
- compositionRequired is derived only from `composed`.

The Match is never recalculated or modified.

## Candidate snapshot decision

No public `CapabilityCandidate` contract was added to the Knowledge Core. Candidate snapshots remain Application-owned immutable boundary inputs and are validated internally for stable identity and absence of executable values.

No CandidateCollection or MatchCollection contract was introduced.

## Composition separation

The Decision may declare multiple adopted capability references and `compositionRequired: true`. It does not describe topology, order, dependencies, data flow, routing, configuration, failure handling, planning, recipe, orchestration or runtime.

The future `KnowledgeAcquisitionCapabilityCompositionDesign` remains a separate downstream domain whose Core/Application placement is not decided here.

## Public API

Application exports:

- `buildKnowledgeAcquisitionSolutionDecision`;
- `validateKnowledgeAcquisitionSolutionDecision`;
- `healthKnowledgeAcquisitionSolutionDecision`.

They are available through `src/app/knowledge/index.js` and the existing `src/app/index.js` Application entry point. They are intentionally absent from `src/core/knowledge/index.js`.

## Files created

```text
src/app/knowledge/buildKnowledgeAcquisitionSolutionDecision.js
src/app/knowledge/validateKnowledgeAcquisitionSolutionDecision.js
src/app/knowledge/healthKnowledgeAcquisitionSolutionDecision.js
src/app/knowledge/index.js
src/app/knowledge/publicApi.js
scripts/knowledge_acquisition_solution_decision_fixture.js
scripts/test_knowledge_acquisition_solution_decision.js
scripts/test_knowledge_acquisition_solution_decision_regression.js
scripts/test_knowledge_acquisition_solution_decision_public_api.js
scripts/test_health_knowledge_acquisition_solution_decision.js
TASK_0100E-6_IMPLEMENTATION_REPORT.md
TASK_0100E-6_MANIFEST.txt
```

## Files modified

```text
src/app/index.js
scripts/test_all_core.js
scripts/fringe_health_check.js
docs/00-continuity/CONTINUITY.md
docs/15-architecture_specifications/CORE_ROADMAP.md
docs/15-architecture_specifications/KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md
```

## Dedicated tests executed

```text
node scripts/test_knowledge_acquisition_solution_decision.js
node scripts/test_knowledge_acquisition_solution_decision_regression.js
node scripts/test_knowledge_acquisition_solution_decision_public_api.js
node scripts/test_health_knowledge_acquisition_solution_decision.js
```

All passed.

## Upstream and boundary regressions executed

```text
node scripts/test_knowledge_acquisition_capability_match.js
node scripts/test_knowledge_acquisition_capability_match_regression.js
node scripts/test_health_knowledge_acquisition_capability_match.js
node scripts/test_knowledge_acquisition_boundary_freeze.js
node scripts/test_health_knowledge_acquisition_boundary.js
```

All passed.

## Aggregate gates executed

```text
node scripts/fringe_health_check.js
node scripts/test_all_core.js
```

Results:

```text
All health checks passed.
IMAGO Core all tests PASSED
```

## Boundary verification

Regression and public-API tests demonstrate that:

- Solution Decision exports exist on the Application side;
- they are absent from the Knowledge Core public API;
- no registry, provider lookup, discovery, dynamic resolution, planning, recipe, execution, runtime, observation, result, satisfaction, Knowledge Update or LLM invocation was introduced;
- forbidden operational structures are rejected by the Decision validator.

## Non-blocking notes

The Application currently mixes an ESM root entry point with CommonJS internal modules. A small ESM `publicApi.js` adapter was added inside the Application domain to preserve the existing root-entry convention without moving the contract into Core.

## Proposed next task

```text
Task 0100E-7
Post Solution Decision Downstream Architecture Review
```

The review should determine the unavoidable next consumer and separately assess the ownership and boundary of an optional `KnowledgeAcquisitionCapabilityCompositionDesign`, without implementing it prematurely.

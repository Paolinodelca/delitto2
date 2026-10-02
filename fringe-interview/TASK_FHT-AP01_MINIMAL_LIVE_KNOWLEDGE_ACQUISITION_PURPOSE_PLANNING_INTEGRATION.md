# IMAGO — FHT-AP01 MINIMAL LIVE KNOWLEDGE ACQUISITION PURPOSE PLANNING INTEGRATION

## Verdict

**A — FHT-AP01 COMPLETE; CANONICAL LIVE ACQUISITION PURPOSES AVAILABLE**

No commit. No push. First Human Test gate remains CLOSED.

## Bootstrap implementation

A bounded FHT-PD01 planning boundary now exists in `buildFhtLiveAcquisitionPurposePlanning`.

Authorized active goals are exactly:

- `decision_accountability`
- `quantified_outcome`

If no pre-interview PersonKnowledgeMatrix exists, the planner creates a canonical **empty** PersonKnowledgeMatrix from an empty Knowledge Ledger/Snapshot. It creates no Evidence, DimensionContribution, positive Knowledge, negative Knowledge, deficit or weakness.

Goal-relative coverage then adds only the authorized active goal identities as zero-state `coverageState: empty` entries. This is acquisition state, not Person Knowledge.

An additive KnowledgeOpportunity state:

`active_goal_not_observed`

represents an authorized active goal with zero Person Knowledge states and deterministically yields an elementary acquisition Need.

Existing Opportunity semantics for represented dimensions are unchanged.

## Canonical planning lineage

For each eligible FHT goal the production slice reuses existing builders:

`goal-relative KnowledgeCoverage`
→ `KnowledgeOpportunity`
→ `KnowledgeAcquisitionNeed`
→ `KnowledgeAcquisitionStrategy`
→ `KnowledgeAcquisitionRequirement`
→ `KnowledgeAcquisitionDesign`
→ `KnowledgeAcquisitionCapabilityMatch`
→ `KnowledgeAcquisitionSolutionDecision`
→ `KnowledgeAcquisitionCapabilityConfiguration`
→ `KnowledgeAcquisitionPlan`
→ `KnowledgeAcquisitionRuntimeSession`.

The two goals remain separate canonical acquisition purposes with independent Design, Requirement, Plan and RuntimeSession identities.

## Design-time semantic authority

The bounded FHT-PD01 mapping is applied only at Design construction:

- `decision_accountability` → `professional_semantic_policy:decision_accountability:v1`
- `quantified_outcome` → `professional_semantic_policy:quantified_outcome:v1`

No answer, question, expectedSignal, category, number, percentage, CandidateProfile or JobFit participates in planning or policy selection.

Unsupported active goals fail closed.

## Plan / RuntimeSession handoff

The planner exposes:

- canonical Plans;
- created canonical RuntimeSessions;
- Plan Item refs;
- reconstructable Design refs;
- semantic policy through each Design lineage.

RuntimeSessions remain `created` with pending items. FHT-AP01 does **not** activate items, create Executions, or associate Plan Items with Interview Runtime questions. Those remain resumed FHT-AI01 scope.

The real `prepareStagedPrivateBetaJourney` now constructs this planning bundle before the interview begins and stores it on the staged session as `fhtAcquisitionPlanning`.

## Changed files

Seven files, exactly as listed in `TASK_FHT-AP01_MANIFEST.txt`.

`privateBetaStagedInterviewJourney.js` was already dirty from resumed FHT-DR02; FHT-AP01 adds only the pre-Runtime acquisition-planning construction/handoff there. Existing FHT-DR02 accumulation/downstream behavior is not changed.

`test_staged_private_beta_journey.js` is updated only to verify that the real staged preparation path receives both canonical FHT acquisition purposes before interview continuation.

## Verification

PASS:

- focused FHT-AP01 bounded bootstrap/planning test;
- real staged Private Beta preparation boundary test;
- FHT-PA01 Quantified Outcome regression;
- resumed FHT-DR02 regression;
- Decision Accountability semantic integration regression;
- Knowledge Opportunity / Need / Design / Plan / RuntimeSession regressions;
- full `scripts/fringe_health_check.js`.

Health result:

**All health checks passed.**

## Limitation / next boundary

FHT-AP01 intentionally stops before Runtime question/execution wiring.

The canonical acquisition purposes are now available in the live staged session, but no semantic execution is claimed.

Exact next action:

**resume FHT-AI01 — Live Acquisition Semantic Authority Integration**

using `fhtAcquisitionPlanning` Plan / RuntimeSession / Plan Item / Design lineage to associate already-authorized acquisition purposes with Runtime acquisition actions and later Executions, without deriving authority from answer content.

## Gate

First Human Test gate remains **CLOSED**.

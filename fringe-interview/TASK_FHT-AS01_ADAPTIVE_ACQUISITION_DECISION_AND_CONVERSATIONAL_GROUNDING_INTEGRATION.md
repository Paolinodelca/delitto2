# FHT-AS01 — Adaptive Acquisition Decision and Conversational Grounding Integration

## Verdict

**B — IMPLEMENTATION COMPLETE; CONTROLLED LIVE VERIFICATION REQUIRED**

## First failing boundary closed

Closed:

`current authorized acquisition state → adaptive purpose prioritization → eligible stable Runtime action → selected action`

The Runtime now consumes the bounded FHT acquisition planning and current-session authorized Knowledge before falling back to the legacy adaptive selector.

## Adaptive decision path

The new decision boundary:
- considers only goals already present in `planning.activeGoals`;
- derives eligible actions only from upstream `runtimeActionAssociations`;
- reduces marginal priority for a purpose that already has authorized current-session Knowledge;
- prioritizes an unresolved authorized purpose;
- applies a bounded conversational-opening cue only as behavioral priority, never as semantic authority;
- penalizes repeated actions where another authorized action is available;
- preserves the legacy selector as fallback when no applicable acquisition decision exists.

No Runtime-local `purpose → action` authority map was introduced.

## Semantic authority preservation

FHT-AS01 does not change DA/QO policies, Evidence interpretation, Observation, Measurement, Knowledge or Representation.

Answer wording can affect only a bounded behavioral priority cue. It cannot create a goal, semantic policy, action association, Execution or Knowledge.

FHT-AI01 remains the semantic execution boundary after action selection.

## Conversational grounding

A bounded grounding layer now runs before configured follow-up realization.

For `tool_adaptation`, the presuppositional wording is allowed only with grounded `tool_used` + `tool_required` referents. Otherwise the same pack pivots to an existing non-presuppositional localized question.

The accepted phrase `miglioramento misurabile` can be retained as a grounded conversational referent without being interpreted as QO Evidence.

## Behavioral policy seam

New versioned profile:

`config/adaptive_acquisition_policy.json`

New gradable values are centralized there rather than embedded as decision-logic magic numbers.

Semantic invariants remain outside behavioral configuration.

## Decision trace

Runtime trace records:
- candidate purposes and current state;
- applicable bounded cue;
- priority result;
- eligible actions and repetition state;
- selected purpose/action;
- grounded referents;
- realization source;
- grounding validation outcome.

The trace stores identities/states/referents needed for verification and does not duplicate the raw transcript.

## Verification

PASS:
- `scripts/test_fht_as01_adaptive_acquisition_decision_grounding.js`
- `scripts/test_fht_ai01_live_acquisition_semantic_authority_integration.js`
- `scripts/test_fht_ap01_live_acquisition_purpose_planning.js`
- `scripts/test_fht_kc01_knowledge_confidence_uncertainty_preservation.js`
- `scripts/test_fht_rs01_authorized_knowledge_perception_reconciliation.js`
- `scripts/test_staged_private_beta_journey.js`
- `scripts/fringe_health_check.js` — All health checks passed.

Additional earlier FHT-03 / FHT-DR02 regressions were also checked during implementation and passed.

## Residual limitation

Production conversational grounding is intentionally minimal. Accepted-answer measurable-result wording is grounded directly; tool-specific presuppositions require explicit structured tool referents and otherwise fail safe to non-presuppositional wording.

A controlled live Marco run is still required to verify the behavioral transition in the real Private Beta flow, especially:

DA already represented + QO unresolved + “miglioramento misurabile” opening
→ `achievement_quantification`
→ existing FHT-AI01 semantic execution.

No commit. No push.

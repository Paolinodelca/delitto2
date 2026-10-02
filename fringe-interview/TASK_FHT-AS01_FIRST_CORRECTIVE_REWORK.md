# IMAGO — FHT-AS01 FIRST CORRECTIVE REWORK
## Current-Answer Semantic Feedback Ordering and Session-Lifetime Acquisition Cues

### Verdict

**B — CORRECTIVE COMPLETE; CONTROLLED LIVE VERIFICATION REQUIRED**

No commit. No push.

### Lifecycle before / after

Before:

`accepted answer`
→ stale acquisition decision context
→ `advanceInterviewRuntime`
→ AS01 next-action decision
→ FHT semantic bridge
→ current-answer Knowledge append.

After:

`accepted answer`
→ answer accepted into Runtime
→ bounded pre-adaptive lifecycle hook
→ current answered action association
→ existing authorized FHT semantic bridge
→ current-answer Knowledge append where justified
→ session-lifetime bounded cue/referent retention
→ updated acquisition decision context
→ AS01 next-action decision
→ next question.

AS01 still does not interpret the answer. It consumes only the already-produced canonical Knowledge state plus bounded behavioral cues.

### Execution integrity

The existing semantic bridge was moved into the pre-adaptive lifecycle point; it was not duplicated.

The post-`advanceInterviewRuntime` semantic bridge invocation was removed.

The bridge continues to receive the association captured for the question actually being answered. The next-question association is materialized only after `advanceInterviewRuntime` returns.

Runtime Knowledge append remains deduplicated by the existing Execution/Evidence/goal key.

### Session-lifetime acquisition cues

A minimal bounded cue state is retained in the staged session.

Properties:
- only purposes already present in `planning.activeGoals` can receive a cue;
- cue state contains `purposeRef`, bounded referent and accepted Runtime answer source reference;
- cues survive intervening answers;
- cues do not create Evidence, Observation, Measurement, Knowledge, semantic policy, action association or a third purpose;
- measurable-result wording can also persist as a grounded conversational referent for safe question realization;
- no magnitude, unit, causality or ownership is inferred from the cue.

The AS01 selector can consume persisted cues in addition to the current answer.

### Journey-level regression

Added:

`scripts/test_fht_as01_corrective_lifecycle.js`

It verifies through the real staged journey that:
- Q1 measurable-result wording is retained while producing zero QO Knowledge by itself;
- the cue survives an intervening answer;
- retained QO cue can drive the existing upstream-associated `achievement_quantification`;
- current-answer DA Knowledge is appended before the same next-action AS01 decision;
- that decision sees DA=`represented` and QO=`not_observed`;
- QO becomes preferred over redundant DA;
- the selected QO action is `achievement_quantification`;
- standard adaptive budget remains `2`;
- Knowledge is appended once, without duplicate semantic execution.

### Adaptive budget

Unchanged.

Standard adaptive budget remains **2**.

No behavioral policy weights or thresholds were modified.

### Changed files

Exactly four files:
- `scripts/test_fht_as01_corrective_lifecycle.js`
- `src/app/knowledge/selectFhtAdaptiveAcquisitionDecision.js`
- `src/app/privateBetaStagedInterviewJourney.js`
- `src/interview/advanceInterviewRuntime.js`

### Tests / checks

PASS:
- FHT-AS01 original adaptive decision/grounding regression
- FHT-AS01 first corrective lifecycle regression
- FHT-AI01
- FHT-AP01
- FHT-KC01
- FHT-RS01
- staged Private Beta journey
- full `scripts/fringe_health_check.js`

Health result:

**All health checks passed.**

Changed-file whitespace checks: clean.

### Residual limitation

The bounded cue mechanism intentionally recognizes only the already-configured FHT acquisition cues and authorized active goals. It is not a generic conversational memory or semantic extractor.

Controlled live Marco verification remains required to confirm the corrected lifecycle with the production model path.

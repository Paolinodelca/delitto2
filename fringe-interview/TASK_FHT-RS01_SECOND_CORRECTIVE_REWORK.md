# IMAGO — FHT-RS01 SECOND CORRECTIVE REWORK
## Target Seniority Epistemic Eligibility and Gap-Specific Narrative Reconciliation

### Verdict

**B — SECOND CORRECTIVE IMPLEMENTATION COMPLETE; CONTROLLED LIVE VERIFICATION REQUIRED**

No commit. No push.

### Exact correction

The deterministic Professional Perception boundary was corrected in two places.

1. **Seniority gap eligibility**
   - A seniority `perceptionGap` is now created only when both candidate and target seniority are concrete comparable states:
     `junior`, `mid`, `senior`, `lead`.
   - `unclear` remains an epistemic/non-comparable state.
   - Therefore:
     - `senior` vs `unclear` → no seniority gap;
     - `unclear` vs `senior` → no seniority gap;
     - `mid` vs `senior` → legitimate comparison remains representable.
   - `runRoleProfileParser.js` was not modified.

2. **Gap-specific target-distance narrative**
   - `targetDistanceTargetSignalsWithGap` no longer appends generic responsibility/impact/result semantics.
   - `targetDistanceBridgeWithGap` now renders only the actual authorized gap narrative.
   - A gap can therefore no longer inject generic language about:
     decision accountability, personal contribution, causality, outcome magnitude, quantified impact, or “weight of decisions on the final result”.

### Semantic behavior before / after

Before:

`candidate seniority != target seniority`
→ any non-empty values compared
→ `unclear` became factual target distance
→ generic gap bridge added decision/outcome semantics unrelated to the gap.

After:

epistemic seniority
→ non-comparable
→ no factual seniority distance.

authorized gap
→ narrative bounded to that gap only.

no authorized gap
→ first RS01 corrective neutral no-gap behavior remains unchanged.

### DA / QO separation

Verified:

- supported `decision_accountability` remains representable;
- `quantified_outcome` not observed does not create weak impact, unclear decision weight, outcome ownership, contribution, or causality claims;
- a legitimate seniority or non-DA target gap does not inject DA/QO semantics;
- Representation Value Proof was not modified.

### Changed files

Exactly four files:

- `src/report/buildProReportV2.js`
- `src/report/narrativeData/proReport/generic_professional.json`
- `src/report/narrativeData/proReport/care_helping_professions.json`
- `scripts/test_fht_rs01_authorized_knowledge_perception_reconciliation.js`

Manifest and overlay contain exactly these files.

### Tests / checks

PASS:

- updated FHT-RS01 regression covering required cases A–I;
- FHT-DR02 final Representation authority;
- FHT-DR02 target-source authority;
- all FHT-03 semantic integrity regressions;
- FHT-AP01;
- FHT-AI01;
- FHT-KC01;
- Representation Value Proof;
- staged Private Beta journey;
- full `scripts/fringe_health_check.js`.

Health result:

**All health checks passed.**

Changed-file whitespace checks produced no errors.

### Limitation

This corrective remains deterministic narrative reconciliation. It does not introduce final LLM synthesis, change acquisition/runtime behavior, or verify live QO acquisition.

### Controlled live verification

Still required.

Expected live behavior:
- no user-facing “target requires unclear”;
- no seniority gap when target seniority is epistemically `unclear`;
- supported DA may remain visible;
- absent QO observation must not reappear as weak decision impact or weak outcome narrative;
- legitimate target gaps remain specific to their actual authorized gap.

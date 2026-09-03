# IMAGO — FHT-03 FOURTH CORRECTIVE REWORK

## Verdict

**A — deterministic bounded-state enforcement complete; awaiting local live verification**

No commit. No push. No reset.

## Residual defect addressed

The live provider could emit `peopleLeadership = "limited"` from evidence that only stated absence of direct hierarchical responsibility in one described project.

The existing CandidateProfile enforcement already normalized bounded `none` / `weak` states to `unclear`, but did not normalize `limited`. The same probabilistic evidence could therefore produce different global epistemic meaning depending on the model-selected label.

## Deterministic correction

At the existing `src/parser/enforceFht03SemanticIntegrity.js` boundary:

- bounded no-direct-leadership evidence now normalizes `peopleLeadership` values `none`, `weak`, and `limited` to the existing state `unclear`;
- `unclear` remains `unclear`;
- normalization is not applied when the source contains independent, non-bounded people-management authority;
- no new semantic state, Core contract, interpretation engine, provider logic, or prompt-based primary fix was introduced.

The JobFit boundary was also completed so that a requirement whose candidate authority is `unclear` cannot survive in `gaps` merely because the LLM selected `weak_signal` instead of `missing`. It is preserved through the existing clarification/acquisition surfaces.

## Adversarial regression

Added:

`scripts/test_fht03_fourth_corrective_bounded_people_leadership.js`

It verifies:

- `none` → `unclear`;
- `weak` → `unclear`;
- `limited` → `unclear`;
- `unclear` → `unclear`;
- no global leadership risk survives solely from bounded project evidence;
- independent global people-management evidence preserves a supported `limited` state;
- the `limited` case flows through JobFit as clarification/acquisition rather than `missing` or `weak_signal`;
- third-corrective narrative fail-closed behavior remains intact.

The earlier first-corrective regression was updated only to align its obsolete expectation with the already-authorized rule `person unclear → clarification, not factual gap`.

## Verification

PASS:

- `scripts/test_fht03_fourth_corrective_bounded_people_leadership.js`
- `scripts/test_fht03_third_corrective_narrative_semantic_enforcement.js`
- `scripts/test_fht03_second_corrective_semantic_enforcement.js`
- `scripts/test_fht03_corrective_semantic_enforcement.js`
- `scripts/test_fht03_semantic_integrity.js`
- `scripts/test_representation_value_proof_projection.js`
- `scripts/test_parser_prompts.js`
- `scripts/test_parser_runner_mock.js`
- `scripts/fringe_health_check.js`

Health result:

**All health checks passed.**

## Preserved FHT-03 corrections

Preserved:

- positive target requirement authority;
- no unauthorized Six Sigma/certification deficiency;
- bounded CandidateProfile leadership normalization;
- candidate `unclear` → clarification/acquisition, not factual missing/weakness;
- `fitSummary.shortRationale` fail-closed behavior;
- Representation referent preservation;
- HELP preservation;
- prompt guardrails as defense-in-depth.

## Remaining gate

The local Marco production run with the configured provider is still required before live verification can be claimed.

Expected live acceptance:

- `leadershipExposure = "unclear"`;
- `peopleLeadership = "unclear"`;
- no factual leadership gap/weak signal/risk when person evidence remains insufficient;
- leadership may remain in acquisition/clarification surfaces;
- no Six Sigma/certification factual deficiency;
- `fitSummary.shortRationale` remains fail-closed / semantically safe.

## Overlay contents

The overlay contains only the implementation/test files actually modified by this fourth corrective rework. Report, manifest, tmp files, logs, and live diagnostics are excluded.

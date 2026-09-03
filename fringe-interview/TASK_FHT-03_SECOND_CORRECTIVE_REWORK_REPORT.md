# FHT-03 — Second Corrective Rework Report

## Status

**A — deterministic semantic enforcement complete; awaiting local live verification**

This remains FHT-03. No FHT-04 was opened. No commit or push was performed.

## Why the previous corrective was reopened

The second Marco live diagnostic showed two residual violations despite the first deterministic boundary:

1. JobFit could invent a factual deficiency not present even in `RoleProfile.skills` (for example a certification deficiency), because filtering was primarily negative/blacklist-like.
2. JobFit received target authority but not CandidateProfile authority, so a real target requirement combined with candidate `unclear` could still become a factual `missing` capability.

## Boundary selected

The existing parser semantic boundary remains the narrowest enforcement point:

LLM JobFit output → `enforceJobFitSemanticIntegrity()` → downstream consumers.

`runJobFitAnalysis()` now passes the already-existing CandidateProfile to this boundary. No new source of truth, Core state, semantic engine, or Representation architecture was introduced.

## Deterministic enforcement

### Positive target authority

Gap/factual deficiency surfaces now require positive membership in the existing target requirement authority:

- `roleProfile.requirements.mustHave`
- `roleProfile.requirements.preferred`
- `roleProfile.requirements.bonus`

Items invented by the LLM without such authority are removed from `gaps`, `missingSkills`, `weakSignals`, and `reportHighlights.risks`. HELP surfaces are not filtered by this rule.

### Person epistemic authority

The boundary derives uncertainty only from existing CandidateProfile fields whose canonical value is `unclear`. When an actual target requirement corresponds to an unclear candidate signal, a `missing` gap and factual negative surfaces are suppressed. Where the existing JobFit schema exposes them, the requirement is preserved as clarification/evidence-acquisition work through `ambiguities`, `questionFocusAreas`, and `interviewFocus` (`clarify_ambiguity`).

This preserves the distinction:

`target requirement + person unclear → acquire/clarify evidence`, not `missing capability`.

## Adversarial regression

Added `scripts/test_fht03_second_corrective_semantic_enforcement.js`.

It deliberately supplies an incorrect JobFit result containing:

- unauthorized Lean Six Sigma/certification deficiencies that do not occur in RoleProfile skills or requirements;
- a real team-leadership target requirement incorrectly classified as `missing` while CandidateProfile leadership authority is `unclear`.

The test verifies that factual/gap propagation is blocked, HELP remains, and leadership is redirected to existing clarification/interview surfaces.

## Verification

PASS:

- `node scripts/test_fht03_second_corrective_semantic_enforcement.js`
- `node scripts/test_fht03_corrective_semantic_enforcement.js`
- `node scripts/test_fht03_semantic_integrity.js`
- `node scripts/test_representation_value_proof_projection.js`
- `node scripts/test_parser_prompts.js`
- `node scripts/fringe_health_check.js` → `All health checks passed.`

Representation referent preservation and the first corrective CandidateProfile boundedness remain covered by the existing regressions.

## Live Marco verification

Not claimed in this execution environment. The task explicitly requires the configured user's real provider environment for the acceptance run. Therefore status B (`FHT-03 LIVE SEMANTIC INTEGRITY VERIFIED`) is intentionally **not** declared.

The local live run must confirm at minimum:

- CandidateProfile leadership remains `unclear` without project-bounded evidence becoming a global risk;
- no invented Six Sigma/certification target requirement;
- Six Sigma/certifications do not survive as gap/missingSkill/factual weakSignal/risk without requirement authority, while HELP may remain;
- a real leadership requirement remains target-relevant but does not become `missing` solely because CandidateProfile is `unclear`.

## Residual limitation

The deterministic boundary uses the semantic vocabulary already exposed by CandidateProfile and JobFit. It does not attempt to infer new epistemic states or establish absence from free text. Stronger negative conclusions remain permissible only where existing person authority is stronger than `unclear`; this rework does not redefine what constitutes such authority.

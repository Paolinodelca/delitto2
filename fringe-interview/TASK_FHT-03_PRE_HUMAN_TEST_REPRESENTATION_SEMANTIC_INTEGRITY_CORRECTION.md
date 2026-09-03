# FHT-03 — Pre-Human-Test Representation Semantic Integrity Correction

## Verdict

**IMPLEMENTED — PASS**

The repository-first review found existing canonical authority sufficient for the requested correction. No new epistemic state, Core semantic authority, interpretation engine, or Representation architecture was introduced.

## Authority / boundary findings

- Existing Core authority already distinguishes `not_observed` / `insufficient_evidence` from absence or weakness.
- `RoleProfile.requirements.{mustHave,preferred,bonus}` is the existing target requirement classification boundary; `RoleProfile.skills` can contain professionally related context without making it a requirement.
- CandidateProfile already exposes `unclear` values and `ambiguities`, so contextual non-exercise can be preserved without inventing new states.
- The live referent loss was downstream: generic `riskPerceptionGapNarrative` plus projection preference for `narrative` over `area`.

## Minimal changes

1. `config/parser_prompts.json`
   - CandidateProfile guardrails prevent a context-bounded statement such as no direct hierarchical responsibility in one project from becoming person-level weak/none leadership without broader evidence.
   - JobFitAnalysis guardrails require target-requirement authority before producing gap/missing/weak/risk outputs.
   - Related methodologies remain eligible for HELP/CV/interview suggestions without being promoted to JD requirements or person deficiencies.

2. `src/report/buildProReportV2.js`
   - Risk perception narratives now receive the specific gap `area` as template context.

3. Narrative resources
   - `riskPerceptionGapNarrative` now names `{{area}}` instead of the referent-free “Questo elemento...”.

4. `src/app/buildRepresentationValueProofProjection.js`
   - Projection preserves the gap area when a generic/deictic narrative is encountered and otherwise combines area + narrative when the narrative does not identify its subject.

5. `scripts/test_fht03_semantic_integrity.js`
   - Regression coverage for bounded leadership evidence, target inference boundary / HELP preservation, and Representation referent preservation.

## Verification

PASS:

- `node scripts/test_fht03_semantic_integrity.js`
- `node scripts/test_representation_value_proof_projection.js`
- `node scripts/test_parser_prompts.js`
- `node scripts/fringe_health_check.js` → **All health checks passed.**

## Scope

No redesign, persistence/authentication work, planner changes, new Core capability, new semantic state, scoring change, new model, or general refactor was introduced.

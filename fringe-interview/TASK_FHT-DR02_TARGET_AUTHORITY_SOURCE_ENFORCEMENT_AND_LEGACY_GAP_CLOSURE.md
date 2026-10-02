# IMAGO — FHT-DR02 CORRECTIVE REWORK
## Target Authority Source Enforcement and Legacy Gap Closure

### Verdict

**B — CORRECTIVE IMPLEMENTATION COMPLETE; CONTROLLED LIVE VERIFICATION REQUIRED**

### Confirmed root cause

The controlled defect was confirmed at:

`raw target/JD -> RoleProfile.requirements`

`runRoleProfileParser()` previously returned model-produced RoleProfile requirements without deterministic source-authority enforcement. A model inference such as Lean/Six Sigma could therefore enter `RoleProfile.requirements`, survive JobFit integrity enforcement as apparently authorized target material, and reach legacy `professionalPerception.perceptionV2.targetDistance`.

### Corrective design

Two-layer narrow defense using one deterministic target-source grounding rule:

1. **Primary boundary — RoleProfile source authority**
   - `runRoleProfileParser()` now applies `enforceRoleProfileTargetAuthority()`.
   - `mustHave`, `preferred`, and `bonus` requirements survive only when their meaningful terms are grounded in the actual supplied target source (`jdText + roleNotes`).
   - Skills/methodologies may remain descriptive model output; they do not become target authority.
   - No blacklist and no Lean/Six Sigma-specific rule was introduced.

2. **Defense in depth — legacy Professional Perception**
   - `buildProReportV2()` independently filters target-relative `roleFit/cvAdvice` risks and missing skills against:
     - canonical RoleProfile requirements, and
     - the actual raw target source when available.
   - The live paths now pass the resolved raw target source into `buildProReportV2`.
   - Therefore even a contaminated upstream RoleProfile cannot generate the legacy target-distance gap when the source target does not ground it.

### Grounding behavior

The target-source rule is deterministic lexical grounding over normalized meaningful tokens. It deliberately does not infer adjacent professional methodologies.

Therefore:

`continuous improvement` does not authorize `Lean/Six Sigma`.

An explicit source requirement containing Lean/Six Sigma does authorize the corresponding RoleProfile requirement.

### Changed files

- `src/parser/enforceFht03SemanticIntegrity.js`
- `src/parser/runRoleProfileParser.js`
- `src/report/buildProReportV2.js`
- `src/app/privateBetaStagedInterviewJourney.js`
- `src/app/runFringeInterviewMVPSession.js`
- `scripts/test_fht_dr02_target_authority_source_enforcement.js`

`privateBetaStagedInterviewJourney.js` belongs to the already-dirty FHT chain; this corrective adds only raw-target propagation to the Pro Report call there.

### Tests added

`test_fht_dr02_target_authority_source_enforcement.js` proves:

- continuous improvement without Lean/Six Sigma rejects model promotion;
- explicit Lean/Six Sigma target source preserves legitimate authority;
- methodology-only RoleProfile content does not become target authority;
- unsupported legacy target risk cannot create `perceptionV2.targetDistance` gap;
- defense remains effective even with an intentionally contaminated RoleProfile;
- authorized target risk remains available;
- unrelated uncertainty/non-observation does not manufacture a target gap.

### Verification

PASS:

- new FHT-DR02 target-source authority regression;
- FHT-DR02 Representation Value Proof regression;
- all five FHT-03 semantic integrity regressions;
- FHT-AP01;
- FHT-AI01;
- FHT-KC01;
- parser mock regression;
- full `scripts/fringe_health_check.js`.

Health result:

**All health checks passed.**

Diff against the supplied repository ZIP shows exactly the six files in the manifest.
Delta-only `git diff --no-index --check` produced no whitespace errors.

### Residual limitation

This corrective does not claim controlled live verification.

The RoleProfile source grounding is intentionally fail-closed and lexical/bounded; it does not introduce a general semantic matcher. This can reject model-paraphrased requirements that are not sufficiently grounded in the source wording, which is preferable to manufacturing target authority under the current Product Authority.

### Next action

Repeat the controlled `/private-beta` Operations Manager run with the same JD and verify that Lean/Six Sigma does not appear as a target-relative gap while legitimate source-backed target gaps remain available.

FHT-AI01 routing and Quantified Outcome verification remain separate.

### Gate

First Human Test gate remains **CLOSED**.

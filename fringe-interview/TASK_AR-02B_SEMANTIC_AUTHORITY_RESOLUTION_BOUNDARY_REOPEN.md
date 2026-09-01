# AR-02B — Semantic Authority Resolution Boundary — Reopen

## Verdict

**C — IMPLEMENTATION BLOCKED BY CONTRACT / AUTHORITY GAP**

No semantic workaround or partial implementation was introduced.

## Repository finding

PA-03 now provides the missing **Product semantic authority** for the single authorized path
`professional_semantic_policy:decision_accountability:v1`, including the canonical characteristic,
bounded Measurement meaning, identity-preserving mapping to dimension `decision_accountability`,
and the requirement that policy selection occur upstream through an explicit acquisition association.

The repository, however, still does not contain a canonical end-to-end contract that can transport
and reconstruct that association at the Evidence boundary consumed by AR-02A.

In particular:

- `KnowledgeAcquisitionDesign` owns `targetKnowledge` and causal traceability, but its canonical
  contract has no `semanticPolicyRef`;
- downstream Plan / Runtime Session / Execution preserve acquisition causality, but do not establish
  or carry the PA-03 semantic-policy association;
- `buildAcceptedRuntimeAnswerEvidenceStore()` creates canonical Evidence provenance from Beta /
  Interview / question / runtime-answer references only; it does not preserve an acquisition-definition
  reference or `semanticPolicyRef`;
- therefore AR-02B cannot prove that
  `professional_semantic_policy:decision_accountability:v1` was explicitly selected before Evidence
  interpretation.

Per the task stop condition, deriving the policy from `questionKey`, expected signals, answer text,
capability identity, target, annotation, or perception is forbidden.

## Compatibility finding

The existing specialized `src/core/measurement/decisionAccountability/*` family and the generic
Registered Evidence → Observation → MeasurementResult path consumed by AR-02A are **not directly
contract-compatible**.

The specialized family consumes a structured `decision_accountability` Observation containing
semantic fields such as decision authority, consequence scope, accountability evidence, and
responsibility continuity. AR-02A instead consumes generic registered Evidence plus an
`observationConstruction` authority and generic normalization contract.

PA-03 authorizes the meaning of those fields, but the repository does not contain a canonical,
non-inventive boundary that converts arbitrary Runtime-answer Evidence into those structured
decision-accountability semantics. Creating such an adapter inside AR-02B would perform semantic
interpretation rather than merely resolve already-selected authority.

Consequently, the mandatory architecture question is answered **NO**:

> The canonical PA-03 decision_accountability policy cannot currently be resolved into the
> semanticAuthority contract consumed by AR-02A using existing repository contracts without
> semantic invention.

## Minimum decision / boundary required

Before AR-02B can be implemented, the repository needs a canonical acquisition-to-Evidence semantic
association boundary that, at minimum:

1. represents the explicit `semanticPolicyRef` on an authorized acquisition definition associated
   with target `elementary / dimension / decision_accountability`;
2. preserves a canonical reference to that association through execution into Evidence provenance;
3. defines how eligible Evidence reaches an AR-02A-compatible Observation Construction authority
   without inferring semantic fields from answer text inside the resolver.

This is an authority/contract decision, not something AR-02B may invent.

AR-02A was not modified.

## Verification

Executed against the supplied repository:

- `node scripts/test_ar02a_runtime_answer_knowledge_vertical_slice.js` — PASS
- `node scripts/test_build_decision_accountability_observation.js` — PASS
- `node scripts/test_build_decision_accountability_measure_result.js` — PASS
- `node scripts/test_health_measurement_dimension_mapping.js` — PASS
- `node scripts/fringe_health_check.js` — PASS (`All health checks passed.`)

These checks confirm that the existing components remain healthy; they do not remove the boundary
gap described above.

## Changed files

Only this blocked report and its manifest were added. No source, test, Product Authority, or
continuity file was changed.

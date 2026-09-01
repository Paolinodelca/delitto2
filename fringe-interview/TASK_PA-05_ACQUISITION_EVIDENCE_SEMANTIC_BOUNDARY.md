# PA-05 — Acquisition-to-Evidence Semantic Association and Observation Construction Boundary

## 1. Executive verdict

**A — MINIMAL CANONICAL BOUNDARY AUTHORIZED.**

The repository contains enough existing causal acquisition structure and enough canonical `decision_accountability` semantic meaning to authorize one production vertical slice without inventing a generic semantic system. PA-05 canonizes only the missing ownership, lineage, interpretation, and no-observation boundaries.

Note: the handover ZIP does not contain standalone PA-03/PA-04/AR-02A/AR-02B report files. Their canonical outcomes are nevertheless present in `docs/20-product/PRODUCT_DECISIONS.md`, `docs/00-continuity/BETA_READINESS_MATRIX.md`, the current task authority, and the implementation/contracts reviewed here; no conclusion below relies on an unavailable report-only rule.

## 2. Repository findings

- `KnowledgeAcquisitionRequirement` is intentionally declarative and currently carries requirement/causal references only; it is not the semantic solution-definition boundary.
- `KnowledgeAcquisitionDesign` already owns `targetKnowledge`, solution shape, capability obligations, `sourceRequirementRef`, and full upstream traceability. This is the earliest existing artifact that defines how an acquisition requirement is to be satisfied.
- Downstream causality is already reconstructable: `SolutionDecision.sourceDesignRef` → `CapabilityConfiguration.sourceSolutionDecisionRef` → `Plan.sourceCapabilityConfigurationRef` → `RuntimeSession.sourceKnowledgeAcquisitionPlanRef` → `Execution.sourcePlanRef/sourcePlanItemRef`. The missing link is from accepted-runtime-answer Evidence back to the exact acquisition Execution.
- `buildAcceptedRuntimeAnswerEvidenceStore()` currently preserves Beta Session, Interview Session, question and runtime-answer references, but no acquisition Execution reference.
- AR-02A generic Observation Construction is exact-rule based and consumes generic `Observation`; it is not semantically compatible with the specialized `decisionAccountability` Observation family.
- The specialized `DecisionAccountabilityObservation` already carries the authorized semantic components: decision authority, consequence scope, accountability evidence, responsibility continuity, context, Evidence IDs, inference-support inputs and limitations. Its specialized Measurement already computes the bounded `decision_accountability` measurement meaning.

## 3. Decision — semanticPolicyRef ownership

Canonical owner: **`KnowledgeAcquisitionDesign`**.

Minimum new field: `KnowledgeAcquisitionDesign.semanticPolicyRef`, with the only value authorized by this slice:

`professional_semantic_policy:decision_accountability:v1`

Validation: it is valid only for `designType = elementary_acquisition_design`, `targetKnowledge.knowledgeLayer = elementary`, `targetKnowledge.scope = dimension`, and `targetKnowledge.scopeRef = decision_accountability`. Requirement does not own the field. No downstream inference may choose the policy.

## 4. Decision — acquisition → Evidence traceability

Do not copy `semanticPolicyRef` through every artifact. Preserve causality to its owner.

Minimum missing Evidence reference: `Evidence.content.provenance.knowledgeAcquisitionExecutionRef`. It must reference the exact `KnowledgeAcquisitionExecution` that caused the accepted runtime answer acquisition.

Resolution chain:

`Evidence → Execution → Plan → CapabilityConfiguration → SolutionDecision → KnowledgeAcquisitionDesign.semanticPolicyRef`

Each supplied artifact must validate and each reference must match exactly. Missing, broken, ambiguous, or mismatched lineage resolves **no semantic authority**.

## 5. Decision — semantic interpretation ownership

AR-02B owns **resolution only**. It must not inspect answer text to decide policy.

A separate `decision_accountability` Observation Construction boundary owns interpretation of eligible Evidence **after** AR-02B has resolved `professional_semantic_policy:decision_accountability:v1`. Its executor may be deterministic or model-backed. The executor is never semantic authority.

## 6. Decision — authorized Observation Construction

Canonical semantic output: the existing specialized `DecisionAccountabilityObservation` contract. It is the semantic owner for this slice; the generic AR-02A Observation family is not a competing definition.

Required output provenance: existing `evidenceIds` must identify supporting canonical Evidence; `extensions.semanticProvenance` must preserve the resolved `semanticPolicyRef`, `knowledgeAcquisitionDesignRef`, and `knowledgeAcquisitionExecutionRef`. No Evidence support means no valid semantic Observation.

The existing specialized decision-accountability Measurement remains canonical. To enter the existing AR-02A downstream DimensionContribution/Knowledge machinery, the technical task may add only a **lossless identity-preserving projection** from the already-computed specialized decision-accountability Measurement meaning into the existing canonical generic `MeasurementResult` contract. That projection may not reinterpret Evidence, introduce another score, or alter the construct. The existing PA-03 mapping remains `decision_accountability → decision_accountability`, supporting, weight 1, confidenceFactor 1.

## 7. Model execution vs semantic authority

A model **may execute** authorized Evidence interpretation only after policy resolution, under the explicit decision-accountability Observation Construction authority, with constrained output validated as `DecisionAccountabilityObservation`, preserved provenance, and rejection of unsupported/invalid output. Model output cannot select the policy or become semantic authority.

## 8. No-valid-observation semantics

Insufficient, out-of-scope, unreliable, invalid, or unsupported interpretation produces **no valid semantic Observation** and therefore no Knowledge-path Measurement, no DimensionContribution, no weakness, and no fallback semantic inference. `not observed ≠ absent`.

## 9. Product Decisions added

- **PD-035** — `KnowledgeAcquisitionDesign` owns the semantic-policy association.
- **PD-036** — acquisition association is proven by causal lineage, not copied labels.
- **PD-037** — authority resolution and Evidence interpretation are separate responsibilities.
- **PD-038** — specialized decision-accountability Observation/Measurement are canonical for this slice.
- **PD-039** — no valid Observation produces no Knowledge effect.

No existing Product Decision was weakened or redefined.

## 10. Minimum implementation contract for the next technical task

| Canonical owner | Existing contract affected | Minimum change | Validation / failure behavior |
|---|---|---|---|
| KnowledgeAcquisitionDesign | build/validate Design + identity | add `semanticPolicyRef` | exact authorized value + exact decision-accountability elementary target; otherwise invalid Design |
| Accepted-runtime-answer Evidence provenance | Evidence registration | add `knowledgeAcquisitionExecutionRef` | must reference exact causal Execution; absent/mismatch = no authority |
| Semantic authority resolver | new minimal application boundary | resolve Evidence lineage to Design and return the authorized policy/refs without semantic inspection | broken/ambiguous chain = no authority |
| Decision-accountability Observation Construction | minimal specialized interpretation boundary | consume eligible Evidence + resolved authority; emit validated `DecisionAccountabilityObservation` with Evidence and semantic provenance | unsupported/invalid output = no Observation |
| Decision-accountability Measurement bridge | existing specialized Measurement + generic downstream MeasurementResult boundary | lossless identity-preserving projection only | no reinterpretation/new score; invalid projection cannot reach DimensionContribution |
| Dimension mapping | existing MeasurementDimensionMapping | use canonical PA-03 identity mapping | exact dimension/relationship/weight/confidenceFactor only |

Production code and tests are intentionally unchanged in PA-05.

## 11. Is AR-02B now implementable without semantic invention?

**YES.** The policy owner, causal proof, resolver responsibility, interpretation owner, canonical Observation family, model constraint, and no-observation behavior are now explicit. AR-02B can resolve authority without inspecting answer semantics.

## 12. Recommended exact next technical task

**AR-02B — Decision Accountability Semantic Authority Resolution and Observation Construction Integration**

Implement only the single `professional_semantic_policy:decision_accountability:v1` path authorized by PA-05: Design ownership → execution-linked Evidence provenance → non-interpretive authority resolution → constrained specialized Observation Construction → existing specialized Measurement → minimum identity-preserving MeasurementResult projection → existing PA-03 dimension mapping → AR-02A downstream Knowledge path. No registry, discovery engine, second dimension, temporal model, target comparison, or generic provider framework.

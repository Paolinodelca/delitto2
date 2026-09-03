# IMAGO — FHT-AR01 PROFESSIONAL REPRESENTATION SEMANTIC AUTHORITY RESOLUTION

## Verdict

**B — MINIMAL CANONICAL PROFESSIONAL SEMANTIC AUTHORITY CAN BE DEFINED FROM EXISTING PRODUCT AUTHORITY**

Review/decision only. No implementation, no contract modification, no overlay, no commit, no push.

## 1. Existing canonical authority

The repository already contains the architectural pattern required to authorize professional semantics:

`KnowledgeAcquisitionDesign.semanticPolicyRef`
→ acquisition lineage
→ Evidence
→ semantic-authority resolution
→ specialized Observation
→ specialized Measurement
→ identity-preserving generic MeasurementResult projection
→ DimensionContribution
→ KnowledgeLedger / KnowledgeSnapshot
→ PersonKnowledgeMatrix / KnowledgeCoverage.

Today the only production policy encoded in that path is:

`professional_semantic_policy:decision_accountability:v1`

Its **meaning must remain narrow and independent**.

Product Authority nevertheless defines a broader canonical professional semantic grammar for event-scoped Observation:

`Subject`
→ `Action / contribution`
→ `Object / domain`
→ `Professional relationship`
→ `Responsibility / accountability scope`
→ `Context`
→ `Outcome`
→ `Evidence provenance`.

It also explicitly preserves reusable source Observation types `OBS-007` through `OBS-010`, including `OBS-010 — Quantified outcomes`.

Therefore the missing FHT authority does not require a new product principle or universal professional ontology.

## 2. Missing authority

The smallest missing authority is:

**one additional narrow production professional semantic policy, independent of Decision Accountability, capable of converting authorized current-session Evidence about a quantified/measurable outcome into canonical event-scoped Observation/Knowledge and then permitting an identity-preserving Representation claim.**

The policy must not authorize generic competence, leadership, ownership, causality, investment autonomy, or target fit.

It must preserve the Product distinction:

observable outcome connected to the person's supported contribution
≠ sole causal ownership of the outcome
≠ stable person trait.

## 3. Canonical semantic unit

Use the existing **elementary professional semantic dimension / characteristic pattern** already proven by Decision Accountability, but create only one new FHT slice aligned to canonical `OBS-010 — Quantified outcomes`.

Recommended canonical identity for the next implementation task:

- semantic policy: `professional_semantic_policy:quantified_outcome:v1`;
- characteristic/dimension: `quantified_outcome`.

Meaning:

> evidence-backed measurable outcome, scale or impact connected to the person's supported contribution in the represented professional event/context.

This is event-scoped elementary Knowledge. It is not a universal performance score and not a stable trait.

The implementation may reuse the Decision Accountability **contract/provenance pattern**, but not its Observation fields, Measurement semantics, scoring meaning, or dimension meaning.

## 4. Representation consumption boundary

Professional Perception must **consume already-authorized semantic material**; it must not itself own semantic interpretation.

For the First Human Test:

1. accepted current-session Evidence is interpreted only under an explicitly resolved semantic policy;
2. valid Observation/Measurement produces elementary Knowledge;
3. Professional Perception may project a narrow positive claim only when that claim is an identity-preserving rendering of the authorized Knowledge/Observation meaning;
4. broader person characterization requires separate explicit derived semantics and must otherwise remain unsupported.

Thus an authorized outcome Observation may support a claim equivalent to:

`a measurable outcome was observed in this episode`

with the supported value/context where provenance permits it.

It does not authorize:

- consistently delivers measurable results;
- owns business outcomes;
- autonomous project management;
- leadership;
- generic operational excellence.

## 5. Target relation boundary

Target relation remains a **separate deterministic downstream operation**:

`authoritative Person Knowledge`
×
`canonical RoleProfile requirements`
→
target-relative state.

The professional semantic policy establishes what is known about the person.

The target requirement set establishes what the target actually requires.

Neither side may create authority for the other.

Therefore:

- `capacity planning` may be `insufficiently observed for comparison` only when it is an actual target requirement;
- Six Sigma / international experience cannot become target deficiency when absent from canonical requirements;
- target importance may prioritize acquisition but may not manufacture mismatch.

No target semantics belong inside `professional_semantic_policy:quantified_outcome:v1`.

## 6. Minimal First-Human-Test semantic slice

The minimum slice is deliberately **two semantic types total**:

1. **Decision Accountability** — already production-authorized.
2. **Quantified Outcome** — one new narrow policy derived directly from canonical `OBS-010`.

This is sufficient to prove the required architectural proposition:

`new authoritative interview Evidence`
→ `canonical Knowledge`
→ `legitimate new Professional Perception signal`
→ `evolved Representation`.

The controlled 2023 case can therefore truthfully surface, where supported:

- a decision/trade-off through existing Decision Accountability authority;
- an approximately 20% scrap reduction as an event-scoped quantified outcome connected to the person's supported contribution.

This is enough for the First Human Test proof.

The following do **not** need new production authority before that proof:

- cross-functional coordination;
- implementation responsibility;
- people leadership;
- investment autonomy;
- capacity-planning capability.

They remain unavailable as positive person claims unless independently authorized later.

## 7. Explicit exclusions

Until separate semantic authority exists, Representation must not generate positive person claims for:

- cross-functional leadership/coordination as a generalized person characteristic;
- people leadership;
- implementation/execution ownership as a generalized person characteristic;
- autonomous investment management;
- capacity-planning capability;
- specialist competence inferred from proximity;
- generic operations leadership;
- any broader trait derived from one event.

Contextual Evidence may exist without being Representation-authorized.

Unknown / insufficiently observed / unsupported-for-Representation must remain valid outcomes.

## 8. Traceability requirement

Minimum final-claim traceability is:

`Representation claim`
→ authoritative elementary Knowledge state/ref
→ supporting MeasurementResult / DimensionContribution
→ specialized Observation
→ supporting Evidence ID(s)
→ resolved `semanticPolicyRef`
→ causal acquisition lineage back to the owning `KnowledgeAcquisitionDesign`.

The claim layer does not need to duplicate the whole provenance graph, but the chain must remain reconstructable.

For an event-specific numeric/context detail, the claim may consume the specialized Observation referenced by the authoritative Knowledge lineage; Knowledge authorizes the semantic meaning, while Observation/Evidence preserves the event detail.

## 9. Knowledge vs Representation

`PersonKnowledgeMatrix` / `KnowledgeCoverage` are sufficient as the canonical person-Knowledge composition and observability structures **once a semantic policy has produced a legitimate elementary Knowledge state**.

They do not themselves authorize new professional meaning.

The remaining Representation rule is intentionally narrow:

**authorized elementary Knowledge may be projected without semantic strengthening; broader person claims require explicit derived semantics.**

Therefore the blocker is primarily:

**A. missing semantic policy feeding existing Knowledge structures**

plus a deterministic consumption rule already derivable from Product Authority.

It is not necessary to create a new Representation architecture.

## Professional Perception authority

Professional Perception is an Application/report projection layer, not an independent semantic authority.

Its role is to:

- consume already-authorized person semantic material;
- preserve uncertainty;
- contextualize without semantic strengthening;
- keep target comparison separate.

Semantic authority must not live in narrative prose or model-generated report wording.

## Architecture options

### Option A — multiple narrow professional semantic policies

**Selected architectural pattern.**

It reuses the existing acquisition/provenance/Observation/Measurement/Knowledge pattern while keeping each professional meaning independently authorized.

For FHT, instantiate only one additional policy: Quantified Outcome.

### Option B — one multi-characteristic Professional Representation policy

Rejected for the First Human Test.

It would bundle distinct semantics prematurely and create a larger implicit ontology boundary.

### Option C — existing architecture plus registry/composition only

Partially true structurally, but insufficient by itself.

The current design validator explicitly authorizes only the Decision Accountability policy. A policy registry/allowlist can support multiple policies technically, but each policy still needs independently defined semantic meaning and specialized interpretation authority.

### Option D — another existing mechanism already owns the semantics

Not supported by repository evidence.

Professional Perception, JobFit, parser prompts and raw Runtime answers are not canonical semantic authorities.

### Option E — product decision still missing

Rejected.

Product Authority already defines enough event-scoped professional semantics, including `OBS-010`, to authorize one minimal additional vertical slice without deciding a general competency framework.

## PA-03 / Decision Accountability comparison

This is the **same architectural class of problem** as PA-03 / Decision Accountability:

- semantic meaning must be explicitly authorized before interpretation;
- acquisition must own the policy association;
- Evidence must preserve causal lineage;
- interpreter executes authority but does not create it;
- unsupported evidence produces no Knowledge effect;
- target/title/prompt wording cannot select semantic meaning.

What is reusable:

- semantic-policy association pattern;
- authority resolution;
- provenance;
- constrained interpretation boundary;
- specialized Observation/Measurement;
- identity-preserving projection into existing Knowledge machinery.

What must remain independent:

- Observation schema;
- Measurement semantics;
- characteristic/dimension meaning;
- eligibility rules;
- claim boundary.

## 9. Implementation readiness

Architecture is sufficiently resolved for exactly one next implementation task.

### Next task

**FHT-PA01 — Minimal Canonical Professional Representation Semantic Authority**

Scope:

Implement only `professional_semantic_policy:quantified_outcome:v1` as the minimum second professional semantic vertical slice.

The task should:

- encode the policy as an explicitly authorized semantic policy;
- associate it upstream through `KnowledgeAcquisitionDesign`;
- resolve authority through existing causal acquisition lineage;
- define the minimum specialized event-scoped Quantified Outcome Observation;
- define a bounded Measurement and identity-preserving mapping to elementary `quantified_outcome` Knowledge;
- preserve numeric outcome, contribution relationship, context, limitations and Evidence provenance without asserting sole causality;
- prove deterministic Evidence → Observation → Measurement → Knowledge;
- prove that unsupported/ambiguous Evidence yields no fabricated Knowledge;
- prove that Decision Accountability remains unchanged.

It should **not yet** perform broad ProReport/UI cleanup.

After FHT-PA01 is complete, FHT-DR02 may resume to integrate:

- authorized current-session Knowledge into Professional Perception;
- claim-strength gating;
- target-authority gating;
- semantic separation of supporting evidence / uncertainty / target relation.

## First Human Test gate

**CLOSED** until:

1. FHT-PA01 provides the minimal new semantic authority;
2. FHT-DR02 resumes and integrates authorized Knowledge into the final Representation;
3. the independent feedback operational blocker is resolved.


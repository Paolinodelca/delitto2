# IMAGO Representation Model

## Definition
A Representation is a computable, explainable, traceable and revisable description of a subject, system or phenomenon built from incomplete observations.

```text
Reality
→ Observation
→ Evidence
→ Measurement
→ Knowledge
→ Representation
→ Application
→ Decision or Action
```

## Minimal Representation
A minimal Representation contains:
- subject reference;
- representation type and version;
- context and temporal validity;
- source and evidence references;
- elementary knowledge states;
- derived knowledge states when available;
- visibility or coverage information kept distinct from value;
- confidence and uncertainty;
- provenance and dependency references;
- recipe/version references for derived dimensions;
- dated snapshot identity;
- permissions when personal data is involved.

## Professional Identity
In the professional domain, the persistent personal Representation is the Professional Identity.

It can be enriched by CV, LinkedIn, uploaded documents, interviews, Tutor contributions, assessments, experience, training, certifications, aspirations and constraints.

## Lifecycle
```text
Create
→ Acquire authorised inputs
→ Build or update knowledge
→ Materialize current Representation
→ Use in applications
→ Add new evidence or experience
→ Create a new dated snapshot
→ Continue
```

There is no natural functional end to a professional Representation.

## Knowledge separation
Evidence remains authoritative. Reconstructed knowledge and Representations are materialized, explainable views.

Elementary and derived knowledge remain distinct unless an explicit model says otherwise.

Coverage, confidence, quality, reliability, independence and consistency are separate concepts. More documents or more questions do not automatically mean more evidence.


## Multi-source and temporal professional evidence

Professional Identity may be reconstructed from multiple authorised professional sources and from direct user interaction. The source set is intentionally broader than the historical CV + Job Description input pattern and may include current or historical CVs, professional-profile material, reviews, references, certifications, portfolio/project material, Tutor-attributed material, assessments, free narrative and interview interaction.

The user is not required to classify each contribution according to IMAGO's internal Evidence/Knowledge taxonomy. Product interaction may remain conversational and use simple document acquisition while internal acquisition preserves source identity, provenance and semantic structure.

For dated material, IMAGO distinguishes:

```text
source time
= when the source/material was produced

event / experience time
= when the professional event described by the source occurred
```

The two times may differ and neither may be invented when unknown.

Historical sources have two legitimate evidential roles:

1. they are Evidence of the professional self-representation/material produced at that source time;
2. they may contain Evidence about professional events that occurred at other times.

Therefore:

```text
historical-source omission
≠ historical absence in the person
```

and:

```text
Professional Evolution
≠ Representation Evolution
```

Professional Evolution concerns supported changes in experience, responsibility, context and Knowledge. Representation Evolution concerns changes in how professional history was represented at different times.

Dated Representation snapshots remain compatible with future Knowledge Timeline / Professional Trajectory views, but those views require later validated semantics and are not prerequisites for the first end-to-end human test.

### Evidence convergence and professional episode identity

Source identity, Evidence identity and professional episode identity are distinct.

Several sources can describe the same underlying professional episode:

```text
CV
+ professional profile
+ interview
+ review
→ multiple Evidence items
→ possibly one professional episode
```

Such convergence may strengthen reconstruction of that episode, but repeated descriptions must not automatically count as independent professional episodes or independent experience.

Independence and convergence must therefore be evaluated relative to the underlying supported event/context when relevant. If episode identity cannot be established, uncertainty is preserved rather than forcing deduplication or independence.

This is a Product semantic requirement. It does not prescribe a new `episodeRef`, graph or temporal Core contract.

## Person and Target Representation separation

Person Representation and Target Representation are different semantic objects.

### Person side

Person Representation describes what authorised Evidence and reconstructed Knowledge support about the person in the current context/snapshot. It carries epistemic properties and limitations such as observability/coverage, confidence, Evidence quality, source reliability, independence/convergence and consistency where supported.

These properties remain distinct from measured strength. Context breadth and temporal breadth may become relevant to broader characterization, but no universal formula or mandatory scoring rule is authorized.

### Target side

Target Representation describes what an authorised target requires, expects or considers relevant. Depending on the target, a dimension may have a required/expected expression and an importance/relevance, without requiring a universal numeric scale.

Target importance is not epistemic confidence about the person.

### Comparison states

Target-relative interpretation preserves at least these conceptual outcomes:

```text
SUPPORTED ALIGNMENT
SUPPORTED / PLAUSIBLE DISTANCE
INSUFFICIENTLY OBSERVED FOR COMPARISON
SIGNIFICANT CONTRADICTORY EVIDENCE
```

The last state is available only when legitimate Evidence supports contradiction.

In particular:

```text
high target importance
+ insufficient Person Knowledge
→ priority candidate for further Evidence acquisition
```

not:

```text
high target importance
+ insufficient Person Knowledge
→ negative candidate score
```

The existing Coverage → Opportunity → Need → Strategy → Requirement → Design → Plan → Runtime → Evidence pipeline remains the canonical direction for additional acquisition. No parallel target-driven acquisition architecture is authorized.


## Observation catalogue

### OBS-001 — Professional presentation
**Observation:** Free presentation of the professional journey.
**Purpose:** Establish the initial professional image and narrative credibility.
**Visible:** No

### OBS-002 — Narrative structure
**Observation:** Order, prioritization and organization of the professional story.
**Purpose:** Observe how the candidate makes their experience understandable.
**Visible:** No

### OBS-003 — Initial response time
**Observation:** Time between question availability and response start.
**Purpose:** Contextual behavioural signal; never interpreted alone.
**Visible:** No

### OBS-004 — Response duration
**Observation:** Total response duration.
**Purpose:** Contextual behavioural signal; never interpreted alone.
**Visible:** No

### OBS-005 — Adaptive probing need
**Observation:** Additional probing required to reach target observability.
**Purpose:** Identify remaining evidence uncertainty.
**Visible:** No

### OBS-006 — Supporting material
**Observation:** CV and other authorised professional material.
**Purpose:** Increase Representation completeness and source diversity.
**Visible:** Partially

### OBS-007 — Ownership language
**Observation:** Explicit description of personal responsibility, decisions and contribution.
**Purpose:** Increase observability of accountability and role credibility.
**Visible:** Partially

### OBS-008 — Decision criteria
**Observation:** Explicit explanation of why a decision was made.
**Purpose:** Increase observability of judgement and reasoning.
**Visible:** Partially

### OBS-009 — Trade-off reasoning
**Observation:** Explicit recognition of alternatives, priorities or sacrifices.
**Purpose:** Increase observability of decision maturity.
**Visible:** Partially

### OBS-010 — Quantified outcomes
**Observation:** Measurable outcomes, scale or impact connected to the candidate's contribution.
**Purpose:** Strengthen evidential credibility.
**Visible:** Partially


## Professional semantic scope

A professional Observation describes what authorised Evidence supports about a professional event or relationship before any broader person characterization.

The minimum reusable semantic grammar is:

```text
Subject
→ Action / contribution
→ Object / domain
→ Professional relationship
→ Responsibility / accountability scope
→ Context
→ Outcome
→ Evidence provenance
```

The grammar is descriptive and sparse: only roles supported by Evidence are asserted. It is not a competency catalogue.

Professional relationship and responsibility are separate axes. A person may participate, collaborate, contribute or influence without owning, deciding or being accountable. Explicitly being outside a responsibility in one context is itself observed contextual information and is not a deficiency.

Domain exposure, collaboration and contribution do not establish specialist competence by proximity. Competence requires direct supporting Evidence; a stable or generalized person characterization additionally requires legitimate convergence beyond an isolated event.

An event-scoped Observation may enter elementary Knowledge as knowledge that the described event or relationship was observed. Broader statements about the person belong downstream to explicit derived semantics and Dynamic Characterization. Unknown or insufficiently observed remains distinct from absence.

`OBS-007` through `OBS-010` remain reusable source professional Observation types. They can supply supported semantic roles such as responsibility/contribution, decision criteria, trade-offs and outcomes; they do not themselves authorize a one-answer-to-one-competency mapping.

`decision_accountability` remains a bounded semantic measure for responsibility in decisions, authority, consequence scope and continuity. It may consume compatible decision-accountability observations, but it is not a generic proxy for contribution, budget ownership, domain competence or collaboration.

Observation truth is established independently of target relevance. Target interpretation occurs only after Representation semantics are established.


## Canonical semantic policy vertical slice — decision accountability

The first authorized production semantic policy is:

```text
professional_semantic_policy:decision_accountability:v1
```

### Semantic scope

`decision_accountability` is an elementary professional dimension whose meaning is:

> evidence-backed scope, explicitness and continuity of responsibility for decisions affecting collective outcomes.

It is intentionally narrower than generic ownership and must not be used as a proxy for contribution, collaboration, leadership, budget ownership or specialist competence.

### Evidence eligibility

Evidence is eligible for this policy only when an upstream acquisition definition explicitly associates the acquisition with this semantic policy and targets:

```text
knowledgeLayer: elementary
scope: dimension
scopeRef: decision_accountability
```

The explicit semantic-policy association is authoritative. Question wording, `questionKey`, question family, `expectedSignals`, target relevance, keywords, Answer Annotation, Professional Perception and capability names are context/provenance only and cannot independently activate this policy.

For Interview acquisition, a question may acquire evidence relevant to decision accountability only when the acquisition definition selected before execution carries the policy association. The association must remain traceable into the resulting Evidence.

### Context-scoped Observation semantics

Eligible Evidence may support context-scoped observations of:

- decision authority: none / recommendation / shared / final, when explicitly supported;
- consequence scope of the described decision;
- explicit accountability for the decision and its outcomes;
- continuity of the described decision responsibility;
- contextual limits or non-ownership.

Observation remains event/context scoped.

Mere participation, contribution, collaboration, proximity to a decision, or use of ownership-like language does not establish decision accountability.

Explicit contextual non-ownership is an observed boundary. It is not a deficiency and is not a contradicting contribution to the person's capability.

### Production interpretation ownership

For `professional_semantic_policy:decision_accountability:v1`, semantic interpretation of one eligible Evidence is deliberately narrower than the complete epistemic state consumed downstream.

| Information | Canonical producer / owner | Single Evidence sufficient? | Unknown behaviour |
| --- | --- | --- | --- |
| `decisionAuthority` | authorized decision-accountability Evidence interpreter | yes, only when semantically supported | insufficient authority semantics → no valid positive Observation; explicit contextual non-authority may be `none` |
| `consequenceScope` | authorized decision-accountability Evidence interpreter | yes, when decision/consequence scope is supported | ambiguous → unknown/no valid positive Observation; never promote to highest plausible scope |
| `accountabilityEvidence` | authorized decision-accountability Evidence interpreter | yes | may remain unknown under corrected contract |
| responsibility continuity | interpreter identifies supported temporal fact; deterministic temporal normalization derives exact months only when warranted | sometimes | unknown remains unknown; bounds/approximation remain represented |
| `context` | Evidence semantics plus deterministic source/runtime provenance where applicable | yes/provenance | sparse; unsupported context omitted |
| `evidenceIds` | deterministic Evidence lineage | yes | required supporting Evidence reference; never model-invented |
| evidence quality | separate Evidence/provenance assessment authority | not necessarily | not yet available/unknown |
| source convergence | cross-Evidence/source epistemic derivation | no | not yet determinable; PD-031 applies |
| consistency | cross-Evidence/Observation epistemic derivation over an explicit comparison set | no | not yet determinable |
| coverage | canonical Knowledge/acquisition coverage state | no | not yet determinable |
| `limitations` | interpreter for Evidence-local semantic limits plus deterministic/cross-Evidence producers for their own limits | yes in part | preserve explicit limitations; absence of a limitation is not proof of completeness |

Production classification criteria are semantic, not lexical. `recommendation` requires supported proposal/recommendation with final authority elsewhere; `shared` requires effective joint decision authority; `final` requires final authority for the represented decision. Consultation, influence or collaboration alone do not establish `shared`. `none` is a supported contextual boundary, not the fallback for missing Evidence.

`consequenceScope` describes the supported reach of the represented decision or its consequences: `individual_task`, `team`, `function`, `site`, or `organization`. Explicit scope or episode-supported consequences may establish a level. When consequences cross levels, use the broadest level actually supported by the described causal episode, not the broadest plausible organizational reach. Job title, seniority, company size, target role and generic leadership wording cannot establish scope.

`accountabilityEvidence` distinguishes evidential explicitness: `claimed` is an accountability assertion without a concrete described action/causal episode; `implicit` is accountability supported by the described role/action/consequence without an explicit accountability statement; `explicit` explicitly states responsibility/accountability for the decision or consequence; `explicit_with_outcomes` additionally connects that explicit accountability to an observable described outcome.

Responsibility continuity measures continuity of the described decision responsibility, not generic role tenure. Exact supported durations may normalize deterministically to months. Exact dates may be converted only when the Evidence establishes that responsibility spans that interval. Approximate, lower-bound, upper-bound or interval expressions preserve that qualification; repeated discontinuous episodes are not silently converted into continuous months. Unknown continuity never becomes zero.

The four inference-support concepts are not LLM confidence scores. Evidence quality depends on a separately authorized assessment of Evidence/provenance facts. Source convergence and consistency require explicit cross-Evidence comparison and cannot be manufactured from one Runtime answer. Coverage is owned by Knowledge/acquisition coverage state. Until those producers exist or run, their state is unknown/not-yet-derived.

### Minimum supported Observation rule

A positive Measurement-eligible decision-accountability Observation requires: eligible Evidence under the resolved policy; a concrete represented decision/context; supported decision responsibility with `decisionAuthority` of `recommendation`, `shared`, or `final`; supported `consequenceScope`; deterministic supporting `evidenceIds`; and no semantic contradiction that makes the interpretation invalid. Accountability explicitness and continuity need not be fabricated when unknown. Explicit contextual `decisionAuthority = none` may be retained as contextual knowledge, but it is not a negative Measurement/DimensionContribution. Insufficient Evidence produces no valid Observation and therefore no Measurement or Knowledge effect.

### Minimal specialized contract correction authorized

The current technical contract cannot remain unchanged because it forces missing continuity and all four inference-support inputs into numeric zero/default values. The minimum correction is to make responsibility continuity epistemically nullable/qualified (including exact versus bounded/approximate temporal support) and to make each inference-support input independently nullable/not-yet-derived with provenance of its canonical producer when present. The exact technical shape is an implementation concern, but it must distinguish at least `known`, `unknown`, `not_applicable`, and `not_yet_derived` where semantically relevant.

The specialized Measurement must likewise distinguish unknown from zero. It may score only known applicable strength components according to the existing versioned measurement semantics; it must not insert zero for an unknown component. If the minimum required strength semantics are unavailable, the result is insufficient/not-applicable and cannot produce a DimensionContribution. Inference support remains separate from measured strength and may remain unavailable or partial until its legitimate producers have supplied values. This correction does not authorize new coefficients, a new scoring framework, or model-generated numeric confidence.

### Characteristic and Measurement

The canonical characteristic is:

```text
decision_accountability
```

The canonical Measurement is the existing bounded `decision_accountability` semantic measure. Its purpose remains to estimate observed decision responsibility from decision authority, consequence scope, explicit accountability evidence and responsibility continuity while keeping inference support separate from measured strength.

The measure is applicable only to eligible decision-accountability observations. Evidence that describes contribution/collaboration without supported decision responsibility is outside this Measurement rather than negative evidence.

### Normalization policy

Normalization must:

- aggregate only eligible observations that share this semantic construct;
- preserve Evidence/Observation provenance and independence;
- preserve inference support separately from measured strength;
- return insufficient/not-applicable rather than manufacture a value when evidence is insufficient;
- never turn explicit contextual non-ownership into a negative person characteristic;
- never infer cross-context stability from a single event.

The existing versioned `decision_accountability` v1 measurement configuration may operationalize this policy. Its numeric weights, thresholds and benchmarks are versioned measurement configuration, not a redefinition of the Product semantic meaning.

### MeasurementDimensionMapping

The authorized elementary mapping is identity-preserving:

```text
Measurement: decision_accountability
→ Dimension: decision_accountability
```

Semantic relationship:

```text
measured decision accountability
→ supporting knowledge about the same decision_accountability construct
```

The mapping must use the existing direct/inherit mapping semantics without semantic attenuation, amplification or substitution. In implementation terms the effective mapping is one-to-one and neutral (`weight = 1`, `confidenceFactor = 1`) unless a later Product Architecture decision explicitly changes the semantic relationship.

A calculated applicable result may produce a supporting DimensionContribution. Ineligible, insufficient or contextual non-ownership evidence produces no contradicting contribution and does not imply absence.

### Epistemic boundary

A resulting elementary `decision_accountability` state means:

> current canonical evidence supports this degree/scope of decision accountability within the represented snapshot and its traceable contexts.

It does not mean:

> decision accountability is an intrinsic, universal or permanent trait of the person.

Any broader Dynamic Characterization requires explicit downstream derivation from sufficient converging observations and remains subject to PD-027.

### Acquisition association and resolution

The semantic policy is selected before evidence interpretation through an explicit acquisition-definition reference:

```text
semanticPolicyRef:
professional_semantic_policy:decision_accountability:v1
```

The preferred authority anchor is the Knowledge Acquisition Design / equivalent acquisition definition because that boundary already owns target knowledge and causal acquisition intent. Capability Configuration and Plan may carry the selected reference downstream, but capability identity does not create semantic meaning.

The resulting Evidence provenance must make the upstream acquisition/policy association reconstructable. AR-02B may resolve this already-authorized policy only from those canonical references; it must return no applicable authority when they are absent.


## Professional Perception
Professional Perception interprets how the candidate currently emerges from available evidence. It never claims to describe the person's intrinsic value.

Its canonical high-level outputs are:
- who emerges;
- credibility assets;
- target distance or professional directions;
- likely recruiter memory;
- blind spots in self-presentation;
- recommended attitude or positioning shift.

The strongest output should move from isolated skills toward professional meaning: not merely "has X", but "this path and these observations make Y credible".

## Context and perspective
Questioning and interpretation may depend on:
- target role;
- seniority;
- organization context;
- interview purpose;
- interviewer style.

Perspective changes what is relevant and how evidence is interpreted. It does not rewrite the underlying evidence or knowledge.

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

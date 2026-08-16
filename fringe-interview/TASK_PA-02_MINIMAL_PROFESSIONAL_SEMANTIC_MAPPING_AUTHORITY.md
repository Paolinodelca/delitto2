# TASK PA-02 — Minimal Professional Semantic Mapping Authority

## 1. Executive semantic verdict

**B — MINIMAL SEMANTIC AUTHORITY ADDED**

The repository already contained the complete generic technical path from registered Evidence through Observation, MeasurementResult, DimensionContribution, KnowledgeLedger/Snapshot, PersonKnowledgeMatrix and KnowledgeCoverage. It also contained useful professional Product Authority (`OBS-007…OBS-010`) and the bounded `decision_accountability` measure.

What it did not contain was sufficient canonical authority for the semantic scope of a professional statement derived from one event: specifically, how to preserve contribution separately from accountability, collaboration separately from competence, explicit contextual non-ownership as positive contextual knowledge, and event Observation separately from generalized person characterization.

PA-02 adds four minimal Product Decisions, `PD-024…PD-027`, and a corresponding explanatory section in `REPRESENTATION_MODEL.md`. It does not create a competency catalogue, JavaScript schema or production behavior.

AR-02A can now be reopened.

## 2. Existing authority inventory

Existing Product Authority already establishes:

- Representation first (`PD-003`);
- adaptive evidence acquisition and minimum intrusiveness (`PD-005`, `PD-006`);
- role-aware acquisition while preserving evidence semantics (`PD-007`);
- target-relative interpretation (`PD-016`);
- Representation Value Proof with insufficient observation distinct from weakness (`PD-021`);
- Dynamic Characterization as a derived view rather than a new persistent object (`PD-022`);
- Representation↔Target comparison as non-score-first (`PD-023`);
- the professional Observation catalogue including:
  - `OBS-007 — Ownership language`;
  - `OBS-008 — Decision criteria`;
  - `OBS-009 — Trade-off reasoning`;
  - `OBS-010 — Quantified outcomes`.

Core already establishes:

- atomic canonical Evidence and Observation;
- explicit Measurement targets and construction rules;
- MeasurementResult normalization;
- declarative Measurement→Dimension mappings;
- DimensionContribution;
- elementary and derived Knowledge;
- PersonKnowledgeMatrix and KnowledgeCoverage;
- `decision_accountability` as a bounded measure of decision authority, consequence scope, accountability evidence and continuity.

The generic technical contracts are therefore not the semantic gap.

## 3. Exact semantic gap

Before PA-02, Product Authority did not state with sufficient precision whether one professional event may become elementary Knowledge without becoming a stable trait, nor how to encode the meaning of a person's relationship to a domain separately from responsibility/accountability.

That ambiguity caused the AR-02A stop.

The missing authority was not a list of professional competencies. It was a small grammar and epistemic boundary for statements such as:

- contributed to economic evaluation, but did not own the budget;
- collaborated with Software, but did not own Software Engineering;
- coordinated several functions in one project, without that single event proving a generalized stakeholder-management competence.

## 4. Minimal semantic model / grammar

PA-02 authorizes this conceptual grammar:

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

These are semantic roles, not required implementation field names.

The grammar is sparse. A role is populated only when authorised Evidence supports it.

It is descriptive before it is evaluative.

The central design is two independent axes:

```text
RELATIONSHIP TO ACTIVITY / DOMAIN
participation / exposure / collaboration / contribution / influence / demonstrated capability

RESPONSIBILITY FOR ACTIVITY / DOMAIN
outside described responsibility / shared or bounded responsibility / decision authority / ownership / accountability
```

PA-02 deliberately does not require six or more hardcoded enums. The implementation task must choose the smallest existing-compatible representation that preserves these meanings.

## 5. Minimum canonical relationships required

### Professional relationship

Describes how the subject was related to an activity/domain in the evidenced context.

It can support meanings such as participation, collaboration, contribution or influence without implying ownership.

### Responsibility/accountability scope

Describes whether and how the subject held responsibility, authority, ownership or accountability in the evidenced context.

It is semantically independent from professional relationship.

### Contextual boundary

An explicit statement that responsibility/accountability was outside the subject's scope in the described context.

It is positive knowledge about role boundaries.

### Demonstrated capability

A stronger meaning than exposure/collaboration. It requires Evidence that directly demonstrates the relevant capability. A generalized characterization requires convergence beyond one isolated event.

No general competency catalogue is introduced.

## 6. Epistemic states and meaning

### Observed

Directly supported by authorised Evidence within the Evidence's supported semantic and contextual scope.

Example:

> collaboration with Software observed in this integration context.

### Inferred / derived

Supported by an explicit legitimate relationship among multiple observations, with lineage and derivation semantics preserved.

Example:

> repeated independent observations across contexts support an emerging cross-functional coordination characterization.

### Insufficiently observed

Available Evidence does not justify the proposed characterization.

It does not mean absent, weak or incapable.

### Contextually outside responsibility

This is an observed semantic fact, not an epistemic absence state.

Example:

> budget accountability explicitly outside described responsibility in this project.

## 7. Event Observation → person Characterization boundary

An event Observation answers:

> What did the Evidence support in this event/context?

A person characterization answers a broader question:

> What pattern about the person is justified by the available body of Evidence?

The first may enter elementary Knowledge.

The second requires explicit derivation and sufficient convergence.

Therefore:

```text
one answer
→ one or more context-scoped Observations
≠
one stable person trait
```

A single credible episode can establish that a professional relationship/action occurred. It cannot automatically establish a stable generalized competence.

This is the semantic foundation required by `PD-022 — Dynamic Characterization first`.

## 8. Contribution → accountability boundary

Contribution and accountability are independent.

The statement:

> I contributed to the economic evaluation.

may establish economic/cost contribution.

It does not establish:

- budget ownership;
- P&L accountability;
- formal resource-allocation authority.

Likewise, influence may be observed without decision authority.

PA-02 does not require contribution to be numerically "below" accountability. They are different meanings, not levels on one mandatory scale.

## 9. Collaboration → competence boundary

The statement:

> I worked with the Software team.

may establish:

- Software domain exposure;
- collaboration with Software;
- possibly contribution in a systems/integration context if the Evidence supports it.

It does not establish:

- Software Engineering ownership;
- specialist Software Engineering competence.

Competence requires direct Evidence of demonstrated capability.

Question intent, lexical matching and target relevance cannot supply the missing Evidence.

## 10. Contextual non-ownership semantics

The statement:

> Budget ownership was the Program Manager's responsibility, not mine.

is positive information.

The authorized semantic statement is:

> budget accountability explicitly outside the person's described responsibility in this context.

It is not:

- missing evidence;
- a contradicting person characteristic;
- inability;
- a negative score;
- evidence that the person could never own a budget in another role.

This contextual boundary may coexist with positive cost/economic contribution in the same event.

## 11. Evidence convergence semantics

Convergence may justify broader Dynamic Characterization only when the observations are sufficiently coherent and appropriately independent/diverse for the proposed scope.

Convergence is not simple repetition count.

Relevant considerations already present in IMAGO principles include:

- Evidence provenance;
- source independence;
- context diversity;
- consistency/contradiction;
- confidence and quality;
- coverage.

One episode establishes only its supported event scope.

Several coherent independent episodes across relevant contexts may support a broader derived characterization.

Contradictory/context-dependent evidence remains visible.

PA-02 does not define numeric thresholds; that belongs to explicit downstream derivation policy.

## 12. Relationship with OBS-007…OBS-010

`OBS-007…OBS-010` remain unchanged.

They are reusable source professional Observation types and examples of the broader grammar:

- `OBS-007` supplies responsibility, decision and contribution semantics;
- `OBS-008` supplies decision-reason semantics;
- `OBS-009` supplies alternatives/priorities/trade-off semantics;
- `OBS-010` supplies outcome/scale semantics.

They do not themselves define stable competencies.

One Evidence item may support multiple authorized observations when their meanings are independently supported and lineage remains exact.

## 13. Relationship with decision_accountability

`decision_accountability` remains valid and reusable inside its existing scope:

- decision authority;
- consequence scope;
- explicit accountability evidence;
- continuity of responsibility.

PA-02 does not generalize it into a universal responsibility model.

It must not be used as a proxy for:

- budget ownership;
- economic contribution;
- stakeholder management;
- domain competence;
- collaboration.

Where Evidence genuinely concerns decision accountability, the existing measure may consume compatible observations.

Where a different semantic meaning is required, AR-02A must use the new general authority without stretching `decision_accountability`.

## 14. Relationship with elementary / derived Knowledge

Existing Knowledge Core is structurally sufficient to preserve the required architectural separation, provided AR-02A maps semantics correctly.

Elementary Knowledge may mean:

> we know that this professional event/relationship was observed in this context.

It need not mean:

> we know that the person has this stable trait.

Derived Knowledge is the appropriate existing layer for legitimate composition/derivation across elementary states.

PA-02 therefore requires no new Knowledge Core contract.

However, the current generic dimension machinery is value/dimension-oriented. AR-02A must prove that an explicit mapping policy can preserve relationship, responsibility scope and context through existing Observation/Measurement/Dimension provenance/extensions without semantic loss. If a concrete implementation cannot do so, it must stop and report the exact contract limitation rather than flatten the meaning.

## 15. Relationship with Dynamic Characterization

Dynamic Characterization consumes patterns of canonical Knowledge.

It may describe what emerges from several observations without becoming a new persistent characterization object, consistent with PD-022.

Its language should remain scope-aware:

> repeated evidence supports an emerging pattern of cross-functional coordination across product-development contexts.

rather than:

> stakeholder-management competence = 82%.

PA-02 does not implement Dynamic Characterization.

## 16. Relationship with Representation

The canonical direction is:

```text
Evidence
→ Observation
→ elementary Knowledge
→ convergence / derived Knowledge
→ Dynamic Characterization
→ Representation
```

Representation emerges from patterns.

No one-to-one:

```text
answer → competency label
```

is authorized.

## 17. Relationship with Target comparison

Observation truth is target-independent.

First IMAGO determines what was observed about the person/context.

Only downstream does it determine how the resulting Representation relates to the Target Representation.

A target asking for budget ownership cannot turn cost contribution into budget ownership merely because budget ownership is relevant.

This is consistent with PD-023.

## 18. Stakeholder case validation

### One episode

Evidence:

> I aligned Mechanical, Software, Validation, Manufacturing and Purchasing around conflicting priorities without hierarchical authority.

Authorized context-scoped meanings may include:

- cross-functional coordination/alignment contribution observed;
- influence without hierarchical authority observed;
- trade-off reasoning observed if alternatives/priorities were explicit;
- contribution/responsibility scope observed where supported.

Not authorized solely from this episode:

- stable stakeholder-management competence established;
- leadership trait established;
- generalized organizational influence established.

### Several converging episodes

If several independent coherent episodes across relevant contexts show similar coordination/influence patterns, an explicit derived rule may support a broader Dynamic Characterization such as:

> available evidence consistently supports cross-functional coordination across multiple professional contexts.

The exact generalization remains bounded by Evidence diversity and derivation policy.

## 19. Budget case validation

All of the following can coexist:

- cost-reduction contribution observed;
- economic-evaluation contribution observed;
- cost/time/technical trade-off reasoning observed;
- budget ownership explicitly outside described responsibility;
- P&L accountability explicitly outside described responsibility;
- formal resource-allocation authority explicitly outside described responsibility.

IMAGO may not conclude from these facts alone:

- budget accountability observed;
- budget-management competence established;
- candidate lacks budget capability.

There is no contradiction because contribution and accountability are separate semantic axes.

## 20. Software case validation

Evidence of cross-functional work with Software may establish:

- Software context exposure;
- collaboration with Software;
- systems/integration contribution involving Software, if directly supported.

It does not establish:

- Software Engineering ownership;
- specialist Software Engineering competence.

The new authority prevents the unsupported inference by making professional relationship and demonstrated competence distinct semantics and by explicitly forbidding lexical/contextual proximity as a substitute for Evidence.

## 21. What an LLM may extract

A future LLM-based semantic extractor may identify only relationships authorized by Product Authority and only when supported by the supplied Evidence.

It may propose structured, context-scoped semantics such as:

- subject/action;
- contribution;
- object/domain;
- collaboration/influence relationship;
- explicit responsibility/accountability scope;
- explicit contextual non-ownership;
- decision criteria/trade-offs;
- outcome/scale;
- Evidence-supported context.

Its output must preserve Evidence provenance and remain subject to deterministic schema/contract validation.

The LLM is an extractor against authority, not the authority.

## 22. What an LLM must never infer without sufficient Evidence

It must not infer solely from wording, question intent, target relevance or contextual proximity:

- stable competency;
- ownership;
- accountability;
- decision authority;
- specialist domain competence;
- absence or inability from non-observation;
- generalized deficiency from contextual non-ownership;
- stable person trait from one episode.

It must not silently broaden the scope of a statement beyond the Evidence-supported context.

## 23. Minimum authority changes required

PA-02 adds exactly four canonical Product Decisions:

- `PD-024 — Context-scoped professional relationship observation`;
- `PD-025 — Professional relationship and responsibility are not interchangeable`;
- `PD-026 — Domain proximity is not competence`;
- `PD-027 — Observation-to-characterization epistemic boundary`.

`docs/20-product/REPRESENTATION_MODEL.md` receives the corresponding explanatory semantic grammar.

No existing Product Decision or Observation is redefined.

No production contract is changed.

## 24. Exact implementation guidance for reopening AR-02A

**AR-02A may now be reopened.**

It must consume `PD-024…PD-027`, the new `Professional semantic scope` section of `REPRESENTATION_MODEL.md`, and existing `OBS-007…OBS-010`.

The implementation should:

1. start from AR-02 canonical accepted Runtime-answer Evidence;
2. use explicit semantic extraction/mapping policy constrained to the authorized grammar;
3. preserve question intent only as acquisition context, never as observed fact;
4. create context-scoped Observation semantics before any person characterization;
5. preserve professional relationship separately from responsibility/accountability scope;
6. preserve explicit contextual non-ownership as positive contextual information;
7. prevent domain collaboration/exposure from becoming competence;
8. reuse `decision_accountability` only when the Evidence genuinely satisfies its bounded semantics;
9. normalize/map only through existing explicit Measurement and Mapping policy;
10. reach DimensionContribution → KnowledgeLedger/Snapshot → PersonKnowledgeMatrix → KnowledgeCoverage without direct writes;
11. prove the three required cases deterministically;
12. stop again if existing generic Core contracts cannot preserve the authorized semantic scope without flattening it.

AR-02A should not create a broad competency catalogue. Any concrete dimension identifiers required for the implementation must be the minimum policy vocabulary needed to preserve the authorized semantic roles, not a taxonomy of professions.

AR-03 remains unauthorized until reopened AR-02A demonstrates a real Interview Evidence item reaching canonical Knowledge/PKM/Coverage.

AR-04 remains unauthorized.

## Decision test

### A

"I coordinated Mechanical and Software in one project."

**CAN:** cross-functional coordination contribution observed in this project.

**MUST NOT automatically:** stakeholder-management competence established.

PASS under PD-024, PD-026 and PD-027.

### B

"I contributed to a €500k cost-reduction initiative."

**CAN:** economic/cost contribution observed.

**MUST NOT automatically:** budget accountability observed.

PASS under PD-024 and PD-025.

### C

"I did not own the budget; the Program Manager did."

**CAN:** budget accountability explicitly outside described responsibility.

**MUST NOT:** candidate lacks budget capability.

PASS under PD-025 and PD-027.

### D

"I worked closely with Software."

**CAN:** collaboration/exposure to Software observed.

**MUST NOT automatically:** Software Engineering competence observed.

PASS under PD-026.

### E

Several independent coherent observations **MAY** support a broader Dynamic Characterization.

One isolated Observation does not automatically become a stable person trait.

PASS under PD-027.

## Files changed

- `docs/20-product/PRODUCT_DECISIONS.md`
- `docs/20-product/REPRESENTATION_MODEL.md`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_PA-02_MINIMAL_PROFESSIONAL_SEMANTIC_MAPPING_AUTHORITY.md`
- `TASK_PA-02_MANIFEST.txt`

No production code, Runtime, Evidence Store, Observation Core, Measurement Core, Knowledge Core, PKM, Coverage, Professional Perception, Representation Value Proof, UI, question bank or prompt is modified.

## Final verdict

**B — MINIMAL SEMANTIC AUTHORITY ADDED**

AR-02A can now be reopened against the explicit semantic authority in `PD-024…PD-027`.

Do not start AR-03 or AR-04.

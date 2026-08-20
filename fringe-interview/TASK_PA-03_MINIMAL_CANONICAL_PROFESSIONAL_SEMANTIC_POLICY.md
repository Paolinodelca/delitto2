# TASK PA-03 — Minimal Canonical Professional Semantic Policy Vertical Slice

## Executive verdict

**A — COMPLETE MINIMAL SEMANTIC POLICY AUTHORIZED**

PA-03 authorizes one and only one first production professional semantic policy:

```text
professional_semantic_policy:decision_accountability:v1
```

The policy does not create a competence catalogue and does not map `decision_accountability` to the historical/interview concept `ownership`.

The canonical elementary target dimension is instead:

```text
decision_accountability
```

This is justified repository-first because the existing dedicated measure already defines `decision_accountability` as an autonomous construct: observed scope, explicitness and continuity of responsibility for decisions affecting collective outcomes. Its existing measure definition already uses `dimensionId: "decision_accountability"`.

Product Authority is updated to make that semantic identity explicit and to define the acquisition/context association required for future AR-02B resolution.

No production code, Core contract, resolver, Runtime, Groq, Answer Annotation, Professional Perception or question-bank behavior is implemented in PA-03.

---

## 1. Semantic gap inherited from AR-02B

AR-02A proved the canonical technical path:

```text
accepted Runtime answer
→ canonical Evidence
→ Observation
→ Measurement
→ DimensionContribution
→ KnowledgeLedger / KnowledgeSnapshot
→ PersonKnowledgeMatrix
→ KnowledgeCoverage
```

but requires an explicit bundle:

- Measurement;
- ObservationConstruction;
- characteristicId;
- normalization;
- MeasurementDimensionMapping.

The post-AR-02A architecture review identified the missing Application responsibility:

```text
canonical Evidence
+ authorized acquisition/context refs
→ resolve existing semantic authority
→ AR-02A
```

AR-02B correctly stopped because the repository did not yet contain one complete production semantic policy, in particular an authorized canonical MeasurementDimensionMapping.

PA-03 closes the **Product Architecture** part of that gap for one semantic vertical only.

---

## 2. decision_accountability inventory

The repository contains real, non-fixture foundations for `decision_accountability`:

### Dedicated Observation semantics

`src/core/measurement/decisionAccountability/buildDecisionAccountabilityObservation.js`

Existing semantic fields include:

- `decisionAuthority`: none / recommendation / shared / final;
- `consequenceScope`: individual_task / team / function / site / organization;
- `accountabilityEvidence`: claimed / implicit / explicit / explicit_with_outcomes;
- `responsibilityContinuityMonths`;
- context;
- Evidence IDs;
- inference-support inputs;
- limitations.

### Dedicated Measurement definition

`src/core/measurement/decisionAccountability/buildDecisionAccountabilityMeasureDefinition.js`

The existing definition states:

> Measures the observed scope, explicitness and continuity of responsibility for decisions affecting collective outcomes.

It uses:

```text
dimensionId: decision_accountability
```

and the input signals:

- decision authority;
- consequence scope;
- accountability evidence;
- responsibility continuity.

Its provenance was previously marked `hypothesis`, which is appropriate for the versioned numeric configuration; PA-03 canonizes the **semantic meaning**, not every numeric coefficient as immutable Product truth.

### Dedicated MeasureResult

The repository already calculates a decision-accountability result while keeping inference support separate from the measured score.

### Measurement → Capability bridge

The existing bridge can project an already-established decision-accountability measure into capability semantics such as leadership.

That bridge is downstream and is not reused as the elementary MeasurementDimensionMapping.

### Generic canonical dimension pipeline

The repository already contains:

- `MeasurementDimensionMapping`;
- Mapping Applicability;
- `DimensionContribution`;
- Ledger;
- Snapshot;
- elementary DimensionKnowledgeState;
- PKM;
- Coverage.

What was missing was Product authorization for the elementary dimension relation.

---

## 3. Existing Product semantic authority

PA-02 already established:

### PD-024
Context-scoped professional relationship Observation.

### PD-025
Professional relationship and responsibility/accountability are not interchangeable.

### PD-026
Domain proximity is not competence.

### PD-027
Observation-to-characterization epistemic boundary.

`REPRESENTATION_MODEL.md` additionally states that `decision_accountability` is a bounded semantic measure for responsibility in decisions, authority, consequence scope and continuity, and that it is not a generic proxy for contribution, budget ownership, domain competence or collaboration.

Therefore PA-03 does not need to invent the meaning of decision accountability. It needs to close the remaining semantic-policy relationship to elementary Knowledge.

---

## 4. Characteristic semantics

The canonical characteristic for this first vertical is:

```text
decision_accountability
```

Meaning:

> evidence-backed responsibility/accountability for decisions affecting collective outcomes, scoped to the evidenced professional context.

It is not:

- generic personal ownership;
- participation;
- contribution;
- collaboration;
- leadership;
- budget ownership;
- domain competence.

The characteristic is intentionally the same semantic construct measured by the existing decision-accountability Measurement.

No new characteristic vocabulary is introduced.

---

## 5. Measurement semantics

The canonical Measurement is the existing bounded:

```text
decision_accountability
```

semantic measure.

Its Product meaning is:

> estimate the observed scope, explicitness and continuity of responsibility for decisions affecting collective outcomes.

Semantically relevant components remain:

- decision authority;
- consequence scope;
- explicit accountability evidence;
- responsibility continuity.

Inference support remains separate from measured strength.

The existing versioned v1 weights, thresholds and benchmark may operationalize the measure. Those numeric values are versioned Measurement configuration rather than a Product claim that the coefficients are universally optimal.

This distinction is important: PA-03 canonizes **what is measured**, not psychometric validity beyond what the repository actually supports.

---

## 6. Observation semantics

Decision-accountability Observation is always:

**event/context scoped.**

Eligible Evidence may support observations of:

- recommendation/shared/final decision authority;
- consequence scope;
- explicit responsibility/accountability for decision outcomes;
- continuity of responsibility;
- contextual responsibility boundaries.

### What does not establish decision accountability

By itself, none of the following is sufficient:

- participation;
- contribution;
- collaboration;
- proximity to a decision;
- generic “ownership” wording;
- expectedSignal;
- questionKey;
- question family;
- target relevance;
- capability name.

### Contextual non-ownership

An explicit statement such as:

> “The Program Manager owned the budget; I contributed to the economic evaluation.”

may establish:

- economic contribution in that context;
- explicit contextual non-ownership of budget accountability.

It does **not** become:

- contradicting decision-accountability contribution;
- deficiency;
- inability;
- global absence of accountability capability.

For the `decision_accountability` measurement path, evidence that only establishes contribution/non-ownership is ineligible rather than negative.

---

## 7. Normalization decision

The semantic normalization policy is:

1. normalize only observations eligible for the same `decision_accountability` construct;
2. preserve source/Evidence provenance;
3. preserve observation independence;
4. keep inference support separate from measured strength;
5. return insufficient/not-applicable when the available evidence does not justify a calculated state;
6. never turn contextual non-ownership into negative person knowledge;
7. never infer cross-context stability from a single episode.

The existing versioned decision-accountability v1 Measurement configuration may operationalize this policy.

PA-03 does not create a second numerical normalization model.

---

## 8. Dimension analysis

### Historical `ownership`

The repository contains multiple uses of `ownership`, particularly in:

- historical Interview/Answer Annotation logic;
- Role Credibility Map signals;
- fixtures/tests;
- health checks.

Its meaning is broader and often refers to:

> clarity of personal contribution / what depended directly on the candidate.

That is **not identical** to decision accountability.

Mapping `decision_accountability → ownership` would collapse distinctions explicitly protected by PA-02.

Therefore:

**`ownership` is rejected as the canonical elementary target dimension for this policy.**

### `decision_accountability`

The construct has:

- an autonomous professional meaning;
- dedicated Observation semantics;
- dedicated Measurement semantics;
- existing `dimensionId: "decision_accountability"` in the Measurement definition;
- a stable meaning independent from one question type;
- relevance beyond a single target role;
- non-duplication with generic contribution/collaboration/competence concepts.

PA-03 therefore canonizes:

```text
dimensionId = decision_accountability
dimensionType = elementary
```

The dimension's **meaning** is stable; the person's current **state** on that dimension is evidence-dependent, contextual and revisable.

That distinction preserves PA-02.

---

## 9. MeasurementDimensionMapping decision

The authorized elementary mapping is:

```text
Measurement: decision_accountability
→ Dimension: decision_accountability
```

This is a semantic identity mapping.

It does not translate one construct into another.

Therefore the relationship must not attenuate, amplify or reinterpret the measured construct.

For implementation with the existing direct/inherit mapper, the authorized neutral relationship is:

```text
contributionType: supporting
weight: 1
confidenceFactor: 1
```

for calculated/applicable positive evidence-supported results.

This is Product semantic authority for the relationship, not an implementation of the mapping object.

### No negative shortcut

The policy does not authorize:

```text
contextual non-ownership
→ contradicting decision_accountability contribution
```

Nor:

```text
not observed
→ negative decision accountability
```

Ineligible/insufficient evidence produces no contribution and does not imply absence.

Mapping Applicability remains the existing Core gate and must be evaluated at the correct downstream point.

---

## 10. Acquisition/context association

AR-02B must not infer policy applicability downstream from text.

PA-03 authorizes an explicit upstream association:

```text
semanticPolicyRef:
professional_semantic_policy:decision_accountability:v1
```

### Authority anchor

The preferred authority anchor is:

**Knowledge Acquisition Design / equivalent acquisition definition**

because this boundary already owns:

- target knowledge;
- causal acquisition intent;
- source traceability.

For this semantic policy the acquisition target must be equivalent to:

```text
knowledgeLayer: elementary
scope: dimension
scopeRef: decision_accountability
semanticPolicyRef:
  professional_semantic_policy:decision_accountability:v1
```

Capability Configuration and Plan may carry the selected policy reference downstream but do not create its meaning.

### Interview acquisition

For Interview-based acquisition, the acquisition definition chosen before execution must explicitly reference the same policy.

The following are insufficient by themselves:

- questionKey;
- family;
- expectedSignals;
- question wording;
- targetRole;
- capability name.

The selected policy reference must remain reconstructable in Evidence acquisition provenance.

This creates the canonical basis AR-02B needs to resolve rather than infer semantic authority.

---

## 11. Epistemic guardrails

The following remain mandatory:

### Event Evidence ≠ stable person characteristic

One decision episode may establish elementary Knowledge about observed decision accountability in that context.

It does not prove an intrinsic permanent characteristic.

### Contribution ≠ accountability

Helping, contributing or influencing does not automatically establish decision authority/accountability.

### Collaboration ≠ competence

No domain competence may be inferred from cross-functional exposure.

### Non-ownership ≠ deficiency

Contextual responsibility boundaries are positive contextual knowledge and are not negative scoring.

### Observed ≠ inferred ≠ insufficiently observed

The states remain distinct.

### Target relevance does not create truth

A target role requiring decision accountability does not make an answer evidence of decision accountability.

### No downstream semantic shortcuts

Not authorized:

- keyword → characteristic;
- question → dimension;
- expectedSignal → observed truth;
- LLM annotation → Knowledge;
- Professional Perception → Knowledge;
- answer → PKM;
- answer → Coverage;
- capability name → measurement meaning.

---

## 12. Product Authority changes

**Yes.**

Only the necessary Product Authority was modified.

### PRODUCT_DECISIONS.md

Added:

- **PD-028 — Decision accountability is a canonical elementary professional dimension**
- **PD-029 — Decision accountability semantic policy and explicit acquisition association**

### REPRESENTATION_MODEL.md

Added:

- **Canonical semantic policy vertical slice — decision accountability**

No existing PA-02 decision was weakened or replaced.

---

## 13. Exact authority created

PA-03 creates exactly one production semantic policy authority:

```text
semanticPolicyRef:
professional_semantic_policy:decision_accountability:v1

target knowledge:
elementary dimension decision_accountability

characteristic:
decision_accountability

Measurement:
decision_accountability

Observation semantics:
context-scoped decision authority /
consequence scope /
explicit accountability evidence /
responsibility continuity

normalization:
existing bounded decision-accountability semantics,
with inference support separate and insufficient evidence preserved

MeasurementDimensionMapping:
decision_accountability
→ decision_accountability
identity-preserving, direct/inherit, neutral 1:1

acquisition association:
explicit upstream semanticPolicyRef attached to
Knowledge Acquisition Design / equivalent acquisition definition
and preserved through Evidence provenance
```

No second semantic policy is authorized.

---

## 14. Readiness to reopen AR-02B

**YES — AR-02B may now be reopened.**

The Product-semantic stop condition identified previously is closed for one vertical path.

AR-02B may now implement only the resolver/orchestration needed to:

```text
canonical Evidence
+ explicit acquisition/context refs
→ resolve
  professional_semantic_policy:decision_accountability:v1
→ existing authority bundle
→ AR-02A
```

AR-02B must still stop rather than infer if the explicit policy/acquisition association is absent.

### Important implementation note

The repository contains both the dedicated decision-accountability Measurement family and the generic AR-02A Observation/MeasurementResult/Dimension pipeline. PA-03 authorizes their shared semantic construct and the elementary identity mapping; it does **not** authorize AR-02B to bypass existing canonical contracts or silently coerce incompatible object shapes.

If implementation requires an adapter/representation step to express the already-authorized semantic policy using AR-02A's existing contracts, that step must preserve the policy exactly and must not create new Product meaning.

---

## Verification performed

No production code was changed.

Existing relevant regressions were run and remain green:

- Decision Accountability Observation — PASS
- Decision Accountability Measure Result — PASS
- Decision Accountability → Leadership Capability contribution — PASS
- Measurement Result Mapping Applicability — PASS
- MeasurementDimensionMapping construction — PASS
- AR-02A Runtime Answer → Knowledge vertical slice — PASS
- `fringe_health_check.js` — **All health checks passed.**

These tests verify baseline compatibility only; PA-03 itself is Product Architecture, not implementation.

---

## Final decision

**A — COMPLETE MINIMAL SEMANTIC POLICY AUTHORIZED**

The first canonical production vertical is:

```text
professional_semantic_policy:decision_accountability:v1
```

with elementary target dimension:

```text
decision_accountability
```

and an explicit upstream acquisition association.

No code, resolver, Runtime, Groq, Answer Annotation, Professional Perception, AR-03 or AR-04 implementation was performed.

No commit or push was executed.

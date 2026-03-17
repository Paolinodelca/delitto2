# Question Selection Strategy — Fringe Interview

## Purpose

This document defines the first strategic logic for selecting question families inside the FRINGE Interview engine.

The goal is to explain how the engine should move from:

- raw role-fit analysis only

toward:

- context-aware, tone-aware, perception-aware question selection

This strategy is not yet runtime code.
It is the design layer that should later guide implementation.

---

## Core principle

The engine should no longer select questions only because they exist in a general pool.

It should select them because they serve a specific interview purpose.

Question selection should increasingly combine five inputs:

1. role-fit priorities
2. detected or inferred seniority context
3. inferred company context
4. active or default interview tone
5. person-perception objectives

The result should be:
- a smaller but more meaningful question set
- better realism
- less redundancy
- stronger coherence between interview context and final coaching

---

## Main selection inputs

### 1. Role-fit priorities

These come from parser and job-fit analysis.

Examples:
- transferability gap
- ambiguous ownership
- weak tool match
- unclear stakeholder exposure
- promising analytical depth
- seniority mismatch risk

These should remain the strongest base driver of the interview.

---

### 2. Seniority context

This influences:
- what depth is expected
- how much ownership must be visible
- whether potential matters more than proven scale
- how much strategic reasoning is expected

Examples:
- junior context:
  - allow smaller examples
  - prioritize learning signals
  - do not over-demand strategic breadth
- senior context:
  - require stronger accountability
  - require clearer decision scope
  - test judgment more explicitly

---

### 3. Company context

This influences:
- what type of examples feel credible
- which interpersonal signals matter more
- how much process vs pragmatism matters
- which styles of communication are rewarded

Examples:
- corporate_structured:
  - prioritize clarity, stakeholder alignment, process comfort
- startup_pragmatic:
  - prioritize initiative, execution, adaptability
- consultancy_client_facing:
  - prioritize composure, synthesis, client-facing maturity

---

### 4. Interview tone

Tone does not change the strategic purpose of the question.
It changes how the question is phrased and how sharply follow-ups are delivered.

Examples:
- supportive tone:
  - invite narrative
  - reduce pressure
  - help early-stage candidates open up
- pressure tone:
  - ask for defense of claims
  - test composure
  - reduce tolerance for vagueness

---

### 5. Person-perception objectives

These are not personality labels.
They are signals the engine wants to surface more clearly.

Examples:
- curiosity
- initiative
- collaboration
- discipline
- resilience
- calm under pressure
- execution focus

This should influence selection especially when:
- the role is junior or first-job oriented
- the company context suggests team-fit importance
- the role requires strong soft-signal screening
- the interview tone is HR-relational or pressure-oriented

---

## Selection layers

The selection strategy should work in layers.

### Layer A — mandatory role-fit layer

These are the question families that must be represented because they directly relate to:

- top fit priorities
- major risks
- ambiguities
- transferable strengths needing validation

This layer ensures the interview remains relevant to the target role.

This is the non-negotiable foundation.

---

### Layer B — seniority calibration layer

After role-fit priorities, the engine should ensure that the interview contains at least some calibration of expected seniority.

Examples:
- junior:
  - learning orientation
  - initiative in limited scope
- mid:
  - ownership and independent execution
- senior:
  - decision-making and ambiguity management
- lead / executive:
  - influence, strategic trade-offs, large accountability

This layer prevents the interview from validating fit only superficially.

---

### Layer C — person-perception layer

The engine should then add selected questions that help surface the likely impression a recruiter may form.

This is especially relevant when:
- the candidate is junior
- the role requires team compatibility signals
- the company context is culture-sensitive
- the interview includes HR-relational or supportive tone
- there is little formal experience and narrative signals matter more

Important:
this layer should remain controlled.
It should enrich the interview, not replace role-fit logic.

---

### Layer D — tone delivery layer

This layer does not change the strategic family selected.
It changes the delivery form.

For example:
- same underlying family: initiative_examples
- different delivery:
  - supportive version
  - standard version
  - pressure version
  - business_direct version

This allows realistic training without multiplying completely unrelated question logic.

---

## First question set composition rule

A future short interview should likely remain compact.

For example, a 5-question flow might follow this logic:

1. opening / framing
2. primary role-fit validation
3. secondary role-fit or seniority calibration
4. adaptive or person-perception question
5. closing / synthesis

This keeps the interview short while increasing contextual realism.

A longer interview could increase:
- number of role-fit validations
- seniority calibration depth
- person-perception exploration
- pressure or tone variation

---

## Priority balancing rule

When different selection drivers compete, use this rough priority:

### Highest priority
- role-fit risks
- role-fit ambiguities
- critical validation gaps

### High priority
- seniority calibration

### Medium priority
- company context alignment

### Medium priority
- person-perception objectives

### Lowest priority
- tone variation as a separate optimization layer

Reason:
the interview must remain useful even if tone simulation is still simple.

Tone matters, but role relevance matters more.

---

## Conflict resolution rule

When the engine has too many candidate question families, it should prefer:

1. direct relevance to role-fit uncertainty
2. seniority calibration value
3. person-perception relevance for the specific context
4. diversity of evaluation angle
5. non-duplication with already selected families

This avoids:
- repeated prompts
- too many similar probes
- overloading a short session with redundant logic

---

## Suggested future output shape

A future selection step could produce something like:

```json
{
  "questionSelectionStrategy": {
    "mandatoryFamilies": [
      "transferability_examples",
      "ownership_scope"
    ],
    "seniorityCalibrationFamilies": [
      "learning_orientation"
    ],
    "personPerceptionFamilies": [
      "initiative_examples"
    ],
    "toneMode": "hr_relational",
    "selectionRationale": [
      "role transferability is a core ambiguity",
      "junior context requires learning-potential validation",
      "corporate context values collaboration and coachability"
    ]
  }
}
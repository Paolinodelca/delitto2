# Question Family Taxonomy — Fringe Interview

## Purpose

This document defines the conceptual taxonomy used to organize interview questions inside the FRINGE engine.

The goal is to prevent the question bank from growing in an unstructured way as the system evolves.

Instead of treating all questions as generic prompts, the system classifies them into stable semantic families.

These families help the engine:

- select questions more intelligently
- adapt to role seniority
- simulate different interview styles
- surface person-perception signals
- keep the question bank manageable as it expands

---

## High-level structure

Questions are grouped into four macro categories:

A. Role-fit validation  
B. Seniority calibration  
C. Person-perception exploration  
D. Tone-sensitive variants

These categories represent different interview objectives.

---

# A — Role-Fit Validation

## Purpose

These questions verify whether the candidate's experience aligns with the role requirements.

They test:

- transferability
- analytical thinking
- execution ability
- relevance of past experience
- evidence of results

These questions are the backbone of most interviews.

---

## Typical signals explored

- ownership of work
- scope of responsibility
- measurable outcomes
- problem solving approach
- stakeholder interactions
- adaptation to tools or methods

---

## Example family types

transferability_examples  
problem_solving_examples  
ownership_scope  
stakeholder_interaction  
technical_depth  
tool_adaptation  
execution_results

---

# B — Seniority Calibration

## Purpose

These questions estimate whether the candidate operates at the expected seniority level.

Different roles require different levels of:

- autonomy
- judgment
- accountability
- strategic thinking

---

## Typical signals explored

Entry / Junior roles:
- learning orientation
- initiative
- curiosity
- coachability

Mid roles:
- independent execution
- cross-team collaboration
- problem ownership

Senior / Lead roles:
- decision scope
- influence
- strategic trade-offs
- team leadership

Executive roles:
- organizational impact
- strategic direction
- risk evaluation
- long-term planning

---

## Example family types

autonomy_examples  
decision_making  
ambiguity_management  
leadership_scope  
strategic_tradeoffs  
stakeholder_influence  
accountability_examples

---

# C — Person-Perception Exploration

## Purpose

Real interviews also evaluate the *impression* a candidate creates.

These questions help surface signals that influence how a recruiter may perceive the candidate.

Important rule:

FRINGE must **never present these signals as psychological diagnoses**.

Instead the system should frame them as:

"a recruiter might perceive..."

or

"this answer may suggest..."

---

## Typical perception signals

initiative  
collaboration  
discipline  
resilience  
curiosity  
enthusiasm  
coachability  
communication warmth  
calm under pressure  
execution focus

---

## Sources of signals

Signals may emerge from:

- stories the candidate chooses
- hobbies or sports
- side projects
- academic initiatives
- reactions to difficulty
- reflections on failure
- how the candidate describes teamwork

---

## Example family types

motivation_story  
learning_orientation  
teamwork_style  
initiative_examples  
resilience_story  
personal_projects  
energy_and_drive  
handling_failure

---

# D — Tone-Sensitive Variants

## Purpose

The same conceptual question may appear in different forms depending on interview tone.

Real interviewers differ greatly in style.

Some are:
- warm
- conversational
- analytical
- confrontational
- very direct

The engine should be able to simulate these variations.

---

## Tone categories

standard  
supportive  
incisive  
pressure  
hr_relational  
business_direct

---

## Tone differences

Supportive tone:
- inviting phrasing
- exploratory prompts
- gentle probing

Pressure tone:
- short prompts
- challenge statements
- requests for defense of claims

Business-direct tone:
- concise
- outcome-focused
- little tolerance for vague language

HR-relational tone:
- reflective
- narrative-friendly
- focused on motivations and values

---

# Question structure concept

Each question family should be defined conceptually, not only as a fixed sentence.

Example conceptual structure:
family_key: initiative_examples

intent:
detect whether the candidate takes initiative beyond assigned tasks

signals:
ownership
proactivity
problem anticipation

variants:
standard
supportive
pressure

This allows the engine to generate multiple stylistic versions while preserving the same underlying intent.

---

# Relationship with Interview Context Engine

The future Interview Context Engine will influence:

- which families are selected
- which tone variants are used
- which person-perception signals are emphasized
- which seniority calibration questions appear

Example:

Entry role + corporate HR context:

focus:
- learning orientation
- teamwork
- initiative

Senior consulting role + pressure tone:

focus:
- decision trade-offs
- stakeholder conflict
- calm under pressure

---

# Design principle

The question bank should not grow randomly.

Instead it should evolve through:

- stable conceptual families
- tone variants
- contextual selection rules

This allows the interview engine to remain:

- flexible
- realistic
- maintainable

even as the number of questions increases significantly.

# Interview Context Selection Matrix — Fringe Interview

## Purpose

This document translates the new context-aware interview engine into a first operational mapping.

It is not yet runtime code.
Its role is to define how the engine should connect:

- seniority context
- company context
- interview tone
- person-perception focus

to:

- question-family priorities
- follow-up emphasis
- coaching interpretation

This matrix should become the bridge between:
- conceptual design
- question-bank expansion
- future selection logic

---

## Core selection rule

The interview engine should not select questions only from generic role-fit logic.

It should increasingly combine:

1. role-fit priorities
2. seniority context
3. company context
4. default interview tone
5. person-perception focus

The result should be:
- a better interview plan
- more realistic prompt selection
- more credible coaching output

---

## First matrix — seniority context

### entry

**Main evaluation logic**
- potential over experience
- energy over polish
- learnability over strategic depth

**Question-family priorities**
- motivation
- learning orientation
- curiosity
- teamwork basics
- initiative in small contexts

**Person-perception focus**
- curiosity
- coachability
- energy
- reliability

**Answer expectations**
- concrete but simple examples
- willingness to learn
- honest limits
- positive activation

**Risk if missing**
- flat profile
- passive attitude
- no sign of initiative
- weak motivation

---

### junior

**Main evaluation logic**
- emerging ownership
- growth capacity
- ability to turn small experiences into credible signals

**Question-family priorities**
- transferability
- learning orientation
- initiative
- discipline
- collaboration
- first ownership moments

**Person-perception focus**
- initiative
- curiosity
- discipline
- collaboration

**Answer expectations**
- examples with action and result
- some personal role clarity
- motivation linked to growth
- visible effort / consistency

**Risk if missing**
- generic responses
- “I was present but did little”
- enthusiasm without evidence
- unclear self-positioning

---

### mid

**Main evaluation logic**
- autonomous execution
- clear ownership
- problem solving with practical judgment

**Question-family priorities**
- ownership scope
- analytical depth
- execution examples
- prioritization
- stakeholder handling
- adaptation under changing conditions

**Person-perception focus**
- autonomy
- execution focus
- clarity
- accountability

**Answer expectations**
- concrete decisions
- visible results
- practical trade-offs
- clear personal contribution

**Risk if missing**
- still sounding junior
- too much team fog
- weak decision ownership
- vague results

---

### senior

**Main evaluation logic**
- larger responsibility
- decision quality
- influence
- ability to operate through complexity

**Question-family priorities**
- decision scope
- stakeholder management
- ambiguity management
- leadership moments
- trade-off decisions
- cross-functional alignment

**Person-perception focus**
- judgment
- accountability
- influence
- maturity

**Answer expectations**
- strategic context
- difficult decisions
- prioritization logic
- consequences and outcomes

**Risk if missing**
- experience sounds narrower than title
- too operational
- weak influence signal
- insufficient scale

---

### lead

**Main evaluation logic**
- leadership and guidance
- coordination through others
- stability under pressure
- ownership of outcomes beyond own tasks

**Question-family priorities**
- leadership scope
- influence without authority
- alignment
- conflict handling
- resilience
- system-level thinking

**Person-perception focus**
- leadership
- composure
- influence
- resilience

**Answer expectations**
- team-level examples
- alignment logic
- pressure handling
- responsibility for wider outcomes

**Risk if missing**
- title inflation
- individual contributor answers only
- weak people signal
- no evidence of broader coordination

---

### executive

**Main evaluation logic**
- strategic clarity
- senior judgment
- difficult trade-offs
- organizational impact

**Question-family priorities**
- strategy
- decision quality
- organizational change
- pressure handling
- executive presence
- complex stakeholder influence

**Person-perception focus**
- decisiveness
- composure under pressure
- strategic maturity
- leadership gravity

**Answer expectations**
- difficult context
- trade-off logic
- visible impact
- leadership language with accountability

**Risk if missing**
- over-generic leadership talk
- no strategic depth
- weak consequence awareness
- low executive presence

---

## Second matrix — company context

### corporate_structured

**Likely valued signals**
- clarity
- process awareness
- stakeholder alignment
- collaboration
- reliability in structured systems

**Question-family priorities**
- stakeholder management
- communication clarity
- process adaptation
- cross-team coordination
- evidence in structured contexts

**Default tone suggestion**
- hr_relational
- standard

**Coaching note**
The candidate should sound readable, collaborative, and credible inside complex structures.

---

### scaleup_dynamic

**Likely valued signals**
- adaptability
- ownership
- speed
- comfort under ambiguity
- learning fast

**Question-family priorities**
- ambiguity management
- prioritization
- adaptation
- problem solving
- ownership under change

**Default tone suggestion**
- incisive
- business_direct

**Coaching note**
The candidate should sound active, flexible, and able to move without perfect structure.

---

### startup_pragmatic

**Likely valued signals**
- execution
- initiative
- resourcefulness
- autonomy
- bias to action

**Question-family priorities**
- initiative
- execution examples
- autonomy
- problem solving with limited resources
- practical decision-making

**Default tone suggestion**
- business_direct
- incisive

**Coaching note**
The candidate should sound useful, concrete, and able to produce value quickly.

---

### consultancy_client_facing

**Likely valued signals**
- composure
- synthesis
- adaptability
- communication control
- resilience under pressure

**Question-family priorities**
- client handling
- synthesis
- pressure response
- expectation management
- communication clarity

**Default tone suggestion**
- pressure
- business_direct

**Coaching note**
The candidate should sound composed, sharp, and credible under challenge.

---

### small_business_operational

**Likely valued signals**
- pragmatism
- versatility
- reliability
- autonomy
- practical usefulness

**Question-family priorities**
- autonomy
- versatility
- execution
- practical examples
- low-theory / high-concreteness responses

**Default tone suggestion**
- standard
- business_direct

**Coaching note**
The candidate should sound concrete, useful, and not too abstract or over-formal.

---

## Third matrix — tone behavior

### standard
Use when:
- no special pressure signal is needed
- balanced simulation is preferred

Prompt behavior:
- neutral
- professional
- exploratory

Best for:
- default simulations
- baseline evaluation

---

### supportive
Use when:
- user is inexperienced
- onboarding or first practice simulation
- low-confidence candidate training

Prompt behavior:
- warmer
- more inviting
- low challenge intensity

Best for:
- entry / junior
- first rehearsal
- confidence-building practice

---

### incisive
Use when:
- role needs precision
- answers must become sharper
- vague language should be challenged quickly

Prompt behavior:
- more direct
- more focused
- less tolerant of generic wording

Best for:
- mid / senior
- dynamic contexts
- sharpening sessions

---

### pressure
Use when:
- role plausibly involves stress tolerance
- pressure handling matters
- user explicitly wants tougher training

Prompt behavior:
- shorter
- more challenging
- more defensive pressure

Best for:
- consultancy
- commercial roles
- leadership tracks
- difficult stakeholder environments

Important note:
pressure mode should remain realistic, not caricatural.

---

### hr_relational
Use when:
- compatibility, motivation, and team fit matter strongly
- person-perception lens should be more visible

Prompt behavior:
- more relational
- more open
- more person-oriented

Best for:
- junior hiring
- people-heavy environments
- fit / motivation exploration

---

### business_direct
Use when:
- result, clarity, and time efficiency matter
- practical usefulness is central

Prompt behavior:
- concise
- outcome-focused
- little patience for vague answers

Best for:
- startup / scaleup
- operational roles
- commercially focused settings

---

## First integrated examples

### Example 1
**Input context**
- seniority: junior
- company: corporate_structured

**Likely default tone**
- hr_relational

**Question-family emphasis**
- motivation
- learning orientation
- collaboration
- transferability
- first ownership examples

**Person-perception focus**
- curiosity
- coachability
- reliability
- positive energy

---

### Example 2
**Input context**
- seniority: mid
- company: startup_pragmatic

**Likely default tone**
- business_direct

**Question-family emphasis**
- autonomy
- execution focus
- prioritization
- problem solving
- ownership

**Person-perception focus**
- initiative
- autonomy
- speed
- practical usefulness

---

### Example 3
**Input context**
- seniority: senior
- company: consultancy_client_facing

**Likely default tone**
- pressure

**Question-family emphasis**
- stakeholder management
- difficult situations
- composure under challenge
- synthesis
- influence

**Person-perception focus**
- composure
- resilience
- judgment
- communication control

---

## Implementation bridge

This matrix should later feed a first runtime mapping module, for example:

- `deriveInterviewContextProfileFromJobFit.js`
or
- `deriveInterviewContextProfile.js`

That future module should output:
- seniorityContext
- companyContext
- defaultTone
- personPerceptionFocus
- questionFamilyPriorities

This output should then influence:
- `buildInterviewQuestionSet`
- future tone-sensitive question variants
- future person-perception report sections

---

## Recommended next design step

Before implementing the runtime mapping, define a first structured taxonomy of question families that explicitly separates:

- role-fit families
- seniority-calibration families
- person-perception families
- tone-sensitive variants

Only after that should the question bank expand in volume.
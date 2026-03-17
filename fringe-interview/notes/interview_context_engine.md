# Interview Context Engine — Fringe Interview

## Purpose

This document defines the next major extension of the FRINGE Interview engine.

The current engine already adapts the interview based on:
- CV ↔ role fit
- evidence gaps
- ambiguity areas
- follow-up triggers

The next step is to make the interview more realistic by adapting not only to role fit, but also to:

- interview context
- likely interviewer style
- candidate seniority expectations
- person-perception objectives

The goal is to move from:
- a role-fit interview simulator

toward:
- a context-aware interview engine

---

## Why this matters

Real interviews vary not only by topic, but by context.

Examples:
- junior candidate vs senior candidate
- multinational HR interview vs small-company pragmatic interview
- supportive interviewer vs pressure-oriented interviewer
- technical validation vs person-perception screening

This means that the system should not use a single generic interview style.

Instead, it should infer or select:
- what kind of interview is being simulated
- what tone is plausible
- what kinds of answers are expected
- what kinds of personal signals may matter

---

## New engine dimensions

### 1. Seniority context

The engine should classify the role into a seniority context such as:

- entry
- junior
- mid
- senior
- lead
- executive

This should influence:
- question difficulty
- expected ownership
- expected evidence depth
- acceptable lack of direct experience
- relevance of enthusiasm / learning potential vs strategic judgment / leadership

Examples:
- for entry/junior roles:
  - curiosity
  - coachability
  - initiative
  - willingness to learn
- for senior/lead roles:
  - decision scope
  - influence
  - accountability
  - strategic trade-offs
  - team or stakeholder management

---

### 2. Company context

The engine should infer a coarse company context when possible.

Initial useful categories:

- corporate_structured
- scaleup_dynamic
- startup_pragmatic
- consultancy_client_facing
- small_business_operational

This should influence:
- what types of examples feel credible
- what style of communication is rewarded
- what balance is expected between process and pragmatism
- what type of personal impression is likely to matter

Examples:
- corporate_structured:
  - clarity
  - cross-team collaboration
  - process awareness
  - stakeholder alignment
- startup_pragmatic:
  - autonomy
  - ambiguity tolerance
  - execution speed
  - resourcefulness
- consultancy_client_facing:
  - composure
  - client empathy
  - synthesis
  - adaptability under pressure

---

### 3. Interview tone

The engine should support the idea that interviewer style changes the simulation meaningfully.

Important note:
the engine usually cannot know the exact real interviewer style in advance.

Therefore it should:
- infer a plausible default tone from context
- later allow the user to override or train against another tone

Initial tone categories:

- standard
- supportive
- incisive
- pressure
- hr_relational
- business_direct

This should influence:
- wording of prompts
- follow-up sharpness
- interruption / challenge intensity
- evaluation framing
- emotional difficulty of the simulation

Examples:
- supportive:
  - warmer wording
  - more inviting questions
  - gentler probing
- pressure:
  - shorter prompts
  - more challenge
  - more “defend your claim” pressure
- business_direct:
  - concise
  - result-focused
  - little tolerance for vague language

---

### 4. Person-perception layer

The engine should add a second interpretive lens focused on how the candidate may be perceived.

Important rule:
this is NOT a personality-typing engine.

The system must avoid:
- rigid labels
- pseudo-psychology
- overconfident personal judgments

Preferred wording:
- “a recruiter might perceive…”
- “these answers may suggest…”
- “for this role, it may help to make these aspects more visible…”

Potential perceived signals include:

- initiative
- autonomy
- collaboration
- discipline
- resilience
- curiosity
- enthusiasm
- coachability
- maturity
- execution focus
- calm under pressure
- communication warmth
- decisiveness

These may emerge through:
- examples selected by the candidate
- activities mentioned
- hobbies / sports / side projects
- ownership language
- reaction to difficulty
- style of narration
- degree of reflection

This layer is especially useful for:
- young candidates
- first-job users
- low-seniority profiles
- users who do not yet understand what personal signals they transmit in interviews

---

## New question-family architecture implications

The question bank should eventually expand beyond pure role-fit questioning.

Future question families should likely include four macro-groups:

### A. Role-fit / experience validation
Examples:
- transferability
- analytical depth
- ownership scope
- stakeholder management
- tool adaptation

### B. Seniority calibration
Examples:
- autonomy
- judgment
- decision scope
- ambiguity management
- accountability

### C. Person-perception
Examples:
- motivation
- energy / enthusiasm
- learning orientation
- teamwork style
- resilience
- discipline
- initiative
- self-presentation signals

### D. Tone-sensitive variants
Examples:
- standard version
- supportive version
- pressure version
- business-direct version

Important note:
the same conceptual question may later have multiple variants depending on tone and context.

---

## Proposed first engine outputs

A future context-profiling step should produce something like:

```json
{
  "interviewContextProfile": {
    "seniorityContext": "junior",
    "companyContext": "corporate_structured",
    "interviewToneDefault": "hr_relational",
    "personPerceptionFocus": [
      "curiosity",
      "coachability",
      "collaboration",
      "energy"
    ],
    "questionStrategyBias": [
      "validation",
      "potential",
      "clarity",
      "team-fit"
    ]
  }
}
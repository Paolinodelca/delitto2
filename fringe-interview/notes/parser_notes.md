# Parser Notes — CV ↔ Job Description

This document describes the design logic behind the CV and Job Description parser used in Fringe Interview.

The parser converts unstructured text into structured objects used by the interview engine.

---

# Core Objective

Transform:

- CV text
- Job Description text

into three structured objects:

- CandidateProfile
- RoleProfile
- JobFitAnalysis

These objects allow the interview engine to adapt the interview dynamically.

---

# Design Philosophy

The parser must not behave like a simplistic keyword extractor.

Instead it should detect **signals** about the candidate and the role.

Important principles:

- explicit evidence is stronger than keyword presence
- missing evidence is not the same as missing skill
- responsibilities matter more than isolated tools
- adjacent experience should be recognized

The goal is not perfect classification but **useful interview guidance**.

---

# CandidateProfile Purpose

The CandidateProfile represents how the candidate appears based on the CV.

It captures:

- perceived seniority
- skill clusters
- domain exposure
- responsibility signals
- leadership exposure
- communication clarity
- evidence strength

It must also detect:

- strong areas
- potential risk areas
- ambiguities in the CV narrative

These signals help determine where the interview should probe deeper.

---

# RoleProfile Purpose

The RoleProfile describes what the role really demands.

The parser extracts:

- seniority expectations
- required skills
- preferred skills
- responsibilities
- domain context
- environment signals
- pressure signals
- potential red flags

The parser should distinguish between:

- must-have requirements
- preferred requirements
- bonus signals

This allows the fit engine to weigh gaps correctly.

---

# JobFitAnalysis Purpose

JobFitAnalysis compares CandidateProfile and RoleProfile.

Its goal is to produce a structured explanation of the candidate-role compatibility.

The analysis must identify:

- strong matches
- partial matches
- transferable strengths
- missing requirements
- weak evidence areas
- ambiguous signals

The analysis must also derive:

- interview focus areas
- follow-up triggers
- CV improvement hints

---

# Fit Dimensions

The fit analysis should evaluate several dimensions.

## Technical fit
Alignment between required technical capabilities and candidate skills.

## Tools fit
Alignment between requested tools and tools used by the candidate.

## Domain fit
Alignment between candidate industry experience and role context.

Domain adjacency should be considered.

## Seniority fit
Comparison between expected seniority and signals detected in the CV.

Signals include:

- years of experience
- ownership scope
- leadership exposure
- responsibility complexity

## Responsibility fit
Comparison between role responsibilities and candidate past activities.

This is especially important for mid and senior roles.

## Evidence strength
Evaluation of how strongly the CV supports the candidate claims.

Weak CV evidence may trigger interview verification.

## Growth potential
Estimation of whether the candidate could grow into the role.

---

# Match Classification

Each comparison between role signals and candidate signals should be classified.

Suggested match types:

- direct_match
- partial_match
- adjacent_match
- transferable_match
- weak_signal
- missing
- contradicted

This classification helps generate explanations and scoring.

---

# Gap Model

Not all gaps are equal.

Each gap should include:

## Severity
- low
- medium
- high
- critical

## Recoverability
- easy_to_reframe
- easy_to_learn
- interview_clarifiable
- structurally_missing

This allows the engine to distinguish between superficial and structural gaps.

---

# Interview Guidance

The parser analysis must help drive the interview.

Typical interview focus types include:

- verify technical depth
- probe scope of ownership
- clarify seniority
- test tool familiarity
- assess transferability
- explore missing metrics
- validate communication clarity

The interview engine should use these signals to choose appropriate questions and follow-ups.

---

# CV Improvement Suggestions

The analysis must also generate targeted CV improvement suggestions.

Types of suggestions:

## Evidence improvement
Add concrete examples showing how skills were applied.

## Framing improvement
Align wording of experience with role expectations.

## Impact visibility
Add measurable outcomes or quantified achievements.

## Real gap preparation
Prepare for interview questions when a true requirement gap exists.

---

# Parser Strategy

The parser should use a hybrid strategy.

Not purely rule-based.  
Not purely free-form LLM.

Instead:

LLM reasoning guided by a strict output schema.

The schema ensures consistent structure while allowing semantic interpretation.

---

# First Usage in the Interview

The JobFitAnalysis output feeds the interview engine.

It determines:

- which question families to prioritize
- which follow-up packs to activate
- which areas require deeper probing
- which strengths should be validated

The goal is an interview that feels **context-aware**, not generic.

---

# Long-Term Direction

Over time the parser may evolve to include:

- richer signal detection
- improved domain adjacency detection
- better seniority inference
- improved explanation generation
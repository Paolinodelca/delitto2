# JobFitAnalysis Engine Specification

## Purpose

The JobFitAnalysis engine evaluates the compatibility between:

- a **CandidateProfile** (derived from the CV)
- a **RoleProfile** (derived from the Job Description)

The engine produces a structured object:

`JobFitAnalysis`

This object is used to:

- determine interview focus
- activate follow-up packs
- support final report generation
- generate CV improvement suggestions

The engine must not behave like a simple keyword matching system.  
It must produce an explainable estimation of alignment between candidate and role.

---

# Core Design Principles

## Evidence over keywords

Explicit evidence of experience must be valued more than simple keyword presence.

Example:

Weak signal:
"Excellent leadership skills"


Strong signal:

"Led a cross-functional team of 6 people across 3 departments"


---

## Missing evidence is not equal to missing skill

A CV may fail to demonstrate a skill clearly even if the candidate possesses it.

Therefore the system must distinguish between:

- missing
- weak evidence
- partial evidence

The interview stage exists precisely to clarify these areas.

---

## Responsibility matters more than tools

Especially for mid and senior roles, responsibilities and ownership signals should weigh more than isolated tool knowledge.

Example signals:

- ownership of deliverables
- stakeholder coordination
- decision making
- scope of responsibility
- autonomy

---

## Adjacency is not equivalence

Two technologies or experiences may be related but not identical.

Example:

- Tableau vs Power BI
- SQL vs database querying experience
- project coordination vs project management

The system must detect adjacency without treating it as identical.

---

# Engine Pipeline

The JobFitAnalysis engine operates through the following logical phases.

1. normalize candidate profile
2. normalize role profile
3. extract comparable signals
4. match signals
5. classify matches
6. score fit across dimensions
7. detect gaps and ambiguities
8. derive interview focus
9. derive follow-up triggers
10. generate CV improvement hints
11. produce final JobFitAnalysis object

---

# Input Objects

## CandidateProfile

Produced by the CV parser.

Expected logical structure:

- identity
- experience_summary
- skills
- tools
- methodologies
- soft_skills
- languages
- education
- certifications
- career_signals
- evidence
- ambiguities

Important signals may include:

- leadership
- ownership
- autonomy
- cross-functional work
- stakeholder interaction
- project complexity
- measurable results

---

## RoleProfile

Produced by the Job Description parser.

Expected logical structure:

- role_identity
- seniority
- responsibilities
- requirements
- required_skills
- preferred_skills
- tools
- domain_context
- success_signals
- red_flags

Requirements should ideally be classified into:

- must_have
- preferred
- bonus

---

# Fit Dimensions

The engine should evaluate compatibility across several dimensions.

These dimensions may later receive different weights.

## Technical Fit

Alignment between required technical skills and candidate capabilities.

Examples:

- programming languages
- analytical techniques
- domain-specific knowledge

---

## Tools Fit

Alignment between tools requested by the role and tools used by the candidate.

Example:

- Power BI
- Tableau
- Excel advanced
- Python
- CRM systems

---

## Domain Fit

Alignment between candidate domain experience and role domain.

Example domains:

- SaaS
- e-commerce
- consulting
- manufacturing
- public sector

Domain adjacency should be recognized.

---

## Seniority Fit

Evaluation of whether candidate experience level aligns with role expectations.

Signals may include:

- years of experience
- project ownership
- leadership exposure
- strategic vs operational responsibilities

---

## Responsibility Fit

Comparison between role responsibilities and candidate past responsibilities.

Examples:

- managing stakeholders
- presenting results
- coordinating teams
- owning deliverables
- managing clients

This dimension is often critical for mid or senior roles.

---

## Evidence Strength

Evaluation of how strongly the CV supports its claims.

Examples:

Weak evidence:


Responsible for reporting


Strong evidence:


Produced weekly performance dashboards used by the executive team


---

## Growth Potential

Estimation of whether the candidate could realistically grow into the role even if not fully aligned today.

Examples:

- adjacent experience
- similar problem domains
- transferable skills

---

# Match Classification

Each comparison between role requirement and candidate signal should be categorized.

Suggested classification types:

- `direct_match`
- `partial_match`
- `adjacent_match`
- `transferable_match`
- `weak_signal`
- `missing`
- `contradicted`

These classes allow the engine to build meaningful explanations.

---

# Gap Model

Not all gaps have the same importance.

Each detected gap may include two descriptors.

## Severity

Possible values:

- low
- medium
- high
- critical

---

## Recoverability

Possible values:

- easy_to_reframe
- easy_to_learn
- interview_clarifiable
- structurally_missing

Example:

Tool gap with adjacent experience:

severity: medium  
recoverability: easy_to_learn

---

# Scoring Philosophy

The system may produce numerical indicators but must avoid fake precision.

Each role requirement may include:

- weight
- requirement_type
- dimension

Match classification can then be converted into scores.

Example mapping:

direct_match → 1.0  
partial_match → 0.75  
adjacent_match → 0.60  
transferable_match → 0.50  
weak_signal → 0.30  
missing → 0.00  
contradicted → negative penalty

The engine can then produce:

- dimension scores
- overall score

But the final interpretation must not rely only on numeric value.

---

# Confidence Model

The analysis should include a confidence indicator.

Confidence may depend on:

- CV clarity
- CV detail level
- JD clarity
- amount of explicit evidence
- number of inferred signals
- number of ambiguities

Possible values:

- high
- medium
- low

---

# Recommendation Bands

Instead of a single percentage, the engine should produce recommendation bands.

Suggested bands:

- strong_fit
- solid_fit
- plausible_fit
- stretch_fit
- weak_fit

Band selection should depend on:

- overall score
- critical gaps
- must-have coverage
- analysis confidence

---

# Match Item Structure

Each match evaluation may internally produce a record similar to:


{
"dimension": "responsibility_fit",
"role_item": "stakeholder management",
"candidate_signal": "presented weekly updates to operations and sales",
"match_type": "partial_match",
"score": 0.72,
"evidence_strength": 0.68,
"severity_if_missing": "medium",
"explanation": "Candidate shows cross-functional communication but scope of stakeholder management is not fully demonstrated."
}


These records allow the system to later generate explanations.

---

# Output Object: JobFitAnalysis

The engine should produce a structured object containing at least the following sections.


fit_summary
dimension_scores
matches
gaps
ambiguities
transferable_strengths
interview_focus
followup_triggers
cv_improvement_hints
report_highlights


---

# Interview Focus Derivation

The engine must identify interview priorities.

Examples:

- verify technical depth
- probe scope of ownership
- clarify seniority
- test tool familiarity
- assess transferability
- explore missing metrics
- validate communication clarity

These signals will help the interview module choose questions and follow-ups.

---

# Follow-up Trigger Logic

Certain conditions should activate specific follow-up packs.

Example:

Leadership gap → leadership_depth follow-up  
Weak ownership signals → responsibility_probe follow-up  
Tool mismatch → tool_adaptation follow-up  
Missing metrics → achievement_quantification follow-up

---

# CV Improvement Hints

The system should generate targeted suggestions.

Types of hints:

## Evidence gap

Skill likely present but not clearly demonstrated.

Example suggestion:
Add concrete examples showing how this skill was applied.

---

## Framing gap

Experience exists but is described using language not aligned with the role.

Example suggestion:
Highlight stakeholder interaction rather than only operational tasks.

---

## Content gap

A key requirement appears genuinely missing.

Suggestion should recommend preparation rather than rewriting.

---

## Impact visibility gap

The CV lacks measurable results.

Suggestion:
Include metrics, outcomes, or quantified achievements.

---

# Implementation Strategy

To avoid premature complexity, development should proceed in phases.

## Phase 1

Deterministic engine:

- basic signal comparison
- match classification
- simple scoring
- gap detection
- interview focus generation

---

## Phase 2

Improved inference:

- adjacent skills detection
- domain adjacency
- better seniority signals
- ambiguity detection

---

## Phase 3

Refined outputs:

- stronger explanations
- better CV suggestions
- improved follow-up activation logic

---

# Immediate Next Steps

1. Review `parser_schema.json`
2. Align schema fields with this specification
3. Create example fixtures
4. Implement first deterministic engine
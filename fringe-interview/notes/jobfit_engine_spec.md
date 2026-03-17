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
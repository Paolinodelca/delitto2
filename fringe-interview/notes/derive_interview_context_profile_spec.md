# Derive Interview Context Profile — Specification

## Purpose

This document specifies the first planned module responsible for deriving the interview context profile.

The module converts signals from the parser and job fit analysis into a structured context profile that guides interview behavior.

This specification defines:

- module inputs
- module outputs
- inference logic
- fallback behavior
- implementation boundaries

The goal is to make the first implementation simple, deterministic, and safe.

---

# Module Name

Proposed implementation module:

deriveInterviewContextProfile.js

This module should eventually live in:

src/interview/

---

# Inputs

The module will consume structured data already produced earlier in the pipeline.

Expected inputs:

CandidateProfile  
RoleProfile  
JobFitAnalysis

These objects already exist in the parser pipeline.

---

## Key signals used

The module should extract signals from:

### RoleProfile
Signals related to:

- role title
- expected responsibilities
- seniority indicators
- domain language

Examples:

- "junior"
- "entry level"
- "lead"
- "head of"
- "director"
- "manager"

---

### JobFitAnalysis
Signals related to:

- evidence strength
- responsibility mismatch
- seniority mismatch
- transferable strengths
- ambiguity areas

These signals help determine what the interview must emphasize.

---

### Job Description language

The role description often contains cultural signals.

Examples:

Structured corporate signals:

- cross-functional collaboration
- stakeholder alignment
- process-driven
- global teams

Startup signals:

- fast paced
- ownership
- build from scratch
- ambiguity

Consulting signals:

- client interaction
- presentation
- synthesis
- stakeholder management

These signals help estimate company context.

---

# Output

The module should return one object:
interviewContextProfile

The shape must follow the contract defined in:

context_profile_contract.md

Example output:

```json
{
  "interviewContextProfile": {
    "version": 1,
    "seniorityContext": "junior",
    "companyContext": "corporate_structured",
    "defaultTone": "hr_relational",
    "personPerceptionFocus": [
      "curiosity",
      "coachability",
      "collaboration"
    ],
    "questionStrategyBias": [
      "validation",
      "potential"
    ],
    "confidence": "medium",
    "metadata": {
      "sourceHints": [
        "job_title",
        "jd_language"
      ]
    }
  }
}
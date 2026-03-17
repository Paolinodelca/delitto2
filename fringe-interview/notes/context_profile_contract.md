# Context Profile Contract — Fringe Interview

## Purpose

This document defines the first proposed contract for the future context-aware interview profiling step.

Its role is to make explicit:

- what the engine should output after inferring interview context
- which fields are core
- which fields are optional
- which fields should influence question selection immediately
- which fields can remain extensible for future use

This is not yet runtime code.
It is the contract design that should guide implementation.

---

## Design goal

The contract should be:

- small enough to be implementable
- rich enough to support future growth
- stable enough to avoid repeated refactoring
- explicit enough to keep selection logic understandable

The context profile should become the bridge between:

- parser / job-fit analysis
- question selection strategy
- tone selection
- future person-perception coaching

---

## Proposed top-level shape

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
      "collaboration",
      "energy"
    ],
    "questionStrategyBias": [
      "validation",
      "potential",
      "clarity",
      "team_fit"
    ],
    "confidence": "medium",
    "metadata": {
      "sourceHints": [
        "job_title",
        "jd_language",
        "culture_words"
      ]
    },
    "extensions": {}
  }
}
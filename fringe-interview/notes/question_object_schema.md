# Question Object Schema — Fringe Interview

## Purpose

This document defines the proposed schema for a single interview question object inside the FRINGE engine.

The goal is to move from:

- plain prompt lists

toward:

- structured question objects that can support
  - context-aware selection
  - seniority-aware selection
  - tone variants
  - person-perception goals
  - future adaptive behavior

This schema is not yet runtime code.
It is the design contract that should guide future config evolution.

---

## Why this matters

The existing question bank is still relatively simple.

That was acceptable for the first MVP phase,
but it is no longer sufficient for the next evolution of the engine.

A question should no longer be treated only as:

- a text prompt

It should be treated as:

- a structured interview asset

This is necessary because the engine increasingly needs to know:

- why the question exists
- what it is trying to detect
- when it should be selected
- which contexts it suits
- which tones it can support

---

## Core design principle

Each question object should contain:

- semantic identity
- interview purpose
- selection metadata
- tone-aware prompt variants
- optional extensibility fields

The schema should remain:
- explicit
- scalable
- readable
- easy to evolve

---

## Proposed top-level shape

```json
{
  "key": "initiative_examples",
  "category": "person_perception",
  "intent": "Detect whether the candidate shows initiative beyond assigned tasks.",
  "signals": [
    "initiative",
    "ownership",
    "proactivity"
  ],
  "senioritySuitability": [
    "entry",
    "junior",
    "mid"
  ],
  "companyContextSuitability": [
    "startup_pragmatic",
    "scaleup_dynamic",
    "small_business_operational"
  ],
  "toneSuitability": [
    "standard",
    "supportive",
    "incisive",
    "business_direct"
  ],
  "selectionWeight": "medium",
  "variants": {
    "standard": {
      "prompt": "Can you tell me about a time when you took initiative beyond what was explicitly asked of you?"
    },
    "supportive": {
      "prompt": "Would you like to share an example of a moment when you stepped forward on your own initiative?"
    },
    "incisive": {
      "prompt": "Give me one concrete example of initiative you took without being directly asked."
    },
    "business_direct": {
      "prompt": "Describe a case where you acted proactively without waiting for instruction."
    }
  },
  "tags": [
    "person_perception",
    "initiative",
    "junior_friendly"
  ],
  "metadata": {},
  "extensions": {}
}
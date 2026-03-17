# Data Structure Design Rules — Fringe Interview

## Purpose

This document defines practical design rules for extending FRINGE data structures safely.

The goal is to support future growth without:
- breaking current flows
- scattering inconsistent fields
- creating fragile placeholder-heavy objects
- forcing repeated refactors every time a new feature appears

The guiding idea is:

**do not overbuild fake fields; instead, design stable structures that can grow cleanly.**

---

## Core principle

When extending the engine, prefer:

- small stable core fields
- clearly named optional fields
- structured metadata blocks
- extensible containers only where they are genuinely useful

Avoid:
- random future placeholders
- unnamed catch-all fields
- multiple overlapping fields that mean almost the same thing
- deeply nested structures without clear purpose

---

## Rule 1 — Keep a clear core vs optional distinction

Each important object should have:

- **core fields**
  - required for the object to be meaningful
- **optional fields**
  - only present when they add real value

Example:

```json
{
  "interviewContextProfile": {
    "seniorityContext": "junior",
    "companyContext": "corporate_structured",
    "defaultTone": "hr_relational"
  }
}
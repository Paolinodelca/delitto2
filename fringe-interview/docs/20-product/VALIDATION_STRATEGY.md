# IMAGO Validation Strategy

## Goal
Validate whether IMAGO reconstructs meaningful, explainable and non-generic Representations from incomplete evidence.

## Track 1 — Real beta users
Use candidates and outplacement professionals.

Measure:
- recognition of the resulting Representation;
- credibility of conclusions;
- usefulness and actionability;
- clarity and cognitive load;
- important missing or unsupported conclusions;
- willingness to reuse;
- value for Tutor/outplacement workflows.

## Track 2 — Synthetic Validation Lab
Create controlled synthetic profiles with known professional history, strengths, gaps, aspirations, contradictions and targets.

Provide structured source material and simulated interview behaviour.

Compare:
```text
Expected profile
↔ Reconstructed Representation
```

## Core validation metrics
- evidence recall;
- unsupported inference rate;
- correct handling of uncertainty;
- repeated-run consistency;
- target relevance;
- role-family and context sensitivity;
- reconstruction of strengths, gaps and plausible direction;
- stability when irrelevant input changes.

## Recipe validation
For versioned dimension recipes, compare candidate recipe versions using stable test profiles and real evidence where lawful.

A new recipe version must remain traceable and must not silently rewrite historical results.

## Pre-Beta suite
Maintain a small stable synthetic suite covering at least:
- technical/engineering;
- operations/business;
- care/education;
- career change;
- incomplete or contradictory data.

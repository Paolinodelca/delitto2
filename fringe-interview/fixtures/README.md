# Fixtures — Fringe Interview Parser

This folder contains reference fixtures for the CV ↔ Job Description parsing flow.

## Purpose

These fixtures are used to validate the first deterministic and schema-guided versions of the parser pipeline.

The goal is not to create one single “perfect truth” output, but a stable and plausible expected output that can be used to test parser quality.

## Files

- `sample_cv_01.txt`
- `sample_jd_01.txt`
- `expected_candidate_profile_01.json`
- `expected_role_profile_01.json`
- `expected_job_fit_analysis_01.json`

## How to use them

A future parser implementation should:

1. read the CV text
2. generate `CandidateProfile`
3. read the JD text
4. generate `RoleProfile`
5. compare both
6. generate `JobFitAnalysis`

The produced outputs can then be compared against these expected fixtures.

## Important note

These expected outputs are not meant to imply exact wording equality.

They define:
- expected structure
- expected signal direction
- expected fit interpretation
- expected interview guidance logic

The parser may later produce slightly different wording while remaining correct.
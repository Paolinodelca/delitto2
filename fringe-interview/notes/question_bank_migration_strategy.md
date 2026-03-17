# Question Bank Migration Strategy — Fringe Interview

## Purpose

This document defines the migration strategy from the current question-bank structure toward the future structured question-object architecture.

The goal is to introduce the new architecture safely, without breaking the current MVP flow.

The migration must remain:

- incremental
- reversible
- testable
- understandable

The current system is working.
Therefore, migration should happen through controlled coexistence, not full replacement.

---

## Core principle

Do not replace the existing question bank all at once.

Instead:

1. keep the current config files working
2. introduce a small pilot structured question bank
3. add compatibility logic later
4. validate behavior on a limited pilot set
5. expand only after the pilot proves stable

This protects the current MVP while enabling architecture evolution.

---

## Current state

The current engine relies mainly on:

- `config/question_families.json`
- `config/question_families.it.json`
- `config/followup_packs.json`
- `config/followup_packs.it.json`

These files are still the active source of interview prompts.

They should remain active during the first migration phase.

---

## Migration target

The future architecture should gradually move toward structured question objects that include:

- semantic key
- category
- intent
- signals
- seniority suitability
- company context suitability
- tone suitability
- prompt variants
- optional tags / metadata / extensions

This should eventually enable:

- context-aware selection
- tone-aware delivery
- person-perception question families
- cleaner scaling of the question bank

---

## Recommended migration phases

### Phase 0 — conceptual groundwork
Status:
completed

Completed design work includes:
- context engine concept
- context selection matrix
- data structure rules
- question taxonomy
- selection strategy
- context profile contract
- derive context profile spec
- question object schema

No runtime behavior changed yet.

---

### Phase 1 — pilot structured question file
Status:
next step

Create a new config file containing only a small pilot set of structured question objects.

Recommended file:

- `config/question_bank_v2.json`

Important:
this file should NOT replace the current question families yet.

It should exist in parallel as an experimental structured bank.

---

### Phase 2 — pilot family selection
Status:
not started

Select a very small number of pilot families to model in the new structure.

Recommended first pilot families:
- `transferability_examples`
- `ownership_scope`
- `learning_orientation`
- `initiative_examples`
- `stakeholder_interaction`
- `closing_reflection`

Reason:
these cover multiple interview objectives without requiring huge migration effort.

---

### Phase 3 — read-only compatibility layer
Status:
not started

Introduce a lightweight reader/loader for the pilot structured bank.

Possible future module:
- `src/interview/loadStructuredQuestionBank.js`

At this stage:
- the runtime still uses the old active bank
- the new bank can be inspected, tested, validated, and ranked
- no production selection switch is required yet

---

### Phase 4 — strategy simulation on pilot set
Status:
not started

Use the future context profile and question selection strategy to simulate which pilot structured questions would be selected.

Important:
this can be tested before replacing current session composition.

This stage should answer:
- does the structured bank contain enough metadata?
- are the categories useful?
- are the suitability fields well chosen?
- are tone variants coherent?

---

### Phase 5 — controlled runtime integration
Status:
not started

Only after the pilot has proven useful should the engine begin to integrate structured questions into actual selection.

Recommended strategy:
- allow hybrid selection
- keep old bank as fallback
- use structured pilot families for limited contexts first

Do not attempt full replacement too early.

---

## Coexistence rule

During migration, the system should support coexistence between:

### legacy bank
- current active question family files

and

### structured bank
- experimental v2 structured question objects

This avoids breaking:
- current tests
- current MVP session flow
- current UI snapshots
- existing scripts

---

## What should NOT happen yet

The following actions are explicitly discouraged in the next step:

- deleting `question_families.json`
- rewriting all question config at once
- forcing runtime to depend fully on structured questions
- migrating follow-up packs at the same time
- adding LLM-generated question structure too early

Reason:
that would create too much change at once and increase confusion.

---

## First practical migration target

The first safe tangible deliverable should be:

1. a new file:
   - `config/question_bank_v2.json`

2. containing:
   - a small number of structured pilot questions

3. using:
   - the new question object schema

4. without changing:
   - current runtime selection
   - current MVP output
   - current browser shell behavior

This gives the project:
- a real experimental structured bank
- zero disruption to the working MVP

---

## Initial validation questions

Before runtime integration, the pilot structured bank should help answer:

- is the schema expressive enough?
- are the categories meaningful?
- are tone variants useful in practice?
- do the signals support future person-perception logic?
- do suitability fields help contextual selection?
- what fields feel unnecessary or missing?

This is the purpose of the pilot phase.

---

## Relationship with context-aware engine

The structured question bank is the first config layer that can truly support:

- `interviewContextProfile`
- `questionSelectionStrategy`
- tone simulation
- person-perception question selection

Without a structured bank, the context engine cannot be exploited fully.

Therefore:
the structured bank is the first real bridge from architecture to implementation.

---

## Recommended immediate next step

Create:

- `config/question_bank_v2.json`

with a very small pilot set.

Do not overpopulate it.

A good first pilot should include:
- one role-fit question
- one seniority-calibration question
- one person-perception question
- one stakeholder-oriented question
- one closing question

This is enough to begin meaningful testing.

---

## Practical takeaway

The question bank migration should happen through:

- parallel introduction
- small pilot scope
- validation before integration
- hybrid coexistence
- gradual runtime adoption

This is the safest path from:
- working MVP
to
- scalable structured interview engine
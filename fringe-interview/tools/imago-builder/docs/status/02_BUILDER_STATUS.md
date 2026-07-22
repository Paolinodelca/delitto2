# IMAGO Builder Status

Version: 1.0

Status: ACTIVE

Last Updated: 2026-07-21

---

# Purpose

Questo documento rappresenta lo stato corrente del Builder.

Non contiene decisioni architetturali.

Non descrive il workflow.

Non sostituisce il repository.

Serve esclusivamente a sapere:

- cosa esiste;
- cosa è completato;
- cosa manca;
- qual è il prossimo task.

Ogni aggiornamento deve essere coerente con il repository reale.

---

# Current Phase

Project

IMAGO Builder

Stage

Beta

Overall Status

BETA RELEASED

Repository

Repository is considered the Source of Truth.

---

# Milestones

| Milestone | Status |
|-----------|--------|
| Core Contracts | ✅ |
| Validators | ✅ |
| Builder Foundation | ✅ |
| Planning Layer | ✅ |
| Writer Layer | ✅ |
| CLI Foundation | ✅ |
| Documentation Foundation | ✅ |
| Generator Orchestrator | ✅ |
| Measurement Modules | ✅ |
| Builder Automation | ⏳ |
| Beta Release | ✅ |

Legenda

✅ Completed

🚧 In Progress

⏳ Planned

❌ Not Started

---

# Core Components

## Contracts

Status

COMPLETE

Available

- MeasurementModuleSpec
- MeasurementTemplateContext
- GeneratedFileEntry
- GenerationPlan
- GenerationWritePreflight
- GenerationWriteReport
- MeasurementModuleGenerationResult — NOT IMPLEMENTED
  - il risultato è attualmente composto direttamente da
    `generateMeasurementModuleScaffold()`;
  - builder e validator dedicati non sono presenti;
  - decisione rinviata al consolidamento dell’orchestratore.

---

## Validators

Status

COMPLETE

Validator available for every implemented public contract.

---

## Builders

Status

ACTIVE

Available

- Contract Builders
- Planning Builders
- Writer Builders

High-level generation

- `generateMeasurementModuleScaffold()` supports dry-run and explicit write mode.

---


## Test location

I test e gli health check del Builder non risiedono dentro
`tools/imago-builder/tests`.

Sono collocati nella cartella repository-level:

`scripts/`

Le famiglie principali sono:

- `test_build_generation_*`
- `test_generation_*`
- `test_measurement_module_*`
- `health_generation_*`
- `test_generate_measurement_module_scaffold_dry_run.js`

Qualunque handover operativo del Builder deve includere sia:

- `tools/imago-builder/`
- `scripts/`

preservandone i percorsi relativi.


## Renderer

Status

AVAILABLE

Template rendering available.

Deterministic rendering required.

---

## Writer

Status

COMPLETE

Capabilities

- Atomic write
- Multi-file write
- Ready guard
- Stop-on-first-failure
- Partial status
- Report generation

---

## CLI

Status

AVAILABLE

Capabilities

- Human output
- JSON output
- Help
- Version
- Exit codes

Current limitations

Version depends on repository metadata.

---

# Completed Tasks

Le informazioni riportate di seguito devono riflettere esclusivamente
lo stato reale del repository.

Ogni task completato deve avere:

- codice presente;
- test disponibili;
- documentazione aggiornata;
- review conclusa.

---

| Task | Status | Notes |
|------|--------|-------|
| 0098E-2A | ✅ | Writer contracts e validator |
| 0098E-2B | ✅ | Atomic Writer |
| 0098E-2C | ✅ | Multi-file Writer |
| 0098E-2D | ✅ | Writer Hardening |
| 0098E-3 | ✅ | Generation Writer CLI |
| 0098E-4 | ✅ | Existing Measurement Generator Orchestrator consolidated |
| 0098E-5 | ✅ | Measurement Module end-to-end generation |
| 0098E-6 | ✅ | Core stabilization and end-to-end release validation |
| 0098E-7 | ✅ | Public API compatibility regression |
| 0098E-8 | ✅ | Beta readiness regression gate |
| 0098E-9 | ✅ | IMAGO Builder Beta Release |

---

# Current Task

Task

0098E-9

Status

COMPLETED

Title

IMAGO Builder Beta Release

Goal

Dichiarare completata la milestone Beta dopo la verifica del gate di readiness
già presente, senza introdurre nuove funzionalità, contratti o API pubbliche.

Deliverable completati

- esecuzione positiva del Beta Readiness Regression Gate;
- esecuzione positiva degli health check Builder applicabili;
- roadmap aggiornata con `Beta Release` completata;
- stato corrente aggiornato a `BETA RELEASED`;
- cronologia tecnica aggiornata con il confine di rilascio.

---

# Public API Status

## Stable API

Le seguenti API sono considerate pubbliche.

Ogni modifica richiede particolare attenzione.

- Builder pubblici
- Validator pubblici
- Writer pubblici
- CLI pubbliche

Le firme pubbliche devono rimanere compatibili.

---

## Internal API

Le API interne possono evolvere liberamente.

Non devono essere utilizzate dalle CLI.

Non devono essere esportate.

---

# Documentation Status

| Documento | Stato |
|-----------|-------|
| 00_BUILDER_ARCHITECTURE.md | ✅ |
| 01_BUILDER_WORKFLOW.md | ✅ |
| 02_BUILDER_STATUS.md | 🚧 |
| 03_ARCHITECT_DECISIONS.md | ⏳ |
| 99_TASK_TEMPLATE.md | ⏳ |
| README.md | ⏳ |

---

# Health Status

| Area | Stato |
|------|--------|
| Contracts | PASS |
| Validators | PASS |
| Planning | PASS |
| Writer | PASS |
| CLI | PASS |
| Documentation | PASS |
| Generator | PASS |

---

# Known Repository Constraints

Le seguenti caratteristiche del repository sono intenzionali.

## package.json

Attualmente il repository potrebbe non contenere un package.json.

Le CLI devono gestire correttamente questo scenario.

L'assenza del file non costituisce un errore.

---

## Repository First

Le decisioni implementative devono sempre derivare
dal repository reale.

Mai ricostruire componenti assenti.

---

## Task Boundaries

Ogni task termina con:

STOP

Il Builder non implementa automaticamente il task successivo.

---

# Open Decisions

Le decisioni architetturali ancora aperte devono essere elencate qui.

Esempio.

| Decisione | Stato |
|-----------|-------|
| Measurement Generator Orchestrator | APPROVED |
| Builder Automation | OPEN |
| Builder State Inventory Foundation | APPROVED |
| Documentation Automation | OPEN |

Le decisioni approvate devono essere spostate nel documento
03_ARCHITECT_DECISIONS.md.
---

# Builder State Inventory

Status: FOUNDATION AVAILABLE

Internal components available:

- Repository Scanner;
- Structure, Plugin, Public Entry Point, Test, Health and Documentation Collectors;
- Builder State Inventory Builder;
- Builder State Inventory Validator;
- deterministic JSON serializer.

Properties verified:

- repository-relative output;
- deterministic ordering;
- no current timestamps;
- no absolute paths;
- no mutation of inspected repositories;
- no export from the Builder Public API.

Current limitation:

The Foundation inventories structural evidence only. It does not generate or
update documentation and does not infer task completion.


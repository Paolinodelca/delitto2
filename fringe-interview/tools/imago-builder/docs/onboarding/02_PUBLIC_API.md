# Public API

Questo documento elenca esclusivamente le API considerate pubbliche.

## Builders

* buildGenerationPlan()
* buildGenerationWritePreflight()


## Validators

* validateGenerationPlan()
* validateGenerationWritePreflight()
* validateGenerationWriteReport()

## Orchestrator

* generateMeasurementModuleScaffold()

L’orchestratore è unico e mantiene `dry_run` come modalità predefinita. Con
`write: true` esegue il preflight reale e, solo se questo è `ready`, delega la
scrittura a `writeGenerationPlan()`. `generated: true` significa che il piano è
`ready`; `written: true` è disponibile in modalità write e significa che il
report di scrittura è `completed`.

## Writer

* writeGenerationPlan()

## CLI

* imago-builder-write

## JSON Contracts

* GenerationPlan
* GenerationWritePreflight
* GenerationWriteReport
## Risultato dell’orchestratore

`generateMeasurementModuleScaffold()` restituisce attualmente un oggetto risultato
costruito direttamente dall’orchestratore.

Non esistono ancora:

- `buildMeasurementModuleGenerationResult()`
- `validateMeasurementModuleGenerationResult()`
- un contratto pubblico autonomo `MeasurementModuleGenerationResult`

L’eventuale introduzione di questo contratto richiede una decisione architetturale
e un task dedicato.

## Compatibility

Le firme pubbliche devono rimanere compatibili.

Le API interne non devono essere esportate.
## Internal Builder State Inventory

The following components are internal and are not part of the Public API:

- `buildBuilderStateInventory()`
- `validateBuilderStateInventory()`
- `serializeBuilderStateInventory()`

They are consumed through the internal namespace
`tools/imago-builder/internal/builder-state-inventory` and must not be exported
from `tools/imago-builder/index.js`.


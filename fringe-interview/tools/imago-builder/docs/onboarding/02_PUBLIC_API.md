# Public API

Questo documento elenca esclusivamente le API considerate pubbliche.

## Builders

* buildGenerationPlan()
* buildGenerationWritePreflight()


## Validators

* validateGenerationPlan()
* validateGenerationWritePreflight()
* validateGenerationWriteReport()

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

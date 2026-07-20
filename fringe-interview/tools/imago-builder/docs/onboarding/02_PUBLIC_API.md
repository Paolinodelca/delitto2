# Public API

Questo documento elenca esclusivamente le API considerate pubbliche.

## Builders

* buildGenerationPlan()
* buildGenerationWritePreflight()
* buildMeasurementModuleGenerationResult()

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
* MeasurementModuleGenerationResult

## Compatibility

Le firme pubbliche devono rimanere compatibili.

Le API interne non devono essere esportate.

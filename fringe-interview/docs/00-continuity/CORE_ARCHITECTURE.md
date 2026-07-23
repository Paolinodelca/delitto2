# IMAGO CORE — ARCHITECTURE MAP

## Principio generale

IMAGO non valuta la persona in assoluto.

Il Core organizza evidenze e conoscenza ricostruibile preservando origine, confidence, versione, provenance e dipendenze.

```text
Evidence → Measurement → Knowledge → Derived Knowledge → Composed View
```

## Pipeline completa

```text
Input Sources
    ↓
Observation
    ↓
MeasurementResult
    ↓
MeasurementDimensionMapping
    ↓
DimensionContribution
    ↓
KnowledgeLedger
    ↓
KnowledgeSnapshot
    ↓
Elementary DimensionKnowledgeState[]
    ↓
DerivedKnowledgeRule[]
    ↓
CapabilityRecipe
    ↓
CapabilityExecutionResult
    ↓
DerivedDimensionMapping
    ↓
DerivedDimensionKnowledgeState[]
    ↓
PersonKnowledgeMatrix
```

## Evidence Layer

Responsabilità:

- ricevere fonti;
- preservare provenienza;
- estrarre evidenze;
- distinguere raw source e structured input.

Contratti Foundation già presenti includono:

```text
InputBundle
InputSource
Evidence
EvidenceStore
EvidenceSummary
Observation
```

Il contenuto raw non deve essere copiato nella PersonKnowledgeMatrix.

## Measurement Layer

Contratti:

```text
MeasurementResult
MeasurementDimensionMapping
```

Un mapping deve essere dichiarativo. Una misura non decide direttamente lo stato della persona.

## Contribution Layer

Contratto:

```text
DimensionContribution
```

Una Contribution è un contributo a una Dimension, non ancora conoscenza aggregata.

## Elementary Knowledge Layer

```text
DimensionContribution[]
    ↓
KnowledgeLedger
    ↓
KnowledgeSnapshot
    ↓
DimensionKnowledgeState[]
```

Responsabilità:

- mantenere la storia ricostruibile;
- aggregare deterministicamente;
- produrre lo stato elementare corrente;
- non introdurre conoscenza derivata.

## Derived Knowledge Layer

```text
KnowledgeSnapshot
    ↓
DerivedKnowledgeRule
    ↓
DerivedKnowledgeResult
```

Non muta Snapshot o Ledger e non produce automaticamente Contribution.

## Capability Layer

```text
DerivedKnowledgeRule[]
    ↓
CapabilityRecipe
    ↓
executeCapabilityRecipe
    ↓
CapabilityExecutionResult
```

Strategia Foundation:

```text
evaluate_all_rules
```

Nessun evaluator duplicato, chaining, ricorsione o multi-pass implicito.

## Derived Dimension Layer

```text
CapabilityExecutionResult
    +
DerivedDimensionMapping
    ↓
DerivedDimensionKnowledgeState[]
```

Aggregazione corrente:

```text
Σ(mappingEstimate × resultConfidence)
────────────────────────────────────
Σ(resultConfidence)
```

Confidence finale: minimo delle confidence realmente usate.

Coverage e consistency non sono calcolate senza semantica sufficiente.

## Knowledge Composition Layer

Namespace:

```text
src/core/knowledge/
```

```text
KnowledgeSnapshot
    +
DerivedDimensionKnowledgeState[]
    +
subjectRef
    ↓
PersonKnowledgeMatrix
```

La matrice compone, indicizza e preserva lineage e version context.

Non interpreta, non media, non sceglie versioni e non crea score.

## Dependency direction

Consentito:

```text
Knowledge Composition
    ↓
Snapshot / Dimension / Derived Dimension
```

Vietato:

```text
Dimension → PersonKnowledgeMatrix
Capability → PersonKnowledgeMatrix
```

## Separazione fondamentale

```text
DimensionKnowledgeState
≠
DerivedDimensionKnowledgeState
≠
PersonKnowledgeMatrix
```

## Identity e versioning

Distinguere sempre:

```text
contract version
instance identity
```

Identity:

- deterministiche;
- canoniche;
- indipendenti dall’ordine;
- prive di UUID casuali;
- non dipendenti dal timestamp.

## Immutabilità

Nessuna mutazione in-place di Observation, MeasurementResult, Contribution, Ledger, Snapshot, stati, execution result o matrice.

## Guardrail semantici

Il Core non deve introdurre senza task specifico:

- valutazione assoluta;
- employability score;
- potential score;
- readiness;
- fit;
- ranking;
- diagnosi;
- decisione automatizzata;
- recommendation;
- report narrativo;
- inferenze LLM nelle Foundation.

`not observed` non equivale a `absent`.

## Test generali

```powershell
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

Esiti attesi:

```text
IMAGO Core all tests PASSED
All health checks passed
```

# CONTINUITY — IMAGO CORE

## Stato del progetto

La Phase `0100B — Knowledge Engine Foundation` è completata.

Pipeline Core verificata:

```text
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
Elementary DimensionKnowledgeState
    ↓
DerivedKnowledgeRule
    ↓
CapabilityRecipe
    ↓
CapabilityExecutionResult
    ↓
DerivedDimensionKnowledgeState
    ↓
PersonKnowledgeMatrix
```

Root applicativa reale:

```text
repository/
```

Roadmap Core:

```text
repository/docs/15-architecture_specifications/CORE_ROADMAP.md
```

## Task completati

- `0100B-3 — Dimension Contribution Foundation`
- `0100B-4 — Measurement Mapping Foundation`
- `0100B-5 — Elementary Knowledge Aggregation Foundation`
- `0100B-6 — Knowledge Ledger & Snapshot Foundation`
- `0100B-7 — Derived Knowledge Rule Foundation`
- `0100B-8 — Capability Recipe Execution Foundation`
- `0100B-9 — Derived Dimension State Foundation`
- `0100B-10 — Person Knowledge Matrix Foundation`

Roadmap:

```text
Phase 0100B — Knowledge Engine Foundation
Status: COMPLETED
```

Nuovo task corrente:

```text
0100C-1 — Person Knowledge Matrix Query Foundation
Status: PLANNED
```

Il Task `0100C-1` non è stato iniziato.

## Decisioni fondamentali

1. `DimensionKnowledgeState` e `DerivedDimensionKnowledgeState` sono distinti.
2. La conoscenza elementare deriva da Observation, Measurement e Contribution.
3. La conoscenza derivata deriva da Snapshot, regole e CapabilityRecipe.
4. Gli stati derivati non vengono aggiunti al Ledger.
5. La PersonKnowledgeMatrix è una vista materializzata ricostruibile, non un evidence store.
6. Elementary e derived possono coesistere sulla stessa Dimension.
7. Non si calcolano medie automatiche tra layer.
8. Non si sceglie automaticamente lo stato “migliore”.
9. Non esiste un Person Score.
10. Non esistono ancora matching, ranking, recommendation o report narrativi nel Knowledge Core.
11. Confidence, coverage e consistency globali non devono essere inventate.
12. Identity deterministiche e indipendenti dall’ordine degli input.
13. Timestamp esclusi dall’identità logica.
14. Ledger, Snapshot e stati restano immutabili.
15. Nessun LLM nelle Foundation deterministiche.

## PersonKnowledgeMatrix

Namespace:

```text
src/core/knowledge/
```

API pubbliche:

```text
buildPersonKnowledgeMatrix
validatePersonKnowledgeMatrix
```

Shape:

```text
PersonKnowledgeMatrix
├── id
├── subjectRef
├── matrixVersion
├── sourceSnapshotRef
├── knowledgeLayers
│   ├── elementary
│   └── derived
├── indexes
├── summary
├── lineage
├── versionContext
├── provenance
├── dependencyRefs
├── builtAt
├── metadata
└── extensions
```

Indici:

```text
byDimensionId
byKnowledgeLayer
byCapabilityId
byRecipeId
```

Summary tecnica:

```text
elementaryStateCount
derivedStateCount
totalStateCount
dimensionCount
elementaryDimensionCount
derivedDimensionCount
sharedDimensionCount
capabilityCount
recipeCount
dependencyCount
status
```

Subject reference tecnico:

```javascript
{
  type: "person",
  id: "subject-001"
}
```

## Punto tecnico da monitorare

`DimensionKnowledgeState` elementare non possiede attualmente un campo `id`.
La matrice crea quindi una reference deterministica locale dalla fingerprint canonica dello stato.

La scelta è accettata per la Foundation. Una identity nativa potrà essere valutata solo con task dedicato e regression completa.

## Test di chiusura

```powershell
node scripts/test_person_knowledge_matrix.js
node scripts/test_person_knowledge_matrix_regression.js
node scripts/test_health_person_knowledge_matrix.js
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

Esiti attesi:

```text
PASS
IMAGO Core all tests PASSED
All health checks passed
```

## Ripresa futura

1. Usare il repository reale come fonte di verità.
2. Leggere `CORE_ROADMAP.md`.
3. Leggere i documenti in `docs/00-continuity/`.
4. Verificare branch, ultimo commit e working tree.
5. Eseguire `node scripts/test_all_core.js`.
6. Eseguire `node scripts/fringe_health_check.js`.
7. Progettare `0100C-1` senza modificare retroattivamente la Phase `0100B`, salvo bug dimostrato.

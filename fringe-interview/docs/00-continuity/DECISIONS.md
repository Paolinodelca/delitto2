# IMAGO CORE — ARCHITECTURAL DECISIONS

## ADR-001 — Evidence come fonte primaria

Snapshot, stati derivati e PersonKnowledgeMatrix sono viste ricostruibili. La matrice non è un evidence store autoritativo.

## ADR-002 — Separazione Observation, Measurement e Contribution

Un fatto osservato non è automaticamente una misura; una misura non è automaticamente un contributo dimensionale.

## ADR-003 — Mapping dichiarativi

Trasformazioni esplicite tramite:

```text
MeasurementDimensionMapping
DerivedDimensionMapping
```

Vietate conversioni implicite:

```text
true → 1
false → 0
string → number
null → zero
```

## ADR-004 — Ledger immutabile e Snapshot ricostruibile

Il KnowledgeLedger preserva i contributi. Il KnowledgeSnapshot ricostruisce deterministicamente lo stato elementare.

## ADR-005 — Elementary e Derived sono layer distinti

```text
DimensionKnowledgeState
≠
DerivedDimensionKnowledgeState
```

La stessa Dimension può avere stati in entrambi i layer senza fusione o media.

## ADR-006 — CapabilityRecipe distinta da Capability

`CapabilityRecipe` orchestra regole derivate senza alterare il contratto Capability storico.

Strategia Foundation:

```text
evaluate_all_rules
```

## ADR-007 — DerivedDimensionMapping esplicito

Un risultato derivato booleano non diventa automaticamente numerico.

## ADR-008 — Confidence conservativa

La confidence finale dello stato derivato usa il minimo delle confidence impiegate.

## ADR-009 — Coverage e consistency non inventate

Assenti finché non esiste una semantica sufficientemente solida.

## ADR-010 — PersonKnowledgeMatrix come vista materializzata

Gli stati compatti sono incorporati perché non esiste uno state repository risolvibile.

## ADR-011 — Namespace `src/core/knowledge/`

La matrice vive in un layer Core superiore, senza dipendenze inverse.

## ADR-012 — Subject reference minimo

```javascript
{
  type: "person",
  id: "subject-001"
}
```

Nessun dato anagrafico o testo libero.

## ADR-013 — Nessun Person Score

La matrice non contiene overall score, employability, potential, readiness, fit, ranking, recommendation, confidence globale, coverage globale o consistency globale.

## ADR-014 — Collisioni preservate

La stessa `dimensionId` può comparire nei layer elementary e derived senza essere fusa.

## ADR-015 — Recipe version preservata

Versioni differenti possono coesistere. Nessuna selezione automatica della versione più recente o più confidente.

## ADR-016 — Identity deterministica

Vietati UUID casuali, ordine degli array, timestamp e dati personali come componenti dell’identità.

## ADR-017 — Identity locale dello stato elementare

Poiché `DimensionKnowledgeState` non possiede `id`, la matrice usa una reference locale deterministica basata su fingerprint canonica.

Possibile evoluzione futura solo mediante task dedicato.

## ADR-018 — Foundation senza LLM

Vietati LLM, rete, database, callback eseguibili, `eval`, formule arbitrarie e regole professionali hardcoded.

## ADR-019 — Nessuna mutazione in-place

Builder e trasformazioni restituiscono nuovi oggetti.

## ADR-020 — Query Foundation read-only

Il prossimo task `0100C-1` introdurrà query deterministiche per Dimension, layer, Capability e Recipe, senza score, LLM o mutazioni.

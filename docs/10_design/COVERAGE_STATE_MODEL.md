# COVERAGE STATE MODEL

## Scopo

Il Coverage State rappresenta lo stato corrente della raccolta delle evidenze.

Non descrive il candidato.

Non descrive il ruolo.

Non descrive il colloquio.

Descrive esclusivamente quanto il sistema è riuscito a rendere osservabile il Reference Model.

È il principale stato interno utilizzato dal Collection Engine per decidere il passo successivo.

---

# Principio

Il sistema non ragiona in termini di:

- domanda 3
- domanda 8
- follow-up 2

Il sistema ragiona in termini di:

Coverage.

Ogni nuova evidenza modifica il Coverage State.

Il Coverage State decide quale Collection Goal eseguire successivamente.

---

# Pipeline

Reference Model

↓

Collection Goals

↓

Observed Evidence

↓

Coverage State

↓

Next Goal

---

# Oggetto

```js
coverageState = {

    overallCoverage,

    dimensions: [],

    goals: [],

    signals: [],

    runtimeSignals: [],

    nextRecommendation: {},

    confidence,

    metadata,

    extensions: {}

}
```

---

# Dimension Coverage

Ogni Dimension mantiene il proprio livello di copertura.

Esempio:

```js
dimensionCoverage = {

    dimensionId,

    targetCoverage,

    currentCoverage,

    status,

    uncoveredSignals: [],

    completedGoals: [],

    pendingGoals: []

}
```

---

# Goal Coverage

Ogni Collection Goal possiede il proprio stato.

```js
goalCoverage = {

    goalId,

    status,

    collectedEvidence,

    missingEvidence,

    followupCount,

    pressureApplied,

    recoveryUsed,

    confidence

}
```

Status possibili:

- not_started
- collecting
- partially_covered
- covered
- suspended
- completed

---

# Signal Coverage

Ogni Signal mantiene il proprio livello di osservabilità.

```js
signalCoverage = {

    signalId,

    evidenceCount,

    visibility,

    confidence,

    observedEvidence: [],

    missingEvidenceReason

}
```

Il sistema non conclude mai automaticamente che un Signal sia assente.

Può solamente concludere che non è stato osservato con sufficiente chiarezza.

---

# Runtime Signals

Durante la raccolta delle evidenze possono emergere segnali comportamentali.

Esempi:

- response_time
- hesitation
- improvement_after_followup
- reaction_to_pressure
- consistency
- confidence_shift

I Runtime Signals non rappresentano giudizi.

Sono osservazioni contestuali utilizzate come supporto interpretativo.

---

# Next Recommendation

Il Coverage State suggerisce sempre il passo successivo.

Può proporre ad esempio:

- continuare il Goal corrente;
- eseguire un follow-up;
- cambiare Goal;
- aumentare la pressione;
- interrompere la raccolta;
- dichiarare il Goal sufficientemente coperto.

Il Collection Engine utilizza questa raccomandazione ma mantiene la responsabilità finale dell'esecuzione.

---

# Regole

Il Coverage State è l'unica rappresentazione dello stato della raccolta evidenze.

Ogni nuova evidenza aggiorna il Coverage State.

Il Coverage State non contiene testo destinato all'utente.

È un oggetto tecnico.

Il renderer non legge direttamente il Coverage State.

Legge oggetti derivati.

---

# Principio finale

Il cuore decisionale di FRINGE non è costituito dalle domande.

È costituito dall'evoluzione del Coverage State.

Le domande rappresentano semplicemente uno degli strumenti utilizzati per modificarlo.
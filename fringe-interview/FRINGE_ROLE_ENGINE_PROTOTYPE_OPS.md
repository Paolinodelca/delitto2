# FRINGE ROLE ENGINE – PROTOTYPE OPS

## Scopo

Validare manualmente il nuovo modello FRINGE prima di implementarlo.

Caso target:

Product Operations / Operations / Project / Process role

---

# 1. Role Credibility Map

## Stable Pillars

### Credibilità narrativa
Cosa deve emergere:
- esempi concreti
- responsabilità personale
- risultati
- coerenza CV-colloquio

### Maturità professionale
Cosa deve emergere:
- gestione priorità
- trade-off
- decisioni
- autonomia
- ambiguità

### Potenziale
Cosa deve emergere:
- apprendimento
- adattabilità
- capacità di collegare esperienze diverse

### Fit
Cosa deve emergere:
- coerenza con ruolo operativo
- abitudine a contesti cross-funzionali
- tolleranza alla complessità

---

# 2. Role Specific Signals

## stakeholder_alignment

Label:
Allineamento stakeholder

Importance:
high

What must emerge:
Capacità di coordinare persone con priorità diverse, senza limitarsi a descrivere il confronto.

Expected evidence:
- episodio reale
- attrito iniziale
- criterio usato per allineare
- risultato ottenuto

---

## operational_decision

Label:
Decisione operativa

Importance:
high

What must emerge:
Capacità di scegliere tra alternative, spiegando vincoli, priorità e conseguenze.

Expected evidence:
- trade-off
- decisione presa
- criterio
- effetto finale

---

## process_improvement

Label:
Miglioramento di processo

Importance:
medium/high

What must emerge:
Capacità di leggere un processo, individuare inefficienze e migliorarlo.

Expected evidence:
- problema iniziale
- intervento
- metrica o effetto osservabile

---

## kpi_reporting

Label:
KPI e reporting

Importance:
medium

What must emerge:
Capacità di usare dati e report non solo per descrivere, ma per orientare decisioni.

Expected evidence:
- dato monitorato
- decisione supportata
- impatto operativo

---

## ownership

Label:
Responsabilità personale

Importance:
high

What must emerge:
Chiarezza su cosa dipendeva direttamente dal candidato.

Expected evidence:
- attività seguita in prima persona
- decisione o contributo diretto
- risultato riconducibile al proprio intervento

---

# 3. Evidence Collection Plan

## stakeholder_alignment

Minimum evidence:
2 episodi o 1 episodio molto solido

Best question types:
- behavioral
- conflict
- cross-functional
- priority alignment

Follow-up policy:
Se la risposta resta generica, chiedere:
- chi erano gli interlocutori
- quale attrito esisteva
- quale decisione è stata presa
- cosa è cambiato dopo

Stop condition:
Il segnale è sufficientemente coperto quando emergono contesto, ruolo personale, attrito e risultato.

---

## operational_decision

Minimum evidence:
1 decisione concreta

Best question types:
- trade-off
- decision probe
- pressure probe

Follow-up policy:
Se manca il criterio decisionale, chiedere:
- quali alternative c’erano
- perché è stata scelta quella strada
- quale rischio è stato accettato

Stop condition:
Il segnale è coperto quando emerge una scelta personale con criterio e conseguenza.

---

# 4. Interview State

Durante il colloquio il sistema non deve chiedere semplicemente “la prossima domanda”.

Deve chiedere:

Quale segnale è ancora poco coperto?

Esempio stato:

```js
interviewState = {
  currentSignal: "stakeholder_alignment",
  evidenceCoverage: {
    stakeholder_alignment: 0.35,
    operational_decision: 0.20,
    ownership: 0.45,
    process_improvement: 0.10,
    kpi_reporting: 0.30
  },
  pendingSignals: [
    "stakeholder_alignment",
    "operational_decision",
    "process_improvement"
  ],
  exhaustedSignals: [],
  followupHistory: []
}
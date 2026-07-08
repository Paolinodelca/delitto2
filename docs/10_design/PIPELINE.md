# IMAGO PIPELINE

## Scopo

Questo documento descrive la pipeline fondamentale del Core di FRINGE.

Non descrive l'applicazione Interview.

Non descrive il renderer.

Non descrive il comportamento dei singoli moduli.

Descrive il flusso logico che ogni applicazione costruita sopra il Core dovrà rispettare.

---

# Principio

Il Core di FRINGE non è un Interview Engine.

Il Core è un sistema che:

1. comprende un dominio;
2. costruisce un modello di riferimento;
3. raccoglie evidenze;
4. confronta il modello con le evidenze;
5. produce azioni.

L'intervista è soltanto una possibile strategia di raccolta delle evidenze.

---

# Pipeline

INPUT BUNDLE

↓

REFERENCE MODEL

↓

COLLECTION STRATEGY

↓

OBSERVED EVIDENCE

↓

VISIBILITY ANALYSIS

↓

ACTION STRATEGY

↓

APPLICATION LAYER

---

# 1. Input Bundle

Domanda:

"Quali informazioni possiedo?"

L'Input Bundle contiene tutte le sorgenti disponibili.

Esempi:

- CV
- Job Description
- LinkedIn
- manuali
- PDF
- documentazione tecnica
- feedback
- dati runtime
- trascrizioni
- ecc.

L'Input Bundle non contiene interpretazioni.

Contiene solamente sorgenti.

---

# 2. Reference Model

Domanda:

"Qual è il modello di riferimento?"

Il Reference Model rappresenta l'ipotesi costruita dal sistema riguardo al dominio.

Esempi:

- Role Model
- Knowledge Model
- Negotiation Model
- Safety Model

Il modello non rappresenta una verità assoluta.

È una rappresentazione costruita dal sistema utilizzando le informazioni disponibili.

Per questo motivo ogni Reference Model deve essere validabile.

---

# 3. Collection Strategy

Domanda:

"Come raccolgo le evidenze?"

La Collection Strategy definisce:

- Collection Goals
- execution modes
- follow-up policy
- stop rules
- coverage target
- runtime strategy

L'applicazione Interview implementa questa strategia tramite:

- domande
- follow-up
- pressure probe
- depth check
- recovery

Altre applicazioni potranno utilizzare strumenti differenti.

---

# 4. Observed Evidence

Domanda:

"Che cosa è stato realmente osservato?"

L'Observed Evidence rappresenta esclusivamente fatti osservabili.

Esempi:

- episodi raccontati
- decisioni
- risultati
- contributi personali
- runtime signals
- tempi di risposta
- reazioni alla pressione

L'Observed Evidence non contiene giudizi.

---

# 5. Visibility Analysis

Domanda:

"Quanto del modello è diventato osservabile?"

Il sistema confronta:

Reference Model

con

Observed Evidence.

Produce:

- Visibility Map
- Coverage
- Confidence
- Gap Analysis

Non giudica il candidato.

Misura esclusivamente la visibilità delle evidenze.

---

# 6. Action Strategy

Domanda:

"Cosa faccio adesso?"

L'Action Strategy trasforma la Visibility Analysis in azioni.

Esempi:

- report
- checklist
- coaching
- piano di miglioramento
- prossimi obiettivi
- nuove strategie di raccolta

---

# 7. Application Layer

Il Core termina qui.

Ogni applicazione utilizza gli output del Core secondo il proprio dominio.

Esempi:

Interview

- simulazione
- report
- preparazione

Learning

- test
- esercizi
- percorso didattico

Negotiation

- simulazioni
- obiezioni
- coaching

Assessment

- valutazione
- gap analysis
- piano di crescita

Il Core non conosce queste applicazioni.

Le applicazioni conoscono il Core.

---

# Regole fondamentali

Ogni modulo del Core deve avere una responsabilità unica.

Ogni oggetto prodotto deve poter essere validato.

Ogni decisione deve essere spiegabile.

Ogni evidenza deve essere tracciabile.

Ogni nuovo prodotto deve riutilizzare la pipeline del Core.

---

# Principio finale

Il Core di FRINGE non produce report.

Produce comprensione.

Il report rappresenta soltanto una delle possibili modalità di presentazione di tale comprensione.

Role Model
    ↓
Evidence Collection Plan
    ↓
Initial Coverage State
    ↓
updateCoverageState()
    ↓
Coverage State

Annotazione:

Prima pipeline end-to-end del Core implementata e verificata tramite simulazione (test_collection_pipeline.js).

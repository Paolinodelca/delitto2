# IMAGO Representation Model

**Version:** 1.0
**Status:** CANONICAL
**Owner:** IMAGO Architecture

## Definizione

Una **Representation** è una descrizione computabile, spiegabile, tracciabile e rivedibile di un soggetto, sistema o fenomeno, costruita a partire da osservazioni incomplete.

La Representation non coincide con la realtà. Descrive il miglior modello disponibile in un determinato contesto e momento.

## Pipeline

```text
Reality
  ↓
Observation
  ↓
Evidence
  ↓
Measurement
  ↓
Knowledge
  ↓
Representation
  ↓
Application
  ↓
Decision / Action
```

## Proprietà minime

Una Representation deve poter dichiarare:

- soggetto o fenomeno rappresentato;
- stato corrente;
- contesto e validità;
- evidenze e dipendenze;
- conoscenza elementare e derivata;
- provenienza e lineage;
- incertezza;
- versione;
- storia e transizioni, quando rilevanti.

## Representation persistente

Nel dominio professionale, la **Professional Identity** è una Representation persistente alimentata progressivamente da CV, LinkedIn, interviste, feedback, esperienze, formazione, certificazioni, obiettivi e vincoli.

Il sistema non deve richiedere ogni volta la ricostruzione completa degli stessi dati ancora validi.

## Temporalità ed evoluzione

Il Core non deve assumere che ogni Representation sia statica.

Quando il tempo è rilevante devono restare distinguibili:

- stato corrente;
- stati storici;
- eventi;
- transizioni;
- validità temporale;
- segnali di evoluzione;
- modelli e versioni.

Un aggiornamento non deve cancellare implicitamente il percorso con cui lo stato corrente è stato formato.

## Fenomeni dinamici

Futuri domini potranno introdurre:

- flussi di eventi;
- finestre temporali;
- modelli di transizione;
- anomalie;
- dipendenze dinamiche;
- ricostruzione periodica o continua;
- modelli esplicativi o predittivi.

Queste capacità non sono richieste dalla Beta corrente.

## Scoperta di modelli

Un pattern osservato non diventa automaticamente conoscenza canonica.

```text
Observed Pattern
  ↓
Model Candidate
  ↓
Validation
  ↓
Accepted / Rejected Model
```

Ogni modello candidato o accettato deve preservare provenienza, ambito, versione, stato di validazione, incertezza e condizioni di revisione.

## Domini e applicazioni

Il Core fornisce meccanismi generali.

I domini definiscono osservazioni, misure, ontologie e semantiche specifiche.

Le applicazioni consumano Representation e producono report, simulazioni, dashboard, suggerimenti e piani.

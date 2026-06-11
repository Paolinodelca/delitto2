# FRINGE ENGINE SPINE

## Scopo

Questo file serve a mantenere esplicita la distinzione tra:

1. il prodotto verticale attuale: FRINGE Interview
2. il motore riusabile che sta emergendo sotto
3. i futuri scenari compatibili, in particolare Negotiation

---

## Principio architetturale

NON stiamo costruendo oggi un motore astratto separato dal prodotto.

Stiamo invece usando FRINGE Interview come:

- prodotto reale da portare online
- laboratorio concreto
- sorgente di emersione del core engine

---

## Struttura logica del sistema

### A. CORE EMERGENTE (riusabile)

Elementi che non appartengono solo all’intervista ma a una famiglia più ampia di scenari:

- state machine a fasi
- progressione narrativa
- pressure gradient
- rilevazione segnali osservabili
- deviation flags
- tracking coverage
- phase ledger
- adaptive follow-up
- lettura comportamentale della risposta
- separazione tra:
  - UI language
  - session language
  - input mode
  - scenario type

---

### B. VERTICALE ATTUALE — FRINGE Interview

Elementi specifici del colloquio di selezione:

- CV walkthrough
- role context
- technical gating
- job fit analysis
- recruiter-like recommendation
- evaluation axes attuali:
  - decisione
  - sintesi
  - attriti
- report candidato / recruiter
- Coach Mode / Recruiter Mode

---

### C. VERTICALE FUTURO — Negotiation

Scenario previsto ma non ancora implementato operativamente.

Possibili elementi specifici:

- obiettivo negoziale
- margine / concessioni
- gestione ancoraggi
- pressione relazionale
- riconoscimento cedimenti o irrigidimenti
- mantenimento posizione senza rottura
- lettura della qualità della manovra negoziale

---

## Decisione strategica fissata

Il secondo scenario reale che giustificherà l’estrazione più esplicita del core engine sarà:

## Negotiation

Finché Negotiation non esiste almeno in prima forma concreta, il motore generale NON va estratto in modo prematuro.

---

## Campi già predisposti per il futuro core engine

Questi campi non sono solo “decorativi”, ma sono ponti verso il motore riusabile:

- `scenarioType`
- `inputMode`
- `uiLocale`
- `sessionLocale`
- `inputSource`
- `frictionType`

---

## Regola di sviluppo

Ogni volta che si introduce una nuova logica, chiedersi:

### Questa appartiene a:
- Interview soltanto?
oppure
- al core riusabile?

Se è riusabile, va almeno documentata qui, anche se il codice resta temporaneamente dentro Interview.

---

## Fase attuale

Stato corrente:

- Interview = verticale attivo da chiudere bene
- core engine = emergente ma non ancora separato
- negotiation = scenario futuro prioritario

---

## Prossimo passaggio architetturale corretto

NON estrarre ora un engine astratto completo.

Fare prima:

1. chiusura forte di Interview
2. primo scenario Negotiation
3. confronto Interview vs Negotiation
4. solo allora estrazione del core comune

---

## Funzione di questo file

Questo file esiste per evitare una deriva:

- da motore generale → semplice tool colloqui

e per ricordare che FRINGE Interview è il primo use case, non necessariamente il punto finale.

## Update — 2026-03-30 / Segnali emergenti verso il core engine

Nel verticale Interview sono emersi nuovi segnali che hanno chiara natura riusabile e NON solo specifica del colloquio:

- `questionAlignment`
- `offTopicRisk`
- `motivationForChange`
- `positioning`

### Nota architetturale

Questi segnali non appartengono solo a Interview.

Possono diventare parte del core engine riusabile perché descrivono:

- quanto una risposta resta aderente all’intento della domanda
- quanto la persona si posiziona in modo leggibile
- quanto la motivazione di cambiamento è coerente o reattiva
- quanto la narrativa resta sul punto o deraglia

### Implicazione futura

Questi elementi sono candidati forti a essere riusati anche in scenari futuri come:

- Negotiation
- Coaching
- HR screening
- Assessment dialogici più generali

## Update — 2026-03-31 / Layer di percezione

### Nuovo livello emerso

Oltre a:
- motore
- logica
- valutazione

emerge un layer fondamentale:

## "Perception Layer"

---

### Definizione

Il valore del sistema non è auto-evidente.

Deve essere:
- mostrato
- provocato
- fatto vivere rapidamente

---

### Implicazione

Il sistema non può basarsi solo su:
- qualità analitica
- correttezza valutativa

Deve includere:
- dinamica di tensione
- percezione di pressione
- effetto di scoperta

---

### Elemento chiave identificato

Il vero asset non è la domanda.

È:

→ l'affondo dopo la risposta debole

---

### Impatto futuro (core engine)

Questo pattern è riusabile anche per:

- Negotiation (pressione su posizione)
- Coaching (rottura pattern difensivi)
- Assessment (verifica coerenza narrativa)

---

### Nota

Il valore di FRINGE emerge quando:

→ il sistema NON accetta la prima risposta

Questo comportamento deve diventare:
- centrale
- visibile
- riconoscibile

## Update — 2026-04-01 / Perception Layer operativo

Il "Perception Layer" non riguarda solo marketing e landing.

Riguarda anche la micro-UX interna del prodotto:
- barra alta
- leggibilità stati
- chiarezza del tab attivo
- sensazione di controllo / ordine

Conclusione:
una UI incoerente indebolisce la percezione del motore,
anche quando il motore è valido.

## Update — 2026-04-02 / Perception Layer interno

Nel Perception Layer rientra anche la micro-leggibilità degli elementi di navigazione interna.

### Osservazione
Anche quando la struttura è corretta, piccoli difetti su:
- stato attivo
- badge piano
- lucchetti
- numerazione
- allineamento

indeboliscono la sensazione di prodotto solido.

### Implicazione
La percezione del sistema non dipende solo da:
- landing
- messaging
- report narrative

ma anche da:
- qualità della barra
- immediatezza visiva dello stato corrente
- leggibilità dei segnali di navigazione

### Regola
Quando una UI è già “abbastanza pulita”, il lavoro non è rifarla:
è aumentare chiarezza, contrasto e fiducia.

## Update — 2026-04-10 / Perception Layer e wiring reale

È emersa una nota importante sul Perception Layer:

non basta migliorare:
- analyzer
- report builder
- renderer

se poi la demo / il report visibile non sono alimentati dal risultato aggiornato della pipeline reale.

### Implicazione
Nel Perception Layer rientra anche il wiring corretto tra:
- runtime reale
- report generato
- payload demo
- HTML finale visibile

Se questo collegamento è debole o stale:
- il motore può migliorare
- ma la percezione del valore resta quasi ferma

### Nota pratica
Prima di giudicare il miglioramento percepito del sistema, verificare sempre che:
- la demo HTML stia leggendo un output aggiornato
- non un JSON storico o parzialmente disallineato
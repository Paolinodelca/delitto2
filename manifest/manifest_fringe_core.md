# FRINGE CORE — Manifesto operativo

## Visione
FRINGE è un motore di lettura sotto pressione.

Non misura la verità dei fatti.
Non stabilisce chi ha ragione.
Non assegna punteggi morali.

Osserva come una persona sostiene una posizione quando viene letta, incalzata, interpretata o messa sotto pressione.

L’unità minima del motore non è la “risposta giusta”.
È la relazione tra:

- contesto
- domanda / intervento
- risposta
- lettura emergente

---

## Principio guida
Non esistono risposte giuste.
Esistono risposte che producono letture diverse.

Il motore FRINGE non ricostruisce i fatti.
Osserva la forma dell’esposizione.

---

## Cosa fa il core
Il core FRINGE deve poter essere riusato in applicazioni diverse.

Deve saper gestire:

- una sessione
- una sequenza di domande / risposte
- uno stato progressivo
- una pressione variabile
- una lettura finale multilivello

Il core non deve dipendere dal dominio applicativo.

Non deve conoscere:
- colloqui
- relazioni di coppia
- politica
- incidenti
- scenari specifici

Queste informazioni arrivano da configurazione e contenuti esterni.

---

## Responsabilità del core

### 1. Session orchestration
Gestisce:
- inizio sessione
- avanzamento step
- replay
- chiusura

### 2. State handling
Mantiene uno stato di sessione leggibile dal motore, non morale e non diagnostico.

Esempi:
- pressione
- pattern di risposta
- coerenza
- esposizione
- shift di registro
- segnali di evasività / concretezza / contrazione / espansione

### 3. Question strategy
Seleziona:
- famiglia di domanda
- variante
- eventuale follow-up

Il core non deve generare caos libero.
Deve poter scegliere in modo controllato dentro repertori configurabili.

### 4. Observation
Produce letture della forma espositiva.

Le osservazioni:
- non dichiarano verità
- non chiudono in diagnosi
- non assegnano colpe
- non sostituiscono il giudizio umano

### 5. Report shaping
Restituisce un output finale leggibile e utile per l’applicazione che lo usa.

---

## Architettura logica

Il motore FRINGE è pensato come insieme di moduli separati:

- Session Engine
- State Model
- Question Strategy Engine
- Observation Engine
- Report Renderer

Questi moduli devono restare quanto più possibile indipendenti dai contenuti specifici.

---

## Regola fondamentale di modularità
Le applicazioni specifiche non devono modificare il core se non in casi eccezionali.

Ogni applicazione dovrebbe portare con sé:

- configurazione
- contenuti
- librerie di domande
- rubriche di lettura
- tone of voice
- interfaccia

Il core deve restare esterno.

---

## Domande: filosofia del motore
Le domande non sono solo testo.
Sono interventi cognitivi.

Il motore deve poter lavorare su tre livelli:

1. famiglie di domanda stabili
2. varianti controllate
3. follow-up adattivi selezionati in base alla risposta

Il motore può usare IA per capire quale follow-up serve.
Non deve dipendere da generazione libera incontrollata.

---

## Ruolo dell’IA
Nel core FRINGE l’IA non è un giudice e non è un oracolo.

Può servire per:
- leggere la relazione tra domanda e risposta
- classificare la postura
- scegliere un follow-up o un asse di pressione
- contribuire alla lettura finale

Non deve:
- dichiarare verità fattuali
- produrre diagnosi
- decidere in modo opaco esiti morali

---

## Output del motore
Il core deve poter sostenere output diversi a seconda dell’applicazione, ma con criteri comuni:

- leggibilità
- utilità
- assenza di moralismo
- assenza di tecnicismi inutili
- variazione reale tra traiettorie diverse

---

## Criteri di qualità
Un’integrazione del motore FRINGE è buona se:

- distingue davvero posture diverse
- reagisce alla forma della risposta
- non produce sempre la stessa lettura
- non collassa in verdetti binari
- non dipende da uno scenario unico
- può essere riusata in più prodotti

---

## Prodotti compatibili
Lo stesso core può alimentare:

- demo narrative
- simulazioni di colloquio
- training di negoziazione
- media training
- roleplay professionali
- strumenti HR
- coaching conversazionale

---

## Direzione
Il core FRINGE non è il prodotto finale.
È il motore comune.

Ogni prodotto deve vivere come applicazione distinta sopra il motore.
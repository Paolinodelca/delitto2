# FRINGE INTERVIEW — Manifesto operativo MVP

## Visione
FRINGE INTERVIEW è un’applicazione costruita sul motore FRINGE per allenare una persona a sostenere meglio un colloquio.

Non valuta la verità assoluta.
Non assegna un voto scolastico.
Non si limita a dire “bene / male”.

Legge come il candidato:
- entra nella domanda
- regge la pressione
- concretizza
- si difende
- si espone
- tiene il ruolo
- mantiene una linea credibile

---

## Obiettivo dell’MVP
Costruire una prima versione presentabile, utile e testabile che consenta a un utente di:

1. inserire CV e ruolo target
2. sostenere una simulazione breve di colloquio
3. ricevere una lettura finale utile
4. riprovare con una seconda traiettoria

---

## Utente principale
Persona che sta cercando lavoro e vuole allenarsi a rispondere meglio.

Target iniziali plausibili:
- junior / neolaureati
- persone in transizione lavorativa
- professionisti che si candidano a ruoli specifici
- utenti che vogliono migliorare concretezza e tenuta nelle risposte

---

## Problema che risolve
Molti candidati:
- si preparano in modo generico
- rispondono bene “in testa” ma male sotto pressione
- usano slogan invece di episodi concreti
- non adattano le risposte al ruolo
- non si accorgono di come risultano

FRINGE INTERVIEW serve a rendere visibile:
- come suonano le risposte
- dove perdono forza
- dove risultano vaghe, difensive o scollegate
- dove invece reggono bene

---

## Principio guida
Non esistono risposte perfette in astratto.
Esistono risposte più o meno forti rispetto a un ruolo, una domanda e una pressione.

---

## Architettura prodotto
FRINGE INTERVIEW deve restare un’applicazione sopra il core FRINGE.

Non deve riscrivere il motore.
Deve configurarlo.

I suoi elementi specifici sono:

- profilo candidato
- profilo ruolo
- librerie di domande colloquio
- tipi di follow-up
- rubriche di feedback
- UI specifica

---

## Input dell’utente (MVP)
Per la prima versione, l’utente inserisce:

- nome
- ruolo desiderato
- seniority opzionale
- CV testuale incollato
- job description incollata (opzionale ma fortemente utile)

L’upload PDF può venire dopo.

---

## Parsing della job description
La job description incollata dall’utente deve poter essere trasformata in un profilo strutturato.

Questa funzione è strategica.

### Obiettivo
Passare da testo annuncio grezzo a oggetto leggibile dal motore.

### Modulo previsto
`Role Profile Extractor`

### Output atteso
- titolo ruolo
- seniority implicita
- competenze richieste
- competenze preferite
- responsabilità principali
- contesto del ruolo
- risultati attesi
- soft skill implicite
- linguaggio dominante dell’annuncio

L’utente deve poter correggere o confermare il profilo estratto.

---

## Profilo candidato
Dal CV l’app deve ricavare un profilo sintetico operativo, non una biografia infinita.

### Modulo previsto
`Candidate Profile Builder`

### Output atteso
- sintesi profilo
- esperienza percepita
- competenze ricorrenti
- aree più forti
- aree da mettere sotto stress nel colloquio

---

## Colloquio — filosofia
Il colloquio non deve essere una chat libera.
Deve essere una sequenza progettata.

### Struttura base MVP
- 5 domande principali
- eventuale 1 follow-up mirato su alcune risposte
- report finale

### Famiglie iniziali di domande
- motivazione
- esperienza concreta
- gestione difficoltà / errore
- priorità / trade-off
- aderenza al ruolo
- sintesi finale

---

## Strategia domande
La selezione delle domande deve essere ibrida.

### Livello 1
Domande-madre stabili

### Livello 2
Varianti controllate per tono, pressione, contesto

### Livello 3
Follow-up adattivi, selezionati in base alla risposta

Tipi di follow-up utili:
- concretizza
- stringi
- prova
- trade-off
- contraddizione
- impatto
- ruolo
- sintesi

L’IA non deve scrivere da zero tutta la struttura.
Può aiutare a capire quale follow-up serve.

---

## Output finale MVP
Il report deve essere utile, non spettacolare soltanto.

### Blocco 1 — Come sei risultato
- postura
- registro
- tenuta
- modo di stare nella domanda

### Blocco 2 — Cosa ha funzionato
- concretezza
- pertinenza
- credibilità
- chiarezza
- aderenza al ruolo

### Blocco 3 — Dove perdi forza
- vaghezza
- slogan
- dispersione
- eccesso di difesa
- mancanza di esempi
- poca sintesi

### Blocco 4 — Come rifarei il colloquio
- 3 indicazioni pratiche
- seconda prova o retry

---

## Due modalità future
### Modalità standard
Feedback finale alla fine del colloquio

### Modalità coaching
Micro-feedback domanda per domanda, con possibilità di rifare la risposta

Per l’MVP, la modalità standard è la priorità.

---

## Stato dati e memoria
### MVP iniziale
- nessun account obbligatorio
- sessione singola
- salvataggio minimo o temporaneo

### Evoluzione successiva
- account
- storico sessioni
- confronto tra tentativi
- CV salvati
- ruoli salvati
- report storicizzati

---

## Criteri di successo MVP
Il prodotto MVP è riuscito se:

- un utente riesce a iniziare senza attrito forte
- il colloquio dura poco ma non è banale
- il report finale sembra utile e non generico
- il sistema distingue tra risposte diverse in modo credibile
- l’utente sente che rifare la simulazione ha senso

---

## Monetizzazione plausibile
### Primo fronte
Allenamento colloqui per candidati

### Secondo fronte
Career service / scuole / bootcamp / coaching

### Fronte futuro
Supporto recruiter / screening assistito, senza promettere automazione cieca

---

## Roadmap semplice
### V1
- CV testo
- JD testo
- parser iniziale
- 5 domande
- qualche follow-up
- report finale
- retry

### V1.5
- storico tentativi
- confronto tra sessioni
- feedback step-by-step
- upload PDF

### V2
- account
- dashboard
- recruiter mode
- analisi comparative
- audio

---

## Regola di progetto
FRINGE INTERVIEW non deve divorare il core FRINGE.
Deve essere il primo prodotto serio costruito sopra di esso.
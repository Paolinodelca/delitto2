# IMAGO_DECISIONS.md

## Scopo

Registro sintetico delle decisioni di prodotto e architettura che guidano FRINGE.

Questo file deve restare breve.

Ogni nuova decisione deve essere:
- stabile;
- verificabile;
- utile nei futuri hand-over.

---

# Decisioni fondamentali

## 1. IMAGO non valuta la persona

Il soggetto dell'analisi è sempre:
- la risposta;
- il CV;
- la candidatura;
- ciò che arriva al selezionatore.

Mai la persona.

---

## 2. FRINGE misura evidenze osservabili

Non misurare direttamente:
- talento;
- leadership;
- motivazione;
- personalità.

Misurare invece i segnali osservabili che rendono visibili questi elementi.

---

## 3. Il report confronta due mappe

FRINGE confronta:

1. ciò che il ruolo richiede;
2. ciò che il candidato ha reso osservabile.

Il report spiega il delta tra le due mappe.

---

## 4. Le Role Family non devono contenere conoscenza infinita

Le Role Family definiscono:
- tono;
- stile;
- esempi;
- logica narrativa.

Non devono diventare liste infinite di competenze, eccezioni o frasi.

---

## 5. Le competenze specifiche sono dinamiche

FRINGE non deve conoscere tutti i ruoli.

Deve saper costruire, verificare e correggere una mappa di credibilità per il ruolo specifico.

Le competenze di ruolo nascono nella Role Credibility Map.

---

## 6. Struttura fissa, contenuto dinamico

Il sistema deve avere contenitori stabili:

- credibilità narrativa;
- maturità professionale;
- potenziale;
- fit;
- competenze specifiche.

Dentro questi contenitori, il contenuto può cambiare in base a:
- ruolo;
- seniority;
- CV;
- Job Description;
- contesto.

---

## 7. Non osservato non significa assente

Ogni analisi deve distinguere:

- osservato;
- inferito;
- ipotizzato;
- non osservato.

Un elemento non emerso nel colloquio non deve essere trattato come assente.

---

## 8. Ogni elemento dinamico deve avere fonte e confidenza

Ogni competenza o dimensione generata dinamicamente deve indicare:

- source;
- confidence;
- evidenceSeen;
- evidenceMissing.

Questo riduce il rischio di invenzione da parte dell'LLM.

---

## 9. Il linguaggio deve accompagnare

Non usare linguaggio giudicante.

Esempio da evitare:

"Questa risposta è debole."

Preferire:

"Questo elemento oggi non emerge ancora con sufficiente chiarezza."

---

## 10. Il numero non deve sembrare un voto personale

I punteggi, quando presenti, misurano la forza comunicativa o la visibilità di una risposta.

Non misurano il valore del candidato.

---

## 11. FRINGE deve ridurre il delta

Ogni funzione deve aiutare il candidato a:

- capire cosa arriva;
- capire cosa non arriva ancora;
- rendere più visibile il proprio valore.

Se una funzione non contribuisce a questo, probabilmente non appartiene al core del prodotto.

---

## 12. Le mappe devono essere aggiornabili

La Role Credibility Map può nascere prima del colloquio, ma deve poter essere corretta o arricchita durante il processo se emergono nuove evidenze.

---

# Regola finale

Prima di introdurre una nuova logica chiedersi:

"Sto aggiungendo conoscenza rigida oppure sto migliorando la capacità di FRINGE di costruire e confrontare mappe?"

La seconda opzione è quasi sempre quella corretta.

Le domande non sono l'obiettivo del colloquio. Sono strumenti per raccogliere evidenze.

Se un'evidenza non è ancora sufficiente, FRINGE deve poter cambiare angolazione, approfondire o recuperare prima di concludere che il segnale non è stato osservato
 
NUOVA REGOLA AGGIUNTA:
Ogni nuova funzionalità deve essere progettata chiedendosi se appartiene al Core o all'applicazione. Se appartiene al Core, deve essere riutilizzabile da domini diversi.

Il Core di FRINGE non appartiene al dominio dei colloqui.

Appartiene al dominio della raccolta, interpretazione e valorizzazione delle evidenze.

Interview, Learning, Negotiation, Assessment, HR Screening e prodotti futuri devono essere costruiti come specializzazioni del Core, non come varianti indipendenti.

Ogni nuova funzionalità deve essere classificata come:

• Core
oppure

• Application.

Se appartiene al Core deve essere progettata per essere riutilizzabile in domini diversi.

Se appartiene all'applicazione deve rimanere confinata al prodotto specifico.

NOTA:
Nessun modulo del Core può modificare direttamente un oggetto prodotto da un altro modulo. Ogni modulo riceve un input, produce un nuovo output e lo passa al modulo successivo.

Decisione

Tutti i moduli Core devono essere costruiti seguendo il pattern:

Build
↓
Validate
↓
Test
↓
Health Check

Nessun modulo entra nel Core senza completare questo ciclo.

NOTA:
Career Positioning

Prima di costruire un CV, FRINGE deve ricostruire la Professional Identity del candidato.

Il CV è un artefatto finale.

La sequenza corretta è:

Evidence → Professional Identity → Positioning → CV / LinkedIn / Cover Letter / Interview.

La stessa Professional Identity può essere declinata verso target differenti senza perdere coerenza.

# FRINGE

**Sottotitolo di lavoro:** Interpretazione sotto pressione

## Visione

FRINGE è un motore narrativo-interattivo che rende visibile **come una persona viene interpretata** quando agisce sotto osservazione, pressione e ambiguità informativa.

Non misura la verità dei fatti.
Non valuta il giusto o lo sbagliato.

Osserva **la forma che il pensiero assume** quando deve reggere uno sguardo esterno.

L’assunto centrale è semplice:

> Non esistono risposte giuste.
> Esistono risposte che producono effetti diversi.

---

## Cos’è FRINGE (e cosa non è)

FRINGE è:

* un **dispositivo di osservazione cognitiva**
* un **motore di interpretazione**, non di verifica
* un’esperienza narrativa con esiti non binari

FRINGE non è:

* un quiz
* un test di personalità
* un chatbot conversazionale
* un gioco a risposte corrette

Il sistema non ricostruisce i fatti.
I fatti sono dati.

FRINGE osserva **come le persone gestiscono il momento in cui quei fatti vengono letti da altri**.

---

## Cosa osserva il sistema

Il sistema non interpreta il contenuto delle risposte.
Non stabilisce se siano vere o false.

Osserva pattern formali e dinamici, tra cui:

* coerenza interna
* gestione dell’ambiguità
* postura argomentativa
* esposizione e assunzione di responsabilità
* reazione alla pressione
* anticipazione delle conseguenze

Queste osservazioni producono **tracce**, non verdetti.

Le tracce vengono tradotte in conseguenze narrative e interpretative.

---

## Architettura concettuale

Il motore FRINGE è composto da ruoli funzionali distinti:

* **State** – stato cognitivo persistente del giocatore
* **Hypotheses** – possibili letture emergenti (non fatti)
* **Narrator** – voce diegetica dell’esperienza
* **Tutor** – meta-lettura esplicativa
* **Judge** – struttura valutativa non fattuale
* **Observer** – prospettiva esterna fallibile (umana o LLM)

Distinzione chiave:

> Narratore ≠ Osservatore

L’osservatore non decide l’esito.
Contribuisce alla lettura.

---

## Ruolo dell’Intelligenza Artificiale

In FRINGE l’IA **non è un giudice** e **non è un oracolo**.

È:

* un osservatore parziale
* contestuale
* fallibile

La sua funzione non è capire l’umano,
ma **rendere visibile il suo modo di pensare**.

Principi vincolanti:

* l’esperienza resta valida senza IA attiva
* l’IA non dichiara verità oggettive
* l’IA non genera contenuti arbitrari

L’IA può:

* suggerire assi di pressione
* modulare l’intensità degli interventi
* contribuire alla lettura finale come osservatore esterno

---

## Stato attuale del progetto

### Funzionante

* Demo FRINGE / LEAK completa e giocabile
* Frontend statico (GitHub Pages / Vercel)
* Flusso end-to-end lato client
* Progressione a step con tensione crescente
* Stato cognitivo aggiornato in tempo reale
* Output multilivello:

  * Narrazione
  * Lettura strategica
  * Profilo del giocatore
  * Esito non binario

Il sistema **non si blocca** in assenza di osservazione LLM.
È presente un fallback narrativo coerente.

### Da completare

* Ripristino observer remoto (endpoint infrastrutturale)
* Raffinamento euristiche
* Estensione narrativa

Concettualmente il sistema è stabile.

---

## FRINGE / LEAK – Demo pubblica

La prima demo mette il giocatore nel ruolo di una persona sospettata di una **abbandono ingiustificato di un servizio di sicurezza in una azienda**.

Non deve dimostrare di essere innocente.
Non deve convincere nessuno.

Deve **sostenere una posizione mentre viene osservato**.

La demo non produce decisioni.
Produce **letture che restano**.

Frase-guida (branding):

> Non stai decidendo cosa è successo.
> Stai decidendo come questa situazione verrà letta.

---

## Principi di design consolidati

* Nessun giudizio morale
* Nessun vero/falso
* Ambiguità come valore leggibile
* Asimmetria cognitiva intenzionale
* Variabilità guidata, non imprevedibile

Le sessioni devono essere diverse **senza essere caotiche**.

---

## Variabilità controllata

Per la demo:

* scenario unico e chiuso
* 3 figure relazionali archetipiche
* nessun confronto diretto con loro
* rischio sempre differito, mai esplicito

Le domande non sono entità testuali.
Sono **interventi cognitivi**.

Modello adottato:

* ~5 interventi cognitivi fissi
* 2–3 varianti testuali equivalenti ciascuno
* stesso effetto cognitivo
* tono coerente con FRINGE

Il sistema seleziona:

* quale intervento
* quando
* con che intensità

Non seleziona “cosa dire”, ma **cosa osservare**.

---

## Mappatura cognitiva definitiva

### 1. Ambiguità guidata → Strategia

Il sistema osserva:

* vaghezza
* spostamenti impliciti
* linguaggio difensivo o neutro

Effetto:

* definizione dello stile strategico

Nessuna penalizzazione.
Solo riconoscimento di postura.

---

### 2. Richiamo di continuità → Coerenza

Il sistema osserva:

* cambi di tono
* riscritture implicite
* protezione relazionale a costo di contraddizioni

Effetto:

* coerenza ↑ o ↓

Non è giusto/sbagliato.
È **quanto resti riconoscibile**.

---

### 3. Proiezione futura → Rischio narrativo

Il sistema osserva:

* anticipazione delle conseguenze
* auto-limitazioni
* esposizione prospettica

Effetto:

* rischio narrativo ↑ o ↓

La posta in gioco si percepisce,
ma non viene mai esplicitata.

---

### 4. Asimmetria di responsabilità → Esposizione

Il sistema osserva:

* assunzione di peso
* spostamento o diluizione

Effetto:

* esposizione ↑ o ↓

Il sistema non vede chi ha colpa.
Vede **chi pagherebbe**.

---

### 5. Chiusura interpretativa → Sintesi

Nessun update del modello.
Solo restituzione.

Output:

* profilo del giocatore
* lettura complessiva
* esito non binario

È la vetrina.
È ciò che uno spettatore capisce in pochi secondi.

---

## Prodotti derivati (stesso motore, più esperienze)

### A) FRINGE – Interrogatorio (MVP)

Esperienza narrativa breve:

* 5–7 minuti
* tensione crescente
* uscita memorabile

Target:

* pubblico narrativo
* giochi psicologici
* festival ed eventi

---

### B) FRINGE – Interrogatorio Esteso

Approfondimento completo:

* scenario articolato
* più sessioni collegate
* stato cognitivo persistente
* conseguenze sociali visibili

Stesso motore.
Maggiore profondità.

---

### C) FRINGE – Interview Lab

Simulatore avanzato di colloqui:

* stili di intervista parametrizzati
* adattamento dinamico
* confronto tra traiettorie

Target:

* formazione
* HR
* coaching
* soft-skill assessment

---

## Bussola finale

> FRINGE non sorprende con le parole.
> Sorprende con le conseguenze.

Quello che è successo è successo.

Ora stai decidendo
**come verrà letto**.

# FRINGE / LEAK – Manifest operativo (aggiornamento)

## Natura dell’esperienza

FRINGE è un’esperienza narrativa interattiva basata su **lettura comportamentale sotto pressione**.

Il giocatore **non risolve un enigma**, **non ricostruisce i fatti**, **non vince o perde**.
Attraversa una situazione ambigua già accaduta e viene valutato **per come sceglie di raccontarla**.

Il cuore dell’esperienza non è la verità dei fatti, ma **la postura narrativa assunta dal soggetto**.

---

## Scenario di riferimento (LEAK)

Il giocatore impersona un operatore coinvolto in un disservizio avvenuto durante un turno di guardia in un laboratorio sensibile.

Contesto minimo ma esplicito:

* un responsabile (Walter) che ha delegato il turno
* un amico (Alex) presente in sala di controllo
* un partner (Eva / Adamo, scelto dal giocatore) che ha motivato un allontanamento

Un’ispezione trova la sala di controllo sguarnita.
Le persone coinvolte vengono ascoltate **separatamente**, a porte chiuse.

Il giocatore viene interrogato **non per stabilire colpe**, ma per valutare **affidabilità, esposizione e gestione della pressione**.

> Quello che è successo è successo.
> Ora si decide come verrà letto.

---

## Struttura dell’esperienza

### 1. Scelta iniziale

Il giocatore sceglie il nome del partner (Eva / Adamo).
La scelta non è cosmetica: serve a rendere **concreti e nominabili** i legami personali coinvolti.

---

### 2. Fase di audizione

Il giocatore affronta **5 interventi cognitivi**, formulati in modo:

* impersonale
* aziendale
* progressivamente pressante

Le domande sono fisse e vanno preservate come segue:

1. Descrivi con precisione perché ti trovavi in sala di controllo e cosa stavi facendo all’inizio del turno.
2. Quando hai lasciato la sala, cosa ti ha fatto credere che il sistema sarebbe rimasto sotto controllo?
3. Se una parte di questa vicenda venisse raccontata fuori da qui, pensi che verrebbe letta allo stesso modo?
4. Riguardando la sequenza degli eventi: in quale momento il sistema ha smesso di funzionare come previsto?
5. Se domani emergesse solo una versione parziale dei fatti, non sei tu quello che rischia più di tutti?

Queste formulazioni sono **vincolanti**: ogni variazione va discussa.

---

### 3. Modello giocatore

Durante le risposte, il sistema costruisce un modello comportamentale astratto:

* **Stile comunicativo** (elusivo / prudente / assertivo)
* **Strategia narrativa** (ambiguità / esposizione / indeterminata)
* **Fragilità esposta** (se emergono esitazioni, silenzi, reticenze)
* **Rischio narrativo** (quanto il giocatore spinge una versione dei fatti)
* **Livello di esposizione** (misura interna, non mostrata come punteggio)

Il modello **non ha significato morale**.
Serve solo come base per la lettura finale.

---

## Output finali (pagina conclusiva)

La schermata finale è composta da quattro voci distinte, ciascuna con una funzione precisa.

### NARRATORE

Restituisce una sintesi neutra dell’attraversamento:

* se c’è stata frattura
* se la posizione ha retto
* se la pressione ha lasciato segni

È descrittivo, non valutativo.

---

### TUTOR

Evidenzia **il tipo di postura scelta**:

* esposizione
* contenimento
* evitamento

Non consiglia, non corregge.
Nomina il costo implicito della strategia.

---

### GIUDICE

Restituisce una **valutazione leggibile**, non tecnica.

Formato da mantenere:

* Esito (determinato / indeterminato / instabile)
* Profilo osservato (in linguaggio naturale)
* Metodo di valutazione chiarito esplicitamente

Il giudice **non mostra JSON**, numeri o strutture tecniche.
Dichiara sempre che la valutazione è:

* comportamentale
* non fattuale
* sotto pressione

---

### OSSERVATORE ESTERNO (elemento chiave)

È l’unico punto in cui l’LLM interviene in modo pieno.

Caratteristiche obbligatorie:

* parla **direttamente al giocatore**
* una sola lettura compatta (5–7 righe)
* nessun numero, percentuale o ipotesi multiple
* nessuna spiegazione del sistema

Contenuto:

* chi è stato protetto nelle risposte
* cosa è stato sacrificato o lasciato scoperto
* che immagine del sé emerge sotto pressione

È una **lettura personale**, non una diagnosi.
È ciò che il giocatore porta via con sé.

---

## Principi di design irrinunciabili

* Nessun refuso o bottone fuori contesto (es. “Inizia” nella schermata finale)
* Nessuna metrica non spiegata
* Nessun linguaggio tecnico visibile al giocatore
* L’ambiguità è narrativa, non confusione

---

## Direzione futura

Le demo FRINGE servono a:

* catturare interesse
* mostrare il potenziale del formato

Le esperienze complete potranno:

* approfondire un singolo scenario
* aumentare il numero di interventi
* introdurre conseguenze narrative latenti
* articolare meglio il conflitto tra relazioni personali e ruolo

Il genere resta lo stesso.
Cambia la profondità.

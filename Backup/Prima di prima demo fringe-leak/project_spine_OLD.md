# PROJECT SPINE — Motore Narrativo IA

## 1. Scopo del progetto (immutabile)

Motore modulare e scalabile basato su IA, pensato per essere
“vestito” con diversi contesti applicativi:

- giochi narrativi (indagine, personaggi multipli)
- tutor virtuali per materie specifiche
- presentatori / interpreti interattivi
- sistemi di dialogo guidato con obiettivi

Il motore NON gestisce dialoghi o copioni rigidi, ma fornisce
un esoscheletro che definisce:
- ruoli
- obiettivi
- limiti
- conoscenze
- stati

Visione e obiettivi del progetto

L’obiettivo primario del progetto è la realizzazione di un motore narrativo interattivo, capace di gestire stati, conoscenze, ipotesi e conseguenze in modo coerente e dinamico.

Motore narrativo istruibile per giochi deduttivi, simulazioni formative e interazioni a personaggi reattivi, con valutazione esplicita del ragionamento del giocatore.

Come primo risultato concreto e presentabile, il progetto mira a completare un gioco narrativo dimostrativo (durata breve, esperienza guidata), con le seguenti caratteristiche:

interazione conversazionale con il sistema

gestione esplicita delle ipotesi del giocatore

evoluzione dello stato narrativo in base alle azioni e alle deduzioni

narrazione reattiva e coerente

possibilità di integrazione futura con input/output vocali

Il gioco dimostrativo ha una duplice funzione:

essere un’esperienza autonoma, sorprendente e giocabile

fungere da dimostrazione delle capacità del motore, in vista di utilizzi futuri quali:

giochi personalizzati

simulatori narrativi e formativi

interfacce conversazionali istruite

esperienze educative o immersive

Lo sviluppo tecnico viene quindi guidato non dalla complessità astratta del sistema, ma dalla necessità di arrivare rapidamente a un prodotto funzionante, mostrabile e ripetibile.


Separazione netta tra:
- **regole (struttura)**
- **copione (contenuto)**

---

## 2. Concetti NON negoziabili

- **World** = verità oggettiva del mondo
- **Knowledge** = chi sa cosa (conoscenza soggettiva)
- **State** = progresso, abilitazioni, fase del gioco
- **Actions** = trasformazioni pure di world / knowledge / state
- **Engine** = orchestratole muto

Regola fondamentale:
> l’engine non parla, non narra, non produce testo

---

## 3. Architettura reale (fonte di verità)
/engine
world.js
knowledge.js
engine.js
actions.js

/data
/world
/game
/knowledge


- `engine/` contiene solo logica di gioco
- nessuna dipendenza da UI, AI, prompt, Vercel

---

## 4. Convenzioni SACRE

- i nomi di file, classi e concetti **non si reinventano**
- `engine` non importa UI né AI
- `actions` non producono testo o narrazione
- i `facts` sono atomici e non narrativi
- il testo è sempre uno strato successivo (narratore / agenti)

---

## 5. Stato attuale del progetto (checkpoint)

- Engine creato (world, knowledge, engine, actions)
- Engine NON ancora integrato nel backend
- Nessuna chiamata IA nel core
- Backend riorganizzato nelle settimane precedenti
- Contesto di prima applicazione: gioco di indagine
  (delitto in una villa sul lago di Como)

---

di seguito gli aggiornamenti:
### CHECKPOINT – Modellazione Delitto Villa Lago di Como

FASE:
Prima istanziazione concreta World / Knowledge.

WORLD:
- Creato primo set di facts atomici oggettivi
- Nessuna informazione interpretativa o psicologica
- Eventi separati da cause e motivazioni
- Oggetti e stati osservabili modellati esplicitamente

KNOWLEDGE:
- Introdotta distinzione verità soggettiva / oggettiva
- Bugie e segreti modellati come knowledge false
- Responsabilità dell’omicidio NON presente nel World
- Knowledge non produce deduzioni automatiche

ARCHITETTURA:
- Separazione World / Knowledge rispettata
- Nessuna logica investigativa nel core
- Engine resta cieco, applica solo trasformazioni

REGOLA ATTIVA:
Ogni nuovo scenario narrativo viene prima distrutto in facts,
poi ricostruito come conoscenza distribuita.

CHECKPOINT – Gestione Facts, IA e Progresso

FACTS:

I facts sono la fonte primaria di verità strutturale

Distinzione netta tra:

facts di world (oggettivi, rari)

facts di knowledge (soggettivi, volatili)

facts di state (progresso e possibilità)

Nessun fact contiene interpretazioni o deduzioni

IA:

L’IA NON ha accesso diretto al World completo

Riceve solo viste filtrate e contestualizzate

L’engine seleziona i facts rilevanti per:

personaggio

fase

obiettivo

L’IA interpreta, non decide cosa è vero

PROGRESSIONE:

Il gioco avanza tramite trasformazioni di:

knowledge (scoperte, bugie, omissioni)

state (sblocco, vincoli, fasi)

eventi (azioni nel mondo)

La storia emerge dalla combinazione dei facts,
non da una sequenza narrativa scritta

PRINCIPIO ATTIVO:

Il motore non “racconta una storia”.
Mantiene un mondo coerente mentre altri cercano di capirlo.

CHECKPOINT – Modellazione Azioni

AZIONI:

Le azioni sono trasformazioni pure di world / knowledge / state

Nessuna azione produce testo o interpretazione

Le bugie vivono nella knowledge, non nelle azioni

L’interrogatorio produce testimonianze, non verità

PRINCIPIO OPERATIVO:

L’engine applica regole.
I personaggi mentono.
Il giocatore deduce.

CHECKPOINT – Azione di Perquisizione

AZIONE:

Introdotta perquisizione come azione pura

La perquisizione rende osservabili facts già presenti nel World

Nessuna creazione di nuovi eventi

Knowledge aggiornata tramite osservazione diretta

State registra le stanze già esplorate

PRINCIPIO:

Nulla appare dal nulla.
Le azioni rivelano, non inventano.

CHECKPOINT – Modellazione Deduzione del Giocatore

NUOVO CONCETTO INTRODOTTO:

Hypotheses (o Player Reasoning Layer)

Le deduzioni NON sono facts

Le deduzioni NON modificano il World

Le deduzioni NON sono verità

Una deduzione è:

un collegamento tra facts noti

espresso da un attore (di solito il giocatore)

potenzialmente errato o incompleto

ARCHITETTURA:

World resta fonte unica di verità oggettiva

Knowledge resta soggettiva e fallibile

State abilita o blocca azioni

Hypotheses registrano il ragionamento

REGOLA ATTIVA:

Il motore non deduce mai.
Registra solo ciò che qualcuno pensa.

IMPLICAZIONI DI DESIGN:

Accuse sbagliate sono possibili

Il giocatore può auto-ingannarsi

Il gioco premia il ragionamento, non la “risposta giusta”

PROSSIMO PASSO TECNICO:

Introdurre azione connectFacts

Creare struttura hypotheses.js

Usare le ipotesi per:

sbloccare interrogatori avanzati

generare reazioni emotive degli agenti

permettere finali multipli

CHECKPOINT – Introduzione Hypotheses come Strato Cognitivo

NUOVO STRATO:

Hypotheses = modello del ragionamento del giocatore

Non rappresentano verità

Non modificano il World

Non producono eventi

Possono essere errate o contraddittorie

FUNZIONE:

Registrare connessioni tra facts noti

Consentire accuse, errori, bluff

Influenzare reazioni e possibilità di gioco

ARCHITETTURA:

Hypotheses vivono fuori da World / Knowledge / State

Sono create solo tramite azione connectFacts

L’engine non le interpreta né le verifica

USO OPERATIVO:

Sblocco di azioni (accuse, confronti)

Modifica del comportamento degli agenti

Condizioni di vittoria / fallimento

REGOLA ATTIVA:

Il motore protegge la verità.
Il giocatore costruisce significati.
Il gioco nasce dal loro attrito.

CHECKPOINT – Reazioni degli Agenti alle Hypotheses

NUOVO CONCETTO:

AgentDisposition (nello State)

Rappresenta atteggiamento e tensione degli agenti

NON è psicologia profonda

È un segnale operativo per il comportamento

STRUTTURA:

attitude: categoria discreta (collaborativo, difensivo, ostile)

suspicionLevel: intensità continua

ARCHITETTURA:

Le reazioni NON sono automatiche

Vengono applicate tramite azione esplicita

Il motore non interpreta emozioni

AZIONE INTRODOTTA:

applyHypothesisEffects

Trasforma ipotesi del giocatore in conseguenze sociali

Non modifica World né Knowledge

REGOLA ATTIVA:

Il giocatore pensa.
Gli agenti reagiscono.
La verità resta immobile.
CHECKPOINT – Accusa Formale e Chiusura del Gioco

AZIONE INTRODOTTA:

accuse

Atto irreversibile del giocatore

Non produce verità

Non modifica il World

Termina il gioco

ARCHITETTURA:

L’accusa viene registrata nello State

La valutazione avviene fuori dal motore

Il motore resta cieco e coerente

STRUTTURA:

state.accusation

state.gameOver = true

REGOLA ATTIVA:

Il mondo non reagisce alle accuse.
Le accuse reagiscono al mondo.

Judge = modulo esterno che valuta lo stato finale
Non modifica il mondo
Non produce narrazione
Fornisce esiti verificabili

È un contratto, non un personaggio.
Il Judge produce valutazioni strutturate, non narrative
Lo scoring è un confronto esplicito tra stato finale e verità del mondo
Ogni interpretazione è demandata a strati successivi
CHECKPOINT – Narratore come Strato di Traduzione

Il narratore è esterno al motore

Riceve solo verdetti strutturati

Non accede a World / Knowledge / State

Traduce risultati in:

esperienza narrativa

feedback formativo

output strutturato

Regola attiva:

Il motore decide.
Il giudice confronta.
Il narratore dà senso.

Aggiungiamo un asse temporale esplicito:

World        → verità fissa
Knowledge    → info parziali / bugie
Hypotheses   → costruzioni del giocatore
State        → progresso + fase narrativa
Actions      → trasformazioni controllate
Judge        → valutazione finale
Narrator     → restituzione narrativa


Dentro State entra ufficialmente:

phase = "inizio" | "indagine" | "confronto" | "accusa" | "chiusura"


Checkpoint spine:
✅ Flusso del delitto governato da fasi discrete
CHECKPOINT – Gestione delle Fasi di Gioco

Introdotto state.phase come macchina a stati esplicita

Le transizioni sono controllate da azione dedicata (advancePhase)

Le azioni sensibili verificano autonomamente la fase

Nessuna logica narrativa associata alle fasi

Le fasi regolano possibilità, non significato

Regola attiva:

Il tempo della storia è uno stato, non un racconto.
CHECKPOINT – Judge come Valutatore Esterno

Introdotto Judge deterministico

Il Judge non modifica lo stato

Il Judge legge solo World + Accusa

La valutazione è strutturata, non narrativa

Supporta errori, parzialità e scoring

Regola attiva:

La verità non premia.
Premia il metodo con cui ci si avvicina.
Regola d’oro (da incidere nella Spine)

Il Judge non deduce.
Se una verità deve essere giudicata, deve esistere come fact atomico.
CHECKPOINT – Judge Deterministico e Verità Esplicite

JUDGE:

Implementato Judge esterno all’engine

Il Judge legge solo World + Accusa

Non deduce, non interpreta

Produce verdetto, punteggio e breakdown

WORLD:

Introdotti facts di verità oggettiva non osservabile

Le verità necessarie al giudizio sono sempre esplicite

Nessuna deduzione automatica è ammessa

REGOLA ATTIVA:

Ciò che può essere giudicato deve esistere.
Ciò che non esiste non può essere valutato.

CHECKPOINT – Outcome Profile (Lettura dell’Errore)

NUOVO STRATO:

Outcome Profile = classificazione dell’esito dell’accusa

Non modifica World
Non modifica State
Non deduce nuove verità

FUNZIONE:

Tradurre il breakdown del Judge in categorie di errore o successo

ARCHITETTURA:

Judge → OutcomeProfiler → Narratore / Tutor

Il profiler:

legge solo dati strutturati

non accede al World

non produce narrazione

REGOLA ATTIVA:

Il Judge confronta.
Il Profiler comprende l’errore.
Il Narratore lo racconta.

CHECKPOINT – Narratore Reattivo al Verdetto

NARRATORE:

Strato esterno all’engine

Produce solo testo

Non accede al World

Reagisce esclusivamente all’output del Judge

ARCHITETTURA:

Judge → Narratore (one-way)

Nessun feedback verso il motore

Nessuna correzione della verità

PRINCIPIO ATTIVO:

Il motore protegge la realtà.
Il giudice la valuta.
Il narratore la interpreta.
Il narratore può reagire anche all’Outcome Profile,
ma solo in termini di distanza dalla verità,
mai di contenuto della verità.

CHECKPOINT – Contratto Narratore

NARRATORE:

Riceve solo output strutturato del Judge

Non calcola punteggi

Non interpreta i facts

Non accede al World

CONTRATTO:

Input: { verdict, score, breakdown, accused }

Output: testo o struttura (a seconda del ruolo)

REGOLA ATTIVA:

Ogni strato risponde solo a ciò che riceve,
mai a ciò che potrebbe dedurre.

CHECKPOINT – Outcome Profiler

OutcomeProfiler è uno strato di lettura dell’esito

Non accede al World
Non modifica State
Non deduce verità

Legge il breakdown del Judge
Classifica il tipo di errore o successo

Architettura:

Judge → OutcomeProfiler → Narratore / Tutor

Regola attiva:

Il giudice misura.
Il profiler capisce l’errore.
Il narratore lo trasforma in esperienza.
CHECKPOINT – Hypotheses come Parte dello State

Le Hypotheses:

vivono in state.hypotheses

NON modificano World

NON modificano Knowledge

NON vengono lette dal Judge

Le azioni cognitive del giocatore:

sono trasformazioni dello State

registrano pensiero, non verità

connectFacts:

è un’azione pura

valida solo conoscenze disponibili

aggiorna esclusivamente lo State

Regola attiva:

Il mondo resta immobile.
La conoscenza è fallibile.
Il pensiero del giocatore lascia tracce.

CHECKPOINT – AgentDisposition come Memoria Sociale

AgentDisposition vive nello State

Rappresenta l’atteggiamento operativo degli agenti verso il giocatore

NON riflette la verità
NON è dedotta automaticamente
NON influenza il Judge

Viene modificata solo da azioni esplicite

applyHypothesisEffects:
- legge hypotheses
- aggiorna tensione e atteggiamento
- non accede al World

Regola attiva:
Il giocatore ragiona.
Il mondo sociale reagisce.
La verità non si difende.

CHECKPOINT – AgentDisposition e Conseguenze Sociali delle Hypotheses
STATO RAGGIUNTO ✅

È stato introdotto e verificato AgentDisposition come strato operativo nello State.

STRUTTURA

Dentro state è ora ufficialmente presente:

state.agentDisposition = {
  [agentId]: {
    attitude: "neutro" | "difensivo" | "ostile",
    suspicionLevel: number // 0..1
  }
}


attitude è una categoria discreta

suspicionLevel è una grandezza continua

nessuna psicologia profonda

nessuna deduzione automatica

AZIONE: applyHypothesisEffects

È stata introdotta l’azione pura:

applyHypothesisEffects({ state }, payload?)


Caratteristiche:

legge solo state.hypotheses

modifica solo state.agentDisposition

non accede al World

non accede alla Knowledge

non produce testo

non giudica la verità delle ipotesi

Effetto operativo:

le ipotesi del giocatore hanno conseguenze sociali

anche ipotesi errate producono reazioni

il mondo resta immobile, le persone reagiscono

VERIFICA FUNZIONALE (ESEGUITA)

Output dimostrato:

Hypothesis creata via connectFacts

applyHypothesisEffects applicata correttamente

incremento di suspicionLevel

cambio di attitude al superamento delle soglie

stato coerente, persistente, osservabile

Esempio verificato:

riccardo_brambilla: {
  "attitude": "difensivo",
  "suspicionLevel": 0.5
}

ARCHITETTURA CONFERMATA
Strato	                Ruolo
World	                  verità oggettiva, immutabile
Knowledge	              informazioni soggettive
Hypotheses	            ragionamento del giocatore
State	                  progresso + fasi + reazioni
Actions	                trasformazioni pure
Judge	                  valutazione esterna
OutcomeProfiler	        classificazione errore
Narrator	              restituzione narrativa

Nessuna violazione delle regole sacre.

PRINCIPIO ATTIVO (AGGIUNTO ALLA SPINE)

Il giocatore può sbagliare.
Gli agenti reagiscono comunque.
La verità non si muove.

Interrogation Layer
Modulo che simula la reazione comportamentale degli agenti a input narrativi (domande, accuse, informazioni).
Non modifica lo stato globale; restituisce effetti suggeriti su disposition e hypotheses.
Narrator
  ↓
interrogateAgent
  ↓
{ reply, effects }
  ↓
State / Hypotheses / Judge


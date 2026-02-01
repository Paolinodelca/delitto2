PROJECT SPINE — Motore Narrativo IA

Versione simmetrica e generalizzata

1. Scopo del progetto (immutabile)

Realizzare un motore narrativo modulare e scalabile, basato su IA, progettato per essere “vestito” con diversi contesti applicativi, tra cui:

giochi narrativi deduttivi

simulazioni formative (sicurezza, etica, decision making)

esperienze di dialogo guidato con obiettivi

tutor interattivi basati su ragionamento esplicito

Il motore non gestisce dialoghi né copioni.
Fornisce un esoscheletro logico che definisce:

entità e ruoli

obiettivi e vincoli

conoscenze distribuite

stato del mondo

trasformazioni possibili

La narrazione, il linguaggio e la messa in scena sono strati esterni.

2. Visione

L’obiettivo primario è costruire un sistema capace di:

mantenere una realtà coerente

registrare conoscenze fallibili

tracciare ragionamenti espliciti

produrre esiti valutabili, non narrativi

Il motore non cerca la “storia giusta”.
Protegge la struttura mentre altri cercano di darle senso.

3. Principi NON negoziabili

Il motore non narra

Il motore non deduce

Il motore non interpreta

Il motore non giudica

Il motore:

applica regole

registra trasformazioni

mantiene coerenza

Ogni significato emerge fuori dal core.

4. Ontologia fondamentale
World

Verità oggettiva del mondo.

composta da facts atomici

immutabile salvo eventi espliciti

può contenere fatti osservabili o non osservabili

non contiene interpretazioni

non contiene colpe, intenzioni o deduzioni

Se qualcosa deve essere giudicata, deve esistere qui come fact.

Knowledge

Conoscenza soggettiva degli attori.

parziale

fallibile

può contenere errori e bugie

non deduce automaticamente

non modifica il World

La Knowledge descrive chi sa cosa, non cosa è vero.

Hypotheses

Strato cognitivo del ragionamento.

rappresenta connessioni ipotizzate tra facts noti

può essere errato o contraddittorio

non è verità

non modifica World né Knowledge

Le Hypotheses sono tracce di pensiero, non risultati.

Vivono nello State.

State

Stato operativo del sistema.

Contiene:

fase di gioco

abilitazioni e vincoli

progressione

tracce cognitive (hypotheses)

memoria sociale (reazioni degli agenti)

posizione formale finale del giocatore

Lo State governa cosa è possibile, non cosa è vero.

5. Architettura reale (fonte di verità)

/engine

world.js

knowledge.js

state.js

actions.js

engine.js

/data

world

knowledge

game

Regole:

engine/ contiene solo logica

nessuna dipendenza da UI, IA, prompt o backend

nessun testo nel core

6. Actions (trasformazioni pure)

Le azioni sono funzioni pure che trasformano:

World

Knowledge

State

Caratteristiche:

nessuna narrazione

nessuna deduzione

nessuna interpretazione

nessuna generazione di fatti non giustificati

Le azioni rivelano o registrano, non inventano.

7. Gestione del tempo e delle fasi

Il tempo narrativo è modellato come stato esplicito.

Dentro State:

state.phase =
  "inizio" |
  "indagine" |
  "confronto" |
  "posizione" |
  "chiusura"


Le fasi:

regolano l’accesso alle azioni

non producono significato

non contengono narrazione

8. Interazioni e Interrogation Layer

Le interazioni narrative (domande, confronti, risposte):

sono simulate da uno strato esterno (Interrogation Layer)

producono effetti suggeriti

non modificano direttamente lo stato

Pipeline:

Narrator
↓
Interrogation Layer
↓
{ reply, effects }
↓
Interaction Resolver
↓
Actions → State / Hypotheses / AgentDisposition

9. AgentDisposition (memoria sociale)

AgentDisposition vive nello State.

Rappresenta:

atteggiamento operativo degli agenti

livello di tensione o sospetto

Struttura:

state.agentDisposition[agentId] = {
  attitude: "collaborativo" | "difensivo" | "ostile",
  suspicionLevel: number // 0..1
}


Caratteristiche:

non riflette la verità

non è dedotta automaticamente

non influenza il Judge

Le reazioni sociali sono conseguenze del ragionamento, non del vero.

10. Posizione formale del giocatore

Il giocatore, alla fine, assume una posizione formale.

Non è necessariamente un’accusa.

Esempi:

attribuzione di colpa

difesa

scarico di responsabilità

dichiarazione di indecidibilità

accusa sistemica

Dentro State:

state.formalPosition = {
  type,
  target,
  arguments
}

state.gameOver = true


Il motore non valuta questa posizione.

11. Judge (valutatore esterno)

Il Judge è un modulo deterministico esterno.

Caratteristiche:

legge solo World + posizione formale

non accede a Knowledge, Hypotheses o AgentDisposition

non modifica lo stato

non narra

Il Judge confronta, non deduce.

Tipi di valutazione supportati

A seconda del caso, il Judge può produrre:

colpa fondata / infondata

posizione epistemicamente coerente / incoerente

attribuzione corretta / errata della responsabilità

esito indecidibile strutturato

Non tutti i casi hanno una “verità colpevole”.

12. Outcome Profiler

Strato di lettura dell’esito.

legge l’output del Judge

non accede al World

non deduce verità

classifica il tipo di errore o successo

Serve a:

analisi formativa

feedback

adattamento narrativo

13. Narratore

Strato finale.

produce solo testo

non accede a World, Knowledge o State

reagisce solo a:

verdetto

score

outcome profile

Il narratore non corregge la realtà.
Dà senso all’esito.

14. Regola d’oro (incisa nella spine)

Il mondo resta immobile.
La conoscenza è fallibile.
Il giocatore pensa.
Le persone reagiscono.
Il giudice confronta.
Il narratore racconta.

15. Implicazione chiave

Questo motore non è un motore di storie.
È un motore di attribuzione di significato sotto vincoli.

Funziona per:

delitti

fughe di informazioni

errori sistemici

decisioni ambigue

responsabilità senza colpa
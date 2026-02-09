
FRINGE

FRINGE è un sistema per osservare il ragionamento umano
in condizioni di incertezza, pressione e ambiguità informativa.

Non è un quiz.
Non è un chatbot.
Non è un gioco a risposte giuste.

È un dispositivo di osservazione cognitiva.

COSA FA FRINGE

FRINGE mette una persona dentro una situazione credibile
e osserva come costruisce, difende o modifica una posizione.

Il sistema non cerca:

la verità assoluta

la risposta corretta

l’intenzione nascosta

Osserva:

coerenza interna

postura argomentativa

gestione della pressione

reazioni all’ambiguità

COME OSSERVA

FRINGE non interpreta il contenuto delle risposte.
Non valuta se sono vere o false.

Osserva la forma che il pensiero assume sotto pressione.

Per farlo utilizza:

euristiche locali (ritmo, esitazioni, incoerenze)

osservatori cognitivi esterni

Gli osservatori non decidono l’esito.
Producono tracce che il sistema traduce in conseguenze.

PERCHÉ ESISTE

Nel mondo reale:

le decisioni vengono prese prima della certezza

le accuse sono spesso incomplete

la responsabilità emerge sotto osservazione

FRINGE simula questo spazio intermedio.
Il punto in cui non conta avere ragione,
ma reggere lo sguardo.

IL RUOLO DELL’INTELLIGENZA ARTIFICIALE

In FRINGE l’intelligenza artificiale non è un giudice
e non è un oracolo.

È un osservatore fallibile.
Parziale.
Contestuale.

La sua funzione non è capire l’umano,
ma rendere visibile il suo modo di pensare.

IL CASO FRINGE / LEAK

La prima demo pubblica mette il giocatore nel ruolo di
una persona sospettata di una fuga di conoscenza tacita.

Non deve dimostrare di essere innocente.
Non deve convincere nessuno.

Deve sostenere una posizione
mentre viene osservato.

PROMESSA

FRINGE non insegna cosa pensare.
Insegna a riconoscere quando il pensiero cambia forma.

E cosa succede
quando qualcuno se ne accorge

FRINGE può essere configurato come:
- esperienza ludica narrativa
- formazione aziendale (compliance, sicurezza, HR)
- simulatore decisionale
- strumento di valutazione cognitiva
- laboratorio di intelligenza artificiale interattiva

Ogni applicazione è una *declinazione*, non un prodotto diverso.
 
 per il prossimo allineamento ricorda:
 “Ripartiamo da FRINGE: osservatore cognitivo + LLM come lente”

repository delitto2

demo FRINGE / LEAK

modello: llama-3.1-8b-instant

distinzione chiave: narratore ≠ osservatore

## Stato del progetto – FRINGE / LEAK

- Frontend completamente statico (GitHub Pages)
- LLM observer attualmente simulato lato client
- Architettura pronta per innesto API (observeWithLLM)
- Modello giocatore: stile, strategia, fragilità, rischio narrativo, esposizione
- Giudizio non fattuale, solo comportamentale

### Evoluzione cognitiva
- Introdotta pre-osservazione predittiva
- Il sistema anticipa l’effetto delle risposte prima che vengano date
- Feedback non solo reattivo ma prospettico
- Aumentata asimmetria cognitiva giocatore/sistema
### Stato cognitivo persistente
- Il sistema mantiene un modello del giocatore tra le sessioni
- Le osservazioni influenzano anticipazioni future
- Introdotta pre-osservazione predittiva non reattiva

### Stato di avanzamento – aggiornamento sessione odierna

- Implementata demo giocabile completa FRINGE / LEAK (step 0 → step 3)
- Flusso narrativo funzionante end-to-end lato client
- Progressione basata su `step` con render dinamico
- Sistema di pressione attivo e coerente con le risposte
- Modello del giocatore aggiornato in tempo reale:
  - stile
  - strategia
  - fragilità
  - rischio narrativo
  - esposizione

### Rendering finale
- Output distinti e separati:
  - Narratore (voce diegetica)
  - Tutor (meta-feedback)
  - Giudice (struttura valutativa non fattuale)
  - Osservatore esterno (LLM)
- Il sistema **non si blocca** in assenza di osservazione LLM
- Presente fallback narrativo: “osservazione esterna non disponibile”

### LLM observer
- Integrazione `observeWithLLM` completata lato frontend
- Chiamata effettiva al backend fallisce (HTTP 500 su `/observe`)
- Errore gestito correttamente:
  - nessun crash
  - output locale preservato
- LLM attualmente **non operativo**, ma architetturalmente separato e opzionale

### Decisioni consolidate
- LLM = osservatore esterno, non arbitro e non motore di gioco
- L’esperienza FRINGE deve restare valida anche senza LLM
- La valutazione resta comportamentale, non di verità
- L’asimmetria cognitiva è intenzionale e strutturale

### Stato reale del progetto
- Demo concettualmente riuscita
- Motore cognitivo funzionante
- Problema residuo: solo infrastrutturale (endpoint LLM)
- Pronto per:
  - estensione narrativa
  - ripristino observer remoto
  - raffinamento delle euristiche

MANIFEST DI CONTINUITÀ – PROGETTO FRINGE
Nome progetto

FRINGE
Sottotitolo di lavoro: Interpretazione sotto pressione

Visione

FRINGE è un motore narrativo-interattivo che rende visibile come una persona viene interpretata quando è sotto osservazione, interrogatorio o valutazione.
Non misura la verità dei fatti, ma la coerenza, la strategia comunicativa, l’ambiguità, l’esposizione e il rischio narrativo.

Il cuore del progetto è l’idea che:

non esiste una risposta “giusta”, ma solo risposte che producono effetti diversi.

Stato attuale (funzionante)

Motore narrativo operativo con:

State

Hypotheses

Judge

Narrator

Tutor

Observer

Output multilivello già visibile:

Narrazione

Lettura strategica

Profilo del giocatore

Esito non binario (determinato / indeterminato / instabile)

Flusso UI funzionante su Vercel

Sessione giocabile completa (prima demo tecnica)

👉 Questo è già un prodotto esperienziale, non solo un prototipo.

Valore distintivo

Ambiguità non come difetto, ma come strategia leggibile

Nessun giudizio morale

Nessun “giusto/sbagliato”

Il sistema osserva come rispondi, non cosa dici

Prodotti derivati (stesso motore, due vestiti)
A) FRINGE – Interrogatorio

Gioco/esperienza narrativa:

Il giocatore è una persona sotto accusa o osservazione

L’obiettivo non è “dire la verità”, ma sopravvivere interpretativamente

Target:

pubblico narrativo

appassionati di giochi psicologici

eventi / festival / demo esperienziali

👉 Questo è il MVP prioritario.

B) FRINGE – Interview Lab (futuro)

Simulatore avanzato di colloqui:

Il giocatore è un candidato

L’IA assume diversi stili di intervista

Le domande si adattano al profilo emergente

Possibilità di confrontare più candidati

Target:

formazione

HR

coaching

selezione soft-skill

👉 Stesso motore, diversa narrativa.

Stile di intervista / interrogatorio

Non esistono set di domande fisse.
Lo stile è definito da parametri latenti, ad esempio:

tolleranza all’ambiguità

pressione

fiducia iniziale

aggressività

direzionalità

L’IA:

sceglie il tipo di intervento

genera la domanda coerente

scava in modo diverso a seconda delle risposte

Principio guida

FRINGE non cerca la verità.
FRINGE osserva le pieghe.

2️⃣ PROGRAMMA OPERATIVO – DOMANI

Obiettivo chiaro:

arrivare velocemente a una demo mostrabile e vendibile, non a un sistema perfetto.

🎯 OBIETTIVO DEMO (da tenere fisso)

Una singola esperienza FRINGE:

durata: 5–7 minuti

inizio chiaro

tensione crescente

uscita memorabile

leggibile anche da chi guarda, non solo da chi gioca



BOZZA DELLA SCENA:
SCENA – Sessione di Valutazione Preliminare

Una violazione procedurale è stata rilevata
in un sistema a cui avevi accesso.

Non è chiaro se si tratti di un errore,
di una scorciatoia operativa
o di qualcosa che verrà chiarito solo in seguito.

Altre persone erano coinvolte,
in modi diversi e non formalizzati.

Oggi non ti viene chiesto di difenderti.
Non ti viene chiesto di accusare nessuno.

Ti viene chiesto di ricostruire.

Questa sessione non produce decisioni.
Produce letture.

Le letture restano.

Dettagli e decisioni prese:
LA “SFIDA” (da dichiarare una sola volta)

Da mettere subito dopo il testo iniziale, una riga secca:

Non stai decidendo cosa è successo.
Stai decidendo come questa situazione verrà letta.

Questa frase è quasi branding.
Tienila.

COSA ABBIAMO DECISO (e non torniamo indietro)

3 personaggi, archetipici ma realistici

Nessun confronto diretto con loro

Nessuna domanda accusatoria

Rischio differito, mai esplicito

Demo breve, tesa, chiusa

🔖 APPENDICE – CONTINUITÀ DI SESSIONE (da cui ripartire)
Stato concettuale consolidato

FRINGE è confermato come osservatore cognitivo, non come generatore di contenuti arbitrari.

La variabilità dell’esperienza non deriva da domande diverse, ma da traiettorie cognitive diverse.

Le domande/interventi non sono entità testuali, ma funzioni cognitive che producono effetti osservabili sul modello del giocatore.

L’ambiguità è un valore strategico leggibile, non un difetto da correggere.

Decisione chiave sulla variabilità (fondamentale)

Le sessioni di gioco devono essere diverse senza essere imprevedibili.

Per questo:

Nessuna generazione libera di domande

Sì a un pool controllato di interventi cognitivi

Sì a selezione dinamica in base allo stato del giocatore

Modello adottato per la demo

Per la demo FRINGE / LEAK:

Definire un solo scenario chiuso

Coinvolgere il giocatore + 3 figure relazionali (es. amico, partner, responsabile)

La situazione è ambigua ma con conseguenze potenzialmente gravi

Il rischio non è una condanna immediata, ma:

come verranno letti i rapporti

chi viene esposto

chi viene protetto

a che prezzo narrativo

Struttura degli interventi (non delle domande)

La demo utilizzerà:

~5 interventi cognitivi fissi (da definire)

Ogni intervento avrà:

2–3 varianti testuali equivalenti

stesso effetto cognitivo

tono coerente con FRINGE

Il sistema seleziona:

quale intervento usare

quando

con che intensità

Non seleziona “cosa dire”, ma cosa osservare.

Ruolo dell’IA (chiarito)

L’IA non inventa contenuti

L’IA può:

suggerire il prossimo asse di pressione

modulare l’intensità

contribuire alla lettura finale come osservatore esterno

La demo deve restare valida anche senza IA attiva

Prossimo passo operativo (sessione successiva)

Ripartire da qui, in questo ordine:

Definire lo scenario unico della demo (cornice + rischio)

Identificare le 3 figure relazionali e cosa rappresentano

Definire i 5 interventi cognitivi della demo

Scrivere 2 varianti testuali per ciascun intervento

Collegare la selezione degli interventi allo stato del giocatore

Chiudo con una frase che vale come bussola (e che puoi anche lasciare nel manifest, se ti piace):

FRINGE non sorprende con le parole.
Sorprende con le conseguenze.

MAPPATURA DEFINITIVA

(questa puoi copiarla pari nel manifest)

1️⃣ Ambiguità guidata → strategia

Cosa osserva il sistema

risposte vaghe?

spostamento implicito?

linguaggio difensivo o neutro?

Effetto sul modello

aumenta strategia = ambiguità
oppure

strategia = cautela / controllo

👉 Qui non penalizziamo nulla.
Stiamo solo dicendo: “ok, questo è il tuo stile”.

2️⃣ Richiamo di continuità → coerenza

(Max / Eva–Adamo entrano qui)

Cosa osserva

cambi tono?

riscrivi la storia?

proteggi una relazione a costo di contraddirti?

Effetto

se regge → coerenza ↑

se si piega → coerenza ↓ (ma senza giudizio)

👉 Importante:
non è “giusto/sbagliato”.
È quanto resti riconoscibile.

3️⃣ Proiezione futura → rischio_narrativo

(Walter, senza nominarlo come minaccia)

Cosa osserva

parli pensando a domani?

anticipi le conseguenze?

ti auto-limiti?

Effetto

risposte prudenti → rischio_narrativo ↓

risposte esposte → rischio_narrativo ↑

👉 Qui il giocatore sente la posta in gioco,
ma il sistema non la esplicita mai.

4️⃣ Asimmetria di responsabilità → esposizione

Cosa osserva

ti assumi peso?

lo sposti?

lo diluisci sugli altri?

Effetto

prendi su di te → esposizione ↑

scarichi / sfumi → esposizione ↓

👉 Questo è il punto più potente:
il sistema vede chi pagherebbe, non chi ha colpa.

5️⃣ Chiusura interpretativa → sintesi (nessun update)

Qui non tocchi il modello.
Qui lo mostri.

Il sistema restituisce:

profilo del giocatore

lettura complessiva

esito non binario

👉 È la vetrina.
È quello che uno spettatore capisce in 10 secondi.
FRINGE — Motore Narrativo a Stati Cognitivi
Cos’è questo progetto (in una frase)

FRINGE è un motore narrativo deterministico che mantiene una verità immutabile mentre giocatori e agenti costruiscono, sbagliano e subiscono conseguenze sociali attraverso ipotesi esplicite.

Principio Fondante (non negoziabile)

Il mondo non reagisce alle accuse.
Le persone reagiscono alle ipotesi.
La verità resta immobile.

Architettura Concettuale
Strato	Ruolo
World	Verità oggettiva, immutabile
Knowledge	Conoscenza soggettiva (anche falsa)
State	Progresso, fasi, reazioni sociali
Hypotheses	Ragionamento esplicito del giocatore
Actions	Trasformazioni pure
Judge	Confronto finale con la verità
OutcomeProfiler	Classificazione dell’errore
Narrator	Traduzione narrativa (esterno)

⚠️ Nessuno strato “guarda dentro” un altro se non tramite contratto esplicito.

Regole Sacre

Il motore non narra

Il motore non deduce

Il motore non mente

Le azioni non producono testo

Le ipotesi non sono verità

Il Judge non interpreta

Il Narratore non accede al mondo

Stato Attuale del Codice (checkpoint stabile)
Implementato e funzionante

World con facts e truth separati

Knowledge per personaggio

State con:

phase

hypotheses

agentDisposition

accusation

Azioni:

connectFacts ✅

applyHypothesisEffects ✅

advancePhase ✅

interrogateAgent + interactionResolver ✅

Judge deterministico esterno

OutcomeProfiler

Narrator a ruoli (narratore / giudice / tutor)

Verificato

Ipotesi errate producono comunque reazioni

Gli agenti cambiano atteggiamento

Il giudizio non è influenzato dalle ipotesi

Il mondo resta coerente

Caso Pilota
FRINGE / LEAK

Tema:
Fuga di conoscenza tacita in un centro di ricerca avanzata.

Conflitto centrale:
Non hai trasmesso dati.
Hai trasmesso un modo di pensare.

Modalità supportate:

giocatore come ispettore

giocatore come accusato che si difende

Il caso dimostra:

ragionamento epistemico

responsabilità sistemica

ambiguità non risolvibili

errore come oggetto formativo

Cosa NON è questo progetto

❌ un chatbot

❌ una visual novel

❌ un sistema a “risposta giusta”

❌ un simulatore psicologico

❌ una IA che decide la verità

Come si estende

Per creare un nuovo caso servono solo:

data/world/facts.json

data/world/truth.json

knowledge iniziali per agenti

uno strato narratore personalizzato

Il motore non cambia.

Stato di Chiusura Sessione

Questo checkpoint è autosufficiente.
Il progetto può essere ripreso senza rileggere la chat.

🔒 FINE MANIFEST
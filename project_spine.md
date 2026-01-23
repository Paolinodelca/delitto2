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

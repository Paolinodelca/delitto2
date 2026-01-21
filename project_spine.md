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

## 6. Prossimo passo pianificato

Definizione strutturata dei **FACTS**:
- forma
- lifecycle
- rivelabilità
- relazione con azioni e stato

I facts saranno la prima vera entità narrativa verificabile.

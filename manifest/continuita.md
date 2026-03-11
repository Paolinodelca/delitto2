# CONTINUITÀ — DEMO FRINGE / LEAK + MOTORE (Paolino)

## Obiettivo immediato
1. Rendere FRINGE / LEAK stabile e “memorabile” come demo presentabile.
2. Tenere la demo configurabile (data-driven): nuovi scenari = JSON, senza toccare il motore UI comune.
3. Passare allo sviluppo del prodotto successivo (MVP “Fringe Interview”).
4. Tornare in seguito al motore narrativo grande (World / Knowledge / State / Hypotheses / Judge / Narrator / OutcomeProfiler).

---

## Non negoziabile (canonico)
- FRINGE / LEAK NON è ricostruzione dei fatti: valuta COME il giocatore rende accettabili decisioni sapendo che verranno lette / interpretate.
- La microcopy “non verità → versione” va mostrata prima delle domande e non va svuotata.
- Output osservazioni finali: SEMPRE oggetto con 3 campi:
  `{ fringe, psicologico, amplificato }`
- AMPLIFICATO contiene due ipotesi parallele (sincero vs messa in scena) nella stessa lettura.
- Paolino preferisce file completi da sostituire, non patch; non fare ipotesi sul suo codice.

---

## Struttura progetto (punti caldi)
- UI canonica comune: `docs/app.js`
- Landing demo: `docs/index.html`
- Selettore scenari: `docs/scenario.html`
- Pagina gioco: `docs/play.html`
- Scenari JSON: `docs/data/*.json`
- API osservazioni: `api/observe.js`

---

## Stato demo — FREEZE STABILE
La demo è considerata **congelata / presentabile**.

### URL attivi demo
- Home demo: `https://paolinodelca.github.io/delitto2/`
- Selettore scenari: `https://paolinodelca.github.io/delitto2/scenario.html`
- Gioco:
  - `https://paolinodelca.github.io/delitto2/play.html?s=fringe`
  - `https://paolinodelca.github.io/delitto2/play.html?s=batman`
  - `https://paolinodelca.github.io/delitto2/play.html?s=partner`
  - `https://paolinodelca.github.io/delitto2/play.html?s=alieni`

Se non si cambia branch/folder pubblicato su GitHub Pages, questi link restano validi.

---

## Stato tecnico consolidato

### Deploy / Pages
- GitHub Pages pubblica la demo da `docs/`
- URL base Pages: `https://paolinodelca.github.io/delitto2/`
- I file pubblici corretti stanno sotto `docs/`
- I JSON pubblici stanno sotto `docs/data/`

### API observe
- Endpoint Vercel usato dal client quando si è su GitHub Pages
- CORS funzionante
- preflight OPTIONS gestito
- modello Groq configurabile via ENV:
  - `GROQ_API_KEY`
  - `GROQ_MODEL`
- fallback presente se LLM fallisce

### Observe.js
- Stato attuale: `OBSERVE VERSION: AMP-V10`
- Il motore riceve:
  - scenario
  - contesto / ruoli
  - DOMANDE
  - RISPOSTE
  - observedAnchors
  - pressureLevel
  - lastShadowWord
- Miglioramento chiave: la AI non legge più solo le risposte in astratto, ma il rapporto domanda/risposta.
- Questo permette di distinguere meglio:
  - risposta pertinente
  - risposta evasiva
  - risposta provocatoria
  - risposta fuori tema

### Prompt / stile
- Ridotti i leak da scenari vecchi
- Rimossi riferimenti hardcoded Saturn nei prompt e fallback
- Ridotte formule legnose tipo:
  - “sembra utilizzare”
  - “appare caratterizzato da”
  - “tende a stare cercando”
- PAROLA-OMBRA resa più variabile rispetto alle prime versioni

---

## Scenari attivi
Attualmente gli scenari demo funzionanti sono 4:

1. `scenario_fringe_leak.json`
2. `scenario_batman.json`
3. `scenario_partner_geloso.json`
4. `scenario_alieni.json`

### Regola modulare confermata
Per aggiungere un nuovo scenario NON si dovrebbe toccare il motore comune.
Il nuovo scenario va costruito come JSON con campi del tipo:
- `scenario`
- `exposureLabel`
- `companyName`
- `setting`
- `roles`
- `introTitle`
- `introText`
- `scenarioHtmlTemplate`
- `microcopyText`
- `contextHtmlTemplate`
- `questionSets`

---

## Rotazione domande
- I `questionSets` ruotano correttamente tra le run
- La rotazione viene richiamata anche su replay
- La demo non resta bloccata sempre sullo stesso set
- Stato raggiunto: sufficiente per uso demo / presentazione

---

## Qualità raggiunta
### Cosa funziona bene
- La demo distingue abbastanza bene tra:
  - risposta dettagliata / coerente
  - risposta evasiva
  - risposta provocatoria
  - risposta fuori tema
- I report finali sono generalmente coerenti con:
  - registro
  - ritmo
  - pressione
  - postura narrativa
- Il ponte verso il futuro prodotto “Fringe Interview” è credibile

### Limiti rimasti (accettati nel freeze)
- Alcune frasi nei report sono ancora un po’ legnose / grammaticalmente imperfette
- La qualità della scrittura dipende ancora parecchio da come sono formulate le domande
- Il sistema è demo-grade, non ancora prodotto-grade

Decisione presa:
- NON continuare a micro-ottimizzare la demo
- congelare e passare al prodotto successivo

---

## Backup / controllo versione
### Strategia consigliata
- Tenere il branch demo congelato come riferimento stabile
- Sviluppare il futuro MVP su un branch nuovo separato

### Procedura consigliata
- branch demo stabile: `demo-fringe-leak-v0.1`
- nuovo branch sviluppo prodotto:
  `mvp-fringe-interview`

### Backup consigliato
1. Backup logico: tag Git della demo congelata
2. Backup fisico: zip locale dell’intero progetto, es.
   `delitto2_freeze_demo_rc-v1.zip`

### File più vitali da non perdere
- `docs/app.js`
- `docs/index.html`
- `docs/scenario.html`
- `docs/play.html`
- `docs/data/scenario_fringe_leak.json`
- `docs/data/scenario_batman.json`
- `docs/data/scenario_partner_geloso.json`
- `docs/data/scenario_alieni.json`
- `api/observe.js`
- `continuita.md`

---

## Prossimo passo vero
La demo è congelata.
Ora il lavoro va spostato su:

# MVP — FRINGE INTERVIEW

### idea
Tool per allenare colloqui / sostenere candidature / leggere come una risposta regge sotto pressione.

### direzione
- utente carica CV
- opzionalmente job description / ruolo
- il sistema genera domande
- l’utente risponde
- il sistema produce:
  - feedback finale
  - oppure feedback domanda per domanda
- possibile estensione futura lato recruiter / scrematura candidati

### criterio strategico
La demo FRINGE / LEAK non va più usata come laboratorio instabile.
Va usata come:
- concept demo
- asset da mostrare
- base concettuale per Fringe Interview

---

## Nota finale operativa
Se i link demo smettono di funzionare, prima controllare:
1. branch GitHub Pages pubblicato
2. cartella pubblicata (`/docs`)
3. presenza di:
   - `docs/index.html`
   - `docs/scenario.html`
   - `docs/play.html`
4. integrità dei JSON sotto `docs/data/`

Non toccare la demo congelata direttamente se non per fix davvero necessari.
Sviluppare nuove funzioni sul branch separato dell’MVP.

# CONTINUITÀ — aggiornamento sviluppo Fringe Interview

## Stato generale progetto

La demo **FRINGE / LEAK** è stata congelata e resa stabile.

- deploy funzionante su GitHub Pages
- endpoint observe.js funzionante
- scenari attivi: alieni, batman, partner geloso, fringe leak
- architettura Observer LLM stabilizzata

La demo resta come:
- prova concettuale del motore FRINGE
- asset dimostrativo
- base di osservazione narrativa

Non verrà modificata durante lo sviluppo del nuovo MVP.

---

## Nuova direzione: FRINGE INTERVIEW

È stato deciso di sviluppare un nuovo prodotto sopra il motore FRINGE.

Nome di lavoro:
**FRINGE INTERVIEW**

Obiettivo:
simulazione di colloqui che analizza la forma delle risposte e restituisce una lettura utile per migliorare.

Non è:
- un quiz
- un test psicologico
- un sistema di scoring HR

È un sistema che rende leggibile **come il candidato risulta sotto pressione**.

---

## Architettura scelta

Il progetto viene separato in tre livelli:

### 1 Core FRINGE
motore riusabile

Responsabilità:
- session orchestration
- question strategy
- observation
- report shaping

### 2 Application Layer — Fringe Interview
logica specifica colloqui

Responsabilità:
- parsing CV
- parsing job description
- costruzione simulazione
- report colloquio

### 3 Content / Config Layer
contenuti configurabili

- famiglie domande
- varianti
- follow-up
- rubriche report

---

## Struttura cartelle introdotta

Nuova area progetto:

Contiene:


fringe-interview/
architecture.md
manifest_fringe_interview.md

/config
interview_config.json
question_families.json
followup_packs.json
report_rubrics.json

/notes
roadmap.md
ideas.md


Questa cartella ospita tutto il materiale del nuovo MVP senza toccare il core o la demo.

---

## Funzionalità MVP definite

Flow utente:

1 Landing  
2 Profilo candidato  
3 Parsing job description  
4 Setup simulazione  
5 Colloquio (5–7 domande)  
6 Report finale  

Il report include:

- come il candidato risulta
- cosa funziona
- dove perde forza
- come migliorare
- aderenza CV ↔ ruolo

---

## Modulo strategico introdotto

### CV ↔ Job Description Fit

Nuovo modulo che:

- legge job description incollata
- estrae competenze e responsabilità
- confronta con il CV
- segnala copertura e mancanze

Possibile evoluzione premium:

- suggerimenti di riscrittura CV
- miglioramento mirato delle sezioni
- evidenziazione skill mancanti

---

## Strategia domande

Modello ibrido:

1 famiglie di domande stabili  
2 varianti controllate  
3 follow-up adattivi

Famiglie iniziali:

- motivazione
- esperienza concreta
- gestione difficoltà
- priorità / trade-off
- aderenza al ruolo
- sintesi finale

Follow-up MVP:

- concretizza
- prova
- stringi
- ruolo

---

## Stato attuale

Completato:

- manifesto FRINGE INTERVIEW
- architettura MVP
- configurazioni iniziali domande
- configurazioni follow-up
- configurazioni report
- design flow schermate

---

## Prossimo passo

Domani sviluppo concettuale del modulo:

### CV ↔ Job Description parser

Definire:

- cosa estrarre dal CV
- cosa estrarre dalla job description
- come confrontare i due oggetti
- come usare il risultato nel colloquio

Questo modulo sarà centrale per:

- personalizzare le domande
- generare report più utili
- aprire opportunità di monetizzazione


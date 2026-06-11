# ROADMAP — FRINGE INTERVIEW

## 🎯 Fase attuale

👉 PRODOTTO REALE / OTTIMIZZAZIONE QUALITÀ

---

# 🔥 PRIORITÀ IMMEDIATE

## 1. VARIAZIONE DOMANDE (CRITICO)

### Obiettivo

Evitare ripetizione tra sessioni

### Azioni

- rotazione per family
- varianti linguistiche
- tracking domande usate
- riduzione riuso ravvicinato della stessa formulazione
- mantenere coerenza di intent senza ripetere identiche parole

---

## 2. QUALITÀ VALUTAZIONE RISPOSTE

### Problemi attuali

- commenti ripetitivi
- non riconosce bene il fuori tema
- feedback troppo generico
- a volte la lettura non valorizza correttamente ciò che nella risposta c’è davvero

### Obiettivo

Feedback realistico da recruiter / coach

---

## 3. TRAINER MODE

### Obiettivo

Far percepire valore reale

### Migliorare

- cosa cercava la domanda
- cosa è emerso
- cosa manca
- come migliorare
- differenza chiara rispetto al feedback free

---

## 4. REPORT

### Miglioramenti

- punti forti più sintetici
- separazione chiara tra:
  - generale
  - risposta per risposta
- maggiore evidenza visiva
- CV free più utile
- contenuti Pro/Premium più chiari e più desiderabili

---

## 5. UI / UX

### Setup

- rifinitura dello step Preparazione
- migliore gestione stati compilato / non compilato
- migliore compattezza verticale
- aggancio più chiaro tra preparazione e simulazione

### Report

- allineamento definitivo con setup
- family feeling coerente
- migliore gerarchia visiva
- maggiore evidenza contenuti premium
- navigazione più chiara e definitiva

---

# 🚀 FASE SUCCESSIVA

## GO-TO-MARKET

- definizione pricing
- landing page
- comunicazione valore
- differenza chiara tra Free / Pro / Premium

---

# 🚀 FASE FUTURA

## NEGOTIATION

- secondo scenario reale
- validazione motore
- confronto con Interview

---

# 📌 REGOLA CHIAVE

NON aggiungere feature nuove finché:

- qualità domande non è alta
- feedback non è credibile
- UX non è chiara

---

## 🎯 NEXT STEP OPERATIVO

1. rifinitura dettagliata setup
2. rifinitura dettagliata report
3. rotazione domande
4. migliorare evaluation engine
5. rafforzare trainer mode

---

## Update — 2026-03-26

### ✅ Migliorata la shell di setup

Completato un ulteriore step di rifinitura sulla pagina setup:

- barra superiore più leggibile
- descrizione iniziale più visibile
- pulsanti/step con stato più chiaro
- contorni e selezione resi più evidenti
- coerenza grafica più vicina alla pagina report

### Decisione UX confermata

- setup:
  - deve mostrare solo `Vai al report`
- report:
  - deve mostrare solo `Vai al setup`

### Scelta prodotto confermata

I pulsanti PRO e PREMIUM possono essere mostrati anche nello setup come parte della presentazione del valore del prodotto, purché non disturbino il flusso principale.

### Prossimo micro-step operativo

1. completare la navigazione reale tra setup e report
2. riallineare definitivamente la barra del report alla barra migliorata dello setup
3. rifinire ultimi dettagli di contrasto, bordi e selezione attiva

## Update — 2026-03-27

### ✅ Ripristinata la separazione corretta setup / report

Completato un intervento importante di riallineamento:

- `renderInteractiveInterviewShellHtml.js` torna a essere il renderer dello setup
- `renderFringeInterviewReportHtml.js` torna a essere il renderer del report
- `test_generate_interactive_shell_html.js` rigenera due file HTML distinti e corretti

### ✅ Setup semplificato e reso più leggibile

La pagina setup ora è basata su:

- step `Preparazione`:
  - ruolo
  - CV
  - JD
  - lingua
- step `Simulazione`
- pannello `PRO`
- pannello `PREMIUM`

### ✅ Barra superiore migliorata

La barra dello setup ora è:

- fissa
- compatta
- su una sola riga
- coerente con la logica del report

### Scelta di metodo confermata

Non rifare da zero il report.

Usare invece la versione “quasi buona” come base stabile e procedere per rifiniture mirate.

### Prossimo blocco operativo consigliato

1. revisione fine della pagina setup
2. revisione fine della pagina report
3. allineamento definitivo tra le due
4. poi ritorno alla sostanza:
   - rotazione domande
   - evaluation engine
   - trainer mode

   ## Update — 2026-03-30

### ✅ Stabilizzazione renderer setup/report

Completato un intervento di consolidamento:

- setup e report sono di nuovo separati correttamente
- il renderer del report è stato riportato a una struttura stabile
- la barra del report è stata riportata su una sola riga
- confermata una base grafica coerente tra setup e report

### ✅ Scelta tecnica di robustezza per i test

Per evitare errori inutili sugli export:

- i test HTML non devono più passare da `src/app/index.js`
- devono invece importare direttamente i file renderer

Questo vale in particolare per:
- `scripts/test_generate_interactive_shell_html.js`
- `scripts/test_render_fringe_interview_report_html.js`

### 🔄 Prossimo blocco operativo

1. ultimissimi micro-fix su setup
2. ultimissimi micro-fix su report
3. congelare temporaneamente la UI
4. tornare subito alle priorità sostanziali:
   - rotazione domande
   - qualità valutazione risposte
   - trainer mode

### Nota importante

La futura pagina prezzi / upgrade:
- NON va infilata ora dentro setup/report
- va costruita come pagina dedicata
- i pulsanti PRO/PREMIUM attuali potranno poi essere collegati lì senza rifare il rendering principale

## Update — 2026-03-30 / Evaluation engine + question rotation refinement

### ✅ Rotazione domande — prima versione riuscita

Completato un primo blocco robusto di rotazione:

- penalità sulle `questionKey` recenti
- penalità leggere su categorie e segnali troppo ricorrenti
- strategy che prova a evitare il riuso ravvicinato
- piena compatibilità multilingua:
  - la rotazione lavora su `key/category/signals`
  - NON sui prompt

### ✅ Nuovo asse di domanda: motivazione al cambiamento

Aggiunti nei bank IT/EN:

- `motivation_for_change`
- `change_trajectory_logic`

Effetto ottenuto:

- il motore ora può introdurre davvero domande su:
  - perché vuoi cambiare azienda / ruolo
  - che cosa stai cercando di diverso
  - se il passo è coerente o solo reattivo

### ✅ Composizione primary questions migliorata

Correzione semantica importante:

- nelle sessioni brevi non viene più forzato `WALKTHROUGH`
- struttura corta più corretta:
  - `ROLE_CONTEXT`
  - `CASE_1`
  - `DECISION_PROBE`
  - `PRESSURE_PROBE` / `DEPTH_CHECK`
- il contextual ranking pesa davvero nella selezione finale

### ✅ Answer analyzer contestuale

`analyzeAnswerShape.js` ora legge anche il contesto della domanda:

- `questionText`
- `questionKey`
- `narrativeRole`
- `expectedSignals`

Nuovi indicatori introdotti:

- `questionAlignment`
- `motivationForChange`
- `offTopicRisk`

### ✅ Runtime wiring completato

`advanceInterviewRuntime.js` inoltra ora all’analyzer il contesto della domanda.

Conseguenza:

- l’analisi risposta non è più cieca
- può distinguere meglio:
  - risposta centrata
  - risposta che si allarga
  - risposta fuori asse
  - motivazione al cambiamento credibile / fragile

### ✅ Report e final report rafforzati

`collectInterviewReport.js` e `buildFinalCandidateReport.js` ora espongono anche:

- `questionQuality`
- `alignment`
- `motivationForChange`
- nuovo asse `positioning`

---

## 🔄 Nuova priorità consigliata

### 1. TRAINER MODE

Obiettivo:

usare i nuovi segnali per spiegare meglio:

- che cosa cercava la domanda
- che cosa è emerso
- che cosa manca
- come migliorare

### 2. Coerenza scoring

Micro-fix successivo da prevedere:

riallineare meglio:

- fit score
- answer score
- assi comportamentali
- overall band
- recommendation band

---

## ⚠️ Nota tecnica separata

Resta ancora aperto, ma NON collegato a questo blocco:

- errore export su `src/app/index.js`
- test che fallisce:
  - `test_run_fringe_interview_mvp_session.js`

Da trattare come blocco distinto.S

## Update — nota da trasformare in blocco operativo

### 🔄 Gating della domanda “motivation for change”

Da introdurre un controllo logico a monte.

#### Nuovi input da prevedere nello setup

- stato occupazionale attuale:
  - occupato
  - non occupato

- se occupato:
  - azienda attuale / altra azienda
  - settore / mercato
  - eventuale affinità con ruolo / azienda target

#### Effetto desiderato

La domanda sulla motivazione al cambiamento deve essere:

- attivata solo quando coerente
- sostituita da una variante diversa quando il candidato non lavora già in un’altra azienda

#### File / aree probabilmente da toccare in futuro

- setup input
- validazione input
- deriveInterviewContextProfile
- question selection / gating logic

## Fase corrente — Transition to Product

### Stato
- MVP online (landing + tool separati)
- prima esperienza reale validata
- identificato gap principale: percezione valore

---

### Priorità immediate (ordine rigido)

1. Landing — rewrite completo (micro-shock)
2. Demo WOW above-the-fold
3. Riduzione attrito ingresso (Quick Interview)
4. Primo ciclo di test utenti

---

### NON priorità (temporaneamente bloccate)

- miglioramenti grafici avanzati
- pricing / monetizzazione
- refactoring engine
- nuove feature

---

### Obiettivo della fase

Passare da:
→ tool funzionante

a:
→ esperienza che aggancia in pochi secondi

---

### KPI qualitativo

Utente deve pensare entro 5 secondi:

"ok… questo è diverso"

Se non succede:
→ problema landing, non prodotto

## Update — 2026-04-01 / UX polish prioritario

### Nuova micro-priorità immediata
Pulizia definitiva della top navigation di setup/report:

1. uniformità pulsanti desktop
2. leggibilità mobile
3. stato attivo evidente ma non invasivo
4. piena coerenza setup ↔ report

### Regola
Prima chiudere la barra.
Poi intervenire sulla landing e sul report.

## Update — 2026-04-02 / UX polish barra setup

### Micro-priorità immediata

Chiudere bene la top navigation dello setup prima di passare oltre.

### Dettagli da rifinire
- badge FREE / PRO / PREMIUM più leggibili
- lucchetti più visibili
- pallini numerati più leggibili
- allineamento verticale numeri ↔ testi
- stato attivo molto più evidente e persistente
- leggibilità mobile dei micro-label dei led

### Regola di lavoro
Non rifare la barra.
Solo ritocchi mirati su:
- dimensioni
- peso font
- contrasto
- bordo attivo
- allineamenti

### Dopo questo
1. riportare lo stesso intervento al report
2. riprendere landing page
3. poi rientrare su esperienza completa setup → report

## Roadmap aggiornata — 2026-04-08

### Stato attuale del prodotto
MVP in fase avanzata lato:
- setup (configurazione simulazione)
- report (output finale)

Architettura stabile, UX in fase di rifinitura.

Focus attuale:
👉 trasformare un prototipo funzionante in un prodotto percepito come solido e credibile

---

## PRIORITÀ IMMEDIATE (blocco attuale)

### 1. Setup — rifinitura finale

Obiettivo:
rendere la pagina:
- più chiara
- più leggera
- più guidata

Interventi da completare:

#### Fascia alta (critico)
- separare:
  - riga 1 → brand / identità
  - riga 2 → guida dinamica + stato + messaggi
- rendere il testo:
  - più operativo (“cosa devi fare ora”)
  - meno descrittivo

#### Pulizia contenuti
- rimuovere ridondanze:
  - stato preparazione (già visibile nei led)
  - formato selezionato
  - suggerimento pratico
- semplificare blocchi input secondari:
  - lingua
  - formato
  - modalità risposta

#### Demo UX
- migliorare introduzione demo:
  - copy più diretto (“non vuoi perdere tempo?”)
- evidenziare chiaramente quando è attiva una demo
- NON persistere i dati demo tra sessioni

#### Azioni utente
- aggiungere:
  - reset / nuova preparazione

#### Bug aperti
- numerelli lunetta su mobile (verticale/orizzontale)

---

### 2. Gating — esperienza utente

Obiettivo:
rendere il flusso evidente e naturale

Da migliorare:
- messaggi di blocco più visibili
- integrazione nella fascia alta (non messaggi isolati)
- chiarezza sequenza:
  - 1 → preparazione
  - 2 → simulazione
  - 3 → report

---

### 3. Report — rifinitura UX

Obiettivo:
allineare il report al livello percepito dello setup

Interventi:

#### Header / fascia alta
- introdurre struttura coerente con setup:
  - brand
  - guida
  - stato
- evitare header troppo “neutro”

#### Barra navigazione
- mantenere:
  - orizzontale su desktop
  - compatta su mobile
- comportamento:
  - fissa su verticale
  - più flessibile su orizzontale

#### Contenuti
- rifinire:
  - sintesi iniziale (hero)
  - distinzione free / pro / premium
- evitare ridondanze tra sezioni

---

## DOPO (solo dopo chiusura setup + report)

### 4. Landing page (CRITICO prodotto)
Obiettivo:
- creare percezione valore immediata
- guidare utente verso:
  - demo
  - simulazione reale

---

### 5. Modalità “solo CV”
Idea:
- utente vuole migliorare il CV senza simulazione
- flusso dedicato (più corto)

Nota:
NON sviluppare ora → tornare dopo MVP pulito

---

### 6. Persistenza utente (feature PRO/PREMIUM)

Funzionalità futura:
- salvare più:
  - CV
  - job description
  - ruoli target
- richiamare sessioni precedenti

Uso:
- utenti paganti
- training continuo

---

### 7. Evoluzione prodotto (livello avanzato)

Direzioni già identificate:
- simulazione più realistica (pressione, deviazioni)
- lettura recruiter più profonda
- miglioramento CV guidato automatico

---

## Principi guida confermati

- NON rifare da zero → solo micro-rifiniture
- aumentare:
  - leggibilità
  - chiarezza
  - percezione prodotto
- ridurre:
  - ridondanza
  - densità inutile
  - rumore visivo

---

## Sequenza corretta di lavoro

1. chiusura setup (UX + pulizia)
2. chiusura report (coerenza + leggibilità)
3. landing page (percezione prodotto)
4. solo dopo → nuove feature

---

## Nota strategica importante

Il prodotto NON è:
👉 “un simulatore di colloqui”

Il prodotto è:
👉 un **motore di lettura e miglioramento del profilo candidato**

La simulazione è solo uno dei modi per far emergere segnali.

## Update — 2026-04-09 / cambio di priorità operativo

### Nuova priorità immediata
Sospendere le micro-rifiniture della setup.

### Motivo
Il costo tempo/UI sta diventando superiore al valore immediato.

### Nuovo focus
1. testare il comportamento reale del motore
2. verificare la qualità percepita del report
3. costruire una demo credibile da mostrare a un profilo HR
4. solo dopo decidere eventuali ulteriori rifiniture UI

## Update — 2026-04-10 / priorità immediata corretta

### Nuova priorità operativa
Prima di continuare con:
- qualità dei commenti
- severità scoring
- wording domande
- UX report

serve verificare e correggere il flusso che alimenta il report HTML demo.

### Motivo
È emerso che il report aperto localmente / pubblicato sembra non riflettere davvero le ultime modifiche al motore.

Probabile causa:
- `scripts/test_generate_interactive_shell_html.js` legge un JSON sessione già esistente
- non rigenera la sessione end-to-end
- quindi il report HTML può risultare stale

### Ordine corretto di lavoro
1. correggere / rifare `scripts/test_generate_interactive_shell_html.js`
2. assicurarsi che il report HTML usi una sessione aggiornata davvero
3. rieseguire verifica qualitativa su:
   - prima risposta pseudo-introduttiva
   - differenziazione commenti
   - aderenza risposta → commento
4. solo dopo tornare a:
   - pulizia wording domande
   - raffinazione UX del report
   - micro-rifiniture visuali

### Regola
NON sprecare altro tempo in micro-fix del renderer se l’HTML non è alimentato dal payload corretto.

## Priorità attuale — Demo Reference Case

### Blocco corrente
Prima di continuare con miglioramenti qualitativi del report:

→ creare un demo reference case stabile

### Motivazione
Il sistema attuale non garantisce che:

- il report HTML rifletta davvero il motore aggiornato
- le modifiche siano verificabili in modo affidabile

### Prossimo step (obbligatorio)
Implementare:

scripts/demo_reference_case.js

### Solo dopo questo step:
riprendere:

- miglioramento commenti
- miglioramento domande
- UX report
- monetizzazione (Free / Pro / Premium)

### Regola
Nessuna ottimizzazione “di superficie” finché il flusso demo non è sotto controllo.

- introdotta architettura modulare report (plan config + module registry + layout assembler)
- da integrare nei renderer

Principio da fissare

Questo:

The engine should always generate the richest possible analysis.

Product plans (FREE / PRO / PREMIUM) should NOT change the engine logic.

They should only control:
- visibility
- enabled behaviors
- accessible recruiter styles
- rendering capabilities
- adaptive intensity
- coaching depth

through configuration-driven capability policies.

Questo è il cuore.

3. Regola CRITICA

Mai fare:

if (premium)

nel runtime o renderer.

Ma:

if (capabilities.showRecruiterPanel)

oppure:

if (capabilities.enableAdaptivePressure)

Professional Perception Roadmap

V1 (fatta)

modello dati
pagina report
narrative placeholder

V2

definizione dei blocchi narrativi
definizione tono FRINGE
definizione "carezza narrativa"

V3

integrazione LLM
generazione narrativa guidata

V4

evidenze collegate alle singole risposte

## CONTINUITY UPDATE — 03/06/2026

### Professional Perception (nuova direzione strategica)

È stata introdotta una nuova sezione report:

* Percezione professionale
* Narrative Layer
* Credibility Path
* Perception Gap
* Evolution Bridge

La sezione è già renderizzata nel report PRO come pagina dedicata "Percezione".

Stato attuale:

* modello dati presente
* rendering HTML presente
* contenuti ancora V1 (deterministici)
* nessuna integrazione LLM ancora effettuata

Decisione presa:

NON procedere ancora con adapter Groq dedicato.

Prima definire con precisione:

* tono FRINGE
* struttura narrativa
* blocchi concettuali della percezione professionale

L'integrazione LLM verrà affrontata successivamente.

---

### Intuizione strategica emersa

Possibile spostamento del valore percepito di FRINGE:

da:

"simulatore di colloquio"

verso:

"strumento per capire come vieni percepito durante un colloquio"

Ipotesi da validare durante il beta.

---

### Candidate Experience

Principio guida:

Il candidato non deve mai chiedersi:

* Dove sono?
* Cosa devo fare adesso?

Flusso ideale:

Landing
↓
Preparazione
↓
Input CV / ruolo
↓
Simulazione
↓
Report
↓
Feedback

La simulazione rimane guidata.

Il report rimane esplorativo.

---

### Ruolo delle sezioni report

Come vieni percepito
→ capire

Risposte
→ dimostrare

CV
→ posizionare

Checklist
→ agire

Ridurre progressivamente le ripetizioni tra le sezioni.

---

### Frasi candidate per la landing

Versione attualmente più promettente:

"Forse pensi che ti serva qualcosa che ti alleni a rispondere al tuo prossimo colloquio di lavoro.

Forse quello che ti serve è altro.

Ogni colloquio racconta due storie.

La prima è quella che pensi di raccontare.
La seconda è quella che l'intervistatore percepisce.

Le due storie non sempre coincidono.

E spesso è proprio in quella distanza che si nasconde la risposta al perché un colloquio che sembrava andato bene non abbia portato al risultato sperato.

FRINGE è nato proprio per esplorare questa distanza."

---

### Priorità prossima sessione

1. Raffinare il contenuto della sezione Percezione.
2. Definire la Candidate Journey completa.
3. Definire landing orientata al dolore.
4. Definire beta test e raccolta feedback.
5. Solo successivamente:

   * revisione colori semantici
   * integrazione LLM narrativa
   * raffinamento estetico.

Osservazione emersa dal Beta Test Giulia:

Le narrative CV Discovery devono restare universali.

Le narrative specifiche di settore devono essere delegate alle future Role Family Narrative.



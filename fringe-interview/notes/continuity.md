# CONTINUITY — FRINGE INTERVIEW  
## Stato operativo aggiornato

## 1. Stato generale del progetto

FRINGE Interview è passato da prototipo tecnico a prodotto in costruzione.

Il motore base funziona end-to-end:

CV + JD → Parser → JobFit → Question Set → Runtime → Answer Analysis → Adaptive Follow-up → Report

La priorità non è più dimostrare che il sistema funziona, ma trasformarlo in uno strumento percepito come utile, leggibile e vendibile.

Il valore oggi si gioca su:

- qualità e pertinenza delle domande
- qualità della valutazione delle risposte
- chiarezza del report
- differenza percepita tra FREE / PRO / PREMIUM
- trasformazione del report in trainer operativo

---

## 2. Principi prodotto consolidati

### 2.1 Cosa valuta FRINGE

Il sistema NON valuta il candidato in assoluto.

Valuta la coerenza tra:

- profilo candidato
- CV
- ruolo target
- job description
- modo in cui il candidato risponde

Il punto centrale è:

> quanto il candidato riesce a rendere credibile il proprio fit rispetto al ruolo target.

---

### 2.2 Technical gating

Il technical gating non è un punteggio continuo, ma un filtro:

- KO
- BORDERLINE
- OK

Variabile chiave collegata:

- Time-to-Impact

---

### 2.3 Assi principali di lettura

Gli assi comportamentali centrali restano:

1. Decisione
2. Sintesi
3. Attriti

A questi si è aggiunto progressivamente un asse importante:

- Posizionamento

---

## 3. Stato motore Interview

### 3.1 Runtime

Il runtime è stabile in prima versione.

Sono attivi:

- state machine
- fasi narrative
- ledger / coverage
- adaptive follow-up
- focus mode
- gestione sessione corta / standard / deep

Le fasi principali usate nel flusso sono:

- OPENING
- ROLE_CONTEXT
- CASE_1
- DECISION_PROBE
- PRESSURE_PROBE / DEPTH_CHECK
- CLOSING

---

### 3.2 Adaptive follow-up

Adaptive follow-up LLM integrato.

Regole consolidate:

- non sparare follow-up sempre
- trigger basato su qualità risposta / dimensioni deboli
- no follow-up in OPENING / CLOSING
- budget per sessione
- anti-ripetizione focus
- max attempts per fase

Strategia confermata:

> usare LLM solo nei punti in cui crea valore reale, non per tutto.

---

## 4. Selezione domande e relevance matrix

### 4.1 Rotazione domande

È stata introdotta una logica reale di rotazione domande.

La rotazione NON dipende dal testo della domanda, ma da:

- questionKey
- category
- signals

Questo è importante per supportare più lingue.

Penalità attive:

- key recente
- categoria recente
- segnali simili recenti

---

### 4.2 Relevance matrix

È stata creata e integrata:

- `config/question_relevance_matrix.json`
- `src/interview/loadQuestionRelevanceMatrix.js`
- `src/interview/evaluateQuestionFamilyRelevance.js`

La matrice definisce la rilevanza delle question family rispetto a:

- seniority
- role traits
- leadership
- stakeholder exposure
- execution intensity

Esempio comportamento confermato:

- `conflict_pressure` basso per junior
- `conflict_pressure` alto per senior / leadership
- `decision_tradeoff` basso per junior
- `decision_tradeoff` alto per senior
- `role_fit` alto quasi sempre

---

### 4.3 Integrazione nel ranking

La relevance matrix è integrata in:

- `src/interview/rankStructuredQuestions.js`

Agisce come bonus/malus di ranking.

È stata corretta `inferQuestionFamilyKey(question)`:

- prima controlla key/tags specifici
- poi usa category come fallback

Verifiche riuscite:

- `motivation_for_change` → `motivation_for_change`
- `pressure_handling` → `conflict_pressure`
- `decision_tradeoffs` → `decision_tradeoff`
- `clarity_under_challenge` → `conflict_pressure`

---

### 4.4 Integrazione nella strategy

La relevance matrix è integrata anche in:

- `src/interview/deriveQuestionSelectionStrategy.js`

Metadata aggiunti:

- `roleFitRelevanceBand`
- `motivationRelevanceBand`
- `pressureRelevanceBand`
- `decisionRelevanceBand`

`shouldForcePressureSignal(...)` ora usa anche `pressureRelevanceBand`.

Test comparativo riuscito.

Scenario JUNIOR:

- `juniorMode: true`
- `forcedPressureSignal: false`
- `pressureRelevanceBand: low`
- `decisionRelevanceBand: low`
- selected questions orientate a collaborazione, apprendimento, motivazione

Scenario SENIOR:

- `juniorMode: false`
- `forcedSeniorityCalibration: true`
- `forcedPressureSignal: true`
- `pressureRelevanceBand: high`
- `decisionRelevanceBand: high`
- selected questions orientate a pressione, accountability, tradeoff, gestione cliente

Conclusione:

> la rilevanza non è più solo raccontata nel report: guida davvero la costruzione del colloquio.

---

## 5. Motivation for change

È stato introdotto il segnale:

- `motivation_for_change`
- `change_trajectory_logic`

Motivo:

la domanda “perché vuoi cambiare azienda / ruolo?” è molto importante per:

- coerenza narrativa
- rischio fuga
- stabilità
- direzione professionale
- credibilità del passaggio

Nota importante:

questa domanda ha senso solo se si conosce lo stato occupazionale.

Da introdurre / consolidare negli input:

- candidato occupato / non occupato
- azienda attuale, se occupato
- settore azienda attuale
- eventuale distanza rispetto a settore/ruolo target

Se il candidato non è occupato, usare varianti tipo:

- “Perché questo ruolo è giusto adesso?”
- “Che tipo di rientro / riposizionamento stai cercando?”

---

## 6. Answer Shape Engine

### 6.1 Stato attuale

`analyzeAnswerShape.js` è stato molto evoluto.

Ora legge:

- answerText
- questionText
- questionKey
- narrativeRole
- expectedSignals

Dimensioni introdotte o rafforzate:

- questionAlignment
- motivationForChange
- offTopicRisk
- roleCredibilityMarkers
- problematicAnswerType

Tipi problematici gestiti:

- non_answer
- duplicate
- evasive
- off_topic
- nonsense
- generic_example_missing
- provocative_unserious

---

### 6.2 Migliorie importanti già fatte

Corretto falso positivo su domande transition / role fit.

Prima:
una risposta formalmente buona ma semanticamente fuori asse poteva essere premiata troppo.

Ora:
se manca la logica del passaggio verso il ruolo, il motore lo segnala.

Corretto `isWalkthrough`:
non basta la parola “percorso” per trattare una domanda come walkthrough.

Distinzione confermata:

- WALKTHROUGH = racconto cronologico carriera
- ROLE_CONTEXT = trasferibilità / positioning

---

### 6.3 Fake good suppression

È stato introdotto un primo blocco di fake good suppression.

Obiettivo:

abbassare risposte che:

- suonano professionali
- usano lessico corretto
- restano coerenti in superficie
- ma non portano sostanza reale

Triple test usato:

- good
- fake good
- bad

Risultato:
fake good portata da punteggio troppo alto a punteggio più corretto.

---

### 6.4 Role credibility anchors

Aggiunti segnali di credibilità situata:

- ruoli ricoperti
- responsabilità reali
- contesti aziendali/funzionali
- team / funzione / business unit

Scopo:

distinguere meglio tra:

- capacità dichiarate
- esperienza reale situata

Regola:

- esperienza + sostanza → alto
- esperienza nominata ma vaga → medio/basso
- nessuna esperienza → basso

---

### 6.5 Punto futuro importante: context carryover credit

Insight da non perdere:

nel colloquio reale le risposte non sono isolate.

Se il candidato ha già chiarito:

- ruolo
- responsabilità
- contesto
- settore
- esperienza

le risposte successive possono permettersi meno contesto esplicito.

Da introdurre in futuro:

- `context_carryover_credit`

Uso:

- ridurre penalità eccessive su risposte coerenti ma non iper-esplicite
- non salvare risposte vuote o evasive

---

## 7. Report e prodotto: FREE / PRO / PREMIUM

### 7.1 Principio strategico

FREE / PRO / PREMIUM non devono essere tre pagine separate.

Devono essere configurazioni diverse dello stesso ambiente.

Il sistema deve generare moduli riusabili.

I piani decidono:

- enabled
- preview
- locked

---

### 7.2 Architettura modulare report

File principali:

- `src/report/buildProReportV2.js`
- `src/report/reportPlanConfig.js`
- `src/report/reportModuleRegistry.js`
- `src/report/getReportSectionLayout.js`
- `src/report/assembleReportSectionData.js`
- `src/app/renderProReportHtml.js`

Principio consolidato:

> il builder genera contenuti, il config decide visibilità, l’assembler combina layout + dati, il renderer visualizza.

Questo permette di:

- spostare moduli tra piani
- fare preview marketing
- aggiungere PREMIUM senza rifare tutto
- evitare “chirurgia a cuore aperto”

---

### 7.3 PRO Report V2

`buildProReportV2.js` genera:

- overview
- openingPositioning
- blockingPriorities
- featuredAnswers
- sensitiveQuestionsDashboard / criticalPoints
- cvSlim
- finalChecklist
- answersWorkspace

---

## 8. UI attuale PRO Report

### 8.1 Report PRO come ambiente navigabile

È stata introdotta navigazione a sezioni:

- Overview
- Risposte
- Punti delicati
- CV
- Checklist

Nel renderer:

- `data-report-nav`
- `data-report-section`
- JS per switch sezione attiva

Risultato:

il PRO Report non è più un calderone, ma un ambiente navigabile.

---

### 8.2 Punti delicati da preparare bene

Ex “domande sensibili”.

Nuovo posizionamento:

- tono coach amico
- non “voti”, ma passaggi in cui conviene arrivare preparati

Struttura attuale:

- perché conta
- da dove nasce la lettura
- come lo affronterei io al tuo posto

Funzione introdotta:

- `buildFriendlySensitiveAdvice(item)`

Tipi principali:

- motivation_for_change
- role_fit
- conflict_pressure
- profile_gap

Etichette corrette:

- Stato
- Priorità

Da migliorare ancora:

- rendering monotono
- differenziazione visiva
- evitare pattern troppo ripetitivo

---

### 8.3 Racconto iniziale / apertura

La sezione opening è stata ripensata come:

> come hai raccontato le tue esperienze

Concetto:

i primi minuti del colloquio orientano tutta la percezione.

La sezione deve leggere:

- prima impressione del racconto
- chiarezza del percorso CV
- cosa funziona già
- cosa migliorare
- come preparare il racconto iniziale

Il racconto iniziale è legato a:

- CV
- coerenza
- eventuali buchi / pause / ambiguità
- fiducia e trasparenza con intervistatore
- posizionamento rispetto al ruolo

Da migliorare ancora:

- evitare etichette nude tipo “descrittivo”
- spiegare meglio “parzialmente lineare”
- rendere più specifico cosa non è chiaro nel CV

---

## 9. Pagina Risposte / Trainer workspace

### 9.1 Direzione prodotto

La pagina Risposte non deve restare un report statico.

Deve diventare un workspace di allenamento.

Struttura target:

- domanda visibile
- risposta originale visibile
- lettura sintetica vicino alla domanda
- colonna sinistra: risposta attuale + criticità + punti utili
- colonna destra: suggerimenti + bozza migliorata
- futura area editabile PREMIUM
- salvataggio risposta migliorata
- rianalisi e confronto punteggio prima/dopo

---

### 9.2 Stato implementato

`renderWorkspaceAnswerPanel(...)` è stato riorganizzato in workspace a due colonne.

Sono presenti:

- header con intento / score
- box scuro per domanda
- colonna sinistra “Risposta attuale”
- colonna destra “Risposta migliorata / da allenare”
- box “Come potrebbe suonare meglio”
- nota PREMIUM su editing / salvataggio / rianalisi

---

### 9.3 Fix completati su risposta originale

In `buildProReportV2.js`:

- `buildAllAnswersWorkspace(runtimeAnswers)` ripulita
- `buildAnswerWorkspaceItem(answer, index)` aggiornata per portare:
  - `questionText`
  - `answerText`
  - score
  - summary
  - weaknesses
  - strengths
  - improvementHints
  - problematicAnswerType
  - offTopicRisk

Rimossa diagnostica:

- `console.log("ANSWER SAMPLE:", ...)`

Risolto problema indentazione risposta originale:

- causa: spazi nel template HTML + `white-space: pre-wrap`
- fix: `<div class="original-answer-box">...</div>` su una riga

---

### 9.4 Problema ancora aperto: domanda reale

Nel sample `runtimeAnswers[0]`:

```js
questionContext: {
  questionText: ""
}

## Aggiornamento — PRO Report / Workspace Risposte

Priorità 1 completata:
- Recupero domanda reale nel runtime risolto.
- `advanceInterviewRuntime.js` ora salva `questionContext.questionText` anche per:
  - openingPrompt
  - core question
  - closingPrompt
- Verificato: runtime MVP e PRO V2 ora mostrano domande coerenti.

Fix test:
- `scripts/test_interview_runtime_from_pipeline.js`: aggiunto `await` su `advanceInterviewRuntime` per evitare loop infinito.
- Aggiunta guardia anti-loop consigliata.

Answer annotations:
- `runAnswerAnnotationsForSession.js` ora usa come fonte primaria:
  - `answerRecord.questionContext.questionText`
- Risultato: 6/6 risposte annotate.
- Aggiunto retry anti-429 Groq:
  - retry su rate limit
  - delay letto da messaggio “try again in Xs”
  - throttle aumentato a 12000 ms.

Merge annotations:
- `test_answer_annotations_for_session_groq.js` ora reinserisce le annotations in:
  - `tmp/app-mvp-session/fringe_interview_mvp_session_result.json`
- `test_run_fringe_interview_mvp_session.js` può caricare/mergiare annotations esistenti tramite:
  - `loadSessionAnswerAnnotations`
  - `mergeSessionAnnotationsIntoResult`

PRO V2:
- `buildProReportV2.js` porta in `answersWorkspace.items` anche:
  - `annotations`
- `renderProReportHtml.js` mostra:
  - box domanda + risposta
  - score compatto laterale
  - lettura sintetica
  - segmenti colorati da answer annotations
  - etichette italiane per type/dimension
  - barra domande sticky
  - nav principale sticky

Migliorie prompt/normalizzazione:
- `buildAnswerAnnotationPrompt.js` aggiornato per:
  - evitare overlap strength/weakness
  - usare `opportunity` per parti utili ma migliorabili
  - coprire più parti significative della risposta
- `normalizeAnswerAnnotation.js` aggiornato con:
  - rimozione annotazioni sovrapposte
  - priorità: weakness > opportunity > strength > evidence
  - riduzione casi in cui lo stesso excerpt appare sia positivo che negativo

Stato UI attuale:
- Workspace Risposte molto più efficace visivamente.
- Segmenti almeno 2 per risposta nei test recenti.
- Colori:
  - verde = aiuta la risposta
  - giallo = da rafforzare
  - rosso = penalizza
- Restano da fare:
  - compattare ulteriormente le due colonne sotto
  - migliorare estetica colonna destra
  - migliorare qualità/copertura segmenti nel prompt
  - valutare barre/indicatori qualitativi per impatto segmento
  - rifinire hero/header e proporzioni score box

  ## Da implementare — Context carryover credit

Il motore non deve valutare ogni risposta come se fosse isolata.  
La prima risposta/opening può stabilire contesto, ruolo, seniority, responsabilità, leadership, strumenti, settore e credibilità di base.

Da introdurre:
- estrazione di `contextCarryoverSignals` dalla risposta opening e/o CV;
- uso dei segnali nelle risposte successive;
- riduzione penalità ripetitive quando un’informazione è già stata stabilita;
- distinzione tra:
  - risposta vuota/evasiva → non salvata dal carryover
  - risposta coerente ma non auto-contenuta → può ricevere credito di contesto
  - risposta fuori asse → non salvata dal carryover

Esempio:
se il candidato ha già chiarito di aver gestito persone o responsabilità operative reali, non va penalizzato in ogni risposta perché non ripete ogni volta la propria leadership. Semmai va suggerito di richiamarla meglio quando la domanda lo richiede.

## Aggiornamento — Rifinitura Workspace Risposte PRO

Pagina Risposte PRO molto avanzata e ora percepita come base forte del piano PRO.

Completato:
- Box unico domanda + risposta:
  - domanda reale visibile;
  - risposta visibile nello stesso blocco;
  - score laterale compatto;
  - colore score per fascia.
- Barra risposte sticky:
  - pulsanti risposta più evidenti;
  - bordo/indicatore colore per qualità risposta:
    - verde = buona;
    - giallo = media/da rafforzare;
    - rosso = critica.
- Segmentazione colorata:
  - da `answerAnnotation.annotations`;
  - verde = aiuta la risposta;
  - giallo = da rafforzare;
  - rosso = penalizza;
  - etichette tradotte in italiano.
- Migliorata sezione “Come puoi rafforzarla”:
  - ridotte ripetizioni;
  - suggerimenti più legati alle annotations;
  - filtro per tema concettuale.
- Migliorata sezione “Come potrebbe suonare meglio”:
  - ora contiene sia lettura descrittiva sia “spunto di risposta”;
  - evidenziata con box viola/premium-like.
- Migliorata estetica generale:
  - menu risposte più evidente;
  - tab risposta colorati per punteggio;
  - colonne più definite;
  - pagina più compatta e più coinvolgente.

Note tecniche:
- Aggiunte funzioni renderer per:
  - `renderAnswerSegments`
  - `humanizeAnnotationType`
  - `humanizeAnnotationDimension`
  - `segmentImpactLabel`
  - `buildInspirationalAnswerDraft`
  - `buildSpecificHintFromAnnotation`
  - `selectUsefulImprovementHints`
  - deduplica concettuale dei suggerimenti.
- CSS ripulito parzialmente su liste `ul/li`; resta un piccolo disallineamento in “Altri aspetti da tenere presenti”, non bloccante.
- `tab-button` ora usa classi score:
  - `tab-score-good`
  - `tab-score-mid`
  - `tab-score-weak`.

Decisione prodotto:
- La pagina Risposte può essere considerata la nuova base estetica/funzionale PRO.
- Overview è rimasta indietro rispetto a Risposte.
- Conviene rifinire Overview più avanti usando lo standard visuale definito in Risposte.
- Il tema “potenziale candidato” resta molto promettente soprattutto per PREMIUM.

Da fare prossimo:
1. Mini-rifinitura bullet “Altri aspetti” se necessario.
2. Redesign progressivo Overview con lo stesso linguaggio visivo.
3. Progettare modulo PREMIUM “Potenziale candidato”:
   - potenziale latente;
   - come aumentarlo;
   - come comunicarlo meglio in CV/colloquio/lettera;
   - suggerimenti di attività, contenuti, skill o corsi da sviluppare.
4. Implementare in futuro `contextCarryoverCredit`:
   - usare opening/CV per evitare penalizzazioni ripetitive nelle risposte successive;
   - non pretendere che ogni risposta ripeta credenziali già stabilite;
   - distinguere risposta vuota da risposta coerente ma non auto-contenuta.

   ## Aggiornamento — UI Navigation & Workspace Risposte (rifinitura avanzata)

Step importante completato: definizione gerarchia visiva e qualità estetica PRO.

### Barra principale (top navigation)
- Introdotto layout a doppio riquadro:
  - `top-nav-outer` → contenitore esterno scuro (volume)
  - `top-nav` → riquadro interno con:
    - gradiente blu
    - bordo chiaro visibile
- Risolti problemi di:
  - disallineamento verticale del bordo
  - perdita forma pulsanti (ripristinato `border-radius: 999px`)
- Pulsanti:
  - leggibili
  - coerenti
  - stato active evidenziato correttamente

### Barra risposte (answer tabs)
- Introdotto contenitore dedicato `answer-tabs-shell`
- Gradiente testa di moro:
  - più scuro
  - meno “plasticoso”
  - più elegante e coerente con UI PRO
- Bordatura resa visibile e calda (non neutra)
- Sticky corretto sotto la barra principale

### Gerarchia visiva (risolta)
- Barra principale → strutturale (blu)
- Barra risposte → operativa (testa di moro)
- Separazione chiara senza bisogno di elementi artificiali

### Mini hero
- Eliminato hero grande iniziale
- Introdotto mini header:
  - `FRINGE Interview · PRO`
  - payoff sintetico (es. “Preparare davvero il tuo prossimo colloquio”)
- Migliorato allineamento e leggibilità

### CSS cleanup
- Rimossi duplicati critici (`.top-nav-item`)
- Consolidati blocchi principali
- Stabilizzata resa visiva (meno effetti incoerenti)

---

## Stato attuale

La pagina PRO (in particolare Workspace Risposte) è ora:

- visivamente coerente
- con gerarchia chiara
- con percezione “prodotto” (non più prototipo)
- pronta per essere base di estensione PREMIUM

---

## Prossimi step

1. Rifinitura Overview per portarla allo stesso livello visivo
2. Miglioramento qualità annotations (copertura + segmenti)
3. Introduzione logica “context carryover” (uso CV/opening per evitare ripetizioni)
4. Progettazione modulo PREMIUM:
   - potenziale candidato
   - valorizzazione
   - suggerimenti strategici (non solo correzione risposte)

   ## Aggiornamento — Overview PRO in lavorazione

Abbiamo iniziato il redesign della pagina Overview per allinearla allo standard visivo della pagina Risposte PRO.

### Stato attuale
- Barra principale e barra risposte già stabilizzate.
- Workspace Risposte PRO considerato riferimento estetico/funzionale.
- Overview migliorata rispetto alla versione piatta iniziale, ma ancora da rifinire.

### Decisioni concettuali importanti
- La sezione “openingPositioning” oggi NON legge direttamente la risposta 1.
- In `buildFinalCandidateReport.js`, `openingPositioning` è costruita da:
  - `candidate`
  - `role`
  - `fit`
  - `copy`
  - `localeKey`
- Quindi è più una lettura CV/JD/fit del posizionamento iniziale che una valutazione della risposta effettiva.
- Da non confondere con la prima risposta reale del colloquio.
- Direzione futura:
  - la vera prima domanda dovrebbe chiedere sempre il racconto del percorso/CV;
  - questa risposta deve essere analizzata come tutte le altre;
  - deve generare `contextCarryoverCredit` per evitare penalizzazioni ripetitive nelle risposte successive.

### Valore da non perdere
- Il tab CV resta strategico:
  - coerenza CV → JD;
  - competenze spendibili;
  - gap;
  - trasferibilità;
  - supporto alla costruzione del racconto iniziale.
- L’opening deve collegare CV, ruolo target e risposte successive.
- Idea forte futura:
  - “questa parte del tuo racconto genera questi problemi nelle risposte”.

---

## Modifiche già fatte in Overview

### `renderOpeningPositioningModule`
La struttura è stata trasformata verso schema:

1. blocco scuro principale
2. lettura del racconto a tutta larghezza
3. due riquadri affiancati:
   - elementi già spendibili
   - punti da spiegare meglio
4. blocco coach:
   - come impostarla in pratica
   - esempio di apertura

Titolo attuale:
- `Apertura del colloquio: come stai raccontando il tuo percorso`

Titoli interni attuali:
- `Lettura del tuo racconto`
- `Elementi già spendibili`
- `Punti da spiegare meglio`
- `Come impostarla in pratica`
- `Esempio di apertura`

### `buildProReportV2.js`
Da verificare/tenere:
- in `buildOpeningPositioningSection(opening)` deve essere passato:
  - `shortPitchExample: opening.shortPitchExample || ""`

Altrimenti l’esempio di apertura non compare.

### `renderFeaturedAnswersModule`
Razionalizzato verso:
- titolo: `Due risposte significative del tuo colloquio`
- tolto/da togliere `Focus PRO` perché ambiguo
- obiettivo: mostrare una risposta più penalizzante e una risposta che regge meglio.

### `renderAnswerCard`
È stata modificata per mostrare:
- tipo risposta:
  - `La risposta più penalizzante`
  - `La risposta che oggi regge meglio`
- box domanda + risposta
- summary
- indicazione operativa principale
- due riquadri sotto:
  - cosa indebolisce
  - come rafforzarla

---

## Problemi aperti da riprendere

### 1. Titoli riquadri Overview
Problema:
- il background dei titoli interni è diventato uguale per:
  - `Lettura del tuo racconto`
  - `Elementi già spendibili`
  - `Punti da spiegare meglio`

Da correggere:
- `Lettura del tuo racconto`: blu/indaco, con gradiente più visibile e più contrasto rispetto allo sfondo scuro.
- `Elementi già spendibili`: recuperare verde.
- `Punti da spiegare meglio`: recuperare rosso.
- Non usare un unico stile generico per tutti i `.overview-card-title`.

Possibile direzione CSS:
- regola base per `.overview-card > .overview-card-title`
- override specifici:
  - `.overview-card-good > .overview-card-title`
  - `.overview-card-risk > .overview-card-title`
  - `.overview-card-neutral > .overview-card-title`

### 2. Esempio di apertura
Problema:
- `Esempio di apertura` quasi illeggibile.
- Titolo troppo piccolo.
- Testo troppo piccolo.

Da fare:
- aumentare titolo;
- aumentare testo;
- usare box scuro leggibile oppure box chiaro molto contrastato;
- rendere l’esempio uno degli elementi “wow” della sezione.

### 3. “Come impostarla in pratica”
Problema:
- titolo con colore poco leggibile sullo sfondo attuale.
- Le indicazioni operative nel blocco coach devono essere leggibili, non invisibili.

Da fare:
- titolo più visibile, forse giallo/avorio;
- testo bianco o molto chiaro;
- pallini/indicatori coerenti.

### 4. Due risposte significative
Problemi:
- box domanda/risposta migliorato ma ancora non abbastanza leggibile.
- label `Domanda` poco visibile.
- testo domanda da aumentare.
- summary sotto si perde:
  - es. “La risposta apre il racconto, ma non porta ancora contenuti sufficienti…”
- box indicazione operativa troppo simile allo sfondo domanda.
- riquadri inferiori ancora piatti e con testi poco leggibili.

Da fare:
- label `Domanda` in colore vivo, probabilmente giallo già usato.
- testo domanda più grande.
- testo risposta più leggibile.
- summary in box dedicato con maggiore enfasi.
- box consiglio operativo con colore standard “consiglio/coach”, forse verde scuro o blu/viola, diverso dal box domanda.
- testi inferiori più leggibili.
- aggiungere indicatori di importanza anche qui.

### 5. Rosellino
Da evitare:
- il background rosellino tenue continua a non convincere.
- Preferire:
  - rosso deciso per criticità;
  - verde deciso per leve;
  - blu/indaco per letture;
  - viola/giallo per coaching/azione.

---

## Prossimo step consigliato

Ripartire da CSS + render mirati, NON da nuova architettura.

Ordine consigliato:
1. sistemare titoli riquadri Overview con override colore:
   - neutral blu
   - good verde
   - risk rosso
2. rendere leggibile `overview-pitch-box`;
3. rendere più leggibile `overview-coach-box`;
4. rifinire `renderAnswerCard` / CSS delle due risposte significative:
   - label domanda/risposta;
   - summary;
   - consiglio operativo;
   - riquadri inferiori.
5. solo dopo valutare il collegamento:
   - CV → apertura → risposte
   - context carryover credit

---

## Nota strategica

La direzione corretta è:
- Overview = sintesi e orientamento strategico;
- Risposte = lavoro operativo sulle risposte reali;
- CV = coerenza strutturale CV/JD;
- Punti delicati = passaggi da preparare bene;
- Premium futuro = potenziale candidato + valorizzazione + percorso di miglioramento.

Non perdere il tema:
`contextCarryoverCredit`
perché è fondamentale per evitare che il sistema sembri ingenuo o ripetitivo.

## Aggiornamento — Overview PRO + Due risposte significative

Stato: la pagina Overview è migliorata in modo netto e ora inizia ad avvicinarsi allo standard visivo della pagina Risposte PRO.

### Principio UI confermato
Evitare:
- bianco su bianco;
- testi piccoli o grigi poco leggibili;
- rosellino/azzurrino pallido;
- titoli poco distinguibili dai contenuti.

Standard visivo:
- blu/indaco scuro = lettura / struttura;
- verde scuro = leva positiva / risposta che regge;
- rosso-vinaccia = criticità / risposta penalizzante;
- giallo/oro = evidenza operativa / consiglio / priorità;
- viola = coaching / miglioramento.

---

## Pagina Risposte PRO

### Sistemato
- Colonna sinistra ora chiarita come area di analisi.
- Titolo colonna SX corretto:
  - da `Caratteristiche principali`
  - verso `Analisi della risposta`
- Risolto disallineamento verticale del titolo SX:
  - il titolo è stato spostato fuori dal `workspace-block`;
  - il riquadro interno ora parte sotto il titolo.
- Colonna DX resta area consigli/miglioramento.
- Barra risposte migliorata con gradiente.

### Da ricordare
La pagina Risposte era già quasi chiusa, ma resta da rifinire:
- differenziare ancora meglio colonna SX = analisi e colonna DX = consigli;
- controllare dimensioni testi nei riquadri bassi;
- mantenere coerenza con geometria/titoli Overview.

---

## Overview — Opening / Racconto iniziale

### Sistemato
- La sezione iniziale usa ora uno sfondo scuro più convincente.
- I riquadri principali sono più leggibili.
- Legenda priorità introdotta:
  - alta;
  - media;
  - nota / da tenere presente.
- I pallini della legenda funzionano meglio e rendono il peso più leggibile.
- Il titolo generale resta:
  - `Apertura del colloquio: come stai raccontando il tuo percorso`
- La sezione chiarisce meglio il ruolo del racconto iniziale.

### Concetto importante
`openingPositioning` NON valuta direttamente la risposta 1.
È costruito da:
- candidate;
- role;
- fit;
- copy;
- localeKey.

Quindi oggi è una lettura CV/JD/fit del posizionamento iniziale, non una valutazione della risposta reale.  
In futuro la vera prima domanda dovrà chiedere esplicitamente il racconto del percorso/CV e dovrà essere analizzata come risposta reale.

---

## Overview — Esempio di apertura

### Sistemato parzialmente
- `shortPitchExample` va passato da `buildProReportV2.js`:
  - `shortPitchExample: opening.shortPitchExample || ""`
- Il box esempio di apertura è ora più leggibile.
- Resta idea futura:
  - aggiungere una nota tipo:
    - completare lo spunto con esperienze concrete del CV;
    - collegare esempi e attività svolte al ruolo target;
    - eventualmente suggerire dal CV esperienze coerenti.

---

## Overview — Due risposte significative

### Sistemato
`renderAnswerCard` è stato rivisto per mostrare:
- tipo risposta:
  - `La risposta più penalizzante`
  - `La risposta che oggi regge meglio`
- domanda + risposta in box dedicato;
- commento/sintesi più collegato alla risposta;
- due riquadri sotto:
  - cosa indebolisce;
  - come può essere rafforzata.

### Miglioramento visivo importante
- Eliminato effetto bianco su bianco.
- La risposta critica usa sfondo rosso/vinaccia.
- La risposta più forte usa sfondo verde scuro.
- I riquadri inferiori ora sono più distinti:
  - SX rischio/criticità;
  - DX consiglio/miglioramento.
- Eliminato sistema dei 5 pallini perché poco leggibile.
- Introdotto indicatore semplice:
  - pallino + etichetta `Alta`, `Media`, `Nota`.
- Risolto errore `ReferenceError: level is not defined` sostituendo tutta `renderImpactList`.

Funzione corretta:

```js
function renderImpactList(items = [], tone = "risk") {
  return ensureArray(items).map((item, index) => {
    const score = index === 0 ? 5 : index === 1 ? 4 : 3;
    const level = score === 5 ? "high" : score === 4 ? "mid" : "low";
    const label = score === 5 ? "Alta" : score === 4 ? "Media" : "Nota";

    return `
      <div class="impact-item impact-${tone}">
        <div class="impact-priority impact-priority-${level}">
          <span class="impact-priority-dot"></span>
          <span class="impact-priority-label">${label}</span>
        </div>
        <div class="impact-text">${escapeHtml(item)}</div>
      </div>
    `;
  }).join("");
}

## Aggiornamento — Stabilizzazione Overview + Risposte + logica duplicati

### Stato attuale (molto avanzato)

Il sistema FRINGE Interview ha raggiunto una fase quasi completa lato:

- struttura runtime ✔
- rendering report PRO ✔
- UX delle pagine principali ✔
- gestione anomalie nelle risposte (duplicate, evasive, non_answer, etc.) ✔

---

## 🔥 Miglioramenti chiave implementati

### 1. Overview (Situazione)
- struttura visiva stabilizzata (dark + blocchi coerenti)
- separazione chiara:
  - lettura
  - leve
  - criticità
  - coaching
- introdotto:
  - `openingAssessment` (valutazione esplicita apertura)
  - base per `contextCarryoverCredit`

👉 l’opening ora NON è più neutra:
→ esplicita se il racconto genera o meno credibilità

---

### 2. Risposte (Workspace PRO)

#### UX stabilizzata:
- domanda + risposta leggibili (scroll controllato)
- colonna SX = analisi
- colonna DX = miglioramento (chiara finalmente)
- evidenziazione forte dei consigli operativi

#### Fix importanti:
- allineamenti risolti
- gerarchie visive coerenti
- colori finalmente funzionali (non decorativi)

---

### 3. Gestione risposte duplicate (nuovo livello qualitativo)

Implementato:

- detection già presente (runtime)
- aggiunto:
  - blocco rosso evidente
  - override summary nel render
  - override aderenza domanda

👉 Effetto:
una risposta duplicata NON può più risultare “abbastanza buona”

---

### 4. Problema risolto (importante)
Contraddizione interna:

PRIMA:
- duplicato → penalizzato
- ma commenti → positivi

ORA:
- duplicato → coerentemente negativo ovunque

---

## 🧠 Stato concettuale attuale

### Il sistema ora distingue:

- risposta “formalmente ok”
- risposta “credibile”
- risposta “che porta evidenza”

👉 enorme salto di qualità

---

## ⚠️ Limite attuale emerso

### Groq — limite TPD

- limite raggiunto frequentemente
- sviluppo rallentato

👉 decisione:
- introdurre modalità:
  - low consumption dev
  - uso JSON salvati

---

## 🔜 Elementi chiave ancora da completare

### 1. Context Carryover Credit (CRITICO)
- logica avviata ma non completa
- deve:
  - influenzare lettura risposte successive
  - ridurre richieste ridondanti
  - aumentare percezione “intelligenza sistema”

---

### 2. Pagina CV (STRATEGICA)
- non ancora sviluppata pienamente
- deve diventare:
  - base di credibilità
  - ponte opening → risposte

---

### 3. Pagine PREMIUM
- non ancora progettate a fondo
- sono fondamentali per monetizzazione

---

### 4. Flow intervista (front-end)
- ancora da costruire bene
- oggi test harness tecnico, non prodotto

---

## 🎯 Priorità corretta (validata)

1. Context Carryover Credit
2. CV Analysis Page
3. Flow intervista (UI reale)
4. Premium layers

---

## 📌 Nota strategica

Il sistema NON è più un prototipo.

👉 È già un prodotto potenziale

Ora il rischio NON è tecnico  
👉 ma di dispersione / priorità sbagliate

## Aggiornamento — PRO Report / Context Carryover / Falso positivo elegante

### Stato raggiunto
- Pagina `Situazione` molto migliorata:
  - titoli più standardizzati;
  - blocco `Interventi prioritari` visibile e forte;
  - blocco opening più leggibile;
  - risposte chiave più leggibili.
- Pagina `Risposte` migliorata:
  - titolo standard per domanda/risposta;
  - titolo `Lettura e miglioramento della risposta`;
  - blocco rosso per risposte duplicate;
  - summary duplicati corretto;
  - alert `Punto da correggere per primo` ok.
- `contextCarryoverCredit` ora viene generato dalla risposta di apertura e salvato nello stato intervista:
  - in `answers[0].contextCarryoverCredit`
  - e in `interviewState.contextCarryoverCredit`
- `buildAllAnswersWorkspace(runtimeAnswers)` ora passa `openingCredit` a `buildAnswerWorkspaceItem`.
- Le risposte successive possono mostrare nota tipo:
  - “Poiché l’apertura non ha costruito abbastanza credibilità concreta…”

### Modifiche importanti già fatte
- `buildOpeningBlock` in `composeInterviewSession.js` trasformato in vera domanda 1 sul percorso/CV.
- `PHASE_CONFIG.OPENING` aggiornato in `createInterviewRuntime.js` e `advanceInterviewRuntime.js`.
- `buildContextCarryoverCreditFromOpening(answerAnalysis)` presente in `advanceInterviewRuntime.js`.
- `updateContextCarryoverCredit(interviewState, answerRecord)` salva il credit nello stato.
- `buildProReportV2.js`:
  - `buildOperationalPriorities(runtimeAnswers)` aggiunto.
  - `operationalPriorities` aggiunto in `overview`.
  - `buildAnswerWorkspaceItem(answer, index, context = {})` riceve `openingCredit`.
  - `contextLinkNote` filtrato: mostrato solo se utile.
  - `displaySummary` corregge duplicati.
- `renderProReportHtml.js`:
  - modulo `operationalPriorities` renderizzato nella pagina Situazione;
  - aggiunto case in `renderOverviewModule`;
  - aggiunto `operationalPriorities` in `overviewModuleKeys`;
  - blocco hot priority usa classi dedicate:
    - `hot-priority-box`
    - `hot-priority-row`
    - `hot-priority-index`
    - `hot-priority-text`.

### Problema aperto principale
È emerso un falso positivo importante:

Una risposta “suona bene” ma probabilmente non risponde davvero alla domanda.  
Esempio risposta:

> “In quel caso ho deciso di rinunciare ad alcune analisi secondarie per concentrarmi sulle metriche più affidabili...”

Il report la legge ancora come:

> “La risposta è abbastanza convincente…”

ma l’utente osserva correttamente che potrebbe essere evasiva/fuori tema rispetto alla domanda.

### Tentativo fatto ma non risolutivo
In `buildAnswerWorkspaceItem` abbiamo provato a intercettare off-topic con:

```js
const questionAlignment = Number(analysis?.dimensionScores?.questionAlignment ?? 100);

const rawOffTopicRisk = String(
  questionContext?.offTopicRisk ||
  analysis?.questionContext?.offTopicRisk ||
  ""
).toLowerCase();

const isOffTopic =
  problematicAnswerType === "off_topic" ||
  rawOffTopicRisk === "high" ||
  questionAlignment < 70;

  # CONTINUITY — FRINGE INTERVIEW / PRO REPORT CV + ANSWERS UPDATE

## Stato attuale

Il progetto FRINGE Interview è nella fase di consolidamento PRO report e trasformazione del report da output tecnico a prodotto navigabile, leggibile e vendibile.

Focus attuale:
- CV page
- Answer workspace
- collegamento CV → risposta → credibilità
- prime logiche di riposizionamento / potenziale candidato

---

## Modifiche implementate

### 1. CV raw salvato nella sessione

File modificato:

- `src/app/runFringeInterviewMVPSession.js`

Ora il risultato contiene:

```json
fringeInterviewMVPSession.rawInput.cvText

# CONTINUITY UPDATE — UI/UX POLISH + RESPONSIVE PASS (PRO REPORT)

## Stato generale raggiunto

Il report PRO ha ormai superato l’aspetto “prototype/debug UI” ed è entrato in una fase molto più coerente lato prodotto.

Miglioramenti forti ottenuti:

- gerarchia visiva più chiara
- separazione migliore tra overview / lettura sintetica / analisi dettagliata
- uniformazione dei pulsanti espandibili
- standardizzazione parziale dei titoli sezione
- migliore leggibilità delle aree coaching
- mobile responsive finalmente funzionante
- identità visuale più “tool professionale”

---

# RESPONSIVE / MOBILE

## Problema principale risolto

La pagina “Situazione” rompeva completamente il layout mobile e desktop a causa di molteplici blocchi CSS duplicati relativi a:

```css
.situation-snapshot-grid

Esistevano circa 15 override concorrenti.

Soluzione adottata

Pulizia di TUTTI i duplicati e mantenimento di un unico “single source of truth” finale nel CSS.

Struttura finale:

.situation-snapshot-grid {
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
}

con media query:

tablet → 2 colonne
mobile → 1 colonna

RISULTATO:

desktop tornato corretto
mobile finalmente leggibile
HEADER / BRANDING
Rebranding header superiore

Vecchio formato:

FRINGE Interview · PRO
Preparare il tuo prossimo colloquio, sul serio!

Nuova struttura:

FRINGE
Interview · PRO
payoff:
Preparare il colloquio,
sul serio.
Obiettivo

Trasformare l’header:

da testo tecnico
a proto-brand/logo

Preparazione futura:

possibile logo grafico reale
tagline stabile
CSS importante

Sono stati introdotti:

.fringe-brand-block
.fringe-brand-main
.fringe-brand-sub
.fringe-tagline
.pro-mini-hero

con gestione desktop/mobile separata.

OVERVIEW / SITUAZIONE PAGE
Snapshot cards

Miglioramenti:

ridotta altezza
ridotto padding
bottoni meno “ecommerce”
look più professionale

Le 4 snapshot:

CV
Apertura
Risposte
Tenuta complessiva

ora sono leggibili sia desktop sia mobile.

PULSANTI GIALLI STANDARD

È emerso un linguaggio UI coerente:

giallo = area espandibile / azione / approfondimento.

Utilizzato per:

“Elementi del CV...”
“Analisi dettagliata...”
“Interventi prioritari...”
“Criticità...”

Questo linguaggio funziona bene e va mantenuto.

LETTURA SINTETICA DELLA RISPOSTA
Miglioramenti fatti
sfondo dedicato alla sezione
migliore gerarchia
pillole:
punto da correggere
collegamento CV/apertura
aderenza domanda

ora leggibili e separate.

ADERENZA ALLA DOMANDA

Prima:

ripetitiva
identica su tutte le risposte

Ora:

variazioni linguistiche automatiche
tono più umano
rotazione testi

Funzione coinvolta:

renderQuestionAlignmentAlert()
AREA CV SUPPORT
Evoluzione importante

Prima:

riquadro sempre aperto
troppo ripetitivo

Ora:

area collapsable
funzione più da “memo operativo”
titolo aggiornato

Nuovo concetto:
non “questi sono i problemi” ma:
“questi segnali del CV possono rafforzare la risposta”.

Molto più corretto semanticamente.

ANALISI DETTAGLIATA RISPOSTA
Direzione confermata

Struttura ora:

SX:

analisi risposta
segmenti
debolezze
cosa manca
altri elementi utili

DX:

come rafforzarla
suggerimenti
versione migliorata
spunto risposta
SEGMENTI RISPOSTA

Decisione importante:

NON nascondere:

rosso
giallo
verde

al primo livello.

È stata provata una versione con collapsable unico:
RISULTATO NEGATIVO:

si perdeva subito la percezione dei problemi.

Decisione finale:

mantenere almeno un segmento aperto per tipo
eventuali extra espandibili solo oltre il primo livello.
DIREZIONE PRO / PREMIUM
Decisione strategica molto importante

PRO:

report esportabile/stampabile
documento finale persistente dell’esperienza FRINGE

PREMIUM:

storico simulazioni
tracking miglioramenti
confronto:
stesso target
target differenti
maturità narrativa
crescita capacità colloquio
evoluzione CV

Questo è stato identificato come:

valore molto forte lato coaching
forte leva commerciale
forte meccanismo di retention

Concetto chiave:
FRINGE non solo “valuta”
ma mostra la progressione del candidato nel tempo.

STATO ATTUALE

Il progetto è entrato in una fase:

molto più UX/UI
molto meno “debug tecnico”

La qualità percepita del prodotto è aumentata molto.

Priorità prossime:

typography pass centralizzato
token UI (radius/shadow/padding)
mobile refinement pass
architettura export PDF/report
consolidamento design system

UI / MOBILE REFACTOR — REPORT PRO (APRILE 2026)
Situazione generale

Refactor importante della pagina “Situazione” del report PRO per migliorare:

leggibilità mobile
coerenza visuale desktop/mobile
gerarchia dei contenuti
compressione verticale
gestione espansioni
Hero/Header
Aggiornato mini hero superiore

Nuova struttura:

brand a sinistra:
FRINGE
Interview · PRO
payoff a destra:
“Preparare il colloquio, sul serio.”

Migliorata leggibilità mobile e separazione visiva brand/payoff.

Barra tab orizzontale

Confermato approccio:

scroll orizzontale mobile
desktop full-width
indicatori visivi scroll presenti
Pagina “Situazione”
Snapshot iniziali

Confermato layout:

Desktop:

4 card affiancate

Mobile:

card impilate verticalmente

Ridotti:

font-size
line-height
padding verticali
gap tra card

Migliorata compattezza generale mobile.

Espansione “Apertura del colloquio”

Refactor importante.

Problemi risolti
pannello che si apriva già aperto
overlay / scroll errato
chiudi invisibile
titolo sovrapposto ai contenuti
contenuti che finivano sotto i titoli
testi invisibili per conflitti CSS
doppie sezioni ridondanti
pillole colore poco leggibili
Decisioni UX
Mobile:
eliminare doppie colonne quando peggiorano leggibilità
ridurre aggressività tipografica (“testi gridati”)
preferire sequenza verticale chiara
Desktop:
mantenere densità informativa più alta
Sezione “Lettura del CV come base di credibilità…”

Nuova logica:

titolo principale unico
“Elementi già spendibili” e “Punti da spiegare meglio” diventano pillole interne
legenda priorità associata SOLO alla parte criticità/risk

Osservazione aperta:

la legenda priorità potrebbe ancora creare lieve ambiguità visuale → possibile redesign futuro.
Qualità contenuti (IMPORTANTISSIMO)

Decisione strategica confermata:

NON bastano frasi astratte tipo:

“Esistono elementi trasferibili”
“Profilo leggibile”
“Base narrativa utilizzabile”

Il sistema deve:

recuperare elementi concreti del CV
citare competenze/esperienze reali
spiegare QUALI elementi sono trasferibili
collegare il CV al ruolo target in modo tangibile

Questa direzione è considerata fondamentale per:

credibilità prodotto
percezione valore
effetto coaching reale
fiducia del candidato
Strategia prodotto PRO / PREMIUM

Confermato valore strategico:

PRO
report esportabile/stampabile
documento persistente dell’esperienza FRINGE
PREMIUM
storico simulazioni
confronto progressione nel tempo
tracking miglioramento:
qualità risposte
posizionamento
maturità narrativa
coerenza CV/target
efficacia colloquio

Vista come feature ad alto valore commerciale e psicologico.

TODO FUTURI
Mobile-specific layout system

Da fare più avanti:

non solo resize responsive,
ma layout mobile realmente differenziato:

compressioni progressive
sezioni collassabili native
densità informativa diversa da desktop
priorità lettura mobile-first

# CONTINUITY UPDATE — FRINGE UI STANDARD v0.9

## Decisione importante

È stato introdotto uno standard estetico/tipografico preliminare per il report PRO, chiamato:

**FRINGE UI STANDARD v0.9**

Obiettivo:
- smettere di procedere per tentativi visivi locali
- evitare colori/font/spacing casuali
- ridurre regressioni desktop/mobile
- creare una base coerente per tutte le future sezioni del report

Lo standard NON è ancora “definitivo scolpito al 100%”, ma è approvato come riferimento operativo preliminare.

Da ora in avanti:
- niente nuovi inline style casuali
- niente nuovi colori inventati
- niente font-size scelti a occhio
- nuove sezioni da costruire usando token e classi standard `fr-*`

---

## Token CSS introdotti

Nel blocco `:root` sono stati aggiunti token FRINGE, mantenendo anche i vecchi token legacy.

Categorie definite:

### Colori
- `--fr-bg`
- `--fr-ink`
- `--fr-muted`
- `--fr-primary-1`
- `--fr-primary-2`
- `--fr-dark-1`
- `--fr-dark-2`
- `--fr-positive-1`
- `--fr-positive-2`
- `--fr-risk-1`
- `--fr-risk-2`
- `--fr-warning-1`
- `--fr-warning-2`
- `--fr-soft-border`

### Tipografia desktop
- `--fr-title-main`
- `--fr-title-section`
- `--fr-title-card`
- `--fr-pill`
- `--fr-body`
- `--fr-dense`
- `--fr-caption`

### Tipografia mobile
Media query `max-width: 640px` con valori più compatti:

```css
@media (max-width: 640px) {
  :root {
    --fr-title-main: 18px;
    --fr-title-section: 16px;
    --fr-title-card: 15px;
    --fr-pill: 12px;
    --fr-body: 13px;
    --fr-dense: 12px;
    --fr-caption: 11px;
  }
}

pacing
--fr-xs
--fr-sm
--fr-md
--fr-lg
--fr-xl
Radius
--fr-radius-sm
--fr-radius-md
--fr-radius-lg
--fr-pill-radius
Ombre
--fr-shadow-sm
--fr-shadow-md
Classi standard introdotte

Sono state create classi base fr-* da usare progressivamente:

.fr-title-primary
.fr-card
.fr-note
.fr-pill
.fr-pill-positive
.fr-pill-risk
.fr-text
.fr-section-stack
.fr-close-button

Queste classi rappresentano il nuovo linguaggio UI FRINGE.

Sezione campione migrata

È stata riscritta come prova standardizzata la funzione:

renderOpeningPositioningModule(module)

La sezione “Apertura del colloquio” ora usa il nuovo sistema fr-* per:

titolo principale
pulsante chiudi
note descrittive
card
sottosezioni
pillole positive/risk
testo standard
mobile layout
Esito prova desktop/mobile
Desktop

La nuova sezione risulta:

più coerente
più leggibile
più ordinata
meno caotica rispetto ai vecchi blocchi CSS/inline style
Mobile

La prima prova era ancora troppo “grande/gridata”.

È stata corretta riducendo i token mobile:

body a 13px
dense a 12px
caption a 11px
title section a 16px
title card a 15px

Dopo il passaggio, la sezione mobile è risultata molto più leggibile e più vicina a un prodotto reale.

Regola operativa da ora in avanti

Quando si crea o modifica una sezione del report PRO:

usare token --fr-*
usare classi fr-*
evitare nuovi inline style
verificare sempre:
desktop
mobile a larghezza 390px
non correggere più a tentativi locali se il problema riguarda stile generale
se serve un nuovo pattern UI, prima lo si definisce nello standard
Standard mobile di riferimento

Per test mobile usare Edge/Chrome DevTools:

Device mode
width: 390px
height: 844px
zoom: 100%

Controlli secondari:

360px
430px

Se regge 360 / 390 / 430, il responsive è considerato stabile.

# FRINGE UI STANDARD v1.0

## Principio generale

Da ora in avanti le nuove sezioni del report PRO devono usare lo standard UI FRINGE:

- niente dimensioni testo inventate localmente
- niente colori casuali
- niente inline style salvo casi eccezionali
- usare token `--fr-*`
- usare classi standard `fr-*`
- verificare sempre desktop + mobile 390px

---

## Mobile / Desktop

Desktop:
- più densità informativa
- sezioni leggibili anche aperte
- confronto visivo possibile

Mobile:
- una cosa per volta
- navigazione tramite chip orizzontali
- pannelli verticali apribili
- un solo pannello principale aperto alla volta
- evitare 2 colonne
- evitare scroll infinito non guidato

---

## Pattern standard per sezioni lunghe

Ogni sezione lunga deve avere:

1. Titolo principale
2. Summary descrittivo visibile
3. Barra chip orizzontale
4. Pannelli verticali corrispondenti
5. Un solo pannello aperto alla volta
6. Chip attiva evidenziata in giallo
7. Click sul titolo/pannello = apre/chiude
8. Scroll automatico accettabile ma non da rifinire a pixel ora

Pattern approvato su:
`renderOpeningPositioningModule`

---

## Standard chip navigazione

Chip inattiva:
- fondo chiaro/lilla
- bordo visibile
- testo blu scuro
- deve sembrare cliccabile

Chip attiva:
- fondo giallo
- testo scuro
- indica posizione corrente

---

## Standard priorità

Usare pallini dimensionali, NON legenda testuale e NON emoji.

Priorità alta:
- pallino rosso grande

Priorità media:
- pallino arancio medio

Da tenere presente:
- pallino grigio piccolo

CSS approvato:

```css
.weighted-item {
  display: grid !important;
  grid-template-columns: 24px minmax(0, 1fr) !important;
  gap: 8px !important;
  align-items: start !important;
  margin-top: 12px !important;
}

.weighted-priority-dot {
  display: inline-block;
  border-radius: 999px;
  margin-top: 4px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);
}

.weighted-priority-dot.high {
  width: 18px;
  height: 18px;
  background: #ef4444;
}

.weighted-priority-dot.mid {
  width: 15px;
  height: 15px;
  background: #f59e0b;
  margin-left: 1px;
}

.weighted-priority-dot.low {
  width: 11px;
  height: 11px;
  background: #94a3b8;
  margin-left: 3px;
}

.weighted-text {
  font-size: var(--fr-body) !important;
  line-height: 1.45 !important;
  font-weight: 700 !important;
  color: var(--fr-ink) !important;
}

@media (max-width: 640px) {
  .weighted-item {
    grid-template-columns: 24px minmax(0, 1fr) !important;
    gap: 8px !important;
  }

  .weighted-priority-dot.high {
    width: 17px;
    height: 17px;
  }

  .weighted-priority-dot.mid {
    width: 14px;
    height: 14px;
  }

  .weighted-priority-dot.low {
    width: 10px;
    height: 10px;
  }
}

function renderWeightedList(items = []) {
  return items.map((text, index) => {
    const level = index === 0 ? "high" : index === 1 ? "mid" : "low";

    return `
      <div class="weighted-item ${level}">
        <span class="weighted-priority-dot ${level}"></span>
        <span class="weighted-text">${escapeHtml(text)}</span>
      </div>
    `;
  }).join("");
}

Nota contenuti

Quando FRINGE parla di CV o trasferibilità, evitare frasi astratte tipo:

“elementi trasferibili”
“profilo leggibile”
“base narrativa utilizzabile”

Obiettivo futuro:

citare elementi concreti del CV
spiegare quali competenze sono trasferibili
collegare CV → ruolo target con esempi reali
Prossimi step
Consolidare CSS standard in una zona unica.
Migrare progressivamente le altre sezioni.
Prossima sezione consigliata: Risposte.
Poi grounding dei contenuti sul CV reale.

# UPDATE — UI STANDARDIZATION + OPENING MODULE STABILIZATION

## Stato raggiunto

La sezione “Apertura del colloquio” è diventata il primo modulo realmente stabilizzato lato UX/UI.

Sono stati fissati:

- token tipografici globali (`--fr-*`)
- classi standard (`fr-card`, `fr-title-primary`, `fr-pill`, `fr-note`, ecc.)
- comportamento mobile/desktop coerente
- navigazione secondaria orizzontale con chip
- pannelli espandibili verticali
- un solo pannello aperto alla volta
- struttura “summary → navigazione → approfondimento”

---

## Decisione UX importante

Per mobile:
- evitare scroll infinito non guidato
- evitare 2 colonne
- mostrare una sola area aperta
- usare chip orizzontali persistenti come orientamento

La navigazione secondaria deve:
- indicare sempre dove ci si trova
- permettere salto rapido tra sottosezioni
- mantenere visibile la struttura della pagina

---

## Standard priorità approvato

Abbandonate:
- legende verbose
- emoji fuoco
- spiegazioni lunghe

Adottato:
- pallini dimensionali
  - rosso grande = alta priorità
  - arancio medio = priorità media
  - grigio piccolo = da tenere presente

Questo standard sarà riusato in tutto FRINGE.

---

## Direzione contenuti confermata

Le sezioni coaching NON devono limitarsi a:
- “profilo leggibile”
- “elementi trasferibili”
- “base narrativa”

Devono invece:
- recuperare elementi concreti del CV
- spiegare quali esperienze sono trasferibili
- collegare CV → ruolo target
- evidenziare chiaramente quando l’apertura NON costruisce credibilità sufficiente

Questo principio diventa fondamentale per tutta la futura pagina “Risposte”.

--
## Prossimo step

Migrazione della pagina “Risposte” usando:

- stesso standard UI
- stessa architettura pannelli/chip
- stessa leggibilità mobile
- stesso grounding concreto sui contenuti reali

# CONTINUITY UPDATE — FRINGE PRO REPORT / OPERATIONAL ACTION PLAN

## Stato raggiunto

Completata una fase importante del PRO Report: la sezione “Risposte” è ormai stabile lato mobile/UX e il report ha iniziato a evolvere da analisi descrittiva a vero strumento di coaching operativo.

---

## 1. Sezione “Risposte” — stato attuale

La sezione “Risposte” può essere considerata stabile come standard mobile v1.

Completato:
- larghezze mobile recuperate;
- box interni allargati;
- “Segnali CV utili” reso più leggibile;
- “Come potrebbe suonare meglio” migliorato;
- summary ripetitivi corretti;
- feedback off-topic/duplicate più coerenti;
- filtro dei missing signals in base al tipo di domanda.

Decisione:
- non toccare più la sezione Risposte salvo bug evidenti.

---

## 2. Fix importante — summary ripetitivi

Problema:
5 risposte su 6 mostravano quasi la stessa lettura sintetica.

Soluzione:
introdotta logica di summary differenziato in `buildProReportV2.js`.

Nuove funzioni:
- `pickRotatingText`
- `getPrimaryAnswerWeakness`
- `buildAnswerDisplaySummary`

Effetto:
- meno effetto template;
- feedback più umano;
- migliore percezione “coach intelligente”.

---

## 3. Fix importante — coerenza domanda / commenti

Problema:
in domande decisionali comparivano gap CV non pertinenti, es. “Strumenti BI specifici”.

Soluzione:
raffinata `buildCvSupportRead()`:
- le domande decision/trade-off ora filtrano gap tecnici generici;
- focus su:
  - contesto;
  - scelta;
  - rinuncia/trade-off;
  - criterio;
  - effetto concreto.

Aggiornata anche:
- `buildCvMissingSignalView()`

per usare linguaggio più umano e meno tecnico/HR.

---

## 4. Evoluzione “Segnali CV utili”

La sezione “Segnali CV utili” è stata resa meno schematica.

Nuovo modello:
- box coach: “Come usare il CV in questa risposta”
- sotto: “Punti del CV che puoi richiamare”

Principio:
il CV non va usato come elenco, ma come fonte di episodi concreti.

---

## 5. Nuovo modulo — Operational Action Plan

Introdotto nuovo modulo dati:

`overview.operationalActionPlan`

Generato da:
`buildOperationalActionPlan(...)`

Struttura:
- `globalPriorities`
- `answerPriorities`
- `cvPriorities`

Ogni priorità contiene:
- `level`
- `weight`
- `title`
- `why`
- `action`
- `seenIn`

Obiettivo:
trasformare il report in lista operativa ordinata per impatto.

---

## 6. Render nuovo modulo “Priorità operative”

Il modulo viene mostrato nella pagina “Situazione”, dentro “Cosa approfondire adesso”.

Decisione UX:
- metterlo in fondo alle espansioni;
- prima l’utente legge le aree di analisi;
- poi trova la sintesi operativa.

Render stabilizzato:
- eliminato doppio annidamento;
- eliminato doppio sottotitolo;
- numero progressivo rosso;
- score e livello come badge;
- testo a larghezza piena;
- layout mobile più leggibile.

Funzioni coinvolte:
- `renderOperationalActionPlanModule`
- `renderOperationalActionPlanContent`
- `renderSituationExpandableBlock`
- `renderOverviewSituationSection`

---

## 7. Stato strategico

Il report sta passando da:

“analisi intelligente”

a:

“coach operativo che organizza priorità, impatto e azioni”.

Questo è un salto importante per il posizionamento PRO.

---

## 8. Prossime priorità consigliate

### Priorità 1 — test robustezza su altri profili
Test rapido su:
- un profilo junior;
- un profilo senior diverso.

Da verificare:
- `operationalActionPlan`;
- “Segnali CV utili”;
- “Cosa manca nella risposta”;
- summary risposte;
- coerenza domanda/commenti.

Scopo:
capire se il sistema è robusto o se è troppo cucito sul caso attuale.

### Priorità 2 — sezione CV
Portare la sezione CV allo standard `fr-*` e renderla più concreta.

Obiettivo:
- non dire solo “elementi trasferibili”;
- dire quali elementi del CV contano davvero;
- collegarli a ruolo, apertura e risposte.

### Priorità 3 — evitare overfitting
Attenzione:
molte migliorie sono state sviluppate su un caso ricorrente.

Serve validazione su casi diversi prima di rifinire troppo.

## Debug senior decision answer

Creato script locale:
`scripts/debug_answer_shape_senior_decision.js`

Risultato:
- offTopicRisk = low
- questionAlignment = 74
- problematicAnswerType = none
- tradeoffMarkers = 3

Quindi il fix ha risolto il falso off-topic a livello analyzer.

Problema rimasto:
il punteggio resta basso perché evidenceMarkers/exampleMarkers/structure/reflection non riconoscono bene una risposta decisionale sintetica ma coerente.

Prossimo intervento:
tarare scoring decisionale:
- se `questionContext.isDecision`
- e `tradeoffMarkers >= 2`
- e la risposta contiene scelta + conseguenza
allora alzare evidence/structure o applicare un floor score ragionevole, es. 58–65, senza renderla automaticamente ottima.

Nota:
non rilanciare Groq inutilmente; usare debug locale prima.

## Continuity update — role-fit / off-topic calibration

### Stato raggiunto

Corretto il riconoscimento delle domande `role_fit` nel sistema di inferenza del question context.

Problema iniziale:
domande tipo:

* “Perché questo ruolo ti sembra il passo successivo naturale?”
* “Why this role?”
* “Natural next step?”

non venivano riconosciute come `isRoleFit`.

Conseguenza:

* `questionAlignment` risultava artificialmente alto
* risposte fuori asse ma formalmente professionali prendevano score troppo indulgenti (~50+)
* il sistema non distingueva abbastanza tra:

  * risposta professionalmente formulata
  * risposta realmente aderente alla logica della domanda

---

## Fix applicato

### File

`analyzeAnswerShape.js`

### Funzione

`inferQuestionType(...)`

### Estensione trigger `isRoleFit`

Aggiunti:

* `lowerNarrativeRole === "role_fit"`
* `lowerQuestionKey.includes("role_fit")`
* `lowerQuestionKey.includes("role")`
* `lowerQuestionKey.includes("fit")`

e trigger testuali:

* `"passo successivo"`
* `"passo naturale"`
* `"perché questo ruolo"`
* `"perche questo ruolo"`
* `"ruolo ti sembra"`
* `"natural next step"`
* `"why this role"`

e expected signals:

* `"role fit"`
* `"relevant experience"`
* `"transition logic"`

---

## Risultato ottenuto

### Prima

Debug `misaligned`:

* `questionAlignment ≈ 58`
* `overallScore ≈ 51`
* risposta percepita come “abbastanza valida”

nonostante NON rispondesse davvero alla logica del ruolo.

### Dopo

Debug:

* `isRoleFit = true`
* `questionAlignment = 26`
* `overallScore = 44`
* `overallBand = weak`

Nuovo summary:

> “La risposta porta elementi operativi utili, ma non risponde davvero alla logica del passaggio verso questo ruolo: manca il collegamento tra percorso, motivazione e ruolo target.”

Comportamento considerato corretto:

* la risposta NON è nonsense
* NON è completamente fuori tema
* ma NON risponde davvero alla domanda principale

Quindi:

* score debole ma non azzerato
* feedback più realistico da recruiter/head hunter

---

## Altro fix importante (decision answers)

Taratura migliorata delle risposte `decision_tradeoff`.

Problema iniziale:
risposte corrette su trade-off / priorità / conseguenze prendevano:

* `18`
* `overallBand weak`
* feedback quasi “off topic”

perché:

* mancavano `exampleMarkers`
* mancavano `evidenceMarkers`
* struttura troppo penalizzata

anche quando:

* tradeoff era chiarissimo
* scelta era presente
* conseguenza era presente

---

## Intervento effettuato

Aggiunti marker specifici:

* `decisionChoiceMarkers`
* `decisionConsequenceMarkers`
* `decisionCriterionMarkers`

e applicato boost condizionale per:

* evidence
* ownership
* structure
* reflection

quando:

* `questionContext.isDecision`
* `tradeoffMarkers >= 2`
* presente scelta + criterio + conseguenza

---

## Risultato

### Prima

* score ~18
* feedback troppo severo / incoerente

### Dopo

Debug locale:

* `overallScore = 59`
* `overallBand = medium`
* `questionAlignment = 74`

Weakness rimaste:

* reflection
* ownership parziale

Comportamento molto più realistico:
la risposta non è eccellente, ma è una risposta decisionale credibile.

---

## Nota importante

Non rimuovere le penalizzazioni “hard” introdotte nei test precedenti.

Sono state necessarie per intercettare:

* pseudo-risposte professionali ma vuote
* opening generiche
* risposte formalmente eleganti ma non aderenti
* esempi apparentemente forti ma scollegati dalla domanda

Il problema NON era la severità in sé:
era che alcune domande non venivano classificate correttamente (`role_fit`, `decision`, ecc.).

Una volta corretto il context typing:
le penalizzazioni tornano sensate.

---

## Direzione futura (NON ancora implementata)

Possibile comportamento “head hunter realistico”:

quando una risposta:

* fraintende la domanda
* o resta fuori asse

il runtime potrebbe:

1. fare un affondo chiarificatore
2. spiegare meglio cosa si stava cercando
3. rivalutare la seconda risposta

Se il candidato continua:

* fuori tema
* evasivo
* laterale

allora:

* penalizzazione forte
* aumento `offTopicRisk`
* riduzione credibilità generale

Questo renderebbe il colloquio:

* molto più umano
* molto più realistico
* molto più vicino al comportamento reale di recruiter senior.

Humanized repeated coaching hints (NEW DIRECTION)

Problema osservato:

i suggerimenti “Come puoi rafforzarla” risultavano troppo meccanici e ripetitivi
la semplice deduplica eliminava eccessivamente i consigli, lasciando alcune risposte senza guidance utile
il comportamento risultava artificiale soprattutto quando lo stesso errore compariva in più risposte

Nuova direzione approvata:
separare:

messaggio tecnico
tono / progressione conversazionale

Esempio:

base technical hint:

“serve un episodio concreto con contesto, azione e risultato”

humanization layer:

prima volta → “Qui conviene lavorare su un punto preciso: …”
seconda volta → “Questo punto torna di nuovo: …”
terza volta → “Il pattern si sta confermando: …”
quarta volta → “Qui il segnale diventa importante: …”

Obiettivo:

mantenere continuità e memoria degli errori
evitare effetto copia/incolla
simulare il comportamento di un recruiter reale che nota pattern ricorrenti
rendere il coaching più umano e progressivo

Direzione futura:
introdurre una funzione tipo:

humanizeRepeatedHint({
  theme,
  baseMessage,
  repetitionCount,
  answerIndex
})

riutilizzabile anche per:

leadership
ownership
genericità
creatività
empatia
ascolto
pressione
comunicazione
decision making

Visione prodotto:
la ripetizione non deve essere eliminata artificialmente:
deve diventare “intelligente” e mostrare l’evoluzione (o la persistenza) dei pattern del candidato lungo il colloquio.

## Adaptive follow-up recovery — consistency / misunderstanding probe

Stato aggiornato: struttura adaptive follow-up recuperata e riattivata in modo conservativo.

### File coinvolti

- `src/interview/selectAdaptiveFollowup.js`
- `src/interview/injectAdaptiveFollowup.js`
- `config/followup_packs.it.json`
- `config/followup_packs.json`

### Pack aggiunti

Aggiunti nei follow-up pack:

- `decision_tradeoff_probe`
- `consistency_probe`

`decision_tradeoff_probe` serve quando una domanda chiede decisione / trade-off / priorità ma la risposta resta generica o non chiarisce cosa è stato scelto, cosa è stato lasciato fuori e con quale criterio.

`consistency_probe` serve quando la risposta non centra davvero la domanda, o quando il candidato risponde a un tema vicino ma diverso. È pensato come affondo “recruiter-like”:

> Ti riformulo la domanda: quello che vorrei capire è il punto specifico richiesto, non un tema vicino. Puoi rispondere restando su questo?

### Fix JSON

Nel file italiano c’era un errore strutturale:

```json
"packs": {
  "packs": {

Corretto rimuovendo il doppio livello packs.

Validazione eseguita con successo:

node -e "JSON.parse(require('fs').readFileSync('config/followup_packs.it.json','utf8')); console.log('followup_packs.it.json OK')"

Validata anche la versione inglese:

node -e "JSON.parse(require('fs').readFileSync('config/followup_packs.json','utf8')); console.log('followup_packs.json OK')"
Modifica a selectAdaptiveFollowup.js

Aggiunta logica di priorità per misalignment prima della scelta per fase/famiglia/dimensione.

Nuove funzioni:

function getQuestionAlignment(answerRecord) {
  return getDimensionScore(answerRecord, "questionAlignment");
}

function getOffTopicRisk(answerRecord) {
  return normalizeString(
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.questionContext?.offTopicRisk
  ).toLowerCase();
}

function getProblematicAnswerType(answerRecord) {
  return normalizeString(
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.problematicAnswerType
  ).toLowerCase();
}

function preferredTriggerByMisalignment(answerRecord) {
  const questionAlignment = getQuestionAlignment(answerRecord);
  const offTopicRisk = getOffTopicRisk(answerRecord);
  const problematicType = getProblematicAnswerType(answerRecord);

  if (
    problematicType === "off_topic" ||
    problematicType === "evasive" ||
    offTopicRisk === "high" ||
    (questionAlignment !== null && questionAlignment < 45)
  ) {
    return "consistency_probe";
  }

  return "";
}

Dentro selectAdaptiveFollowup, dopo calcolo di:

const phasePreferred = preferredTriggerByPhase(phaseName);
const familyPreferred = preferredTriggerByFamily(currentFamilyKey);
const dimensionPreferred = preferredTriggerByDimensions(answerRecord, phaseName);

aggiunto:

const misalignmentPreferred = preferredTriggerByMisalignment(answerRecord);

const misalignmentPack = findAvailablePackByTrigger(
  sessionFollowupBlocks,
  usedAdaptiveTriggerTypes,
  misalignmentPreferred
);

if (misalignmentPack) {
  return misalignmentPack;
}
Test eseguito

Import test passato:

node -e "import('./src/interview/selectAdaptiveFollowup.js').then(() => console.log('selectAdaptiveFollowup import OK'))"
Significato prodotto

Il sistema ora distingue meglio:

risposta debole ma pertinente
risposta fuori asse / candidato che non ha capito la domanda

Ordine logico desiderato:

Se la risposta non centra la domanda → consistency_probe
Se è pertinente ma debole → affondo per fase / famiglia / dimensione
Se manca ownership → responsibility_probe
Se manca evidenza/risultato → achievement_quantification
Se manca trade-off → decision_tradeoff_probe

Questo recupera la logica originaria degli affondi da head hunter senza costruire un sistema parallelo.

Prossimo passo consigliato

Verificare con test runtime che consistency_probe venga davvero iniettato quando:

questionAlignment < 45
oppure offTopicRisk = high
oppure problematicAnswerType = off_topic/evasive

Non usare Groq se non necessario. Prima cercare o creare test locale su selectAdaptiveFollowup.

## Adaptive follow-up question-aware recovery

### Stato aggiornato

Dopo aver recuperato i pack adaptive:
- `decision_tradeoff_probe`
- `consistency_probe`

è stato fatto un primo passo per rendere gli affondi **question-aware**.

Problema:
il pack adaptive mostrava solo la prima domanda generica del pack, ad esempio:

> Ti riformulo la domanda...

ma non riprendeva la domanda originale posta al candidato.

### File modificato

`src/interview/advanceInterviewRuntime.js`

### Funzione ripristinata/corretta

`buildAdaptiveFollowupPayload(block, currentStep)`

È stata ricostruita perché la modifica precedente era rimasta tronca.

Nuovo comportamento:
- legge `sourceQuestionText`
- legge `sourceAnswerText`
- se il trigger è `consistency_probe`, costruisce una domanda tipo:

> Ti riformulo la domanda. Prima ti avevo chiesto: “...” Quello che vorrei capire è il punto specifico richiesto, non un tema vicino. Puoi rispondere restando su questo?

- se il trigger è `decision_tradeoff_probe`, costruisce una domanda tipo:

> Ripartiamo dalla domanda: “...” Qui vorrei capire soprattutto quale trade-off reale hai affrontato, che cosa hai scelto, che cosa hai lasciato indietro e con quale criterio.

### Funzione modificata

`maybeInjectAdaptiveFollowup(...)`

Ora, quando viene selezionato un follow-up pack, il sistema crea un `contextualFollowupPack` che include:

```js
sourceQuestionText
sourceAnswerText
sourceQuestionKey

Poi passa questo pack arricchito a:

injectAdaptiveFollowup(...)
Test eseguito

Compilazione/import OK:

node -e "import('./src/interview/advanceInterviewRuntime.js').then(() => console.log('advanceInterviewRuntime import OK'))"

Output:

advanceInterviewRuntime import OK
Significato prodotto

Questo prepara il runtime a comportarsi più da recruiter reale:

non solo “faccio un’altra domanda”
ma “ti fermo, ti ricordo cosa ti avevo chiesto, e ti riporto sul punto”

È particolarmente importante per:

incomprensione della domanda
risposta fuori asse
risposta che parla di un tema vicino ma diverso
trade-off non esplicitato
Prossimo test consigliato

Creare test locale che verifichi che, dopo injection, il prossimo currentStep adaptive contenga davvero una question/prompt costruita usando sourceQuestionText.

## Adaptive runtime — question-aware consistency probe VERIFIED

### Stato

È stata verificata end-to-end la catena adaptive follow-up per risposte fuori asse / incomprensione della domanda.

### File coinvolti

- `src/interview/selectAdaptiveFollowup.js`
- `src/interview/injectAdaptiveFollowup.js`
- `src/interview/advanceInterviewRuntime.js`
- `config/followup_packs.it.json`
- `config/followup_packs.json`

### Fix importante applicato

In `advanceInterviewRuntime.js`, la funzione `enrichAnswerRecordWithGeneratedFollowup(...)` incrementava `injectedAdaptiveFollowupCount` prima che `injectAdaptiveFollowup(...)` inserisse davvero lo step in timeline.

Effetto bug:
- `injectedAdaptiveFollowupCount = 1`
- ma nessun `adaptive_followup_pack` in timeline
- il runtime passava direttamente allo step successivo

Fix:
- rimosso incremento prematuro da `enrichAnswerRecordWithGeneratedFollowup`
- spostata la memoria del focus dopo la vera injection dentro `maybeInjectAdaptiveFollowup`

### Test locale creato

`scripts/debug_advance_runtime_question_aware_followup.js`

### Risultato verificato

Output corretto:

- `currentStepType = adaptive_followup_pack`
- `currentStepLabel = Affondo su Coerenza e Chiarezza`
- `usedAdaptiveTriggerTypes = ["consistency_probe"]`
- timeline aggiornata con step adaptive tra domanda core e closing
- `currentQuestion` contiene la domanda originale riformulata:

> Ti riformulo la domanda. Prima ti avevo chiesto: “Puoi raccontarmi il tuo percorso e spiegare perché questo ruolo ti sembra il passo successivo naturale?” Quello che vorrei capire è il punto specifico richiesto, non un tema vicino. Puoi rispondere restando su questo?

### Significato prodotto

Questo è un passaggio importante: FRINGE non si limita più a valutare ex-post una risposta fuori asse.

Ora può comportarsi da recruiter/intervistatore:

1. rileva che la risposta non centra la domanda
2. interrompe il flusso lineare
3. riformula la domanda originale
4. chiede al candidato di recuperare restando sul punto

Questo abilita:
- simulazione più realistica
- affondo su incomprensione
- distinzione tra errore occasionale e pattern ricorrente
- futuro tracking evolutivo Premium

### Prossimo test consigliato

Creare test analogo per `decision_tradeoff_probe` dentro `advanceInterviewRuntime`, verificando che la domanda adaptive diventi:

> Ripartiamo dalla domanda: “...” Qui vorrei capire soprattutto quale trade-off reale hai affrontato, che cosa hai scelto, che cosa hai lasciato indietro e con quale criterio.

## Adaptive runtime — decision_tradeoff_probe VERIFIED

### Stato

Verificato anche il ramo adaptive per domande decisionali / trade-off.

### Test locale creato

`scripts/debug_advance_runtime_question_aware_decision.js`

### Primo comportamento osservato

All’inizio, anche in `DECISION_PROBE`, il sistema selezionava `consistency_probe`.

Motivo:
la logica di misalignment aveva priorità troppo alta anche su risposte decisionali deboli ma non realmente off-topic.

### Fix applicato

In `src/interview/selectAdaptiveFollowup.js`, la funzione:

```js
preferredTriggerByMisalignment(answerRecord)

è stata aggiornata a:

preferredTriggerByMisalignment(answerRecord, phaseName)

con esclusione del consistency_probe in DECISION_PROBE quando:

problematicType !== "off_topic"
problematicType !== "evasive"
offTopicRisk !== "high"

In pratica:
se siamo in DECISION_PROBE e la risposta è debole ma non fuori tema, deve prevalere il ramo decisionale, non quello di incomprensione.

Chiamata aggiornata

Dentro selectAdaptiveFollowup(...):

const misalignmentPreferred =
  preferredTriggerByMisalignment(answerRecord, phaseName);
Risultato verificato

Output corretto:

currentStepType = adaptive_followup_pack
currentStepLabel = Affondo su Decisione e Trade-off
usedAdaptiveTriggerTypes = ["decision_tradeoff_probe"]
timeline aggiornata con step adaptive
domanda question-aware generata:

Ripartiamo dalla domanda: “Parlami di una decisione in cui non c’era una risposta chiaramente giusta. Quale trade-off hai scelto e perché?” Qui vorrei capire soprattutto quale trade-off reale hai affrontato, che cosa hai scelto, che cosa hai lasciato indietro e con quale criterio.

Significato prodotto

Ora il runtime distingue correttamente:

risposta fuori asse / incomprensione → consistency_probe
risposta decisionale pertinente ma incompleta → decision_tradeoff_probe

Questo è importante perché un recruiter non reagirebbe allo stesso modo a:

candidato che non ha capito la domanda
candidato che ha capito il tema ma non esplicita il trade-off
Stato feature adaptive

Rami verificati localmente senza Groq:

consistency_probe
decision_tradeoff_probe

Entrambi:

vengono selezionati correttamente
vengono iniettati in timeline
diventano currentStep
generano prompt question-aware usando sourceQuestionText

CONTINUITY UPDATE — Adaptive Recruiter Memory & UI Alignment
Stato raggiunto
Adaptive follow-up runtime

Funzionano correttamente:

consistency_probe
decision_tradeoff_probe

Verificato:

selezione trigger
injection timeline
currentStep corretto
recupero domanda originale
rendering prompt question-aware
passaggio a adaptive_followup_pack

Debug già validati:

debug_advance_runtime_question_aware_followup.js
debug_advance_runtime_question_aware_decision.js
Nuova direzione confermata

FRONTIERA IMPORTANTE:

Il valore non è fare domande.
Il valore è simulare il comportamento cognitivo del recruiter.

Quindi:

capire quando scavare
capire se la risposta è fuori fuoco
insistere quando il pattern si ripete
distinguere problema occasionale vs pattern ricorrente
Recruiter behavior layer

Decisione architetturale importante:

NON creare:

question bank separate
followup packs duplicati

Separare invece:

question engine
adaptive logic
interviewer behavior layer

In futuro:

supportive
standard
incisive
pressure
executive
technical

Lo stile modifica:

tono
pressione
escalation
tolleranza vaghezza
wording
numero affondi

NON la logica core delle domande.

Coaching pattern memory — IMPLEMENTATO

In buildProReportV2.js ora esistono:

classifyAnswerCoachingPatterns
aggregateAnswerCoachingPatterns
enrichAnswersWithCoachingPatternProgression
buildCoachingPatternNote

Il sistema ora genera:

{
  "key": "misalignment",
  "occurrence": 3,
  "tone": "pattern_confirmed"
}

e note progressive tipo:

first_notice
repeated
pattern_confirmed
persistent_pattern

Questa è la base della “memoria intelligente”.

Recruiter panel — stato attuale

È stato introdotto:

renderRecruiterPanel(item)

che unisce:

recruiter recovery
pattern memory

UI corretta:

singola colonna
mobile-safe
niente layout 2 colonne

MA:
l’ultima versione grafica aveva deviato dallo standard FRINGE.

Decisione:
riallineare il pannello recruiter allo standard UI fr-*.

Regola UI ribadita

NON introdurre:

font-size locali
gerarchie custom
colori inventati
effetti “landing page”

Usare:

token --fr-*
classi fr-*
spacing standard

Il recruiter panel deve sembrare:
una card FRINGE coerente,
NON un widget separato.

Ultima modifica approvata ma non ancora verificata

Sostituire CSS recruiter panel con versione standardizzata:

var(--fr-title-section)
var(--fr-dense)
var(--fr-soft-border)
niente pallino ◉
niente 30px custom

Questa è l’ultima direzione approvata prima dello stop.

Priorità prossime
Stabilizzare recruiter panel secondo standard FRINGE
Raffinare escalation wording
Introdurre affondi multipli progressivi
Definire interview intensity:
Quick
Standard
Deep
Tracking errori evolutivo cross-session
Behavior styles recruiter
Punto concettuale molto importante

Gli affondi NON devono sembrare:
“trigger automatici”.

Devono sembrare:
un recruiter che:

nota pattern
insiste
riformula
cambia pressione
cerca consistenza narrativa reale

## UI technical debt — CSS cleanup needed

Il CSS del report PRO è diventato troppo stratificato.
Non procedere più con override locali.
Prima di ulteriori polish UI serve:
- isolare i componenti principali
- creare classi standard vere
- rimuovere override duplicati
- stabilizzare header/pill/card/toggle bar
- verificare mobile 390px

Da evitare:
- nuovi blocchi CSS finali
- fix a cascata con !important

## Interview architecture evolution

FRINGE is evolving from:
- question-count interview simulator

toward:
- behavior-driven adaptive interview engine

The interview is now defined by:

- interviewDepth
- interviewStyle
- interviewIntent

Questions are no longer the primary unit.
The primary unit becomes:
- candidate exploration depth
- recruiter behavior
- adaptive verification intensity

## Interview Style / Depth — runtime integration VERIFIED

### Nuovi file config creati

Aggiunti e validati:

- `config/interview_styles.json`
- `config/interview_depth_profiles.json`

Validazione JSON OK.

### Nuovi loader creati

Aggiunti in `src/interview/`:

- `loadInterviewStyles.js`
- `loadInterviewDepthProfiles.js`

Test import OK:

```bash
node -e "import('./src/interview/loadInterviewStyles.js').then(m => console.log(Object.keys(m.loadInterviewStyles())))"
node -e "import('./src/interview/loadInterviewDepthProfiles.js').then(m => console.log(Object.keys(m.loadInterviewDepthProfiles())))"
Runtime ora riceve

In createInterviewRuntime.js aggiunti:

interviewStyle
interviewDepth
interviewIntent

con default:

interviewStyle = "structured_corporate"
interviewDepth = "standard"
interviewIntent = "simulation"

I valori vengono portati in:

sessionSummary
meta
runtimeState.interviewState.context
Depth ora ha effetto reale

interviewDepth controlla il budget adaptive:

quick → 1 affondo
standard → 3 affondi
deep → 6 affondi

Test creato:

node scripts/debug_create_runtime_depth_budget.js

Output verificato:

quick -> budget 1
standard -> budget 3
deep -> budget 6
Style-aware adaptive follow-up

In selectAdaptiveFollowup.js aggiunto:

import { loadInterviewStyles } from "./loadInterviewStyles.js";

Aggiunta funzione:

getStylePreferredTriggers(interviewRuntime)

che legge:

interviewRuntime.meta.interviewStyle

e recupera:

preferredFollowupTypes

da interview_styles.json.

Lo stile viene applicato dopo il controllo misalignment e prima dei fallback phase/family/dimension.

Test comparativo creato
node scripts/debug_select_adaptive_followup_style_compare.js

Risultato verificato:

supportive_coach -> achievement_quantification
structured_corporate -> decision_tradeoff_probe
pressure_interviewer -> consistency_probe
Significato prodotto

FRINGE ora non è più solo depth-aware, ma anche style-aware.

Prima manifestazione reale del concetto:

Depth + Style + Intent = Interview Behavior

Lo stile recruiter ora influenza davvero quale affondo viene selezionato.

Nota importante

Per supportive_coach il sistema ricade su achievement_quantification perché alcuni trigger preferiti nel JSON (clarification, context_expansion, example_request) non hanno ancora pack dedicati.

Non è un errore: fallback accettabile.

Prossimo passo possibile:

aggiungere pack mancanti
oppure mappare i preferredFollowupTypes astratti verso pack esistenti
collegare interviewStyle anche al wording degli affondi adaptive

## Style-aware adaptive wording — VERIFIED

### Stato

Dopo l’integrazione di `interviewStyle`, anche il wording degli affondi adaptive ora cambia in base allo stile recruiter.

### File coinvolto

`src/interview/advanceInterviewRuntime.js`

### Funzione modificata

`buildAdaptiveFollowupPayload(block, currentStep, interviewStyle)`

Ora riceve:

```js
interviewStyle = "structured_corporate"

e costruisce wording diversi per:

pressure_interviewer
supportive_coach
technical_analytical
default / structured corporate
Fix tecnico importante

Dentro buildCurrentStepPayload(...) non esiste runtime, quindi il passaggio dello stile deve usare:

runtimeState?.interviewState?.context?.interviewStyle || "structured_corporate"

non runtime?.meta.

Test verificati
Pressure interviewer

Con:

interviewStyle: "pressure_interviewer"

output verificato:

Ti fermo un attimo perché la risposta sta andando su temi laterali...
Supportive coach

Con:

interviewStyle: "supportive_coach"

su decision_tradeoff_probe, output verificato:

Vorrei tornare un attimo sulla situazione che hai descritto...
Ho capito il contesto generale, ma credo che ci sia ancora spazio...
Significato prodotto

La differenza tra stili recruiter ora non è più solo configurazione astratta.

È verificata su:

selezione del tipo di affondo
testo effettivo dell’affondo
tono percepito dal candidato

Questo chiude la prima milestone reale di:

Behavior-driven interview
Stato architettura

Ora FRINGE supporta tecnicamente:

interviewDepth
interviewStyle
interviewIntent

e il runtime usa già:

depth → budget affondi
style → scelta affondo
style → wording affondo
Nota UI/testo

Resta micro-correzione futura:
rimuovere il punto dopo la domanda tra virgolette nei template:

“...?”.

da rendere:

“...?”

Non è bloccante.

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

## ProductMode → runtime mapping — VERIFIED

### Stato

È stato introdotto il mapping configurabile:

```text
productMode → interviewDepth + interviewStyle + interviewIntent
File creati
config/product_interview_modes.json
src/interview/loadProductInterviewModes.js

Loader verificato con:

node -e "import('./src/interview/loadProductInterviewModes.js').then(m => console.log(Object.keys(m.loadProductInterviewModes())))"

Output:

[ 'free', 'pro', 'premium' ]
File modificato

src/interview/createInterviewRuntime.js

Nuovo parametro runtime
productMode = "pro"
Comportamento

Se non vengono passati manualmente:

interviewStyle
interviewDepth
interviewIntent

vengono derivati da product_interview_modes.json.

Esempio concettuale:

productMode: "free"
→ depth: quick
→ style: supportive_coach
→ intent: training

productMode: "pro"
→ depth: standard
→ style: structured_corporate
→ intent: simulation

productMode: "premium"
→ depth: deep
→ style: pressure_interviewer
→ intent: stress_test
Dati ora disponibili in runtime

Aggiunti in:

sessionSummary
meta
runtimeState.interviewState.context

campi:

productMode
interviewDepth
interviewStyle
interviewIntent
Test eseguito
node -e "import('./src/interview/createInterviewRuntime.js').then(() => console.log('createInterviewRuntime import OK'))"

Output:

createInterviewRuntime import OK
Principio architetturale fissato

Il motore NON deve avere logiche tipo:

if (premium)

ma deve leggere capability/config:

productMode
capabilities
interviewDepth
interviewStyle
interviewIntent

Il motore deve produrre la massima analisi possibile; i piani prodotto devono governare:

visibilità
accesso
intensità
stili disponibili
profondità
rendering/feature enabled

senza duplicare motore o renderer.

Prossimo passo

Creare capability policy vera, ad esempio:

product capabilities → showRecruiterPanel / showPatternMemory / allowStyleSelection / allowDeepAssessment

e poi collegarla progressivamente al renderer.

## Capability-driven rendering — VERIFIED

### Stato

Dopo l’introduzione di `productCapabilities`, il renderer PRO ha iniziato a usare le capability per mostrare/nascondere moduli e sotto-moduli senza usare logiche hardcoded tipo `if premium`.

### File coinvolti

- `config/product_interview_modes.json`
- `src/interview/createInterviewRuntime.js`
- `src/interview/resolveProductCapabilities.js`
- `src/report/buildProReportV2.js`
- `src/app/renderProReportHtml.js`
- `scripts/fringe_health_check.js`

### Helper renderer introdotti

In `renderProReportHtml.js`:

```js
isCapabilityEnabled(context, capabilityKey)
renderCapabilityBlock(context, capabilityKey, renderFn)
Capability già verificate nel renderer
showRecruiterPanel

Se true:

compare il pannello recruiter

Se false:

sparisce tutto il pannello recruiter

Verificato con test_render_pro_report_v2.js.

showPatternMemory

Se true:

dentro il pannello recruiter compare il blocco pattern

Se false:

resta il pannello recruiter
sparisce solo la memoria/pattern
showDetailedAnswerWorkspace

Se true:

compare “Analisi dettagliata della risposta”

Se false:

resta la lettura sintetica
sparisce tutto il blocco dettagliato
Principio confermato

I moduli devono essere controllati da capability:

renderCapabilityBlock(
  context,
  "showDetailedAnswerWorkspace",
  () => renderSomething()
)

e non da:

if (premium)
Significato prodotto

Ora FRINGE può spostare moduli tra FREE / PRO / PREMIUM modificando la configurazione, senza duplicare renderer o motore.

Questo abilita:

promo temporanee
A/B test
piani intermedi
versioni white-label
progressive unlock
teaser premium
gestione commerciale configurabile
Stato architettura

Il modello validato è:

productMode
→ productCapabilities
→ report model
→ renderer capability blocks
Nota importante

Il renderer non è ancora completamente modulare.
Il prossimo passo futuro sarà evolvere verso un registry di moduli:

REPORT_MODULES = {
  recruiterPanel: {
    capability: "showRecruiterPanel",
    render: renderRecruiterPanel
  }
}

## Product experience guardrails — VERIFIED

Creato `resolveProductExperience.js`.

Il resolver prende:
- productMode
- requested interviewDepth
- requested interviewStyle
- requested interviewIntent

e restituisce solo valori ammessi dal piano prodotto.

Test verificato:

FREE + richiesta forzata di:
- deep
- pressure_interviewer
- stress_test

viene risolto correttamente in:
- quick
- supportive_coach
- training

Questo impedisce combinazioni non consentite e prepara UI/setup sicuri e configurabili.



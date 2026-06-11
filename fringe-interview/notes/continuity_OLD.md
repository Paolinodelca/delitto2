# CONTINUITY — FRINGE INTERVIEW (UPDATED)

## 🎯 Stato attuale del progetto

Il sistema FRINGE Interview è entrato in una fase cruciale:

👉 da prototipo tecnico  
👉 a prodotto reale, leggibile e vendibile

Il motore runtime è stabile.  
Il valore si gioca ora su:

- qualità delle domande
- qualità delle valutazioni
- chiarezza del report
- percezione prodotto (UI + UX)

---

## 🧠 Modello concettuale (confermato)

### Il sistema NON valuta il candidato in assoluto

👉 Valuta:

**coerenza tra candidato e ruolo target (JD)**

---

## 🔒 Technical Gating

Filtro non continuo:

- ❌ KO
- ⚠️ BORDERLINE
- ✅ OK

Variabile chiave:

⏱️ Time-to-Impact

---

## 🎯 Core Evaluation (3 assi)

1. Decisione
2. Sintesi
3. Attriti

---

## ⚙️ Stato runtime

✅ state machine completa  
✅ fasi narrative attive  
✅ coverage / ledger coerenti  
✅ adaptive follow-up funzionante  
✅ focus mode (balanced / pressure / depth)

---

## 📊 Stato report

✅ struttura A + B + C presente  
✅ leggibilità migliorata  
✅ report HTML separato dallo setup ripristinato  
✅ barra superiore del report tornata coerente con il family feeling del prodotto

⚠️ problemi aperti:

- commenti ripetitivi tra risposte
- incoerenza tra domanda e valutazione
- riconoscimento insufficiente del fuori tema
- punti forti troppo “locali” e non abbastanza sintetici
- trainer / pro / premium ancora da rafforzare nel contenuto reale
- report ancora da rifinire nei dettagli visivi e nei testi

---

## 🖥️ Stato UI

### Setup page

✅ pagina separata dal report  
✅ barra superiore compatta e fissa  
✅ family feeling abbastanza allineato col report  
✅ struttura più semplice e meno dispersiva  
✅ preparazione accorpata in un unico step operativo  
✅ simulazione separata come step distinto  
✅ pulsanti PRO e PREMIUM separati su pannelli dedicati  
✅ pulsante Report in barra  
✅ compilazione demo funzionante

⚠️ problemi aperti:

- rifinire meglio il contenuto dello step Preparazione
- valutare se tenere o no alcuni testi di supporto ridondanti
- migliorare ancora la compattezza verticale
- rendere più leggibile e “definitivo” lo stato compilato dei campi
- il bottone simulazione oggi è ancora fittizio / dimostrativo

### Report page

✅ pagina separata correttamente dallo setup  
✅ recuperata l’impostazione quasi buona precedente  
✅ barra con tab superiori navigabili  
✅ sezioni principali nuovamente articolate  
✅ family feeling generale abbastanza coerente con setup

⚠️ problemi aperti:

- allineare meglio titoli, caratteri e gerarchia con setup
- rafforzare ulteriormente la chiarezza del tab “Profilo e risposte”
- migliorare ancora la parte CV free
- raffinare i contenuti marketing di PRO e PREMIUM
- completare il bottone reale di ritorno coerente setup ↔ report nella UX finale online

---

## 💰 Modello prodotto

### Free

- sintesi
- feedback generale
- prima lettura di profilo / risposte / CV

### Pro

- training guidato
- analisi risposte
- feedback più operativi

### Premium

👉 include tutto il PRO +:

- lettura recruiter
- analisi CV avanzata
- supporto operativo concreto
- visione più vicina a una selezione reale

---

## 🚨 Problema critico emerso

👉 Ripetizione domande tra sessioni

Rischio:

- perdita “magia”
- percezione tool debole
- ripetizione troppo rapida per utenti che usano il tool spesso

---

## 🎯 Priorità reali adesso

1. Rotazione domande (CRITICO)
2. Miglioramento commenti risposta
3. Coerenza domanda → valutazione
4. Rafforzamento trainer mode
5. Rifinitura UI senza stravolgere

---

## 🌉 Bridge engine

Confermato:

- NON estrarre core engine ora
- Interview = laboratorio reale
- Negotiation = prossimo scenario

---

## 📌 Stato generale

✅ motore stabile  
✅ pagine setup/report separate di nuovo correttamente  
✅ base UI abbastanza buona  
⚠️ qualità contenuto da alzare  
⚠️ percezione valore da rafforzare  
⚠️ parte simulazione ancora da agganciare davvero al flusso operativo

👉 pronto per fase di raffinazione forte

---

## Session Summary (2026-03-26)

- proseguito il riallineamento visivo tra pagina setup e pagina report
- consolidata la direzione UX:
  - barra superiore sempre visibile
  - family feeling comune tra setup e report
  - distinzione più netta tra contenuti free, pro e premium
- aggiornata la pagina setup (`renderInteractiveInterviewShellHtml.js`) con:
  - header più leggibile
  - barra pulsanti più evidente
  - contrasto e contorni più forti
  - stato di completamento visivo per step compilati
  - un solo pulsante di navigazione previsto: `Vai al report`
- confermata la scelta UX:
  - nella pagina setup deve comparire solo `Vai al report`
  - nella pagina report deve comparire solo `Vai al setup`
- confermato che i pulsanti PRO e PREMIUM possono apparire anche nello setup come anticipazione del valore dei piani superiori
- emerse note ancora aperte:
  1. completare la navigazione reale setup ↔ report
  2. allineare definitivamente la barra del report alla nuova barra del setup
  3. rifinire ulteriormente contrasto, bordi e gerarchia visiva
- stato attuale:
  - setup funzionante in modo abbastanza soddisfacente
  - scambio pagina non ancora completato
  - da riprendere domani partendo dalla navigazione tra le due pagine

## Session Summary (2026-03-27)

- ripristinata la separazione corretta tra:
  - `renderInteractiveInterviewShellHtml.js` = setup
  - `renderFringeInterviewReportHtml.js` = report
- corretto il problema per cui `tmp/ui-local/fringe_interview_interactive_shell_report.html` risultava di fatto una copia dello setup
- aggiornato `scripts/test_generate_interactive_shell_html.js` per rigenerare davvero:
  - `fringe_interview_interactive_shell_setup.html`
  - `fringe_interview_interactive_shell_report.html`
- la pagina setup è stata semplificata e resa più chiara:
  - un solo step “Preparazione” che accorpa dati + lingua
  - step “Simulazione” separato
  - pannelli separati per PRO e PREMIUM
  - mini-segnali nel pulsante Preparazione per:
    - ruolo
    - CV
    - JD
    - lingua
- la barra superiore dello setup ora è:
  - più compatta
  - su una sola riga
  - fissa
  - esteticamente accettabile
- il report è tornato a usare la struttura quasi buona precedente:
  - overview
  - profilo e risposte
  - CV
  - training guidato
  - lettura selezione
- decisione pratica fissata:
  - NON buttare più via la struttura quasi buona del report
  - lavorare per rifinitura progressiva, non per rifacimenti completi
- stato attuale concreto:
  - setup: funziona abbastanza bene come base
  - report: di nuovo separato e recuperabile
  - estetica generale: tornata accettabile
- problemi aperti immediati per la prossima sessione:
  1. rivedere in dettaglio lo setup
  2. rivedere in dettaglio il report
  3. riallineare definitivamente titoli/font/gerarchie tra le due pagine
  4. poi tornare su qualità contenutistica delle valutazioni e rotazione domande

  🧠 Nuovi dati di input da considerare
1. Stato occupazionale

Aggiungere tra gli input:

candidato attualmente:
occupato
non occupato
2. Azienda di provenienza (se occupato)

Se il candidato è occupato:

👉 raccogliere:

nome azienda (anche opzionale / dichiarato liberamente)
settore azienda

👉 obiettivo:

valutare:
coerenza settore → ruolo target
trasferibilità esperienza
salto logico o discontinuità

👉 possibile uso:

Interview:
capire forza del posizionamento
HR:
capire se il candidato arriva da contesto comparabile
🎯 Segnale critico da introdurre nelle domande
3. Motivazione al cambiamento

👉 introdurre esplicitamente (o far emergere) una domanda su:

“Perché vuoi cambiare azienda / ruolo?”

⚠️ Importanza del segnale

Questo è un segnale ad altissimo valore:

per Interview:
coerenza narrativa
chiarezza obiettivi
maturità professionale
per HR:
rischio (fuga / insoddisfazione / incoerenza)
stabilità potenziale
allineamento reale col ruolo
⚠️ Nota di attenzione

👉 informazione sensibile e delicata

Il sistema deve:

NON giudicare in modo rigido
NON penalizzare automaticamente
leggere:
coerenza
credibilità
chiarezza
🧩 Impatto sul motore

Questi elementi impattano:

job fit analysis
interpretazione delle risposte
valutazione coerenza narrativa
futura logica HR screening
🔄 Collegamento con FRINGE Engine

👉 questi segnali sono candidati a diventare:

parte del core riusabile
non solo logica Interview
🚀 Nota strategica

Questi segnali:

👉 NON sono “feature UI”

👉 sono:

leve di lettura
segnali forti di valore prodotto

## Session Summary (2026-03-30)

- completato un intervento di stabilizzazione sui renderer HTML di setup e report
- confermata la separazione corretta tra:
  - `renderInteractiveInterviewShellHtml.js` = setup
  - `renderFringeInterviewReportHtml.js` = report
- ripristinata una base grafica coerente tra setup e report, con family feeling comune
- sistemata la barra del report:
  - torna su una sola riga
  - resta più compatta
  - evita di rubare spazio verticale inutile
- confermata come direzione UX:
  - setup con barra fissa e step principali visibili
  - report con barra fissa e navigazione tra aree
  - contenuti PRO/PREMIUM visibili come preview/upsell ma separati dai contenuti free
- chiarito che la pagina prezzi / upgrade NON va mescolata ora dentro setup/report:
  - meglio una pagina dedicata successiva
  - i pulsanti attuali potranno poi puntare lì senza rifare il rendering principale
- chiarito anche che i lucchetti e gli stati di accesso potranno essere gestiti in seguito dal piano utente, senza rifondare le pagine

### Fix tecnico importante

- emersi problemi sugli export passando da `src/app/index.js`
- scelta pratica confermata:
  - nei test HTML conviene importare direttamente i renderer
  - evitare per ora dipendenza da `src/app/index.js` finché non si riallineano con calma tutti gli export dell'app
- corretto `scripts/test_generate_interactive_shell_html.js` per import diretto di:
  - `renderInteractiveInterviewShellHtml.js`
  - `renderFringeInterviewReportHtml.js`
  - `buildInteractiveSessionPayload.js`
- corretto anche `scripts/test_render_fringe_interview_report_html.js` con import diretto del renderer report
- corretto un errore sintattico nel renderer report (`buildUpgradeMarketingCopy`) dovuto a una graffa di troppo

### Stato attuale reale

#### Setup page
- base buona
- struttura chiara
- barra leggibile
- step Preparazione + Simulazione + Report + preview PRO/PREMIUM presenti
- ancora aperti alcuni micro-fix UX:
  - eliminare alcuni doppioni di etichette/titoli
  - affinare la spiegazione iniziale
  - rendere più evidente il tab selezionato
  - decidere meglio il ruolo del pulsante “Usa dati demo”

#### Report page
- tornata pulita e utilizzabile
- barra superiore di nuovo su una sola riga
- lettura generale abbastanza buona
- contenuti premium più ordinati
- ancora aperti alcuni micro-fix di rifinitura:
  - aumentare appealing estetico senza rompere la pulizia
  - eventualmente rafforzare ancora messaggio principale e score box
  - mantenere font/dimensioni più uniformi
  - rifinire eventuali testi troppo “interni” o troppo tecnici

### Decisione di metodo per la prossima chat

- NON rifare più da zero setup o report
- lavorare solo per micro-rifiniture mirate
- appena chiuse le due pagine, tornare alle vere priorità prodotto:
  1. rotazione domande
  2. evaluation engine
  3. trainer mode

  ## Session Summary (2026-03-30 / blocco evaluation + rotation refinement)

### Stato raggiunto

Completato un blocco importante sul motore Interview, senza toccare ancora la UI.

### 1. Rotazione domande — prima versione riuscita

È stata introdotta una prima logica reale di rotazione su base strutturale:

- la memoria recente lavora su `questionKey`
- il ranking applica penalità morbide su:
  - key recenti
  - categorie recenti
  - segnali troppo vicini a quelli recenti
- la strategy prova a evitare il riuso ravvicinato delle stesse domande
- il sistema resta retrocompatibile: se non arriva history, continua a funzionare come prima

### 2. Architettura multilingua confermata

Decisione architetturale fissata:

- la rotazione NON deve dipendere dal testo del prompt
- deve dipendere da:
  - `key`
  - `category`
  - `signals`
- i prompt restano un livello separato, risolto dopo via locale / tone variant

Questo mantiene coerenza tra italiano, inglese e future lingue.

### 3. Nuovo set di domande: “perché vuoi cambiare azienda / ruolo?”

Aggiunti nei question bank IT + EN due nuovi item:

- `motivation_for_change`
- `change_trajectory_logic`

Obiettivo:

- introdurre un segnale molto forte per Interview
- preparare già la futura lettura HR screening
- leggere:
  - motivo del cambiamento
  - direzione cercata
  - coerenza del passo professionale
  - rischio di motivazione solo reattiva / di fuga

### 4. Composizione finale domande migliorata

Correzione sulla composizione delle primary questions:

- `WALKTHROUGH` non viene più forzato nelle sessioni brevi
- nelle sessioni brevi la struttura corretta ora è:
  - `ROLE_CONTEXT`
  - `CASE_1`
  - `DECISION_PROBE`
  - `PRESSURE_PROBE` / `DEPTH_CHECK`
- per i ruoli diversi da walkthrough la selezione diventa più `contextual-first`
- risultato: il contextual ranking pesa davvero anche nella selezione finale, non solo nel ranking interno

### 5. Segnale “motivation for change” entrato davvero nelle primary questions

Test riuscito:

- nella versione rotated è emersa davvero una primary question sul cambiamento
- la domanda è entrata come:
  - `ROLE_CONTEXT`
  - `source: contextual_selection`

Questo conferma che il nuovo segnale non è solo “preparato”, ma è già entrato nel flusso reale.

### 6. Answer analyzer evoluto

`analyzeAnswerShape.js` è stato esteso per leggere, oltre alla sola risposta:

- `questionText`
- `questionKey`
- `narrativeRole`
- `expectedSignals`

Nuove dimensioni / segnali introdotti:

- `questionAlignment`
- `motivationForChange`
- `offTopicRisk`
- segnali aggiuntivi per risposte di cambiamento:
  - reason markers
  - future direction markers
  - escape-only markers
  - current situation markers

Obiettivo:

- distinguere meglio tra risposta formalmente buona e risposta davvero centrata
- iniziare a leggere la credibilità della motivazione al cambiamento

### 7. Wiring runtime → analyzer completato

`advanceInterviewRuntime.js` ora passa all’analyzer il contesto della domanda.

Verificato nei test:

- `questionKey` valorizzato
- `narrativeRole` valorizzato
- `questionText` valorizzato
- `expectedSignals` valorizzato

Quindi l’answer analysis non lavora più “al buio”.

### 8. Report aggregato migliorato

`collectInterviewReport.js` ora aggrega anche:

- `questionQuality.alignment`
- `questionQuality.motivationForChange`
- rischio off-topic
- nuovo asse comportamentale:
  - `positioning`

Il report non misura più solo “come parla”, ma anche:

- quanto resta aderente alla domanda
- quanto si posiziona
- quanto la motivazione al cambiamento appare credibile

### 9. Final candidate report rafforzato

`buildFinalCandidateReport.js` ora espone anche:

- nuova sezione `questionQuality`
- asse `positioning` nello `scoreLayer`
- note recruiter che includono:
  - alignment narrative
  - motivation for change narrative (quando presente)

### 10. Stato test

Test riusciti:

- `test_question_selection_from_pipeline.js`
- `test_answer_shape_from_runtime.js`
- `test_collect_interview_report.js`
- `test_build_final_candidate_report.js`

Persistono invece errori separati e NON legati a questo blocco su:

- `test_run_fringe_interview_mvp_session.js`

Motivo:

- problema ancora aperto sugli export di `src/app/index.js`
- in particolare `runFringeInterviewMVP.js` non fornisce il `default export` atteso dall’index

Questo problema va trattato a parte e non invalida il lavoro fatto su selection/evaluation/report.

---

## Valutazione dello stato attuale

Questo blocco può essere considerato **riuscito in prima versione**.

Punti forti attuali:

- rotazione vera finalmente attiva
- nuova domanda su cambio azienda/ruolo integrata
- lettura della risposta contestuale, non più solo formale
- report e final report più maturi e più vicini al valore prodotto

### Limite ancora presente

Resta una possibile tensione nei numeri del final report:

- `fitScore` può risultare relativamente buono
- `answerScore` più basso
- assi comportamentali medi
- `overallBand` anche debole

Non necessariamente sbagliato, ma da riallineare meglio in una fase successiva per evitare percezioni di incoerenza.

---

## Prossimo passo consigliato

Priorità consigliata per la ripresa:

### TRAINER MODE

Motivo:

adesso il motore ha finalmente segnali sufficientemente buoni per spiegare meglio:

- cosa cercava la domanda
- cosa è emerso davvero
- cosa manca
- come migliorare
- perché il feedback trainer vale più del feedback free

### Priorità secondaria

Micro-fix di coerenza scoring / recommendation:

- migliorare allineamento tra:
  - fit score
  - answer quality
  - behavioral axes
  - overall band
  - recommendation band

  ## Nota architetturale emersa (2026-03-30 / da riprendere)

La domanda sul cambiamento azienda/ruolo richiede un gating logico a monte.

### Regola da introdurre

La domanda tipo:

- “Perché vuoi cambiare azienda?”
- “Perché vuoi cambiare ruolo?”

ha senso solo se il sistema conosce prima almeno:

1. stato occupazionale attuale
   - occupato
   - non occupato

2. se il candidato lavora presso un’altra azienda

3. idealmente anche:
   - nome azienda attuale (opzionale)
   - settore / mercato
   - vicinanza o distanza rispetto a:
     - azienda target
     - prodotto
     - processo
     - contesto operativo

### Implicazione

Questo segnale NON va lasciato solo dentro il question bank.

Va collegato a:

- setup / input
- validazione dati
- deriveInterviewContextProfile
- logica di selezione domanda

### Direzione corretta

Se il candidato NON è occupato:
- non usare la domanda “perché vuoi cambiare azienda”
- usare invece una variante più corretta, ad esempio:
  - “Perché questo ruolo è il passo giusto adesso?”
  - “Che tipo di rientro / riposizionamento stai cercando?”

Se il candidato È occupato:
- attivare la domanda sulla motivazione al cambiamento
- e leggerla meglio alla luce del contesto attuale

## Update — 2026-03-31

### 🚀 Pubblicazione MVP online

Per la prima volta FRINGE Interview è accessibile via URL:

- Landing pubblicata su Vercel (progetto separato)
- Tool interview pubblicato come static shell (index.html generato)

Architettura attuale:
- landing → progetto Vercel dedicato (root: /landing)
- tool → progetto Vercel dedicato (root: /fringe-interview)

---

### ⚠️ Stato attuale esperienza

Landing:
- contenuto corretto ma troppo lineare
- effetto percepito: “da leggere” (non ancora “da vivere”)
- problema principale: ritmo e impatto (non contenuto)

Tool:
- setup visibile correttamente
- simulazione NON ancora interattiva (HTML statico)
- report accessibile ma navigazione fragile (404 su back)

---

### 💡 Insight chiave emerso

Il valore di FRINGE non è ancora percepito subito.

Motivo:
- viene spiegato invece che mostrato
- manca un "hook" immediato sopra la piega

Direzione:
- passare da spiegazione → micro-shock sequenziali
- mostrare subito il meccanismo (affondo del recruiter)

---

### 🎯 Decisione UX/Marketing

Priorità spostata su:

1. miglioramento landing (ritmo + impatto)
2. introduzione blocco demo WOW immediato
3. riduzione percezione di scroll
4. chiarimento immediato del valore (entro 3–5 secondi)

---

### 🧪 Stato test reale

Prima prova effettuata:

- flusso: landing → setup → report
- percezione: “non wow ancora”

Interpretazione:
- problema NON nel motore
- problema nella presentazione iniziale

---

### 🔄 Prossimo blocco operativo

1. riscrittura landing in modalità “micro-shock”
2. inserimento demo (domanda → risposta debole → affondo)
3. miglioramento ingresso Quick Interview
4. valutazione primo test utenti reali (anche informale)

---

### Nota

NON intervenire ora su:
- algoritmo
- scoring
- parser

Il problema attuale è di percezione, non di capacità del sistema.

## Update — 2026-04-01 / Setup nav reset

### Problema emerso
La barra alta dello setup era entrata in stato incoerente:
- più blocchi CSS concorrenti per `.nav-strip`
- pulsanti con dimensioni non uniformi
- attivo poco leggibile
- disallineamenti desktop/mobile
- vecchie e nuove soluzioni mischiate nello stesso renderer

### Decisione
Reset della barra di navigazione setup:
- stessa larghezza logica per tutti i pulsanti
- badge verticali interni per FREE / PRO / PREMIUM
- lucchetti riportati in basso
- rimosso l’underline/banda inferiore per il tab attivo
- attivo evidenziato tramite cornice/ombra esterna
- versione mobile con strip orizzontale scrollabile

### Nota di metodo
Quando si interviene sulla top navigation:
- evitare patch cumulative
- sostituire il blocco completo CSS + HTML
- poi rigenerare sempre gli HTML pubblicati

### Stato
Blocco in corso di pulizia finale.

## Update — 2026-04-02 / Setup nav polishing

### Stato del lavoro
Reset della top navigation dello setup riuscito.

Risultato:
- distribuzione generale molto più pulita
- pulsanti più ordinati
- mobile molto più gestibile
- struttura complessiva finalmente leggibile

### Problemi residui emersi (da riprendere domani)

#### Desktop
- led/pallini stato troppo piccoli
- allineamento ancora imperfetto tra pallini numerati e testi
- stato attivo quasi invisibile
- badge FREE / PRO / PREMIUM troppo piccoli, poco leggibili
- lucchetti troppo piccoli / poco visibili

#### Mobile
- etichette accanto ai led troppo piccole / poco leggibili
- titoli pulsanti da rendere più evidenti
- stato attivo visibile solo per un istante, poi poco percepibile
- serve contorno del pulsante attivo più evidente e persistente
- lucchetto quasi invisibile
- pallini numerati non ben allineati verticalmente col testo
- numeri nei pallini da rendere più marcati / pesanti

### Valutazione
La base ora è buona:
- pulizia generale ok
- distribuzione ok
- si può entrare in rifinitura vera

Non tornare indietro.
Fare solo micro-migliorie mirate.

### Ordine corretto di ripresa
1. aumentare leggibilità badge / lucchetti / numeri
2. rafforzare stato attivo persistente
3. riallineare pallini numerati e testo
4. applicare stesso principio anche al report

## Session Summary (2026-04-02 / setup nav polish quasi chiuso)

### Obiettivo della sessione
Rifinire la top navigation dello setup (`renderInteractiveInterviewShellHtml.js`) su desktop e mobile, senza rifare la pagina, lavorando per micro-fix visivi e UX.

### Risultati raggiunti

#### Barra setup
- stato attivo del pulsante reso molto più visibile
- badge laterali FREE / PRO / PREMIUM resi più leggibili
- fascia laterale colorata meglio integrata nel bordo destro del pulsante
- lucchetti resi più leggibili e meglio posizionati
- introdotti indicatori fissi di scroll laterale su mobile
- gradiente dell’header migliorato, con parte superiore più scura
- introdotta una sezione esempi più chiara al posto del vecchio singolo pulsante `Carica esempio`
- la sezione esempi ora mostra 4 preset distinti con breve descrizione:
  - Product Operations Manager
  - Project Manager
  - Operations Manager
  - Business Analyst
- sistemata anche la frase introduttiva sotto “Inserisci i dati per iniziare”, spezzata in modo più ordinato

#### Funzionalità
- ripristinata la piena operatività della pagina dopo una rottura dello script dovuta a duplicazione/troncamento della funzione `setCompleteState`
- i pulsanti e i campi sono tornati a funzionare
- il test `node scripts/test_generate_interactive_shell_html.js` torna a generare gli HTML correttamente

### Problemi risolti durante la sessione
- errore JS grave in pagina (`Unexpected end of input`)
- duplicazione accidentale della funzione `setCompleteState`
- comparsa anomala di pulsanti verticali extra causata da modifica incompleta del blocco barra
- titolo/asolina laterale che si toccavano
- lucchetto Premium sovrapposto male
- blocco esempi poco chiaro come significato

### Stato attuale reale della barra setup
La barra è ora **abbastanza buona e usabile**, con family feeling più credibile e leggibilità molto migliore rispetto alla base iniziale.

### Problemi ancora aperti ma non bloccanti

#### 1. Numerelli dei pulsanti nella fascia laterale colorata
Problema ancora aperto e da fissare bene:
- su telefono verticale si vede bene solo il numerello del primo pulsante
- gli altri numerelli restano deboli / quasi assenti
- su telefono orizzontale i numerelli non compaiono correttamente

👉 questo va ripreso come bug specifico del rendering mobile / landscape del badge numerico nella lunetta colorata

#### 2. Allineamento verticale dei pallini numerati (desktop)
- non ancora perfetto
- migliorato ma non davvero “chiuso”
- per ora lasciato così perché non abbastanza grave da giustificare altri rischi di regressione

#### 3. Titoli pulsanti mobile
- migliorabili ancora leggermente come presenza/gerarchia
- non urgente rispetto agli altri punti

### Decisione pratica
Lo setup è da considerare **quasi chiuso**, ma con un piccolo blocco finale ancora aperto:

#### micro-fix residui setup
1. numerelli nella fascia laterale colorata:
   - coerenti su tutti i pulsanti
   - visibili sia su telefono verticale sia su telefono orizzontale
2. eventuale ultimo micro-tuning su titoli / descrizioni pulsanti mobile
3. opzionale: scurire ancora leggermente il gradiente alto dell’header se utile

### Priorità della prossima sessione
1. chiudere i micro-bug residui della barra setup
2. riportare lo stesso principio di pulizia / gerarchia al report (`renderFringeInterviewReportHtml.js`)
3. poi tornare a:
   - landing page
   - UX complessiva
   - percezione di valore del prodotto

### Nota tecnica utile
Flusso di test confermato:

```bash
node scripts/test_generate_interactive_shell_html.js
Copy-Item .\tmp\ui-local\fringe_interview_interactive_shell_setup.html .\index.html -Force
Copy-Item .\tmp\ui-local\fringe_interview_interactive_shell_report.html .\fringe_interview_interactive_shell_report.html -Force

## Update — 2026-04-08 / setup-report quasi chiusi, persistenza ripulita

### Stato raggiunto
- setup e report sono tornati abbastanza utilizzabili sia su desktop sia su telefono
- la barra del report è stata riportata a comportamento più vicino allo setup:
  - su desktop e telefono verticale resta fissa
  - su telefono orizzontale può scorrere con la pagina per lasciare più spazio ai contenuti
- nella setup è attiva una prima logica di gating:
  - **Simulazione** richiede dati minimi (ruolo + CV) oppure demo selezionata
  - **Report** richiede preparazione + passaggio da Simulazione, oppure demo selezionata
- tornando indietro dal report la setup può mantenere lo stato di completezza del flusso, ma è stata corretta la logica di apertura iniziale

### Fix importante completato
La setup NON deve più aprirsi precompilata.

È stato corretto il comportamento per cui la pagina si riapriva con:
- profilo demo già caricato
- campi già riempiti
- led già accesi

Direzione confermata:
- all’avvio della setup:
  - `targetRole`, `cvText`, `jdText` devono partire vuoti
  - `selectedDemoKey` deve partire vuoto
  - `simulationVisited` non deve essere persistente come stato iniziale
- possono restare al massimo preferenze leggere:
  - lingua interfaccia
  - lingua colloquio
  - formato colloquio
  - modalità risposta

### Stato della persistenza
Decisione pratica fissata:
- i demo NON devono essere persistenti
- anche i dati reali, per ora, è meglio che NON precompilino l’apertura successiva della setup
- la setup deve apparire pulita all’avvio, per non sembrare “truccata” o pre-caricata

### Setup — stato attuale reale
La barra alta è ormai abbastanza funzionante e leggibile anche su telefono.

Sono stati introdotti:
- gating su Simulazione e Report
- banner/stato di flusso nella parte alta
- demo mode riconosciuta nella logica
- miglioramenti forti di leggibilità della top navigation

### Problemi / lavori ancora aperti sul setup

#### 1. Fascia alta da ripensare meglio
La direzione corretta è:
- riga superiore = brand / identità prodotto (`FRINGE Interview`, eventuale logo)
- riga sotto = guida dinamica + stato + eventuale messaggio demo / gating

La parte alta non deve restare un testo generico. Deve spiegare:
- cosa fare in quella pagina
- che cosa si sblocca dopo
- che cosa offrono eventualmente PRO / PREMIUM

#### 2. Parte bassa della pagina 1 troppo densa
Da riprendere:
- compattare e distinguere meglio i 4 campi secondari:
  - lingua interfaccia
  - lingua colloquio
  - formato
  - modalità risposta
- togliere ridondanze:
  - stato preparazione
  - formato selezionato
  - suggerimento pratico
- riscrivere meglio il blocco introduttivo dei profili demo
- aggiungere un pulsante reset / nuova preparazione
- introdurre un richiamo più chiaro quando si usa un profilo demo

#### 3. Bug ancora aperto da tenere segnato
Numerelli nella lunetta colorata dei pulsanti:
- su telefono verticale si vede bene soprattutto il primo
- su telefono orizzontale il comportamento non è ancora del tutto affidabile

#### 4. Gating — UX da rifinire ancora
La logica di fondo c’è, ma il messaggio di blocco va ancora reso:
- più visibile
- più integrato nella fascia alta
- più contestuale al punto del flusso

### Report — stato attuale reale
- barra tornata orizzontale e più sana
- su telefono verticale comportamento abbastanza buono
- su telefono orizzontale barra più compatta per lasciare spazio ai contenuti
- base del report tornata utilizzabile

### Report — lavori ancora aperti
1. riallineare meglio header / family feeling rispetto allo setup
2. introdurre anche nel report una fascia alta coerente con:
   - brand
   - guida
   - stato
3. rifinire ancora contenuti free / pro / premium
4. mantenere la barra compatta senza rubare spazio inutile ai contenuti

### Decisione di metodo confermata
- NON rifare più setup o report da zero
- lavorare solo per micro-rifiniture mirate
- prima chiudere bene setup e report
- poi tornare a landing page e percezione prodotto

### Ordine corretto per la prossima ripresa
1. chiudere fascia alta e pulizia finale della setup
2. riallineare fascia alta del report
3. rifinire contenuti e family feeling del report
4. tornare alla landing
5. solo dopo riaprire idee più grandi:
   - flusso CV-only
   - salvataggio multiplo CV/JD utente
   - memoria profili per utenti paganti

### Nota strategica da non perdere
Sono emerse idee molto interessanti ma da NON aprire ancora operativamente:
- percorso “solo miglioramento CV” senza simulazione
- memoria utente con più CV / JD / ruoli
- gestione profili salvati per utenti paganti

Queste idee sono buone, ma vanno trattate solo dopo aver chiuso bene:
- setup
- report
- landing

## Update — 2026-04-09 / setup congelato pragmaticamente

### Decisione pratica
La pagina setup viene considerata **sufficientemente buona per essere congelata**, anche se non ancora perfetta.

Motivo:
- ulteriori micro-fix UI stanno consumando molto tempo
- i miglioramenti diventano marginali e poco affidabili
- il vero punto da verificare ora è il comportamento del motore e del report

### Stato setup accettato
Risultati utili raggiunti:
- top navigation molto migliorata rispetto alla base iniziale
- comportamento mobile/desktop abbastanza buono
- parte bassa della pagina 1 alleggerita e più leggibile
- demo non più caricata automaticamente all’avvio
- reset campi disponibile
- gating di base presente su simulazione/report

### Limiti accettati per ora
- il banner alto non è ancora una soluzione definitiva
- il ritorno da report a setup non mantiene ancora i dati in modo ideale
- alcuni messaggi di stato / gating non sono ancora rifiniti come UX finale
- permangono piccoli residui tecnici / di coerenza interna da non inseguire ora

### Regola per la prossima fase
NON continuare ora con micro-rifiniture della setup.

Passare invece a:
1. verifica concreta del motore end-to-end
2. qualità della simulazione
3. qualità e credibilità del report
4. preparazione di una demo da far vedere a una persona HR

### Nota importante
Quando si tornerà in futuro sulla setup:
- lavorare solo se serve davvero al prodotto
- non riaprire la fase per dettagli cosmetici minuti
- mantenere coerenza generale con:
  - family feeling del report
  - header a due livelli (brand + guida/stato)
  - stessa logica di navigazione e leggibilità

  📌 STATO PROGETTO – FRINGE INTERVIEW
Stato generale
MVP FUNZIONANTE end-to-end

Pipeline completa testata:

CV + JD → Parser → JobFit → Question Set → Runtime → Answer Analysis → Adaptive Followup → Report
🧠 FASE 2 – COMPLETATA
Obiettivo fase 2

Superare il limite delle domande generiche → introdurre intelligenza adattiva reale

Risultato raggiunto
1. Domande iniziali
sistema ibrido:
base strutturata (question bank)
LLM gap question
risultato:
meno generico
più aderente al fit CV ↔ ruolo
2. Adaptive follow-up LLM

Implementato sistema completo:

✔ Trigger intelligente
basato su:
overallBand
dimensionScores (ownership, evidence, specificity…)
non più “sparato sempre”
✔ Controlli introdotti
A. Phase gating
❌ NO follow-up in:
OPENING
CLOSING
B. Budget
limite per sessione:
short → 1
standard → 2
deep → 3
C. Anti-ripetizione focus

memoria runtime:

usedAdaptiveFollowupFocuses = []
evita:
ownership → ownership → ownership
D. Max attempts per fase
evita loop infiniti
✔ Risultato comportamento reale

Esempio finale:

Triggered followups count: 1
Phase: ROLE_CONTEXT
Focus: ownership

👉 comportamento:

pulito
credibile
realistico
non invasivo
⚙️ ARCHITETTURA ATTUALE (IMPORTANTE)
LLM usato in 3 punti
Parser (forte)
LLM gap question (leggero)
Adaptive follow-up (mirato)

👉 NON:

ogni domanda
ogni step

✔ strategia:

usare LLM solo dove crea valore reale

🧩 LIMITI ATTUALI (NOTA PER FUTURO)
wording follow-up ancora semplice
(es: “contributo diretto…”)
domanda iniziale ancora semi-generica in alcuni casi
nessuna memoria semantica avanzata tra risposte
🚀 FASE 3 (NEXT STEP)
Direzione consigliata

NON più “generare meglio domande”

👉 ma:

👉 rendere visibile l’intelligenza

Esempi:

nel report:
perché è stata fatta quella domanda
perché è stato attivato follow-up
modalità “coach”
spiegabilità → valore prodotto
🎯 POSIZIONAMENTO PRODOTTO (CRITICO)

Il sistema NON è:

“generatore di domande”

È:

simulatore di selezione reale

con:

coerenza CV ↔ ruolo
pressione adattiva
valutazione forma risposta
📁 FILE CHIAVE MODIFICATI
buildInterviewQuestionSet.js
advanceInterviewRuntime.js ← (logica follow-up + anti-repeat)
generateAdaptiveFollowupQuestion.js
runFringeInterviewMVPSession.js
⚠️ NOTE TECNICHE IMPORTANTI

attenzione export:

export { renderFringeInterviewReportHtml }

→ deve essere coerente con file

Groq:
limiti free → usare LLM con parsimonia ✔ (già fatto)
🧠 DECISIONI CHIAVE CONSOLIDATE

✔ NO LLM per tutto
✔ SI LLM:

gap intelligenti
momenti critici

✔ controllo sempre lato codice

## Update — 2026-04-10 / report HTML quasi invariato: trovato il vero collo di bottiglia

### Stato del lavoro
È stato aperto un blocco di lavoro per migliorare:

- aderenza tra risposta e commento
- severità verso pseudo-risposte “ben suonanti” ma povere
- differenziazione dei commenti risposta-per-risposta
- percezione di intelligenza reale nel report

### Interventi effettivamente fatti
Sono stati modificati / rafforzati:

- `src/interview/analyzeAnswerShape.js`
- `src/interview/collectInterviewReport.js`
- `src/interview/buildFinalCandidateReport.js`
- `src/app/renderFringeInterviewReportHtml.js`

Sono stati anche sistemati gli script di test che erano rotti o instabili:

- `scripts/test_answer_shape_from_runtime.js`
- `scripts/test_collect_interview_report.js`
- `scripts/test_build_final_candidate_report.js`

### Risultato tecnico
I test principali tornano a girare correttamente:

- answer shape runtime
- interview report collector
- final candidate report

In particolare `test_build_final_candidate_report.js` è stato corretto per:
- usare `await` correttamente
- evitare loop infiniti
- completare la sessione in modo stabile

### Osservazione critica emersa
Nonostante le modifiche al motore e al renderer, il report HTML aperto localmente / pubblicato appare ancora quasi identico a prima.

Sintomi osservati:
- il voto della prima pseudo-risposta resta 38 anche dopo penalizzazioni più dure
- molti commenti nel tab “Profilo e risposte” restano molto simili o identici
- il report percepito non riflette davvero il lavoro fatto sul motore
- l’impressione è che la pagina stia leggendo dati vecchi o non rigenerati dalla pipeline aggiornata

### Diagnosi vera
Il problema NON è più principalmente nel renderer.

Il vero collo di bottiglia probabile è nello script:

- `scripts/test_generate_interactive_shell_html.js`

Perché questo script:
- NON rigenera la sessione end-to-end
- legge invece un JSON già pronto da:
  - `tmp/app-mvp-session/fringe_interview_mvp_session_result.json`
  - oppure fallback `tmp/app-mvp/fringe_interview_mvp_result.json`

Quindi il report HTML mostrato può facilmente restare “stale” o comunque non coerente con le ultime modifiche fatte a:
- analyzer
- collector
- final report
- renderer

### Decisione pratica corretta
NON continuare a inseguire ancora micro-fix del renderer o dei testi finché non si verifica e si corregge il flusso di alimentazione del report HTML.

### Prossimo step corretto per la ripresa
Prima cosa da fare alla prossima sessione:

1. analizzare e modificare `scripts/test_generate_interactive_shell_html.js`
2. fare in modo che il report HTML venga costruito da una sessione aggiornata davvero
   - oppure rigenerando end-to-end
   - oppure leggendo un file JSON sicuramente aggiornato dal test corretto
3. solo dopo tornare a:
   - qualità commenti
   - punteggi
   - wording domande
   - UX report

### Stato concettuale confermato
Il problema attuale non è “grafico” in senso stretto.

Il vero gap resta:
- credibilità della lettura
- aderenza risposta → commento
- percezione che il report stia davvero parlando delle risposte date

Ma prima di intervenire ancora su quello, serve chiudere il wiring corretto tra:
- pipeline reale
- file JSON prodotto
- HTML finale aperto dall’utente

## Update — 2026-04-10 / Cambio strategia: introduzione "demo reference case"

### Problema emerso
Lo sviluppo ha rallentato perché:

- il report HTML non riflette sempre modifiche recenti
- i test leggono JSON già esistenti (potenzialmente stale)
- difficile capire se una modifica ha davvero effetto
- troppo tempo speso a capire il flusso invece che migliorarlo

### Decisione chiave
Introdurre un **"demo reference case" unico** che diventa il laboratorio ufficiale.

NON un file enorme.
MA un caso controllato, stabile, ripetibile.

### Obiettivo
Avere un solo punto di verifica per:

- qualità delle domande
- qualità dei commenti
- severità del sistema
- percezione del report

### Implementazione prevista
Creare:

scripts/demo_reference_case.js

Questo script deve:

1. generare la sessione end-to-end
   - deriveInterviewPlan
   - buildInterviewQuestionSet
   - composeInterviewSession
   - createInterviewRuntime
   - advanceInterviewRuntime

2. usare risposte sintetiche controllate:
   - una debole (pseudo-introduzione)
   - una media
   - una concreta
   - una decisionale (trade-off)
   - una pressione (attrito)
   - una apprendimento (reflection)

3. generare:
   - interviewReport
   - finalCandidateReport
   - HTML report

4. salvare tutto in:
   tmp/demo-reference/

### Nuova regola di sviluppo
FINCHÉ il demo reference case non è attivo:

- NON fare ulteriori raffinamenti del renderer
- NON inseguire micro-migliorie nei commenti
- NON valutare il prodotto su HTML non controllato

### Metodo da ora in poi
Ogni modifica viene verificata solo su:

- demo reference case
- stesso input
- stesso flusso

→ risultato: verifica immediata effetto sì/no

### Impatto atteso
- drastica riduzione del tempo perso in debug
- maggiore controllo sul comportamento del sistema
- accelerazione verso una demo presentabile

### Stato
NON ancora implementato.
Priorità assoluta per la prossima sessione.

## [UPDATE] Answer Shape Engine – Fix classificazione walkthrough + stabilizzazione demo lab

### Problema identificato
Nel motore `analyzeAnswerShape`, la classificazione delle domande tramite `inferQuestionType()` era troppo permissiva:
- la presenza della parola "percorso" attivava automaticamente `isWalkthrough`
- questo portava a leggere domande di tipo `ROLE_CONTEXT` come se richiedessero necessariamente un racconto cronologico con episodio

Effetto:
- penalizzazione eccessiva delle risposte di positioning / role fit
- summary sbilanciati ("manca episodio") anche quando la risposta era coerente con la domanda

---

### Intervento strutturale effettuato

Modifica in:
`src/interview/analyzeAnswerShape.js`

- ristretto il criterio di attivazione di `isWalkthrough`
- rimosso trigger generico su "percorso"
- mantenuti solo pattern espliciti (es. "walk me through your career")

---

### Risultato

Nel laboratorio demo:

- prima core question (ROLE_CONTEXT) ora letta correttamente come:
  → domanda di posizionamento / trasferibilità

- miglioramento immediato:
  - reference Answer 1: da ~42 → ~55
  - summary coerente (non più forzato su "episodio mancante")

- pathological invariato → buon segnale (robustezza)

---

### Stato demo lab

Il laboratorio è ora considerato stabile:

- demo_reference_case.js
- demo_pathological_case.js
- compare_demo_cases.js

Funzionalità:
- confronto pulito senza `n/d`
- differenziazione chiara reference vs pathological
- lettura coerente della prima core question

---

### Insight strutturale acquisito

Non tutte le domande con "percorso" sono walkthrough.

Distinzione fondamentale introdotta:
- WALKTHROUGH → racconto cronologico / carriera
- ROLE_CONTEXT → trasferibilità / positioning

---

### Prossimo focus

Non più sul demo case, ma su:
- qualità di weaknesses e improvement hints
- riduzione ripetizioni
- maggiore differenziazione tra risposta media e risposta buona

## [UPDATE] Answer Shape – nuovi punti critici emersi dal demo lab

### 1. Falso positivo elegante
È emerso un problema importante: alcune risposte possono risultare “formalmente buone” perché contengono:
- lessico professionale
- mini-esempio
- struttura ordinata
- riferimento a risultati

ma restano in realtà poco coerenti con la domanda.

Caso tipico:
- domanda sul perché il ruolo sia il passo successivo naturale
- risposta che scivola su un caso operativo e non chiarisce davvero la logica del passaggio professionale

Direzione:
- rafforzare `questionAlignment`
- evitare che dettaglio operativo + tono professionale producano falsi positivi

---

### 2. Pathological ancora troppo morbido in alcuni casi
Alcune risposte patologiche vengono già classificate bene (`off_topic`, `evasive`, `nonsense`, `duplicate`), ma il linguaggio del summary in certi casi resta ancora troppo diplomatico o blando rispetto alla reale qualità della risposta.

Caso critico:
- risposta chiaramente provocatoria / presa in giro
- commento ancora troppo vicino a “profilo misto” o “migliorabile”

Direzione:
- rendere più netta la narrazione dei casi incompatibili col setting del colloquio

---

### 3. Contesto cumulativo della sessione
Insight molto importante emerso:
in un colloquio reale il recruiter non valuta ogni risposta come blocco isolato.

Dopo che il candidato ha raccontato:
- percorso
- ruoli
- responsabilità
- contesto operativo

le risposte successive possono restare valide anche senza ripetere ogni volta tutto il contorno.

Quindi:
- l’assenza di riferimenti espliciti di contesto NON va sempre penalizzata nello stesso modo
- se il contesto è già stato costruito bene prima, il motore dovrebbe tenerne conto

Direzione concettuale:
- introdurre in futuro una forma di `context_carryover_credit`
- credito di contesto narrativo accumulato nella sessione
- da usare per ridurre penalità eccessive sulle risposte coerenti ma non iper-esplicite

---

### 4. Nuova priorità motore
Il prossimo miglioramento strutturale non riguarda più il wiring o il laboratorio.

Nuova priorità:
- migliorare la severità e precisione di `questionAlignment`
- distinguere meglio:
  - risposta formalmente buona ma semanticamente fuori asse
  - risposta realmente centrata
  - risposta coerente ma contestualmente implicita

Il demo lab è ormai considerato abbastanza stabile da usare come banco prova ufficiale.

## [UPDATE] Answer Shape – transition questions corrette sul piano semantico

### Stato raggiunto
È stato corretto un falso positivo importante nelle domande di transizione / positioning, in particolare su domande del tipo:

- perché questo ruolo è il passo successivo naturale
- perché questo ruolo ha senso adesso
- why this role / next step

Problema precedente:
- una risposta con lessico professionale + mini-caso operativo + risultato apparente poteva essere letta come quasi buona
- il motore premiava struttura e dettaglio operativo anche quando mancava la vera logica del passaggio verso il ruolo

---

### Intervento effettuato
In `src/interview/analyzeAnswerShape.js` sono stati rafforzati:

- `questionAlignment` sulle transition questions
- weakness specifica per mancanza di transition logic
- improvement hint specifico
- summary specifico per risposte apparentemente buone ma semanticamente fuori asse

---

### Risultato
Nel demo lab, la Answer 1 reference ora viene letta in modo molto più corretto:

- non più come risposta quasi convincente
- ma come risposta con elementi utili, ancora fuori asse rispetto al cuore della domanda

Nuova lettura coerente:
- summary: manca la logica del passaggio
- weakness: risposta parzialmente fuori asse
- hint: esplicitare perché il ruolo è il passo coerente adesso

---

### Insight consolidato
Il motore sta passando da:

- valutazione della forma
a
- interpretazione del tipo di domanda

Questo è un salto qualitativo importante per il valore prodotto.

---

### Prossima priorità
Nuovo blocco consigliato:
- distinguere meglio le risposte semplicemente deboli dalle risposte provocatorie / non serie / incompatibili col setting del colloquio
- introdurre una lettura più netta dei casi di presa in giro

## [UPDATE] Answer Shape – nuova priorità su risposte provocatorie / non serie

### Stato raggiunto
Il motore ora legge meglio le transition questions:
- non premia più automaticamente mini-casi operativi ben scritti ma fuori asse rispetto alla logica del passaggio di ruolo
- summary / weakness / hint delle transition questions sono ora semanticamente coerenti

---

### Nuovo problema emerso
Resta ancora da distinguere meglio tra:
- risposta semplicemente debole
- risposta fuori tema
- risposta nonsense
- risposta provocatoria / non seria / incompatibile col setting del colloquio

Caso tipico:
- contenuto manifestamente laterale o assurdo
- tono poco collaborativo
- impressione da presa in giro o non-serietà

Oggi questi casi vengono spesso catturati come `off_topic` o `nonsense`, ma senza una lettura abbastanza netta del loro significato relazionale nel contesto del colloquio.

---

### Nuova priorità
Introdurre nel motore una lettura più precisa dei casi:
- unserious
- provocative
- non collaborative

senza confonderli con semplice debolezza o genericità.

Obiettivo:
- rendere il sistema più credibile agli occhi di recruiter e candidati
- distinguere meglio errore, vaghezza e atteggiamento incompatibile col setting

## [UPDATE] Demo lab + answer evaluation tuning – blocco considerato chiuso

### Stato raggiunto
Il blocco di affinamento della valutazione tramite demo lab è ora considerato sufficientemente stabile.

Componenti consolidate:
- `scripts/demo_reference_case.js`
- `scripts/demo_pathological_case.js`
- `scripts/compare_demo_cases.js`

---

### Miglioramenti consolidati nel motore

#### 1. Riduzione dei falsi positivi eleganti
Le risposte formalmente buone ma semanticamente fuori asse non vengono più premiate in modo ingenuo.

Caso corretto:
- domanda di transition / next step
- risposta con mini-caso operativo ben scritto ma senza vera logica del passaggio
- ora letta come parzialmente fuori asse, non più come quasi convincente

#### 2. Migliore classificazione del tipo di domanda
Il motore distingue meglio tra:
- transition / role fit
- contesto operativo
- pressure / attrito
- example missing

In particolare:
- `isWalkthrough` ristretto
- `isDecision` ristretto
- `PRESSURE_PROBE` non più trascinato automaticamente verso `isExample`

#### 3. Introduzione e consolidamento di casi problematici intermedi
Oltre a:
- `evasive`
- `off_topic`
- `nonsense`
- `duplicate`
- `non_answer`

sono stati consolidati:
- `generic_example_missing`
- `provocative_unserious`

#### 4. Summary, weakness e hint ora più coerenti con la domanda
I summary non sono più uniformi:
- role fit → trasferibilità / collegamento col ruolo
- contesto operativo → ambiente e modo di lavorare
- pressure → gestione della pressione / posizione presa

#### 5. Coerenza tra motore, runtime e comparison lab
Il runtime ora espone correttamente:
- `problematicAnswerType`
- `problematicAnswerConfidence`
- `problematicAnswerReasons`

Il comparison tool è stato riallineato per mostrare in modo coerente:
- problematic type
- confidence
- summary
- weakness
- hint

---

### Insight progettuale confermato
Il motore sta smettendo di valutare solo la forma della risposta e sta iniziando a interpretare davvero:
- il tipo di domanda
- la posizione del candidato
- il grado di collaborazione col setting del colloquio

Questo è un passo importante verso il valore prodotto finale.

---

### Decisione pratica
Questo blocco viene considerato chiuso operativamente.

Nuovo focus consigliato:
- percezione di valore nel report finale
- struttura / wow effect
- differenza chiara tra free / pro / premium

## [UPDATE] Nuova leva introdotta: role credibility anchors

### Insight emerso
Nel colloquio reale, a parte casi junior o neolaureati, la credibilità passa anche da:
- ruoli effettivamente ricoperti
- responsabilità reali
- contesti aziendali o funzionali riconoscibili
- perimetro concreto dell’esperienza

Parlare solo di:
- qualità personali
- metodo
- trasferibilità astratta

non basta per ottenere una lettura davvero forte.

---

### Decisione
Introdotta nel motore una nuova sensibilità ai `role credibility anchors`:

segnali come:
- ruolo ricoperto
- responsabilità personale
- contesto di team / funzione / azienda
- esperienza situata

Questi segnali non bastano da soli a produrre punteggi alti, ma aumentano la credibilità della risposta rispetto a una risposta puramente astratta.

---

### Regola concettuale
Una risposta che cita solo “esperienze passate” in modo superficiale:
- deve essere valutata meglio di una risposta totalmente astratta
- ma non deve essere premiata troppo se manca sostanza reale

Quindi:
- piccolo credito di credibilità
- nessun premio forte senza ownership, evidenza e concretezza

## [UPDATE] Role credibility anchors – integrazione nel motore

### Insight emerso
Nel colloquio reale, la credibilità non deriva solo da:
- forma della risposta
- qualità del linguaggio
- struttura narrativa

ma anche da:
- ruoli effettivamente ricoperti
- responsabilità reali
- contesto operativo concreto

Le risposte basate solo su:
- qualità personali
- metodo
- trasferibilità astratta

risultano meno credibili, soprattutto per profili non junior.

---

### Intervento introdotto
È stata aggiunta una nuova famiglia di segnali:
`roleCredibilityMarkers`

Questi intercettano riferimenti a:
- ruoli (es. “nel mio ruolo”, “come PM”)
- responsabilità (“ero responsabile di”, “gestivo”)
- contesto (“nel team”, “in azienda”, “nella funzione”)

---

### Effetto sul motore
- leggero aumento della specificità quando presenti
- nessun premio forte se non accompagnati da:
  - evidenza
  - ownership
  - concretezza

---

### Nuove letture introdotte
Il motore ora distingue meglio tra:
- capacità dichiarate
- esperienza reale situata

E segnala quando:
> la risposta richiama capacità ma resta poco ancorata a ruoli o contesti reali

---

### Comportamento desiderato
- esperienza + sostanza → punteggio alto
- esperienza nominata ma vaga → medio/basso + hint
- nessuna esperienza → basso

---

### Stato
Blocco considerato stabile e chiuso.

Il motore ora:
- riduce falsi positivi eleganti
- penalizza risposte non collaborative
- riconosce meglio la credibilità reale del candidato

🔬 TEST STRATEGY – VALIDAZIONE RISPOSTE (APR 2026)
Triple Test Pattern (nuovo standard)

Per validare il motore di analisi risposte, usare il seguente schema su UNA stessa domanda:

Risposta forte (good)
concreta
con decisione
con outcome
Risposta “finta buona” (fake good)
linguaggio professionale
struttura corretta
ma contenuto vuoto o non verificabile
Risposta patologica (bad)
off topic / evasiva / nonsense
Obiettivo

Il sistema deve distinguere chiaramente:

good → punteggio medio-alto
fake good → punteggio medio-basso (⚠️ caso critico)
bad → punteggio basso
Nota critica

Il test chiave è la fake good:
→ se il sistema la premia troppo → problema di fondo nel motore

Regola operativa
NON cambiare le domande durante questi test
testare il motore, non il question set

## [UPDATE] Triple Test – caso critico emerso: fake good ancora premiata troppo

### Test eseguito
Domanda testata:
- “Guardando questo ruolo, quali parti della tua esperienza pensi siano davvero trasferibili nella gestione operativa, nel coordinamento e nelle priorità?”

Confronto eseguito tra:
- risposta reference (buona)
- risposta fake good (linguaggio professionale ma sostanza insufficiente)

### Esito
Risultato problematico:
- Reference: 51 / medium
- Fake good: 54 / medium

Questo è troppo generoso verso la fake good e segnala un limite residuo del motore.

---

### Interpretazione
Il motore oggi premia ancora troppo:
- coerenza superficiale
- lessico professionale
- marker di trasferibilità
- struttura e chiarezza

anche quando mancano:
- ruolo concreto
- responsabilità reale
- episodio verificabile
- sostanza dimostrativa

---

### Nota importante
La lettura qualitativa testuale è già migliore dello scoring:
- weakness della fake good corretta
- improvement hint corretto

Quindi il problema residuo è soprattutto:
- scoring
- severità del summary nelle risposte elegantemente generiche

---

### Nuova priorità motore per la prossima ripresa
Blocco da aprire:
## fake good suppression

Obiettivo:
abbassare le risposte che:
- suonano professionali
- restano coerenti in superficie
- ma non portano sufficiente sostanza reale

senza penalizzare troppo:
- risposte brevi ma concrete
- risposte valide con contesto implicito già costruito nella sessione

---

### Regola strategica
NON introdurre nuove domande per questo test.
Usare il triple test sulla stessa domanda come strumento stabile di validazione del motore.

## [UPDATE] Triple test riuscito + vincolo architetturale sul contesto accumulato

### Esito triple test
Sul caso "fake good" il motore è stato corretto con successo.

Prima:
- fake good = 54 / medium

Ora:
- fake good = 40 / weak

Nuova lettura corretta:
- formalmente professionale
- ma troppo generica
- poco ancorata a esperienze reali
- credibilità ridotta

Questo blocco di `fake good suppression` è da considerare riuscito in prima versione.

---

### Vincolo emerso (molto importante)
La valutazione NON deve restare solo per risposta isolata.

Nel colloquio reale, se il candidato ha già chiarito bene in risposte precedenti:
- ruolo
- responsabilità
- contesto operativo
- settore
- esperienza aziendale

allora nelle risposte successive può bastare anche un richiamo più leggero a quell’esperienza.

Quindi una singola risposta non va sempre penalizzata per mancanza di contesto esplicito se:
- il contesto è già stato costruito bene nella sessione
- la continuità narrativa resta leggibile

---

### Nuova direzione concettuale
Da introdurre in futuro:
## context carryover credit

Definizione:
piccolo credito di credibilità narrativa derivante dal contesto già accumulato nella sessione.

Uso:
- ridurre penalità eccessive su risposte coerenti ma non iper-esplicite
- NON salvare risposte vuote, evasive o poco sostanziali

---

### Driver aggiuntivo emerso
Anche il riferimento ad aziende o contesti professionali riconoscibili può essere un segnale forte per HR.

Da considerare in futuro:
- azienda riconosciuta nel settore
- settore coerente col ruolo target
- funzione compatibile
- seniority plausibile

Nota:
questo deve agire come ancora di credibilità, non come premio automatico.

## [UPDATE] Overview report redesign – stato molto avanzato

### Obiettivo del blocco
Rendere la prima pagina del report meno anonima e più simile a un prodotto desiderabile, con:
- gerarchia visiva chiara
- KPI subito leggibili
- sintesi forte
- errori principali evidenti
- minore effetto “mosaico di riquadri”

---

### Interventi realizzati

#### 1. Header report semplificato e reso più utile
- mantenuto fisso il brand `FRINGE Interview`
- aggiunta dicitura `Report & Coaching`
- aggiunto banner descrittivo della sezione attiva
- banner reso dinamico al cambio tab

#### 2. KPI iniziali resi più centrali
In apertura della overview ora compaiono:
- Ruolo target
- CV per questo ruolo
- Aderenza al ruolo
- Qualità delle risposte

Con colori più forti e leggibilità migliorata.

#### 3. Blocco “Lettura generale” reso più evidente
- eliminata parte dell’effetto introduttivo dispersivo
- introdotto blocco più forte e più leggibile
- mantenuta però ancora la dipendenza da `executiveRead.headline` / `finalTakeaway.message` quando presenti

Nota:
il fallback testuale nuovo non sovrascrive la headline se i dati runtime forniscono già un testo. Questo resta un punto da ricordare se si vorrà cambiare davvero il verdetto iniziale.

#### 4. Blocco “3 errori che oggi ti bloccano di più”
Completamente migliorato:
- sfondo scuro dedicato
- numerazione chiara
- categorie più leggibili:
  - Apprendimento
  - Responsabilità
  - Impatto
- testi più editoriali e meno “grezzi da motore”

Versioni attuali:
- Non emerge ancora abbastanza bene come impari, correggi il tiro o fai evolvere il tuo modo di lavorare.
- Non sempre si capisce con precisione che cosa dipendeva davvero da te e che cosa invece apparteneva al team o al contesto.
- Le risposte restano spesso plausibili, ma portano ancora poche prove visibili di risultato, impatto o valore generato.

#### 5. Blocchi finali overview
I due blocchi finali sono stati resi meno anonimi:
- `Punto forte`
- `Prossima mossa`

con maggiore differenziazione visiva e migliore leggibilità.

---

### Stato attuale della overview
La pagina iniziale del report non è ancora definitiva, ma ha fatto un salto netto:
- meno anonima
- più leggibile
- più “prodotto”
- meno dispersiva
- più orientata a cosa si capisce subito

Valutazione qualitativa attuale:
overview passata circa da 5.5/10 a ~7.5/10.

---

### Punto ancora aperto da ricordare
La frase principale della “Lettura generale” è ancora alimentata dai dati runtime:
- `executiveRead.headline`
- `finalTakeaway.message`

Se in futuro si vorrà modificare davvero quel testo iniziale, bisognerà intervenire:
- sulla sorgente dei dati
oppure
- sulla priorità con cui il renderer sceglie il messaggio da mostrare

---

### Prossimo passo consigliato
Passare alla sezione:
## Profilo e risposte

Focus previsto:
- eventuale riattivazione / ripensamento dell’evidenziazione colori
- maggiore effetto coaching domanda per domanda
- miglior percezione del valore PRO / PREMIUM

## [NOTE OPERATIVE] Top navigation report – punti ancora aperti

### Problemi osservati
La barra orizzontale dei pulsanti in alto (Sintesi / Profilo e risposte / CV / PRO / PREMIUM) è migliorata, ma resta ancora sotto il livello desiderato.

Punti critici:
- i pulsanti risultano meno leggibili dei KPI sottostanti
- non comunicano abbastanza bene di essere elementi interattivi / cliccabili
- la sezione attiva non emerge ancora in modo netto
- il contorno / riquadro colorato del pulsante selezionato non si percepisce abbastanza
- locked/unlocked e active/inactive non sono ancora abbastanza distinti a colpo d’occhio

### Da fare nella prossima ripresa
Lavorare sulla top navigation del report con focus su:
- leggibilità più alta di label e note
- maggiore affordance da pulsante interattivo
- stato attivo molto più evidente
- bordo esterno / outline del tab attivo più marcato
- sfondo interno del tab attivo più differenziato
- migliore distinzione visiva tra inattivo / hover / attivo / locked

## [NOTE FINALI] Rifinitura overview / top navigation

### Stato
La direzione della overview è buona e più forte di prima.
Restano però alcuni micro-interventi finali di rifinitura visiva e di chiarezza.

---

### 1. Top navigation – punti ancora da migliorare
- il fondo della barra è migliorato, ma nella parte bassa può diventare un po’ più verde e luminoso
- la selezione del tab attivo è ancora troppo poco visibile
- per i 3 tab FREE conviene usare una sfumatura più distinta dal verde di fondo
- aggiungere / rendere molto più evidente il bordo del tab attivo
  - colore consigliato: giallo o arancio
  - bordo più spesso
- aumentare l’ombra sotto i tab per farli staccare meglio dal fondo
- evitare che il pulsante 4 cambi impaginazione quando selezionato
  - niente salto di riga diverso tra stato attivo e inattivo

---

### 2. Header – rifinitura finale
- aggiungere personalizzazione utente, es.:
  - `FRINGE Interview per Marco`
- portare `Report & Coaching` in posizione più centrale / più evidente
- mantenere il banner dinamico ma renderlo ancora più leggibile

---

### 3. Lettura generale – micro copy
Il blocco funziona meglio, ma il titolo può essere più esplicito:
- `La lettura generale che emerge dal tuo CV e dalle tue risposte`
oppure
- `La lettura generale emersa dal CV e da come hai risposto`

Obiettivo:
chiarire subito che la sintesi nasce sia da CV sia da risposte.

---

### 4. Ombreggiature / distacco dei blocchi
Da fare un micro-giro finale su:
- ombra dei tab
- ombra dei KPI
- ombra dei riquadri con testo

Obiettivo:
far “staccare” meglio tutti i blocchi dal fondo, senza effetto pesante.

---

### Esito complessivo
La overview è ormai vicina a una versione buona/solida.
Le prossime modifiche non sono strutturali ma di rifinitura finale.

## [UPDATE] Overview report – stato quasi chiuso

### Stato generale
La pagina iniziale del report ha fatto un salto netto rispetto alla versione iniziale.
Ora presenta:
- struttura più leggibile
- KPI in apertura
- blocco “Lettura generale” più forte
- sezione “3 errori” con maggiore identità
- blocchi finali “Punto forte” e “Prossima mossa” più riconoscibili

Valutazione qualitativa:
overview ormai abbastanza solida e presentabile; non perfetta, ma abbastanza chiusa per non continuare a rifinirla all’infinito.

---

### Miglioramenti effettivamente ottenuti
1. Header più forte
- `FRINGE Interview`
- `Report & Coaching`
- banner dinamico di sezione
- migliorato gradiente dell’header

2. Top navigation migliorata
- tab più leggibili
- tab attivo più visibile
- selezione più chiara rispetto a prima
- comportamento generale migliore rispetto alla versione precedente

3. KPI iniziali più leggibili
- Ruolo target
- CV per questo ruolo
- Aderenza al ruolo
- Qualità delle risposte

Nota:
`CV plausibile` funziona meglio del precedente wording.

4. Blocco “Lettura generale”
- fondo scuro blu distinto dagli altri
- testo più autorevole
- migliore percezione di sintesi centrale del report

5. Blocco “3 errori”
- ora più utile e leggibile
- categorie:
  - Apprendimento
  - Responsabilità
  - Impatto
- testi più editoriali e meno “grezzi da motore”

6. Blocchi finali overview
- `Punto forte`
- `Prossima mossa`
ora più visibili grazie a titolini/capsule e migliore gerarchia

---

### Micro-fix finali verificati
- banner dell’header: centrato correttamente
- `Punto forte` e `Prossima mossa`: più evidenti
- ombre: percepite soprattutto sotto la fascia comandi; sugli altri riquadri ancora non particolarmente evidenti, ma non considerate bloccanti per ora

---

### Decisione operativa
Per ora NON continuare a rifinire la overview.
La pagina è sufficientemente buona per passare oltre.

---

### Punto ancora aperto ma non prioritario
Top navigation:
- ancora migliorabile in assoluto
- ma non abbastanza da giustificare altro tempo immediato sulla sola overview

---

### Prossimo passo consigliato
Passare alla sezione:
## Profilo e risposte

Focus previsto:
- maggiore effetto coaching domanda per domanda
- possibile riattivazione / ripensamento dell’evidenziazione colori
- aumento della percezione di valore della parte FREE / PRO / PREMIUM
- rendere la lettura delle singole risposte più “wow” e più utile operativamente

## [NOTE APERTE] Sottopagina “Profilo e risposte”

### Decisione di UX da portare avanti
La barra delle risposte dovrebbe diventare un vero **sottomenu fisso della pagina**, sempre disponibile mentre si legge la singola risposta.

Motivazioni:
- questa pagina si basa sul confronto rapido tra le diverse risposte
- il menu risposte è l’interazione principale della pagina
- se scorre via, si perde parte della sensazione di tool / coaching attivo

Direzione consigliata:
- top nav principale invariata
- sotto, sub-menu risposte sticky solo per questa pagina
- più compatto in Y
- desktop sempre visibile
- mobile con scroll orizzontale

---

### Altri fix da fare sulla sottopagina
- avvicinare di più il blocco risposte alla barra superiore
- rendere più compatto in Y il blocco alto
- centrare meglio:
  - titolo sezione
  - istruzione “Seleziona qui sopra…”
- nel titolo evidenziare con colore diverso il ruolo target
- rimuovere il refuso di fase (`opening`, ecc.) ancora visibile sopra il riquadro domanda
- rifinire i due riquadri finali in basso
- mantenere il gradiente del blocco “Che cosa è emerso”, che funziona bene
- mantenere i voti nei pulsanti, che ora risultano migliori

## 🔷 UPDATE – PRO REPORT V2 + ARCHITETTURA MODULARE (APRILE 2026)

### Stato raggiunto

È stata completata una fase chiave di evoluzione del prodotto:

1. Introduzione del **PRO REPORT V2**
2. Separazione tra:

   * contenuto (builder)
   * layout per piano (config)
   * rendering (HTML)
3. Implementazione di una **architettura modulare per piani (FREE / PRO / PREMIUM)**

---

## 🧠 Nuova architettura (punto fondamentale)

### 1. Contenuti generati (builder)

File principale:

```
src/report/buildProReportV2.js
```

Produce:

* overview
* answersWorkspace
* cvSlim
* sensitiveQuestionsDashboard
* finalChecklist
* ecc.

👉 Tutti i contenuti vengono generati **sempre**, indipendentemente dal piano.

---

### 2. Configurazione piani (modulare)

File:

```
src/report/reportPlanConfig.js
```

Definisce:

* quali moduli sono:

  * enabled
  * preview
  * locked
    per ogni piano:
* free
* pro
* premium

👉 È il punto centrale per:

* spostare contenuti tra piani
* fare marketing (preview)
* cambiare pricing senza toccare il core

---

### 3. Layout per sezione

File:

```
src/report/getReportSectionLayout.js
```

Restituisce:

* moduli attivi per sezione:

  * overview
  * answers
  * cv
  * final
  * sensitive

👉 Usa reportPlanConfig come sorgente.

---

### 4. Assemblaggio dati + layout

File:

```
src/report/assembleReportSectionData.js
```

Combina:

* contenuto (report)
* layout (plan)

Output:

* moduli con:

  * visibility
  * rendererKey
  * data

👉 Questo è il vero “motore di composizione”.

---

### 5. Rendering HTML

File:

```
src/app/renderProReportHtml.js
```

👉 Ora deve leggere SOLO:

* moduli abilitati dall’assembler

⚠️ Attualmente:

* il renderer è ancora parzialmente hardcoded
* prossimo step: render completamente dinamico

---

## 🧩 Evoluzione contenuti PRO

### 1. CV Slim evoluto

Ora include:

* leve con:

  * label
  * weight (leva utile / gap rilevante ecc.)
* narrativa unica (no ripetizione macchina)
* strategie di mitigazione (tono umano)
* impostazione narrativa del posizionamento

👉 Importante:

* linguaggio NON più tecnico
* ma “consiglio realistico”

---

### 2. Risposte

* featuredAnswers (overview)
* answersWorkspace (analisi completa)

👉 Ridotta ridondanza
👉 Migliorata leggibilità

---

### 3. Domande sensibili

* motivation_for_change
* opening_positioning
* role_fit
* conflict

👉 Struttura pronta per espansione PREMIUM

---

## ⚠️ Limiti attuali (consapevoli)

1. Renderer ancora non completamente modulare
2. Alcune ripetizioni nei contenuti
3. Le leve CV lato UI ancora semplici
4. Linguaggio migliorato ma non ancora definitivo

👉 Questi NON sono problemi ora
👉 Priorità: struttura, non rifinitura

---

## 🔜 Prossimi step consigliati

### STEP 1

Renderer dinamico basato su moduli (rimozione hardcode)

### STEP 2

Refinement contenuti:

* riduzione ripetizioni
* miglioramento tono linguistico

### STEP 3

Introduzione PREMIUM:

* riscrittura risposte
* coaching operativo
* linking risposta → miglioramento

### STEP 4

Marketing layer:

* preview nei FREE
* soft lock nei PRO

---

## 🎯 Principio chiave consolidato

👉 Il sistema NON genera pagine
👉 Il sistema genera **moduli riusabili**

E i piani (FREE / PRO / PREMIUM):
👉 sono solo combinazioni diverse degli stessi moduli

---

## 🧭 Nota strategica

Questa architettura permette:

* cambiare pricing senza rifare codice
* testare feature rapidamente
* costruire upsell naturali

👉 È una base solida per prodotto reale, non demo

## UPDATE – ARCHITETTURA MODULARE REPORT + PRO REPORT V2 (APRILE 2026)

### Stato raggiunto

In questa fase è stato consolidato un passaggio importante: il report non è più pensato come pagina rigida, ma come composizione di **moduli contenuto** governati dal piano (FREE / PRO / PREMIUM).

L’obiettivo è rendere possibile, in futuro, spostare contenuti tra piani o tra sezioni senza rifare il core del renderer e senza “chirurgia a cuore aperto”.

---

## 1. Architettura introdotta

### Builder contenuti

File principale:

```text
src/report/buildProReportV2.js
```

Questo builder produce la struttura dati del PRO report, con almeno questi blocchi:

* `overview.openingPositioning`
* `overview.blockingPriorities`
* `overview.featuredAnswers`
* `overview.sensitiveQuestionsDashboard`
* `overview.cvSlim`
* `overview.finalChecklist`
* `answersWorkspace.items`

---

### Configurazione piani

File:

```text
src/report/reportPlanConfig.js
```

Contiene la configurazione dei moduli per piano e per sezione, con bucket:

* `enabled`
* `preview`
* `locked`

Piani gestiti:

* `free`
* `pro`
* `premium`

Questo file è ora il punto giusto per:

* spostare un contenuto da FREE a PRO
* mostrare preview marketing
* decidere cosa è visibile o no per piano

---

### Registry moduli

File:

```text
src/report/reportModuleRegistry.js
```

Contiene la definizione dei moduli:

* `key`
* `order`
* `title`
* `rendererKey`

Punto importante consolidato:
👉 il modulo **non ha più una sezione rigida interna**.
La sezione in cui compare è decisa dal piano/layout.

Questo era un punto chiave richiesto: rendere i moduli estraibili/spostabili senza refactor pesanti.

---

### Layout per sezione

File:

```text
src/report/getReportSectionLayout.js
```

Legge:

* piano
* sezione

e restituisce i moduli ordinati per quella sezione, con visibilità corretta.

---

### Assembler contenuti reali

File:

```text
src/report/assembleReportSectionData.js
```

Combina:

* layout del piano
* dati del report reale

e restituisce i moduli con:

* metadati di layout
* `data` reale pronta per il renderer

Questo è il ponte reale tra:

* contenuto
* piano
* rendering

---

## 2. Renderer PRO aggiornato

File:

```text
src/app/renderProReportHtml.js
```

È stato fatto un primo passaggio reale verso il renderer modulare:

* la sezione **overview** non è più composta tutta hardcoded
* ora usa:

  * `assembleReportSectionData(...)`
  * moduli `enabled`
  * dispatcher `renderOverviewModule(...)`

Moduli overview già resi in modo modulare:

* `openingPositioning`
* `blockingPriorities`
* `featuredAnswers`
* `sensitiveQuestionsDashboard`
* `cvSlim`
* `finalChecklist`

La sezione `answersWorkspace` è ancora solo parzialmente hardcoded/stabile, ma il renderer overview ora usa davvero l’architettura modulare.

Questo è il punto che rende finalmente “reale” l’architettura e non solo teorica.

---

## 3. CV slim migliorato

Nel PRO report, il modulo `cvSlim` è stato migliorato.

Ora include:

* `strengthsForRole` come segnali strutturati:

  * `label`
  * `weight`
  * `impact`
* `weakOrMissing` come gap strutturati:

  * `label`
  * `weight`
  * `impact`
* `strengthsNarrative`
* `mitigationSuggestions`
* `positioningNarrative`

Evoluzione importante:

* ridotte alcune dedupliche grossolane
* introdotto un tono più “umano”
* introdotte strategie di mitigazione più realistiche
* introdotta una piccola logica narrativa di presentazione del profilo

Nota:
la resa visiva delle “leve” è ancora semplice e non definitiva, ma per ora va bene così: la priorità era la struttura, non il polishing UI.

---

## 4. Test / script usati in questa fase

Script rilevanti:

```text
scripts/test_report_section_layout.js
scripts/test_assemble_report_section_data.js
scripts/test_render_pro_report_v2.js
scripts/test_build_final_candidate_report.js
```

Output temporanei rilevanti:

```text
tmp/pro-report-v2/pro_report_v2.json
tmp/pro-report-v2/pro_report_v2_preview.html
```

---

## 5. Principio architetturale consolidato

Principio ora fissato:

👉 il sistema genera **moduli contenuto**
👉 i piani sono combinazioni di moduli
👉 il renderer deve leggere i moduli dal layout/assembler, non decidere da solo cosa mostrare

Questo consente in futuro:

* spostare moduli tra FREE / PRO / PREMIUM
* mettere preview marketing nel FREE
* spostare moduli tra overview / cv / final senza rifare il builder
* proteggere meglio il core del motore lato backend/serverless

---

## 6. Limiti attuali consapevoli

Ancora da rifinire, ma NON bloccanti adesso:

* alcuni testi suonano ancora “da macchina”
* alcune letture tecniche sono poco user-friendly

  * es. `Problematicità: none`
  * es. `Fuori asse: high/low`
  * es. fallback come `Domanda del colloquio`
* alcune ripetizioni residue nelle risposte e nei segnali CV
* `answersWorkspace` non ancora reso pienamente modulare come overview
* resa grafica di alcuni blocchi ancora povera ma accettabile per questa fase

---

## 7. Prossimi step consigliati

### Step successivo consigliato

Rendere più leggibili e meno tecnici alcuni micro-output del workspace risposte:

* traduzione di `problematicAnswerType`
* traduzione di `offTopicRisk`
* miglioramento fallback `questionIntent`

### Subito dopo

Valutare se modularizzare anche la sezione `answersWorkspace` nello stesso stile della overview.

### Solo dopo

Riprendere il refinement linguistico e UX:

* riduzione ripetizioni
* miglior tono prodotto
* più chiarezza su peso dei gap e delle leve
* eventuali soft teaser PREMIUM meglio inseriti

---

## 8. Nota strategica

Questa fase segna un passaggio importante:
il progetto non sta più lavorando solo sulla pagina, ma sulla **componibilità del prodotto**.

Questo è utile sia per:

* sviluppo più sicuro
* cambi di pricing / packaging
* futura protezione online del core motore (Vercel/serverless/backend)
* evoluzione commerciale reale del tool

Update:

* Creata e testata con successo una prima `question_relevance_matrix`
* Il test conferma un comportamento coerente per seniority/role traits:

  * `conflict_pressure` basso per junior, medio per mid, alto per senior leadership
  * `role_fit` e `opening_positioning` sempre molto rilevanti
  * `decision_tradeoff` cresce molto con seniority/leadership
* La matrice è pronta per essere usata come bonus/malus nel ranking delle question families
* Prossimo step consigliato: integrazione della relevance matrix nella selezione delle domande, prima come ranking adjustment e non ancora come filtro rigido

### Update – relevance matrix integrata nel ranking

* Creata `config/question_relevance_matrix.json`
* Creati:

  * `src/interview/loadQuestionRelevanceMatrix.js`
  * `src/interview/evaluateQuestionFamilyRelevance.js`
* Integrata la relevance matrix dentro `rankStructuredQuestions.js`
* La relevance ora agisce come bonus/malus di ranking per famiglia di domanda
* Corretta la funzione `inferQuestionFamilyKey(question)`:

  * prima controlla key/tags specifici
  * poi usa category come fallback
* Verifica riuscita:

  * `motivation_for_change` -> family corretta
  * `pressure_handling` -> `conflict_pressure`, low per junior
  * `decision_tradeoffs` -> `decision_tradeoff`, low per junior
  * `clarity_under_challenge` -> `conflict_pressure`, low per junior
* Risultato: la rilevanza non è più solo raccontata nel report, ma inizia a influenzare davvero la selezione delle domande
* Prossimo step consigliato:

  1. usare la matrix anche in `deriveQuestionSelectionStrategy`
  2. solo dopo rifletterla nel report in modo più elegante

  ### Update rapido – relevance matrix anche nella selection strategy

* La `question_relevance_matrix` ora influenza non solo `rankStructuredQuestions.js`, ma anche `deriveQuestionSelectionStrategy.js`
* Aggiunti metadata di controllo:

  * `roleFitRelevanceBand`
  * `motivationRelevanceBand`
  * `pressureRelevanceBand`
  * `decisionRelevanceBand`
* `shouldForcePressureSignal(...)` ora usa anche `pressureRelevanceBand`
* Risultato: il forcing di temi come pressione/conflitto non è più solo legato al tone/context, ma anche alla rilevanza del family per il target
* Test riuscito: la strategy gira e restituisce metadata coerenti
* Prossimo step utile:

  1. fare test comparativi junior vs senior
  2. decidere se usare la relevance matrix anche per evitare famiglie poco rilevanti nella selection, non solo per il forcing

  ### Update – validation relevance matrix su ranking + selection strategy

* Test comparativo riuscito su `deriveQuestionSelectionStrategy`
* Scenario JUNIOR:

  * `juniorMode: true`
  * `forcedPressureSignal: false`
  * `pressureRelevanceBand: low`
  * `decisionRelevanceBand: low`
  * `roleFitRelevanceBand: high`
* Scenario SENIOR:

  * `juniorMode: false`
  * `forcedSeniorityCalibration: true`
  * `forcedPressureSignal: true`
  * `pressureRelevanceBand: high`
  * `decisionRelevanceBand: high`
  * `roleFitRelevanceBand: high`

Conclusione:

* la `question_relevance_matrix` è ora integrata con successo

  * nel ranking (`rankStructuredQuestions.js`)
  * e nella selection strategy (`deriveQuestionSelectionStrategy.js`)
* il sistema inizia davvero a modulare il colloquio in base al target
* per junior non forza temi come pressione/tradeoff
* per senior li considera centrali

Prossimi step possibili:

1. usare la matrix anche per filtrare meglio alcune famiglie nella selection
2. migliorare il racconto/report della rilevanza lato UI
3. riprendere la sezione “Punti delicati da preparare bene”

### Update – relevance matrix effettivamente attiva nella selezione

Completato step importante sul motore di selezione domande.

#### Nuovi elementi introdotti

* `config/question_relevance_matrix.json`
* `src/interview/loadQuestionRelevanceMatrix.js`
* `src/interview/evaluateQuestionFamilyRelevance.js`

#### Integrazione completata

La relevance matrix ora influenza:

1. `rankStructuredQuestions.js`
2. `deriveQuestionSelectionStrategy.js`

#### Risultato ottenuto

La selezione delle domande cambia in modo coerente in base al target.

##### Test comparativo riuscito

**Scenario JUNIOR**
Selected question keys:

* `team_contribution_examples`
* `learning_orientation`
* `motivation_for_role`
* `closing_reflection`

Lettura:

* niente domande di pressione/conflitto
* niente tradeoff demanding
* focus su collaborazione, apprendimento, motivazione

**Scenario SENIOR**
Selected question keys:

* `client_pushback_handling`
* `accountability_examples`
* `priority_conflict_management`
* `expectation_reset`
* `clarity_under_challenge`
* `closing_reflection`

Lettura:

* forte presenza di pressione/conflitto
* accountability e gestione cliente
* selezione coerente con ruoli senior / contesti demanding

#### Conclusione

La relevance matrix non è più solo teorica o di report:

* guida davvero la costruzione del colloquio
* evita meglio domande poco rilevanti per junior
* favorisce temi più duri e strategici per senior

#### Stato architetturale attuale

* report modulare per piano già impostato
* PRO renderer modulare su overview + answersWorkspace
* relevance matrix integrata nel motore di selezione

#### Prossimi step consigliati

1. rifinire / ampliare il mapping `inferQuestionFamilyKey(question)`
2. valutare se rendere alcune esclusioni ancora più forti per family low relevance
3. tornare sulla UI/report:

   * “Punti delicati da preparare bene”
   * apertura/posizionamento iniziale
   * pulizia workspace risposte
4. introdurre in futuro una lettura autonoma di **potenzialità del candidato** come asse PREMIUM / HR

### Update – direzione pagina Risposte / Trainer

La pagina Risposte non deve restare un report statico, ma diventare un workspace di allenamento.

Direzione prodotto:

* domanda sempre visibile
* risposta originale sempre visibile
* lettura sintetica vicino alla domanda/risposta, non in fondo
* risposta migliorata affiancata o editabile
* possibilità futura di salvare le risposte migliorate
* possibilità futura di rianalizzare le risposte migliorate e confrontare punteggio prima/dopo

Struttura consigliata:

* header risposta: domanda, intento, score, lettura sintetica
* colonna sinistra: risposta originale + criticità + punti utili
* colonna destra: suggerimenti + bozza migliorata + editor
* footer: salva / rianalizza / confronta

Piano prodotto:

* PRO: esempio template “come potrebbe suonare meglio”
* PREMIUM: revisione full di tutte le risposte, editabile e rianalizzabile

Problema attuale:

* template ripetitivi
* rendering noioso
* lettura sintetica posizionata male

### Update – pagina Risposte / workspace a due colonne

È stata iniziata la trasformazione della pagina `Risposte` da report statico a workspace di allenamento.

#### Fatto

* `renderWorkspaceAnswerPanel(...)` è stato riorganizzato in forma più vicina a workspace:

  * header con intento/score
  * box scuro per la domanda
  * colonna sinistra “Risposta attuale”
  * colonna destra “Risposta migliorata / da allenare”
  * box “Come potrebbe suonare meglio”
  * nota PREMIUM su editing/salvataggio/rianalisi futura

#### Problema emerso

* La domanda reale non appare: nel box scuro appare solo una label generica tipo `Caso concreto`
* La risposta originale non appare: viene mostrato il `summary`, non il testo della risposta data
* Quindi il problema non è il rendering, ma i dati passati a `answersWorkspace.items`

#### Diagnosi probabile

`buildProReportV2` / `buildAnswerWorkspace` sta costruendo gli item con:

* `questionText` troppo sintetico o derivato da label/intento
* assenza di `answerText`, `candidateAnswer`, `responseText` o campo equivalente

#### Prossimo step tecnico

Controllare in `src/report/buildProReportV2.js` la funzione che costruisce `answersWorkspace.items`.

Obiettivo:

* aggiungere il testo reale della domanda
* aggiungere il testo reale della risposta candidato
* mantenere anche label/intento/summary

Campi desiderati per ogni item:

```js
{
  answerIndex,
  label,
  questionIntent,
  questionText,        // testo vero della domanda
  answerText,          // testo vero della risposta candidato
  score,
  summary,
  weaknesses,
  strengths,
  improvementHints,
  problematicAnswerType,
  offTopicRisk
}
```

#### Direzione prodotto

La pagina `Risposte` deve diventare:

* non un report
* ma un trainer/workspace

Struttura target:

* domanda ben visibile in alto
* risposta originale nella colonna sinistra
* suggerimenti + bozza migliorata nella colonna destra
* futura area editabile PREMIUM
* salvataggio risposta migliorata
* rianalisi e confronto punteggio prima/dopo

#### Nota importante

Il box “Come potrebbe suonare meglio” in PRO può restare template-based.
In PREMIUM dovrà diventare:

* riscrittura specifica
* basata sui fatti realmente detti
* senza inventare contenuti
* rianalizzabile dal tool

### Update – pagina Risposte workspace: domanda/risposta reali

#### Stato raggiunto

* La pagina `Risposte` è stata impostata come workspace a due colonne:

  * colonna sinistra: risposta attuale
  * colonna destra: risposta migliorata / da allenare
  * box “Come potrebbe suonare meglio”
  * nota PREMIUM su editing, salvataggio e rianalisi futura

#### Fix completati

* Risolta sintassi rotta in `buildProReportV2.js`
* Ripulita `buildAllAnswersWorkspace(runtimeAnswers)`
* Aggiornata `buildAnswerWorkspaceItem(answer, index)` per portare dentro:

  * `questionText`
  * `answerText`
  * score
  * summary
  * weaknesses
  * strengths
  * improvementHints
  * problematicAnswerType
  * offTopicRisk
* Rimossa stampa diagnostica:

  * `console.log("ANSWER SAMPLE:", ...)`
* Inserita logica fallback domanda tramite:

  * `buildFallbackQuestionText(answer, index)`
* Risolta indentazione strana della risposta originale nel rendering:

  * il problema era causato da spazi nel template HTML con `white-space: pre-wrap`
  * fix: `<div class="original-answer-box">...</div>` tutto su una riga

#### Nota tecnica importante

Nel sample `runtimeAnswers[0]` il campo reale domanda non era presente:

```js
questionContext: {
  questionText: ""
}
```

Quindi al momento la domanda mostrata nel workspace è un fallback umano coerente con fase/step, non ancora la domanda originale vera.

#### Prossimo step tecnico

Per mostrare la domanda originale reale bisogna risalire più a monte:

* `createInterviewRuntime`
* `advanceInterviewRuntime`
* o punto in cui il runtime salva domanda + risposta

Obiettivo futuro:

* ogni `runtimeAnswer` deve contenere `questionText` reale pieno al momento del salvataggio della risposta.

#### Direzione prodotto confermata

La pagina `Risposte` deve diventare un trainer:

* domanda visibile
* risposta originale visibile
* suggerimenti
* bozza migliorata
* futura area editabile PREMIUM
* salvataggio risposta migliorata
* rianalisi e confronto prima/dopo

#### Stato per nuova chat

La prossima chat dovrebbe ripartire da:

1. handover completo del progetto
2. razionalizzazione `continuity.md`
3. recupero domanda originale vera nel runtime
4. pulizia UI/UX del workspace risposte









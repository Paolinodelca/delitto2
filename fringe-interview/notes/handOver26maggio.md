# FRINGE Interview — Handover operativo aggiornato

## Stato attuale

Stiamo lavorando sul PRO Report e sul motore di coaching/intervista.

Direzione prodotto:
- FREE = capire che c’è un problema
- PRO = allenamento operativo, leggibile, stampabile/usabile
- PREMIUM = lettura recruiter senior + revisione evolutiva + tracking miglioramenti

Non fare refactor ampi. Procedere con modifiche conservative e test locali quando possibile.

---

## Fix recenti importanti

### 1. Role-fit / off-topic calibration

File principale:
`src/interview/analyzeAnswerShape.js`

Problema:
domande tipo “perché questo ruolo è il passo successivo naturale?” non venivano riconosciute come `isRoleFit`.

Fix:
estesi i trigger in `inferQuestionType(...)` per:
- `role_fit`
- `passo successivo`
- `passo naturale`
- `perché questo ruolo`
- `why this role`
- `natural next step`
- expected signals come `transition logic`, `role fit`, `relevant experience`

Risultato:
una risposta professionale ma non centrata sul “perché questo ruolo” viene ora valutata come debole ma non nonsense:
- `isRoleFit = true`
- `questionAlignment` scende correttamente
- summary più specifico

---

### 2. Decision / trade-off calibration

Aggiunti marker:
- `decisionChoiceMarkers`
- `decisionConsequenceMarkers`
- `decisionCriterionMarkers`

Obiettivo:
non penalizzare come fuori tema una risposta decisionale sintetica ma coerente.

Debug locale:
`scripts/debug_answer_shape_senior_decision.js`

Risultato atteso:
- `offTopicRisk = low`
- `problematicAnswerType = none`
- `tradeoffMarkers >= 2`
- score ragionevole circa 55–65, non 18/100

---

### 3. Recruiter recovery prompt

Aggiunto blocco nel dettaglio risposta:

“Come ti avrebbe fermato un recruiter”

Serve per risposte fuori asse/evasive/misalignate.

File coinvolti:
- `src/report/buildProReportV2.js`
- `src/app/renderProReportHtml.js`

Funzione builder:
`buildRecruiterRecoveryPrompt(...)`

Funzione renderer:
`renderRecruiterRecoveryPrompt(item)`

Ruolo:
- non è un altro consiglio generico
- è una simulazione di interruzione recruiter
- serve a dire: “ti fermo, non stai rispondendo al punto”

---

### 4. Segmentazione risposta

Il sistema answerAnnotation esiste già:
- schema
- prompt
- normalization
- Groq adapter
- merge in session result

File storici:
- `src/interview/buildAnswerAnnotationPrompt.js`
- `src/interview/normalizeAnswerAnnotation.js`
- `src/interview/runAnswerAnnotation.js`
- `src/interview/runAnswerAnnotationsForSession.js`
- `src/app/loadSessionAnswerAnnotations.js`
- `src/app/mergeSessionAnnotationsIntoResult.js`

Nel renderer PRO:
`renderAnswerSegments(item)`

È stato aggiunto fallback locale per evitare:
“Segmentazione non ancora disponibile...”

Obiettivo:
il report deve sembrare sempre vivo, anche senza rigenerare annotations LLM.

---

### 5. Humanized repeated coaching hints

Problema:
i suggerimenti “Come puoi rafforzarla” erano ripetitivi.

Decisione prodotto:
non eliminare la ripetizione, ma renderla intelligente.

Direzione:
se lo stesso errore ricorre, il tono deve evolvere:
- prima volta: neutro
- seconda volta: “questo punto torna”
- terza volta: “il pattern si conferma”
- quarta volta: “qui diventa un segnale importante”

Funzione su cui si sta lavorando:
`selectUsefulImprovementHints(item)` in `renderProReportHtml.js`

Nota:
evitare tagli troppo aggressivi che lasciano “Non emergono suggerimenti operativi aggiuntivi”.

Direzione migliore:
separare:
- messaggio tecnico
- tono progressivo

Futura funzione desiderata:
`humanizeRepeatedHint({ theme, baseMessage, repetitionCount, answerIndex })`

---

## Adaptive follow-up / affondi recruiter

Struttura già esistente:
- `src/interview/selectAdaptiveFollowup.js`
- `src/interview/injectAdaptiveFollowup.js`
- `advanceInterviewRuntime.js`
- `config/followup_packs.it.json`
- `config/followup_packs.json`

`selectAdaptiveFollowup.js` già cerca trigger come:
- `decision_tradeoff_probe`
- `consistency_probe`

ma questi pack mancavano nei JSON.

### Obiettivo attuale

Recuperare la struttura “affondi” già prevista, senza creare sistema parallelo.

Nuovi pack da aggiungere:
- `decision_tradeoff_probe`
- `consistency_probe`

`decision_tradeoff_probe`:
serve quando la domanda chiedeva scelta/trade-off ma la risposta resta generica o laterale.

`consistency_probe`:
serve quando il candidato non capisce/centra la domanda; simula un recruiter che riformula e verifica se il problema è occasionale o pattern.

### Stato immediato

È stato tentato l’aggiornamento di:
`config/followup_packs.it.json`

ma il JSON dà errore:

`Expected ',' or '}' after property value`

Probabile causa:
- blocchi aggiunti dopo la chiusura di `"packs"`
- oppure virgola mancante dopo `transferability_probe`
- oppure virgola finale sbagliata

Verifica JSON:
```bash
node -e "JSON.parse(require('fs').readFileSync('config/followup_packs.it.json','utf8')); console.log('followup_packs.it.json OK')"

Struttura corretta finale:

"packs": {
  "leadership_depth": {},
  ...
  "transferability_probe": {},
  "decision_tradeoff_probe": {},
  "consistency_probe": {}
}
Attenzione Groq

Non rilanciare Groq inutilmente.

Script che può consumare Groq:

node scripts/test_run_fringe_interview_mvp_session.js

Prima usare debug locali o solo render:

node scripts/test_render_pro_report_v2.js
Prossimo passo consigliato
Sistemare JSON config/followup_packs.it.json
Aggiungere gli stessi due pack in config/followup_packs.json
Validare entrambi i JSON
Poi verificare se selectAdaptiveFollowup.js riesce a selezionare decision_tradeoff_probe / consistency_probe
Solo dopo valutare runtime/injection

Ultimi aggiornamenti:
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

# HANDOVER — Capability-Driven Architecture (FRINGE Interview)

## Stato milestone

È stata completata la prima vera transizione:

```text
da:
renderer/report guidati da logiche implicite o hardcoded

a:
runtime + rendering capability-driven e product-driven
```

Questa è una milestone architetturale fondamentale.

---

# PRINCIPIO CHIAVE

## Il motore deve generare SEMPRE il massimo livello di analisi possibile.

I piani prodotto NON devono cambiare:

* motore
* pipeline
* runtime
* analisi

ma devono controllare SOLO:

* visibilità
* profondità
* intensità adaptive
* stili recruiter disponibili
* moduli renderizzati
* funzionalità accessibili

tramite:

```text
product capabilities
```

---

# REGOLA CRITICA

NON usare:

```js
if (premium)
```

nel runtime o nel renderer.

Usare invece:

```js
if (capabilities.showRecruiterPanel)
```

oppure:

```js
renderCapabilityBlock(...)
```

---

# ARCHITETTURA INTRODOTTA

## Config prodotto

Creato:

```text
config/product_interview_modes.json
```

Contiene:

* free
* pro
* premium

con:

* interviewDepth
* defaultInterviewStyle
* interviewIntent
* capabilities

---

# CAPABILITIES

Esempi introdotti:

```js
showRecruiterPanel
showPatternMemory
showDetailedAnswerWorkspace
showPremiumRewriteWorkspace
allowStyleSelection
allowDeepAssessment
showPrintableProOutput
```

---

# FLOW ARCHITETTURALE

```text
productMode
→ product config
→ product capabilities
→ runtime context/meta
→ report model
→ renderer visibility
```

---

# RUNTIME

`createInterviewRuntime.js`

ora supporta:

```js
productMode
interviewDepth
interviewStyle
interviewIntent
productCapabilities
```

e li propaga in:

* meta
* sessionSummary
* runtimeState.interviewState.context

---

# REPORT MODEL

`buildProReportV2.js`

ora riceve:

```js
productMode
productCapabilities
```

e li espone nel model:

```js
proReportV2.productCapabilities
```

---

# RENDERER

`renderProReportHtml.js`

ora supporta:

```js
isCapabilityEnabled(...)
renderCapabilityBlock(...)
```

e il recruiter panel è già capability-driven.

Verificato:

```js
showRecruiterPanel
showPatternMemory
```

---

# RISULTATO IMPORTANTE

Ora è possibile:

* attivare/disattivare moduli
* cambiare contenuti disponibili nei piani
* fare promo temporanee
* fare A/B test
* creare edition diverse
* creare future white-label edition

senza modificare:

* runtime
* pipeline
* report generation

ma modificando solo:

```text
config/product_interview_modes.json
```

---

# HEALTH CHECK SYSTEM

Creato:

```text
scripts/fringe_health_check.js
```

Sistema additivo/modulare di continuità architetturale.

Obiettivo:

```text
tester di continuità elettrica del progetto
```

Verifica attualmente:

* config JSON
* product modes
* interview styles
* reference consistency
* required capabilities
* capability policy consistency
* followup packs

Principio importante:

ogni milestone futura deve aggiungere:

* nuovi addCheck(...)
* nuovi checker modulari

senza riscrivere il sistema.

---

# DIREZIONE FUTURA

Il renderer dovrà gradualmente evolvere verso:

```text
module registry capability-driven
```

Esempio concettuale:

```js
const REPORT_MODULES = {
  recruiterPanel: {
    capability: "showRecruiterPanel",
    render: renderRecruiterPanel
  }
};
```

---

# OBIETTIVO FINALE

Separare completamente:

```text
contenuto generato
≠
contenuto visibile
```

e rendere FRINGE:

* configurabile
* scalabile
* monetizzabile
* estendibile
* testabile
* white-label ready

# ROADMAP PRIORITARIA — PROFESSIONAL PERCEPTION LAYER

## Osservazione strategica

Durante la preparazione del beta è emersa una possibile evoluzione fondamentale del valore percepito di FRINGE.

Oggi il sistema analizza molto bene:

* singole risposte
* punti deboli
* punti forti
* ownership
* decision
* synthesis
* friction
* positioning
* motivation for change
* transferability

Tuttavia il report è ancora fortemente orientato al dettaglio.

Il candidato potrebbe ancora chiedersi:

> "Nel complesso, che impressione sto dando?"

---

## Intuizione chiave

Il candidato non compra realmente:

* una simulazione
* un report
* l'analisi di 20 risposte

Compra invece:

> una comprensione migliore di come viene percepito professionalmente.

Il colloquio è il meccanismo.

La percezione professionale è il beneficio.

---

# FUTURA SEZIONE AD ALTO VALORE

## Professional Perception Summary

Possibili nomi:

* Percezione Professionale Emergente
* Come stai venendo percepito
* Professional Perception Summary

---

## 1. Immagine professionale emergente

Sintesi narrativa:

* che figura professionale emerge
* quali segnali dominano
* quali segnali sono poco visibili

Esempio:

> Emerge una figura credibile sul piano operativo e dell'affidabilità esecutiva. Emergono meno chiaramente leadership, influenza e gestione di decisioni complesse.

---

## 2. Percezione richiesta dal ruolo target

Partendo dal ruolo desiderato:

* quali segnali il ruolo tende a ricercare
* quali comportamenti vengono normalmente associati a quel livello professionale

Non come regole assolute.

Ma come tendenze.

---

## 3. Gap di percezione

NON:

> ti manca la leadership

MA:

> la leadership potrebbe esistere, ma oggi non emerge con sufficiente evidenza nelle risposte fornite.

Distinguere sempre:

* assenza reale
* assenza di evidenza

---

## 4. Piano di evoluzione della percezione

Non migliorare la singola risposta.

Ma:

> Come essere percepito più vicino al ruolo target.

Esempi:

* mostrare più criteri decisionali
* esplicitare maggiormente ownership e responsabilità
* quantificare l'impatto
* raccontare meglio trade-off e priorità
* evidenziare coordinamento e influenza

---

## 5. Time To Impact percepito

Recuperare il concetto storico di FRINGE:

> Quanto rapidamente il selezionatore potrebbe immaginare che il candidato generi valore nel ruolo.

Non basato sulle competenze assolute.

Basato sui segnali emersi.

---

# POSIZIONAMENTO FUTURO

Possibile evoluzione del messaggio di prodotto:

Da:

> Simulatore di colloquio

Verso:

> Sistema di analisi della percezione professionale.

---

# PRIORITÀ

Questa evoluzione è considerata una delle future roadmap ad altissimo impatto sul valore percepito del report.

Probabilmente più importante di molte ottimizzazioni tecniche aggiuntive.

Da affrontare DOPO:

* candidate experience
* onboarding
* beta test iniziale

ma PRIMA di molte altre estensioni del report.

FRINGE Interview – Handover Giugno 2026

Stato attuale:

- Professional Perception V2 implementata.
- Struttura approvata:
  1. Chi emerge
  2. Bagaglio di credibilità
  3. Distanza dal ruolo target
  4. Cosa resta in mente a un recruiter
  5. Cosa probabilmente non stai vedendo
  6. Cambio di atteggiamento consigliato

Decisioni prodotto approvate:

FREE:
- Chi emerge
- Bagaglio di credibilità
- Distanza dal ruolo target (versione breve)

PRO:
- Recruiter memory
- Blind spots
- Stile comunicativo percepito
- Evidenze a supporto della lettura
- Analisi completa risposte e CV

PREMIUM:
- Cambio atteggiamento
- Coaching guidato
- Motivation for Change avanzata
- Loop di approfondimento
- Career Story

Concetti strategici da preservare:

- La simulazione è il mezzo.
- La percezione è il prodotto.
- Riconoscimento + Spiegazione + Direzione.
- Effetto "mi riconosco in questa descrizione".
- Linguaggio umano, non da software.
- Il candidato deve sentirsi compreso prima di sentirsi corretto.

Roadmap beta:

1. Raffinare la narrativa della pagina Percezione.
2. Introdurre colori semantici per tipologia di contenuto.
3. Inserire branding FRINGE nel report.
4. Implementare Role Family Narrative Adaptation.
5. Preparare landing coerente con il nuovo posizionamento.

Roadmap post-beta:

- Storico simulazioni.
- Confronto tra report successivi.
- Evoluzione misurabile.
- CV Workspace editabile.
- Nuova simulazione dopo revisione CV.

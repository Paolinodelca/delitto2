PROJECT_CODE_MAP.md
Stato documento

Mappa tecnica sintetica per ripartenza sviluppo FRINGE Interview.

Fonte certa:

src/report/buildProReportV2.js

Fonte da verificare nella prossima chat:

src/app/renderProReportHtml.js
1. Pipeline dati report

CV + Job Description + simulazione
↓
finalCandidateReport
↓
runtimeAnswers
↓
buildProReportV2()
↓
proReportV2
↓
renderProReportHtml()
↓
HTML report navigabile

2. src/report/buildProReportV2.js
Funzione esportata principale
buildProReportV2(...)

Export default.

È il builder centrale del report PRO V2.

Riceve:

candidate
role
fit
report
finalCandidateReport
runtimeAnswers
openingPositioning
localeKey
rawInput
productMode
productCapabilities

Restituisce:

oggetto { proReportV2: ... }
3. Oggetto finale restituito

Struttura principale:

proReportV2

Contiene:

version
locale
productMode
productCapabilities
overview
professionalPerception
answersWorkspace
proReportV2.overview

Costruisce le sezioni principali della pagina Situazione e delle altre sezioni derivate.

Contiene:

openingPositioning
blockingPriorities
operationalPriorities
operationalActionPlan
featuredAnswers
sensitiveQuestionsDashboard
cvSlim
finalChecklist
proReportV2.professionalPerception

Costruito da:

buildProfessionalPerceptionSummary(...)

Contiene:

emergingImage
narrativeRead
perceptionV2
visibleSignals
underVisibleSignals
targetRoleSignals
perceptionGap
evolutionBridge
credibilityPath
perceivedTimeToImpact
proReportV2.answersWorkspace

Contiene:

patternSummary
items

Costruito da:

buildAllAnswersWorkspace(...)
enrichAnswersWithCoachingPatternProgression(...)
aggregateAnswerCoachingPatterns(...)
4. Sezioni report costruite da buildProReportV2.js
Overview / Situazione
buildOpeningPositioningSection(opening)

Costruisce la lettura dell’apertura del colloquio.

Produce:

stato apertura
coerenza posizionamento
livello percepito
focus rilevati
focus mancanti
stile narrativo
rischi
miglioramenti
esempio di apertura
buildBlockingPriorities(finalCandidateReport)

Costruisce priorità bloccanti sintetiche.

Usa:

debolezze ricorrenti
deviation flags runtime
chiarimenti richiesti dal role fit
buildOperationalPriorities(runtimeAnswers)

Costruisce priorità operative dalle risposte.

buildOperationalActionPlan(...)

Costruisce piano operativo globale.

Usa:

runtimeAnswers
finalCandidateReport
rawInput

Produce:

globalPriorities
answerPriorities
cvPriorities

Serve a dire cosa fare prima di entrare nei dettagli.

buildFeaturedAnswers(runtimeAnswers)

Seleziona risposte significative.

Produce:

risposta più critica
risposta che regge meglio
buildSensitiveQuestionsDashboard(...)

Costruisce dashboard dei punti delicati.

Copre:

motivazione al cambiamento
fit con il ruolo
pressione/conflitto
gap o fragilità profilo
buildCvSlimSection(finalCandidateReport, rawInput)

Costruisce pagina/sezione CV.

Produce:

profilo sintetico
CV originale
segnali CV
gap CV
lettura del documento
mitigation suggestions
transition potential
alternative positioning
narrative positioning
buildImprovementPlan(finalCandidateReport)

Costruisce checklist finale.

Usa:

coach snapshot
improvements
final advice
5. Professional Perception V2
Funzione centrale
buildProfessionalPerceptionSummary(...)

Riceve:

runtimeAnswers
finalCandidateReport
rawInput

Usa principalmente:

finalCandidateReport.overall
finalCandidateReport.roleFit
finalCandidateReport.questionQuality
finalCandidateReport.cvAdvice
finalCandidateReport.runtimeRead
Helper collegato
buildProfessionalPerceptionNarrative(...)

Produce narrativa V1/fallback:

headline
mainNarrative
interviewerPerception
attitudeShift
supportingSignals

Nota:

è ancora presente come fallback/narrative legacy.

Output V2 principale
perceptionV2

Contiene 6 blocchi approvati:

whoEmerges
credibilityAssets
targetDistance
recruiterMemory
blindSpots
attitudeShift
whoEmerges

Obiettivo:

descrivere quale persona/profilo emerge, non solo riassumere il CV.

credibilityAssets

Obiettivo:

trasformare skill e segnali CV in patrimonio di credibilità.

Non deve essere elenco di skill.

Deve spiegare cosa questi segnali fanno percepire.

targetDistance

Struttura interna:

currentSignals
targetSignals
bridgeNarrative

Obiettivo:

spiegare in modo leggibile:

cosa emerge oggi
cosa cerca il ruolo
quale ponte manca
recruiterMemory

Obiettivo:

descrivere cosa potrebbe restare in mente a un recruiter.

blindSpots

Obiettivo:

far vedere al candidato qualcosa che probabilmente non sta notando.

È una sezione chiave per l’effetto “mi riconosco”.

attitudeShift

Obiettivo:

dare una direzione di cambiamento.

In futuro probabilmente PREMIUM.

6. Helper importanti in buildProReportV2.js
Helper generali
ensureArray
normalizeString
text
cleanMultilineText
uniqueNonEmpty
safeNumber
Sensitive questions
humanizeSensitiveQuestionType
humanizeSensitiveReadiness
humanizeSensitiveReadinessFromScore
humanizeOpeningReadiness
buildSensitiveQuestionFromAnswer
CV helpers
normalizeCvSignals
canonicalizeCvLabel
buildCvSignalDescriptor
buildCvStrengthsNarrative
buildCvMitigationSuggestions
buildLateralCvMitigationSuggestions
buildSingleCvMitigationSuggestion
buildCvPositioningNarrative
buildCvDocumentRead
buildAlternativePositioning
buildTransitionPotential
Answer workspace helpers

Da mappare meglio nella prossima chat se serve.

Funzioni rilevanti viste nel file:

buildAllAnswersWorkspace
buildAnswerWorkspaceItem
buildCvSupportRead
aggregateAnswerCoachingPatterns
enrichAnswersWithCoachingPatternProgression
7. src/app/renderProReportHtml.js
Nota

Il file non è stato allegato in questa chat finale.

Questa sezione è basata su quanto discusso e modificato durante la sessione.

Da verificare nella prossima chat allegando il file reale.

Funzione principale
renderProReportHtml({ proReportV2, activeSection = "overview" })

Responsabile di:

costruire reportData
assemblare layout sezioni
dividere moduli tra sezioni
generare HTML finale
includere CSS inline
includere script navigazione
Build dati renderer
buildReportDataFromProReport(proReportV2)

Attualmente include:

productMode
productCapabilities
overview
professionalPerception
answersWorkspace
8. Sezioni principali renderizzate

Nel report sono presenti sezioni navigabili:

overview
perception
answers
criticalPoints
cv
final

Label attuali:

Situazione
Percezione
Risposte
Punti delicati / Domande delicate
CV
Checklist
9. Renderer Professional Perception
Funzione
renderProfessionalPerceptionSection(proReportV2)

Responsabile della pagina:

“Come vieni percepito”

Legge:

proReportV2.professionalPerception
professionalPerception.perceptionV2

Renderizza:

Chi emerge
Il tuo bagaglio di credibilità
Dove nasce la distanza dal ruolo target
Cosa potrebbe restare in mente a un recruiter
Cosa probabilmente non stai vedendo
Cambio di atteggiamento consigliato
Dipendenze renderer Percezione

Usa:

escapeHtml
ensureArray
classi CSS già esistenti:
section-shell
overview-card
overview-card-title
answer-subcard
answer-subcard-title
10. Renderer collegati principali

Da verificare su file reale.

Funzioni note/discusse:

renderOverviewSituationSection(...)
renderOverviewModule(...)
renderAnswersModule(...)
renderAnswersWorkspaceModule(...)
renderWorkspaceAnswerPanel(...)
renderCvSupportDetails(...)
renderMissingAnswerSignalsBox(...)
renderSituationExpandableBlock(...)
11. Moduli Overview renderizzati

Il renderer filtra moduli overview usando chiavi come:

openingPositioning
operationalPriorities
operationalActionPlan
blockingPriorities
featuredAnswers
12. Moduli Critical Points

Usa:

sensitiveQuestionsDashboard
13. Moduli CV

Usa:

cvSlim
14. Moduli Final

Usa:

finalChecklist
15. Answers

Usa layout answers.

Modulo centrale:

answersWorkspace

Renderer:

renderAnswersModule
renderAnswersWorkspaceModule
renderWorkspaceAnswerPanel
16. Sistema colori attuale
Stato

Non ancora completamente centralizzato.

Esistono già token CSS fr-* introdotti in precedenti sprint, ma il sistema non è ancora diventato una grammatica semantica completa.

Token noti già introdotti

Categorie:

colori base
colori positivi
colori rischio
colori warning
bordi
tipografia
spacing
radius
shadow

Esempi noti:

--fr-bg
--fr-ink
--fr-muted
--fr-primary-1
--fr-primary-2
--fr-dark-1
--fr-dark-2
--fr-positive-1
--fr-positive-2
--fr-risk-1
--fr-risk-2
--fr-warning-1
--fr-warning-2
--fr-soft-border
--fr-radius-*
--fr-shadow-*
--fr-body
--fr-title-*
17. Filosofia colori da implementare

Obiettivo:

passare da colori locali a colori per significato.

Non:

singolo riquadro decide colore.

Ma:

riquadro dichiara il tipo semantico.

Esempi di tipi:

perception
recruiter
coach
risk
strength
cv
answers
checklist
premium
Direzione tecnica consigliata

Creare un layer tipo:

reportTheme
fr-card
fr-card--risk
fr-card--coach
fr-card--recruiter
fr-card--perception
fr-card--strength

Ogni variante imposta:

background
testo
bordo
radius
eventuale gradiente
Regola

Non aggiungere nuovi colori hardcoded nei renderer.

Usare token e classi semantiche.


Di seguito analisi e schema di src/app/renderProReportHtml.js: 
renderProReportHtml.js
1. Funzione principale di rendering
renderProReportHtml(...)

È il punto di ingresso principale del renderer.

Responsabilità:

riceve proReportV2
costruisce il contesto di rendering
legge capabilities prodotto
costruisce le sezioni del report
genera HTML completo
incorpora CSS
incorpora Javascript UI
gestisce navigazione tab e pannelli

Dipendenza importante:

assembleReportSectionData(...)

Importata da:

../report/assembleReportSectionData.js

Questo conferma che il renderer non legge direttamente tutto il report ma passa attraverso uno strato di assemblaggio dati.

2. Funzione che renderizza Professional Perception

Non compare nella porzione ricevuta.

Ma dalla struttura discussa nelle ultime settimane dovrebbe esistere una funzione equivalente a:

renderProfessionalPerceptionSection(...)

oppure

renderProfessionalPerception(...)

che legge:

proReportV2.professionalPerception

e in particolare:

professionalPerception.perceptionV2

con i blocchi:

whoEmerges
credibilityAssets
targetDistance
recruiterMemory
blindSpots
attitudeShift

Questa parte va verificata sul file completo.

3. Renderer collegati principali
Overview
renderOpeningPositioningModule()

Renderizza:

apertura colloquio
posizionamento
focus rilevati
focus mancanti
credibilità iniziale

Dipendenza:

renderOpeningCreditBox()
renderAnswerCard()

Renderizza:

risposta più forte
risposta più critica

usata in:

featuredAnswers
Answers Workspace
renderWorkspaceAnswerPanel()

È il renderer principale della pagina Risposte.

Contiene:

domanda originale
risposta originale
lettura sintetica
recruiter panel
CV support
analisi dettagliata
miglioramenti
risposta ispirazionale

Probabilmente uno dei renderer più grossi del file.

renderAnswerSegments()

Renderizza:

segmenti positivi
segmenti negativi
segmenti migliorabili

basandosi su:

item.annotations
renderRecruiterPanel()

Renderizza:

punto di vista recruiter
recruiter recovery prompt
pattern memory

Gated tramite:

showRecruiterPanel
renderCvSupportDetails()

Renderizza:

accordion:

Segnali CV utili
renderCvSupportReadBox()

Renderizza:

Come usare il CV in questa risposta

e

Punti del CV che puoi richiamare
renderMissingAnswerSignalsBox()

Renderizza:

Cosa manca nella risposta
renderImprovementNarrativeList()

Renderizza:

Come puoi rafforzarla
renderWeaknessNarrativeList()

Renderizza:

Aspetti che oggi indeboliscono la risposta
4. Principali sezioni renderizzate

Dalle funzioni e dalle modifiche effettuate negli ultimi sprint risultano renderizzate:

Overview

Contiene:

openingPositioning
operationalPriorities
operationalActionPlan
blockingPriorities
featuredAnswers
Professional Perception

Contiene:

whoEmerges
credibilityAssets
targetDistance
recruiterMemory
blindSpots
attitudeShift

(da verificare nel file completo)

Answers

Contiene:

answersWorkspace
pannelli singola risposta
recruiter panel
cv support
coaching
Critical Points

Contiene:

sensitiveQuestionsDashboard
CV

Contiene:

cvSlim
Checklist

Contiene:

finalChecklist
5. Sistema colori utilizzato oggi

Dal codice emerge una struttura ormai abbastanza chiara.

Sistema a classi semantiche
Card
positive-card
warm-card
risk-card
card
Status score
status-ok
status-mid
status-weak
status-neutral
Dot
dot-ok
dot-mid
dot-weak
dot-neutral
Frame
frame-ok
frame-mid
frame-weak
frame-neutral
Pill
pill-good
pill-warm
pill-risk
pill-neutral
Segment analysis
segment-good
segment-warm
segment-risk
segment-neutral
Featured answers
featured-answer-critical
featured-answer-strong
featured-answer-neutral
Impact levels
impact-high
impact-mid
impact-low
Workspace
workspace-block-positive
workspace-block-risk
CV support
fr-cv-support-list-useful
fr-cv-support-list-missing
6. Palette centralizzata esistente

Dal codice emergono chiaramente token già introdotti.

Sistema FR

Prefisso:

fr-
Colori

già citati in altri punti del renderer:

--fr-bg
--fr-ink
--fr-muted

--fr-primary-1
--fr-primary-2

--fr-positive-1
--fr-positive-2

--fr-risk-1
--fr-risk-2

--fr-warning-1
--fr-warning-2
Tipografia
--fr-body
--fr-title
Layout
--fr-radius-*
--fr-shadow-*
Architettura reale che emerge

Oggi il renderer è già diviso in 4 macro-famiglie:

1. Infrastructure
ensureArray
text
escapeHtml
2. Humanization Layer

Funzioni tipo:

humanizeProblematicAnswerType()
humanizeOffTopicRisk()
humanizeQuestionIntent()
humanizeAnnotationDimension()

Trasformano il dato tecnico in linguaggio recruiter/candidato.

3. Rendering Layer

Funzioni:

renderOpeningPositioningModule()
renderAnswerCard()
renderWorkspaceAnswerPanel()
renderRecruiterPanel()
renderCvSupportReadBox()
4. Capability Layer

Feature gating:

isCapabilityEnabled()

renderCapabilityBlock()

Capabilities viste:

showRecruiterPanel
showPatternMemory
showDetailedAnswerWorkspace

Questo è molto importante perché significa che il renderer è già predisposto per la separazione FREE / PRO / PREMIUM senza dover riscrivere l'architettura.

INTEGRAZIONE PROJECT_CODE_MAP.md
renderProReportHtml.js
Punto di ingresso principale
renderProReportHtml()

Responsabilità:

riceve proReportV2
costruisce reportData
richiama assembleReportSectionData()
costruisce layout Overview
costruisce layout Answers
separa i moduli per sezione
genera HTML finale
incorpora CSS globale
incorpora Javascript UI

Dipendenza principale:

assembleReportSectionData()

Import:

../report/assembleReportSectionData.js
Pipeline dati
proReportV2
        ↓
buildReportDataFromProReport()
        ↓
reportData
        ↓
assembleReportSectionData()
        ↓
overviewLayout
answersLayout
        ↓
renderProReportHtml()
        ↓
HTML finale
Costruzione sezioni
Overview

Renderizzata tramite:

renderOverviewSituationSection()

Moduli supportati:

openingPositioning
operationalPriorities
operationalActionPlan
blockingPriorities
featuredAnswers

Dispatcher:

renderOverviewModule()
Professional Perception

Renderizzata tramite:

renderProfessionalPerceptionSection()

Legge:

proReportV2.professionalPerception

e soprattutto:

professionalPerception.perceptionV2
Answers

Renderizzata tramite:

renderAnswersWorkspaceModule()

Dispatcher:

renderAnswersModule()
Critical Points

Renderizzata tramite:

renderSensitiveQuestionsModule()

Fonte:

sensitiveQuestionsDashboard
CV

Renderizzata tramite:

renderCvSlimModule()

Fonte:

cvSlim
Checklist

Renderizzata tramite:

renderFinalChecklistModule()

(attualmente quasi vuota)

Professional Perception V2
Renderer principale
renderProfessionalPerceptionSection()

Legge:

professionalPerception.perceptionV2

Struttura attesa:

whoEmerges
credibilityAssets
targetDistance
recruiterMemory
blindSpots
attitudeShift
Fallback legacy

Se perceptionV2 manca:

narrativeRead
emergingImage

vengono usati come fallback.

Blocchi realmente renderizzati
Chi emerge

Origine:

whoEmerges

Fallback:

narrativeRead
emergingImage
Dove nasce la distanza dal ruolo target

Origine:

targetDistance.currentSignals
targetDistance.targetSignals
targetDistance.bridgeNarrative

Sottoblocchi:

Ciò che emerge oggi
Ciò che cerca il ruolo
Il ponte che manca
Cosa potrebbe restare in mente a un recruiter

Origine:

recruiterMemory
Cosa probabilmente non stai vedendo

Origine:

blindSpots
Cambio di atteggiamento consigliato

Origine:

attitudeShift
ATTENZIONE

Nel renderer attuale NON viene renderizzato:

credibilityAssets

anche se buildProReportV2 lo produce.

Questa è una anomalia importante.

Il builder genera:

perceptionV2.credibilityAssets

ma renderProfessionalPerceptionSection non lo mostra.

Da verificare se:

è stato rimosso accidentalmente
oppure
è presente in una parte del file non ancora analizzata.
Dispatcher principali
renderOverviewModule()

Gestisce:

openingPositioning
operationalPriorities
operationalActionPlan
blockingPriorities
featuredAnswers
sensitiveQuestionsDashboard
cvSlim
finalChecklist
renderAnswersModule()

Gestisce:

answersWorkspace
Helper importanti Overview
renderOpeningPositioningModule()

Modulo apertura colloquio.

Sottopannelli:

Racconto
CV
Come impostarla

Helper collegati:

renderOpeningCreditBox()
renderOpeningStrengthList()
renderWeightedList()

humanizeNarrativeStyle()
humanizeContinuityRead()
renderOperationalPrioritiesModule()

Mostra:

Interventi prioritari
renderOperationalActionPlanModule()

Wrapper.

Chiama:

renderOperationalActionPlanContent()
renderBlockingPrioritiesModule()

Mostra:

Pattern ricorrenti penalizzanti
renderFeaturedAnswersModule()

Mostra:

Risposte chiave del colloquio

Usa:

renderAnswerCard()
Helper importanti CV
renderCvSlimModule()

Contenitore principale.

Usa:

renderCvDocumentReadBox()
renderCvParsedProfileBox()
renderCvDeepDiveMenu()
renderCvDeepDiveMenu()

Accordion:

Gap e rischi
Mitigazioni
Ruoli alternativi
Uso del CV nel colloquio
CV originale
renderAlternativePositioningBox()

Renderizza:

Ruoli alternativi
Alternative positioning
renderCvMitigationDeepDive()

Renderizza:

Mitigazioni
Lettura Premium teaser
Helper importanti Answers
renderAnswersWorkspaceModule()

Costruisce:

tab Risposta 1
tab Risposta 2
...
renderWorkspaceAnswerPanel()

(non presente nello snippet ma confermato dal flusso)

Renderizza singola risposta.

Sistema colori
Palette centralizzata

Presente in:

:root

Variabili principali:

--fr-bg
--fr-ink
--fr-muted

--fr-primary-1
--fr-primary-2

--fr-dark-1
--fr-dark-2

--fr-positive-1
--fr-positive-2

--fr-risk-1
--fr-risk-2

--fr-warning-1
--fr-warning-2
Tipografia centralizzata
--fr-title-main
--fr-title-section
--fr-title-card

--fr-body
--fr-dense
--fr-caption
Layout centralizzato
--fr-radius-sm
--fr-radius-md
--fr-radius-lg

--fr-shadow-sm
--fr-shadow-md
Architettura UI attuale

Il renderer è ormai organizzato in 5 livelli:

1. Data Assembly Layer
   assembleReportSectionData()

2. Dispatcher Layer
   renderOverviewModule()
   renderAnswersModule()

3. Section Layer
   Overview
   Perception
   Answers
   CV
   Critical Points
   Checklist

4. Specialized Renderer Layer
   Opening
   Action Plan
   Featured Answers
   CV
   Sensitive Questions
   Workspace

5. Design System Layer
   CSS variables (--fr-*)
   palette
   spacing
   typography
   shadows
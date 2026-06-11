# PROJECT_SPINE.md

## Scopo

Documento tecnico sintetico.

NON contiene storia del progetto.

NON contiene brainstorming.

Contiene solo ciò che serve per orientarsi rapidamente nel codice.

---

# Pipeline principale

CV
+
Job Description
↓
Parser
↓
CandidateProfile
RoleProfile
JobFitAnalysis
↓
Interview Plan
↓
Question Set
↓
Interview Runtime
↓
Answer Analysis
↓
Final Candidate Report
↓
buildProReportV2()
↓
renderProReportHtml()

---

# File centrali

## Costruzione report

src/report/buildProReportV2.js

Responsabile di:

* overview
* professionalPerception
* answersWorkspace
* cvSlim
* checklist
* punti delicati

È il principale aggregatore dati del report.

---

## Rendering report

src/app/renderProReportHtml.js

Responsabile di:

* rendering HTML
* sezioni report
* navigazione
* layout
* Professional Perception page

---

## Final Candidate Report

Genera:

finalCandidateReport

Contiene:

* overall
* roleFit
* questionQuality
* runtimeRead
* cvAdvice
* recruiterRecommendation
* scoreLayer

È la sorgente principale dei dati utilizzati da buildProReportV2.

---

# Professional Perception V2

Builder:

buildProfessionalPerceptionSummary()

Output:

professionalPerception

Contiene:

* whoEmerges
* credibilityAssets
* targetDistance
* recruiterMemory
* blindSpots
* attitudeShift

---

# Health Check

Script:

scripts/fringe_health_check.js

Verifica:

* configurazioni
* modalità prodotto
* capability
* guardrail
* Professional Perception V2

Ogni nuova sezione importante del report deve essere aggiunta qui.

---

# Test utili

## Report completo

node scripts/test_render_pro_report_v2.js

Test principale utilizzato durante lo sviluppo report.

---

## Health

node scripts/fringe_health_check.js

Verifica integrità generale.

---

## Report layout

node scripts/test_report_section_layout.js

---

## Rendering sezioni

node scripts/test_render_pro_report_section.js

---

# Filosofia colori (DA IMPLEMENTARE)

Obiettivo:

eliminare colori hardcoded nei componenti.

Introdurre un unico file tema.

Esempio:

reportTheme.js

export const REPORT_COLORS = {
perception: ...
warning: ...
strength: ...
cv: ...
answers: ...
checklist: ...
}

Tutti i componenti leggono da REPORT_COLORS.

Mai usare colori direttamente nei render.

Benefici:

* rebranding rapido
* dark mode futura
* coerenza visuale
* test più semplici

---

# Regola di sviluppo

Prima:

aggiungere dati al builder.

Poi:

renderizzarli.

Infine:

aggiungere health check.

Mai saltare l'ultimo passaggio.

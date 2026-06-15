# CV OPTIMIZATION WORKSPACE

## Visione

L'obiettivo non è riscrivere automaticamente il CV.

L'obiettivo è aiutare il candidato a comprendere:

* come viene letto oggi;
* come viene percepito;
* quali segnali emergono;
* quali segnali restano nascosti;
* come modificare il CV per il target desiderato.

---

## Workflow generale

### Step 1

CV Review

Output:

* Profile Read
* Credibility Assets
* Reading Risk
* Possible Directions
* Professional Signals
* Professional Traits

Domanda:

"Come appare oggi il profilo?"

---

### Step 2

Target Selection

Possibili modalità:

* target specifico
* famiglia professionale
* modalità discovery

Domanda:

"Dove vuoi andare?"

---

### Step 3

Perception Gap

Confronto:

CV attuale
vs
target desiderato

Output:

* segnali mancanti
* segnali deboli
* segnali da rafforzare
* segnali da ridurre

Domanda:

"Cosa impedisce oggi al CV di essere letto nel modo desiderato?"

---

### Step 4

Transformation Plan

Output:

* cosa spostare in alto
* cosa comprimere
* cosa espandere
* cosa spiegare meglio
* quali esperienze diventano centrali

Domanda:

"Quali modifiche produrranno il maggiore impatto?"

---

### Step 5

Narrative Repositioning

Output:

* nuovo titolo professionale
* nuovo profilo professionale
* messaggio chiave
* proposta di storytelling professionale

Domanda:

"Quale identità professionale deve emergere?"

---

### Step 6

CV Optimized Version

Output:

* CV targetizzato
* lettera di presentazione opzionale
* confronto prima/dopo

Domanda:

"Come appare il CV dopo l'ottimizzazione?"

---

## Livelli futuri

### Base

CV Review

### PRO

Transformation Plan

### PREMIUM

Narrative Repositioning
+
CV Optimized Version
+
Cover Letter
+
Confronto prima/dopo

---

## Principio guida

FRINGE non scrive semplicemente un nuovo CV.

FRINGE spiega il percorso che porta dalla versione attuale alla versione ottimizzata.

Il valore non è il documento finale.

Il valore è la comprensione della trasformazione.


## Nuova priorità — Role Target Narrative Layer

Problema emerso durante i test reali:

La sola `Role Family` non è sufficiente per generare narrative realmente mirate.

All'interno della stessa famiglia professionale possono esistere target molto diversi, con linguaggi, aspettative e segnali di credibilità differenti.

Esempio:

care_helping_professions

* family_support
* youth_prevention
* disability_autism
* mental_health
* addiction_support

Oggi FRINGE distingue correttamente la famiglia professionale.

Non distingue ancora in modo sufficientemente forte i sotto-target interni alla stessa famiglia.

Effetto osservato:

I report generati per target diversi risultano ancora troppo simili:

* profileRead
* credibilityAssets
* possibleDirections
* targetFocus

Obiettivo futuro:

Introdurre un livello intermedio:

Role Family
↓
Role Target
↓
Narrative Profile

Esempio:

care_helping_professions
↓
disability_autism
↓
narrative specifiche
credibility focus specifici
reading risk specifici
target focus specifici

Benefici:

* report più pertinenti
* CV Review più utile
* Professional Perception più accurata
* migliore supporto alla CV Optimization
* riduzione delle narrative generiche

Nota:

Questa esigenza è emersa durante il beta test reale del profilo "Giulia", ma è considerata un requisito generale del prodotto e non una personalizzazione specifica per quel caso.

## STATO ATTUALE DEL MOTORE CV (GIUGNO 2026)

## Obiettivo

Costruire un motore di ottimizzazione CV che non si limiti ad analizzare il profilo, ma che produca versioni del CV adattate a diversi target professionali.

---

## Architettura attuale

Pipeline implementata:

CV
↓
Profile Read
↓
Credibility Assets
↓
Reading Risk
↓
Target Focus
↓
Transformation Plan
↓
Narrative Repositioning
↓
CV Opening Draft
↓
CV Key Skills Draft
↓
CV Structure Draft
↓
CV Rewrite Instructions
↓
CV Section Rewrite Plan
↓
CV Rewrite Output

---

## Refactoring architetturale completato

### Role Target Narratives

Spostato in:

src/report/narrativeProfiles/roleTargetNarrativeProfiles.js

Il vecchio file:

src/report/roleTargetNarrativeProfiles.js

è ora un semplice file ponte.

---

### Role Family Narratives

Spostato in:

src/report/narrativeProfiles/roleFamilyNarrativeProfiles.js

Il vecchio file:

src/report/roleFamilyNarrativeProfiles.js

è ora un semplice file ponte.

---

## Principio architetturale da mantenere

Tutti i contenuti narrativi, vocabolari professionali, testi dipendenti da:

* lingua
* famiglia professionale
* target professionale

devono essere concentrati nei file:

src/report/narrativeProfiles/

e NON dispersi nel codice applicativo.

Obiettivo:

* supporto multilingua
* espansione nuove famiglie
* espansione nuovi target
* aggiornamenti tramite sostituzione di file completi

senza modificare il motore.

---

## Nuovo layer implementato

Role Family Rewrite Vocabulary

Nuovi campi:

* rewriteProfile
* rewriteSkills
* rewriteKeywords

Attualmente implementati per:

care_helping_professions

Utilizzati come fallback quando non esiste un Role Target specifico.

Gerarchia:

Role Target
↓
Role Family
↓
Fallback generico

---

## Stato del CV Rewrite Engine

CV Review Engine:
100%

CV Optimization Engine:
90%

CV Rewrite Engine:
circa 70%

---

## Caso reale di validazione: Giulia

Target testati:

* Infanzia / Famiglie / Genitorialità
* Giovani / Ascolto / Prevenzione
* Disabilità / Sostegno educativo

Risultato:

Il motore produce già:

* profilo professionale targetizzato
* competenze chiave targetizzate
* struttura CV consigliata
* istruzioni di riscrittura
* piano di riscrittura sezioni
* primo CV Rewrite Output

---

## Prossimo passo prioritario

Sospendere temporaneamente l'aggiunta di nuove famiglie e nuovi target.

Eseguire un test reale end-to-end sul CV di Giulia:

CV Famiglie
CV Giovani
CV Disabilità

Obiettivo:

identificare i veri colli di bottiglia della generazione CV.

Ipotesi attuale:

il prossimo limite non è più l'analisi del CV ma la riscrittura delle esperienze professionali e della formazione.

Solo dopo questo test decidere eventuali nuove evoluzioni del motore.

# CONTINUITY — CV ARCHITECTURE MIGRATION (GIUGNO 2026)

## Stato attuale

Completato:

* CV Review Engine
* CV Optimization Engine V1
* Role Family Narrative Layer
* Role Target Narrative Layer
* CandidateProfile Normalization Layer
* Parser → CV Review integration
* Primo Narrative Data Loader

Validato tramite caso reale:

Giulia

Target:

* Famiglie / Genitorialità
* Giovani / Prevenzione
* Disabilità / Sostegno educativo

---

## Nuovo principio architetturale

Da ora in avanti:

codice = logica

narrativeData = contenuti

I builder non devono contenere narrativa professionale.

I motori non devono contenere vocabolari professionali.

Tutti i contenuti professionali devono migrare progressivamente verso Narrative Data esterni.

---

## Prima migrazione completata

Implementato:

src/report/narrativeData/normalization/care_helping_professions.json

Loader:

src/report/narrativeProfiles/cvReviewNormalizationProfiles.js

Utilizzato da:

normalizeParsedCandidateProfileForCvReview.js

Risultato:

Parser reale
↓
Normalizzazione
↓
CV Review

senza hardcoding specifici nel normalizzatore.

---

## Problema scoperto

La seniority totale e la seniority rilevante per il target non coincidono.

Caso Giulia:

20+ anni esperienza lavorativa totale

vs

1-3 anni esperienza rilevante nel nuovo target professionale.

Concetto introdotto:

Target-Relevant Seniority

Da estendere in futuro ad altre famiglie professionali.

---

## Direzione futura confermata

Narrative Data V1

Struttura candidata:

src/report/narrativeData/

├── normalization/
├── roleFamilies/
├── roleTargets/
├── rewriteOutput/
└── locales/

Obiettivo:

aggiungere nuove famiglie e nuove lingue senza modificare i builder.

---

## Priorità prossima sessione

Progettare Narrative Data Architecture V1.

Decidere:

A)

care_helping_professions.json

oppure

B)

care_helping_professions.it.json
care_helping_professions.en.json
care_helping_professions.fr.json

Decisione architetturale ancora aperta.

---

## Regola da preservare

L'utente non deve essere costretto a:

* cercare testi nel codice
* fare patch distribuite
* aggiornare più file per aggiungere una lingua

L'obiettivo finale è:

1 file dati
↓
aggiunta nuova famiglia
oppure
aggiunta nuova lingua

senza modificare il motore.

# CONTINUITÀ — MIGRAZIONE NARRATIVE DATA (CV REVIEW)

## Stato raggiunto

Obiettivo della fase:

Separare progressivamente la narrativa dalla logica del motore CV.

Principio architetturale confermato:

* Nessuna narrativa professionale significativa deve restare hardcoded nei builder.
* I builder devono contenere logica.
* Le narrative devono vivere in narrativeData.
* Le narrative devono essere organizzate per:

  * famiglia professionale
  * target professionale
  * lingua

---

## Struttura introdotta

Creati:

src/report/narrativeData/

* normalization/
* roleFamilies/
* cvReview/

Loader creati:

* loadRoleFamilyNarrativeData.js
* loadCvReviewNarrativeData.js

con supporto:

* cache
* fallback locale
* applyTemplate()

---

## Audit automatico narrative

Script creati:

scripts/audit_hardcoded_report_texts.js

scripts/extract_narrative_texts_to_catalog.js

scripts/group_narrative_catalog_by_area.js

Risultato audit:

* cv_review: 61 narrative candidate
* pro_report_builder: 170
* pro_report_renderer: 104
* other: 162

Nota:

L'audit iniziale catturava anche codice.

La seconda versione produce un catalogo molto più utilizzabile.

File generati:

tmp/audit/narrative_text_catalog.raw.json

tmp/audit/narrative_text_catalog.grouped.json

tmp/audit/narrative_text_catalog.summary.json

---

## Migrazione CV Review

Creato:

src/report/narrativeData/cvReview/care_helping_professions.json

Contiene:

* possibleDirections
* transformationPlan
* narrativeRepositioning

---

## Già migrato

buildPossibleDirectionsNarrative()

ora legge da:

cvReview/care_helping_professions.json

tramite:

loadCvReviewNarrativeData()

e

applyTemplate()

---

## Già migrato

buildNarrativeRepositioning()

ora legge da:

cvReview/care_helping_professions.json

tramite:

loadCvReviewNarrativeData()

e

applyTemplate()

Health check:

PASS

test_build_cv_review_giulia:

PASS

---

## Ancora da migrare

buildCvTransformationPlan()

I testi necessari sono già presenti in:

cvReview/care_helping_professions.json

sezione:

transformationPlan

Questa è la prossima attività operativa.

---

## Decisione architetturale importante

NON migrare narrativa testo per testo.

Migrare blocchi funzionali completi.

Esempio:

buildPossibleDirectionsNarrative
↓
possibleDirections

buildNarrativeRepositioning
↓
narrativeRepositioning

buildCvTransformationPlan
↓
transformationPlan

Obiettivo:

evitare centinaia di chiavi sparse e mantenere una struttura leggibile.

---

## Direzione futura confermata

Dopo completamento CV Review:

1. completare migration transformationPlan

2. estendere approccio a:

   * roleTargets
   * Professional Perception
   * buildProReportV2

3. mantenere il principio:

Narrative
↓
JSON narrativeData
↓
loader
↓
builder

mai:

Narrative
↓
hardcoded nei builder

---

## Visione di lungo periodo

Il sistema deve consentire future estensioni tramite:

* aggiunta di famiglie professionali
* aggiunta di target professionali
* aggiunta di lingue

senza modificare il motore.

L'obiettivo finale è poter aggiungere una nuova famiglia o una nuova lingua principalmente tramite nuovi file narrativeData.

## TACTICAL NOTE — CV Review Narrative Data Migration

### Obiettivo

Spostare progressivamente le narrative del CV Review fuori da `buildCvReviewReportV1.js` e dentro file dati JSON esterni.

Principio:

* codice = logica
* narrativeData = contenuti
* builder = usa template, non contiene testi professionali

---

### Struttura dati introdotta

Creata cartella:

`src/report/narrativeData/cvReview/`

Creato file:

`src/report/narrativeData/cvReview/care_helping_professions.json`

Il file contiene blocchi organizzati per:

* `possibleDirections`
* `transformationPlan`
* `narrativeRepositioning`

con struttura:

`family → locales → it → blocchi narrativi`

---

### Loader già esistente

File:

`src/report/narrativeProfiles/loadCvReviewNarrativeData.js`

Funzioni:

* `loadCvReviewNarrativeData({ roleFamily, locale })`
* `applyTemplate(template, values)`

Il loader legge:

`src/report/narrativeData/cvReview/{roleFamily}.json`

---

### Stato migrazione buildCvReviewReportV1.js

#### 1. `buildPossibleDirectionsNarrative`

Stato: MIGRATO PARZIALMENTE / ATTIVO

Ora riceve:

`cvReviewNarratives`

e legge da:

`cvReviewNarratives.possibleDirections`

Usa ancora fallback hardcoded di sicurezza per casi non migrati o `generic_professional`.

Da eliminare solo quando esisteranno fallback JSON generici.

---

#### 2. `buildNarrativeRepositioning`

Stato: GIÀ MIGRATO

La funzione usa già:

`templates`

derivati da:

`cvReviewNarratives.narrativeRepositioning`

Non sostituire ulteriormente se sono presenti:

`const templates = cvReviewNarratives?.narrativeRepositioning || {};`

e la chiamata passa:

`cvReviewNarratives`

---

#### 3. `buildCvTransformationPlan`

Stato: DA VERIFICARE / PROSSIMO BLOCCO

Controllare se usa già template esterni oppure contiene ancora hardcoded.

Se contiene hardcoded, migrare verso:

`cvReviewNarratives.transformationPlan`

---

### Test da eseguire dopo ogni micro-step

```bash
node scripts/test_build_cv_review_giulia.js
node scripts/test_cv_review_from_parser_giulia.js
node scripts/fringe_health_check.js
```

---

### Regola operativa

Non migrare tutti i testi singolarmente.

Migrare per blocchi funzionali:

* Possible Directions
* Transformation Plan
* Narrative Repositioning
* Rewrite Instructions
* Rewrite Output

Obiettivo: evitare 500 patch sparse e creare contenitori dati leggibili.

## STATO MIGRAZIONE CV REVIEW

Completati:

- possibleDirections
- targetFocus
- credibilityNarratives
- transformationPlan
- narrativeRepositioning
- rewriteInstructions
- structureDraft

Architettura stabilizzata:

src/report/narrativeData/cvReview/
→ narrativa report CV

src/report/narrativeData/normalization/
→ regole di normalizzazione parser

Pattern standard:

loadCvReviewNarrativeData()
↓
templates
↓
applyTemplate()
↓
fallback tecnico minimo

Ancora da migrare:

- buildCvOpeningDraft
- buildCvSectionDrafts

Non migrare ancora:

- buildCvKeySkillsDraft
- buildCvSectionRewritePlan
- buildCvRewriteOutput

perché sono strutture dati e non narrativa principale.

## CHECKPOINT — CV REVIEW MIGRATION

Stato attuale:

Completati:

* buildPossibleDirectionsNarrative
* buildTargetFocusNarrative
* buildCvTransformationPlan
* buildNarrativeRepositioning
* buildCvStructureDraft
* buildCvRewriteInstructions
* buildCvCredibilityNarrative

Separazione architetturale completata:

* narrativeData/cvReview → narrativa report
* narrativeData/normalization → regole di normalizzazione parser

Pattern standard:

loadCvReviewNarrativeData()
→ templates
→ applyTemplate()
→ fallback tecnico minimo

Audit:

* cv_review: 61 → 51
* pro_report_builder: 170
* pro_report_renderer: 100

Ancora da migrare:

* buildCvOpeningDraft
* buildCvSectionDrafts

Da lasciare nel codice:

* buildCvKeySkillsDraft
* buildCvSectionRewritePlan
* buildCvRewriteOutput
* buildCvProfessionalSignals
* buildCvProfessionalTraits

Obiettivo successivo:

Chiudere buildCvOpeningDraft e buildCvSectionDrafts e dichiarare completata la fase "CV Review Narrative Migration".

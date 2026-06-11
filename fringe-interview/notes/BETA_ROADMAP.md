# BETA_ROADMAP.md

## Stato attuale

Completato:

* Professional Perception V2
* Professional Perception LLM Alpha
* Perception Gap V1 (CV ↔ Colloquio)
* Health Check aggiornato

Obiettivo attuale:

Passare da report tecnicamente corretti a report che ragionano come un recruiter.

---

## Principio guida

FRINGE non descrive la personalità del candidato.

FRINGE descrive:

* ciò che emerge dal CV
* ciò che emerge dal colloquio
* le percezioni professionali e relazionali che possono nascere da tali evidenze

Mai formulare diagnosi psicologiche.

Mai formulare giudizi assoluti sulla persona.

Usare sempre:

* "emerge"
* "può essere letto come"
* "può trasmettere"
* "potrebbe essere percepito come"

---

## Priorità 1 — Signal Abstraction Layer

Problema attuale:

Il report utilizza ancora molti segnali grezzi:

* leadership
* stakeholder management
* Power BI
* SQL
* Tableau

che risultano poco naturali nel testo.

Obiettivo:

Introdurre un layer intermedio:

raw signals
↓
professional signals
↓
narrative

Esempi:

* leadershipVisibility
* decisionMaking
* stakeholderExposure
* executionOwnership
* analyticalDepth
* communicationClarity
* adaptability
* internationalExposure
* learningVelocity

Tutte le narrative future dovrebbero basarsi su questi segnali astratti.

---

## Priorità 2 — Role Family Narrative Expansion

Estendere progressivamente:

getRoleFamilyReadingProfile.js

Nuove famiglie candidate:

* sales_commercial
* education_training
* care_helping_professions
* engineering_technical
* customer_success_service

Obiettivo:

Adattare linguaggio e narrativa senza modificare il motore.

---

## Priorità 3 — Perception Gap Evolution

Versione attuale:

CV ↔ Colloquio

Versioni future:

* CV vs Colloquio
* Esperienza vs Seniority percepita
* CV vs Risposte
* Ruolo target vs Percezione reale

---

## Priorità 4 — International Exposure Signals

Valutare separatamente:

* esperienze all'estero
* mobilità geografica
* contesti multinazionali
* utilizzo professionale di lingue straniere
* team multiculturali

Descrivere il significato professionale.

Mai trasformarlo in giudizio personale.

---

## Regola tecnica

Ogni nuova narrativa deve essere:

* indipendente dalla singola professione
* indipendente dalla lingua
* facilmente localizzabile
* pronta per future role family

Evitare hardcoding di terminologia specifica di Operations o Business Analysis.

## Decisioni architetturali recenti

Professional Perception LLM deve diventare progressivamente la fonte primaria delle narrative.

I fallback hardcoded devono restare disponibili come sicurezza, ma non come destinazione finale.

Le narrative future devono essere:
CV
+
Colloquio
+
Role Family
+
Professional Signals

e non basarsi direttamente su skills o missingSkills.

## Priorità 0 — CV Review Mode

Consentire l'utilizzo di FRINGE senza simulazione di colloquio.

Input:

- CV

Output:

- Chi emerge
- Bagaglio di credibilità
- Seniority percepita
- Segnali professionali principali
- Possibili punti ciechi
- Possibili direzioni professionali
- Come potrebbe essere letto il profilo da un recruiter

Varianti future:

- CV Review
- CV + Target
- CV Discovery (nessun target)
- CV Optimization

Obiettivo:

Fornire valore immediato anche a utenti che non sono pronti a sostenere una simulazione di colloquio.

COMPLETATO:
* Signal Abstraction Layer V1
* Professional Traits Layer V1
* Professional Archetype V1
* Credibility Assets V2

Stato attuale:

CV Review Mode Skeleton V1.1 creato e protetto da health check.

Output attuali:

- profileRead
- credibilityAssets
- visibleSignals
- cvProfessionalSignals
- cvProfessionalTraits
- possibleDirections
- missingForCvOptimization

Nota:

La conoscenza della lingua inglese non deve generare automaticamente internationalExposure o apertura internazionale. Servono segnali più forti: estero, multinazionale, contesto internazionale, team multiculturali.

## Stato Professional Perception Beta

La pagina “Come vieni percepito” ora usa una catena più pulita:

raw signals
↓
professionalSignals
↓
professionalTraits
↓
professionalArchetype
↓
narrative

Risultato:

- meno elenchi grezzi di skill
- meno terminologia Operations/Business hardcoded
- migliore distinzione tra segnali visibili e segnali poco visibili
- Bagaglio di credibilità più narrativo e meno schematico

Prossimo passo:

testare almeno 2 profili diversi dal caso Operations/Business:

- profilo creativo/design
- profilo care/education/counseling

COMPLETATO:
* Signal Abstraction Layer V1
* Professional Traits Layer V1
* Professional Archetype V1
* Credibility Assets V2
* Career Trajectory Signals V1
* CV Review Mode Skeleton V1.1

## Beta Test Reale #1 — Profilo Care / Psychology

Caso:
- laurea biologia
- counseling
- laurea psicologia
- psicoterapia
- autismo
- servizi educativi

Nuovi segnali emersi:

- careOrientation
- learningOrientation
- internationalMindset (tramite Erasmus)

Osservazioni:

I pattern costruiti inizialmente erano troppo orientati a profili
Operations / Business.

Il test ha mostrato la necessità di:

- riconoscere professioni di aiuto
- riconoscere apprendimento continuo
- distinguere lingue da vera esposizione internazionale
- generare narrative target-specifiche per area care/helping professions
- careerTransition

Career Transition non deve essere legato solo a psicologia/counseling, ma deve riconoscere transizioni più generali: riqualificazione, seconda carriera, cambio di direzione, reskilling/upskilling, passaggio verso nuovi ambiti.

Osservazione emersa dal Beta Test Giulia:

Le narrative CV Discovery devono restare universali.

Le narrative specifiche di settore devono essere delegate alle future Role Family Narrative.

c Nuova priorità — Role Target Narrative Layer

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

 ## Role Target Narrative Layer (priorità alta)

 Obiettivo:

Separare:

- linguaggio della famiglia professionale
- focus del target specifico

senza moltiplicare il numero di Role Family.

Architettura:

Role Family
↓
Role Target
↓
Narrative Blocks
↓
Transformation Plan
↓
CV Optimization

## Role Target Architecture V1

Obiettivo:

Introdurre un livello intermedio tra Role Family e Narrative Layer.

Struttura:

Role Family
↓
Role Target
↓
Narrative Profile

Target iniziali previsti per la beta:

care_helping_professions

* family_support
* youth_prevention
* disability_autism

administration_finance_backoffice

* accounting_bookkeeping
* administrative_assistant
* payroll_hr_admin

sales_commercial_retail

* retail_sales
* b2b_sales
* insurance_financial_sales

technical_engineering_it

* software_development
* it_support_systems
* industrial_engineering

analytical_business

* business_analysis
* data_reporting
* project_operations

Nota:

Per la beta l'obiettivo è validare l'architettura e non coprire tutte le professioni possibili.

Nuovi target verranno aggiunti progressivamente sulla base dei casi reali raccolti.

Nuova milestone:

CV Optimization V1

stato:

IN PROGRESS

componenti completati:

✅ Profile Read
✅ Credibility Assets
✅ Reading Risk
✅ Possible Directions
✅ Target Focus
✅ Role Target Layer
✅ CV Transformation Plan

componenti future:

⬜ Narrative Repositioning
⬜ CV Before / After Comparison
⬜ Cover Letter Generation
⬜ Transformation Impact Scoring

Per il futuro: CV Opening Draft
↓
stile configurabile

- CV
- LinkedIn
- Cover Letter
- Recruiter Summary

## nuova priorità tecnica:

Narrative Vocabulary Modularization

Obiettivo:

roleFamilyNarrativeProfiles.js
↓
suddiviso per famiglia

roleTargetNarrativeProfiles.js
↓
suddiviso per famiglia

Benefici:

meno errori
file piccoli
aggiunte incrementalmente
facile localizzazione IT/EN/FR/DE/ES
aggiornamenti tramite singolo copia-incolla



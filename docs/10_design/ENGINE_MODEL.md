# IMAGO_ENGINE_MODEL.md

## Scopo

Ridurre la complessità architetturale di FRINGE.

FRINGE non deve essere composto da molti motori separati.
Deve avere pochi macro-motori stabili, con fasi interne specializzate.

---

# 1. Role Engine

Responsabilità:

capire il ruolo.

Input:

- CV
- Job Description
- ruolo target
- seniority
- settore
- contesto

Output principale:

Role Model

Il Role Model contiene:

- Role Understanding
- Role Credibility Map
- Evidence Collection Plan
- confidence
- validation notes

Fasi interne:

- Role Discovery
- Role Understanding
- Role Validation
- Role Credibility Map generation
- Evidence Collection Plan generation

Queste fasi NON sono motori separati.

Sono passaggi interni del Role Engine.

---

# 2. Interview Engine

Responsabilità:

gestire il colloquio come raccolta progressiva di evidenze.

Input:

- Role Model
- Evidence Collection Plan
- risposte del candidato

Output principale:

Interview State

L’Interview State contiene:

- segnali coperti
- segnali ancora poco visibili
- evidenze raccolte
- follow-up già fatti
- segnali esauriti
- prossima azione consigliata

Il colloquio non procede per numero di domanda.

Procede per copertura dei segnali.

Fasi interne:

- question selection
- follow-up
- depth check
- pressure probe
- recovery
- evidence extraction

Queste sono azioni disponibili, non motori separati.

---

# 3. Visibility Engine

Responsabilità:

confrontare ciò che il ruolo richiede con ciò che il candidato ha reso osservabile.

Input:

- Role Model
- Interview State
- Observed Evidence Map

Output:

Visibility Map

La Visibility Map contiene:

- segnali forti
- segnali sotto-visibili
- requisiti non ancora supportati
- opportunità recuperabili
- priorità operative

Da qui nasce:

- Action Plan
- Checklist
- CV strategy
- Report View

Fasi interne:

- evidence consolidation
- visibility analysis
- gap/opportunity detection
- action planning
- report preparation

---

# Regola fondamentale

Ogni nuova funzione deve appartenere a uno dei tre macro-motori.

Se non è chiaro dove collocarla, la funzione non è ancora matura.

---

# Cosa NON fare

Non creare nuovi motori per ogni esigenza.

Non creare oggetti duplicati.

Non distribuire conoscenza di dominio nel renderer.

Non trasformare le Role Family in liste infinite di regole.

---

# Modello sintetico

CV + JD + contesto

↓

Role Engine

↓

Role Model

↓

Interview Engine

↓

Interview State

↓

Visibility Engine

↓

Visibility Map / Action Plan / Report View

↓

Renderer

---

# Principio finale

FRINGE non genera semplicemente un report.

FRINGE costruisce una comprensione del ruolo, raccoglie evidenze osservabili e mostra quanto della candidatura è riuscito ad arrivare.

Generalizzazione del Core
Il Core non è un Interview Engine.

Il Core è un Evidence Intelligence Engine.

Interview rappresenta solamente la prima applicazione sviluppata.

In futuro il medesimo Core dovrà poter supportare domini differenti mantenendo invariata la logica di:

- comprensione del dominio;
- raccolta evidenze;
- interpretazione;
- piano d'azione.

Aggiornare lo stato dei motori.

Role Engine

✅ operativo (prima versione)

buildRoleCredibilityMap
buildEvidenceCollectionPlan
validator
test
health
Interview Engine

✅ prima pipeline operativa

buildInitialCoverageState
validateCoverageState
updateCoverageState
simulazione pipeline

Ancora mancanti:

chooseNextGoal
follow-up
pressure
recovery
runtime adaptation

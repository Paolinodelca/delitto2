# SESSION_HANDOVER — 2026-07-10

## Stato generale

È stata completata una nuova milestone del Core IMAGO.

Il lavoro ha riguardato principalmente:

* consolidamento del `Measurement Core`;
* introduzione delle observation gestionali;
* configurabilità dei modelli di misura;
* disattivazione controllata dei fattori;
* introduzione del catalogo dei fattori di misurazione;
* salvataggio Git selettivo dei nuovi componenti;
* rimozione della documentazione architetturale legacy ormai sostituita.

Tutti i test eseguiti al termine dei Builder Task risultano PASS.

---

# Stato della pipeline IMAGO

La pipeline generale consolidata resta:

```text
InputBundle
↓
EvidenceStore
↓
ProfessionalIdentityModel
↓
Representation
↓
Reasoning
↓
Comparison
↓
LLM Payload
↓
Prompt Messages
```

È ora in costruzione un nuovo livello deterministico:

```text
Evidence
↓
Recognition
↓
Observation
↓
Measurement
↓
Comparison
↓
Reasoning
```

Il Measurement Layer non è ancora collegato a `buildImagoRuntime()`.

---

# Builder Task completati

## Runtime e integrazione FRINGE

Completati in precedenza:

* Task 0065 — IMAGO Runtime Consolidation
* Task 0066 — IMAGO Runtime Health Integration
* Task 0067 — IMAGO Runtime Output Snapshot
* Task 0068 — IMAGO Runtime Regression
* Task 0069 — FRINGE Runtime Integration Map
* Task 0070 — FRINGE IMAGO Runtime Parallel Snapshot
* Task 0071 — FRINGE IMAGO Runtime Comparison Summary

## Measurement Layer

Completati:

* Task 0072 — Measurement Model Foundation
* Task 0073 — Measurement Core Health and Regression
* Task 0074 — Management Observation Contract
* Task 0075 — Measurement Profile Override Foundation
* Task 0076 — Measure Result Uses Effective Measurement Profile
* Task 0077 — Measurement Profile Disables Existing Factors
* Task 0078 — Measurement Factor Catalog Foundation

---

# Stato del Measurement Core

Il nuovo modulo si trova in:

```text
fringe-interview/src/core/measurement/
```

Attualmente comprende:

* `MeasurementDefinition`;
* `ManagementObservation`;
* `MeasureResult`;
* validator;
* health check;
* regression test;
* `MeasurementProfile`;
* applicazione non mutante dei profili;
* override di pesi, benchmark e soglie;
* disattivazione dei fattori;
* rinormalizzazione dei pesi attivi;
* catalogo deterministico dei fattori;
* supporto preliminare agli `addedFactors`.

---

# Prima dimensione implementata

La prima dimensione pilota è:

```text
management_scope
```

Non misura la qualità della leadership.

Misura soltanto l’ampiezza e la solidità dell’esperienza gestionale osservata.

I fattori attualmente operativi sono:

```text
teamSize
durationYears
responsibilityType
managementLayer
```

---

# Primo fattore opzionale introdotto

È stato aggiunto al catalogo:

```text
contextRelevance
```

Scopo:

misurare quanto il contesto gestionale osservato sia simile al contesto target.

Stato attuale:

* definito;
* validabile;
* selezionabile tramite `MeasurementProfile`;
* conservato nei `pendingAddedFactors`;
* NON ancora utilizzato da `buildMeasureResult()`.

Il prossimo task potrà renderlo operativo.

---

# Decisioni architetturali consolidate

## 1. Recognition e Measurement sono separati

L’LLM può riconoscere segnali nel testo.

Non deve assegnare direttamente la misura finale.

```text
LLM / Parser
↓
segnali riconosciuti
↓
Observation strutturata
↓
Measurement Model deterministico
↓
MeasureResult
```

---

## 2. Una misura non è soltanto un numero

Il risultato deve conservare:

* valore;
* stato di osservazione;
* confidence;
* benchmark;
* evidenze;
* componenti del calcolo;
* fattori attivi e disattivati;
* profilo applicato;
* limitazioni;
* metadati.

---

## 3. I modelli base non vengono modificati

La configurabilità avviene tramite:

```text
MeasurementDefinition base
+
MeasurementProfile
↓
EffectiveDefinition
```

La definition originale deve rimanere immutata.

---

## 4. Il profilo può modificare il contesto di valutazione

Un profilo può:

* modificare pesi;
* modificare benchmark;
* modificare soglie;
* disattivare fattori;
* richiedere fattori aggiuntivi presenti nel catalogo;
* rinominare il modello operativo;
* conservare rationale e provenienza.

Non può:

* modificare i dati osservati;
* introdurre formule JavaScript arbitrarie;
* aggiungere fattori non presenti nel catalogo operativo;
* alterare il significato semantico delle dimensioni.

---

## 5. Fattori configurabili e formule arbitrarie restano distinti

Principio:

```text
fattore configurabile
≠
formula inventata dall’utente
```

La flessibilità deve restare controllata, validabile e spiegabile.

---

## 6. Professional Identity e Role Projection restano separate

La Professional Identity deve conservare anche caratteristiche non immediatamente pertinenti al ruolo corrente.

Il ruolo target seleziona soltanto:

* dimensioni rilevanti;
* pesi;
* benchmark;
* soglie;
* vincoli.

```text
Professional Identity
↓
Role Projection
↓
Gap Analysis
```

---

# Considerazioni emerse sulla misurazione

Una dimensione composta, come `Leadership` o `Visione`, non deve essere valutata direttamente dal parser.

La struttura concettuale individuata è:

```text
segnali osservabili
↓
Observation
↓
fattori misurabili
↓
misure elementari
↓
costrutto composto
↓
confronto con il target
```

`Leadership` e `Visione` non sono ancora implementate.

Si è scelto correttamente di iniziare da una misura più semplice e verificabile: `management_scope`.

---

# Stato Git

Sono stati creati commit selettivi dedicati a:

* IMAGO Runtime v0.1;
* Measurement Core;
* Measurement Factor Catalog;
* rimozione della documentazione architetturale legacy sostituita.

Non è stato usato `git add .`.

Le modifiche ancora presenti nel working tree appartengono ad altri blocchi di lavoro e non devono essere aggiunte automaticamente.

Tra i residui da esaminare separatamente potrebbero esserci:

* modifiche applicative legacy;
* documenti di continuità;
* note storiche;
* `manifest.md`;
* eventuali file non tracciati;
* modifiche a test o renderer non appartenenti al Measurement Core.

Prima di qualunque ulteriore bonifica:

```powershell
git status
```

e classificazione puntuale dei file.

---

# Documenti di riferimento

Documenti fondativi già presenti:

```text
docs/00_foundation/IMAGO_FIRST_PRINCIPLES.md
docs/10_design/MEASURE_ENGINE_FOUNDATION.md
docs/30_execution/FRINGE_RUNTIME_INTEGRATION_MAP.md
docs/30_execution/SESSION_HANDOVER.md
```

Non è necessario riscrivere tutti gli altri documenti a ogni sessione.

Il `SESSION_HANDOVER.md` deve fungere da punto di ripartenza operativo.

---

# Prossimo task consigliato

## Task 0079 — Context Relevance Factor Execution

Obiettivo probabile:

rendere operativo `contextRelevance` dentro `buildMeasureResult()`.

Il task dovrà definire:

* come il valore già normalizzato tra `0` e `1` entra nell’observation;
* come viene validato;
* come viene calcolato il relativo component score;
* come entra nei pesi attivi;
* come viene rinormalizzata l’aggregazione;
* come viene tracciato nel `MeasureResult`;
* comportamento quando il valore manca;
* compatibilità completa con i profili precedenti.

Vincoli:

* nessun LLM;
* nessuna estrazione da testo;
* nessuna formula arbitraria;
* nessun collegamento al Runtime;
* nessuna modifica a report o renderer;
* nessuna valutazione diretta di Leadership.

---

# Sequenza raccomandata per la prossima sessione

1. Leggere questo handover.
2. Eseguire:

```powershell
git status
```

3. Non riaprire la ricerca teorica generale.
4. Ripartire dal Measurement Core.
5. Progettare e completare il Task 0079.
6. Eseguire test Measurement, Runtime regression e health generale.
7. Effettuare un commit selettivo del solo Task 0079.

---

# Regola operativa

Ogni nuovo Builder Task deve continuare ad avere:

* builder;
* validator;
* test;
* health o regression quando rilevante;
* CommonJS;
* immutabilità;
* nessun LLM salvo task dedicato;
* nessun valore nascosto fuori dalle definition;
* nessuna modifica a parser, Runtime, report o renderer salvo task esplicito.

---

# Punto di ripartenza sintetico

```text
Task 0078 completato
↓
Measurement Factor Catalog disponibile
↓
contextRelevance definito ma non operativo
↓
prossimo passo: Task 0079
```

# SESSION_HANDOVER — 2026-07-13
Stato generale

È stata completata una delle milestone più importanti del Core IMAGO.

Con questa sessione termina la costruzione della prima architettura completa del Capability Engine, che rappresenta il livello concettuale posto sopra il Measurement Engine.

La pipeline non produce ancora valutazioni di Leadership, Vision o altre capability reali, ma dispone ora di tutti i componenti generici necessari per costruirle in modo deterministico.

Pipeline del Core

L'architettura generale oggi è:

InputBundle
↓

EvidenceStore
↓

Recognition
↓

Observation
↓

Measurement
↓

Capability Contribution
↓

Capability Definition
↓

Contribution Matching
↓

Aggregation Context
↓

Capability Result
↓

Comparison

↓

Reasoning

↓

LLM Payload

↓

Prompt

È importante notare che:

Measurement e Capability sono ormai due livelli distinti;
il Runtime non utilizza ancora il Capability Engine;
nessun report utilizza ancora le capability.
Measurement Engine

Il Measurement Engine è ormai considerato stabile.

Attualmente comprende:

Observation;
Measurement Definition;
Measurement Profile;
Factor Catalog;
Measure Result;
override dei profili;
disattivazione dei fattori;
supporto ai fattori aggiuntivi;
health;
regression.

Le misure oggi rappresentano grandezze osservabili, non ancora caratteristiche professionali complesse.

La misura pilota rimane:

management_scope

che descrive esclusivamente:

ampiezza e solidità dell'esperienza gestionale osservata.

Non misura la Leadership.

Capability Engine

Durante questa milestone è stato costruito il primo Capability Engine generico.

Sono disponibili:

CapabilityDefinition;
CapabilityContribution;
CapabilityContributionMatch;
CapabilityAggregationContext;
CapabilityResult;
validator;
health;
regression.

L'engine è completamente deterministico.

Non utilizza LLM.

Non contiene formule specifiche di Leadership.

Decisione architetturale fondamentale

La decisione più importante emersa in queste sessioni è la seguente.

Una capability NON viene misurata direttamente.

Una capability emerge.

Il modello concettuale adottato è:

Evidence

↓

Recognition

↓

Observation

↓

Measurement

↓

Capability Contributions

↓

Capability

↓

Interpretazione

Questo rappresenta oggi uno dei principi fondativi di IMAGO.

Misura come proprietà emergente

La discussione più importante ha riguardato il significato stesso della misura.

La conclusione raggiunta è:

una capability non deve ricevere un numero arbitrario.

Il valore deve emergere dalla rete delle evidenze.

In altre parole:

non si assegna "Leadership = 0.82".

Si osservano invece contributi molteplici che sostengono (o contraddicono) l'ipotesi che una determinata capability sia presente.

La misura finale è una proprietà emergente dell'intero insieme di contributi.

Supporto dell'inferenza

È stata chiarita una distinzione fondamentale.

La forza della capability e la qualità dell'inferenza sono concetti differenti.

Il CapabilityResult mantiene quindi separati:

strength;
inferenceSupport;
coverage;
manifestationStatus.

Questa separazione è considerata un principio architetturale stabile.

Confidence

La riflessione svolta ha modificato anche il concetto di confidence.

La confidence non deve rappresentare:

quanto il sistema è sicuro.

Deve rappresentare:

quanto le evidenze raccolte supportano una determinata inferenza.

In prospettiva il termine stesso "confidence" potrebbe essere sostituito da qualcosa di più aderente, come:

Evidence Support;
Inference Support.

Per il momento viene mantenuto inferenceSupport.

Benchmark

Un'altra decisione molto importante riguarda il benchmark.

Il benchmark NON è un insieme di numeri arbitrari.

Benchmark e candidato devono essere descritti dallo stesso modello osservativo.

Entrambi devono essere costruiti utilizzando:

le stesse dimensioni;
gli stessi fattori;
gli stessi contributi.

Cambiano esclusivamente:

i valori osservati;
i pesi;
le soglie;
i requisiti.

Questo principio garantisce confrontabilità e spiegabilità.

Knowledge

La discussione ha portato ad una nuova interpretazione della Knowledge.

La conoscenza del sistema non consiste principalmente nella documentazione.

Consiste nella definizione di:

dimensioni osservabili;
fattori;
capability;
relazioni;
benchmark;
soglie;
regole di inferenza.

La vera "conoscenza" di IMAGO sarà quindi rappresentata dai modelli dichiarativi.

Stato dei Builder Task

Completati:

Task 0072
Task 0073
Task 0074
Task 0075
Task 0076
Task 0077
Task 0078

Measurement Engine.

Completati:

Task 0079
Task 0080
Task 0081
Task 0082
Task 0083
Task 0084
Task 0085

Capability Engine Foundation.

Tutti i test risultano PASS.

Stato Git

È stato effettuato un commit selettivo del solo Capability Core.

Sono volutamente rimasti fuori:

observe_bigPrompt;
renderer;
report;
documentazione storica;
manifest;
continuità;
note legacy.

La strategia dei commit selettivi viene confermata.

Punto di svolta

Fino ad oggi abbiamo costruito il motore.

Da questo momento inizia la costruzione della conoscenza.

Il prossimo lavoro non consiste nell'aggiungere nuova infrastruttura.

Consiste nel definire, una alla volta, le vere capability professionali.

Prossima milestone

La prossima fase NON deve partire scrivendo codice.

Occorre prima progettare accuratamente la prima capability reale.

La candidata naturale è:

Leadership

Prima di implementarla sarà necessario definire:

quali measurement contribuiscono;
quali sono supporting;
quali possono essere contradicting;
quali relazioni esistono tra i contributi;
quali benchmark utilizzare;
quali soglie definiscono la capability;
quali pattern osservativi distinguono un leader esperto da un leader potenziale.

Solo dopo questa progettazione dovrà iniziare il relativo Builder Task.

Decisione metodologica

Una riflessione emersa durante queste sessioni viene considerata fondativa.

La domanda corretta non è:

"Come misuro Leadership?"

La domanda corretta è:

"Qual è il modello minimo dal quale Leadership emerge?"

Questa frase sintetizza probabilmente meglio di qualunque altra la filosofia che oggi guida l'evoluzione di IMAGO.

# SESSION_HANDOVER — 2026-07-14

## Stato generale

È stata completata una nuova milestone architetturale del Core IMAGO.

Dopo la costruzione del Measurement Core e del Capability Core generico, è stata formalizzata la separazione tra:

* conoscenza stabile della capability;
* descrizione del contesto target;
* proiezione contestuale della capability;
* configurazione eseguibile dal Capability Engine.

La nuova catena dichiarativa ed esecutiva è completa e testata:

```text
CapabilityDesign
+
TargetModel
↓
CapabilityProjection
↓
CapabilityDefinition
↓
CapabilityContributionMatch
↓
CapabilityAggregationContext
↓
CapabilityResult
```

Tutti i test previsti fino al Task 0089 risultano PASS.

---

# Builder Task completati nella nuova fase

Completati:

* Task 0086 — Capability Design Contract Foundation
* Task 0087 — Target Model Foundation
* Task 0088 — Capability Projection Contract Foundation
* Task 0089 — Capability Projection to Definition

Questi task si aggiungono al Capability Core generico già completato nei Task 0080–0085.

---

# 1. CapabilityDesign

È stato introdotto:

```text
CapabilityDesign
```

Il design rappresenta la conoscenza stabile e indipendente dal target relativa a una capability.

Descrive:

* significato della capability;
* confini semantici;
* ciò che include;
* ciò che esclude;
* affermazioni che il sistema non deve fare;
* componenti core e opzionali;
* direzioni supporting e contradicting;
* evidenze attese;
* principi di progettazione;
* provenienza della conoscenza;
* rationale.

Non contiene:

* pesi esecutivi;
* soglie numeriche;
* benchmark numerici;
* configurazioni di ruolo;
* configurazioni organizzative;
* risultati.

La denominazione concettuale del singolo componente è:

```text
CapabilityComponentDesign
```

Il campo root rimane:

```text
components
```

Non è stato introdotto un builder autonomo per i componenti.

---

# 2. TargetModel

È stato introdotto:

```text
TargetModel
```

Il target descrive il contesto rispetto al quale una capability sarà interpretata.

Può rappresentare:

* ruolo professionale;
* organizzazione;
* team;
* progetto;
* target generico.

Il primo contratto comprende:

* ruolo e famiglia professionale;
* seniority;
* responsabilità e autorità;
* caratteristiche organizzative;
* struttura e governance;
* segnali culturali;
* fase dell’organizzazione;
* urgenza e stabilità;
* sfida primaria;
* team context;
* obiettivi;
* priorità;
* vincoli;
* assunzioni;
* provenance.

Il `TargetModel` non produce direttamente pesi o valutazioni.

Descrive il contesto dal quale una configurazione potrà essere derivata.

---

# 3. CapabilityProjection

È stato introdotto:

```text
CapabilityProjection
```

La projection collega:

```text
CapabilityDesign
+
TargetModel
```

e rende esplicito come il design stabile viene interpretato nel target specifico.

La prima versione è:

```text
configuration-driven
```

Non deriva automaticamente pesi o soglie.

Ogni component projection può dichiarare:

* attivazione o disattivazione;
* ruolo contestuale core oppure optional;
* peso;
* contributo minimo;
* direzioni ammesse;
* target drivers;
* rationale;
* provenance e metadati.

La projection distingue:

* componenti attivi;
* componenti inattivi;
* componenti non configurati;
* configurazioni non mappate sul design.

Ogni scelta può essere collegata a uno o più `TargetDriver`, per esempio:

```text
role.scope.peopleResponsibility
teamContext.teamSizeBand
situation.phase
organization.structure
objectives
priorities
constraints
```

Il driver è descrittivo e tracciabile.

Non è stato introdotto un motore generico per interpretare automaticamente i path.

---

# 4. CapabilityDefinitionFromProjection

È stato introdotto:

```text
buildCapabilityDefinitionFromProjection()
```

La funzione converte deterministicamente:

```text
CapabilityProjection
↓
CapabilityDefinition
```

La conversione:

* non legge nuovamente il design;
* non legge nuovamente il target;
* non inventa pesi;
* non normalizza anticipatamente i pesi;
* non modifica la projection;
* non interpreta nuovamente il contesto;
* conserva traceability completa.

Il mapping fondamentale è:

```text
componentId
→ contributionKey

componentId
→ sourceMeasureId

projectedRole = core
→ requiredContributions

projectedRole = optional
→ optionalContributions
```

La projection ha priorità esecutiva rispetto al ruolo originario del componente nel design.

La distinzione tra componente di tipo:

```text
measurement
capability
```

rimane tracciata nei metadata del requirement.

Il contratto storico di `CapabilityDefinition` mantiene ancora:

```text
neutralDirection: "neutral"
```

per compatibilità con il Capability Core esistente.

Il nuovo livello di Design e Projection, invece, non usa relazioni neutral.

---

# Decisioni architetturali consolidate

## 1. Neutral non appartiene alla Knowledge

Una relazione neutral non aggiunge conoscenza.

Nel modello stabile:

```text
assenza di effetto
=
assenza della relazione
```

Perciò `CapabilityDesign` e `CapabilityProjection` ammettono solamente:

```text
supporting
contradicting
```

Il valore neutral rimane temporaneamente soltanto nei contratti esecutivi precedenti per compatibilità.

---

## 2. Knowledge e configurazione esecutiva sono separate

La distinzione consolidata è:

```text
CapabilityDesign
= che cosa significa la capability

TargetModel
= quale contesto deve essere interpretato

CapabilityProjection
= come il target configura il design

CapabilityDefinition
= configurazione eseguibile dal motore
```

---

## 3. I pesi non appartengono alla capability in assoluto

La relazione stabile dichiara che una componente può sostenere o contraddire una capability.

Il peso rappresenta invece la rilevanza di quella relazione nel target specifico.

Quindi:

```text
Knowledge Layer
↓
relazione semanticamente possibile

Target / Projection Layer
↓
peso, ruolo, soglia e requisiti contestuali
```

---

## 4. Il target non coincide con il fit

Il `TargetModel` rappresenta la configurazione di riferimento.

Il fit sarà un risultato successivo del confronto.

Pipeline concettuale:

```text
Professional Identity
+
Target Model
↓
Capability Projection
↓
Comparison
↓
Fit
```

Non usare `fit` per indicare il modello organizzativo o il set di pesi.

---

## 5. Il target può rappresentare più del ruolo

Il target effettivo può dipendere da:

```text
ruolo
+
organizzazione
+
fase aziendale
+
team
+
obiettivi
+
priorità
+
vincoli
```

Due organizzazioni che cercano lo stesso ruolo possono quindi produrre proiezioni differenti.

---

## 6. Persona e organizzazione seguono la stessa filosofia

È emersa una possibile simmetria generale:

```text
Professional Knowledge
↓
Professional Identity
↓
Projection
↓
Capability
```

e:

```text
Organizational Knowledge
↓
Organizational Identity
↓
Projection
↓
Target Model
```

Questa generalizzazione è promettente, ma non deve ancora produrre nuove astrazioni o nuovi task.

Regola confermata:

```text
No new abstractions without implementation need.
```

---

# Filosofia della capability

Una capability non viene misurata direttamente.

Emerge da contributi osservabili e tracciabili.

La domanda guida resta:

> Qual è il modello minimo dal quale questa capability emerge?

Le componenti devono essere:

* semanticamente distinte;
* osservabili;
* utili a una decisione o raccomandazione;
* spiegabili;
* non ridondanti.

Il modello deve rimanere:

* sparso;
* poco profondo;
* progressivo;
* governabile;
* versionabile.

Limiti progettuali iniziali raccomandati:

* massimo 5 componenti core;
* massimo 3 componenti opzionali;
* massimo 2 livelli sotto la capability finale nella prima applicazione reale;
* nessuna relazione condizionale nella prima versione;
* nessun nuovo nodo senza un caso reale che ne dimostri l’utilità.

---

# Occorrenze ed evidenze

Il numero grezzo di occorrenze non deve determinare automaticamente la forza di una capability.

Occorre distinguere:

```text
ripetizione della stessa esperienza
≠
evidenze indipendenti convergenti
```

CV, LinkedIn e intervista possono descrivere lo stesso episodio.

Non devono necessariamente essere conteggiati come tre esperienze indipendenti.

In prospettiva sarà necessario distinguere:

* evidenza originaria;
* episodio;
* segnali estratti;
* fonti convergenti;
* contraddizioni;
* qualità e indipendenza del supporto.

Questo problema non è stato ancora implementato nei Task 0086–0089.

---

# Stato del Core

## Measurement Core

Considerato stabile nella versione attuale.

Comprende:

* Observation;
* MeasurementDefinition;
* MeasurementProfile;
* MeasurementFactorDefinition;
* MeasureResult;
* contextRelevance operativo;
* health;
* regression.

## Capability Core esecutivo

Comprende:

* CapabilityContribution;
* CapabilityDefinition;
* CapabilityContributionMatch;
* CapabilityAggregationContext;
* CapabilityResult;
* health;
* regression.

## Capability Knowledge e Projection Layer

Comprende ora:

* CapabilityDesign;
* TargetModel;
* CapabilityProjection;
* conversione Projection → Definition.

---

# Stato di integrazione

Non sono ancora collegati al Runtime:

* Measurement Core;
* Capability Core;
* CapabilityDesign;
* TargetModel;
* CapabilityProjection.

Non sono ancora modificati:

* parser;
* report;
* renderer;
* pipeline applicativa FRINGE.

Non esiste ancora:

* vera Leadership;
* Organizational Identity;
* derivazione automatica della projection;
* calcolo del fit sul nuovo Core;
* confronto candidato-target basato sulle nuove capability;
* generazione LLM dei modelli.

---

# Stato Git

Il commit selettivo precedente ha consolidato il Capability Core fino al Task 0085.

I file dei Task 0086–0089 devono essere salvati con un commit selettivo dedicato, includendo soltanto:

```text
src/core/capability/buildCapabilityDesign.js
src/core/capability/validateCapabilityDesign.js

src/core/capability/buildTargetModel.js
src/core/capability/validateTargetModel.js

src/core/capability/buildCapabilityProjection.js
src/core/capability/validateCapabilityProjection.js

src/core/capability/buildCapabilityDefinitionFromProjection.js

src/core/capability/index.js

scripts/test_build_capability_design.js
scripts/test_build_target_model.js
scripts/test_build_capability_projection.js
scripts/test_build_capability_definition_from_projection.js
```

Includere eventuali altri file solo se effettivamente modificati dai Task 0086–0089 e verificati tramite `git status`.

Non usare:

```text
git add .
```

Messaggio di commit suggerito:

```text
Add capability design target and projection layer
```

---

# Prossima milestone

Il prossimo passo non dovrebbe introdurre nuova infrastruttura generale.

È il momento di progettare e implementare la prima capability reale:

```text
Leadership
```

Prima del Builder sarà necessario definire un design minimo e realistico.

La progettazione dovrà stabilire:

* significato preciso di Leadership;
* boundaries;
* nonClaims;
* componenti core;
* componenti opzionali;
* evidenze attese;
* componenti supporting;
* possibili componenti contradicting;
* distinzione fra manifestazione osservata e potenziale;
* target pilota;
* projection pilota;
* provenance iniziale come hypothesis.

---

# Proposta per Leadership v0.1

Non assumere ancora come definitiva, ma usare come punto iniziale di discussione:

```text
Leadership
├─ Operational Leadership
├─ People Leadership
├─ Decision Accountability
├─ Result Delivery Through Others
└─ Organizational Influence
```

Prima di introdurre sottocapability nuove, verificare:

1. se sono semanticamente distinte;
2. se possono divergere nella stessa persona;
3. se sono sostenute da evidenze osservabili;
4. se modificano una decisione o una raccomandazione;
5. se possono essere spiegate chiaramente.

`management_scope` resta una measurement e può contribuire, ma non equivale a Leadership.

---

# Sequenza raccomandata per la prossima sessione

1. Leggere questo handover.
2. Eseguire:

   ```powershell
   git status
   ```
3. Verificare ed eventualmente committare selettivamente i Task 0086–0089.
4. Non introdurre altre astrazioni generali.
5. Progettare `LeadershipDesign v0.1`.
6. Usare un solo target pilota:

   ```text
   Plant Manager
   +
   corporate
   +
   transformation
   ```
7. Costruire una projection reale ma ancora dichiarativa.
8. Convertirla in `CapabilityDefinition`.
9. Eseguire una pipeline Capability completa con contributi demo realistici.
10. Valutare se il modello produce un risultato spiegabile senza modificare le fondamenta.

---

# Punto di ripartenza sintetico

```text
Task 0089 completato
↓
Design + Target + Projection + Definition disponibili
↓
catena dichiarativa completa
↓
nessun collegamento al Runtime
↓
prossimo passo: Leadership reale v0.1
```

---

# Regola operativa confermata

Da questo momento:

> Nessuna nuova astrazione entra nel Core senza che un problema concreto della prima capability reale ne dimostri la necessità.

La fase di generalizzazione è conclusa.

Inizia la fase di validazione della conoscenza.

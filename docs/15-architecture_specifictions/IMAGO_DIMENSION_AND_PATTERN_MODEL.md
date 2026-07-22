# IMAGO Dimension and Pattern Model

## Documento architetturale canonico

**Stato:** Foundation
**Ambito:** Dimension Model, Evaluation Pattern, Pattern Registry, Model Calibration
**Dipendenza:** `IMAGO_KNOWLEDGE_ARCHITECTURE.md`

---

# 1. Decisione fondamentale

L’unità semantica centrale di IMAGO è la:

```text
Dimension
```

Una Dimension rappresenta un asse professionale lungo il quale possono essere raccolte, aggregate e interpretate evidenze.

Esempi:

```text
ownership
prioritization
decision_clarity
learning_orientation
accountability
leadership
strategic_orientation
```

IMAGO utilizza un solo concetto generale di Dimension.

Una Dimension può essere:

```text
elementary
```

oppure:

```text
derived
```

La distinzione non identifica due famiglie di oggetti completamente diverse.

Identifica due differenti modalità di determinazione dello stato della stessa entità concettuale.

---

# 2. Elementary Dimension

Una Elementary Dimension riceve conoscenza principalmente attraverso:

* Observation;
* MeasurementResult;
* analisi deterministiche;
* parser;
* modelli linguistici;
* input strutturati;
* fonti documentali;
* risposte raccolte durante un’interazione.

Esempio:

```text
decision_clarity
```

può essere alimentata da evidenze relative a:

* esplicitazione della decisione;
* presenza di alternative considerate;
* motivazione della scelta;
* comprensione delle conseguenze;
* chiarezza dei criteri utilizzati.

Una Elementary Dimension non deve necessariamente corrispondere a un singolo segnale.

Può ricevere più segnali omogenei, purché resti sufficientemente atomica per gli obiettivi del sistema.

---

# 3. Derived Dimension

Una Derived Dimension riceve conoscenza attraverso l’applicazione di uno o più Evaluation Pattern ad altre Dimension.

Esempio:

```text
leadership
```

può dipendere da:

```text
ownership
decision_clarity
initiative
coordination
influence
ambiguity_management
```

Il suo stato non viene prodotto direttamente dal parser o dal modello linguistico.

Viene calcolato a partire dagli stati delle Dimension di input.

Il sistema può comunque raccogliere Observation direttamente associate a una Derived Dimension, ma tali Observation devono essere trattate come:

* evidenze ausiliarie;
* segnali da confrontare;
* possibili elementi di validazione;
* non sostituti automatici del pattern di derivazione.

---

# 4. Dimension Definition

Ogni Dimension deve essere definita da un oggetto versionato.

Struttura concettuale:

```text
DimensionDefinition
  id
  version
  status
  name
  description
  type
  boundaries
  includedMeanings
  excludedMeanings
  positiveSignals
  negativeSignals
  contradictorySignals
  typicalContexts
  observationHints
  derivation
  metadata
```

## 4.1 Identità stabile

Il campo:

```text
id
```

deve rappresentare un’identità stabile e machine-readable.

Esempio:

```text
decision_clarity
```

Il nome visualizzato può cambiare o essere localizzato senza modificare l’identità.

## 4.2 Versione

Ogni modifica semantica significativa deve produrre una nuova versione.

Esempio:

```text
id: leadership
version: 1.2.0
```

## 4.3 Stato

Possibili stati:

```text
draft
experimental
validated
deprecated
archived
```

### draft

Definizione ancora in progettazione.

### experimental

Utilizzabile in test e calibrazione, ma non considerata stabile.

### validated

Definizione approvata per gli ambiti dichiarati.

### deprecated

Ancora leggibile per compatibilità storica, ma non utilizzabile per nuovi modelli.

### archived

Conservata esclusivamente per audit o ricostruzione storica.

---

# 5. Dimension Knowledge State

Ogni persona può avere uno stato distinto per ciascuna Dimension.

Struttura concettuale:

```text
DimensionKnowledgeState
  dimensionId
  dimensionVersion
  stateType
  estimate
  direction
  coverage
  confidence
  consistency
  stability
  evidenceQuality
  sourceReliability
  measurementCount
  independentMeasurementCount
  sourceDiversity
  contextDistribution
  contradictions
  supportingRefs
  derivationTrace
  calculatedAt
  metadata
```

## 5.1 State Type

Possibili valori:

```text
observed
derived
hybrid
unknown
```

### observed

Lo stato deriva principalmente da MeasurementResult.

### derived

Lo stato deriva principalmente da un Evaluation Pattern.

### hybrid

Esistono sia evidenze dirette sia una derivazione da altre Dimension.

### unknown

La conoscenza disponibile non consente una stima significativa.

---

# 6. Evaluation Pattern

Un Evaluation Pattern descrive come una Derived Dimension viene calcolata a partire da altre Dimension.

È un oggetto di dominio indipendente dal codice che lo esegue.

Struttura concettuale:

```text
EvaluationPattern
  id
  version
  status
  name
  description
  outputDimension
  applicability
  inputs
  configurations
  aggregationPolicy
  confidencePolicy
  coveragePolicy
  contradictionPolicy
  explanationPolicy
  validation
  provenance
  metadata
```

---

# 7. Input del Pattern

Ogni input deve dichiarare il proprio ruolo.

```text
PatternInput
  dimensionId
  dimensionVersionRange
  role
  weight
  minimumEstimate
  minimumCoverage
  minimumConfidence
  contextFilter
  missingDataPolicy
  metadata
```

Ruoli possibili:

```text
core
required
supporting
contextual
compensatory
inhibiting
contradictory
```

Il ruolo semantico deve rimanere distinto dal peso matematico.

Un input può avere peso alto senza essere obbligatorio.

Un input required può avere un peso numerico limitato ma impedire l’attivazione del pattern quando manca.

---

# 8. Configurazioni alternative

Una Derived Dimension può emergere attraverso configurazioni differenti.

Esempio:

```text
leadership
```

può essere sostenuta da:

```text
operational_leadership
technical_leadership
relational_leadership
strategic_leadership
```

Il pattern deve quindi supportare più configurazioni.

```text
PatternConfiguration
  id
  name
  applicability
  requiredInputs
  supportingInputs
  inhibitingInputs
  activationRule
  aggregationRule
  priority
  metadata
```

Il sistema deve poter determinare:

* quale configurazione è stata attivata;
* quali configurazioni erano plausibili;
* quali non erano valutabili;
* quali sono state inibite;
* quale configurazione ha prodotto il risultato finale.

---

# 9. Aggregation Policy

L’Aggregation Policy determina come gli input vengono combinati.

Non deve essere limitata alla media ponderata.

Tipi iniziali possibili:

```text
weighted_mean
weighted_sum
minimum_gate
maximum_signal
threshold_count
rule_set
hybrid
```

## 9.1 Weighted Mean

```text
output = Σ(value × weight) / Σ(weight)
```

Utilizzabile solo quando le Dimension sono realmente compensabili.

## 9.2 Minimum Gate

Il risultato non può superare una certa soglia se una Dimension obbligatoria non raggiunge il livello minimo.

Esempio:

```text
if ownership < minimum:
  leadership <= partial
```

## 9.3 Threshold Count

Il pattern si attiva quando un numero minimo di condizioni è soddisfatto.

Esempio:

```text
almeno 3 segnali su 5
```

## 9.4 Rule Set

Il risultato deriva da regole esplicite.

Esempio:

```text
ownership >= 0.60

AND

decision_clarity >= 0.55

AND

at least one of:
  coordination >= 0.55
  influence >= 0.55

AND NOT

responsibility_avoidance >= 0.70
```

## 9.5 Hybrid

Combina:

* regole di attivazione;
* soglie;
* pesi;
* compensazioni;
* inibizioni.

Questa sarà probabilmente la modalità più rilevante per le Dimension professionali complesse.

---

# 10. Missing Data Policy

Ogni Pattern deve dichiarare come gestisce Dimension non osservate.

Possibili politiche:

```text
reduce_coverage
reduce_confidence
block_evaluation
ignore_if_optional
request_measurement
use_contextual_fallback
```

Il comportamento predefinito deve rispettare:

```text
not_observed ≠ absent
```

Una Dimension non osservata non deve assumere automaticamente valore zero.

---

# 11. Confidence Policy

La confidence della Derived Dimension non deve coincidere automaticamente con la media delle confidence degli input.

Può dipendere da:

* confidence degli input;
* coverage degli input;
* numero di componenti necessarie disponibili;
* indipendenza delle fonti;
* consistenza;
* presenza di contraddizioni;
* stabilità della configurazione;
* maturità del pattern;
* qualità della validazione del pattern stesso.

Struttura concettuale:

```text
DerivedConfidence
  inputConfidence
  inputCoverage
  configurationCompleteness
  contradictionPenalty
  patternMaturity
  contextApplicability
```

La confidence del risultato deve quindi tenere conto sia della conoscenza sulla persona sia della qualità del modello utilizzato.

---

# 12. Pattern Maturity

Ogni Pattern deve dichiarare il proprio livello di maturità.

Possibili livelli:

```text
conceptual
prototype
calibrating
validated
production
deprecated
```

Il sistema dovrebbe conservare indicatori come:

```text
validationCaseCount
expertReviewCount
comparisonCaseCount
lastValidatedAt
knownLimitations
supportedContexts
unsupportedContexts
```

Questo evita che un pattern appena formulato venga trattato come equivalente a un modello ampiamente verificato.

---

# 13. Pattern Registry

Tutti gli Evaluation Pattern devono essere conservati in un registro interrogabile.

Il Pattern Registry deve consentire almeno:

```text
list
get
search
filter
compare
clone
createDraft
updateDraft
validate
publishVersion
deprecate
archive
```

Il Registry non coincide necessariamente con una UI.

È prima di tutto un servizio e un contratto del Core.

---

# 14. Interrogazione dei Pattern

Deve essere possibile interrogare il sistema per domande come:

```text
Quali pattern producono leadership?
```

```text
Quali Dimension utilizzano ownership?
```

```text
In quali pattern decision_clarity è required?
```

```text
Quali differenze esistono tra leadership 1.1 e 1.2?
```

```text
Quali pattern sono ancora experimental?
```

```text
Quali pattern sono applicabili ai ruoli operations?
```

```text
Quali Dimension non vengono utilizzate da nessun pattern?
```

```text
Quali pattern dipendono direttamente o indirettamente da accountability?
```

Queste interrogazioni costituiscono un requisito architetturale, non una funzionalità accessoria.

---

# 15. Duplicazione e modifica

Un Pattern validato non deve essere modificato direttamente.

Il processo corretto è:

```text
validated pattern
  ↓
clone
  ↓
new draft
  ↓
modification
  ↓
testing
  ↓
validation
  ↓
new published version
```

Esempio:

```text
leadership_general@1.2.0
```

viene duplicato come:

```text
leadership_general@1.3.0-draft
```

oppure come nuovo pattern:

```text
leadership_operations@0.1.0-draft
```

La relazione con il modello originale deve essere conservata.

```text
derivedFromPatternId
derivedFromVersion
```

---

# 16. Pattern Comparison

Il sistema deve permettere il confronto strutturale tra due Pattern.

Il confronto dovrebbe mostrare:

* input aggiunti;
* input rimossi;
* ruoli modificati;
* pesi modificati;
* soglie modificate;
* configurazioni aggiunte o eliminate;
* politiche di missing data differenti;
* variazioni nella confidence policy;
* variazioni di applicabilità;
* differenze nella maturità;
* impatto sui casi di test.

---

# 17. Pattern Execution Engine

L’esecuzione deve essere deterministica rispetto a:

```text
EvaluationPattern versionato
+
DimensionKnowledgeState di input
+
Evaluation Context
```

Lo stesso input, con la stessa versione del pattern e lo stesso contesto, deve produrre lo stesso risultato.

Struttura concettuale:

```text
evaluatePattern({
  pattern,
  dimensionStates,
  evaluationContext
})
```

Output:

```text
PatternEvaluationResult
  patternId
  patternVersion
  outputDimensionId
  estimate
  coverage
  confidence
  activeConfiguration
  satisfiedInputs
  missingInputs
  insufficientInputs
  inhibitingInputs
  contradictions
  explanationTrace
  evaluatedAt
  metadata
```

---

# 18. Evaluation Context

L’esecuzione del Pattern può dipendere da un contesto esplicito.

```text
EvaluationContext
  domain
  roleFamily
  seniority
  organizationalContext
  culturalContext
  operatingEnvironment
  timeReference
  metadata
```

Il contesto non deve essere ricavato implicitamente da variabili globali.

Deve essere fornito esplicitamente all’engine.

---

# 19. Explanation Trace

Ogni risultato deve spiegare come è stato ottenuto.

Esempio:

```text
leadership:
  activeConfiguration: operational_leadership

  satisfied:
    ownership
    prioritization
    coordination

  supporting:
    initiative

  insufficient:
    conflict_management

  inhibiting:
    none

  confidence reduced because:
    pressure context not observed
```

L’Explanation Trace deve essere machine-readable e successivamente traducibile in una spiegazione narrativa.

---

# 20. Pattern Test Case

Ogni Pattern deve poter essere associato a casi di test.

```text
PatternTestCase
  id
  patternId
  patternVersion
  inputStates
  evaluationContext
  expectedResult
  expectedConfiguration
  expectedWarnings
  rationale
  metadata
```

Tipi di caso:

```text
reference
boundary
contradictory
missing_data
inhibition
compensation
contextual
regression
```

---

# 21. Pattern Calibration

La calibrazione è il processo attraverso cui il modello viene progressivamente migliorato.

Deve poter confrontare:

```text
expected interpretation
vs
pattern result
```

La calibrazione potrà utilizzare:

* valutazioni esperte;
* casi sintetici;
* casi reali anonimizzati;
* confronto tra valutatori;
* risultati longitudinali;
* test A/B di pattern;
* errori osservati;
* anomalie;
* feedback applicativo.

La fase Foundation non implementa ancora la calibrazione automatica.

Deve però rendere il modello compatibile con essa.

---

# 22. Pattern Workspace futuro

In prospettiva dovrà esistere un ambiente di lavoro dedicato.

Nome concettuale:

```text
IMAGO Pattern Workspace
```

Funzioni previste:

* navigazione delle Dimension;
* visualizzazione delle dipendenze;
* apertura dei Pattern;
* duplicazione;
* modifica controllata;
* confronto tra versioni;
* esecuzione su casi di test;
* visualizzazione dell’Explanation Trace;
* simulazione di variazioni;
* pubblicazione di nuove versioni;
* rollback logico;
* gestione dello stato di maturità.

Il Workspace non deve essere implementato ora.

La sua esistenza futura deve però influenzare i contratti odierni.

---

# 23. Rappresentazione visuale

La rappresentazione grafica sarà una vista del modello, non il modello stesso.

I nodi rappresenteranno:

```text
Dimension
```

Le connessioni rappresenteranno:

```text
Pattern dependencies
```

Esempio:

```text
ownership ──────────────┐
                        │
decision_clarity ───────┼── leadership
                        │
coordination ───────────┤
                        │
responsibility_avoidance ──| leadership
```

La relazione deve conservare:

* ruolo;
* peso;
* soglia;
* condizioni;
* configurazione;
* versione del Pattern.

Un semplice arco visuale non contiene abbastanza informazione per essere il contratto di dominio.

---

# 24. Separazione fra modello e rappresentazione

Devono rimanere separati:

```text
Dimension Registry
Evaluation Pattern Registry
Pattern Execution Engine
Pattern Test Cases
Pattern Workspace
Graph Visualization
```

La UI non deve diventare la fonte di verità.

La fonte di verità deve essere costituita dagli oggetti versionati del Core.

---

# 25. Persistenza iniziale

Nella prima fase i Pattern possono essere conservati come file versionati nel repository.

Possibile struttura futura:

```text
src/core/knowledge/
  dimensions/
  patterns/
  registry/
  evaluation/
  testing/
```

Dati e definizioni potrebbero inizialmente risiedere in:

```text
config/knowledge/dimensions/
config/knowledge/patterns/
```

La collocazione precisa deve essere decisa dopo l’ispezione dei contratti già esistenti in:

```text
src/core/capability/
src/core/measurement/
src/core/comparison/
```

Non si deve creare una seconda architettura parallela senza valutare la compatibilità con il Capability Core già implementato.

---

# 26. Relazione con il Capability Model esistente

Il repository contiene già concetti quali:

```text
CapabilityDefinition
CapabilityDesign
CapabilityProjection
CapabilityContribution
CapabilityResult
TargetModel
ComparisonPolicy
ComparisonResult
```

Prima di implementare il nuovo modello occorre determinare quali di questi concetti:

* corrispondano già a Dimension;
* corrispondano a Evaluation Pattern;
* possano essere evoluti;
* debbano restare come livello applicativo;
* debbano essere adattati;
* non debbano essere duplicati.

La nuova architettura non autorizza automaticamente la sostituzione del Capability Core.

La regola deve essere:

```text
inspect
map
reuse
extend
only then create
```

---

# 27. Regola architetturale finale

La conoscenza elementare viene popolata attraverso l’analisi delle evidenze.

La conoscenza derivata viene prodotta attraverso Pattern espliciti.

I Pattern rappresentano la logica interpretativa del sistema.

Devono quindi essere:

```text
explicit
versioned
queryable
comparable
cloneable
testable
validatable
explainable
```

Il Pattern Execution Engine applica i modelli.

Il Pattern Registry li conserva.

Il Pattern Workspace ne faciliterà in futuro la progettazione e la calibrazione.

```text
Parsers populate Dimensions.

Patterns derive Dimensions.

The Registry preserves Intelligence.

Tests validate Intelligence.

The Workspace evolves Intelligence.
```

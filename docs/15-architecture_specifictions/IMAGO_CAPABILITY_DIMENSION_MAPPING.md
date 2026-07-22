# IMAGO Capability–Dimension Architecture Mapping

## Documento architetturale canonico

**Stato:** Architecture Mapping
**Ambito:** Capability Core, Dimension Model, Evaluation Pattern Model
**Dipendenze:**

* `IMAGO_KNOWLEDGE_ARCHITECTURE.md`
* `IMAGO_DIMENSION_AND_PATTERN_MODEL.md`

---

# 1. Scopo

Questo documento stabilisce la relazione tra:

* il Capability Core già implementato;
* il nuovo linguaggio architetturale basato su Dimension e Pattern;
* i futuri sviluppi del Knowledge Model.

L’obiettivo è evitare:

* duplicazione dei contratti;
* introduzione di un secondo motore parallelo;
* rinominazioni massive premature;
* perdita della compatibilità;
* divergenza tra Knowledge Architecture e codice reale.

La regola applicata è:

```text
inspect
map
reuse
extend
only then create
```

---

# 2. Conclusione principale

Il Capability Core già implementato rappresenta una prima realizzazione concreta di una parte significativa del modello Dimension/Pattern.

La relazione generale è:

```text
Dimension
≈
Capability semantic domain
```

e:

```text
Evaluation Pattern
≈
CapabilityDesign
+
CapabilityProjection
+
CapabilityDefinition
+
Capability execution policies
```

Tuttavia la corrispondenza non è perfettamente uno-a-uno.

Il nuovo modello Dimension/Pattern è più generale e distingue in modo più esplicito:

* Dimension elementari;
* Dimension derivate;
* stato di conoscenza della Dimension;
* pattern generale di derivazione;
* configurazione contestuale;
* esecuzione;
* versionamento;
* registro;
* calibrazione.

Il Capability Core esistente deve quindi essere considerato:

> una base implementativa valida da evolvere, non un modello da sostituire.

---

# 3. Pipeline Capability esistente

La pipeline consolidata è:

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

A monte:

```text
MeasureResult
↓
CapabilityContribution
```

La pipeline complessiva è quindi:

```text
Observation
↓
MeasureResult
↓
CapabilityContribution
↓
CapabilityDefinition
↓
CapabilityContributionMatch
↓
CapabilityAggregationContext
↓
CapabilityResult
```

Il CapabilityDesign descrive la conoscenza stabile.

Il TargetModel descrive il contesto.

La CapabilityProjection applica il contesto al design.

La CapabilityDefinition produce il contratto eseguibile.

Il CapabilityResult rappresenta il risultato aggregato.

---

# 4. Pipeline Dimension/Pattern proposta

Il modello architetturale generale è:

```text
Observation
↓
MeasurementResult
↓
Elementary Dimension Knowledge State
↓
Evaluation Pattern
↓
Derived Dimension Knowledge State
```

Con contestualizzazione:

```text
Dimension Definition
+
Target Context
↓
Pattern Configuration
↓
Executable Pattern
↓
Pattern Evaluation Result
```

La corrispondenza con la pipeline Capability è evidente.

---

# 5. Mappatura principale

| Modello Dimension/Pattern        | Capability Core esistente                       | Decisione                                                                                                |
| -------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Dimension                        | Capability                                      | Conservare Capability nel codice attuale; introdurre Dimension come concetto architetturale più generale |
| Dimension Definition             | CapabilityDesign                                | Riutilizzare ed evolvere                                                                                 |
| Elementary Dimension             | Measure o Capability alimentata direttamente    | Chiarire formalmente il confine                                                                          |
| Derived Dimension                | Capability composta                             | Già rappresentabile                                                                                      |
| Dimension component              | CapabilityComponentDesign                       | Riutilizzare                                                                                             |
| Evaluation Pattern               | CapabilityDesign + Projection + Definition      | Non creare subito un nuovo contratto concorrente                                                         |
| Pattern target context           | TargetModel                                     | Riutilizzare                                                                                             |
| Pattern contextual configuration | CapabilityProjection                            | Riutilizzare                                                                                             |
| Executable Pattern               | CapabilityDefinition                            | Riutilizzare                                                                                             |
| Pattern input                    | Capability requirement / component projection   | Riutilizzare con possibili estensioni                                                                    |
| Pattern contribution             | CapabilityContribution                          | Riutilizzare                                                                                             |
| Pattern input matching           | CapabilityContributionMatch                     | Riutilizzare                                                                                             |
| Pattern execution context        | CapabilityAggregationContext                    | Riutilizzare                                                                                             |
| Pattern Evaluation Result        | CapabilityResult                                | Riutilizzare ed evolvere                                                                                 |
| Dimension Knowledge State        | Non ancora pienamente presente                  | Nuovo oggetto necessario                                                                                 |
| Pattern Registry                 | Non ancora presente                             | Nuovo servizio futuro                                                                                    |
| Pattern Version Comparison       | Non ancora presente                             | Nuovo servizio futuro                                                                                    |
| Pattern Test Case Registry       | Test presenti, contratto di dominio assente     | Da formalizzare successivamente                                                                          |
| Pattern Workspace                | Non presente                                    | Futuro livello applicativo                                                                               |
| Explanation Trace completa       | Parzialmente presente                           | Da estendere                                                                                             |
| Pattern Maturity                 | Parzialmente rappresentata da status/provenance | Da consolidare                                                                                           |

---

# 6. CapabilityDesign

## 6.1 Funzione attuale

CapabilityDesign rappresenta:

* significato stabile della capability;
* confini semantici;
* elementi inclusi;
* elementi esclusi;
* non-claims;
* componenti core;
* componenti opzionali;
* relazioni supporting;
* relazioni contradicting;
* evidenze attese;
* rationale;
* provenienza.

Non contiene:

* pesi esecutivi;
* soglie;
* benchmark;
* configurazione del ruolo;
* configurazione organizzativa;
* risultato.

## 6.2 Corrispondenza

CapabilityDesign corrisponde principalmente a:

```text
DimensionDefinition
```

per una Dimension derivata.

Può inoltre contenere una parte di:

```text
EvaluationPattern semantic definition
```

In particolare:

```text
CapabilityDesign.components
```

descrive le relazioni semanticamente possibili tra la capability e le sue componenti.

## 6.3 Decisione

Non introdurre adesso un nuovo:

```text
buildDimensionDefinition()
```

che duplichi CapabilityDesign.

CapabilityDesign deve essere considerato il contratto esistente da cui partire.

L’eventuale generalizzazione futura dovrà avvenire attraverso:

* estensioni compatibili;
* adapter;
* alias concettuali;
* nuova versione del contratto;
* migrazione esplicita.

Non attraverso duplicazione.

---

# 7. CapabilityComponentDesign

Il singolo componente di CapabilityDesign rappresenta una Dimension che può:

* sostenere;
* contraddire;
* contribuire in modo core;
* contribuire in modo opzionale.

La corrispondenza è:

```text
CapabilityComponentDesign
≈
PatternInputDefinition
```

Non coincide ancora completamente con il futuro PatternInput perché potrebbe non contenere:

* soglia minima;
* coverage minima;
* confidence minima;
* politica per dati mancanti;
* filtro contestuale;
* funzione di compensazione;
* funzione di inibizione;
* configurazioni alternative.

Questi elementi non devono essere aggiunti indiscriminatamente al CapabilityDesign.

Molti appartengono alla Projection o alla Definition eseguibile.

---

# 8. TargetModel

## 8.1 Funzione attuale

TargetModel descrive:

* ruolo;
* famiglia professionale;
* seniority;
* responsabilità;
* autorità;
* organizzazione;
* governance;
* cultura;
* fase organizzativa;
* urgenza;
* stabilità;
* team;
* obiettivi;
* priorità;
* vincoli;
* assunzioni;
* provenance.

## 8.2 Corrispondenza

TargetModel corrisponde a:

```text
EvaluationContext
+
Role Requirement Context
+
Organizational Context
```

Il TargetModel è più ampio del solo Role Requirement Model.

Può rappresentare:

```text
ruolo
+
organizzazione
+
team
+
fase
+
obiettivi
+
vincoli
```

## 8.3 Decisione

Non introdurre un nuovo Role Model che duplichi TargetModel.

Occorre invece distinguere, all’interno o sopra TargetModel:

* contesto descrittivo;
* requisiti;
* priorità;
* vincoli;
* drivers che modificano il pattern.

La futura architettura potrà prevedere viste specializzate:

```text
RoleRequirementView
OrganizationalContextView
EvaluationContextView
```

derivate dal medesimo TargetModel.

---

# 9. CapabilityProjection

## 9.1 Funzione attuale

CapabilityProjection collega:

```text
CapabilityDesign
+
TargetModel
```

e rende esplicito come la capability stabile viene configurata nel target.

Conserva:

* component projections;
* pesi;
* ruoli;
* target drivers;
* soglie;
* coverage policy;
* assumptions;
* provenance;
* tracciabilità.

## 9.2 Corrispondenza

CapabilityProjection corrisponde principalmente a:

```text
PatternConfiguration
```

e in parte a:

```text
Evaluator or Target-specific Pattern Variant
```

È il punto in cui:

* una relazione possibile diventa rilevante;
* una componente assume un peso;
* viene assegnata una soglia;
* viene dichiarata la criticità;
* viene documentata la motivazione contestuale.

## 9.3 Decisione

CapabilityProjection è già l’oggetto centrale per la configurazione dei pattern.

Non deve essere sostituita.

Dovrà essere eventualmente estesa per supportare:

* configurazioni alternative;
* regole di attivazione;
* prerequisiti;
* compensazioni;
* inibizioni;
* policy più articolate per dati mancanti;
* applicabilità contestuale.

Queste estensioni dovranno essere introdotte progressivamente e solo attraverso casi reali.

---

# 10. CapabilityDefinition

## 10.1 Funzione attuale

CapabilityDefinition contiene:

* contributi required;
* contributi optional;
* pesi;
* contribution minima;
* aggregation policy;
* coverage policy;
* thresholds;
* rationale;
* traceability.

È prodotta deterministicamente dalla CapabilityProjection.

## 10.2 Corrispondenza

CapabilityDefinition corrisponde a:

```text
Executable Evaluation Pattern
```

Non rappresenta la conoscenza stabile.

Rappresenta la configurazione che il motore può eseguire.

## 10.3 Decisione

CapabilityDefinition deve rimanere il contratto esecutivo.

Non deve assorbire:

* confini semantici;
* fonti della conoscenza;
* storia del pattern;
* maturity completa;
* casi di validazione;
* dati della persona;
* risultati.

La separazione corrente è corretta:

```text
CapabilityDesign
= significato

CapabilityProjection
= configurazione contestuale spiegabile

CapabilityDefinition
= contratto eseguibile
```

---

# 11. CapabilityContribution

## 11.1 Funzione attuale

CapabilityContribution collega un risultato di misura a una capability.

Rappresenta un contributo:

* supporting;
* contradicting;
* eventualmente neutral per compatibilità storica;
* dotato di valore;
* dotato di supporto inferenziale;
* tracciabile verso la misura.

## 11.2 Corrispondenza

CapabilityContribution corrisponde a:

```text
Dimension Input Contribution
```

oppure:

```text
Pattern Evaluation Input
```

## 11.3 Decisione

CapabilityContribution deve restare l’adapter tra:

```text
Measurement Layer
```

e:

```text
Capability/Dimension Derivation Layer
```

La futura introduzione del DimensionKnowledgeState non deve eliminare automaticamente CapabilityContribution.

Le due cose hanno responsabilità diverse:

```text
CapabilityContribution
= contributo specifico proveniente da una misura

DimensionKnowledgeState
= conoscenza cumulativa della Dimension
```

---

# 12. CapabilityContributionMatch

## 12.1 Funzione attuale

Il matching verifica quali contributi:

* soddisfano requisiti;
* sono mancanti;
* sono parzialmente soddisfatti;
* sono incompatibili;
* non appartengono alla capability;
* provengono da misure non richieste.

Calcola inoltre la coverage dei requisiti.

## 12.2 Corrispondenza

Corrisponde a:

```text
Pattern Input Resolution
```

e:

```text
Pattern Requirement Evaluation
```

## 12.3 Decisione

È un componente corretto e riutilizzabile.

Potrà essere esteso per distinguere:

* input non osservato;
* input osservato ma insufficiente;
* input contraddittorio;
* input non applicabile;
* input bloccante;
* input compensabile.

---

# 13. CapabilityAggregationContext

## 13.1 Funzione attuale

Prepara il contesto necessario all’aggregazione.

Mantiene separati:

* definition;
* match;
* contribution;
* coverage;
* limitazioni;
* informazioni esecutive.

## 13.2 Corrispondenza

Corrisponde a:

```text
PatternExecutionContext
```

## 13.3 Decisione

Deve essere riutilizzato come contesto deterministico di esecuzione.

Non deve diventare un contenitore globale della conoscenza della persona.

---

# 14. CapabilityResult

## 14.1 Funzione attuale

CapabilityResult rappresenta il risultato dell’aggregazione della capability.

Include:

* valore;
* livello;
* coverage;
* confidence o supporto;
* contributi;
* limitazioni;
* tracciabilità.

## 14.2 Corrispondenza

CapabilityResult corrisponde a:

```text
PatternEvaluationResult
```

e può alimentare:

```text
Derived Dimension Knowledge State
```

## 14.3 Distinzione necessaria

CapabilityResult non deve coincidere con DimensionKnowledgeState.

Il primo è:

```text
risultato di una singola esecuzione
```

Il secondo è:

```text
stato cumulativo e persistente della conoscenza
```

Possibile relazione futura:

```text
CapabilityResult[]
↓
DimensionKnowledgeState
```

oppure:

```text
MeasurementResult[]
+
CapabilityResult[]
↓
DimensionKnowledgeState
```

---

# 15. Elementary Dimension e Measurement

Questo è il principale punto non ancora formalizzato.

Nel sistema esistono:

```text
Measurement
MeasureResult
Capability
```

Ma non è ancora esplicita una distinzione generale tra:

```text
Elementary Dimension
```

e:

```text
Derived Dimension
```

## 15.1 Prima interpretazione possibile

Una misura potrebbe coincidere con una Dimension elementare.

Esempio:

```text
decision_accountability measure
↓
decision_accountability elementary dimension
```

## 15.2 Problema

Una MeasurementDefinition descrive:

> come osservare e calcolare un segnale.

Una DimensionDefinition descrive:

> che cosa significa semanticamente la dimensione.

Non sono necessariamente la stessa cosa.

Più Measurement possono alimentare la stessa Dimension.

Esempio:

```text
interview_decision_accountability_measure
cv_decision_accountability_measure
simulation_decision_accountability_measure
↓
decision_accountability dimension
```

## 15.3 Decisione

Non identificare automaticamente Measure e Dimension.

La relazione corretta deve essere:

```text
MeasurementDefinition
↓
produces knowledge about
↓
Dimension
```

Una Dimension elementare può essere alimentata da una o più MeasurementDefinition.

---

# 16. Derived Dimension e Capability

La corrispondenza è invece più diretta:

```text
Derived Dimension
≈
Capability
```

Una capability:

* emerge da più contributi;
* non viene misurata direttamente;
* utilizza un modello esplicito;
* è contestualizzabile;
* produce un risultato spiegabile.

Questa è esattamente la funzione di una Derived Dimension.

## 16.1 Decisione terminologica

Nel breve termine:

* mantenere `Capability` nel codice;
* usare `Derived Dimension` nei documenti teorici quando serve generalità;
* dichiarare che ogni Capability è una Derived Dimension;
* non dichiarare ancora che ogni Dimension è una Capability.

Formula:

```text
Every Capability is a Derived Dimension.

Not every Dimension must be a Capability.
```

---

# 17. DimensionKnowledgeState

Questo è il principale oggetto nuovo realmente mancante.

Deve rappresentare lo stato cumulativo relativo a una Dimension.

Struttura preliminare:

```text
DimensionKnowledgeState
  dimensionId
  dimensionType
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
  resultCount
  sourceDiversity
  contextDistribution
  contradictions
  supportingMeasurementResultRefs
  supportingCapabilityResultRefs
  derivationTrace
  updatedAt
  metadata
```

Può ricevere input da:

```text
MeasurementResult
```

quando la Dimension è elementare;

oppure da:

```text
CapabilityResult
```

quando la Dimension è derivata;

oppure da entrambi:

```text
hybrid
```

## 17.1 Responsabilità

DimensionKnowledgeState non deve:

* definire la Dimension;
* contenere il Pattern;
* descrivere il Target;
* applicare la Perspective;
* produrre fit;
* sostituire CapabilityResult;
* sostituire MeasurementResult.

---

# 18. Evaluation Pattern

Dopo la mappatura, il termine Evaluation Pattern non deve diventare subito un nuovo oggetto monolitico.

Nel sistema esistente il Pattern è distribuito correttamente su più oggetti:

```text
CapabilityDesign
= semantica stabile

CapabilityProjection
= configurazione contestuale

CapabilityDefinition
= esecuzione

CapabilityContributionMatch
= risoluzione input

CapabilityAggregationContext
= contesto di calcolo

CapabilityResult
= risultato
```

Questa separazione è più robusta di un unico file `EvaluationPattern`.

## 18.1 Decisione

`Evaluation Pattern` deve essere considerato un aggregate architetturale.

Concettualmente:

```text
EvaluationPatternAggregate
  design
  projection
  executableDefinition
  validationMetadata
  versionTrace
```

Non è necessario introdurre subito:

```text
buildEvaluationPattern()
```

---

# 19. Pattern Registry

Il Pattern Registry dovrà interrogare gli oggetti esistenti.

In una prima versione potrà registrare:

```text
CapabilityDesign
CapabilityProjection
CapabilityDefinition
```

Funzioni future:

```text
listDesigns()
getDesign()
listProjections()
getProjection()
findByCapabilityId()
findByTargetId()
compareVersions()
cloneAsDraft()
getDependencies()
getDependents()
```

## 19.1 Fonte di verità

La fonte di verità iniziale potrà essere costituita da file versionati nel repository.

Non è necessario introdurre subito un database a grafo.

---

# 20. Pattern Workspace

Il futuro Pattern Workspace dovrà lavorare sopra:

```text
CapabilityDesign
TargetModel
CapabilityProjection
CapabilityDefinition
Pattern Test Cases
```

Non dovrà modificare direttamente il codice dell’engine.

Il flusso previsto è:

```text
open validated design
↓
clone
↓
create draft
↓
modify configuration
↓
execute test cases
↓
compare results
↓
validate
↓
publish new version
```

---

# 21. Pattern Test Cases

Il repository contiene già numerosi test dedicati a:

* CapabilityDesign;
* TargetModel;
* CapabilityProjection;
* CapabilityDefinition;
* CapabilityContribution;
* CapabilityContributionMatch;
* CapabilityAggregationContext;
* CapabilityResult;
* scenari Leadership;
* confronto tra scenari;
* regression;
* health.

Questi test dimostrano che una parte della futura infrastruttura di calibrazione è già presente.

Manca però un contratto di dominio esplicito:

```text
PatternTestCase
```

Non è necessario introdurlo immediatamente.

Prima occorre progettare il DimensionKnowledgeState.

---

# 22. Neutral direction

Il Capability Core storico mantiene:

```text
neutral
```

per compatibilità.

Il nuovo Knowledge Layer ha già stabilito:

```text
assenza di effetto
=
assenza della relazione
```

Pertanto:

* CapabilityDesign non usa neutral;
* CapabilityProjection non usa neutral;
* nuovi Pattern non devono introdurre neutral;
* CapabilityDefinition può conservarlo temporaneamente;
* la compatibilità deve essere gestita nel livello esecutivo.

Non effettuare una rimozione breaking in questa fase.

---

# 23. Profondità del modello

Le precedenti decisioni indicano:

* massimo 5 componenti core;
* massimo 3 componenti opzionali;
* massimo 2 livelli sotto la capability finale;
* modello sparso;
* modello poco profondo;
* nessun nodo senza caso reale;
* nessuna relazione condizionale nella prima versione reale.

Questi limiti restano validi come guardrail iniziali.

Il futuro supporto a pattern più articolati non deve produrre immediatamente un grafo profondo e ingestibile.

---

# 24. Architettura target aggiornata

La nuova architettura non richiede un secondo Capability Engine.

La pipeline target diventa:

```text
Source
↓
Measurement
↓
Observation
↓
MeasurementResult
↓
Dimension Knowledge Update
↓
Elementary Dimension Knowledge State
↓
CapabilityContribution
↓
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
↓
Derived Dimension Knowledge State
↓
Person Knowledge Model
```

A valle:

```text
Person Knowledge Model
+
TargetModel
+
Evaluator Perspective
↓
Comparison
↓
Interpretation
↓
Report
```

---

# 25. Decisioni operative

## 25.1 Non creare ora

Non creare:

```text
src/core/knowledge/patterns/
src/core/knowledge/dimensions/
buildEvaluationPattern.js
buildDimensionDefinition.js
buildDerivedDimension.js
```

Questi elementi duplichererebbero il Capability Core.

## 25.2 Primo nuovo dominio possibile

Il primo dominio nuovo può essere limitato a:

```text
src/core/knowledgeState/
```

oppure, se si preferisce mantenere il termine Dimension:

```text
src/core/dimension/
```

La scelta definitiva del nome deve essere presa nel task implementativo.

## 25.3 Primo oggetto nuovo

Il primo contratto realmente necessario è:

```text
DimensionKnowledgeState
```

## 25.4 Adapter necessari

In futuro saranno necessari due percorsi:

```text
MeasurementResult
↓
Elementary Dimension Knowledge State
```

e:

```text
CapabilityResult
↓
Derived Dimension Knowledge State
```

Non devono essere implementati nello stesso task iniziale.

---

# 26. Sequenza implementativa aggiornata

## Task 0100B-2

### Dimension Knowledge State Contract Foundation

Introdurre soltanto:

* contratto `DimensionKnowledgeState`;
* builder;
* validator;
* tipi `elementary`, `derived`, `hybrid`;
* estimate;
* coverage;
* confidence;
* consistency;
* provenance refs;
* metadata;
* immutabilità.

Non introdurre ancora aggregazione.

---

## Task 0100B-3

### Measurement Result to Elementary Dimension State

Introdurre:

* adapter MeasurementResult → DimensionKnowledgeState;
* aggiornamento incrementale;
* deduplicazione;
* independence;
* context distribution;
* contradiction tracking.

---

## Task 0100B-4

### Capability Result to Derived Dimension State

Introdurre:

* adapter CapabilityResult → DimensionKnowledgeState;
* derivation trace;
* pattern version refs;
* configuration refs;
* gestione dei risultati multipli.

---

## Task 0100B-5

### Person Knowledge Model Foundation

Introdurre:

* collezione di DimensionKnowledgeState;
* knowledge gaps;
* contradictions;
* summaries;
* update deterministico;
* nessun ruolo;
* nessuna Perspective;
* nessun fit.

---

## Task 0100C-1

### Capability Registry Foundation

Introdurre:

* registrazione di CapabilityDesign;
* ricerca;
* filtro;
* dependency lookup;
* nessuna UI;
* nessun database;
* nessuna modifica dei contratti.

---

## Task 0100C-2

### Capability Version and Clone Foundation

Introdurre:

* clone as draft;
* derivedFrom;
* confronto di versione;
* immutabilità delle versioni validate.

---

## Task 0100C-3

### Pattern Test Case Foundation

Introdurre:

* contratto per casi di test;
* expected result;
* boundary cases;
* regression cases;
* execution harness.

---

# 27. Decisione architetturale finale

Il Capability Core non è un ramo precedente da abbandonare.

È già il primo motore concreto di derivazione delle Dimension complesse.

La nuova architettura deve quindi essere costruita così:

```text
Dimension
=
concetto generale

Capability
=
Dimension derivata e operativamente valutabile

CapabilityDesign
=
semantica stabile della Dimension derivata

CapabilityProjection
=
configurazione contestuale del Pattern

CapabilityDefinition
=
Pattern eseguibile

CapabilityResult
=
risultato di una esecuzione del Pattern

DimensionKnowledgeState
=
conoscenza cumulativa prodotta dalle esecuzioni
```

La vera estensione mancante non è un nuovo Pattern Engine.

È il livello che conserva e aggiorna nel tempo la conoscenza risultante.

```text
The Capability Core already executes patterns.

The next foundation must preserve what those patterns teach IMAGO.
```

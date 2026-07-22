# IMAGO Knowledge Architecture

## Documento architetturale canonico

**Stato:** Foundation
**Ambito:** Knowledge Model, Composition Model, Role Model, Perspective Layer
**Funzione:** fonte architetturale per i task Builder successivi alla Measurement and Observation Foundation

---

# 1. Scopo

IMAGO deve costruire nel tempo una rappresentazione verificabile, incrementale e contestuale dei segnali professionali osservati in una persona.

Il sistema non deve limitarsi a:

* raccogliere documenti;
* conservare risposte;
* produrre punteggi;
* formulare giudizi assoluti;
* classificare la persona in categorie rigide.

Il suo obiettivo è costruire un modello di conoscenza capace di distinguere:

1. ciò che è stato osservato;
2. quanto è attendibile;
3. in quali condizioni è emerso;
4. quanto è stato effettivamente esplorato;
5. come più segnali contribuiscono a caratteristiche professionali più complesse;
6. come tali caratteristiche vengono lette rispetto a un ruolo;
7. come differenti valutatori possono interpretare diversamente lo stesso modello.

La conoscenza della persona deve pertanto rimanere separata dalla sua valutazione.

---

# 2. Principio fondamentale

```text
Knowledge is not Evaluation.
```

IMAGO deve distinguere in modo rigoroso:

```text
segnale osservato
≠
caratteristica stimata
≠
requisito del ruolo
≠
interpretazione del valutatore
≠
valutazione finale
```

La stessa conoscenza può produrre interpretazioni differenti senza che i dati osservati vengano modificati.

Esempio:

Un comportamento orientato alla rapidità decisionale può essere considerato:

* un elemento positivo da un CEO;
* un elemento da verificare da un responsabile qualità;
* un possibile rischio da un valutatore operante in un ambiente altamente regolamentato.

L’Observation rimane la stessa.

Cambia l’Interpretation.

---

# 3. Architettura semantica generale

La pipeline concettuale di IMAGO è:

```text
Source
  ↓
Measurement
  ↓
Observation
  ↓
MeasurementResult
  ↓
Elementary Knowledge State
  ↓
Composite Knowledge Pattern
  ↓
Person Knowledge Model
  ↓
Role Requirement Model
  ↓
Evaluator Perspective Model
  ↓
Interpretation and Comparison
  ↓
Report Views
```

Ogni livello deve avere responsabilità distinte.

Nessun livello deve anticipare responsabilità appartenenti a quello successivo.

---

# 4. Source Layer

Una Source è un’origine informativa.

Esempi:

* curriculum;
* profilo LinkedIn;
* lettera di presentazione;
* risposta a una domanda;
* intervista completa;
* documento professionale;
* portfolio;
* feedback esterno;
* descrizione personale;
* informazione strutturata;
* aggiornamento fornito dall’utente.

La Source deve essere conservata separatamente dagli oggetti derivati.

Le Observation e i Knowledge State devono contenere riferimenti alla Source, non copie integrali del contenuto.

## 4.1 Principi di conservazione

Il sistema deve evitare:

* duplicazione del curriculum;
* duplicazione delle trascrizioni;
* inserimento del testo completo nelle Observation;
* proliferazione di copie della stessa evidenza;
* utilizzo di dati non necessari alla ricostruzione del segnale.

Il riferimento alla fonte deve consentire, quando autorizzato, la tracciabilità dell’informazione.

---

# 5. Measurement Layer

Una Measurement rappresenta un’esplorazione delimitata.

Esempi:

* analisi di un curriculum;
* analisi di una singola risposta;
* analisi di un’intervista completa;
* analisi di un profilo LinkedIn;
* analisi di una presentazione professionale;
* analisi di un documento;
* analisi di una simulazione.

Una Measurement definisce il perimetro entro il quale le Observation vengono raccolte e normalizzate.

## 5.1 Perché la Measurement è necessaria

Le Observation non possono essere aggregate direttamente.

Senza la Measurement, una persona che fornisce:

* più documenti;
* più risposte;
* più trascrizioni;
* più descrizioni dello stesso evento;

potrebbe ricevere artificialmente una quantità maggiore di evidenza.

La Measurement impedisce che la quantità di materiale venga confusa con la forza della conoscenza.

## 5.2 Unità di normalizzazione

Ogni Measurement deve produrre un proprio MeasurementResult.

Il risultato di una singola intervista e quello di un singolo curriculum devono essere comparabili come contributi informativi, senza che il primo prevalga automaticamente perché contiene più parole o più Observation.

---

# 6. Observation Layer

Una Observation è il segnale atomico estratto da una Measurement.

Non è ancora:

* un giudizio;
* una caratteristica della persona;
* una valutazione;
* una diagnosi;
* una classificazione definitiva;
* una prova assoluta.

Una Observation deve indicare almeno:

```text
observationId
measurementId
characteristicId
signalType
direction
strength
confidence
evidenceQuality
sourceReliability
context
locationRef
independenceGroup
evidenceFingerprint
metadata
```

## 6.1 Direction

La direzione del segnale deve essere distinta dalla sua forza.

Possibili rappresentazioni:

```text
positive
negative
neutral
mixed
not_observed
```

Il sistema non deve confondere:

```text
not_observed
absent
negative
contradicted
```

## 6.2 Strength

La forza indica quanto chiaramente il segnale è presente nell’evidenza analizzata.

Non rappresenta ancora quanto la caratteristica appartenga alla persona nel suo complesso.

## 6.3 Confidence

La confidence indica quanto il sistema ritiene affidabile la propria lettura dell’evidenza.

Non deve essere utilizzata come sinonimo di:

* forza;
* qualità della fonte;
* copertura;
* rilevanza;
* valore professionale.

## 6.4 Context

Ogni Observation dovrebbe poter conservare il contesto di manifestazione.

Esempi:

```text
under_pressure
familiar_operational_context
high_ambiguity
team_coordination
individual_execution
technical_discussion
conflict_situation
career_transition
strategic_reasoning
```

La stessa caratteristica può emergere diversamente in contesti differenti.

---

# 7. MeasurementResult Layer

Il MeasurementResult rappresenta il risultato normalizzato di una singola Measurement.

Deve mantenere separati almeno:

```text
normalizedValue
direction
coverage
confidence
sourceReliability
evidenceQuality
independence
consistency
observationCount
independentObservationCount
contextCoverage
metadata
```

## 7.1 Significato del normalizedValue

Il normalizedValue è una rappresentazione interna del segnale prodotto dalla Measurement.

Non è:

* una valutazione della persona;
* un punteggio professionale;
* un ranking;
* un indice di employability;
* un giudizio del recruiter;
* una misura psicometrica;
* un risultato da mostrare automaticamente all’utente.

Il normalizedValue può essere utilizzato come elemento matematico interno, purché non venga interpretato come verità assoluta.

## 7.2 Deduplicazione

Observation equivalenti o dipendenti non devono incrementare artificialmente il MeasurementResult.

La deduplicazione può utilizzare:

```text
sourceRef
locationRef
characteristicId
signalType
evidenceFingerprint
independenceGroup
```

La ripetizione dello stesso concetto nella medesima fonte può rafforzare la coerenza interna, ma non deve essere trattata come evidenza indipendente.

---

# 8. Caratteristiche elementari

Una Elementary Characteristic è una dimensione considerata sufficientemente atomica per gli obiettivi di IMAGO.

Il termine “elementare” non significa indivisibile in assoluto.

Significa:

> al di sotto di questa dimensione, un’ulteriore decomposizione non produrrebbe un vantaggio utile, interpretabile o gestibile per il sistema.

Esempi indicativi:

* riconoscimento dei vincoli;
* assunzione di responsabilità;
* chiarezza causale;
* capacità di prioritizzazione;
* orientamento al risultato;
* iniziativa;
* esplicitazione delle decisioni;
* capacità di apprendimento dall’esperienza;
* gestione dell’incertezza;
* riconoscimento dell’impatto sugli altri.

Questi esempi non costituiscono ancora una tassonomia definitiva.

## 8.1 Elementary Characteristic Definition

Ogni definizione dovrebbe includere:

```text
id
name
description
boundaries
positiveSignals
negativeSignals
contradictorySignals
excludedMeanings
typicalContexts
measurementHints
version
metadata
```

## 8.2 Boundaries

Ogni caratteristica deve dichiarare cosa include e cosa non include.

Questo serve a evitare sovrapposizioni semantiche.

Esempio:

```text
initiative
```

non deve essere automaticamente confusa con:

```text
risk taking
autonomy
leadership
speed
creativity
```

Una persona può mostrare iniziativa senza assumere rischi elevati o coordinare altre persone.

---

# 9. Elementary Knowledge State

L’Elementary Knowledge State rappresenta ciò che IMAGO conosce attualmente rispetto a una caratteristica elementare.

Non deve contenere soltanto un valore.

Struttura concettuale:

```text
ElementaryKnowledgeState
  characteristicId
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
  observationCount
  independentObservationCount
  sourceDiversity
  contextDistribution
  recency
  contradictions
  supportingMeasurementRefs
  metadata
```

## 9.1 Estimate

L’estimate rappresenta la migliore sintesi corrente delle Measurement disponibili.

Deve essere distinto da:

* confidence;
* coverage;
* consistency;
* quantità di evidenza.

## 9.2 Coverage

La coverage indica quanto la caratteristica sia stata esplorata.

Un valore apparentemente forte con coverage bassa non equivale a una conoscenza consolidata.

## 9.3 Confidence

La confidence rappresenta la fiducia complessiva nella sintesi corrente.

Può dipendere da:

* qualità delle evidenze;
* affidabilità delle fonti;
* indipendenza delle Measurement;
* coerenza;
* varietà dei contesti;
* chiarezza dei segnali.

## 9.4 Consistency

La consistency indica quanto i diversi risultati risultino compatibili tra loro.

Una bassa consistency non implica necessariamente che una caratteristica sia assente.

Può indicare:

* comportamento contestuale;
* evoluzione nel tempo;
* fonti non equivalenti;
* situazioni diverse;
* autorappresentazione non allineata;
* dati ancora insufficienti.

## 9.5 Source Diversity

La varietà delle fonti deve essere conservata.

Esempio:

```text
CV
Interview
LinkedIn
External feedback
Portfolio
```

Più fonti indipendenti possono rafforzare la conoscenza.

La ripetizione su fonti derivate dalla stessa origine non deve essere trattata come piena indipendenza.

## 9.6 Context Distribution

Il sistema deve conservare in quali condizioni una caratteristica è emersa.

Esempio:

```text
initiative:
  familiar_context: strong
  ambiguous_context: insufficiently_observed
  pressure_context: mixed
```

Questo è più informativo di un singolo valore medio.

---

# 10. Caratteristiche composte

Una Composite Characteristic è una configurazione di caratteristiche elementari o di altre caratteristiche composte.

Esempi indicativi:

* leadership;
* accountability;
* professional maturity;
* decision making;
* adaptability;
* strategic orientation;
* execution reliability;
* stakeholder management.

Una caratteristica composta non deve essere trattata come una semplice etichetta.

Deve essere definita da un pattern esplicito.

---

# 11. Composite Knowledge Pattern

Il Composite Knowledge Pattern rappresenta la struttura con cui una caratteristica composta viene costruita.

Esempio concettuale:

```text
Leadership
  core:
    ownership
    decision_clarity
  supporting:
    initiative
    coordination
    influence
  contextual:
    ambiguity_management
    conflict_management
  inhibiting:
    responsibility_avoidance
    decision_deflection
```

## 11.1 Numero limitato di componenti

Il pattern non deve includere tutte le dimensioni teoricamente correlate.

Deve contenere un numero ingegneristicamente rilevante di componenti.

Il numero deve essere:

* sufficiente a descrivere il costrutto;
* limitato per evitare modelli ingestibili;
* interpretabile;
* calibrabile;
* testabile;
* versionabile.

IMAGO non deve costruire una tassonomia enciclopedica.

Deve costruire pattern utili.

## 11.2 Tipi di componente

Le componenti possono assumere ruoli differenti:

```text
core
required
supporting
contextual
compensatory
inhibiting
contradictory
```

### Core

Componente centrale per il significato della caratteristica.

### Required

Componente la cui assenza osservata compromette fortemente la caratteristica.

### Supporting

Componente che rafforza la configurazione senza essere sempre necessaria.

### Contextual

Componente rilevante solo in specifici ruoli o contesti.

### Compensatory

Componente che può compensare parzialmente una debolezza in un’altra dimensione.

### Inhibiting

Componente che riduce la credibilità o la stabilità del pattern.

### Contradictory

Segnale incompatibile con una lettura semplice della caratteristica e che richiede approfondimento.

---

# 12. Relazioni tra componenti

Il valore del modello IMAGO non risiede soltanto nell’elenco delle caratteristiche.

Risiede soprattutto nella definizione delle relazioni tra esse.

Le relazioni possono includere:

* pesi;
* soglie;
* prerequisiti;
* dipendenze;
* compensazioni;
* inibizioni;
* configurazioni alternative;
* co-occorrenze;
* condizioni contestuali;
* regole di sufficienza;
* regole di insufficienza;
* regole di contraddizione.

## 12.1 Modello non esclusivamente lineare

Una caratteristica composta non deve necessariamente essere calcolata come:

```text
A × peso
+ B × peso
+ C × peso
```

Può richiedere regole più articolate.

Esempio:

```text
Leadership plausibile se:

ownership supera la soglia minima

AND

è presente almeno uno tra:
- coordination
- influence
- decision making

AND

non sono presenti segnali forti di responsibility avoidance
```

Un’altra configurazione di leadership potrebbe emergere attraverso una combinazione diversa.

Il pattern deve poter rappresentare configurazioni alternative valide.

## 12.2 Pattern polimorfi

La stessa caratteristica composta può avere più modalità credibili di manifestazione.

Esempio:

```text
Leadership operativa
Leadership tecnica
Leadership relazionale
Leadership strategica
```

Queste varianti non devono necessariamente diventare caratteristiche totalmente separate.

Possono essere configurazioni differenti dello stesso dominio, purché restino interpretabili.

---

# 13. Composite Knowledge State

Il Composite Knowledge State rappresenta la sintesi derivata dall’applicazione di un Composite Knowledge Pattern.

Deve indicare almeno:

```text
characteristicId
patternId
patternVersion
estimate
coverage
confidence
consistency
satisfiedComponents
missingComponents
notObservedComponents
inhibitingComponents
contradictions
activeConfiguration
contextApplicability
supportingStateRefs
metadata
```

## 13.1 Mancanza di informazioni

Una componente non osservata non deve essere trattata automaticamente come negativa.

Deve produrre principalmente:

* riduzione della coverage;
* riduzione della confidence;
* segnalazione di incompletezza;
* eventuale raccomandazione di esplorazione.

## 13.2 Assenza osservata

L’assenza osservata deve essere distinta dalla mancanza di osservazione.

Può indicare che:

* la componente è stata esplorata;
* non sono emersi i segnali attesi;
* sono emersi segnali contrari;
* l’evidenza è sufficiente per una lettura prudente.

---

# 14. Person Knowledge Model

Il Person Knowledge Model è la rappresentazione materiale e aggiornata della conoscenza relativa alla persona.

Contiene:

```text
PersonKnowledgeModel
  elementaryStates
  compositeStates
  sourceSummary
  measurementSummary
  contextSummary
  temporalSummary
  unresolvedContradictions
  knowledgeGaps
  modelVersion
  updatedAt
  metadata
```

Il Person Knowledge Model non deve contenere una valutazione assoluta della persona.

Non deve stabilire:

* quanto la persona vale;
* se sia brava o incapace;
* se sia migliore di altre;
* se debba essere assunta;
* se sia adatta a qualsiasi ruolo.

Deve rappresentare:

* cosa è emerso;
* quanto è stato esplorato;
* quanto è credibile;
* dove esistono contraddizioni;
* in quali contesti i segnali risultano visibili;
* quali aspetti restano da osservare.

---

# 15. Materialized Knowledge

Il Person Knowledge Model costituisce una vista materializzata della conoscenza corrente.

L’applicazione non dovrebbe ricostruire tutto il modello da zero a ogni utilizzo.

Il sistema dovrebbe supportare aggiornamenti incrementali:

```text
new Measurement
  ↓
new MeasurementResult
  ↓
affected Elementary States
  ↓
affected Composite States
  ↓
updated Person Knowledge Model
```

Le Measurement precedenti devono rimanere disponibili per:

* audit;
* spiegabilità;
* ricostruzione;
* gestione degli errori;
* versionamento;
* confronto temporale.

---

# 16. Evoluzione temporale

Il modello deve poter distinguere tra:

* nuova evidenza;
* evidenza più recente;
* evidenza storica;
* cambiamento stabile;
* differenza contestuale;
* contraddizione;
* possibile evoluzione della persona.

La recency non deve cancellare automaticamente l’informazione storica.

Può modificarne la rilevanza.

Esempio:

Una competenza osservata cinque anni prima e non più utilizzata non è necessariamente assente, ma può avere:

* freshness più bassa;
* confidence attuale più bassa;
* necessità di nuova verifica.

---

# 17. Role Requirement Model

Il Role Requirement Model descrive la configurazione di caratteristiche richiesta o rilevante per un ruolo.

È distinto dal Person Knowledge Model.

Può contenere:

```text
RoleRequirementModel
  roleId
  roleFamily
  elementaryRequirements
  compositeRequirements
  requiredLevels
  minimumCoverageExpectations
  criticalCharacteristics
  preferredCharacteristics
  contextualRequirements
  riskSensitivity
  patternOverrides
  version
  metadata
```

## 17.1 Requisiti del ruolo

Il modello deve distinguere:

```text
required
important
preferred
contextual
irrelevant
risk_sensitive
```

Non tutte le caratteristiche hanno la stessa rilevanza per tutti i ruoli.

## 17.2 Pattern specifici del ruolo

Una caratteristica generale può essere particolarizzata per uno specifico ruolo.

Esempio:

La Leadership richiesta a un responsabile operativo può attribuire più rilevanza a:

* coordinamento;
* affidabilità esecutiva;
* gestione delle priorità;
* assunzione di responsabilità.

La Leadership richiesta a un CTO può attribuire più rilevanza a:

* decisione tecnica;
* visione;
* gestione dell’incertezza;
* influenza su specialisti;
* trade-off tecnologici.

La struttura generale rimane riconoscibile.

Il pattern applicativo può variare.

---

# 18. Evaluator Perspective Model

L’Evaluator Perspective Model rappresenta il modo in cui un valutatore interpreta il ruolo e legge i segnali della persona.

Esempi:

* recruiter;
* HR;
* CEO;
* CTO;
* responsabile operativo;
* hiring manager;
* career coach;
* cliente;
* investitore;
* commissione interna.

Può contenere:

```text
EvaluatorPerspectiveModel
  perspectiveId
  evaluatorType
  characteristicWeights
  evidencePreferences
  riskTolerance
  ambiguityTolerance
  visibilityExpectations
  interpretationRules
  roleRequirementAdjustments
  version
  metadata
```

## 18.1 La prospettiva non modifica la conoscenza

La Perspective non deve riscrivere:

* Observation;
* MeasurementResult;
* Elementary Knowledge State;
* Composite Knowledge State.

Deve operare sopra il modello di conoscenza.

## 18.2 Preferenze di evidenza

Differenti valutatori possono attribuire diversa credibilità a differenti forme di evidenza.

Esempio:

Un responsabile tecnico potrebbe privilegiare:

* esempi concreti;
* decisioni;
* trade-off;
* risultati misurabili.

Un recruiter potrebbe essere maggiormente sensibile a:

* chiarezza narrativa;
* coerenza;
* motivazione;
* comprensibilità del percorso;
* trasferibilità delle competenze.

La fonte non cambia.

Cambia il peso interpretativo che il valutatore le attribuisce.

---

# 19. Separazione fra Role Model e Perspective Model

Il requisito del ruolo e la prospettiva del valutatore non sono la stessa cosa.

La valutazione completa deriva da:

```text
Person Knowledge Model

compared with

Role Requirement Model

interpreted through

Evaluator Perspective Model
```

Questa separazione è necessaria perché due valutatori possono leggere diversamente lo stesso ruolo.

Esempio:

Per un Operations Manager:

* il ruolo può richiedere leadership, affidabilità e gestione delle priorità;
* HR può concentrarsi su comunicazione e maturità;
* il direttore di stabilimento può concentrarsi su continuità operativa e decisione;
* il CEO può concentrarsi su ownership e scalabilità.

---

# 20. Interpretation Layer

L’Interpretation Layer produce una lettura contestuale.

Può generare:

```text
alignment
distance
credibility
visibility
visibilityGap
coverageAdequacy
uncertainty
criticalMismatch
transferability
developmentPotential
riskAreas
explorationNeeds
```

## 20.1 Nessun punteggio unico obbligatorio

Il sistema non deve essere costruito attorno a un singolo punteggio finale.

Un valore sintetico può esistere per esigenze applicative, ma non deve sostituire la struttura informativa.

Un risultato utile dovrebbe spiegare:

* dove esiste allineamento;
* dove esiste distanza;
* quale evidenza sostiene la lettura;
* quanto è completa l’esplorazione;
* quali segnali sono visibili;
* quali segnali esistono ma non risultano comunicati;
* cosa deve essere verificato;
* come cambia la lettura secondo la prospettiva.

---

# 21. Visibility Model

IMAGO deve distinguere tra:

```text
characteristic knowledge
```

e:

```text
characteristic visibility
```

Una persona può possedere evidenze credibili di una caratteristica senza riuscire a renderla visibile in:

* curriculum;
* LinkedIn;
* colloquio;
* presentazione;
* risposta a una domanda;
* negoziazione.

Il Visibility Model può essere rappresentato per canale:

```text
CV
LinkedIn
Interview
Portfolio
External Feedback
Self Description
```

Questa distinzione consente di misurare il divario tra:

* ciò che sembra emergere dalla conoscenza complessiva;
* ciò che arriva effettivamente al valutatore.

Questo divario costituisce uno degli ambiti centrali di valore di IMAGO.

---

# 22. Comparison Model

Il confronto deve operare su valori normalizzati e strutture compatibili.

Non deve confrontare direttamente:

* numero di Observation;
* quantità di testo;
* lunghezza delle risposte;
* numero di documenti;
* numero totale di fonti.

Il confronto deve utilizzare stati normalizzati che conservino separatamente:

* estimate;
* coverage;
* confidence;
* reliability;
* consistency;
* context;
* visibility.

## 22.1 Esempio concettuale

```text
Person:
ownership
  estimate: strong
  coverage: medium
  confidence: high
  visibility_interview: low

Role:
ownership
  requirement: high
  criticality: required

Perspective:
CEO
  weight: very_high
  evidence_preference: concrete_decisions
```

Interpretazione possibile:

> Il modello contiene segnali credibili di ownership, ma il candidato li rende poco visibili durante il colloquio. Per un CEO questa debolezza comunicativa può ridurre sensibilmente la percezione di adeguatezza, pur non indicando necessariamente assenza della caratteristica.

---

# 23. Knowledge Gaps

Il modello deve rappresentare esplicitamente ciò che non conosce.

Un Knowledge Gap può derivare da:

* caratteristica mai esplorata;
* coverage insufficiente;
* fonti dipendenti;
* segnali contraddittori;
* contesti troppo limitati;
* evidenza troppo vecchia;
* bassa affidabilità;
* differenze tra autorappresentazione ed evidenza;
* impossibilità di distinguere fra più interpretazioni.

I Knowledge Gap devono poter alimentare:

* future domande;
* follow-up;
* nuove Measurement;
* raccomandazioni di esplorazione;
* avvisi di incertezza nel report.

---

# 24. Principi di spiegabilità

Ogni stato derivato deve poter essere ricondotto a:

```text
Composite State
  ↓
Elementary States
  ↓
MeasurementResults
  ↓
Observations
  ↓
Source references
```

Il sistema deve poter spiegare:

* quali componenti hanno contribuito;
* quali relazioni sono state applicate;
* quale versione del pattern è stata utilizzata;
* quali informazioni mancavano;
* quali fattori hanno ridotto la confidence;
* quali segnali erano contraddittori.

La spiegabilità non richiede necessariamente di mostrare all’utente tutti i dettagli tecnici.

Richiede che il sistema possa ricostruirli.

---

# 25. Versionamento

Devono essere versionati almeno:

* Elementary Characteristic Definitions;
* Composite Knowledge Patterns;
* Role Requirement Models;
* Evaluator Perspective Models;
* regole di normalizzazione;
* regole di confronto.

Una modifica del pattern non deve rendere incomprensibili i risultati storici.

Ogni stato derivato deve indicare la versione utilizzata.

Esempio:

```text
patternId: leadership_general
patternVersion: 1.2
```

---

# 26. Valore proprietario del modello

Il valore strategico di IMAGO non risiede principalmente:

* nella quantità di documenti raccolti;
* nella quantità di trascrizioni;
* nell’utilizzo di un determinato modello linguistico;
* nel semplice calcolo di punteggi;
* nella sola interfaccia di intervista.

Il patrimonio potenzialmente distintivo risiede in:

1. definizione delle caratteristiche elementari;
2. confini semantici tra le caratteristiche;
3. pattern di composizione delle caratteristiche complesse;
4. relazioni tra componenti;
5. regole di sufficienza, compensazione e inibizione;
6. varianti contestuali e professionali;
7. modelli di ruolo;
8. prospettive dei valutatori;
9. gestione della conoscenza incompleta;
10. confronto tra conoscenza, visibilità e percezione.

Questi elementi devono essere trattati come oggetti versionati, verificabili e progressivamente migliorabili.

---

# 27. Privacy e minimizzazione

Il Knowledge Model deve rispettare il principio di minimizzazione.

Non deve contenere informazioni non necessarie alla funzione del sistema.

Deve evitare:

* duplicazione delle fonti;
* conservazione indiscriminata di trascrizioni;
* dati personali irrilevanti;
* inferenze non supportate;
* etichette sensibili;
* interpretazioni assolute sulla persona.

Le caratteristiche devono essere formulate in termini professionali e osservabili.

Il sistema non deve trasformarsi in uno strumento di profilazione psicologica generale.

---

# 28. Guardrail semantici

IMAGO deve rispettare stabilmente i seguenti principi:

```text
not_observed ≠ absent
absent ≠ negative
signal ≠ characteristic
characteristic ≠ identity
knowledge ≠ judgement
role fit ≠ human value
confidence ≠ certainty
quantity ≠ reliability
repetition ≠ independence
visibility ≠ possession
```

Il linguaggio prodotto dal sistema deve essere:

* non giudicante;
* contestuale;
* verificabile;
* prudente;
* orientato alle evidenze;
* consapevole dell’incertezza.

---

# 29. Non-obiettivi della fase foundation

Questa architettura non autorizza ancora l’implementazione immediata di:

* tassonomia completa delle caratteristiche;
* modello psicometrico;
* scoring universale;
* ranking dei candidati;
* machine learning sui pattern;
* adattamento automatico dei pesi;
* modelli statistici proprietari;
* inferenze da dati biometrici;
* profilazione clinica o psicologica;
* database centralizzato;
* event sourcing completo;
* embedding o vector database;
* Perspective Layer produttivo;
* Comparison Engine definitivo;
* UI del Knowledge Model.

Questi elementi potranno essere valutati solo attraverso task separati.

---

# 30. Sequenza implementativa raccomandata

## Task 0100B-2

### Elementary Characteristic Foundation

Obiettivi:

* contratto della caratteristica elementare;
* validator;
* boundaries;
* signal references;
* versionamento;
* nessuna tassonomia estesa;
* nessun KnowledgeState globale.

---

## Task 0100B-3

### Elementary Knowledge State Foundation

Obiettivi:

* aggregazione incrementale dei MeasurementResult;
* estimate;
* coverage;
* confidence;
* consistency;
* independence;
* source diversity;
* context distribution;
* tracciabilità.

---

## Task 0100B-4

### Composite Knowledge Pattern Foundation

Obiettivi:

* definizione dei pattern;
* component roles;
* pesi;
* soglie;
* prerequisiti;
* compensazioni;
* inibizioni;
* configurazioni alternative;
* versionamento.

---

## Task 0100B-5

### Composite Knowledge State Evaluation

Obiettivi:

* applicazione deterministica dei pattern;
* stato composto;
* componenti soddisfatte;
* componenti mancanti;
* componenti non osservate;
* contraddizioni;
* explanation trace.

---

## Task 0100B-6

### Person Knowledge Model Foundation

Obiettivi:

* vista materializzata;
* aggiornamento incrementale;
* knowledge gaps;
* unresolved contradictions;
* riepilogo fonti e Measurement;
* nessuna valutazione di ruolo.

---

## Task 0100C-1

### Role Requirement Model Foundation

Obiettivi:

* struttura del ruolo;
* requisiti elementari e composti;
* criticality;
* livelli richiesti;
* pattern overrides;
* versionamento.

---

## Task 0100C-2

### Evaluator Perspective Foundation

Obiettivi:

* prospettiva HR, recruiter, manager, CEO, CTO;
* pesi interpretativi;
* evidenze preferite;
* tolleranza all’incertezza;
* nessuna modifica al Person Knowledge Model.

---

## Task 0100C-3

### Interpretation and Comparison Foundation

Obiettivi:

* confronto Person Model / Role Model;
* applicazione Perspective;
* alignment;
* distance;
* visibility gap;
* uncertainty;
* explanation trace;
* nessun ranking globale.

---

# 31. Regola per i task Builder futuri

Ogni task Builder relativo alla conoscenza deve dichiarare esplicitamente:

1. quale livello dell’architettura modifica;
2. quali livelli non deve modificare;
3. quali contratti utilizza;
4. quali responsabilità non deve anticipare;
5. quali proprietà devono rimanere separate;
6. come viene preservata la compatibilità;
7. quali test verificano i guardrail semantici.

Ogni implementazione deve mantenere la separazione:

```text
Observation
MeasurementResult
Knowledge
Role
Perspective
Interpretation
Report
```

Nessun task deve comprimere questi livelli in un unico oggetto o punteggio.

---

# 32. Decisione architetturale finale

IMAGO deve essere costruito come un sistema di conoscenza professionale stratificato.

La conoscenza della persona deriva da evidenze osservabili e normalizzate.

Le caratteristiche complesse derivano da pattern espliciti e versionati.

Il ruolo definisce ciò che è richiesto.

Il valutatore definisce come ciò che è richiesto viene interpretato.

La valutazione nasce dal confronto tra questi modelli.

Il report è soltanto una vista finale di questo processo.

```text
Evidence builds Knowledge.

Patterns organize Knowledge.

Roles define Relevance.

Perspectives shape Interpretation.

Comparison produces Evaluation.

Reports communicate the Result.
```

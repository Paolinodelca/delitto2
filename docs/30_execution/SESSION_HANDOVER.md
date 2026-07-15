# SESSION_HANDOVER — 2026-07-15

## Stato generale

È stata completata una milestone centrale del Core IMAGO.

Dopo la costruzione dell’infrastruttura generica di Measurement, Capability, Target e Projection, è stata realizzata e validata la prima catena reale di conoscenza ed esecuzione:

```text
LeadershipCapabilityDesign
+
PlantManagerTransformationTargetModel
↓
PlantManagerLeadershipCapabilityProjection
↓
CapabilityDefinition
+
CapabilityContribution[]
↓
CapabilityContributionMatch
↓
CapabilityAggregationContext
↓
CapabilityResult
```

È stato inoltre completato il primo collegamento deterministico reale tra Measurement Core e Capability Core:

```text
DecisionAccountabilityObservation
↓
DecisionAccountabilityMeasureResult
↓
DecisionAccountabilityLeadershipContribution
↓
Leadership CapabilityResult
```

Il bridge è ora protetto da health check e regression dedicati.

Tutti i test previsti fino al Task 0097 risultano PASS.

---

# Builder Task completati

## Knowledge e target reali

Completati:

* Task 0090 — Leadership Capability Design v0.1
* Task 0090B — Leadership Capability Design Semantic Refinement
* Task 0091 — Plant Manager Transformation Target Model v0.1
* Task 0092 — Plant Manager Leadership Capability Projection v0.1

## Validazione della capability

Completati:

* Task 0093 — Plant Manager Leadership Demo Result v0.1
* Task 0094 — Plant Manager Leadership Scenario Comparison v0.1

## Prima measurement specialistica e bridge

Completati:

* Task 0095 — Decision Accountability Measurement Foundation v0.1
* Task 0096 — Decision Accountability Measure to Leadership Contribution v0.1
* Task 0097 — Measurement to Capability Bridge Health and Regression

---

# 1. Leadership Capability Design

È stata introdotta la prima capability reale:

```text
leadership
```

La versione semanticamente raffinata contiene sette componenti.

## Core

```text
collective_direction
people_mobilization
decision_accountability
execution_through_others
```

## Optional

```text
people_development
organizational_influence
direction_under_uncertainty
```

La distinzione è importante:

* i componenti core appartengono al modello minimo della manifestazione di Leadership;
* i componenti optional ne qualificano maturità, ampiezza e trasferibilità;
* `people_development` non è considerata condizione necessaria per riconoscere una manifestazione minima di Leadership;
* `management_scope` resta una measurement e non coincide con Leadership.

Tutti i componenti ammettono esclusivamente:

```text
supporting
contradicting
```

Non è stata introdotta una direction `neutral`.

Nel Knowledge Layer:

```text
assenza di relazione
=
assenza di effetto
```

---

# 2. Plant Manager Transformation Target Model

È stato introdotto il primo target reale:

```text
Plant Manager
+
corporate industrial organization
+
transformation phase
+
large multi-layer production workforce
```

Il target descrive:

* ruolo;
* seniority;
* responsabilità e autorità;
* struttura organizzativa;
* governance;
* cultura;
* fase di trasformazione;
* team context;
* obiettivi;
* priorità;
* vincoli;
* assunzioni.

Il target non contiene:

* pesi di capability;
* contribution;
* fit;
* risultati;
* dati candidato.

---

# 3. Leadership Projection

È stata costruita la prima projection reale:

```text
LeadershipCapabilityDesign
+
PlantManagerTransformationTargetModel
↓
PlantManagerLeadershipCapabilityProjection
```

Tutti i sette componenti sono attivi.

## Pesi core

```text
collective_direction       0.20
people_mobilization        0.18
decision_accountability    0.20
execution_through_others   0.20
```

Totale core:

```text
0.78
```

## Pesi optional

```text
people_development           0.08
organizational_influence     0.07
direction_under_uncertainty  0.07
```

Totale optional:

```text
0.22
```

Totale complessivo:

```text
1.00
```

La policy mantiene:

```text
normalizeWeights: true
```

Nella configurazione attuale non modifica i valori, perché i pesi sommano già a `1`.

Rimane una policy utile per scenari futuri con componenti esclusi o non disponibili.

Ogni peso è collegato a `TargetDriver` espliciti e tracciabili.

---

# 4. Leadership Demo Result

È stato prodotto il primo `CapabilityResult` reale per Leadership.

Il profilo dimostrativo rappresenta:

* direzione collettiva solida;
* mobilitazione positiva;
* responsabilità decisionale elevata;
* forte execution through others;
* people development discreta;
* limite circoscritto nell’influenza organizzativa;
* buona direzione nell’incertezza.

Il risultato distingue:

```text
strength
inferenceSupport
coverage
manifestationStatus
```

Questi concetti non vengono fusi in un unico punteggio.

La presenza di una contribution contraddittoria non annulla automaticamente il risultato complessivo.

---

# 5. Scenario Comparison

La stessa `CapabilityDefinition` è stata utilizzata per tre profili ipotetici:

```text
strong
emerging
weak_contradicted
```

La comparison ha dimostrato che il Core distingue:

## Strong

```text
Leadership forte
copertura completa
supporto inferenziale elevato
contraddizione circoscritta
```

## Emerging

```text
Leadership parziale o emergente
copertura incompleta
alcuni requirement mancanti o parzialmente soddisfatti
```

## Weak / Contradicted

```text
copertura completa
evidenza prevalentemente contraddittoria
strength netta nulla
supporto inferenziale comunque significativo
```

Questa distinzione consolida il principio:

```text
non osservato
≠
contraddetto
```

Un risultato può essere debole perché mancano evidenze oppure perché esistono evidenze contrarie. Sono situazioni diverse.

---

# 6. Decision Accountability Measurement Module

È stato introdotto il primo modulo specialistico di measurement:

```text
src/core/measurement/decisionAccountability/
```

La pipeline è:

```text
DecisionAccountabilityObservation
↓
DecisionAccountabilityMeasureDefinition
↓
DecisionAccountabilityMeasureResult
```

`decision_accountability` misura:

> quanto le evidenze osservate sostengono una manifestazione continuativa di responsabilità effettiva per decisioni che producono conseguenze su persone, risorse, attività o risultati collettivi.

Non misura:

* qualità della decisione;
* rapidità;
* strategic judgment;
* propensione al rischio;
* successo generale;
* semplice partecipazione alla decisione.

## Fattori v0.1

```text
decisionAuthority
consequenceScope
accountabilityEvidence
responsibilityContinuity
```

## Pesi

```text
decisionAuthority          0.30
consequenceScope           0.25
accountabilityEvidence     0.25
responsibilityContinuity   0.20
```

## Benchmark iniziale

```text
responsibilityContinuityMonths = 24
```

Il benchmark è una hypothesis progettuale, non un valore empiricamente validato.

---

# 7. Risultato demo Decision Accountability

L’observation forte produce:

```text
score = 0.9625
band = very_strong
```

Il supporto inferenziale produce:

```text
inferenceSupport.value = 0.8675
inferenceSupport.band = very_high
```

Il sistema mantiene separati:

```text
strength
≠
inference support
```

È stato verificato che lo stesso score possa restare elevato anche con inference support basso.

Il sistema non abbassa artificialmente la forza osservata per compensare la debolezza delle evidenze.

---

# 8. Semantica not_observed

È stata corretta una criticità importante.

In precedenza i valori categoriali di default potevano produrre:

```text
not_observed
score = 0.075
```

Ora:

```text
resultStatus = not_observed
score = 0
band = not_supported
```

L’assenza di osservazione non genera quindi alcun piccolo contributo positivo accidentale.

Inoltre:

```text
not_observed
```

non viene trasformato in:

```text
contradicting
```

---

# 9. Measurement → Capability Adapter

È stato introdotto:

```text
buildDecisionAccountabilityLeadershipContribution()
```

L’adapter costituisce il confine fra:

```text
Measurement Layer
e
Capability Layer
```

La measurement non conosce:

* Leadership;
* TargetModel;
* CapabilityProjection;
* peso del requirement;
* fit.

L’adapter conosce:

* il `MeasureResult`;
* la projection;
* la destinazione della contribution.

Pipeline:

```text
DecisionAccountabilityMeasureResult
↓
Decision Accountability → Leadership Adapter
↓
CapabilityContribution
```

---

# 10. Decisione anti-doppia-ponderazione

La pipeline reale del Capability Core è:

```text
measureScore
× contribution.relevance
× requirementWeight
```

Per evitare che il peso della projection venga applicato due volte, l’adapter usa:

```text
relevance = 1
```

Quindi:

```text
contribution.strength.contributionValue
===
measureResult.score
```

Il peso della projection:

```text
decision_accountability = 0.20
```

viene conservato in:

```text
contribution.extensions
  .projectionTraceability
  .configuredWeight
```

e applicato una sola volta dall’aggregation tramite:

```text
entry.requirementWeight
```

Nel demo:

```text
measureScore               0.9625
adapter relevance          1
contributionValue          0.9625
requirementWeight          0.20
weightedContributionValue  0.1925
```

Formula:

```text
0.9625 × 1 × 0.20 = 0.1925
```

Questa decisione è considerata stabile.

---

# 11. Demo Result aggiornato

Il contributo manuale:

```text
leadership_demo_decision_accountability
```

è stato eliminato e sostituito dalla pipeline reale:

```text
DecisionAccountabilityObservation
↓
DecisionAccountabilityMeasureResult
↓
DecisionAccountabilityLeadershipContribution
```

Nel wrapper è disponibile:

```js
measurementTraceability: {
  decisionAccountability: {
    observation,
    measureResult,
    contribution
  }
}
```

La contribution compare una sola volta nell’array `contributions`.

Gli altri sei contributi Leadership restano ancora configurati manualmente.

---

# 12. Bridge Health and Regression

È stato aggiunto un health check dedicato:

```text
Measurement → Capability Bridge
```

Il bridge verifica:

* observation valida;
* measure result valido;
* projection valida;
* contribution valida;
* definition valida;
* match valido;
* aggregation context valido;
* capability result valido;
* measure score preservato;
* inference support preservato;
* assenza di doppia ponderazione;
* evidence traceability preservata;
* semantica `not_observed` preservata.

È stato aggiunto anche un regression test con snapshot minimale e privo di timestamp.

Il bridge è integrato nel:

```text
scripts/fringe_health_check.js
```

Un fallimento del bridge rende negativo l’health generale.

---

# 13. Measurement Core e Measurement Modules

È emersa una distinzione promettente, ma non ancora formalizzata come nuova architettura:

```text
Measurement Core
=
contratti e meccanismi generali

Measurement Modules
=
conoscenza e calcolo specifici delle singole dimensioni
```

`decisionAccountability` è il primo modulo specialistico.

Non creare ancora:

* un framework generico per i moduli;
* nuovi contratti;
* un catalogo universale dei fattori specialistici.

Prima occorre implementare almeno altre una o due measurement e verificare cosa è veramente comune.

---

# 14. Multi-measure contributions — porta aperta, non implementata

È stata considerata la possibilità futura che una contribution emerga da più MeasureResult:

```text
MeasureResult A
+
MeasureResult B
+
MeasureResult C
↓
Interpretive Pattern
↓
CapabilityContribution
```

Per evitare una futura rifattorizzazione, la contribution derivata conserva:

```js
derivation: {
  derivationType:
    "single_measure_result",

  sourceMeasureIds: [
    "decision_accountability"
  ],

  patternId:
    null
}
```

Non esiste ancora alcun motore multi-measure.

Non introdurre coefficienti correttivi arbitrari.

La regola futura ipotizzata è:

```text
le misure originarie non vengono modificate
↓
una configurazione semanticamente significativa
può produrre una nuova contribution esplicita
```

---

# 15. Interpretive Pattern Layer — ricerca futura

È stata annotata una possibile evoluzione:

```text
Capability configuration anomaly
↓
Interpretive Pattern
↓
Competing Hypotheses
↓
Observation Plan
↓
New Evidence
↓
Target Interpretation
↓
Fit
```

Un pattern anomalo non deve produrre immediatamente:

* penalizzazioni;
* premi;
* coefficienti correttivi;
* diagnosi sul candidato.

Deve eventualmente generare ipotesi e nuove osservazioni.

Lo stesso pattern potrebbe essere:

* negativo per un target;
* tollerabile per un altro;
* utile in un contesto di crisi o stabilizzazione;
* problematico in un contesto fondato su delega e crescita.

Questa evoluzione non deve essere implementata ora.

È solo una direzione di ricerca futura.

---

# Stato di integrazione

Non sono ancora collegati a dati applicativi reali:

* DecisionAccountabilityObservation;
* DecisionAccountabilityMeasureResult;
* Leadership Capability;
* TargetModel;
* CapabilityProjection.

Non vengono ancora usati:

* CV reale;
* parser;
* intervista;
* LLM;
* Runtime applicativo;
* report;
* renderer;
* fit.

La prima observation è ancora costruita con dati demo dichiarativi.

Il percorso deterministico successivo è però reale.

---

# Stato Git

La milestone deve essere salvata con un commit selettivo comprendente:

```text
src/core/capability/examples/
src/core/capability/adapters/
src/core/measurement/decisionAccountability/

scripts/test_build_leadership_capability_design.js
scripts/test_build_plant_manager_transformation_target_model.js
scripts/test_build_plant_manager_leadership_capability_projection.js
scripts/test_build_plant_manager_leadership_demo_result.js
scripts/test_build_plant_manager_leadership_scenario_comparison.js

scripts/test_build_decision_accountability_observation.js
scripts/test_build_decision_accountability_measure_result.js
scripts/test_build_decision_accountability_leadership_contribution.js

scripts/test_health_measurement_capability_bridge.js
scripts/test_measurement_capability_bridge_regression.js

scripts/fringe_health_check.js
```

Non usare:

```text
git add .
```

Messaggio suggerito:

```text
Add leadership knowledge pipeline and measurement capability bridge
```

Le modifiche applicative, legacy e documentali estranee devono rimanere fuori dal commit.

---

# Prossimo passo consigliato

Non introdurre subito un’altra capability.

Il prossimo passo dovrebbe sostituire un secondo contributo manuale della Leadership con una measurement reale.

La candidata raccomandata è:

```text
execution_through_others
```

Motivazioni:

* è uno dei quattro componenti core;
* distingue chiaramente Leadership da prestazione individuale;
* è centrale nel target Plant Manager;
* è osservabile tramite delega, coordinamento, dipendenza dall’intervento personale e risultati collettivi;
* mette alla prova la possibilità di introdurre evidenze supporting e contradicting senza confondere score basso con evidenza contraria.

Prima del Builder sarà necessario definire il modello minimo della misura.

Possibili fattori iniziali da discutere:

```text
delegatedExecutionScope
collectiveDeliveryEvidence
managerialLayerUse
personalInterventionDependence
```

Non considerarli definitivi senza una breve review semantica.

---

# Sequenza raccomandata per la prossima sessione

1. Leggere questo handover.
2. Eseguire:

   ```powershell
   git status
   ```
3. Verificare che il commit della milestone sia stato completato.
4. Non riaprire il metamodelo generale.
5. Progettare `execution_through_others` v0.1.
6. Definire:

   * observation;
   * fattori;
   * benchmark;
   * strength;
   * inference support;
   * evidenze supporting;
   * distinzione fra assenza ed evidenza contraria.
7. Implementare il relativo Measurement Module.
8. Collegarlo a Leadership tramite adapter dedicato.
9. Sostituire il secondo contribution manuale nel demo.
10. Estendere health e regression soltanto dopo il bridge reale.

---

# Punto di ripartenza sintetico

```text
Task 0097 completato
↓
Leadership reale disponibile
↓
Decision Accountability misurata deterministicamente
↓
primo bridge Measurement → Capability operativo
↓
doppia ponderazione esclusa
↓
health e regression del bridge PASS
↓
prossimo passo:
Execution Through Others Measurement v0.1
```

---

# Regola operativa confermata

Da questo momento:

> Sostituire progressivamente un contribution manuale alla volta con una pipeline reale Observation → MeasureResult → CapabilityContribution.

Non estendere l’architettura generale finché un problema concreto non dimostra che è necessario.

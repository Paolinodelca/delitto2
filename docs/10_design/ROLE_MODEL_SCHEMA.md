# ROLE_MODEL_SCHEMA.md

## Scopo

Definire la struttura stabile del Role Model.

Il Role Model è l’oggetto centrale prodotto dal Role Engine.

Non descrive il candidato.
Descrive ciò che deve diventare osservabile per risultare credibili in uno specifico ruolo.

---
## Decisione di naming

Nel codice useremo il nome breve:

RoleModel

ma il significato corretto è:

Interview Role Model.

Il RoleModel non rappresenta un ruolo astratto o universale.

Rappresenta il modello di credibilità richiesto per uno specifico colloquio, costruito a partire da:

- ruolo target;
- CV;
- Job Description;
- seniority;
- azienda;
- settore;
- contesto;
- informazioni disponibili.

Quindi non esiste un RoleModel valido per tutti gli Operations Manager.

Esiste un RoleModel per:

Operations Manager
+
questo candidato
+
questa azienda
+
questa seniority
+
questo colloquio.

Questa decisione evita di costruire librerie infinite di ruoli statici.


# Principio

FRINGE non parte da una lista piatta di competenze.

Usa una struttura gerarchica:

Role Model
↓
Dimensions
↓
Signals
↓
Evidence

---

# Role Model / Interview Role Model

```js
roleModel = {
  roleIdentity: {},
  roleUnderstanding: {},
  dimensions: [],
  confidence: {},
  validation: {},
  evidenceCollectionPlan: {},
  metadata: {},
  extensions: {}
}
```

---

# 1. roleIdentity

```js
roleIdentity = {
  targetRole,
  normalizedRole,
  roleFamily,
  seniority,
  industry,
  contextType,
  confidence
}
```

Serve a capire che ruolo stiamo realmente analizzando.

Il titolo del ruolo non è sufficiente.

---

# 2. roleUnderstanding

```js
roleUnderstanding = {
  roleMission,
  successDefinition,
  coreResponsibilities,
  typicalChallenges,
  decisionContext,
  stakeholderContext,
  seniorityExpectations,
  uncertaintyFlags
}
```

Descrive cosa significa avere successo in quel ruolo.

---

# 3. dimensions

Le dimensioni sono i grandi pilastri della candidatura.

Esempi:

* narrative_credibility
* professional_maturity
* role_specific_competence
* fit
* potential

```js
dimension = {
  id,
  label,
  description,
  importance,
  confidence,
  signals: []
}
```

---

# 4. signals

I signals sono gli elementi osservabili che costruiscono una dimensione.

Esempi:

* ownership
* decision_making
* stakeholder_alignment
* kpi_reporting
* learning_agility

```js
signal = {
  id,
  label,
  category,
  description,
  whyItMatters,
  importance,
  confidence,

  observableEvidence: [],
  missingEvidenceRisk,
  minimumEvidenceCount,

  followupStrategy,
  stopCondition,

  source,
  extensions: {}
}
```

---

# 5. observableEvidence

Descrive quali evidenze possono rendere osservabile un signal.

```js
observableEvidence = {
  evidenceType,
  description,
  example,
  sourcePreference,
  strengthWeight
}
```

Esempi di evidenceType:

* concrete_episode
* decision
* tradeoff
* measurable_result
* stakeholder_context
* personal_contribution
* learning_reflection
* cv_signal

---
---

# Collection Goal

Il Collection Goal rappresenta un obiettivo di raccolta delle evidenze.

Non rappresenta una domanda.

Non rappresenta un follow-up.

Non rappresenta una competenza.

È l'obiettivo che il sistema vuole raggiungere durante il colloquio.

Un recruiter umano non pensa:

"Adesso faccio la domanda 7."

Pensa:

"Adesso voglio capire se il candidato prende decisioni."

Il Collection Goal formalizza questo comportamento.

---

# Relazione

Dimension  
↓  
Collection Goal  
↓  
Signals  
↓  
Evidence  
↓  
Coverage

Il Goal viene considerato completato quando è stata raccolta una quantità sufficiente di evidenze osservabili.

Solo il Goal governa:

- domanda iniziale;
- follow-up;
- depth check;
- pressure probe;
- recovery;
- stop condition.

L'Interview Engine non deve contenere la logica dei follow-up.

Esegue il Goal corrente e aggiorna l'Interview State.

---

# Schema

```js
collectionGoal = {
  id,
  label,
  purpose,
  priority,
  targetSignals: [],
  preferredQuestionTypes: [],
  executionModes: [],
  followupPolicy: {},
  stopCondition,
  failureInterpretation,
  extensions: {}
}

# 6. evidenceCollectionPlan

Il piano operativo per raccogliere evidenze durante il colloquio.

```js
evidenceCollectionPlan = {
  prioritySignals: [],
  questionGoals: [],
  followupPolicies: [],
  coverageThresholds: {},
  extensions: {}
}
```

Il colloquio non procede per numero di domanda.

Procede per copertura dei segnali.

---

# 7. confidence

```js
confidence = {
  overall,
  roleIdentity,
  seniority,
  roleSpecificSignals,
  sourceQuality,
  notes
}
```

La confidence non riguarda il candidato.

Riguarda quanto FRINGE si fida della propria comprensione del ruolo.

---

# 8. validation

```js
validation = {
  status,
  missingRequiredFields: [],
  weakAreas: [],
  warnings: [],
  reviewerNotes: []
}
```

Ogni Role Model deve poter essere validato prima di essere usato dal colloquio.

---

# 9. metadata

```js
metadata = {
  version,
  generatedAt,
  model,
  locale,
  sourcesUsed: []
}
```

---

# Regole

1. Non inserire giudizi sulla persona nel Role Model.
2. Ogni signal deve essere osservabile.
3. Ogni signal deve avere confidence e source.
4. Non osservato non significa assente.
5. Le competenze specifiche del ruolo vivono nei signals, non in liste hardcoded.
6. Il renderer non deve leggere direttamente il Role Model: leggerà oggetti derivati più avanti.
7. Se un campo sperimentale viene usato stabilmente, deve uscire da extensions e diventare parte dello schema.

---

# Sintesi

Il Role Model non dice chi è il candidato.

Dice cosa deve essere reso osservabile per costruire credibilità rispetto al ruolo target.

NUOVA NOTA:
Il Collection Goal rappresenta un comportamento generale del Core.

Nell'applicazione Interview verrà eseguito tramite domande.

In altri prodotti potrà essere eseguito tramite:

- esercizi
- simulazioni
- test
- casi pratici
- role play
- quiz
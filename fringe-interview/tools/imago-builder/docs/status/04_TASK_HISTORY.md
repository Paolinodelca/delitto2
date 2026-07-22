# IMAGO Builder Task History

Version: 1.0

Status: ACTIVE

---

# Purpose

Questo documento rappresenta la cronologia tecnica del Builder.

Non descrive lo stato corrente del progetto.

Per quello utilizzare:

02_BUILDER_STATUS.md

Questo documento contiene invece la storia delle implementazioni
approvate.

Ogni task concluso viene aggiunto in fondo al documento.

Le informazioni riportate devono riflettere esclusivamente
implementazioni realmente presenti nel repository.

Mai registrare task pianificati.

Mai registrare implementazioni parziali.

---

# Entry Format

Ogni task deve seguire lo stesso schema.

---

## Task

Task ID

Titolo

Data

Status

Architect Decision

Repository Revision

---

### Goal

Breve descrizione dello scopo.

---

### Repository Inspection

Componenti realmente ispezionati.

---

### Files Created

Elenco file.

---

### Files Modified

Elenco file.

---

### Public API

Nuove API pubbliche.

Oppure

None

---

### Tests

Unit Test

Regression

Process Test

Health

---

### Static Audit

Risultato dello Static Audit.

---

### Documentation

Documentazione aggiornata.

---

### Notes

Osservazioni.

---

### Review

APPROVED

oppure

REJECTED

oppure

PARTIAL

---

# History

Le entry devono essere ordinate cronologicamente.

Le nuove entry vengono aggiunte esclusivamente in fondo.

Mai modificare retroattivamente una entry approvata.

Eventuali correzioni devono essere registrate come una nuova entry.

---

## 0098E-2A

Title

Writer Contracts and Validation

Status

APPROVED

Goal

Introduzione dei contratti pubblici del Writer e dei relativi validator.

Review

APPROVED

---

## 0098E-2B

Title

Atomic Writer

Status

APPROVED

Goal

Implementazione della scrittura atomica per singolo file.

Review

APPROVED

---

## 0098E-2C

Title

Multi-file Writer

Status

APPROVED

Goal

Introduzione della pipeline di scrittura multi-file.

Review

APPROVED

---

## 0098E-2D

Title

Writer Hardening and Release Gate

Status

APPROVED

Goal

Rafforzamento del Writer attraverso controlli di sicurezza, validazione
della readiness e verifiche di rilascio.

Review

APPROVED

---

## 0098E-3

Title

Generation Writer CLI

Status

APPROVED

Goal

Introduzione della CLI pubblica per l'esecuzione controllata dei
Generation Plan attraverso le API del Writer.

Capabilities

* Human output
* JSON output
* Help
* Version fallback
* Exit codes
* Process tests

Known Limitation

In assenza di metadata di versione nel repository, il comando
`--version` restituisce:

```text
unknown
```

Questo comportamento è intenzionale.

Review

APPROVED

---

# Current History Boundary

L'ultimo task completato e approvato è:

```text
0099A-1
```

Il task seguente non deve essere inserito nella cronologia finché non
sarà:

* implementato;
* testato;
* verificato;
* approvato.

---

## 0098E-5

Title

Measurement Module End-to-End Generation

Status

APPROVED

Goal

Estensione dell’orchestratore pubblico esistente con la pipeline controllata
GenerationPlan → GenerationWritePreflight → Writer, mantenendo il dry-run come
default e senza introdurre nuove API pubbliche.

Review

APPROVED

---

## 0098E-6

Title

Core Stabilization and End-to-End Release Validation

Status

APPROVED

Goal

Consolidamento della pipeline pubblica end-to-end con verifica di dry-run,
scrittura reale, hash degli artifact e blocco sicuro dell'overwrite.

Public Contracts

- `GenerationPlan`
- `GenerationWritePreflight`
- `GenerationWriteReport`

Known Limitation

La validazione generale `fringe_health_check.js` richiede file applicativi
`src/` e `config/` non sempre inclusi negli handover del solo Builder.

Review

APPROVED

---

## 0098E-7

Title

Public API Compatibility Regression

Status

APPROVED

Goal

Protezione della superficie API pubblica del Builder e del plugin Measurement
Module, inclusa la non esposizione degli helper interni e dei contratti candidati
non implementati.

Public Contracts

Nessun nuovo contratto. Verificata la compatibilità degli export pubblici
esistenti.

Known Limitation

La snapshot della superficie pubblica deve essere aggiornata intenzionalmente
quando una futura decisione architetturale modifica gli export.

Review

APPROVED

---

## 0098E-8

Title

Beta Readiness Regression Gate

Status

APPROVED

Goal

Introduzione di un unico gate di regressione per verificare Writer release,
Measurement Module end-to-end, compatibilità API pubblica e processo CLI prima
della beta.

Behavior

Il gate riutilizza test esistenti e viene eseguito dal release gate Builder.
Non modifica il codice produttivo e non introduce nuove API.

Public Contracts

Nessun nuovo contratto pubblico.

Known Limitation

Il gate certifica il perimetro Builder presente nell'handover; non sostituisce
gli health applicativi che dipendono da `src/` e `config/`.

Review

APPROVED

---

## 0098E-9

Title

IMAGO Builder Beta Release

Status

APPROVED

Goal

Chiusura formale della milestone Beta dopo la verifica positiva del gate di
readiness già presente nel repository.

Behavior

Il task non introduce nuove funzionalità. Conferma come baseline Beta le API,
i contratti, l'orchestratore, il Writer e la CLI già protetti dalle regression
0098E-6, 0098E-7 e 0098E-8.

Public Contracts

Nessun nuovo contratto pubblico.

Known Limitation

La CLI continua a restituire `unknown` per `--version` quando l'handover non
contiene un `package.json`; questo comportamento è intenzionale e già
documentato. `scripts/fringe_health_check.js` resta non applicabile agli
handover privi delle cartelle applicative `src/` e `config/`.

Review

APPROVED

---

## 0099A-1

Title

Builder State Inventory Core Foundation

Status

APPROVED

Goal

Introduzione della Foundation interna e deterministica che costruisce una
rappresentazione repository-relative dello stato strutturale del Builder.

Behavior

La Foundation scansiona struttura, plugin, entry point pubblici, test, regression,
health check e documentazione. Valida l'Inventory e lo serializza in JSON stabile
senza timestamp correnti, percorsi assoluti o mutazioni del repository.

Public Contracts

Nessun nuovo contratto pubblico. Builder, validator e serializer dell'Inventory
rimangono nel namespace interno e non sono esportati dal root Builder.

Known Limitation

L'Inventory registra esclusivamente evidenze strutturali. Non interpreta testo
narrativo, non deduce task completati e non aggiorna ancora documentazione.

Review

APPROVED

---

# Maintenance Rules

Per evitare di rallentare il percorso verso la beta, la cronologia viene
mantenuta con un processo semplice.

Alla conclusione di ogni task:

1. aggiornare `02_BUILDER_STATUS.md`;
2. aggiungere una breve entry in fondo a questo documento;
3. non introdurre automazioni dedicate salvo necessità reale;
4. non modificare retroattivamente le entry approvate.

L'automazione della documentazione è rinviata a una fase successiva alla
beta.

---

# End of Task History

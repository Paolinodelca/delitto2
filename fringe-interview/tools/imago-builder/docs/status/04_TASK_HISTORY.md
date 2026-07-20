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
0098E-3
```

Il task seguente non deve essere inserito nella cronologia finché non
sarà:

* implementato;
* testato;
* verificato;
* approvato.

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

# Builder Task Template

Utilizzare questo modello come riferimento per ogni nuovo task.

---

# Task

Task ID

Title

Status

---

# Goal

Descrivere in poche righe l'obiettivo del task.

---

# Repository Inspection

Componenti ispezionati.

File coinvolti.

Builder riutilizzati.

Validator riutilizzati.

CLI coinvolte.

Documentazione consultata.

---

# Design

Modifiche previste.

Nuovi file.

File aggiornati.

API pubbliche interessate.

---

# Implementation

Descrizione sintetica dell'implementazione.

---

# Tests

## Unit Test

*

## Regression

*

## Process Test

*

## Health

*

---

# Static Audit

Verifiche effettuate.

Eventuali anomalie.

---

# Documentation

## Application Documentation

Documenti applicativi aggiornati.

Oppure:

None — il task non modifica documentazione applicativa esistente.

## Application Roadmap

Aggiornamenti apportati a:

```text
notes/BETA_ROADMAP.md
```

Oppure:

None — il task non modifica stato o pianificazione della roadmap.

## Builder Documentation

Aggiornamenti apportati a:

```text
tools/imago-builder/docs/status/02_BUILDER_STATUS.md
tools/imago-builder/docs/status/04_TASK_HISTORY.md
tools/imago-builder/docs/onboarding/03_ROADMAP.md
tools/imago-builder/docs/architecture/03_ARCHITECT_DECISIONS.md
```

Oppure:

None — il task non modifica IMAGO Builder.

Non modificare la documentazione del Builder per task esclusivamente applicativi.

---

# Public API

Nuove API pubbliche.

Oppure:

None.

---

# Files Created

*

---

# Files Modified

*

---

# Files Delivered

Elencare esclusivamente:

* file creati;
* file modificati;
* report di implementazione;
* eventuale manifest.

Non includere l’intero repository salvo richiesta esplicita.

*


# Known Limitations

*

---

# Final Report

Risultato finale.

Problemi riscontrati.

Decisioni rimandate.

Conferma che il task successivo non è stato iniziato.

Conferma che il pacchetto consegnato contiene soltanto file nuovi o modificati,
il report di implementazione e l’eventuale manifest.

Conferma che i percorsi relativi dei file sono stati preservati.

---

# Review

APPROVED

oppure

PARTIAL

oppure

REJECTED

Documentation Update (Mandatory)

Update every documentation file actually affected by the task.

If the task changes the Core architecture roadmap,
update:

repository/docs/15-architecture_specifications/CORE_ROADMAP.md

If the task changes Builder internals,
update the Builder documentation accordingly.

Do not update unrelated documents.

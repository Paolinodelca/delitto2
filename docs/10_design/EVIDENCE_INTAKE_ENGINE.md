# EVIDENCE_INTAKE_ENGINE.md

## Scopo

L'Evidence Intake Engine rappresenta il punto di ingresso di tutte le informazioni nel Core IMAGO.

Il suo compito non è comprendere il dominio.

Non interpreta.

Non prende decisioni.

Trasforma qualunque sorgente informativa in un insieme coerente di Evidence osservabili.

Tutti i moduli successivi del Core lavorano esclusivamente sulle Evidence prodotte da questo motore.

---

# Principio

Il Core non deve conoscere:

- Word
- PDF
- immagini
- LinkedIn
- CV
- manuali
- trascrizioni
- email

Conosce solamente Evidence.

L'Evidence Intake Engine separa definitivamente le sorgenti dal Core.

---

# Pipeline

Input Bundle

↓

Source Adapter

↓

Normalization

↓

Evidence Extraction

↓

Evidence Validation

↓

Evidence Store

↓

Core

---

# Input Bundle

L'Input Bundle rappresenta l'insieme delle sorgenti disponibili.

Ogni sorgente possiede almeno:

```js
inputSource = {

    id,

    type,

    content,

    language,

    confidence,

    source,

    createdAt,

    metadata,

    extensions

}
```

---

# Tipologie di sorgenti

Il Core deve poter ricevere qualunque tipo di informazione.

Ad esempio:

- CV
- Job Description
- LinkedIn
- PDF
- Word
- immagini
- OCR
- audio
- trascrizioni
- email
- questionari
- manuali
- documentazione tecnica
- appunti
- feedback

Nuove sorgenti potranno essere aggiunte senza modificare il Core.

---

# Source Adapter

Ogni sorgente viene gestita da un Adapter dedicato.

Esempi:

CV Adapter

↓

Evidence

LinkedIn Adapter

↓

Evidence

OCR Adapter

↓

Evidence

Transcript Adapter

↓

Evidence

Il Core non conosce gli Adapter.

Conosce solo le Evidence prodotte.

---

# Normalization

Prima dell'estrazione vengono uniformati:

- formato
- encoding
- lingua
- struttura
- metadati

Questa fase elimina differenze dovute al formato originale.

---

# Evidence Extraction

L'obiettivo non è riassumere il documento.

L'obiettivo è individuare elementi osservabili.

Ogni documento produce una serie di Evidence.

Esempio:

```text
CV

↓

Esperienza

↓

Responsabilità

↓

Risultato

↓

Evidence
```

Oppure:

```text
Manuale

↓

Concetto

↓

Competenza

↓

Learning Goal

↓

Evidence
```

L'Evidence è sempre indipendente dalla sorgente.

---

# Evidence

Ogni Evidence rappresenta una singola unità osservabile.

```js
evidence = {

    id,

    type,

    description,

    content,

    sourceId,

    sourceType,

    confidence,

    extractedBy,

    extractedAt,

    metadata,

    extensions

}
```

---

# Evidence Validation

Prima di entrare nel Core ogni Evidence viene validata.

La validazione verifica:

- struttura
- completezza
- provenienza
- confidence
- duplicati
- coerenza

Il Core riceve solo Evidence valide.

---

# Evidence Store

Le Evidence vengono memorizzate.

Il documento originale non rappresenta più la fonte primaria di lavoro.

Le elaborazioni successive utilizzano lo Store.

Questo riduce:

- costo computazionale
- tempo
- chiamate LLM ripetute

---

# Aggiornamento

Quando arrivano nuove informazioni il sistema non ricostruisce tutto.

Aggiorna lo Store.

Le nuove Evidence vengono:

- aggiunte;
- aggiornate;
- consolidate;
- collegate.

---

# Provenienza

Ogni Evidence mantiene sempre la tracciabilità.

Devono essere sempre noti:

- sorgente originale;
- modalità di estrazione;
- confidence;
- timestamp.

---

# Responsabilità

L'Evidence Intake Engine:

✔ acquisisce

✔ normalizza

✔ estrae

✔ valida

✔ memorizza

Non:

✘ interpreta

✘ confronta

✘ genera report

✘ produce suggerimenti

---

# Relazione con il Core

Il Core non lavora sui documenti.

Lavora esclusivamente sulle Evidence.

Questa separazione rappresenta uno dei principi architetturali fondamentali di IMAGO.

---

# Benefici

Questa architettura permette di:

- aggiungere nuove sorgenti senza modificare il Core;
- ridurre drasticamente le chiamate LLM;
- mantenere la tracciabilità delle informazioni;
- costruire una Professional Identity persistente;
- riutilizzare le stesse Evidence in domini differenti.

---

# Principio finale

L'Evidence Intake Engine non costruisce conoscenza.

Costruisce il patrimonio di osservazioni sul quale il Core potrà successivamente ragionare.
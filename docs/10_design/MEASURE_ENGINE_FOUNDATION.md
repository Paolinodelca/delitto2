# MEASURE_ENGINE_FOUNDATION.md

## Scopo

Questo documento definisce il concetto di Measure Engine dentro IMAGO.

Il Measure Engine nasce da una constatazione emersa durante la progettazione del Core:

prima di confrontare, classificare, ordinare o valutare qualcosa, il sistema deve sapere **come misurare** ciò che sta osservando.

---

# Principio fondamentale

Molte operazioni cognitive apparentemente diverse condividono una struttura comune.

Esempi:

* confrontare due profili;
* classificare una competenza;
* ordinare più candidati;
* valutare una credibilità;
* stimare un rischio;
* identificare un gap.

In tutti questi casi il sistema deve prima costruire una base omogenea di misura.

Senza misura non esiste confronto affidabile.

---

# Definizione

## Dimension

Una Dimension è ciò che vogliamo osservare o misurare.

Esempi:

* linearità di carriera;
* coerenza con il ruolo;
* seniority dimostrata;
* stabilità temporale;
* rilevanza del contesto aziendale;
* evidenze misurabili;
* coerenza comunicativa;
* allineamento con il target.

Una Dimension non è necessariamente un numero.

Può essere una proprietà complessa che deve essere trasformata in un valore confrontabile.

---

## Measure

Una Measure è il valore attribuito a una Dimension per uno specifico oggetto osservato.

Esempio:

```text
Oggetto osservato:
Profilo candidato

Dimension:
Linearità di carriera

Measure:
0.72
```

La Measure è ciò che permette al sistema di posizionare oggetti diversi su una base comune.

---

# Tipi di misura

## Misura diretta

Deriva da un dato immediatamente osservabile.

Esempi:

* anni di esperienza;
* numero di aziende;
* durata media delle esperienze;
* numero di progetti citati;
* numero di certificazioni.

---

## Misura derivata

Deriva da una trasformazione di più dati osservabili.

Esempi:

* stabilità del percorso;
* coerenza tra esperienze e ruolo target;
* densità di evidenze;
* copertura delle competenze richieste.

---

## Misura stimata

Deriva da una valutazione non direttamente misurabile, ma fondata su evidenze.

Esempi:

* leadership percepibile;
* credibilità professionale;
* autonomia decisionale;
* capacità comunicativa;
* maturità manageriale.

Le misure stimate dovranno sempre indicare:

* evidenze usate;
* livello di confidenza;
* limiti della stima.

---

# Relazione con Comparison Engine

Il Comparison Engine non dovrebbe decidere come misurare.

Il suo compito è confrontare valori già misurati o rappresentati in modo confrontabile.

La sequenza corretta è:

```text
Observed Evidence
↓
Measure Engine
↓
Measured Dimensions
↓
Comparison Engine
↓
Comparison Result
```

---

# Relazione con Reference Model

Un Reference Model definisce cosa ci si aspetta.

Il Measure Engine misura cosa è osservabile.

Il Comparison Engine confronta osservato e atteso.

```text
Observed Profile
↓
Measure Engine
↓
Observed Measures

Reference Model
↓
Expected Measures

Observed Measures + Expected Measures
↓
Comparison Engine
↓
Gap / Fit / Readiness / Credibility
```

---

# Prima applicazione: credibilità professionale

La credibilità professionale non è una singola proprietà.

È un risultato composito derivato da più Dimension.

Possibili Dimension iniziali:

1. linearità del percorso;
2. coerenza delle esperienze;
3. rilevanza del contesto aziendale;
4. seniority dimostrata;
5. stabilità temporale;
6. evidenze misurabili;
7. coerenza comunicativa;
8. allineamento con il target.

Ogni Dimension dovrà essere misurata separatamente.

Solo dopo sarà possibile produrre una valutazione complessiva.

---

# Esempio concettuale

```js
measuredProfile = {
  subjectId: "candidate_001",

  measures: [
    {
      dimensionId: "career_linearity",
      value: 0.78,
      confidence: 0.82,
      evidenceIds: ["ev_001", "ev_004"],
      measureType: "derived"
    },
    {
      dimensionId: "role_alignment",
      value: 0.64,
      confidence: 0.76,
      evidenceIds: ["ev_002", "ev_005"],
      measureType: "derived"
    }
  ]
}
```

---

# Responsabilità del Measure Engine

Il Measure Engine deve:

* ricevere evidenze osservate;
* applicare una definizione di Dimension;
* produrre valori confrontabili;
* indicare il tipo di misura;
* indicare la confidenza;
* collegare ogni misura alle evidenze usate.

---

# Non responsabilità

Il Measure Engine NON deve:

* generare narrativa;
* decidere se un candidato è adatto;
* generare CV;
* chiamare LLM direttamente;
* sostituire il Comparison Engine;
* sostituire il Reasoning Layer.

---

# API futura ipotetica

```js
buildMeasureResult({
  subject,
  dimensions,
  evidenceStore,
  context
})
```

Output:

```js
{
  measureStatus: "draft",

  subject,

  dimensions,

  measures: [],

  metadata: {
    version: "1.0",
    createdAt: "..."
  },

  extensions: {}
}
```

---

# Decisione provvisoria

Il Measure Engine è un candidato forte per diventare il prossimo Engine del Core IMAGO.

Prima di implementarlo, bisogna verificare se le prime Dimension di credibilità professionale possono essere misurate in modo semplice, trasparente e utile.

---

# Prossimo passo

Progettare il primo caso concreto:

## Professional Credibility Measure

Obiettivo:

misurare alcune Dimension fondamentali della credibilità professionale sulla base delle evidenze già presenti nel ProfessionalIdentityModel.

Non usare LLM nella prima versione.

Non generare giudizi narrativi.

Produrre solo misure tecniche, ispezionabili e validabili.

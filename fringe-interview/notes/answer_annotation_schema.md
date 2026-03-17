# Answer Annotation Schema — FRINGE

## Scopo

Definire il contratto dati per il modulo di annotazione finale delle risposte.

Questo modulo serve a supportare:

- review dettagliata post-sessione
- trainer mode
- evidenziazione nel testo
- suggerimenti di miglioramento
- futura riscrittura assistita
- futura estensione a training engine generico

Il modulo **non** deve dipendere in modo stretto dal dominio interview.
Deve poter essere riusato in futuro su altri verticali di training.

---

## Principi progettuali

### 1. Separazione dei livelli
L’annotazione finale è distinta da:

- live feedback leggero
- runtime dell’intervista
- report aggregato

Il modulo di annotazione lavora **dopo** che una risposta è stata raccolta.

### 2. Annotazioni leggibili dalla UI
L’output deve poter essere usato da una UI per:

- mostrare tag
- evidenziare testo
- mostrare punti forti / deboli
- mostrare coach tip
- mostrare una versione migliorata

### 3. Annotazioni robuste
Quando possibile, l’annotazione dovrebbe usare:

- `start`
- `end`

invece di affidarsi solo al testo letterale, per ridurre errori di matching.

### 4. Dominio-agnostico
Le categorie devono essere abbastanza generiche da valere anche in altri contesti di training.

---

## Oggetto principale

Ogni risposta annotata produce un oggetto:

- `answerAnnotation`

che contiene:

- metadati della risposta
- tag sintetici
- annotazioni sul testo
- lettura qualitativa
- suggerimenti
- possibile upgrade

---

## Struttura proposta

```json
{
  "answerAnnotation": {
    "answerId": "string",
    "questionLabel": "string",
    "questionPrompt": "string",
    "answerText": "string",
    "reviewMode": "interview | training_generic",
    "summary": {
      "overallBand": "weak | medium | strong",
      "oneLineDiagnosis": "string",
      "topStrength": "string",
      "topImprovementArea": "string"
    },
    "tags": [
      {
        "type": "strength | evidence | weakness | opportunity",
        "label": "string",
        "weight": "low | medium | high"
      }
    ],
    "annotations": [
      {
        "annotationId": "string",
        "type": "strength | evidence | weakness | opportunity",
        "dimension": "concreteness | specificity | evidence | ownership | structure | clarity | reflection | generic",
        "label": "string",
        "reason": "string",
        "start": 0,
        "end": 10,
        "excerpt": "string"
      }
    ],
    "strengths": [
      {
        "title": "string",
        "explanation": "string"
      }
    ],
    "weaknesses": [
      {
        "title": "string",
        "explanation": "string"
      }
    ],
    "coachTip": {
      "title": "string",
      "message": "string"
    },
    "upgradeSuggestion": {
      "goal": "string",
      "instruction": "string"
    },
    "improvedAnswerDraft": {
      "isProvided": true,
      "text": "string"
    }
  }
}
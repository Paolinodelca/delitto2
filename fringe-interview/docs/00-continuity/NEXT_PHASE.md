# NEXT PHASE — IMAGO 0100C

## Stato

```text
0100B — Knowledge Engine Foundation
Status: COMPLETED
```

Nuovo task:

```text
0100C-1 — Person Knowledge Matrix Query Foundation
Status: PLANNED
```

## Obiettivo

Introdurre query deterministiche, read-only, validate e non interpretative sulla PersonKnowledgeMatrix.

Possibili capability:

```text
get states by dimension
get states by knowledge layer
get states by capability
get states by recipe
get states by recipe version
get shared dimensions
get matrix technical status
```

## Principio

```text
Query Foundation reads the matrix.
It does not reinterpret the person.
```

## Decisioni da prendere

1. Query unica dichiarativa oppure funzioni dedicate.
2. Contratto `PersonKnowledgeQuery`.
3. Contratto `PersonKnowledgeQueryResult`.
4. Semantica AND tra filtri multipli.
5. Ordinamento canonico.
6. Empty result valido.
7. Duplicate handling.
8. Stati completi oppure reference.
9. Immutabilità del risultato.
10. Public API minima.
11. Dependency direction senza cicli.

## Fuori scope

- linguaggio naturale;
- semantic search;
- embedding;
- vector database;
- fuzzy search;
- scoring;
- ranking;
- recommendations;
- matching;
- role fit;
- readiness;
- report;
- guidance;
- action plan;
- conflict resolution;
- state supersession;
- matrix history;
- persistence;
- rete;
- LLM.

## Test indispensabili

- query per Dimension;
- query per elementary;
- query per derived;
- query per Capability;
- query per Recipe;
- query con filtri multipli;
- empty result;
- invalid filter;
- unknown property;
- deterministic ordering;
- input e matrix immutability;
- separation regression;
- no-score regression;
- integration con PersonKnowledgeMatrix;
- aggregate Core test;
- Health Check.

## Rischi principali

1. Query che reinterpretano.
2. API troppo ampia.
3. Esposizione della struttura interna.
4. Filtri non allowlisted.
5. Ordinamento instabile.
6. Fusione implicita dei layer.

## Completion criteria

- repository reale ispezionato;
- query contract definito;
- API pubblica limitata;
- filtri allowlisted;
- output deterministico;
- empty result valido;
- matrix read-only;
- stati non mutati;
- elementary/derived distinti;
- nessuna aggregazione tra layer;
- nessuno score;
- nessun LLM;
- test e Health positivi;
- roadmap aggiornata;
- task successivo non iniziato.

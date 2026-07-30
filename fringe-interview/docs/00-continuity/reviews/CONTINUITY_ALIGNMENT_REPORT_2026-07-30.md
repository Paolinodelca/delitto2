# Continuity Alignment Report

Status: **HISTORICAL REVIEW — NON-NORMATIVE**

Origin: `ARCH-RECOVERY-001`

Observed state: **2026-07-30**

This preserved review records repository evidence observed by ARCH-RECOVERY-001. It informs continuity alignment but does not itself define policy or approve architecture.

Data review: 2026-07-30

## Esito

La transizione operativa Builder → Codex preserva repository-first, task boundary, test, regression, health, self-review e controllo Git. Non preserva ancora in forma vincolante l'obbligo del Builder di aggiornare la documentazione applicativa, la roadmap e le decisioni realmente impattate. Esito: **PARZIALMENTE CONFORME**.

## Documenti verificati

### Continuità corrente

- `docs/00-continuity/IMAGO_CODEX_WORKFLOW.md` — standard operativo corrente;
- `docs/00-continuity/CONTINUITY.md` — contiene lo stato più recente fino a `0100E-8`, ma anche molte sezioni obsolete;
- `docs/00-continuity/CORE_ARCHITECTURE.md` — autorevole nei principi, incompleto nello stato;
- `docs/00-continuity/DECISIONS.md` — autorevole fino alla fase B/C iniziale, non aggiornato per D/E;
- `docs/00-continuity/NEXT_PHASE.md` — obsoleto;
- `docs/00-continuity/GIT_MILESTONE_GUIDE.md` — guida storica 0100B.

### Architettura, roadmap e freeze

- `docs/15-architecture_specifications/CORE_ROADMAP.md`;
- `docs/15-architecture_specifications/KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md`;
- report e manifest `TASK_0100A-*` … `TASK_0100E-8*`;
- review architetturali D-9, E-1, E-3, E-5, E-7;
- `architecture.md`, `manifest_fringe_interview.md`;
- documenti tecnici, roadmap Beta, project spine, session handover e note Knowledge/Runtime/Reporting.

### Continuità e handover storici

Sono stati inclusi nell'inventario e nel confronto i file `continuita/continuity/handover` presenti nella root, in `manifest/`, `docs/30_execution/`, `fringe-interview/notes/`, `builder_tasks/` e `tools/imago-builder/docs/onboarding/`. Essi descrivono fasi FRINGE/LEAK, Beta prodotto, Core pre-0100 e Builder; non sono fonti correnti per la prossima milestone Knowledge Acquisition.

### Builder

- `tools/imago-builder/docs/workflow/01_BUILDER_WORKFLOW.md`;
- `tools/imago-builder/docs/status/02_BUILDER_STATUS.md`;
- `tools/imago-builder/docs/status/04_TASK_HISTORY.md`;
- `tools/imago-builder/docs/onboarding/00_HANDOVER.md`;
- `tools/imago-builder/docs/onboarding/03_ROADMAP.md`;
- architettura e decisioni Builder.

## Documenti obsoleti o parzialmente obsoleti

| Documento | Valutazione |
|---|---|
| `NEXT_PHASE.md` | obsoleto: pianifica C-1 |
| `GIT_MILESTONE_GUIDE.md` | storico: specifico 0100B |
| `CORE_ARCHITECTURE.md` | principi validi, mappa ferma alla Matrix |
| `DECISIONS.md` | ADR valide ma cronologia ferma a C-1 futura |
| `CONTINUITY.md` | stato recente presente, struttura append-only contraddittoria |
| `CORE_ROADMAP.md` | stato finale corretto, ma contiene duplicati e stati intermedi contraddittori |
| `notes/continuity*.md` | storico prodotto, non governance Core corrente |
| root `continuita.md` e `manifest/continuita.md` | storico FRINGE/LEAK |
| `docs/30_execution/SESSION_HANDOVER.md` | handover di una fase pre-Knowledge Acquisition |

## Documenti dichiarati ma mancanti

`CONTINUITY.md` dichiara come parte del pacchetto file oggi assenti:

- `README.md` nella directory continuity;
- `IMAGO_CORE_MANIFESTO.md`;
- `AI_BOUNDARY_AND_EVOLUTION_STRATEGY.md`;
- `BUILDER_PROTOCOL.md`;
- `DEVELOPMENT_LOOP_PROTOCOL.md`;
- `BUILDER_TASK_PREAMBLE.md`;
- `STANDARD_HANDOVER_PROMPT.md`;
- `MANIFESTO_REVIEWS.md`.

Occorre scegliere esplicitamente tra ripristino dai commit che li contenevano e rimozione dei riferimenti. Non vanno ricreati per supposizione.

## Documenti mancanti consigliati

- un `docs/00-continuity/README.md` minimale con ordine di lettura, autorità e stato dei documenti;
- una mappa corrente end-to-end che distingua Knowledge, Application Decision, Runtime legacy e Reporting legacy;
- una ADR post-0100E che registri i boundary Core/Application approvati;
- una vista “current roadmap” senza storico duplicato; lo storico può restare nei report task e in Git.

## Valutazione Builder → Codex

### Responsabilità preservate

- repository come fonte di verità;
- preflight e verifica dello stato Git;
- scope minimo e stop al task boundary;
- tutela dei contratti upstream e dei freeze;
- unit/regression/health/aggregate test;
- self-review e review architetturale;
- report finale basato su evidenze;
- autorizzazioni separate per stage/commit/push/PR/merge.

### Responsabilità non pienamente preservate

Il Builder workflow, Step 9, impone esplicitamente:

- aggiornamento delle specifiche architetturali interessate;
- aggiornamento della roadmap quando cambia stato o pianificazione;
- aggiornamento dei documenti di contratto/pipeline;
- aggiornamento separato di stato, history e roadmap Builder quando il Builder cambia.

`IMAGO_CODEX_WORKFLOW.md` richiede documentazione aderente e report/manifest fattuali, ma non contiene un gate esplicito che obblighi a identificare e aggiornare `CONTINUITY.md`, roadmap, ADR, freeze, handover e task history. Non definisce neppure una policy per archiviare o marcare obsolete le fotografie precedenti. L'automazione degli aggiornamenti non esiste: Codex deve eseguirli deliberatamente nel task quando necessari.

## Modifiche suggerite al workflow Codex

Aggiungere dopo la self-review una sezione normativa “Continuity impact assessment”:

1. classificare l'impatto come `NONE`, `STATUS`, `ARCHITECTURE`, `DECISION`, `BOUNDARY`;
2. verificare obbligatoriamente `CONTINUITY.md`, roadmap corrente, architecture map, ADR/decisions, freeze applicabili, task history e manifest;
3. aggiornare nello stesso task i documenti direttamente resi falsi dall'implementazione o dalla review;
4. non aggiornare documenti non impattati e non copiare lo stesso stato in più file;
5. se un aggiornamento richiede autorità architetturale non concessa, segnalarlo come blocker e non inventare la decisione;
6. marcare ogni documento come `CURRENT`, `HISTORICAL` o `SUPERSEDED`, con link al successore;
7. includere nel report finale una matrice `documento → motivo → aggiornato/non applicabile/bloccato`;
8. aggiungere un health/static check per riferimenti mancanti nel pacchetto continuity e per roadmap con lo stesso task in stati incompatibili.

Checklist proposta da inserire nel workflow:

```text
[ ] Continuity impact classificato
[ ] Roadmap riallineata, se cambia lo stato
[ ] Architecture/ADR riallineate, se cambia il boundary
[ ] CONTINUITY riscritta come vista corrente, se cambia la milestone
[ ] Task report/manifest prodotti
[ ] Riferimenti continuity esistenti e validi
[ ] Documenti storici marcati come tali
```

## Aggiornamenti suggeriti

Priorità alta:

1. sostituire il contenuto operativo di `NEXT_PHASE.md` con `0100E-9`;
2. riscrivere `CONTINUITY.md` come stato corrente, spostando lo storico nei task report;
3. aggiornare `CORE_ARCHITECTURE.md` con pipeline C/D/E e boundary Application;
4. aggiungere ADR per freeze D-10, Design, Match, Decision e Composition Design;
5. normalizzare `CORE_ROADMAP.md`, eliminando duplicati e placeholder ormai falsi;
6. correggere o rimuovere i riferimenti a file continuity assenti.

Priorità media:

7. marcare `GIT_MILESTONE_GUIDE.md` come storico;
8. creare l'indice di autorità della documentazione;
9. separare esplicitamente roadmap Core, roadmap prodotto Beta e roadmap Builder.

## Conclusione

Il passaggio a Codex è operativamente solido ma documentariamente incompleto. Senza il continuity-impact gate, il processo può produrre codice conforme e test verdi lasciando una roadmap ambigua e handover non affidabili: è esattamente lo stato osservato dopo `0100E-8`.

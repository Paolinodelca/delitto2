# \# IMAGO Continuity

#

# \## Read Order

#

# Prima di iniziare qualunque attività leggere nell'ordine:

#

# 1\. PRODUCT\_VISION.md

# 2\. NORTH\_STAR.md

# 3\. REPRESENTATION\_MODEL.md

# 4\. IMAGO\_CORE\_MANIFESTO.md

# 5\. CORE\_ARCHITECTURE.md

# 6\. DECISIONS.md

# 7\. CONTINUITY.md

# 8\. NEXT\_PHASE.md





\## Product Priority Rule



La roadmap di prodotto determina la priorità dello sviluppo.



Le dipendenze architetturali identificano ciò che è implementabile, ma non determinano automaticamente il prossimo task.



Prima di iniziare un nuovo task devono essere verificate almeno le seguenti condizioni:



\- produce valore osservabile per la release corrente;

\- riduce un rischio concreto della release corrente;

\- è consumato dal percorso utente attuale;

\- non esiste un macro-task di maggior valore.



Se tali condizioni non sono soddisfatte, il Builder deve proporre una decisione di priorità prima dell'implementazione.

#

# IMAGO Continuity Package

Status: **CURRENT AUTHORITY INDEX**

Last realignment: 2026-08-05 (`GOV-REALIGN-001`)

## Reading order

1. `README.md` — this authority index;
2. `IMAGO\_CODEX\_WORKFLOW.md` — operational workflow and continuity gate;
3. `CONTINUITY.md` — current verified project state;
4. `CORE\_ARCHITECTURE.md` — current architecture and ownership map;
5. `DECISIONS.md` — approved architectural decisions;
6. `NEXT\_PHASE.md` — next approved task/gate;
7. `../15-architecture\_specifications/CORE\_ROADMAP.md` — current Core task sequence;
8. `../15-architecture\_specifications/KNOWLEDGE\_ACQUISITION\_BOUNDARY\_FREEZE.md` — normative frozen boundary;
9. `GIT\_BRANCHING\_MODEL.md` — observed Git state; descriptive, not a universal policy.

## Authority table

|Document|Status|Scope and authority|
|-|-|-|
|`README.md`|CURRENT|continuity authority and reading order|
|`IMAGO\_CODEX\_WORKFLOW.md`|CURRENT|mandatory operating protocol|
|`CONTINUITY.md`|CURRENT|current verified milestone view|
|`CORE\_ARCHITECTURE.md`|CURRENT|architecture and ownership map|
|`DECISIONS.md`|CURRENT|approved ADR summary|
|`NEXT\_PHASE.md`|CURRENT|E-43 completed; E-44 is the sole planned Derived Dimension State hardening gate|
|`GIT\_BRANCHING\_MODEL.md`|CURRENT / DESCRIPTIVE|observed branch topology; not prescriptive policy|
|`GIT\_MILESTONE\_GUIDE.md`|HISTORICAL|procedure specific to milestone 0100B|
|`reviews/REPOSITORY\_ARCHITECTURE\_REVIEW\_2026-07-30.md`|HISTORICAL REVIEW|ARCH-RECOVERY-001 evidence, non-normative|
|`reviews/CONTINUITY\_ALIGNMENT\_REPORT\_2026-07-30.md`|HISTORICAL REVIEW|ARCH-RECOVERY-001 evidence, non-normative|
|`reviews/NEXT\_ARCHITECTURAL\_STEP\_2026-07-30.md`|HISTORICAL REVIEW|ARCH-RECOVERY-001 recommendation, non-normative|

No indexed document is currently classified `SUPERSEDED`. A future replacement must mark the old document explicitly and link to its successor.

## Roadmap separation

* **Core roadmap:** `docs/15-architecture\_specifications/CORE\_ROADMAP.md`; governs Knowledge/Core task sequence.
* **Product/Beta roadmap:** documents under `notes/` or product execution areas; governs product experience and is not the Core architecture roadmap.
* **Builder roadmap:** `tools/imago-builder/docs/onboarding/03\_ROADMAP.md`; governs IMAGO Builder only.

Updates in one roadmap do not automatically change the others.

## Historical continuity

Files named `continuity`, `continuita`, `handover`, `roadmap` or `manifest` outside this index are not automatically current. Root-level FRINGE/LEAK files, `notes/` histories, product/Beta handovers and Builder handovers describe their own scope or an earlier snapshot unless a CURRENT document explicitly delegates authority to them.

Earlier versions of `CONTINUITY.md` cited governance files not present in the authoritative branch. GOV-REALIGN-001 does not recreate them by assumption. Missing historical documents have no current authority merely because they are referenced by an old snapshot.

## ARCH-RECOVERY-001 reports

The three preserved reports are stored under `docs/00-continuity/reviews/`. They retain the substantive findings observed on 2026-07-30 and support this realignment. They are evidence, not policy.

## Maintenance rule

Every task completes the Continuity Impact Assessment in `IMAGO\_CODEX\_WORKFLOW.md`. `CONTINUITY.md` remains a readable current view rather than an append-only diary. Detailed task history stays in Git, task reports and manifests.
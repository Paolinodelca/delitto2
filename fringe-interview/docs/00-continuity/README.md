# IMAGO Continuity Package

Status: **CURRENT AUTHORITY INDEX**

Last realignment: 2026-07-30 (`GOV-REALIGN-001`)

## Reading order

1. `README.md` — this authority index;
2. `IMAGO_CODEX_WORKFLOW.md` — operational workflow and continuity gate;
3. `CONTINUITY.md` — current verified project state;
4. `CORE_ARCHITECTURE.md` — current architecture and ownership map;
5. `DECISIONS.md` — approved architectural decisions;
6. `NEXT_PHASE.md` — next approved task/gate;
7. `../15-architecture_specifications/CORE_ROADMAP.md` — current Core task sequence;
8. `../15-architecture_specifications/KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md` — normative frozen boundary;
9. `GIT_BRANCHING_MODEL.md` — observed Git state; descriptive, not a universal policy.

## Authority table

| Document | Status | Scope and authority |
|---|---|---|
| `README.md` | CURRENT | continuity authority and reading order |
| `IMAGO_CODEX_WORKFLOW.md` | CURRENT | mandatory operating protocol |
| `CONTINUITY.md` | CURRENT | current verified milestone view |
| `CORE_ARCHITECTURE.md` | CURRENT | architecture and ownership map |
| `DECISIONS.md` | CURRENT | approved ADR summary |
| `NEXT_PHASE.md` | CURRENT | E-39 approves Snapshot construction; E-40 is the sole planned hardening gate |
| `GIT_BRANCHING_MODEL.md` | CURRENT / DESCRIPTIVE | observed branch topology; not prescriptive policy |
| `GIT_MILESTONE_GUIDE.md` | HISTORICAL | procedure specific to milestone 0100B |
| `reviews/REPOSITORY_ARCHITECTURE_REVIEW_2026-07-30.md` | HISTORICAL REVIEW | ARCH-RECOVERY-001 evidence, non-normative |
| `reviews/CONTINUITY_ALIGNMENT_REPORT_2026-07-30.md` | HISTORICAL REVIEW | ARCH-RECOVERY-001 evidence, non-normative |
| `reviews/NEXT_ARCHITECTURAL_STEP_2026-07-30.md` | HISTORICAL REVIEW | ARCH-RECOVERY-001 recommendation, non-normative |

No indexed document is currently classified `SUPERSEDED`. A future replacement must mark the old document explicitly and link to its successor.

## Roadmap separation

- **Core roadmap:** `docs/15-architecture_specifications/CORE_ROADMAP.md`; governs Knowledge/Core task sequence.
- **Product/Beta roadmap:** documents under `notes/` or product execution areas; governs product experience and is not the Core architecture roadmap.
- **Builder roadmap:** `tools/imago-builder/docs/onboarding/03_ROADMAP.md`; governs IMAGO Builder only.

Updates in one roadmap do not automatically change the others.

## Historical continuity

Files named `continuity`, `continuita`, `handover`, `roadmap` or `manifest` outside this index are not automatically current. Root-level FRINGE/LEAK files, `notes/` histories, product/Beta handovers and Builder handovers describe their own scope or an earlier snapshot unless a CURRENT document explicitly delegates authority to them.

Earlier versions of `CONTINUITY.md` cited governance files not present in the authoritative branch. GOV-REALIGN-001 does not recreate them by assumption. Missing historical documents have no current authority merely because they are referenced by an old snapshot.

## ARCH-RECOVERY-001 reports

The three preserved reports are stored under `docs/00-continuity/reviews/`. They retain the substantive findings observed on 2026-07-30 and support this realignment. They are evidence, not policy.

## Maintenance rule

Every task completes the Continuity Impact Assessment in `IMAGO_CODEX_WORKFLOW.md`. `CONTINUITY.md` remains a readable current view rather than an append-only diary. Detailed task history stays in Git, task reports and manifests.

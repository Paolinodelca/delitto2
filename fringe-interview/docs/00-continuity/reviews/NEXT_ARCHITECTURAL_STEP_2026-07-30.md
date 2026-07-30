# Next Architectural Step

Status: **HISTORICAL REVIEW — NON-NORMATIVE**

Origin: `ARCH-RECOVERY-001`

Observed state: **2026-07-30**

This preserved recommendation records the conclusion of ARCH-RECOVERY-001. The current normative next phase remains defined by `../NEXT_PHASE.md` and the Core roadmap.

## Prossimo task

`0100E-9 — Post-Capability-Composition-Design Downstream Architecture Review`

Tipo: review architetturale repository-first, senza implementazione.

## Motivazione

`0100E-8` chiude il Design dichiarativo per il mode `composed`. Il pattern vigente alterna ogni nuova Foundation downstream a una review dedicata. Il repository non approva ancora configuration, planning, recipe, runtime, execution, satisfaction o Knowledge Update; implementarli ora violerebbe il freeze e anticiperebbe decisioni su ownership, cardinalità e causalità.

La review deve stabilire il primo consumer legittimo comune ai mode `single` e `composed` e decidere se il prossimo artefatto debba essere una Capability Configuration Application-owned, un altro contratto dichiarativo o nessun nuovo layer.

## Prerequisiti

- branch, HEAD e working tree verificati;
- lettura del pacchetto `docs/00-continuity/`;
- lettura di `CORE_ROADMAP.md` e `KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md`;
- lettura dei report/review `0100E-5`, `0100E-6`, `0100E-7`, `0100E-8`;
- conferma PASS di `node scripts/test_all_core.js` e `node scripts/fringe_health_check.js`;
- inventario degli input disponibili per `single`, `composed`, `none`, `deferred`;
- nessuna modifica ai contratti congelati.

## Dipendenze

- `KnowledgeAcquisitionDesign`;
- `KnowledgeAcquisitionCapabilityMatch`;
- `KnowledgeAcquisitionSolutionDecision`;
- `KnowledgeAcquisitionCapabilityCompositionDesign`;
- validator locale e contestuale del Composition Design;
- boundary Core/Application congelato;
- decisione dell'Architect su ownership, cardinalità, identity, validation context e relazione tra configurazione e futura execution.

## Deliverable previsti

- report di review `TASK_0100E-9_POST_COMPOSITION_DESIGN_DOWNSTREAM_ARCHITECTURE_REVIEW.md`;
- decisione esplicita `APPROVED DIRECTION`, `DEFERRED` oppure `STOP`;
- diagramma del boundary proposto per tutti i Decision mode;
- matrice delle responsabilità Core/Application/Runtime/Adapter;
- invarianti, cardinalità, causalità, public API e fuori-scope;
- rischi di regressione e test richiesti per l'eventuale task implementativo;
- nome e perimetro del task successivo, solo se approvato;
- aggiornamento coerente di roadmap, continuity e decisioni.

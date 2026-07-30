# Repository Architecture Review

Status: **HISTORICAL REVIEW — NON-NORMATIVE**

Origin: `ARCH-RECOVERY-001`

Observed state: **2026-07-30**

This preserved review records repository evidence observed by ARCH-RECOVERY-001. It informs continuity alignment but does not itself define policy or approve architecture.

Data review: 2026-07-30

Root Git: `C:/Users/Utente/Documents/Progetti/delitto2-e8`

Root applicativa reale: `fringe-interview/`

Branch: `docs/codex-workflow`

HEAD: `a646ad7c25717665d4c202023e8b39aefbe220fb`

## Esito

**CONFORMING WITH ARCHITECTURAL AND DOCUMENTATION NOTES** per l'implementazione; **repository complessivamente NON CONFORME** rispetto alla continuità documentale richiesta.

La suite Core e tutti gli health check passano. Il boundary Knowledge Acquisition implementato è coerente con il freeze vigente. La documentazione, invece, contiene più fotografie temporali sovrapposte, riferimenti a documenti assenti e roadmap contraddittorie. Runtime e Reporting sono implementati e verificati come pipeline storiche autonome, ma non sono ancora connessi al nuovo flusso Knowledge Acquisition/Decision.

## Repository overview

Il worktree Git comprende più prodotti e generazioni architetturali. `fringe-interview/` è la root applicativa perché contiene `src/`, `scripts/`, `config/`, test, health check, roadmap Core e il pacchetto di continuità corrente.

Principali aree:

- `src/core/`: contratti deterministici per input, evidence, identity, observation, measurement, dimension, capability, knowledge, reasoning e runtime;
- `src/app/knowledge/`: decisioni applicative e Composition Design downstream del matching Core;
- `src/interview/`, `src/session/`: intervista adattiva e Beta Session;
- `src/report/`: modelli e renderer di report, Professional Perception e CV Review;
- `tools/imago-builder/`: Builder Beta separato, con workflow, stato e roadmap propri;
- `scripts/`: test, regression, health e gate aggregati;
- `docs/00-continuity/`: continuità Core corrente, ma non completamente riallineata;
- `notes/`: grande archivio storico/evolutivo, non una singola fonte normativa.

Le directory della root superiore (`api/`, `docs/`, `manifest/`, ecc.) e i file `continuita.md` descrivono in larga parte FRINGE/LEAK o fasi precedenti. Non prevalgono sullo stato verificato di `fringe-interview/`.

## Stato architetturale reale

### Knowledge foundation

Implementata e regression-protected:

```text
Input / Evidence
→ Observation
→ MeasurementResult
→ MeasurementDimensionMapping
→ DimensionContribution
→ KnowledgeLedger
→ KnowledgeSnapshot
→ DimensionKnowledgeState (elementary)
→ DerivedKnowledgeRule / CapabilityRecipe
→ CapabilityExecutionResult
→ DerivedDimensionKnowledgeState
→ PersonKnowledgeMatrix
```

La matrice conserva elementary e derived come layer distinti, senza person score, fusione implicita o inferenza LLM.

### Knowledge Acquisition pipeline

Implementata, testata e congelata fino al requisito:

```text
PersonKnowledgeMatrix
→ KnowledgeCoverage (+ query)
→ KnowledgeOpportunity (+ query)
→ KnowledgeAcquisitionNeed (+ query)
→ KnowledgeAcquisitionStrategy (+ query)
→ KnowledgeAcquisitionRequirement (+ query)
```

Il boundary è descrittivo e dichiarativo. Da Opportunity in avanti la cardinalità congelata è 1:1. Planning, execution, satisfaction e update restano esclusi.

### Design e Decision pipeline

Implementata fino a `0100E-8`:

```text
KnowledgeAcquisitionRequirement
→ KnowledgeAcquisitionDesign                 (Core)
→ KnowledgeAcquisitionCapabilityMatch        (Core, 0..N invocazioni)
→ KnowledgeAcquisitionSolutionDecision       (Application)
→ KnowledgeAcquisitionCapabilityCompositionDesign
                                                (Application, solo composed)
```

Discovery e candidate resolution sono responsabilità Application. La Decision supporta `single`, `composed`, `none`, `deferred`. Il Composition Design non effettua selezione, configuration, planning o execution. Validator locale e validator contestuale hanno garanzie distinte e coerenti con il workflow Codex.

### Runtime pipeline

Esistono e passano gli health check:

- IMAGO Runtime Core;
- Beta Runtime Session Integration;
- Beta Session Core;
- runtime intervista depth/style/intent e logica adaptive storicamente documentata.

La pipeline Runtime è internamente operativa, ma non consuma `KnowledgeAcquisitionSolutionDecision` né `KnowledgeAcquisitionCapabilityCompositionDesign`. Non esistono ancora orchestrazione, provider/adapter resolution, execution result, requirement satisfaction o Knowledge Update per il nuovo boundary. Questa è una separazione deliberata, non un malfunzionamento.

### Reporting pipeline

Sono implementati e coperti dagli health check Professional Perception V2, Professional Perception LLM Alpha, CV Review Report V1 e i relativi profili narrativi/rendering.

La pipeline Reporting appartiene però al prodotto Beta storico e non risulta alimentata da PersonKnowledgeMatrix, Coverage, Requirement, Decision o Composition Design. È quindi coerente localmente ma non ancora parte della nuova catena Knowledge Engine end-to-end. La documentazione che rappresenta i report come naturale uscita futura della matrice descrive una direzione, non un'integrazione già implementata.

## Sequenza reale dei task completati

Ordine ricostruito da codice, report, manifest, roadmap, freeze e test:

1. `0100A-1B`, `0100A-2` — foundation preliminari;
2. `0100B-1` … `0100B-10` — Knowledge Engine Foundation fino a PersonKnowledgeMatrix;
3. `0100C-1` — PersonKnowledgeMatrix Query;
4. `0100C-2` — Knowledge Coverage;
5. `0100C-3` — Knowledge Coverage Query;
6. `0100D-1` — Knowledge Opportunity;
7. `0100D-2` — Opportunity Query;
8. `0100D-3` — Acquisition Need;
9. `0100D-4` — Need Query;
10. `0100D-5` — Acquisition Strategy;
11. `0100D-6` — Strategy Query;
12. `0100D-7` — Acquisition Requirement;
13. `0100D-8` — Requirement Query;
14. `0100D-9` — boundary architecture review;
15. `0100D-10` — consolidation e freeze;
16. `0100E-1` — post-Requirement architecture review;
17. `0100E-2` — Acquisition Design;
18. `0100E-3` — post-Design architecture review;
19. `0100E-4` — Capability Match;
20. `0100E-5` — post-Match architecture review;
21. `0100E-6` — Solution Decision;
22. `0100E-7` — post-Decision architecture review;
23. `0100E-8` — Capability Composition Design.

Non risultano report `0100E-9` o implementazioni successive. `0100D-9`, `E-1`, `E-3`, `E-5`, `E-7` sono review, non Foundation implementative.

## Roadmap ricostruita

| Milestone | Stato reale |
|---|---|
| Knowledge Engine Foundation (`0100B`) | completata |
| Query e Coverage (`0100C`) | completata |
| Knowledge Acquisition declarativa e freeze (`0100D`) | completata |
| Design/Match/Decision/Composition Design (`0100E-1`…`E-8`) | completata |
| Review post-Composition Design | non iniziata, prossimo gate logico |
| Configuration/Planning/Runtime/Execution/Satisfaction/Knowledge Update | non approvati e non implementati |
| Integrazione Reporting con Knowledge Engine | non implementata |
| Synthetic Evaluation e Learning Engine | esplicitamente differiti |

## Componenti dichiarati ma non implementati

- capability discovery/registry e candidate resolution come servizio applicativo concreto;
- configuration delle capability selezionate;
- acquisition plan/recipe/action ed executable ordering;
- runtime orchestration, provider e adapter per il nuovo boundary;
- execution/result/observation ingestion;
- Requirement satisfaction separata e Knowledge Update;
- collegamento della nuova pipeline a Beta Session e Reporting;
- Synthetic Evaluation Platform e Learning Engine, correttamente differiti.

Non sono “buchi” da riempire automaticamente: richiedono review e decisioni esplicite.

## Componenti implementati ma documentati in modo insufficiente

- l'intero avanzamento `0100C-2`…`0100E-8` non è consolidato in `CORE_ARCHITECTURE.md` e `DECISIONS.md`;
- Application Knowledge (`SolutionDecision`, `CapabilityCompositionDesign` e validator contestuale) è presente ma non compare nella mappa Core storica;
- la separazione effettiva tra Runtime/Reporting legacy e Knowledge Acquisition non è dichiarata in un documento architetturale unico;
- il Builder State Inventory è implementato ma i documenti Builder hanno stati editoriali tra loro non uniformi.

## Duplicazioni e incoerenze

- `CORE_ROADMAP.md` contiene una sezione `0100D-6` ancora PLANNED e una successiva COMPLETED;
- la roadmap ripete integralmente una “Phase 0100B Revised”, invece di mantenere una vista corrente compatta;
- `CONTINUITY.md` è append-only: contiene contemporaneamente governance “PENDING” e poi “APPROVED”, oltre a una fotografia iniziale ferma a `0100C-1`;
- `NEXT_PHASE.md` pianifica `0100C-1`, già completato da molte milestone;
- `DECISIONS.md` termina con ADR-020 che presenta `0100C-1` come futuro;
- `CORE_ARCHITECTURE.md` termina a PersonKnowledgeMatrix e omette l'intera estensione C/D/E;
- `GIT_MILESTONE_GUIDE.md` è una procedura storica 0100B e indica `0100C-1` come prossima ripresa;
- `CONTINUITY.md` rimanda a `IMAGO_CORE_MANIFESTO.md`, `DEVELOPMENT_LOOP_PROTOCOL.md`, `MANIFESTO_REVIEWS.md`, `BUILDER_TASK_PREAMBLE.md`, `AI_BOUNDARY_AND_EVOLUTION_STRATEGY.md`, `BUILDER_PROTOCOL.md`, `STANDARD_HANDOVER_PROMPT.md` e `README.md`, assenti dall'attuale `docs/00-continuity/`;
- continuità e handover storici sono replicati nella root, in `manifest/`, `docs/30_execution/`, `notes/` e `tools/imago-builder/` senza un indice di autorità e obsolescenza.

## Dipendenze mancanti

Non sono emerse dipendenze package mancanti per eseguire le suite: il repository funziona senza `package.json`, condizione esplicitamente prevista dal Builder.

Mancano invece dipendenze architetturali downstream, intenzionalmente non ancora progettate: catalogo/discovery Application, configurazione, orchestration, adapter/provider, persistenza operativa, satisfaction evaluator e update loop. Non devono essere introdotte prima della review post-Composition.

## Regression risk

- **Alto — semantica:** anticipare planning/runtime nel Core violerebbe il freeze e invertirebbe il boundary Core/Application.
- **Alto — continuità:** un nuovo task basato su `NEXT_PHASE.md` o sulle prime sezioni di `CONTINUITY.md` ripartirebbe da milestone già completate.
- **Medio — public API:** modificare mapping, cardinalità, causalità o export senza aggiornare il freeze regression.
- **Medio — doppia architettura:** collegare direttamente report/runtime legacy ai nuovi contratti senza adapter e decisione esplicita.
- **Medio — governance:** Codex può chiudere un task con report corretto ma lasciare roadmap/continuity/ADR obsolete perché il workflow corrente non impone esplicitamente il loro aggiornamento.
- **Basso, osservato:** nessun TODO/FIXME nel codice; tutti i test aggregati e health sono PASS.

## Prossima milestone e implementazione consigliata

Prossima milestone: **`0100E-9 — Post-Capability-Composition-Design Downstream Architecture Review`**.

Non è raccomandata alcuna nuova implementazione prima di questa review. La prima implementazione candidata, da approvare nella review, è una **Knowledge Acquisition Capability Configuration Foundation** Application-owned e puramente dichiarativa, capace di trattare sia `single` sia `composed` senza introdurre ancora execution. Nome, contratto, cardinalità e rapporto con Composition Design non sono approvati allo stato attuale.

## Raccomandazioni

1. Eseguire `0100E-9` come review senza codice.
2. Consolidare dopo la review `CONTINUITY.md`, `CORE_ARCHITECTURE.md`, `DECISIONS.md`, `CORE_ROADMAP.md` e `NEXT_PHASE.md` in viste correnti non append-only.
3. Aggiungere un indice di autorità documentale che classifichi `current`, `historical`, `product legacy`, `builder-only`.
4. Preservare il freeze e mantenere Configuration/Planning/Runtime fuori dal Core salvo ADR esplicita.
5. Definire un adapter boundary prima di connettere Knowledge Engine a Beta Session o Reporting.
6. Estendere il workflow Codex con un continuity-impact gate obbligatorio, descritto in `CONTINUITY_ALIGNMENT_REPORT.md`.

## Evidenze di verifica

Eseguito il 2026-07-30:

```text
node scripts/test_all_core.js
→ IMAGO Core all tests PASSED
→ All health checks passed
```

Il comando include il health complessivo e registra esplicitamente Matrix, Coverage, Opportunity, Need, Strategy, Requirement, Design, Match, Solution Decision, Composition Design e Boundary Freeze.

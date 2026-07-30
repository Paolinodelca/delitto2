# Task 0100E-13 — Post-Plan Downstream Architecture Review

## Executive Decision

**APPROVED WITH NOTES**

Il primo consumer downstream autorizzato di `KnowledgeAcquisitionPlan` è:

```text
KnowledgeAcquisitionRuntimeSession
Ownership: Application
Nature: first operational boundary, stateful, Plan-scoped, pre-Execution
```

La nota è sostanziale: il nome `RuntimeSession` non autorizza un runtime monolitico. La Foundation successiva può definire soltanto identità, riferimento causale al Plan, lifecycle e stato operativo osservabile della sessione e dei Plan Item. Provider binding, preparazione dell'invocazione, Execution, risultati, eventi, persistence e Knowledge Update restano boundary downstream non autorizzati.

Non è necessario un contratto dichiarativo intermedio. Il Plan è già la definizione dichiarativa completa disponibile; una `Runtime Definition` ne duplicherebbe scope e dipendenze senza nuova responsabilità provata dal repository.

## Repository Evidence Reviewed

La review ha ispezionato il repository reale alla base `10418bb3001e10b9de6a543494c4f6bcc1b80410`, inclusi:

- `TASK_0100E-11_DOWNSTREAM_ARCHITECTURE_REVIEW.md` e `TASK_0100E-12_IMPLEMENTATION_REPORT.md`;
- builder, identity, validator locale e contextual validator di `KnowledgeAcquisitionPlan`;
- builder e validator di `KnowledgeAcquisitionCapabilityConfiguration`;
- export e pipeline Knowledge Acquisition consolidata, boundary freeze e relativi test/health;
- `docs/00-continuity/README.md`, `CONTINUITY.md`, `CORE_ARCHITECTURE.md`, `DECISIONS.md`, `NEXT_PHASE.md`;
- `docs/15-architecture_specifications/CORE_ROADMAP.md`;
- convenzioni reali in `src/core/runtime`, `src/interview`, `src/session`, `src/core/capability` e pipeline di stato derivato;
- workflow di continuità, checker state-driven, aggregate Core e overall health.

Evidenze decisive:

1. Il Plan è deep-frozen, content-derived, privo di timestamp e contiene esattamente un Plan Item per capability selezionata.
2. I Plan Dependency preservano causalità logiche `all_required`/`any_required`, non un ordine esecutivo.
3. Il validator vieta ricorsivamente stato, progress, job, Runtime, Execution, provider, retry, risultati, reporting, satisfaction, Knowledge Update e persistence.
4. Le sessioni esistenti mostrano che lifecycle, avanzamento, item corrente, tentativi osservati e resume appartengono a un'istanza operativa separata dalla definizione immutabile.
5. I Runtime legacy mescolano in alcuni casi costruzione, stato, payload e timestamp; la continuità vigente li classifica come non integrati e richiede un boundary esplicitamente rivisto.
6. `CapabilityExecutionResult` e gli stati derivati dimostrano che Execution result e Knowledge state sono artefatti causali distinti; non devono essere assorbiti nella sessione.

## Current Pipeline Position

```text
KnowledgeAcquisitionRequirement                     [Core; frozen]
→ KnowledgeAcquisitionDesign                        [Core]
→ KnowledgeAcquisitionCapabilityMatch               [Core; 0..N]
→ KnowledgeAcquisitionSolutionDecision              [Application]
→ KnowledgeAcquisitionCapabilityCompositionDesign   [Application; composed only]
→ KnowledgeAcquisitionCapabilityConfiguration       [Application; declarative]
→ KnowledgeAcquisitionPlan                          [Application; declarative, immutable]
→ KnowledgeAcquisitionRuntimeSession                [Application; first operational boundary]
→ Execution Preparation / Execution                 [downstream; not approved]
→ Provider / Adapter invocation                     [downstream; not approved]
→ Knowledge Result / Observation                    [downstream; not approved]
→ Knowledge State Update                            [downstream; not approved]
```

Il livello dichiarativo termina al Plan. La creazione di una Runtime Session è il passaggio esplicito da “che cosa è pianificato” a “quale istanza operativa ne sta seguendo il lifecycle”.

## Candidate Downstream Components

| Candidato | Esito | Motivazione repository-first |
|---|---|---|
| `KnowledgeAcquisitionRuntimeSession` | **APPROVED** | introduce la minima identità operativa e lo stato necessario senza eseguire il Plan |
| Runtime | respinto come nome/contratto iniziale | troppo ampio; rischia di assorbire sessione, orchestration, invocation e risultati |
| Runtime Definition | respinto | duplica Plan, item e dipendenze dichiarative senza responsabilità autonoma |
| Execution Request | respinto come primo consumer | presuppone un'unità eseguibile, binding e tentativo prima che esista una sessione |
| Execution Preparation | respinto come primo consumer | richiede decisioni su readiness, ordering e binding non giustificate |
| Plan State separato | respinto | suggerisce stato appartenente al Plan; lo stato è della sessione Plan-scoped |
| Provider/Adapter Binding | respinto | availability, registry e integrazione sono operativi e successivi |

## Declarative-to-Operational Boundary

Classificazione delle responsabilità per la prossima Foundation `KnowledgeAcquisitionRuntimeSession`:

| Responsabilità | Classificazione | Nota |
|---|---|---|
| riferimento a un Plan valido e immutabile | IN SCOPE | fonte causale primaria |
| identity distinta della sessione | IN SCOPE | non modifica né ridefinisce l'id del Plan |
| lifecycle della sessione | IN SCOPE | stato esplicito e transizioni valide |
| stato corrente e avanzamento per Plan Item | IN SCOPE | proiezione operativa separata dagli item dichiarativi |
| selezione/riferimento dell'item attivo | IN SCOPE | scelta runtime tra item eleggibili, senza riscrivere dipendenze |
| timestamp di creazione/transizione | IN SCOPE | osservazioni operative, esclusi dall'identità del Plan |
| sospensione, resume, completamento, fallimento, abbandono | IN SCOPE | stati/transizioni della sessione; non satisfaction del Requirement |
| contatori/riferimenti a tentativi realmente osservati | DOWNSTREAM | richiedono prima un contratto di Execution/attempt |
| retry policy o retry automatico | FORBIDDEN | orchestration non autorizzata |
| error details, output e risultati | DOWNSTREAM | appartengono a Execution/Result, non allo stato minimo della sessione |
| eventi/event log | DOWNSTREAM | osservabilità e persistence richiedono review dedicata |
| provider binding | FORBIDDEN | nessun registry, adapter o availability nel primo consumer |
| scheduling, queue, dispatch, concurrency | FORBIDDEN | orchestration downstream |

Il lifecycle minimo potrà distinguere stati equivalenti a created/active/suspended/completed/failed/abandoned, ma il vocabolario esatto e le transizioni devono essere definiti e testati in E-14. “Failed” descrive la sessione operativa; non implica Requirement non soddisfatto e non incorpora un errore provider.

## State Ownership

`KnowledgeAcquisitionPlan` resta immutabile per tutta l'esecuzione. Non riceve status, current item, timestamp, tentativi, output o risultati.

La `KnowledgeAcquisitionRuntimeSession` possiede:

- lifecycle e stato corrente della singola istanza;
- proiezione dello stato operativo di ogni Plan Item;
- avanzamento e riferimento all'item attivo;
- sospensione, resume e terminazione della sessione;
- timestamp operativi deterministici rispetto agli input espliciti della transizione.

Future Execution possiede tentativi, start/end dell'esecuzione, errori tecnici e outcome dell'unità eseguibile. Future Result/Observation possiede gli output acquisiti e la relativa provenance. Knowledge Update resta una trasformazione separata, evidence-backed e ricalcolabile; non è una mutazione della Session né del Plan.

## Runtime vs Execution Boundary

- **Runtime Session**: conserva il contesto operativo e decide quale Plan Item è attivo/eleggibile secondo lo stato e le dipendenze già dichiarate. Non invoca nulla.
- **Execution**: rappresenta un tentativo concreto di realizzare una futura unità operativa derivata da un Plan Item. Il suo contratto non è approvato da questa review.
- **Provider/Adapter invocation**: traduce una Execution autorizzata verso un'integrazione concreta; gestisce binding e I/O esterno fuori dalla Session.
- **Knowledge Result**: registra l'output semantico/provenance risultante, distinto dall'esito tecnico dell'invocazione.
- **Knowledge state update**: ingerisce evidenza valida e ricostruisce ledger/snapshot/coverage; non marca direttamente il Requirement come soddisfatto.

La Session può in futuro referenziare Execution e Result, ma non contenerne payload o sostituirne i contratti.

## Cardinality and Causality

```text
1 KnowledgeAcquisitionPlan → 0..N KnowledgeAcquisitionRuntimeSession
1 KnowledgeAcquisitionRuntimeSession → exactly 1 source Plan
1 Plan Item → exactly 1 session item-state projection within a Session
1 session item-state projection → exactly 1 source Plan Item
```

La fonte causale obbligatoria è `sourceKnowledgeAcquisitionPlanRef`; ogni item-state conserva il `sourcePlanItemRef`. Le dipendenze causali del Plan restano referenziate, non copiate né riscritte.

L'identità della Session deve essere distinta e non content-derived soltanto dal Plan: più esecuzioni dello stesso Plan sono lecite. E-14 dovrà ricevere un `sessionId`/correlation input esplicito e stabile o un'identità equivalente fornita dall'Application; timestamp casuali e stato mutevole non devono cambiare l'identità della sessione.

- **ricostruzione**: ricrea la stessa Session da snapshot/eventi autorevoli futuri senza creare una nuova identità;
- **resume**: continua la stessa Session e preserva Plan ref, session id e stato già osservato;
- **nuova esecuzione**: crea una nuova Session distinta che può riferire lo stesso Plan;
- **future unità operative**: derivano causalmente da un Plan Item più la Session; non sono identiche al Plan Item e possono avere cardinalità 0..N.

## Ownership Decision

`KnowledgeAcquisitionRuntimeSession` è **Application-owned**.

Motivazione: consuma un artefatto Application, applica lifecycle e coordinamento di use case, e resta indipendente da provider, storage e trasporto. Core rimane puro e congelato. Runtime infrastructure potrà ospitare clock, persistence, queue o adapter, ma non possiede il contratto semantico della sessione.

## Responsibilities In Scope

- contratto chiuso della Runtime Session e degli item-state;
- riferimento causale esatto a Plan e Plan Item;
- identity/correlation distinta dal Plan;
- lifecycle e transizioni esplicite;
- progressione e active item senza execution;
- timestamp ricevuti esplicitamente, serializzabilità e immutabilità degli snapshot;
- validator locale e contextual validator rispetto al Plan;
- ricostruzione e resume semantici della stessa identità, senza persistence;
- fixture, test, regression, health ed export Application minimi.

## Responsibilities Downstream

- definizione di Execution/attempt e relativa causality;
- execution preparation/readiness;
- error model e result model;
- eventi e observation model operativi;
- persistence, repository e recovery implementation;
- provider/adapter invocation e Knowledge Result;
- evidence ingestion, Coverage recalculation, satisfaction e Knowledge Update.

## Forbidden Responsibilities

- mutare o arricchire Plan, Configuration o boundary Core;
- reinterpretare Plan Dependency come schedule statico;
- provider discovery/binding, registry, credentials o endpoint;
- queue, scheduler, dispatch, concurrency, retry o timeout policy;
- invocation payload, prompt, model o chiamate esterne;
- output, risultati, reporting, persistence, REST o UI;
- aggiornare direttamente Ledger, Snapshot, Coverage o Requirement satisfaction.

## Rejected Alternatives

Una `KnowledgeAcquisitionRuntimeDefinition` è ridondante: il repository non mostra un gap dichiarativo tra Plan e istanza operativa. Un generico `KnowledgeAcquisitionRuntime` è troppo poco vincolato e favorisce un aggregato monolitico. `ExecutionRequest` ed `ExecutionPreparation` anticipano una semantica di tentativo e binding che il Plan vieta e che nessuna evidenza corrente rende necessaria come primo consumer. Riutilizzare Beta Session o Interview Runtime importerebbe lifecycle e payload specifici del prodotto, violando l'isolamento della pipeline Knowledge Acquisition.

## Risks and Guardrails

- “Runtime” non deve diventare sinonimo di execution engine.
- Active item non autorizza scheduling completo: seleziona soltanto uno stato locale eleggibile.
- Composed logical dependencies non sono automaticamente ordine totale.
- Failed/completed sono lifecycle della Session, non satisfaction del Requirement.
- Resume non crea una nuova Session; rerun sì.
- Nessun clock implicito nell'identità; i test devono iniettare timestamp.
- Nessuna persistence è implicata dalla ricostruibilità.
- Core e API esistenti restano invariati.

## Next Authorized Task

```text
0100E-14 — Knowledge Acquisition Runtime Session Foundation
```

Il task è autorizzato soltanto per la Foundation Application-owned descritta in “Responsibilities In Scope”. Non autorizza Execution, provider/adapter, orchestration, persistence, risultati o Knowledge Update. Non servono ulteriori contratti intermedi prima della Session; dopo la Session, il prossimo boundary dovrà essere deciso con una nuova review repository-first.

## Continuity Impact Assessment

Classificazione: **BOUNDARY** (include DECISION, ARCHITECTURE e STATUS).

| Documento | Impatto | Azione | Motivazione |
|---|---|---|---|
| `README.md` | STATUS | aggiornato | next gate E-14 |
| `CONTINUITY.md` | ARCHITECTURE/STATUS | aggiornato | registra decisione e stato E-13 |
| `CORE_ARCHITECTURE.md` | BOUNDARY | aggiornato | aggiunge il primo boundary operativo |
| `DECISIONS.md` | DECISION | aggiornato | registra ADR post-Plan |
| `NEXT_PHASE.md` | STATUS | sostituito | autorizza soltanto E-14 |
| `CORE_ROADMAP.md` | STATUS/DECISION | aggiornato | E-13 completed, E-14 planned |
| governance direct test | STATUS | aggiornato | expected planned task derivato dallo stato autorevole |
| freeze, codice, contratti e API | NONE | invariati | nessun cambiamento autorizzato |

## Verification

```text
Continuity governance static check  PASS (plannedTask: 0100E-14; errors: 0)
Continuity governance direct test   PASS
Core aggregate suite                PASS (IMAGO Core all tests PASSED)
Overall health check                PASS (All health checks passed)
Document static checks              PASS (16 required sections; manifest present; scoped paths only)
git diff --check                    PASS
```

Branch: `task/0100e-13`.

Base e HEAD iniziale: `origin/milestone/0100b-knowledge-foundation` @ `10418bb3001e10b9de6a543494c4f6bcc1b80410`.

Nessuno staging, commit, push o integrazione nella milestone è stato eseguito.

## Self-review

Esito: **CONFORMING WITH NOTES**.

La review risponde a consumer, boundary dichiarativo-operativo, ownership dello stato, distinzione Runtime/Execution, cardinalità, causalità e ownership senza implementare il componente approvato. La nota impedisce che E-14 assorba Execution e integrazioni. Il diff è limitato a report, manifest, continuità e minimo aggiornamento state-driven del test di governance. Nessun file produttivo, contratto, API o comportamento Runtime esistente è modificato.

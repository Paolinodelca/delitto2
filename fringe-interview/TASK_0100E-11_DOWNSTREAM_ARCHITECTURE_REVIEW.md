# TASK 0100E-11 — Knowledge Acquisition Capability Configuration Downstream Architecture Review

## Esito

**APPROVED**

Il primo consumer downstream autorizzato di `KnowledgeAcquisitionCapabilityConfiguration` è:

```text
KnowledgeAcquisitionPlan
Ownership: Application
Nature: declarative, immutable, post-Configuration, pre-Runtime
```

La review approva la direzione, non la implementa. Nessuna Foundation, API, contratto o modifica comportamentale è introdotta.

## Ispezione repository-first

Sono stati verificati i documenti CURRENT nell'ordine dell'authority index, workflow, roadmap Core, boundary freeze, ADR, report E-1/E-3/E-5/E-7/E-9, report e manifest E-10 e i precedenti D-9/D-10 pertinenti. L'ispezione del codice ha incluso pipeline Knowledge Acquisition, export Core/Application, builder, validator locale e contestuale, identity, fixture, test, regression e health della Configuration, oltre ai componenti legacy di planning, Runtime, interview, measurement, capability recipe, evidence intake e reporting.

Evidenze decisive:

- Configuration esiste solo per `single` o `composed`, preserva capability selezionate e valori dichiarativi espliciti;
- `composed` preserva Composition Design come fonte causale diretta; `single` non fabbrica una composizione;
- E-10 separa validazione locale e contestuale e rifiuta provider, adapter, registry, invocation, planning, execution, result, satisfaction e update;
- le review precedenti rifiutavano Plan perché mancavano scelta, composizione e configurazione; questi prerequisiti dichiarativi ora esistono;
- i Plan legacy (interview, evidence collection, code generation) hanno input e ownership incompatibili;
- Runtime e Reporting esistenti non consumano Phase D/E.

## Boundary upstream congelato

```text
Requirement                             [Core]
→ Design                                [Core]
→ 0..N Match                            [Core]
→ Solution Decision                     [Application]
→ Composition Design                    [Application; composed soltanto]
→ Capability Configuration              [Application; single/composed]
```

`none` resta terminale e `deferred` sospeso: non hanno Configuration e non producono Plan. Phase D, Decision, Composition Design e Configuration non vengono reinterpretati o modificati.

## Primo consumer autorizzato

`KnowledgeAcquisitionPlan` traduce una Configuration valida e contestualmente verificata in una descrizione dichiarativa delle unità necessarie a realizzare la soluzione adottata. Organizza responsabilità e dipendenze logiche già approvate senza risolvere chi o cosa le eseguirà.

```text
1 valid Configuration → 1 Plan
1 Plan → exact Configuration selected capability refs
1 selected capability → exactly 1 declarative plan unit
none/deferred → 0 Configuration → 0 Plan
```

Una plan unit identifica la capability e la relativa porzione di Configuration. Per `composed`, preserva ruoli e dipendenze logiche senza convertirle in ordine esecutivo. Più invocation per capability non sono deducibili dal repository e restano fuori dal contratto iniziale.

## Alternative

| Candidata | Esito | Motivazione |
|---|---|---|
| `KnowledgeAcquisitionPlan` | **APPROVED** | responsabilità autonoma dopo scelta, composizione e configurazione; resta pre-Runtime |
| Configuration Readiness | respinta | duplica il validator contestuale |
| Invocation Specification | respinta | anticipa payload, endpoint e ordine Runtime |
| Provider/Adapter Binding | respinta | richiede registry, availability e integration ownership |
| Execution Recipe/Schedule | respinta | incorpora algoritmo, timing, retry e orchestration |
| legacy interview/evidence Plan | respinta | ownership e input incompatibili |
| Result/Satisfaction/Update | respinta | salta esecuzione, evidenza e ricalcolo Coverage |

## Boundary da congelare

1. Plan è Application-owned, immutabile, dichiarativo, post-Configuration e pre-Runtime.
2. Consuma una Configuration già valida; non la completa o corregge.
3. Non consuma Match per ridecidere e non effettua discovery o reselection.
4. Le capability refs coincidono esattamente con la Configuration.
5. `single` e `composed` condividono il contratto; `single` non è una composizione.
6. Per `composed`, ruoli e dipendenze restano autorevoli nella Composition Design; il Plan li preserva senza duplicarli o ordinarli.
7. I valori restano autorevoli nella Configuration; il Plan non introduce override.
8. Plan unit non equivale a invocation, job, step eseguibile, schedule o provider binding.
9. Validità non implica availability, readiness o executability.
10. Nessun loop automatico è introdotto per `none`, `deferred`, failure o incompletezza.

## Contratti intermedi

**Nessun nuovo contratto intermedio è necessario.** Configuration e validator contestuale forniscono già selezione, corrispondenza, requiredness, allowlist, tipi e constraint. Readiness Result, envelope, normalized composition o Capability Binding sarebbero ridondanti o operativi.

Il Plan richiederà builder, validator locale e validator contestuale propri: sono servizi dello stesso boundary, non domini intermedi. Query, collection e plan-unit identity autonoma non sono autorizzate.

## Responsabilità del Plan

- Configuration come fonte causale diretta;
- preservare mode, exact capability refs e, per `composed`, Composition Design;
- produrre una unità dichiarativa canonica per capability;
- associare ogni unità ai configuration item senza copiarne o cambiarne i valori;
- preservare responsabilità e dipendenze logiche composed;
- identity content-derived, provenance, dependency refs, versioning e canonical ordering;
- purezza, determinismo, immutabilità e separazione local/contextual validation.

## Fuori scope

- discovery, ranking, registry, provider/adapter resolution e availability;
- credentials, endpoint, invocation payload, prompt, model, token e API binding;
- ordine esecutivo, scheduler, concurrency, orchestrator, retry, timeout e failure policy;
- Runtime, Execution, result collection, evidence ingestion, satisfaction e Knowledge Update;
- Reporting/Beta/legacy integration, persistenza, filesystem, database, rete, API, UI e LLM;
- modifiche a contratti upstream, Core consolidato o comportamento E-10.

## Ownership

| Responsabilità | Owner |
|---|---|
| Requirement, Design, Match | Core |
| discovery, Decision, Composition Design, Configuration, Plan | Application |
| provider/adapter binding | futuro Application/Adapter boundary; non approvato |
| invocation, orchestration, execution, results | futuro Runtime; non approvato |
| satisfaction, Coverage recalculation, Knowledge Update | futura review |
| Reporting integration | futura review |

Core non deve importare Plan o Configuration. Runtime non deve essere assorbito nel Plan.

## Identity, causalità e validazione

Identity deterministica su contract version, `sourceCapabilityConfigurationRef`, mode, exact capability refs e unità canoniche; esclusi timestamp, input order, environment, availability e runtime state. Causalità diretta: `Configuration → Plan`. Per `composed`, il contextual validator verifica anche la Composition Design fornita, senza lookup.

Il validator locale controlla closed shape, cardinalità, ordine, unicità, identity, serializzabilità e campi vietati. Quello contestuale controlla exact correspondence con Configuration e Composition Design. Nessuno prova availability o executability.

## API candidate e verifiche future

```text
buildKnowledgeAcquisitionPlan
validateKnowledgeAcquisitionPlan
validateKnowledgeAcquisitionPlanContext
healthKnowledgeAcquisitionPlan
```

Test futuri: single/composed; exact causality; one unit per capability; dependency preservation; mismatch rejection; no value override; deterministic identity; order invariance; mutation isolation; local/contextual separation; rejection ricorsiva di registry/provider/adapter/invocation/order/schedule/runtime/execution/result/satisfaction/update; public API regression; upstream freeze; health; Core aggregate; overall health.

## Prossimo task autorizzato

```text
0100E-12 — Knowledge Acquisition Plan Foundation
```

Solo contratto Application dichiarativo, builder, validator locale/contestuale, fixture/test/regression/health ed export Application minimi. Nessuna autorizzazione per Runtime, provider/adapter binding, invocation o execution.

## Continuity Impact Assessment

Classificazione: **DECISION** (include ARCHITECTURE e STATUS; freeze upstream invariati).

| Documento | Impatto | Azione |
|---|---|---|
| `README.md` | STATUS | next gate riallineato |
| `CONTINUITY.md` | STATUS | E-11 e Plan approvato/non implementato |
| `CORE_ARCHITECTURE.md` | ARCHITECTURE | direzione Plan aggiunta |
| `DECISIONS.md` | DECISION | boundary post-Configuration registrato |
| `NEXT_PHASE.md` | STATUS | avanzato a E-12 |
| `CORE_ROADMAP.md` | STATUS/DECISION | E-11 completato, E-12 pianificato |
| boundary freeze, codice, contratti e API | NONE | invariati |

## Self-review

La scelta colma il gap senza wrapper ridondanti e separa Planning dichiarativo da invocation e Runtime. Ownership, causalità, cardinalità, validation, identity e fuori-scope sono espliciti. Nessun task successivo è stato implementato.

Verifiche finali:

```text
Continuity governance static check  PASS (plannedTask: 0100E-12)
Continuity governance direct test   PASS
Core aggregate suite                PASS (IMAGO Core all tests PASSED)
Overall health check                PASS (All health checks passed)
Document static checks              PASS (git diff --check)
```

Esito finale: **APPROVED**.

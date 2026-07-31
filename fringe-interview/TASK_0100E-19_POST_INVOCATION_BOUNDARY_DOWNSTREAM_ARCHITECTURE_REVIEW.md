# Task 0100E-19 — Post-Invocation-Boundary Downstream Architecture Review

## 1. Executive Summary

Esito repository-first: **APPROVED WITH NOTES**.

Il primo componente Infrastructure autorizzabile a implementare concretamente `KnowledgeAcquisitionInvocationPort` è un **Knowledge Acquisition Invocation Adapter capability-specific**. L'Adapter consuma il solo `KnowledgeAcquisitionInvocationInput`, traduce l'operazione technology-neutral per una capability già selezionata e invoca il Provider o la capability esterna. È il primo componente autorizzato, in una futura Foundation esplicita, a produrre il side-effect reale.

Il port rimane Application-owned; la sua implementazione è Infrastructure-owned. Adapter e Provider sono due livelli differenti: l'Adapter protegge il boundary applicativo e traduce il contratto, mentre il Provider espone o realizza il meccanismo esterno. Un Adapter generico richiederebbe routing, registry o resolution non presenti né autorizzati. Il Provider non può implementare direttamente il port senza accoppiarsi alla semantica Application. Non è giustificato un ulteriore boundary semantico tra port e Adapter.

La selezione/binding dell'Adapter e dell'eventuale Provider appartiene alla futura composition/bootstrap Infrastructure, non all'Adapter durante `invoke` e non ad alcun artefatto upstream. Questa review decide l'architettura ma non implementa né autorizza ancora Adapter, Provider, selection mechanism o side-effect.

## 2. Repository Review

La review ha verificato materialmente:

- `KnowledgeAcquisitionExecution`, builder, transizioni e validator: Execution termina a `ready_for_invocation`, è Application-owned, immutable, side-effect-free e vieta Provider, Adapter, transport, callback, result e persistence;
- `KnowledgeAcquisitionInvocationInput`, builder, identity fingerprint e validator: valore effimero, deeply immutable, senza identity autonoma o lifecycle, con una sola operazione `acquire_knowledge`, un solo `capabilityRef` e soli `configurationItemRefs`;
- `KnowledgeAcquisitionInvocationPort`: contratto strutturale Application-owned composto esclusivamente dalla funzione `invoke`;
- Capability Configuration: valori dichiarativi non-secret legati a capability già selezionate, senza provider/adapter discovery o resolution;
- Plan: un item per capability selezionata, senza dispatch, scheduling, invocation o binding;
- Runtime Session: lifecycle e active-item selection, ma nessuna invocation o integrazione;
- documenti E-15, E-16, E-17 ed E-18: separazione progressiva Session → Execution → Invocation port e rinvio esplicito del primo consumer Infrastructure a E-19;
- `CORE_ARCHITECTURE`, `DECISIONS`, `CORE_ROADMAP`, `NEXT_PHASE` e `CONTINUITY`: dependency direction `Infrastructure → Application port`, Adapter come primo consumer tecnologico e Provider dietro l'Adapter;
- public API CommonJS/ESM: espone builder/validator/input/port health, ma nessun artefatto Infrastructure;
- adapter legacy Parser/Interview e store Session: esempi subsystem-specific non causalmente connessi al nuovo flusso; non costituiscono contratti riutilizzabili implicitamente.

Il repository non contiene un registry, resolver, provider abstraction o composition contract collegato causalmente alla pipeline Knowledge Acquisition. Non è quindi lecito assumere tali componenti come prerequisiti.

## 3. Candidate Components

### A. Adapter generico

- **Responsabilità proposta:** implementare il port e instradare qualunque `capabilityRef` verso un'integrazione.
- **Ownership:** Infrastructure.
- **Creator:** composition/bootstrap Infrastructure.
- **Consumer:** un Provider o un Adapter successivo scelto dinamicamente.
- **Cardinalità:** uno per più capability; richiederebbe 1:N routing.
- **Lifecycle:** process/application scoped oppure per-call, non definito.
- **Mutabilità:** potrebbe conservare registry/client; non può mutare l'input.
- **Causalità:** dopo il port, prima del componente capability-specific.
- **Visibilità:** Infrastructure; Application vede solo il port.
- **Dipendenze:** port Application più registry/resolver/mapping non esistenti.
- **Responsabilità vietate:** reinterpretare Plan/Execution, effettuare discovery implicita, introdurre retry/result/persistence.
- **Decisione:** respinto come primo componente. Aggiunge un livello di dispatch e dipendenze non giustificati.

### B. Adapter capability-specific

- **Responsabilità:** implementare `invoke`, accettare una singola operazione già risolta semanticamente, verificare/supportare la capability assegnata, tradurla nel protocollo del Provider e compiere la call esterna.
- **Ownership:** Infrastructure.
- **Creator:** composition/bootstrap Infrastructure.
- **Consumer:** Provider o capability esterna concreta.
- **Cardinalità:** 0..N implementazioni disponibili; esattamente una implementazione già scelta/iniettata per un crossing; una implementazione supporta una capability semanticamente delimitata.
- **Lifecycle:** Infrastructure-managed; istanza process-scoped o per-call senza introdurre lifecycle Application.
- **Mutabilità:** può possedere client/configurazione tecnica privata; l'input e gli upstream snapshot restano immutable.
- **Causalità:** valid Invocation Input → Adapter → Provider/external capability.
- **Visibilità:** concreto solo in Infrastructure/composition; Application conosce esclusivamente il port.
- **Dipendenze:** dipende dal port/input Application e dal client/provider downstream; nessuna dipendenza inversa.
- **Responsabilità vietate:** selezionare semanticamente capability, cercare Adapter/Provider durante la call, mutare Session/Execution, orchestrare più item, retry, persistence, result/outcome, satisfaction o Knowledge Update.
- **Decisione:** approvato come primo componente downstream da progettare in una futura Foundation.

### C. Provider abstraction come implementazione diretta

- **Responsabilità proposta:** esporre la capability concreta e implementare direttamente `invoke`.
- **Ownership:** Infrastructure o sistema esterno.
- **Creator:** vendor/client integration o bootstrap.
- **Consumer:** sistema esterno.
- **Cardinalità:** potenzialmente molti Provider per capability.
- **Lifecycle/mutabilità:** provider-specific.
- **Causalità:** collegherebbe direttamente Application semantics e vendor operation.
- **Visibilità/dipendenze:** renderebbe il Provider consapevole del contratto Application.
- **Responsabilità vietate:** conoscere Execution, Session e Plan come semantica propria.
- **Decisione:** respinto. Collassa anti-corruption/translation e meccanismo esterno.

### D. Ulteriore boundary intermedio

- **Responsabilità proposta:** binding, dispatch, request o provider selection prima dell'Adapter.
- **Ownership/creator/consumer:** non stabiliti dal repository.
- **Cardinalità/lifecycle/mutabilità:** irrisolti e duplicativi rispetto al port/input effimero.
- **Dipendenze:** richiederebbe nuovi contratti e policy.
- **Responsabilità vietate:** duplicare Execution authorization, Invocation Input o Plan.
- **Decisione:** respinto. Non esiste un gap semantico: esiste soltanto il futuro composition binding tecnico.

## 4. Boundary Comparison

| Candidato | Implementa il port | Traduce Application → tecnologia | Richiede componenti non presenti | Produce il primo effect | Esito |
|---|---:|---:|---:|---:|---|
| Adapter generico | sì | parzialmente | registry/resolver/routing | possibile | REJECTED |
| Adapter capability-specific | sì | sì | solo dipendenze tecniche esplicite future | sì | APPROVED |
| Provider diretto | tecnicamente possibile, semanticamente errato | no | accoppiamento Provider/Application | sì | REJECTED |
| Boundary intermedio | no | no | nuovo contratto/policy | no | REJECTED |

## 5. Responsibility Matrix

| Componente | Responsabilità consentita | Responsabilità vietata |
|---|---|---|
| Invocation Port/Input | esprimere e validare una richiesta technology-neutral | I/O, selection, binding, result |
| Composition/bootstrap Infrastructure | scegliere e costruire l'implementazione compatibile | cambiare capability scelta o dati upstream |
| Adapter capability-specific | implementare il port, tradurre, invocare | routing generico, policy runtime, semantic selection |
| Provider | eseguire/esporre il meccanismo concreto | conoscere o governare pipeline Application |
| Execution/Session/Plan/Configuration | mantenere causalità e semantica approvata | conoscere Adapter, Provider, endpoint o transport |

## 6. Ownership Matrix

| Elemento | Owner | Creator | Consumer |
|---|---|---|---|
| Invocation Port e Input | Application | Application boundary builder/module | Adapter Infrastructure |
| Binding dell'implementazione | Infrastructure composition/bootstrap | composition root | call site Application tramite port iniettato |
| Adapter capability-specific | Infrastructure | composition/bootstrap | Provider/external capability |
| Provider/client | Infrastructure integration o sistema esterno | vendor/bootstrap | Adapter |
| Output/result futuro | non deciso | non autorizzato | non autorizzato |

## 7. Lifecycle Matrix

| Elemento | Lifecycle autorizzato |
|---|---|
| Runtime Session | `created`, `active`, `suspended`, `completed`, `abandoned` |
| Execution | `created` → `selected` → `ready_for_invocation` |
| Invocation Input | build → validate → pass; effimero |
| Adapter | Infrastructure-managed; nessuno stato Application |
| Singola call | inizia con l'azione effectful dell'Adapter; completamento non modellato |
| Provider | provider-specific e fuori dal lifecycle Application |

## 8. Visibility Matrix

| Concern | Core | Application upstream | Port/Input | Infrastructure Adapter | Provider |
|---|---:|---:|---:|---:|---:|
| capability semantica scelta | refs storiche | sì | una ref | read-only | non richiesto |
| causal refs | no nuovo accesso | sì | sì | read-only | no |
| implementazione Adapter | no | no | abstraction only | sì | no |
| Provider/client/credentials | no | no | no | privato | sì |
| selection/binding | no | no | no | già risolto | n/a |
| transport/external I/O | no | no | no | sì | sì |

## 9. Dependency Direction

La direzione vincolante è:

```text
Infrastructure composition
  → capability-specific Invocation Adapter
    → Application-owned KnowledgeAcquisitionInvocationPort/Input

capability-specific Invocation Adapter
  → Provider/client/external capability
```

Application non importa Infrastructure. Core non importa Application né Infrastructure. Il Provider non diventa un contratto Application. L'iniezione collega l'implementazione al port senza cambiare ownership.

## 10. Side-Effect Analysis

Restano effect-free: build/transition di Execution, build e validazione dell'Invocation Input, fingerprint, port-shape validation e binding/composizione in memoria.

Il primo side-effect autorizzabile è l'operazione concreta dell'Adapter capability-specific che attraversa il confine verso il Provider o la capability esterna. La semplice creazione dell'Adapter o l'iniezione nel call site non è il side-effect applicativo in esame.

E-19 non autorizza l'esecuzione di tale effetto. Autorizza soltanto questa collocazione architetturale per il gate successivo.

## 11. Adapter Analysis

L'Adapter deve essere **capability-specific**, non generico. L'input contiene esattamente una capability già selezionata; un Adapter generico dovrebbe trasformare quella ref in un altro componente tramite registry, resolver, lookup o branching centralizzato. Nessuno di tali meccanismi è presente o autorizzato. La specializzazione conserva località del cambiamento, impedisce che l'Adapter ripeta la Solution Decision e mantiene esplicita la compatibilità tra port implementation e capability.

L'Adapter implementa concretamente `KnowledgeAcquisitionInvocationPort`. Deve ricevere l'input immutable, rifiutare una capability non supportata e tradurre senza modificare il significato di `acquire_knowledge`. La gestione di timeout, retry, queue, result e failure semantics rimane fuori scope.

## 12. Provider Analysis

Provider e Adapter sono livelli differenti:

- l'Adapter è repository-owned Infrastructure e implementa il contratto Application;
- il Provider/client è l'interfaccia tecnica o il sistema esterno utilizzato dall'Adapter;
- il Provider non riceve necessariamente l'Invocation Input e non deve conoscere Execution/Session/Plan;
- l'Adapter può incapsulare direttamente un SDK/client senza rendere necessaria una nuova Provider abstraction repository-owned.

La distinzione è semantica e di dipendenza, non un obbligo a creare due file o due classi. Il repository non giustifica oggi una Provider abstraction autonoma.

## 13. Capability Analysis

La capability è già scelta da Solution Decision, Configuration e Plan; l'Invocation Input ne porta la singola ref. L'Adapter non può scegliere una capability alternativa. La specializzazione deve essere dichiarata dalla composizione Infrastructure e verificabile dall'Adapter al boundary.

La selezione del Provider non appartiene a `invoke`: un Provider/client concreto deve essere già fornito all'Adapter dalla composition/bootstrap Infrastructure. Se in futuro una capability richiederà selezione dinamica tra più Provider, quella policy richiederà una review dedicata; non può essere nascosta in un Adapter generico.

## 14. Architectural Decision

1. Primo consumer Infrastructure approvato: **capability-specific Knowledge Acquisition Invocation Adapter**.
2. Primo componente autorizzabile a produrre un side-effect: lo stesso Adapter, nel momento in cui invoca il Provider/external capability.
3. Implementazione concreta del port: Adapter Infrastructure capability-specific.
4. Adapter e Provider: livelli distinti; nessun Provider diretto implementa il port.
5. Provider/client binding: composition/bootstrap Infrastructure, prima della call.
6. Adapter selection: composition/bootstrap Infrastructure, non Adapter self-selection.
7. Ulteriore boundary semantico: non richiesto.
8. Nuovo registry, resolver, factory o Provider abstraction: non approvati.
9. E-19 resta review-only: nessun componente o effect è implementato.

## 15. Guardrails

1. Non modificare port, input, Execution, Session, Plan, Configuration o Core per accomodare tecnologia.
2. Mantenere `Infrastructure → Application port`.
3. Un Adapter supporta una capability semanticamente delimitata e non effettua routing generico.
4. Adapter e Provider/client sono già scelti e iniettati dalla composition Infrastructure.
5. Nessuna discovery, registry, resolver, factory o fallback implicito.
6. Nessuna mutazione degli input o snapshot upstream.
7. Nessun retry, timeout policy, scheduler, queue, concurrency o orchestration.
8. Nessun Result, Outcome, response mapping, persistence o event model.
9. Nessuna Requirement satisfaction o Knowledge Update.
10. Nessuna assunzione HTTP, REST, RPC, MCP, SDK, LLM, rete o vendor.
11. La futura Foundation deve dimostrare causalità e capability compatibility senza ampliare il port.
12. Ogni Provider selection dinamica o output contract richiede un gate repository-first separato.

## 16. Self Review

- Repository-first e fonte di verità locale: PASS.
- Execution, Invocation Input/Port, Configuration, Plan e Session analizzati: PASS.
- E-15 → E-18 e documentazione authority analizzati: PASS.
- public API e adapter legacy ispezionati: PASS.
- tutti i candidati descritti per responsabilità, ownership, creator, consumer, cardinalità, lifecycle, mutabilità, causalità, visibilità, dipendenze e divieti: PASS.
- primo side-effect e implementatore concreto identificati: PASS.
- Adapter/Provider e selection responsibility distinti: PASS.
- boundary intermedio valutato: PASS.
- nessun componente, contratto, validator, builder o test implementato/modificato: PASS.

Verifiche finali eseguite dal worktree `task/0100e-19`:

| Verifica | Risultato |
|---|---|
| `node scripts/check_continuity_governance.js` | PASS — 7 documenti CURRENT, 45 task roadmap, `plannedTask: 0100E-20`, 0 errori |
| `node scripts/test_continuity_governance.js` | PASS — governance aggregate/direct |
| `node scripts/test_all_core.js` | PASS — tutti i gruppi e l'aggregate IMAGO Core passano |
| `node scripts/fringe_health_check.js` | PASS — tutti gli health check, incluso Invocation Boundary, passano |
| Document static checks | PASS — 18/18 sezioni, outcome ammesso e scope documentale conforme |
| manifest ↔ worktree | PASS — corrispondenza esatta dei sette file del task completo |
| `git diff --check` | PASS |
| whitespace check sugli untracked | PASS — necessario perché `git diff --check` non include file untracked |

Stato Git verificato: branch `task/0100e-19`, HEAD `a1bcb682d54eb5d717d159628d40e060ce081ae3`; i due deliverable E-19 sono untracked e i cinque documenti authority risultano modificati. Nessuno staging, commit, push o integrazione è stato effettuato.

## 17. Residual Risks

- L'Invocation Input espone `configurationItemRefs`, non i valori dichiarativi: il futuro design dovrà provare come l'Adapter riceva i valori necessari senza lookup implicito, registry o ampliamento non autorizzato del port.
- Il port non definisce return/result semantics; una call reale non deve inventare un Result o aggiornare Session/Execution.
- “Capability-specific” potrebbe essere confuso con provider-specific: una capability può avere più integrazioni future, ma nessuna selection dinamica è oggi approvata.
- Adapter e Provider possono essere co-locati tecnicamente; ciò non deve cancellare la separazione di responsabilità.
- Gli adapter legacy chiamano direttamente servizi esterni e contengono retry/provider details: sono solo evidenza di isolamento subsystem-specific, non template normativi per questa pipeline.

Le note impediscono di trattare questa approvazione come autorizzazione all'implementazione o come chiusura delle questioni input/result.

## 18. Next Authorized Gate

Proposta:

```text
0100E-20 — Knowledge Acquisition Capability-Specific Invocation Adapter Foundation
```

Il gate successivo dovrà essere preceduto da un task esplicito e potrà progettare/implementare soltanto il primo Adapter capability-specific conforme ai guardrail, definendo composition binding e accesso ai valori di configurazione senza introdurre registry, resolver, Provider selection dinamica o Result. Fino ad autorizzazione esplicita, nessun Adapter, Provider o side-effect è autorizzato.

## Final Outcome

**APPROVED WITH NOTES**

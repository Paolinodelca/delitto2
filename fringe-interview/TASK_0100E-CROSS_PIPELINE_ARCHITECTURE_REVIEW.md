# Task 0100E — Cross-Pipeline Architecture Review

## Executive conclusion

**CHANGES REQUIRED**

La pipeline Knowledge Acquisition consolidata è correttamente separata per responsabilità, ownership e causalità fino a `KnowledgeAcquisitionRuntimeSession`. Non risultano Execution premature, responsabilità Runtime negli artefatti upstream, né strutture di execution, tentativi, retry, timeout, provider, adapter, invocation, risultati, eventi, persistence o Knowledge Update nella Runtime Session.

La review rileva tuttavia una non-conformità trasversale sul requisito di immutabilità dei componenti dichiarativi. `KnowledgeAcquisitionNeed`, `KnowledgeAcquisitionStrategy`, `KnowledgeAcquisitionRequirement`, `KnowledgeAcquisitionDesign`, `KnowledgeAcquisitionSolutionDecision` e `KnowledgeAcquisitionCapabilityConfiguration` non sono deep-frozen. Inoltre i validator di Need, Strategy, Requirement, Design e Solution Decision non ricalcolano il fingerprint semantico: una mutazione post-build ammessa dallo shape può lasciare valido un oggetto con identità stale. La Configuration ricalcola correttamente l'identità, ma resta mutabile in memoria. Solo Plan e Runtime Session producono snapshot deep-frozen; per la Session questo è corretto perché l'oggetto è uno snapshot immutabile di stato operativo, non un contenitore mutabile condiviso.

Questa divergenza contraddice `metadata.readOnly: true`, le dichiarazioni di continuità che qualificano gli artefatti come immutabili e il guardrail richiesto per la pipeline. Non richiede una riprogettazione dei confini, ma deve essere risolta in un task esplicito prima di autorizzare l'ingresso in Execution.

Base verificata: `origin/milestone/0100b-knowledge-foundation`.

HEAD verificato: `0000f6937723bd0f7b5ea437590826adce7e0bf3`.

## Scope ed evidenze repository-first

Sono stati esaminati:

- contratti, builder, identity, validator locali e contestuali della pipeline;
- export CommonJS/ESM di Core e Application;
- health, fixture, test dedicati, regression, boundary freeze e aggregate;
- `CORE_ARCHITECTURE.md`, `DECISIONS.md`, `NEXT_PHASE.md`, `CONTINUITY.md`, `CORE_ROADMAP.md` e `KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md`;
- review architetturali E-1, E-3, E-5, E-7, E-9, E-11, E-13 e implementation report E-2, E-4, E-6, E-8, E-10, E-12, E-14;
- precedenti Runtime, Session, Capability Execution, Observation/Result e Knowledge derivation solo come evidenza di confine, senza assumerli come consumer compatibili.

La pipeline abbreviata richiesta omette due contratti già necessari e correttamente isolati: `KnowledgeAcquisitionCapabilityMatch` tra Design e Solution Decision e `KnowledgeAcquisitionCapabilityCompositionDesign` tra Decision e Configuration nel solo ramo `composed`. Non sono duplicazioni né nuovi contratti proposti: sono bridge causali esistenti indispensabili.

## Componente, responsabilità, ownership e mutabilità

| Componente | Responsabilità univoca | Ownership | Natura | Mutabilità effettiva | Esito |
|---|---|---|---|---|---|
| `KnowledgeAcquisitionNeed` | dichiara il gap di layer elementare o derivato causato da una Opportunity | Core | dichiarativo | `readOnly` semantico, non frozen; identity non riverificata | non conforme sull'immutabilità |
| `KnowledgeAcquisitionStrategy` | classifica la trasformazione generale necessaria per il Need, senza selezionare mezzi | Core | dichiarativo | `readOnly` semantico, non frozen; identity non riverificata | non conforme sull'immutabilità |
| `KnowledgeAcquisitionRequirement` | dichiara la condizione finale di disponibilità della conoscenza | Core | dichiarativo | `readOnly` semantico, non frozen; identity non riverificata | non conforme sull'immutabilità |
| `KnowledgeAcquisitionDesign` | descrive shape mechanism-neutral, target, obblighi e prerequisiti della soluzione | Core | dichiarativo | `readOnly` semantico, non frozen; identity non riverificata | non conforme sull'immutabilità |
| `KnowledgeAcquisitionCapabilityMatch` | valuta deterministicamente un candidato rispetto a un Design | Core | valutazione dichiarativa ausiliaria | fuori dalla pipeline abbreviata, correttamente Core-owned | conforme al confine |
| `KnowledgeAcquisitionSolutionDecision` | registra la scelta Application fra `single`, `composed`, `none`, `deferred` | Application | decisione | `readOnly` semantico, non frozen; identity non riverificata | non conforme sull'immutabilità |
| `KnowledgeAcquisitionCapabilityCompositionDesign` | descrive ruoli, contributi e dipendenze logiche del solo ramo `composed` | Application | dichiarativo ausiliario | separato da configurazione ed execution | conforme al confine |
| `KnowledgeAcquisitionCapabilityConfiguration` | associa valori dichiarativi non segreti alle capability già selezionate | Application | configurazione | fingerprint riverificato, ma output non frozen | non conforme sull'immutabilità strutturale |
| `KnowledgeAcquisitionPlan` | organizza una unità dichiarativa per capability e preserva dipendenze logiche | Application | pianificazione dichiarativa | deep-frozen e fingerprint-validata | conforme |
| `KnowledgeAcquisitionRuntimeSession` | rappresenta uno snapshot Plan-scoped di lifecycle e item-state operativi | Application | stato operativo pre-Execution | snapshot deep-frozen; identità stabile separata dallo stato | conforme |

## Matrice dei confini

| Confine | Informazione trasferita | Informazione che resta esclusa | Valutazione |
|---|---|---|---|
| Need → Strategy | tipo di gap, scope, layer e causalità | metodo, canale, priorità, selezione | netto |
| Strategy → Requirement | categoria di trasformazione → condizione finale richiesta | soddisfazione, stato, planning | netto; campi di trace duplicati solo per auditabilità |
| Requirement → Design | condizione richiesta più contesto causale risolto esplicito | lookup, capability selection, execution | netto |
| Design → Match → Solution Decision | compatibilità Core per candidato → scelta policy/context Application | discovery/ranking in Core, configuration, plan | netto; Match è necessario |
| Solution Decision → Composition Design | solo `composed`: ruoli, contributi, dipendenze logiche | valori configurati, ordine eseguibile | netto; non normalizza `single` |
| Solution Decision → Capability Configuration | membership già decisa, più Composition Design obbligatorio per `composed` | reselection, provider/adapter, availability, planning | netto |
| Capability Configuration → Plan | capability e riferimenti ai valori configurati; dipendenze logiche preservate | copia dei valori, readiness, scheduling, invocation | netto |
| Plan → Runtime Session | ref esatto al Plan e una proiezione di stato per Plan Item | mutazione del Plan, execution, attempt, result | netto |
| Runtime Session → downstream | Session + Plan Item come contesto causale di una futura unità operativa | contratto non ancora approvato | review E-15 obbligatoria |

### Solution Decision versus Capability Configuration

La Decision possiede la membership della soluzione e la motivazione della scelta. La Configuration non sceglie nuovamente capability: valida copertura esatta dei selected refs e associa soltanto valori espliciti conformi a una Configuration Definition. Nel ramo `composed`, il Composition Design è fonte causale diretta obbligatoria. Il confine è conforme.

### Capability Configuration versus Plan

La Configuration possiede i valori; il Plan conserva riferimenti canonici agli item configurati, non payload duplicati. Il Plan introduce unità e dipendenze dichiarative, ma vieta status, priority, sequence, scheduler, invocation ed execution. Il confine è conforme.

### Plan versus Runtime Session

Il Plan resta dichiarativo e senza stato. La Session possiede status, active item, item-state e timestamp in snapshot separati, con corrispondenza contestuale esatta a tutti i Plan Item. Non interpreta le Plan Dependencies come ordine totale e non muta il Plan. Il confine è conforme.

## Cardinalità e causalità principali

```text
1 Opportunity                     → 1 Need
1 Need                            → 1 Strategy
1 Strategy                        → 1 Requirement
1 Requirement                     → 1 Design
1 Design                          → 0..N Capability Match
1 explicit decision operation     → 1 Solution Decision
1 applicable Decision             → 0..1 Capability Configuration
1 composed Decision               → exactly 1 Composition Design before Configuration
1 single Decision                 → no Composition Design
1 none/deferred Decision          → no Configuration, Plan or Session
1 valid Configuration             → 0..1 canonical Plan
1 Plan                            → 0..N Runtime Session
1 Runtime Session                 → exactly 1 Plan
1 Plan Item per Session           ↔ exactly 1 Session item-state projection
```

I riferimenti causali diretti sono espliciti e i contextual validator proteggono i confini Configuration, Plan e Session. La traceability transitiva negli artefatti Core e nella Decision è intenzionale e auditabile; non trasferisce ownership dello stato.

## Sovrapposizioni rilevate

Non risultano duplicazioni semantiche bloccanti tra responsabilità. Sono presenti tre ripetizioni intenzionali:

1. Strategy e Requirement ripetono scope/layer e trace refs, ma rispondono rispettivamente a “quale trasformazione generale” e “quale condizione deve risultare disponibile”.
2. Decision, Composition Design, Configuration e Plan ripetono selected capability refs per consentire validazione contestuale esatta; la membership resta owned dalla Decision.
3. Plan e Session ripetono solo riferimenti agli item; lo stato appartiene esclusivamente alla Session.

La sovrapposizione problematica non è di responsabilità ma di promessa: `metadata.readOnly` dichiara immutabilità che molti builder non applicano strutturalmente e che diversi validator non proteggono tramite identity recalculation.

## Isolamento Runtime e assenza di Execution

La Runtime Session contiene esclusivamente:

- identità stabile derivata da version, Plan ref e `sessionKey` esplicito;
- lifecycle chiuso `created`, `active`, `suspended`, `completed`, `abandoned`;
- active Plan Item ref;
- una proiezione chiusa di stato e timestamp per ogni Plan Item;
- provenance, causal refs, metadata ed extensions controllate.

Il validator rifiuta ricorsivamente `execution`, `executions`, `attempt`, `attempts`, `retry`, `timeout`, `provider`, `adapter`, `invocation`, `result`, `results`, `event`, `events`, `persistence`, `knowledgeUpdate` e ulteriori strutture di orchestration/integration. Fixture, regression e public API test confermano l'isolamento Application e l'assenza di export Core.

`completed` descrive esclusivamente la chiusura del lifecycle della Session e dei suoi item-state; non prova successo di Execution, produzione di risultato o soddisfazione del Requirement. Questa distinzione deve restare vincolante.

## Primo boundary downstream possibile

Il primo boundary downstream plausibile è una unità di Execution/Attempt causalmente distinta, riferita almeno a:

- una Runtime Session esistente;
- esattamente un Plan Item della Session;
- una identità propria, distinta da Session e Plan Item.

E-15 deve decidere se sia prima necessario un contratto minimo di `Execution Request`/`Execution Preparation` oppure se l'Execution possa consumare direttamente Session + Plan Item. Il repository corrente non prova ancora la necessità di un contratto intermedio. Non sono necessari contratti intermedi dichiarativi tra Plan e Session; una Runtime Definition duplicherebbe il Plan.

Un eventuale contratto pre-Execution è ammissibile solo se possiede una responsabilità autonoma verificabile — per esempio autorizzazione/readiness o materializzazione di un'unità eseguibile — senza assorbire provider binding, invocation, tentativo, retry, result o persistence. Il nome da solo non giustifica il contratto.

## Rischi per il prossimo ingresso in Execution

1. Artefatti dichiarativi mutabili possono cambiare dopo la decisione mantenendo ref e, in cinque componenti, validator localmente valido: l'Execution consumerebbe causalità non affidabile.
2. `completed` della Session può essere interpretato erroneamente come execution success o Requirement satisfaction.
3. Plan Dependencies possono essere convertite prematuramente in un ordine totale o schedule.
4. Provider/adapter binding può infiltrarsi in Session o Plan invece di restare in un boundary di integrazione separato.
5. Attempt, invocation result, semantic Knowledge Result e Knowledge Update possono essere compressi in un unico oggetto, perdendo cardinalità e provenance.
6. Resume e rerun possono essere confusi: il primo conserva la Session identity, il secondo richiede una nuova `sessionKey`.
7. Contratti preparatori senza responsabilità autonoma possono duplicare Plan o anticipare Execution.

## Guardrail vincolanti per 0100E-15

1. Non autorizzare una Foundation di Execution finché l'immutabilità strutturale e la coerenza identity/content di tutti gli artefatti dichiarativi non siano uniformemente garantite e testate.
2. Non modificare ownership: Need, Strategy, Requirement, Design e Match restano Core; Decision, Composition Design, Configuration, Plan e Session restano Application.
3. Session e Plan devono essere consumati per riferimento causale, mai mutati o arricchiti con execution data.
4. Ogni futura unità di Execution deve avere identity propria e riferire esattamente una Session e un Plan Item; cardinalità Session → Execution deve essere decisa esplicitamente, senza assumere 1:1.
5. Attempt/retry, provider/adapter binding, invocation, technical result, semantic Knowledge Result, events/persistence, satisfaction e Knowledge Update devono rimanere responsabilità distinguibili e non essere introdotti implicitamente.
6. `completed` della Session non può essere usato come prova di risultato o satisfaction.
7. Le dipendenze `all_required`/`any_required` restano logiche; qualsiasi eligibility, ordering, scheduling o concurrency policy richiede contratto e review espliciti.
8. Nessuna Runtime Definition intermedia è giustificata. Un diverso contratto pre-Execution deve dimostrare una responsabilità non già owned da Plan o Session.
9. Validator locale e contextual validator devono restare separati: il primo protegge shape/identity/invarianti interne, il secondo la corrispondenza causale agli artefatti forniti.
10. Non riusare automaticamente Capability Recipe Execution, Interview Runtime, Beta Session, provider o adapter legacy: sono precedenti e controesempi, non integrazioni approvate.

## Note non bloccanti

- Le trace refs transitive aumentano la superficie dei contratti, ma sono coerenti con auditabilità e causalità deterministica.
- Configuration è identity-safe in validazione anche se non structuralmente immutable; questa protezione limita, ma non elimina, la non-conformità.
- La Runtime Session è correttamente implementata come sequenza di snapshot deep-frozen. Lo stato concettuale non richiede mutazione in-place.
- La pipeline abbreviata dovrebbe essere letta con Match e Composition Design come bridge obbligatori nei rispettivi punti, non come componenti opzionalmente ignorabili.
- La continuità vigente è già allineata su E-15 come sola review post-Session; non è stata modificata perché questa review non autorizza una nuova Foundation né cambia lo stato roadmap.

## Verifica finale

L'esito architetturale è **CHANGES REQUIRED** esclusivamente per l'enforcement incoerente dell'immutabilità dichiarativa e della relazione identity/content. Responsabilità, ownership, cardinalità, confini dichiarativo/decisione/configurazione/pianificazione/stato operativo e isolamento pre-Execution risultano altrimenti conformi.

Nessun codice produttivo, contratto, API, test o documento di continuità è stato modificato dalla review.

# TASK 0100E-9 — Post-Capability-Composition-Design Downstream Architecture Review

## 1. Esito

**APPROVED DIRECTION**

Il primo consumer downstream legittimo comune ai mode `single` e `composed` è:

```text
KnowledgeAcquisitionCapabilityConfiguration
Ownership: Application
Nature: declarative, immutable, pre-planning, pre-runtime
```

`none` e `deferred` non producono Configuration: la Solution Decision è rispettivamente un esito terminale senza soluzione adottata e un esito sospeso. Non viene introdotto un outcome, routing o no-op artifact.

La direzione è approvata, non implementata. Nessuna Foundation, contratto, API o comportamento è stato introdotto da questa review.

## 2. Documenti e codice analizzati

Sono stati letti integralmente il pacchetto CURRENT nell'ordine del relativo README, `IMAGO_CODEX_WORKFLOW.md`, `GIT_BRANCHING_MODEL.md`, `CORE_ROADMAP.md`, il boundary freeze, i tre report ARCH-RECOVERY-001 e report/manifest 0100D-9, 0100D-10 e 0100E-1…0100E-8.

L'ispezione del codice ha incluso builder, validator, identity, export, fixture, test e health di `KnowledgeAcquisitionDesign`, `KnowledgeAcquisitionCapabilityMatch`, `KnowledgeAcquisitionSolutionDecision` e `KnowledgeAcquisitionCapabilityCompositionDesign`, incluso il validator contestuale.

Evidenze decisive:

- Decision supporta `single`, `composed`, `none`, `deferred` e seleziona rispettivamente 1, almeno 2, 0, 0 capability;
- Composition Design esiste solo per `composed`, preserva esattamente le capability selezionate e descrive ruoli, contributi e dipendenze logiche;
- Decision e Composition Design vietano già configuration operativa, provider, adapter, planning ed execution;
- i candidate snapshot sono Application-owned boundary input e non espongono uno schema pubblico di configurazione;
- Runtime e Reporting esistenti non consumano gli artefatti Phase D/E.

## 3. Stato upstream congelato

Restano invariati:

```text
Requirement                              [Core]
→ Design                                 [Core]
→ 0..N Match                             [Core; uno per candidate]
→ Solution Decision                      [Application]
  ├─ single:   una capability
  ├─ composed: almeno due capability
  ├─ none:     zero capability
  └─ deferred: zero capability
→ Composition Design                     [Application; composed soltanto]
```

Il freeze di Phase D, la semantica dei quattro Decision mode e il boundary E-8 non vengono modificati.

## 4. Pipeline corrente e direzione approvata

```text
Decision(single) ───────────────────────────────┐
                                                ├→ Capability Configuration [Application]
Decision(composed) → Composition Design ────────┘                │
                                                                  └→ futuro Planning
Decision(none)     → stop: Decision terminale
Decision(deferred) → defer: Decision sospesa
```

Per `composed`, Composition Design è fonte causale diretta obbligatoria. Per `single`, la Configuration consuma direttamente Decision e snapshot dichiarativo della capability selezionata. Unificazione del contratto non significa normalizzazione semantica a composizione di cardinalità 1.

## 5. Matrice dei Decision mode

| Mode | Primo consumer legittimo | Output downstream | Fonte diretta aggiuntiva | Stato |
|---|---|---|---|---|
| `single` | Capability Configuration builder | 1 Configuration | selected capability snapshot + explicit configuration input | procede |
| `composed` | Capability Configuration builder | 1 Configuration | 1 Composition Design + exact selected capability snapshots + explicit configuration input | procede |
| `none` | nessuno | nessun artefatto | nessuna | terminale, non-azione esplicita già nella Decision |
| `deferred` | nessuno | nessun artefatto | nessuna | sospeso, nessuna materializzazione |

## 6. Confronto delle architetture candidate

| Candidata | Vantaggi | Rischi / freeze | Ownership | Mode | Future execution / runtime coupling | Esito |
|---|---|---|---|---|---|---|
| A: Decision → Configuration | comune e minimale per single | per composed salterebbe la fonte causale E-8 | Application | non rappresenta correttamente composed senza input E-8 | compatibile solo se corretta | respinta nella forma lineare |
| B: Decision → Composition se composed → Configuration | preserva branching e causalità; un solo contratto | richiede validator contestuale differenziato | Application | single e composed; none/deferred senza output | prepara senza eseguire | **approvata** |
| C: configurazioni distinte | tipi espliciti | duplica invarianti, API e manutenzione | Application | single/composed separati | compatibile ma ridondante | respinta |
| D: Invocation Specification | vicino a future invocation | anticipa payload, ordering e runtime semantics | Runtime/Application ambiguo | solo soluzioni adottate | accoppiamento alto | respinta |
| E: nessun nuovo artefatto | massima prudenza | lascia valori/configurabilità senza owner e spinge Planning a reinterpretare Decision | n/a | stop universale improprio | sposta ambiguità a Runtime | respinta |

La Configuration unificata evita di duplicare Composition Design: non contiene ruoli, contribution graph, logical dependencies o integration responsibility; li riferisce e li preserva per `composed`.

## 7. Decisione finale

Nome esatto: `KnowledgeAcquisitionCapabilityConfiguration`.

Responsabilità: materializzare, per una soluzione già adottata, valori dichiarativi esplicitamente forniti e riferiti a parametri configurabili delle capability selezionate, senza scoprire, selezionare, risolvere o invocare capability.

Input logici candidati:

- una valid `KnowledgeAcquisitionSolutionDecision` in mode `single` o `composed`;
- per `composed`, la corrispondente valid `KnowledgeAcquisitionCapabilityCompositionDesign`;
- gli exact selected capability declarative snapshots;
- un explicit Application-owned configuration context/definition contenente schema/allowlist e valori non segreti già risolti dal caller.

Output: esattamente una Configuration per Decision applicabile. Builder deve rifiutare `none` e `deferred`.

Invarianti:

- selected capability refs identiche alla Decision;
- `sourceCompositionDesignRef` obbligatorio ed esatto per composed, assente per single;
- un configuration item ownership non ambiguo per capability e parameter ref;
- nessun parametro sconosciuto, duplicato o mancante se dichiarato required;
- tipi/allowlist/constraint dichiarativi verificati senza lookup;
- canonical ordering, deterministic build e identity;
- nessuna mutazione degli input;
- nessuna ridecisione, ricomposizione o modifica degli upstream artifact;
- nessun secret value, provider handle o environment lookup.

## 8. Ownership matrix

| Artefatto / attività | Ownership |
|---|---|
| Requirement, Design, Match | Core |
| candidate discovery/resolution e Solution Decision | Application |
| Composition Design | Application |
| Capability Configuration | Application |
| planning/orchestration | futuro Application/Runtime boundary, non deciso qui |
| provider/adapter resolution | Adapter/Application integration futura |
| execution e result collection | Runtime futuro |

## 9. Matrice responsabilità obbligatoria

| Responsabilità | Core | Application | Runtime | Adapter | Fuori scope corrente |
|---|---:|---:|---:|---:|---:|
| requirement interpretation | X |  |  |  |  |
| design | X |  |  |  |  |
| capability matching | X |  |  |  |  |
| decision |  | X |  |  |  |
| composition |  | X |  |  |  |
| configuration |  | X |  |  | implementation |
| registry lookup |  | X |  | X | X |
| provider resolution |  |  |  | X | X |
| planning |  | TBD | TBD |  | X |
| invocation ordering |  |  | TBD |  | X |
| execution |  |  | X | X | X |
| retry |  |  | X | X | X |
| failure policy |  | TBD | X |  | X |
| result collection |  |  | X | X | X |
| satisfaction | TBD by future review |  |  |  | X |
| Knowledge Update | TBD by future review | TBD |  | X | X |
| reporting integration |  | TBD |  | X | X |

`TBD` indica ownership non approvata, non autorizzazione implicita.

## 10. Cardinalità

Cardinalità architetturali approvate:

```text
1 single Decision   → 0 Composition Design → 1 Configuration
1 composed Decision → 1 Composition Design → 1 Configuration
1 none Decision     → 0 Configuration
1 deferred Decision → 0 Configuration
1 applicable Configuration → exactly the Decision selected capability refs
1 selected capability → 0..N configuration items
1 configuration item → exactly 1 capability ref + 1 parameter ref
```

`0..N` item non implica che una capability sia sempre configurabile. Requiredness deriva esclusivamente dall'explicit configuration definition, non viene inventata dal builder. Capability invocation e future execution unit non hanno cardinalità approvata.

## 11. Identity

La Configuration richiede identity propria, deterministica e content-derived. Il fingerprint deve includere semanticamente almeno contract version, `sourceDecisionRef`, eventuale `sourceCompositionDesignRef`, exact capability refs, canonical configuration items e stable configuration-definition/context refs.

Stabili: source refs, capability refs, parameter refs, schema/version refs, valori dichiarativi se fanno parte della configurazione. Environment-specific: soltanto un eventuale opaque context ref o valori non segreti esplicitamente forniti; non devono essere risolti dal builder. Invocation refs e config-item identities autonome non sono approvati perché non ancora necessari.

## 12. Causalità e provenance

Catena minima:

```text
Requirement → Design → Match → Decision → Configuration                  [single]
Requirement → Design → Match → Decision → Composition Design → Configuration [composed]
```

La causalità immediata è diretta: `sourceDecisionRef` sempre; `sourceCompositionDesignRef` solo e obbligatoriamente per composed. La provenienza upstream può essere preservata transitivamente attraverso refs/traceability senza duplicare interi artifact. Configuration deve dichiarare derivazione deterministica, non interpretativa, con producer/contract version.

## 13. Validation model

Local validator:

- closed shape, version, mode coherence, canonical collections, item uniqueness, serializability, deterministic identity e forbidden operational fields;
- non effettua discovery, lookup, availability o provider resolution.

Contextual validator Application-owned:

- valida Configuration rispetto a Decision;
- per composed valida anche exact correspondence con Composition Design;
- valida exact capability snapshots e explicit configuration definition/context;
- verifica parameter allowlist, requiredness, tipi e constraint puramente dichiarativi.

Registry/provider availability validation non appartiene né al local validator né al contratto. Se futura, è un gate Application/Adapter separato e non muta la Configuration.

## 14. Public API candidate

Per il primo task implementativo sono candidate soltanto:

```text
buildKnowledgeAcquisitionCapabilityConfiguration
validateKnowledgeAcquisitionCapabilityConfiguration
validateKnowledgeAcquisitionCapabilityConfigurationContext
healthKnowledgeAcquisitionCapabilityConfiguration
```

Nessuna query o collection API è approvata: una Configuration è già il singolo artefatto per Decision e i suoi item sono parte del contratto, non un nuovo dominio. Nessuna invocation API è approvata.

## 15. Immutabilità ed extensions

Builder e validator sono puri; nessuna mutazione in-place. Source artifact e Configuration rimangono oggetti distinti. Copie trasferite devono essere deep-cloned. `extensions` e metadata restano object chiusi ai concetti vietati e non sono canali per secret, provider, runtime o execution. `readOnly` è metadata e non implica runtime freezing.

## 16. Fuori-scope

- discovery, registry/catalog lookup e candidate reselection;
- provider/adapter resolution, availability e entitlements;
- credentials, secret e secret reference;
- environment-variable lookup, endpoint, model, prompt, token e payload;
- fallback, retry, timeout e failure policy;
- ordering, steps, invocation, planning, recipe, orchestration ed execution;
- execution unit/result, observation ingestion e result collection;
- Requirement satisfaction e Knowledge Update;
- Runtime/Beta Session/Reporting integration;
- persistence, network, UI e LLM invocation;
- modifica di Decision, Composition Design o Phase D freeze.

## 17. Regression risk

- alto: duplicare ruoli/dependencies del Composition Design nella Configuration;
- alto: accettare secret/provider/runtime values e trasformare Configuration in execution spec;
- alto: costruire Configuration per none/deferred o normalizzare single come composition;
- medio: identity dipendente da ordine, timestamp o ambient environment;
- medio: validator locale che effettua registry/availability lookup;
- medio: Configuration che reinterpreta Match o modifica selection;
- basso: introdurre query/collection premature e ampliare la public API.

## 18. Test richiesti per il task successivo

- single minimale e configurato;
- composed con exact Composition Design;
- rejection di none/deferred e Composition Design assente/extra/mismatched;
- exact selected capability coverage;
- zero e più item per capability secondo definition;
- required/unknown/duplicate parameter rejection;
- declarative type/constraint validation;
- deterministic identity e invariance rispetto a input set ordering;
- input/output mutation isolation;
- local versus contextual guarantee separation;
- rejection ricorsiva di provider, secret, lookup, plan, invocation, ordering, retry, execution, result, satisfaction e update;
- public API regression, upstream freeze regression, dedicated health, aggregate Core e overall health.

## 19. Primo task implementativo autorizzato

```text
0100E-10 — Knowledge Acquisition Capability Configuration Foundation
```

Perimetro: implementare soltanto il contratto Application-owned unificato, builder deterministico, validator locale, validator contestuale, fixture/test/regression/health ed export Application minimi descritti sopra. Nessuna API Core e nessuna implementazione operativa.

## 20. Continuity Impact Assessment

Classificazione finale: **DECISION** (include impatto ARCHITECTURE; non modifica il Phase D freeze).

La review approva una nuova direzione Application-owned e rende incompleti continuity, architecture map, decisions, next phase e roadmap. Non cambia mapping, cardinalità, causalità o public export upstream e non implementa il nuovo boundary.

## 21. Document impact matrix

| documento | impatto | azione | motivazione |
|---|---|---|---|
| `docs/00-continuity/CONTINUITY.md` | DECISION/STATUS | aggiornato | registra E-9 e distingue approved da implemented |
| `docs/00-continuity/CORE_ARCHITECTURE.md` | ARCHITECTURE | aggiornato | aggiunge la direzione downstream non implementata |
| `docs/00-continuity/DECISIONS.md` | DECISION | aggiornato | registra l'ADR della Configuration |
| `docs/00-continuity/NEXT_PHASE.md` | STATUS | aggiornato | sostituisce E-9 con E-10 |
| `docs/15-architecture_specifications/CORE_ROADMAP.md` | STATUS/DECISION | aggiornato | chiude E-9 e pianifica E-10 |
| `KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md` | NONE | invariato | Phase D ed E-8 restano congelati; la review non implementa né riscrive il freeze |
| review ARCH-RECOVERY-001 e task storici | NONE | invariati | evidenza storica non riscritta |
| task report e manifest E-9 | STATUS | creati | deliverable e audit trail del task |
| `scripts/check_continuity_governance.js` e test diretto | STATUS | aggiornati | riallineano deterministicamente il gate alla transizione CURRENT senza usare documenti HISTORICAL |

## 22. Governance maintenance and verification results

Pre-review and post-review:

```text
node scripts/test_all_core.js          PASS
node scripts/fringe_health_check.js    PASS
git diff --check                       PASS
```

Pre-review governance checks:

```text
node scripts/check_continuity_governance.js PASS
node scripts/test_continuity_governance.js  PASS
```

Il blocker precedente era causato dall'asserzione milestone-specific che richiedeva E-9 `PLANNED`. La manutenzione successivamente autorizzata ha sostituito tale asserzione con controlli state-driven sui soli documenti CURRENT:

- esattamente un task roadmap `PLANNED`;
- concordanza tra roadmap, `NEXT_PHASE.md` e `CONTINUITY.md`;
- task verified-through `COMPLETED`;
- assenza di stati duplicati o incompatibili;
- Configuration esplicitamente `APPROVED` e non implementata;
- esclusione dei report HISTORICAL dal calcolo dello stato.

Il test diretto copre transizione valida E-9/E-10, E-9 ancora PLANNED, NEXT_PHASE discordante, due task PLANNED, E-10/Configuration dichiarati implementati e una fixture HISTORICAL contenente stato obsoleto.

Esito finale:

```text
node scripts/check_continuity_governance.js PASS (plannedTask: 0100E-10)
node scripts/test_continuity_governance.js  PASS
node scripts/test_all_core.js               PASS
node scripts/fringe_health_check.js         PASS
git diff --check                            PASS
```

La correzione è generalizzata, deterministica e non indebolisce i controlli preesistenti su authority index, riferimenti CURRENT, link locali e stati roadmap. Nessun blocker residuo.

## 23. Self-review conclusion

Architecture review content: **CONFORMING** — una sola direzione è approvata; tutti i mode sono trattati; ownership, responsabilità, cardinalità, identity, causalità, validation, API candidate e fuori-scope sono espliciti. Configuration rimane dichiarativa e non implementata. Runtime e Reporting restano separati.

Operational delivery: **CONFORMING**. Il governance check e il test diretto sono riallineati e verdi. No application, contract, API, runtime or reporting file was modified.

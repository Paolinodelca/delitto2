# IMAGO CODEX WORKFLOW

Status: **CURRENT OPERATIONAL STANDARD**

## 1. Scopo

Questo documento definisce il protocollo operativo stabile per i task IMAGO eseguiti mediante ChatGPT Architetto, Codex, utente e Git. Governa la preparazione, l'implementazione, la verifica e la consegna delle modifiche al repository; non modifica contratti di dominio, decisioni architetturali o boundary congelati.

## 2. Fonte di verità repository-first

Il repository reale nel branch e worktree assegnati è la fonte fattuale primaria. Codice, test, documentazione vigente, stato Git e commit osservabili prevalgono su ricordi o riassunti della chat.

La chat completa non deve essere allegata automaticamente a Codex. Ogni task deve essere autosufficiente: obiettivo, perimetro, vincoli, commit atteso, verifiche e autorizzazioni devono essere dichiarati nel task. I file allegati a una chat non sono necessariamente trasferiti a una nuova attività Codex; gli input necessari devono essere verificati nel contesto effettivo della nuova attività.

## 3. Ruoli

### ChatGPT Architetto

- definisce task, perimetro e criteri di conformità;
- risolve ambiguità architetturali e autorizza eventuali cambi di contratto;
- conduce o valuta la review architetturale;
- separa decisioni approvate, ipotesi e lavoro differito.

### Codex

- opera repository-first nel perimetro assegnato;
- verifica lo stato reale prima di agire;
- implementa, testa e svolge self-review con evidenze riproducibili;
- non amplia silenziosamente il task e non modifica contratti upstream per assorbire una divergenza downstream;
- si ferma ed espone anomalie, conflitti o autorizzazioni mancanti.

### Utente

- conferma le decisioni che richiedono autorità umana;
- concede separatamente le autorizzazioni esplicite per commit, push, Pull Request e merge;
- decide come procedere quando il repository non corrisponde alle precondizioni del task.

### Git

Git fornisce identità, isolamento, tracciabilità e audit trail. Branch, commit, diff, upstream e working tree sono evidenze operative; Git non sostituisce la review architetturale né autorizza automaticamente la pubblicazione.

## 4. Branch e worktree dedicati

Ogni task usa preferibilmente un branch e un worktree dedicati, derivati dal commit esplicitamente indicato. Prima di creare o cambiare branch si verificano root, branch corrente, HEAD e working tree. Non si modifica o riutilizza il branch di un altro task senza istruzione esplicita.

## 5. Priorità delle fonti

In caso di divergenza si applica questo ordine:

1. repository reale nel commit e worktree correnti;
2. task corrente approvato;
3. documentazione architetturale vigente;
4. contesto storico, handover e conversazioni precedenti.

Una contraddizione tra fonti di livello superiore non viene risolta per supposizione: viene riportata all'utente o all'Architetto.

## 6. Preflight in sola lettura

Prima di modificare file, Codex verifica almeno:

```powershell
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
```

Verifica inoltre l'esistenza degli input dichiarati e legge integralmente i documenti realmente richiesti. Se commit, branch, pulizia o fonti indispensabili non rispettano il task, Codex si ferma senza modifiche salvo che il task autorizzi esplicitamente la condizione osservata.

## 7. Implementazione

L'implementazione deve essere minima, deterministica rispetto al task e coerente con i pattern già presenti. Codex preserva separazione dei layer, dependency direction, immutabilità, identità deterministiche e boundary Core/Application documentati.

Nessuna correzione locale autorizza a reinterpretare semantica upstream. In particolare, i boundary congelati in `../15-architecture_specifications/KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md` richiedono un task architetturale esplicito per variazioni di mapping, cardinalità, causalità, export pubblici o semantica dei Requirement.

## 8. Test

La verifica procede dal particolare al generale:

1. test dedicati al comportamento modificato;
2. regression suite del boundary interessato;
3. health check specifici;
4. aggregate suite del Core;
5. health check complessivo.

Per il Core, quando applicabile:

```powershell
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

Un test non applicabile deve essere indicato come tale; non va dichiarato superato. Un fallimento preesistente deve essere distinto da una regressione introdotta dal task mediante evidenze.

## 9. Self-review repository-first

Dopo i test, Codex rilegge il diff come reviewer e confronta il risultato con repository, task e architettura vigente. Controlla almeno:

- completezza dei requisiti e assenza di scope creep;
- modifiche involontarie a contratti o API;
- correttezza di validazione, cloning, ordinamento e identità, quando pertinenti;
- test realmente capaci di rilevare la regressione;
- documentazione aderente allo stato implementato;
- assenza di file generati, segreti o modifiche estranee.

La self-review termina con `CONFORMING`, `CONFORMING WITH NOTES` o `NON-CONFORMING`, accompagnato da motivazioni verificabili.

## 10. Garanzie distinte

Le evidenze non sono intercambiabili:

- **builder guarantees**: ciò che il builder costruisce o rifiuta a partire dai suoi input;
- **local validator guarantees**: invarianti autosufficienti verificabili sul singolo contratto;
- **contextual validator guarantees**: corrispondenza del contratto con sorgenti e contesto esplicitamente forniti;
- **test guarantees**: comportamenti coperti dagli scenari eseguiti, non proprietà universali non testate.

Il caso `KnowledgeAcquisitionCapabilityCompositionDesign` rende la distinzione normativa: il builder consuma input già risolti, il validator locale verifica invarianti interne e il validator contestuale prova la corrispondenza con Decision e Design. Nessuno dei tre effettua discovery, matching o selezione implicita.

## 11. Review architetturale

La review architetturale verifica compatibilità con `CORE_ARCHITECTURE.md`, `DECISIONS.md`, `CONTINUITY.md` e con gli eventuali freeze applicabili. È obbligatoria prima di estendere semantica pubblica, cambiare boundary, introdurre dipendenze inverse o implementare sistemi dichiarati differiti.

Codex può segnalare e formulare opzioni, ma non approva autonomamente una nuova architettura.

## 12. Consolidamento

Se implementazione o review risultano `NON-CONFORMING`, il consolidamento è un passaggio distinto e tracciabile: corregge soltanto i rilievi approvati, riesegue i test pertinenti e ripete la self-review. Non è un pretesto per ampliare retroattivamente il task.

## 13. Report e manifest

Il report finale registra almeno:

- esito di conformità;
- branch, HEAD e stato del worktree;
- file creati e modificati;
- sintesi del comportamento e dei boundary preservati;
- test eseguiti con esiti;
- anomalie, limiti e lavoro differito;
- `git status --short` e `git diff --stat`;
- stato di commit e push.

Quando il repository prevede manifest o report di milestone, essi descrivono esclusivamente fatti verificati. Non si dichiarano implementate capacità strategiche, ipotetiche o differite.

## 14. Controlli prima del commit

Prima di chiedere autorizzazione al commit:

```powershell
git diff --check
git status --short
git diff --stat
git diff
```

Codex verifica inoltre test, documentazione, scope e assenza di modifiche estranee. Lo staging, se autorizzato, deve includere soltanto i file del task e va ricontrollato con `git diff --cached`.

## 15. Commit

Il commit richiede autorizzazione esplicita dell'utente. L'approvazione a implementare non vale come approvazione a committare. Il messaggio deve descrivere il risultato effettivo e il commit deve essere verificato con stato e diff staged prima dell'esecuzione.

## 16. Push

Il push richiede un'autorizzazione esplicita separata. L'autorizzazione al commit non autorizza il push. Prima del push si verificano branch, upstream, remote e commit da pubblicare; dopo il push si verifica l'esito remoto. Il force push non è ammesso senza autorizzazione specifica e motivata.

## 17. Pull Request

La Pull Request è una fase separata da push e merge. La sua creazione richiede istruzione o autorizzazione esplicita e include descrizione del perimetro, test, rischi, note architetturali ed eventuale lavoro differito.

## 18. Merge

Il merge non è implicito nella creazione o approvazione di una Pull Request. Richiede decisione esplicita, verifica dei controlli richiesti e rispetto della strategia Git del repository. Codex non esegue merge autonomamente.

## 19. Operazioni Git vietate senza autorizzazione

Non eseguire senza autorizzazione esplicita:

- merge, rebase o cherry-pick;
- reset, restore, checkout distruttivo, stash o clean;
- amend o riscrittura della storia;
- eliminazione di branch o tag;
- push, force push o modifica dei remote;
- staging o commit quando non inclusi nel mandato.

Le modifiche preesistenti dell'utente devono essere preservate.

## 20. Anomalie, task bloccati e autorizzazioni scadute

In presenza di working tree inattesa, HEAD divergente, file indispensabili mancanti, test non riproducibili, conflitti tra task e architettura o permessi insufficienti, Codex:

1. interrompe le modifiche rischiose;
2. raccoglie evidenze in sola lettura;
3. descrive impatto e opzioni;
4. richiede una decisione solo quando necessaria;
5. riprende dal nuovo stato reale, rieseguendo il preflight.

Un'autorizzazione riferita a branch, commit, diff o operazione ormai cambiati è scaduta e va richiesta nuovamente.

## 21. Approvazioni manuali di Codex

Le approvazioni automatiche non sono lo standard corrente. Quando l'ambiente richiede elevazione o conferma, Codex presenta una richiesta manuale limitata all'operazione necessaria. L'approvazione tecnica dello strumento non sostituisce l'autorizzazione funzionale dell'utente a commit, push, Pull Request o merge.

## 22. Checklist riutilizzabile

- [ ] Task autosufficiente e perimetro compreso
- [ ] Root, branch, HEAD, upstream e status verificati
- [ ] Fonti richieste presenti e lette integralmente
- [ ] Sovrapposizioni o contraddizioni segnalate
- [ ] Implementazione limitata al task
- [ ] Contratti upstream e boundary preservati
- [ ] Test dedicati eseguiti
- [ ] Regression e health check eseguiti
- [ ] Aggregate suite eseguita, se applicabile
- [ ] Self-review repository-first completata
- [ ] Review architetturale completata, se richiesta
- [ ] `git diff --check` pulito
- [ ] Status, diff e stat verificati
- [ ] Autorizzazione esplicita ottenuta prima del commit
- [ ] Autorizzazione esplicita ottenuta prima del push
- [ ] Pull Request e merge trattati come fasi separate
- [ ] Report finale basato su evidenze

## 23. Template sintetici

### Preflight

```text
Root:
Branch / upstream:
HEAD atteso / osservato:
Working tree:
Fonti lette:
Anomalie o conflitti:
Esito: GO | STOP
```

### Implementazione

```text
Obiettivo:
File in scope:
Boundary preservati:
Modifiche effettuate:
Esclusioni confermate:
```

### Self-review

```text
Requisiti coperti:
Test ed esiti:
Rischi o rilievi:
Diff estraneo: sì | no
Esito: CONFORMING | CONFORMING WITH NOTES | NON-CONFORMING
```

### Consolidamento

```text
Rilievi approvati:
Correzioni applicate:
Test rieseguiti:
Rilievi residui:
Esito:
```

### Commit

```text
Branch / HEAD:
File staged:
Test finali:
Messaggio proposto:
Autorizzazione esplicita: richiesta | concessa
```

### Push

```text
Branch / upstream / remote:
Commit da pubblicare:
Autorizzazione esplicita: richiesta | concessa
Esito e verifica remota:
```

## 24. Caso di riferimento: Task 0100E-8/E-8A

Il Task 0100E-8/E-8A è un esempio di ciclo operativo, non una nuova regola di dominio:

```text
implementazione
→ self-review NON-CONFORMING
→ consolidamento mirato
→ self-review CONFORMING
→ commit autorizzato
→ push autorizzato
```

Il valore del caso è la separazione delle fasi: un'implementazione completata non equivale a conformità; una correzione non equivale ad autorizzazione Git; commit e push restano decisioni distinte. Le garanzie specifiche del Composition Design restano quelle documentate in `CONTINUITY.md` e nel boundary freeze, non quelle dedotte dal solo esito dei test.

## Relazione con la documentazione esistente

- `CONTINUITY.md` descrive lo stato verificato del progetto e rimanda a questo protocollo per i nuovi task Codex.
- `CORE_ARCHITECTURE.md` e `DECISIONS.md` governano architettura e contratti; questo documento non li sostituisce.
- `GIT_MILESTONE_GUIDE.md` conserva una procedura di milestone riferita alla Phase 0100B; per i nuovi task prevalgono le autorizzazioni e la separazione delle fasi definite qui.
- `KNOWLEDGE_ACQUISITION_BOUNDARY_FREEZE.md` rimane normativo per il boundary dichiarativo congelato.

# Git Branching Model — stato osservato

Data della ricostruzione: **2026-07-30**

## Scopo e natura del documento

Questo documento fotografa lo stato Git osservato al **2026-07-30** nel repository `Paolinodelca/delitto2`. Descrive branch, ancestry, integrazioni e convenzioni già usate; non costituisce una policy Git definitiva, non prescrive automaticamente comportamenti futuri e non dichiara avvenute integrazioni assenti dalla storia Git.

Repository root osservata:

```text
C:\Users\Utente\Documents\Progetti\delitto2-e8
```

Root applicativa IMAGO corrente:

```text
fringe-interview/
```

Remote canonico:

```text
origin  https://github.com/Paolinodelca/delitto2.git
```

## 1. Branch principale

Il branch principale configurato su GitHub è:

```text
mvp-fringe-interview
```

Evidenze concordanti:

- la proprietà `default_branch` del repository GitHub vale `mvp-fringe-interview`;
- la HEAD remota risolve `refs/heads/mvp-fringe-interview`;
- il commit remoto osservato è `abf521b5912f2f0c3a3fbc6ff8c4a08c25d4f4b1`.

Il branch `main` esiste, ma non è il default branch GitHub. La copia locale osservata punta a `fff176cc0a81c51b2f36549c0658394fe417feed`, mentre `origin/main` punta a `d4a3ad8eb04f5ed5c31cd64d808309324646d0df`: il branch locale è quindi indietro di un commit.

La storia successiva a `mvp-fringe-interview` non è stata reintegrata nel default branch. Al termine delle operazioni osservate il branch è rimasto invariato a `abf521b5912f2f0c3a3fbc6ff8c4a08c25d4f4b1`. Ne consegue una distinzione fattuale:

- **branch principale ufficiale del repository:** `mvp-fringe-interview`;
- **linea di integrazione Core più avanzata:** `milestone/0100b-knowledge-foundation` e i suoi discendenti.

Queste due nozioni non coincidono nello stato corrente.

## 2. Struttura e ancestry osservate

La linea rilevante è quasi interamente lineare:

```text
main (locale: fff176c)
├── origin/main (d4a3ad8) ── origin/Paolinodelca-patch-1 (f1b5677)
└── demo-fringe-leak-v0.1 (0cdde39)
    └── mvp-fringe-interview (abf521b)          [GitHub default]
        └── checkpoint-behavior-runtime (5c11b3e)
            └── milestone/0100b-knowledge-foundation (374d75b)
                └── task/0100e-8 (264f44c)
                    └── docs/codex-workflow (a646ad7)
```

Ogni freccia rappresenta ancestry verificata: il commit a sinistra è antenato del branch a destra.

Il commit `d4a3ad8` di `origin/main` non appartiene alla linea che conduce ai branch demo, MVP e Core: il loro merge base con `origin/main` è ancora `fff176c`. Anche `origin/Paolinodelca-patch-1` appartiene alla linea separata di `origin/main`.

## 3. Branch di milestone e checkpoint

### `demo-fringe-leak-v0.1`

Tipologia osservata: branch di demo/release line.

Commit corrente:

```text
0cdde397d43f3483eb9a323d6e9424b08fe23ba0
```

È protetto anche dal tag `rc-fringe-leak-v1`. La sua storia contiene i soli due merge commit presenti nell'intero grafo osservato, entrambi sincronizzazioni del branch con l'omonimo branch remoto.

### `checkpoint-behavior-runtime`

Tipologia osservata: checkpoint della linea applicativa/Core.

Commit corrente:

```text
5c11b3ec6eff881a4b1d54c6e76b3744a7497cd7
```

Discende da `mvp-fringe-interview` e costituisce la base diretta della successiva milestone Knowledge Foundation.

### `milestone/0100b-knowledge-foundation`

Tipologia osservata: branch milestone della Knowledge Engine Foundation e della successiva evoluzione Core/Application.

Commit corrente:

```text
374d75b330e3b49c2fb1dea2ffa721bc51715faf
```

Il riferimento remoto `origin/milestone/0100b-knowledge-foundation`, inizialmente osservato a questo commit, è stato successivamente avanzato in fast-forward fino a `a646ad7c25717665d4c202023e8b39aefbe220fb`, includendo E-8 e il protocollo documentale senza merge commit. Il branch contiene una sequenza lineare di commit di implementazione, test, review architetturale e documentazione. Fra i marker principali osservati:

- `ba8ae9c` — completamento Phase 0100B Knowledge Engine Foundation;
- `cec5855` — consolidamento Knowledge Acquisition fino a 0100D-10;
- `2964c21` — Knowledge Acquisition Design Foundation;
- `5ba036a` — Capability Match Foundation;
- `f47ffb7` — Solution Decision Foundation;
- `7e4ecee` — review downstream della Decision composta;
- `374d75b` — chiarimento della documentazione Builder.

Il tag annotato `v0.10.0-knowledge-foundation` punta a `7fcba1d`, un commit storico interno alla stessa linea, non al tip corrente della milestone.

### Branch e tag storici aggiuntivi

- `backup/contextual-engine-checkpoint` punta a `8c05674`, commit poi contenuto nella linea MVP/Core;
- `release-candidate` punta a `fff176c`;
- `rc-fringe-leak-v0.1`, `rc-fringe-leak-v0.2` e `rc-fringe-leak-v1` marcano checkpoint della demo;
- `origin/Paolinodelca-patch-1` è un breve branch patch discendente da `origin/main`, non dalla linea MVP/Core.

## 4. Task branch

Il task branch esplicito attualmente osservato è:

```text
task/0100e-8
```

Commit:

```text
264f44c2823f99bdf8522d6bbaf78fdcc659275f
```

È esattamente un commit avanti rispetto a `milestone/0100b-knowledge-foundation`. Il commit introduce il Task 0100E-8 — Knowledge Acquisition Capability Composition Design Foundation.

Non sono presenti altri riferimenti locali o remoti con prefisso `task/`. I task precedenti risultano rappresentati da commit successivi sulla milestone, con coppie ricorrenti di implementazione e review architetturale, non da branch task ancora pubblicati.

## 5. Branch documentale

Il branch:

```text
docs/codex-workflow
```

punta a:

```text
a646ad7c25717665d4c202023e8b39aefbe220fb
```

È esattamente un commit avanti rispetto a `task/0100e-8`. La modifica documentale dipende quindi dall'intera ancestry E-8 e non costituisce un branch autonomo derivato direttamente dal branch principale o dalla milestone. Dopo la ricostruzione, questo commit è diventato anche il tip remoto osservato della milestone tramite avanzamento lineare fast-forward.

## 6. Integrazioni esistenti

### Pull Request

Le API GitHub non riportano Pull Request aperte, chiuse o mergeate nel repository:

```text
Pull Request totali osservate: 0
```

Non esiste quindi una storia di PR dalla quale dedurre una strategia GitHub standard di merge, squash o rebase.

### Merge commit

Nel grafo completo sono presenti soltanto due merge commit:

```text
a800769  Merge branch 'demo-fringe-leak-v0.1' ... into demo-fringe-leak-v0.1
75c1294  Merge branch 'demo-fringe-leak-v0.1' ... into demo-fringe-leak-v0.1
```

Entrambi integrano divergenze locale/remoto dello stesso branch demo. Non sono merge di feature, milestone o task branch verso `main` o `mvp-fringe-interview`.

### Integrazione per ancestry lineare

La forma d'integrazione predominante è l'avanzamento lineare della stessa linea di commit. I branch più recenti sono stati creati come checkpoint successivi e pubblicati senza merge-back nel default branch:

```text
mvp-fringe-interview
→ checkpoint-behavior-runtime
→ milestone/0100b-knowledge-foundation
→ task/0100e-8
→ docs/codex-workflow
```

In questo modello storico, il contenuto viene ereditato per ancestry, non integrato tramite merge commit o PR verso il branch principale. Il successivo avanzamento remoto della milestone da `374d75b` ad `a646ad7` ha seguito la stessa forma lineare e non ha modificato `mvp-fringe-interview`.

## 7. Convenzione usata fino a oggi

Le evidenze indicano la seguente convenzione de facto:

1. **Branch longevi per fasi o prodotti.** Nomi quali `demo-*`, `mvp-*`, `checkpoint-*` e `milestone/*` identificano stadi successivi della stessa linea evolutiva.
2. **Sviluppo prevalentemente lineare.** Implementazioni, test, review e documentazione vengono aggiunti come commit sequenziali, senza merge commit intermedi.
3. **Milestone come base di lavoro Core.** Alla data osservata, la linea Core recente usa `milestone/0100b-knowledge-foundation` come base effettiva, pur senza promuoverla nel default branch GitHub.
4. **Task branch puntuale.** Il prefisso `task/` è osservato per E-8, derivato dal tip della milestone e contenente un singolo commit di task.
5. **Branch documentale dipendente dal task.** Il prefisso `docs/` è osservato per il protocollo Codex e deriva dal task cui fa seguito.
6. **Tag come freeze o release candidate.** I tag `release-candidate`, `rc-*` e `v0.10.0-*` marcano checkpoint, ma non determinano da soli il branch principale.
7. **Pubblicazione diretta dei branch.** Nello stato osservato, i branch rilevanti hanno upstream omonimo su `origin`; non risultano PR usate per integrarli.
8. **Default branch non avanzato con la linea Core.** Al 2026-07-30 `mvp-fringe-interview` resta il branch principale ufficiale e invariato, mentre la milestone remota Core è stata avanzata linearmente fino a includere E-8 e il protocollo Codex.

## 8. Stato dei riferimenti rilevanti

| Ruolo osservato | Branch | Commit |
|---|---|---|
| default branch GitHub | `mvp-fringe-interview` | `abf521b5912f2f0c3a3fbc6ff8c4a08c25d4f4b1` |
| branch Git tradizionale | `origin/main` | `d4a3ad8eb04f5ed5c31cd64d808309324646d0df` |
| checkpoint Core | `checkpoint-behavior-runtime` | `5c11b3ec6eff881a4b1d54c6e76b3744a7497cd7` |
| milestone Core remota dopo il fast-forward | `origin/milestone/0100b-knowledge-foundation` | `a646ad7c25717665d4c202023e8b39aefbe220fb` |
| task E-8 | `task/0100e-8` | `264f44c2823f99bdf8522d6bbaf78fdcc659275f` |
| protocollo documentale | `docs/codex-workflow` | `a646ad7c25717665d4c202023e8b39aefbe220fb` |

## 9. Conclusione

Alla data della ricostruzione, il repository non mostra l'uso di un modello classico nel quale task branch brevi vengono integrati regolarmente nel default branch tramite Pull Request. Il modello osservato è una successione di branch-checkpoint pubblicati lungo una storia prevalentemente lineare. Questa constatazione è descrittiva e non stabilisce la policy per i task futuri.

Il branch principale ufficiale osservato è `mvp-fringe-interview`, rimasto invariato, mentre la linea operativa Core è avanzata oltre quel punto attraverso `checkpoint-behavior-runtime` e `milestone/0100b-knowledge-foundation`. Dopo la ricostruzione, la milestone remota è stata avanzata linearmente fino a `a646ad7`, includendo E-8 e il protocollo Codex. Questo fatto non designa automaticamente una policy Git definitiva: ogni futura formalizzazione o variazione del branch di integrazione richiede una decisione esplicita.

# Git Milestone Guide — Phase 0100B

Status: **HISTORICAL — MILESTONE-SPECIFIC GUIDE FOR 0100B**

This document preserves the procedure used for the 0100B milestone. It is not the current general Git policy and must not be used to select the base of a new task. For the observed current branch topology and integration history, read [`GIT_BRANCHING_MODEL.md`](GIT_BRANCHING_MODEL.md). For operational authorization rules, read [`IMAGO_CODEX_WORKFLOW.md`](IMAGO_CODEX_WORKFLOW.md).

Eseguire i comandi dalla root applicativa reale del repository.

## 1. Aprire PowerShell nella root

```powershell
cd "C:\Users\Utente\Documents\Progetti\<cartella-progetto>\repository"
Get-Location
Get-ChildItem
```

Devono comparire cartelle come `src`, `scripts`, `docs`.

## 2. Controllare Git

```powershell
git status
git branch --show-current
Get-ChildItem -Force
```

Deve comparire `.git`.

## 3. Eseguire i test finali

```powershell
node scripts/test_person_knowledge_matrix.js; `
node scripts/test_person_knowledge_matrix_regression.js; `
node scripts/test_health_person_knowledge_matrix.js; `
node scripts/test_all_core.js; `
node scripts/fringe_health_check.js
```

Procedere solo con:

```text
IMAGO Core all tests PASSED
All health checks passed
```

## 4. Copiare i documenti

Percorso consigliato:

```text
docs/00-continuity/
```

Creare la cartella:

```powershell
New-Item -ItemType Directory -Force "docs/00-continuity"
```

Copiare dentro:

```text
CONTINUITY.md
CORE_ARCHITECTURE.md
DECISIONS.md
NEXT_PHASE.md
GIT_MILESTONE_GUIDE.md
```

Risultato:

```text
repository/
└── docs/
    └── 00-continuity/
        ├── CONTINUITY.md
        ├── CORE_ARCHITECTURE.md
        ├── DECISIONS.md
        ├── NEXT_PHASE.md
        └── GIT_MILESTONE_GUIDE.md
```

## 5. Verificare le modifiche

```powershell
git status --short
git diff --stat
git diff
```

## 6. Aggiungere allo staging

```powershell
git add .
git status
git diff --cached --stat
```

## 7. Creare il commit

```powershell
git commit -m "feat(core): complete Phase 0100B Knowledge Engine Foundation" `
  -m "Complete the deterministic knowledge pipeline through PersonKnowledgeMatrix, preserve elementary and derived knowledge layers, integrate regression tests and health checks, and add continuity documentation."
```

## 8. Verificare il commit

```powershell
git status
git log -1 --oneline
git show --stat --oneline HEAD
```

Atteso:

```text
nothing to commit, working tree clean
```

## 9. Creare un tag locale

```powershell
git tag -a "v0.10.0-knowledge-foundation" -m "IMAGO Phase 0100B Knowledge Engine Foundation completed"
git tag --list
git show "v0.10.0-knowledge-foundation" --stat
```

## 10. Pubblicare commit e tag

```powershell
git remote -v
git push
git push origin "v0.10.0-knowledge-foundation"
```

Se il branch non ha upstream:

```powershell
git branch --show-current
git push -u origin NOME_BRANCH
git push origin "v0.10.0-knowledge-foundation"
```

## 11. Verifica finale

```powershell
git status
git log -3 --oneline
git tag --list
git remote -v
```

Confermare:

- working tree pulito;
- commit milestone presente;
- tag presente;
- remote corretto;
- push senza errori.

## 12. Ripresa futura

```powershell
git status
git branch --show-current
git log -3 --oneline
git tag --list
node scripts/test_all_core.js
node scripts/fringe_health_check.js
```

Poi leggere i documenti in `docs/00-continuity/` e iniziare la progettazione di `0100C-1`.

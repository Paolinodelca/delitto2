# CONTINUITÀ — DEMO FRINGE / LEAK + MOTORE (Paolino)

## Obiettivo immediato
1) Rendere FRINGE / LEAK stabile e “memorabile” (UI + osservazioni + votazione).
2) Rendere la demo configurabile (data-driven) per cambiare contesto senza rifare codice.
3) Tornare al motore narrativo (World/Knowledge/State/Hypotheses/Judge/Narrator/OutcomeProfiler).

---

## Non negoziabile (canonico)
- FRINGE / LEAK NON è ricostruzione dei fatti: valuta COME il giocatore rende accettabili decisioni sapendo che verranno lette/interpretate.
- Microcopy “non verità → versione” va mostrato prima delle domande e non va accorciato.
- Output osservazioni finali: SEMPRE 3 campi e SEMPRE oggetto:
  { fringe, psicologico, amplificato } (non array).
- AMPLIFICATO contiene due ipotesi parallele (sincero vs messa in scena) nella stessa lettura.
- Endpoint Groq compatibile OpenAI:
  https://api.groq.com/openai/v1/chat/completions
- Env richieste:
  - GROQ_API_KEY
  - GROQ_MODEL (es. llama-3.3-70b-versatile)
- Paolino preferisce file completi da sostituire, non patch; non fare ipotesi sul codice: chiedere i file quando servono.

---

## Struttura progetto (punti caldi)
- UI canonica: docs/app.js (non cambiare struttura file senza motivo).
- API osservazioni: api/observe.js (prompt + safety net + post-processing).
- API votazione: api/vote.js (invio a Google Apps Script, lock anti-multiplo).

---

## Stato attuale (aggiornato)
### Groq / Modello
- Errore visto: model decommissioned su `llama-3.1-70b-versatile`.
- Modello funzionante confermato: `llama-3.3-70b-versatile`.
- Strategia attiva:
  - `GROQ_MODEL` impostato su Vercel (All environments).
  - In codice: `const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";`

### Observe.js
- Versione log: "OBSERVE VERSION: AMP-V6".
- Prompt “etichettato” attivo:
  - FRINGE: 4 righe (PRIMO PIANO / FUORI CAMPO / AGENZIA / TENSIONE)
  - RELAZIONALE: 5 righe (RITMO / REGISTRO / FUORI CAMPO / PAROLA-OMBRA / SOSPESO)
  - AMPLIFICATO: 2 blocchi con intestazioni fisse (IPOTESI 1 / IPOTESI 2)
- Post-processing attivo (safety net):
  - stripMarkdownAndBullets(): rimuove markdown, bullet, numerazioni (anche 1) e •
  - softenBannedWords(): sostituzione “potrebbe” -> “tende a”
  - enforceLabeledLines(): tenta di estrarre solo le righe con label (se tutte presenti)
  - enforceAmplificatoShape(): forza massimo 3 frasi per blocco (attualmente)
- Fallback V2 presente e differenziato (non copia le ancore, non produce testi identici su tutte le sezioni).

### Problemi osservati (reali, ricorrenti)
1) “Magia” in calo: l’output diventa troppo formulaico quando i vincoli sono troppo stretti.
   - Sintomo tipico: amplificato super-astratto, ripetitivo (“Tra X e Y…”, frasi identiche).
2) PAROLA-OMBRA: a volte il modello ignora il vincolo e scrive frasi (“La parola X sembra…”).
3) Amplificato: con 3 frasi e frasi “corte”, perde profondità e diventa cronaca/placeholder.

---

## Metriche “ok / non ok” per i report
OK se:
- Nessun riassunto degli eventi (“cosa è successo”).
- Niente citazioni testuali delle risposte (no incipit copincollati).
- Nessun linguaggio da verdetto/morale.
- AMPLIFICATO: IPOTESI 1 e 2 non clonano le stesse frasi/idee.
- PAROLA-OMBRA: una sola parola (idealmente da whitelist), senza spiegazione.

NON OK se:
- Elenchi markdown, grassetti, trattini, numerazioni.
- “Nella risposta 1/2/3…”
- “innocenza / accuse / negazione / speculazioni”
- “potrebbe” ripetuto a raffica.
- Amplificato ridotto a slogan senza “macchina interpretativa”.

---

## Decisioni tecniche prese (importanti)
- Il modello può usare parole presenti nelle risposte del giocatore (es. “ispezione esterna”, “logistica”, ecc.):
  non è un bug se sono nell’input.
- La stabilità è più importante del “perfetto”: post-processing leggero sì, riscritture infinite no.
- Per recuperare “magia” in AMPLIFICATO serve più respiro:
  togliere il limite “frasi corte” e aumentare le frasi (4–6) oppure passare a “2 paragrafi brevi”.

---

## Prossimi step operativi (ordine)
1) Stabilizzare observe.js senza regressioni:
   - (A) fissare PAROLA-OMBRA a una sola parola davvero (prompt + enforcement minimal)
   - (B) amplificato: tornare più “ricco” (4–6 frasi o 2 mini-paragrafi) mantenendo anti-clone
2) UI: controllare resa su telefono (leggibilità, scroll, blocchi osservazioni, votazione).
3) Freeze della demo (tag/archivio): quando output è stabile e “bello” su desktop + telefono.
4) “Vestire” 1–2 contesti alternativi (config JSON/YAML) senza cambiare codice core.
5) Ripresa del motore narrativo più grande (World/Knowledge/State/Hypotheses/Judge/Narrator/OutcomeProfiler).

---

## Note operative Vercel
- Se /api/observe fa 500: controllare log su Vercel.
- Se errore 400 “model decommissioned”: cambiare GROQ_MODEL su Vercel (ENV), non hardcodare.
- Se 404 su /api/observe: controllare path e deployment (build output / root / routing).

---

## Albero progetto (ultimo noto)
(riportato da Paolino)
C:.
│   continuita.md
│   conversationCore.js
│   demo.js
│   demoNarrator.js
│   index.html
│   manifest.md
│   manifestDemoLeak.md
│   manifest_OLD.md
│   project_spine_OLD.md
│   project_spine_simmetrica.md
│   script.js
│   world_description.yaml
│
├───api
│       charles.js
│       chat.js
│       observe.js
│       observe_bigPrompt.js
│       package.json
│       vote.js
│
├───contracts
│       judgeOutput.contract.js
│       outcomeProfile.contract.js
│
├───data
│   ├───characters
│   │       riccardo.json
│   │
│   ├───game
│   │       facts.js
│   │       facts.json
│   │       facts_old.json
│   │       facts_old2.json
│   │       scenario.json
│   │       state.json
│   │       state_old.json
│   │
│   ├───knowledge
│   │       base_knowledge.js
│   │
│   └───world
│           base_wold.js
│           timeline.json
│           truth.json
│           world.json
│
├───demo
│       demoFringeLeak.js
│
├───docs
│       app.js
│       app_backup.js
│       app_old.js
│       app_OLD2.js
│       app_OLD3.js
│       index.html
│       index_old.html
│       observerLLM.js
│       observerLLM_OLD.js
│
├───engine
│   │   actions.js
│   │   engine.js
│   │   engine_OLD.js
│   │   gameState.js
│   │   hypotheses.js
│   │   interactionResolver.js
│   │   knowledge.js
│   │   state.js
│   │   world.js
│   │   world_old.js
│   │
│   └───actions
│           accuse.js
│           advancePhase.js
│           applyHypothesisEffects.js
│           connectFacts.js
│           inspectObject.js
│           interrogateAgent.js
│           interrogatePerson.js
│           interrogate_OLD.js
│           searchRoom.js
│
├───hypotheses
│       hypotheses.js
│
├───judge
│       judge.js
│
├───knowledge
│       elena.json
│       riccardo.json
│
├───manifest
│       continuita.md
│       manifest.md
│
├───narrator
│       narrator.js
│       narrator_OLD.js
│       narrator_OLD_old.js
│
├───outcomes
│       outcomeProfiler.js
│
├───prompts
│       charles.txt
│
└───web-demo
        app.js
        index.html
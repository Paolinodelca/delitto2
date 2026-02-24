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
- Non mischiare SDK: endpoint Groq compatibile OpenAI:
  https://api.groq.com/openai/v1/chat/completions
- Env richieste:
  - GROQ_API_KEY
  - GROQ_MODEL (es. llama-3.3-70b-versatile)
- Paolino preferisce file completi da sostituire, non patch; non fare ipotesi sul codice: chiedere i file quando servono.

---

## Struttura progetto (punti caldi)
- UI canonica: docs/app.js (non cambiare struttura file senza motivo).
- API osservazioni: api/observe.js (prompt + safety net).
- API votazione: api/vote.js (invio a Google Apps Script, lock anti-multiplo).

---

## Stato attuale (ultimo noto)
- GROQ_MODEL spostato su Vercel (ENV) + fallback in codice.
- Prompt con formato etichettato:
  - FRINGE: 4 righe (PRIMO PIANO / FUORI CAMPO / AGENZIA / TENSIONE)
  - RELAZIONALE: 5 righe (RITMO / REGISTRO / FUORI CAMPO / PAROLA-OMBRA / SOSPESO)
  - AMPLIFICATO: 2 blocchi x 3 frasi
- Problema ricorrente: il modello a volte ignora i divieti (markdown, elenchi, parole “tribunale”).
- Soluzione consigliata: post-processing minimo (strip markdown + enforce formato).

---

## Metriche “ok / non ok” per i report
OK se:
- Nessun riassunto degli eventi (“cosa è successo”).
- Niente citazioni testuali delle risposte.
- Nessun linguaggio da verdetto/morale.
- AMPLIFICATO: IPOTESI 1 e 2 non clonano le stesse frasi/idee.

NON OK se:
- Elenchi markdown, grassetti, trattini, numerazioni.
- “Nella risposta 1/2/3…”
- “innocenza / accuse / negazione / speculazioni”
- “potrebbe” ripetuto a raffica.

---

## Prossimi step operativi (ordine)
1) Stabilizzare observe.js (prompt + enforce formato).
2) Piccoli ritocchi UI: medaglie leggibili + vincolo anti-misuse (tutte diverse prima dell’invio).
3) Estrarre config del gioco (scenario, ruoli, domande) in JSON/YAML per “vestire” altri contesti.

---

## Note operative Vercel
- Se /api/observe fa 500: controllare log su Vercel.
- Se errore 400 “model decommissioned”: cambiare GROQ_MODEL su Vercel (ENV), non hardcodare.

CONTINUITÀ — DEMO FRINGE / LEAK + MOTORE (Paolino)
Obiettivo immediato

Rendere FRINGE / LEAK stabile e “memorabile” (UI + osservazioni + chiusura replay; votazione opzionale).

Rendere la demo configurabile (data-driven): nuovi scenari = solo JSON, senza cambiare docs/app.js.

Tornare al motore narrativo (World/Knowledge/State/Hypotheses/Judge/Narrator/OutcomeProfiler).

Non negoziabile (canonico)

FRINGE / LEAK NON è ricostruzione dei fatti: valuta COME il giocatore rende accettabili decisioni sapendo che verranno lette/interpretate.

Microcopy “non verità → versione” va mostrato prima delle domande e non va “svuotato”.

Output osservazioni finali: SEMPRE 3 campi e SEMPRE oggetto { fringe, psicologico, amplificato } (non array).

AMPLIFICATO contiene due ipotesi parallele (sincero vs messa in scena) nella stessa lettura.

Endpoint Groq compatibile OpenAI: https://api.groq.com/openai/v1/chat/completions

Env richieste:

GROQ_API_KEY

GROQ_MODEL (es. llama-3.3-70b-versatile)

Paolino preferisce file completi da sostituire, non patch; non fare ipotesi sul suo codice: chiedere i file quando servono.

Nota: il JSON non può override-are funzioni. Per cambiare scenarioText via JSON si usa scenarioHtmlTemplate + adattatore in docs/app.js che genera scenarioText(partnerName).

Struttura progetto (punti caldi)

UI canonica: docs/app.js (file unico, comune a tutti gli scenari).

API osservazioni: api/observe.js (prompt + safety net + post-processing).

API votazione (se riattivata): api/vote.js (invio a Google Apps Script, lock anti-multiplo).

“Vestiti” (scenari): JSON in docs/data/ pubblicati come /data/*.json.

Stato attuale (aggiornato)
Groq / Modello

Errore visto: model decommissioned su llama-3.1-70b-versatile.

Modello funzionante confermato: llama-3.3-70b-versatile.

Strategia attiva:

GROQ_MODEL impostato su Vercel (All environments).

In codice: const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

Observe.js

Versione log: "OBSERVE VERSION: AMP-V6".

Prompt “etichettato” attivo:

FRINGE: 4 righe (PRIMO PIANO / FUORI CAMPO / AGENZIA / TENSIONE)

RELAZIONALE: 5 righe (RITMO / REGISTRO / FUORI CAMPO / PAROLA-OMBRA / SOSPESO)

AMPLIFICATO: 2 blocchi (IPOTESI 1 / IPOTESI 2)

Post-processing (safety net):

stripMarkdownAndBullets() rimuove markdown, bullet, numerazioni, •

softenBannedWords() sostituisce “potrebbe” → “tende a”

enforceLabeledLines() prova a estrarre solo righe con label

enforceAmplificatoShape() limita la forma (in una fase era “troppo stretto”)

Fallback V2 presente e differenziato (non copia ancore, non genera testi identici).

Problemi osservati (reali, ricorrenti)

“Magia” in calo: output troppo formulaico quando vincoli troppo stretti.

PAROLA-OMBRA: a volte il modello scrive frasi invece di una parola.

AMPLIFICATO: con limiti troppo aggressivi perde profondità.

Aggiornamento operativo (scenari / vestiti)
Scenario JSON + override

UI resta canonica in docs/app.js, ma può caricare “vestiti” da JSON.

Loader attivo: legge parametro URL ?s= e sceglie file:

?s=batman → scenario_batman.json

?s=partner → scenario_partner_geloso.json

?s=alieni → scenario_alieni.json

default → scenario_fringe_leak.json

Percorsi funzionanti (setup attuale repo):

GitHub Pages: https://paolinodelca.github.io/delitto2/data/<file>.json

Vercel: https://delitto2.vercel.app/data/<file>.json

Nota: URL .../delitto2/docs/data/... su Pages può dare 404: non è il path pubblico corretto.

Rotazione domande (“magia”)

Se nel JSON esiste questionSets (array di set), all’avvio viene scelto un set:

preferito: rotazione via localStorage (0,1,2,0,1…)

alternativa: random (meno controllabile)

Obiettivo: se ripeti il gioco, trovi domande diverse → esperienza più viva.

Context box (il blocco sopra le domande)

Problema emerso: Batman mostrava domande corrette, ma il box contesto restava “Saturn-centrico” (Walter/Alex ecc.).

Soluzione prevista: nei JSON aggiungere contextHtmlTemplate (con {{companyName}} e {{partnerName}}) e opzionalmente roles.

Se contextHtmlTemplate manca: usare fallback generico, non Saturn-centrico.

CORS e API (Pages → Vercel)

GitHub Pages non può chiamare /api/observe interno: deve chiamare Vercel.

L’API Vercel deve gestire preflight e CORS:

Access-Control-Allow-Origin: *

Access-Control-Allow-Methods: POST, OPTIONS

Access-Control-Allow-Headers: Content-Type, Authorization

se OPTIONS → 200 + end()

Nel client:

API_ORIGIN = "" su Vercel

API_ORIGIN = "https://delitto2.vercel.app" su github.io

Sintomi noti:

405: metodo errato o preflight non gestito

CORS error: mancano header su OPTIONS/POST

Problema bloccante attuale (2026-03-04)
“Pagina nera” + errore JS

Su URL tipo .../?s=batman&v=1 appare pagina nera.

Console: Uncaught SyntaxError: Illegal return statement — app.js:500.

Interpretazione: non è un problema di JSON ma di JavaScript rotto in docs/app.js:

tipico: un return; finito fuori da una funzione

oppure una graffa } mancante prima della zona “render” (il parser crede che il return sia top-level)

Azione di rientro (check rapido):

aprire Console → confermare riga esatta (intorno a 500)

controllare docs/app.js in quella zona: graffe e return devono stare solo dentro render() o altre funzioni

appena risolto, la pagina torna a renderizzare e si può verificare Batman.

Metriche “ok / non ok” per i report

OK se:

Nessun riassunto degli eventi (“cosa è successo”).

Niente citazioni testuali delle risposte.

Nessun linguaggio da verdetto/morale.

AMPLIFICATO: IPOTESI 1 e 2 non clonano idee.

PAROLA-OMBRA: una sola parola, senza spiegazione.

NON OK se:

markdown/bullet/numerazioni.

“Nella risposta 1/2/3…”

“innocenza / accuse / negazione / speculazioni”

“potrebbe” ripetuto a raffica.

amplificato ridotto a slogan senza macchina interpretativa.

Decisioni tecniche prese (importanti)

Il modello può riprendere parole presenti nell’input: non è un bug.

Stabilità > perfezione: post-processing leggero sì, riscritture infinite no.

Per recuperare “magia” in AMPLIFICATO: più respiro (4–6 frasi o 2 mini-paragrafi), mantenendo anti-clone.

Prossimi step operativi (ordine)

Fix pagina nera: risolvere Illegal return statement in docs/app.js (riga ~500).

Stabilizzare Batman end-to-end:

scenario/microcopy/scenarioHtmlTemplate

domande da questionSets

contextHtmlTemplate + (opzionale) roles

Completare vestiti:

scenario_partner_geloso.json e scenario_alieni.json con:

scenario, companyName, introText, microcopyText

scenarioHtmlTemplate

contextHtmlTemplate

roles (se servono)

questionSets (≥2 set)

UI telefono (scroll, leggibilità, blocchi osservazioni).

Freeze: taggare una RC nuova quando 3 scenari funzionano su Pages + Vercel.

Note operative Vercel / Git

Se /api/observe fa 500: log su Vercel.

Se errore 400 “model decommissioned”: cambiare GROQ_MODEL su Vercel (ENV).

Tag git = fotografia di un commit: per “aggiornare” si crea un nuovo tag (es. rc-fringe-leak-v0.3).

Albero progetto (ultimo noto)

(riportato da Paolino)

docs/app.js

docs/data/scenario_fringe_leak.json

docs/data/scenario_batman.json

docs/data/scenario_partner_geloso.json

docs/data/scenario_alieni.json

api/observe.js

ecc. (tree completo già in chat)
// api/observe.js
export default async function handler(req, res) {
  console.log("OBSERVE VERSION: AMP-V5");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY mancante");

    const {
      scenario,
      context,
      playerModel,
      answers,
      observedAnchors = [],
      pressureLevel = 0
    } = req.body || {};

    if (!scenario || !playerModel || !answers) {
      return res.status(400).json({ error: "Dati incompleti" });
    }

    // --- Qualità input (anti-invenzioni) ---
    const trimmedAnswers = Array.isArray(answers)
      ? answers.map(a => (a ?? "").toString().trim())
      : [];

    const blankCount = trimmedAnswers.filter(a => a.length === 0).length;
    const shortCount = trimmedAnswers.filter(a => a.length > 0 && a.length < 10).length;
    const total = trimmedAnswers.length;

    const roleWalter = context?.responsabile || "Walter";
    const roleAlex = context?.amico || "Alex";
    const rolePartner = context?.partner || "(partner)";

    // =========================
    // PROMPT (AMP-V5) — “magico”: deduzioni senza mostrare meccanismi
    // =========================
    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO.

NON è una ricostruzione dei fatti.
NON riassumere gli eventi.
NON citare frasi del giocatore.
NON usare “nella risposta…”.
NON attribuire intenzioni o stati interiori (“cerca di”, “vuole”, “per evitare”, “ansia”, “insicurezza”, “confusione”).
NON usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Niente elenchi, niente markdown.

Scrivi 4 frasi brevi, in terza persona, tono sobrio.
Frase 1: cosa la forma del racconto mette davanti (senza dire cosa è successo).
Frase 2: cosa resta fuori campo o implicito (senza “manca / non è chiaro”).
Frase 3: come si distribuisce l’azione nella forma (chi appare come fonte dell’azione: giocatore / contesto / altri).
Frase 4: una tensione formale che resta aperta (senza chiudere, senza conclusioni).

Se molte risposte sono vuote o brevissime: rendilo il punto centrale e non inventare nulla.
`,

      psicologico: `
Sei un OSSERVATORE ESTERNO.
Obiettivo: LETTURA RELAZIONALE = impressione generata dalla forma dell’esposizione su chi legge.

Regole dure:
NON fare diagnosi.
NON attribuire intenzioni o stati interiori (“cerca di”, “vuole”, “per evitare”, “ansia”, “insicurezza”, “confusione”).
NON usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
NON inventare dettagli o conseguenze non presenti.
NON citare frasi del giocatore e NON usare “nella risposta 1/2/3”.
NON citare playerModel, pressureLevel o numeri.
NON introdurre nomi diversi da: ${roleWalter}, ${roleAlex}, ${rolePartner}.
Niente elenchi, niente markdown.

Scrivi 5 frasi naturali in terza persona:
1) ritmo (compressione vs dilatazione)
2) registro (dove diventa più controllato o più spontaneo)
3) cosa resta fuori campo (usa “resta fuori campo / rimane implicito”)
4) una parola-ombra (distanza / urgenza / attrito / opacità / sobrietà / leggerezza) senza spiegarla
5) chiusura sospesa (non risolvere ambiguità)
`,

      amplificato: `
Sei un OSSERVATORE ESTERNO.

Qui NON descrivi l’effetto sul lettore.
Qui proponi due schemi possibili dietro la forma del racconto: decisione vs regia narrativa.

Formato obbligatorio (testo semplice, niente markdown):
IPOTESI 1 — SINCERO:
3 frasi.
IPOTESI 2 — MESSA IN SCENA:
3 frasi.

Regole dure:
NON dire quale ipotesi è vera.
NON inventare dettagli o conseguenze non presenti.
NON attribuire intenzioni esplicite (niente “cerca di”, “vuole”, “per evitare”, “strategia per”).
NON usare parole da verdetto o morale: colpa, responsabilità, incolpare, scaricare, innocenza, manipolazione, difesa, mentire, verità, onesto.
NON giudicare qualità o capacità (niente “imprudente”, “scorretto”, “debole”, “errore”).
NON usare “non è chiaro / manca / non spiega”: usa “resta fuori campo / rimane implicito”.
NON citare frasi del giocatore e NON usare “nella risposta 1/2/3”.
NON citare playerModel, pressureLevel o numeri.
NON introdurre nomi diversi da: ${roleWalter}, ${roleAlex}, ${rolePartner}.

IPOTESI 1: schema decisionale che emerge dalla forma (priorità, trade-off, urgenza, delega, soglia di accettabilità, rischio, attribuzione dell’azione).
IPOTESI 2: regia narrativa (costruzione del personaggio, frame di ammissibilità, gestione del sospetto, antagonista/alleato, teatralità sobria, compressione/dilatazione).

Se molte risposte sono vuote/brevissime:
IPOTESI 1: non emerge uno schema decisionale.
IPOTESI 2: la regia è ridotta a opacità/assenza di materiale.

Tono: ambiguo ma leggibile.
Terza persona.
`
    };

    // =========================
    // CONTESTO BLINDATO (per evitare invenzioni)
    // =========================
    const userContext = `
SCENARIO (IMMUTABILE):
${scenario}

RUOLI — NON INTERPRETABILI:
- Soggetto osservato: GIOCATORE
- Responsabile gerarchico: ${roleWalter}
- Collega / confidente: ${roleAlex}
- Partner affettivo: ${rolePartner}

AMBIENTE:
Azienda che sviluppa tecnologie sensibili.
La sicurezza è una condizione operativa, non simbolica.

QUALITÀ INPUT (solo per evitare invenzioni):
- totale risposte: ${total}
- risposte vuote: ${blankCount}
- risposte molto brevi (<10 char): ${shortCount}

RISPOSTE FORNITE DAL GIOCATORE:
${trimmedAnswers.map((a, i) => `${i + 1}. ${a || "[vuoto]"}`).join("\n")}

RICORRENZE OSSERVATE:
${observedAnchors.length > 0 ? observedAnchors.join(", ") : "nessuna esplicita"}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Osserva esclusivamente la forma dell’esposizione.
Non citare playerModel/pressureLevel/contatori.
`;

    async function callLLM(systemPrompt) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          // se tu hai già cambiato modello e funziona, lascialo qui:
          // altrimenti rimettilo com'era da te.
          model: "llama-3.1-70b-versatile",
          temperature: 0.25,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContext }
          ]
        })
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`Errore LLM: ${response.status} ${txt}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    }

    // =========================
    // SANITIZE + FORMAT ENFORCERS (ANTI “scolastico”)
    // =========================
    function stripMarkdownAndLists(s = "") {
      let out = (s || "").toString().trim();
      // rimuove **bold**, ### titoli, ecc.
      out = out.replace(/\*\*(.*?)\*\*/g, "$1");
      out = out.replace(/^#{1,6}\s+/gm, "");
      // rimuove bullet e numerazioni a inizio riga
      out = out.replace(/^\s*[-•]\s+/gm, "");
      out = out.replace(/^\s*\d+\)\s+/gm, "");
      out = out.replace(/^\s*\d+\.\s+/gm, "");
      return out.trim();
    }

    function sanitizeCommon(s = "") {
      let out = stripMarkdownAndLists(s);

      // taglia spazi multipli
      out = out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

      // “Verdetti” e intenzioni: sostituzioni soft (forma, non psicologia)
      const swaps = [
        [/innocen[zt]a/gi, "tenuta della versione"],
        [/colpevole|colpa/gi, "zona d’ombra"],
        [/responsabilit[aà]/gi, "attribuzione dell’azione"],
        [/scaricare/gi, "spostare l’azione fuori dal perimetro"],
        [/manipolazione|manipolare/gi, "regia della cornice"],
        [/mentire|bugia|menzogna|verit[aà]/gi, "versione"],
        [/convincere|persuadere|persuasione/gi, "spinta argomentativa"],
        [/intento|strategia/gi, "assetto della forma"],
        [/cerca di|vuole|per evitare/gi, "tende a"],
        [/non è chiaro|manca|non spiega/gi, "resta fuori campo"]
      ];

      for (const [re, rep] of swaps) out = out.replace(re, rep);

      // evita “il lettore”: troppo meta
      out = out.replace(/\bil lettore\b/gi, "chi legge");

      // evita “nella risposta”
      out = out.replace(/\bnella risposta\b/gi, "nel testo");

      // evita pronomi tipo “chiedergli di sostituirmi” se uscissero (spesso è eco):
      out = out.replace(/\bsostituirmi\b/gi, "sostituire il giocatore");

      return out.trim();
    }

    function enforceFringeFormat(raw) {
      let out = sanitizeCommon(raw);

      // Niente “Ecco…” e niente due punti + elenco
      out = out.replace(/^Ecco.*?\n+/i, "");
      out = out.replace(/:\s*\n/g, ".\n");

      // Prendi solo frasi “pulite”
      const sentences = out
        .split(/(?<=[.!?])\s+/)
        .map(x => x.trim())
        .filter(Boolean);

      // ricostruisci 4 frasi, se possibile
      const picked = sentences.slice(0, 4);

      // fallback “soft” se troppo corto
      const base = [
        "La forma del racconto mette davanti la posizione del giocatore dentro una cornice di lavoro e di dovere.",
        "Alcuni passaggi restano fuori campo e creano un margine di ambiguità senza dichiararlo apertamente.",
        "L’azione nel testo si distribuisce tra il giocatore e una cornice di contesto che rende le scelte presentabili.",
        "La tensione tra ciò che viene detto e ciò che resta implicito rimane aperta."
      ];

      const final = (picked.length >= 4 ? picked : base).slice(0, 4);
      return final.join(" ");
    }

    function enforceRelazionaleFormat(raw) {
      let out = sanitizeCommon(raw);

      // niente numerazioni
      out = out.replace(/^\s*\d+\.\s+/gm, "");

      const sentences = out
        .split(/(?<=[.!?])\s+/)
        .map(x => x.trim())
        .filter(Boolean);

      // vogliamo 5 frasi
      const picked = sentences.slice(0, 5);

      const base = [
        "Il ritmo alterna compressione e dilatazione, con tratti rapidi e tratti più controllati.",
        "Il registro scivola tra un tono più istituzionale e un tono più quotidiano, senza stabilizzarsi del tutto.",
        "Una parte del quadro resta fuori campo e produce un margine di non-detto.",
        "Rimane una parola-ombra che colora l’insieme senza diventare dichiarazione.",
        "La forma lascia la tensione sospesa, senza chiudere la lettura."
      ];

      const final = (picked.length >= 5 ? picked : base).slice(0, 5);
      return final.join(" ");
    }

    function enforceAmplificatoFormat(raw) {
      let out = sanitizeCommon(raw);

      // normalizza etichette
      out = out.replace(/IPOTESI\s*1\s*[-—]\s*SINCERO\s*:?/i, "IPOTESI 1 — SINCERO:");
      out = out.replace(/IPOTESI\s*2\s*[-—]\s*MESSA\s*IN\s*SCENA\s*:?/i, "IPOTESI 2 — MESSA IN SCENA:");

      // se mancano, prova a inserirle
      if (!/IPOTESI 1 — SINCERO:/i.test(out) || !/IPOTESI 2 — MESSA IN SCENA:/i.test(out)) {
        // prova a separare a metà in modo grezzo
        const parts = out.split(/\n{2,}/).filter(Boolean);
        const half = Math.ceil(parts.length / 2);
        const a = parts.slice(0, half).join(" ").trim();
        const b = parts.slice(half).join(" ").trim();
        out = `IPOTESI 1 — SINCERO:\n${a || ""}\nIPOTESI 2 — MESSA IN SCENA:\n${b || ""}`.trim();
      }

      // estrai blocchi
      const m1 = out.match(/IPOTESI 1 — SINCERO:\s*([\s\S]*?)\s*IPOTESI 2 — MESSA IN SCENA:/i);
      const m2 = out.match(/IPOTESI 2 — MESSA IN SCENA:\s*([\s\S]*)$/i);

      let b1 = (m1?.[1] || "").trim();
      let b2 = (m2?.[1] || "").trim();

      // riduci a frasi, 3 e 3
      const s1 = b1.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean).slice(0, 3);
      const s2 = b2.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean).slice(0, 3);

      // se poche risposte reali, usa preset “vuoto”
      if (blankCount + shortCount >= Math.max(3, Math.floor(total * 0.6))) {
        return [
          "IPOTESI 1 — SINCERO:",
          "Non emerge uno schema decisionale: la forma resta troppo povera per far vedere priorità e soglie.",
          "L’azione rimane distribuita in modo generico e non si stabilizza un criterio ricorrente.",
          "Resta soprattutto una cornice di presenza minimale, senza trade-off leggibili.",
          "IPOTESI 2 — MESSA IN SCENA:",
          "La regia è ridotta a opacità/assenza di materiale: il testo non costruisce un frame riconoscibile.",
          "Il personaggio resta piatto e non prende forma un controllo del sospetto coerente.",
          "Rimane un effetto di fuori campo più che una messa in scena compiuta."
        ].join("\n");
      }

      const base1 = [
        "Nella forma emerge un criterio di priorità: alcune ragioni vengono messe davanti e altre restano fuori campo.",
        "Lo schema decisionale usa soglie di accettabilità e trade-off, più che un racconto lineare.",
        "L’azione tende a distribuirsi tra il giocatore e il contesto, con delega o spostamento del rischio."
      ];

      const base2 = [
        "La regia costruisce un frame di ammissibilità: i passaggi vengono compressi o dilatati per guidare la lettura.",
        "Il personaggio viene definito per contrasto con altri ruoli, con gestione sobria del sospetto.",
        "Rimane un controllo della cornice più che una spiegazione: ciò che conta è come appare, non cosa accade."
      ];

      const final1 = (s1.length === 3 ? s1 : base1).slice(0, 3).join(" ");
      const final2 = (s2.length === 3 ? s2 : base2).slice(0, 3).join(" ");

      return `IPOTESI 1 — SINCERO:\n${final1}\nIPOTESI 2 — MESSA IN SCENA:\n${final2}`;
    }

    // =========================
    // CALLS
    // =========================
    const [rawFringe, rawRel, rawAmp] = await Promise.all([
      callLLM(prompts.fringe),
      callLLM(prompts.psicologico),
      callLLM(prompts.amplificato)
    ]);

    const fringe = enforceFringeFormat(rawFringe);
    const psicologico = enforceRelazionaleFormat(rawRel);
    const amplificato = enforceAmplificatoFormat(rawAmp);

    return res.status(200).json({
      osservazioni: { fringe, psicologico, amplificato }
    });

  } catch (err) {
    console.error("Observe fallback:", err);

    const fallback = proceduralObservation({
      pressureLevel: req.body?.pressureLevel || 0,
      playerModel: req.body?.playerModel || {},
      observedAnchors: req.body?.observedAnchors || []
    });

    return res.status(200).json({
      osservazioni: {
        fringe: fallback,
        psicologico: fallback,
        amplificato: fallback
      }
    });
  }
}

/* ===========================
   FALLBACK PROCEDURALE
=========================== */
function proceduralObservation({ pressureLevel, playerModel, observedAnchors }) {
  const fragments = [];

  fragments.push("Il materiale consente una lettura prudente, centrata sulla forma più che sui fatti.");

  if (pressureLevel > 70) {
    fragments.push("La pressione tende a comprimere l’esposizione e a lasciare più elementi fuori campo.");
  }

  if (playerModel?.stile === "elusivo") {
    fragments.push("Alcune formulazioni spostano l’attribuzione dell’azione verso il contesto invece che verso il soggetto.");
  }

  if (Array.isArray(observedAnchors) && observedAnchors.length > 0) {
    fragments.push(`Alcune ricorrenze tornano (${observedAnchors.join(", ")}), senza trasformarsi in un filo esplicito.`);
  }

  fragments.push("La tensione rimane sospesa e dipende da come chi legge interpreta questa cornice.");

  return fragments.join(" ");
}

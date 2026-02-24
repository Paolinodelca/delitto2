export default async function handler(req, res) {
  console.log("OBSERVE VERSION: AMP-V6");

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

    const trimmedAnswers = Array.isArray(answers)
      ? answers.map(a => (a ?? "").toString().trim())
      : [];

    const blankCount = trimmedAnswers.filter(a => a.length === 0).length;
    const shortCount = trimmedAnswers.filter(a => a.length > 0 && a.length < 10).length;
    const total = trimmedAnswers.length;

    const roleWalter = context?.responsabile || "Walter";
    const roleAlex = context?.amico || "Alex";
    const rolePartner = context?.partner || "(partner)";

    // ✅ modello configurabile da env (così non si rompe quando cambi modello)
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

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
Frase 3: come si distribuisce l’azione nella forma (giocatore / contesto / altri).
Frase 4: una tensione formale che resta aperta (senza chiudere).

Se molte risposte sono vuote o brevissime: rendilo il punto centrale e non inventare nulla.
`.trim(),

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
2) registro (più controllato o più spontaneo)
3) cosa resta fuori campo (usa “resta fuori campo / rimane implicito”)
4) una parola-ombra (distanza / urgenza / attrito / opacità / sobrietà / leggerezza) senza spiegarla
5) chiusura sospesa (non risolvere ambiguità)
`.trim(),

      amplificato: `
Sei un OSSERVATORE ESTERNO.

Qui NON descrivi l’effetto su chi legge.
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

IPOTESI 1: schema decisionale (priorità, trade-off, urgenza, delega, soglia di accettabilità, rischio, attribuzione dell’azione).
IPOTESI 2: regia narrativa (personaggio, frame di ammissibilità, sospetto, antagonista/alleato, teatralità sobria, compressione/dilatazione).

Se molte risposte sono vuote/brevissime:
IPOTESI 1: non emerge uno schema decisionale.
IPOTESI 2: la regia è ridotta a opacità/assenza di materiale.
`.trim()
    };

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

QUALITÀ INPUT:
- totale risposte: ${total}
- risposte vuote: ${blankCount}
- risposte molto brevi (<10 char): ${shortCount}

RISPOSTE:
${trimmedAnswers.map((a, i) => `${i + 1}. ${a || "[vuoto]"}`).join("\n")}

RICORRENZE OSSERVATE:
${Array.isArray(observedAnchors) && observedAnchors.length > 0 ? observedAnchors.slice(0, 8).join(", ") : "nessuna esplicita"}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Osserva esclusivamente la forma dell’esposizione.
`.trim();

    async function callLLM(systemPrompt) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.25,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContext }
          ]
        })
      });

      const rawText = await response.text().catch(() => "");
      if (!response.ok) {
        console.error("Groq error status:", response.status);
        console.error("Groq error body:", rawText?.slice(0, 1200));
        throw new Error(`Errore LLM ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error("Groq non-JSON body:", rawText?.slice(0, 1200));
        throw new Error("Errore LLM: risposta non JSON");
      }

      return data.choices?.[0]?.message?.content?.trim() || "";
    }

    const [fringe, psicologico, amplificato] = await Promise.all([
      callLLM(prompts.fringe),
      callLLM(prompts.psicologico),
      callLLM(prompts.amplificato)
    ]);

    return res.status(200).json({
      osservazioni: { fringe, psicologico, amplificato }
    });

  } catch (err) {
    console.error("Observe fallback:", err);

    const fallback = proceduralFallbackV2(req.body || {});
    return res.status(200).json({
      osservazioni: fallback
    });
  }
}

/* ===========================
   FALLBACK V2 — NON PIÙ IDENTICO
   (e senza dump delle ancore)
=========================== */
function proceduralFallbackV2(body) {
  const pressureLevel = body?.pressureLevel || 0;

  const answers = Array.isArray(body?.answers) ? body.answers : [];
  const trimmed = answers.map(a => (a ?? "").toString().trim());
  const blankCount = trimmed.filter(a => a.length === 0).length;
  const shortCount = trimmed.filter(a => a.length > 0 && a.length < 10).length;
  const total = trimmed.length || 5;

  const scarce = (blankCount + shortCount) >= Math.max(3, Math.floor(total * 0.6));

  const fringe = scarce
    ? "Il materiale è molto scarso: la forma del racconto resta quasi tutta fuori campo. L’azione non si distribuisce in modo leggibile e la cornice rimane generica. Le poche frasi disponibili non stabilizzano un registro. La tensione resta sospesa."
    : "Il materiale consente una lettura prudente: la forma mette davanti una cornice di lavoro e lascia alcune zone implicite. L’azione nel testo tende a oscillare tra iniziativa del giocatore e spinta del contesto. Il registro si stabilizza solo a tratti. La tensione resta sospesa.";

  const psicologico = scarce
    ? "L’effetto principale è quello delle omissioni: chi legge riceve frammenti e deve colmare da sé i vuoti. Il registro resta minimale e non costruisce una traiettoria. Rimane una parola-ombra di opacità. La lettura resta sospesa. La forma non chiude."
    : "Il ritmo alterna compressione e dilatazione: alcuni passaggi scorrono rapidi, altri si trattengono. Il registro oscilla tra sobrietà e maggiore controllo. Una parte del quadro resta fuori campo e produce un margine di non-detto. Rimane una parola-ombra di urgenza o attrito. La lettura resta sospesa.";

  const amplificato = scarce
    ? [
        "IPOTESI 1 — SINCERO:",
        "Non emerge uno schema decisionale: il testo è troppo povero per far vedere priorità e soglie.",
        "L’attribuzione dell’azione resta generica e non si stabilizza un criterio ricorrente.",
        "Rimane soprattutto una cornice minimale, senza trade-off leggibili.",
        "IPOTESI 2 — MESSA IN SCENA:",
        "La regia è ridotta a opacità/assenza di materiale: non si costruisce un frame riconoscibile.",
        "Il personaggio resta piatto e non prende forma un controllo del sospetto coerente.",
        "Rimane un fuori campo dominante, più che una messa in scena compiuta."
      ].join("\n")
    : [
        "IPOTESI 1 — SINCERO:",
        "Nella forma emerge un criterio di priorità: alcune ragioni vengono messe davanti e altre restano implicite.",
        "Lo schema decisionale usa soglie di accettabilità e trade-off, più che un racconto lineare.",
        "L’azione tende a distribuirsi tra il giocatore e il contesto, con delega o spostamento del rischio.",
        "IPOTESI 2 — MESSA IN SCENA:",
        "La regia costruisce un frame di ammissibilità: i passaggi vengono compressi o dilatati per guidare la lettura.",
        "Il personaggio viene definito per contrasto con altri ruoli, con teatralità sobria e gestione del sospetto.",
        "Rimane un controllo della cornice più che una spiegazione: ciò che conta è come appare."
      ].join("\n");

  return {
    fringe,
    psicologico,
    amplificato
  };
}

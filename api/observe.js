export default async function handler(req, res) {
  console.log("OBSERVE VERSION: V4-FLUID");

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
    } = req.body;

    if (!scenario || !playerModel || !answers) {
      return res.status(400).json({ error: "Dati incompleti" });
    }

    // =========================
    // QUALITÀ INPUT + NORMALIZZAZIONE
    // =========================
    const trimmedAnswers = Array.isArray(answers)
      ? answers.map(a => (a ?? "").toString().trim())
      : [];

    const blankCount = trimmedAnswers.filter(a => a.length === 0).length;
    const shortCount = trimmedAnswers.filter(a => a.length > 0 && a.length < 10).length;
    const total = trimmedAnswers.length;

    // Normalizza nomi "rumore" che ricompaiono spesso (Max/Valter ecc.)
    // Così il modello non si aggancia a nomi sbagliati.
    function normalizeNames(s) {
      if (!s) return s;
      return s
        .replace(/\bMax\b/gi, "Alex")
        .replace(/\bValter\b/gi, "Walter");
    }

    const normalizedAnswers = trimmedAnswers.map(normalizeNames);

    // =========================
    // PROMPT V4 — FLUIDO (NO CHECKLIST)
    // =========================
const prompts = {
  fringe: `
Sei un osservatore esterno.

Non ricostruire i fatti.
Non riassumere gli eventi.
Non citare frasi del giocatore.
Non usare elenchi, trattini, numeri o intestazioni.
Non usare “nella risposta”.
Non attribuire intenzioni o stati interiori.
Non giudicare (niente colpa/responsabilità/innocenza, niente morale).

Scrivi ESATTAMENTE 4 frasi brevi, sobrie, in terza persona.
Ogni frase deve fare una sola cosa:
1) cosa il racconto porta sempre davanti.
2) cosa resta sistematicamente ai margini o fuori campo.
3) dove nasce l’azione nella forma (giocatore / contesto / altri).
4) una tensione che resta aperta, senza chiudere.

Tono: quasi da verbale.
`,

  psicologico: `
Sei un osservatore esterno.
Obiettivo: LETTURA RELAZIONALE = impressione generata dalla forma del testo su chi lo legge.

Divieti:
Non diagnosi.
Non intenzioni (“cerca di”, “vuole”, “per evitare”…).
Non parole da verdetto o morale (colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto).
Non citare frasi del giocatore e non usare “nella risposta”.
Non elenchi/trattini/numeri.
Non “manca / non è chiaro”: usa “resta fuori campo / rimane implicito”.

Scrivi ESATTAMENTE 5 frasi, in terza persona, senza spiegare il metodo:
1) ritmo (compressione vs dilatazione).
2) registro (dove si fa più controllato o più quotidiano).
3) una zona fuori campo (dillo così: “Resta fuori campo…”).
4) una parola-ombra (una sola parola: distanza / urgenza / attrito / opacità / sobrietà / leggerezza…).
5) frase finale sospesa, senza conclusione.
`,

  amplificato: `
Sei un osservatore esterno.

Qui NON descrivi l’effetto sul lettore.
Qui proponi due schemi possibili dietro la forma: decisione vs regia.

Formato obbligatorio, testo semplice, niente markdown:
IPOTESI 1 — SINCERO:
(3 frasi)
IPOTESI 2 — MESSA IN SCENA:
(3 frasi)

Divieti:
Non dire quale ipotesi è vera.
Non citare frasi del giocatore e non usare “nella risposta”.
Non intenzioni esplicite (“cerca di”, “vuole”, “per evitare”, “strategia per”…).
Non parole da verdetto o morale (colpa, responsabilità, incolpare, scaricare, innocenza, manipolazione, difesa, mentire, verità, onesto).
Non giudicare qualità/capacità (niente “imprudente”, “scorretto”, “debole”, “errore”).
Non “manca / non è chiaro / non spiega”: usa “resta fuori campo / rimane implicito”.
Non elenchi/trattini/numeri.
Non introdurre nomi diversi da Walter, Alex, (partner).

IPOTESI 1: schema decisionale (priorità, trade-off, urgenza, delega, soglia di accettabilità, attribuzione dell’azione).
IPOTESI 2: regia narrativa (costruzione del personaggio, frame di ammissibilità, gestione del sospetto, teatralità sobria, compressione/dilatazione).

Se molte risposte sono vuote/brevissime:
IPOTESI 1: non emerge uno schema decisionale.
IPOTESI 2: la regia è ridotta a opacità/assenza di materiale.

Tono: ambiguo ma leggibile. Terza persona.
`
};



    // =========================
    // CONTESTO BLINDATO
    // =========================
    const partner = context?.partner || "n/d";

    const userContext = `
SCENARIO (IMMUTABILE):
${scenario}

RUOLI — NON INTERPRETABILI:
- Soggetto osservato: GIOCATORE
- Responsabile gerarchico: ${context?.responsabile || "Walter"}
- Collega / confidente: ${context?.amico || "Alex"}
- Partner affettivo: ${partner}

AMBIENTE:
Azienda che sviluppa tecnologie sensibili.
La sicurezza è una condizione operativa, non simbolica.

PERSONAGGI CONSENTITI NEL TESTO:
Walter, Alex, (partner). Non introdurre altri nomi.

QUALITÀ INPUT (solo per evitare invenzioni):
- totale risposte: ${total}
- risposte vuote: ${blankCount}
- risposte molto brevi (<10 char): ${shortCount}

RISPOSTE FORNITE DAL GIOCATORE:
${normalizedAnswers.map((a, i) => `${i + 1}. ${a || "[vuoto]"}`).join("\n")}

RICORRENZE OSSERVATE:
${observedAnchors.length > 0 ? observedAnchors.join(", ") : "nessuna esplicita"}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Osserva esclusivamente la forma dell’esposizione.
Non citare playerModel/pressureLevel/contatori: usali solo come segnale interno per evitare invenzioni.
`;

    async function callLLM(systemPrompt) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
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

  fragments.push("Il materiale fornito consente una lettura prudente ma incompleta.");

  if (pressureLevel > 70) {
    fragments.push("La pressione sembra comprimere l’esposizione, riducendo i margini narrativi.");
  }

  if (playerModel?.stile === "elusivo") {
    fragments.push("Alcune formulazioni riducono l’assunzione diretta dell’azione nel testo.");
  }

  if (observedAnchors?.length > 0) {
    fragments.push(`Alcuni elementi ritornano più volte (${observedAnchors.join(", ")}), senza essere approfonditi.`);
  }

  fragments.push("La lettura complessiva dipende dal modo in cui questa esposizione verrà interpretata.");

  return fragments.join(" ");
}

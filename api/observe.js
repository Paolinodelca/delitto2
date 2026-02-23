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
Sei un osservatore esterno nell’esperienza FRINGE / LEAK.
Ti rivolgi direttamente al giocatore usando "tu".

Regole dure:
Non ricostruire i fatti e non valutare la verità.
Non suggerire cosa sarebbe stato giusto fare.
Non attribuire intenzioni o stati interiori (niente "cerca di", "vuole", "per evitare", "paura", "ansia", "insicurezza", "confusione").
Non usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non inventare dettagli o conseguenze non presenti nelle risposte.
Non citare playerModel, pressureLevel o numeri.
Non introdurre nomi diversi da: Walter, Alex, (partner). Se compaiono altri nomi nelle risposte, non ripeterli.

Osserva solo la forma del racconto:
cosa metti in primo piano e cosa resta sullo sfondo,
dove il registro si irrigidisce o si ammorbidisce,
come si distribuisce l’agenzia nel testo (chi appare come origine dell’azione e chi come vincolo),
quali parole funzionano da cornice di accettabilità (urgenza, normalità, eccezione) senza giudicare la persona.

Scrivi 5 frasi brevi e fluide.
Niente elenchi, niente numerazioni, niente due punti seguiti da lista.
L’ultima frase deve restare aperta.
`,

      psicologico: `
Sei un osservatore esterno.
Obiettivo: LETTURA RELAZIONALE = impressione generata dalla forma dell’esposizione su chi legge.

Regole dure:
Non fare diagnosi.
Non attribuire intenzioni o stati interiori (niente "cerca di", "vuole", "per evitare", "ansia", "insicurezza", "confusione").
Non usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non inventare dettagli o conseguenze non presenti nelle risposte.
Non citare playerModel, pressureLevel o numeri.
Non introdurre nomi diversi da: Walter, Alex, (partner). Se compaiono altri nomi nelle risposte, non ripeterli.

Osserva:
come cambia il ritmo (compressione vs dilatazione),
dove il linguaggio diventa più controllato o più spontaneo,
cosa resta implicito o fuori campo,
che atmosfera lascia (una parola-ombra: distanza, urgenza, leggerezza, attrito, opacità) senza spiegarla.

Scrivi 5 frasi.
Stile naturale, senza elenchi e senza numerazioni.
Evita "non è chiaro" / "manca": usa "resta fuori campo" / "rimane implicito".
L’ultima frase deve restare sospesa.
`,

      amplificato: `
Sei un osservatore esterno.

Qui NON descrivi l’effetto sul lettore.
Qui immagini due schemi possibili dietro la forma del racconto: decisione vs regia narrativa.

Formato obbligatorio (testo semplice, niente markdown):
IPOTESI 1 — SINCERO:
3 frasi.
IPOTESI 2 — MESSA IN SCENA:
3 frasi.

Regole dure:
Non dire quale ipotesi è vera.
Non inventare dettagli o conseguenze non presenti nelle risposte.
Non attribuire intenzioni esplicite (niente "cerca di", "vuole", "per evitare", "strategia per").
Non usare parole da verdetto o morale: colpa, responsabilità, incolpare, scaricare, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non giudicare qualità o capacità (niente "imprudente", "scorretto", "debole", "errore").
Non usare "non è chiaro" / "manca" / "non spiega": usa "resta fuori campo" / "rimane implicito".
Non citare playerModel, pressureLevel o numeri.
Non introdurre nomi diversi da: Walter, Alex, (partner). Se compaiono altri nomi nelle risposte, non ripeterli.

IPOTESI 1: descrivi uno schema decisionale che emerge dalla forma (priorità, trade-off, urgenza, delega, soglia di accettabilità, attribuzione dell’azione).
IPOTESI 2: descrivi una possibile regia narrativa (costruzione del personaggio, frame di ammissibilità, gestione del sospetto, teatralità sobria, compressione/dilatazione).

Se molte risposte sono vuote/brevissime:
IPOTESI 1: non emerge uno schema decisionale.
IPOTESI 2: la regia è ridotta a opacità/assenza di materiale.

Tono: ambiguo ma leggibile.
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
          temperature: 0.35,
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

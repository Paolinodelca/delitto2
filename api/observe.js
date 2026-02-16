export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY mancante");
    }

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

    /* =========================
       PROMPT — VERSIONE RIFLESSIVA
    ========================== */

    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO nell’esperienza FRINGE / LEAK.
Ti rivolgi direttamente al giocatore usando “tu”.

NON:
- spiegare cosa è successo
- riassumere i fatti
- correggere il racconto
- suggerire cosa sarebbe stato giusto fare

OSSERVA SOLO:
- come scegli di esporre i fatti
- dove il linguaggio si fa prudente o formale
- come la responsabilità viene distribuita

Scrivi 5–7 frasi.
Tono neutro.
Nessuna frase deve chiudere il senso complessivo.
      `,

      psicologico: `
Sei un OSSERVATORE ESTERNO.
Non fai diagnosi. Non utilizzi linguaggio clinico.
Non attribuisci stati mentali.

OSSERVA:
- come il racconto si protegge
- dove compaiono giustificazioni implicite
- quali passaggi restano non esplorati

NON:
- trarre conclusioni
- nominare emozioni
- interpretare intenzioni

Scrivi 5–7 frasi sobrie.
Il testo deve rimanere aperto.
      `,

      amplificato: `
Sei un OSSERVATORE ESTERNO.

Considera due ipotesi parallele:
1) Le risposte riflettono il modo abituale di pensare e agire del giocatore.
2) Le risposte sono state costruite deliberatamente per ottenere un certo effetto.

Per ciascuna ipotesi:
- descrivi cosa emerge dal modo in cui il racconto è stato costruito
- senza stabilire quale ipotesi sia vera

NON:
- giudicare
- diagnosticare
- concludere

Scrivi 6–8 frasi totali.
Il testo deve rimanere volutamente ambiguo.
      `
    };

    /* =========================
       CONTESTO BLINDATO
    ========================== */

    const userContext = `
SCENARIO (IMMUTABILE):
${scenario}

RUOLI — NON INTERPRETABILI:
- Soggetto osservato: GIOCATORE
- Responsabile gerarchico: ${context?.responsabile || "Walter"}
- Collega / confidente: ${context?.amico || "Alex"}
- Partner affettivo: ${context?.partner || "n/d"}

AMBIENTE:
Azienda che sviluppa tecnologie sensibili.
La sicurezza è una condizione operativa, non simbolica.

MODELLO COMPORTAMENTALE (INDICATIVO):
${JSON.stringify(playerModel, null, 2)}

RISPOSTE FORNITE DAL GIOCATORE:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

RICORRENZE OSSERVATE:
${observedAnchors.length > 0 ? observedAnchors.join(", ") : "nessuna esplicita"}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Osserva esclusivamente la forma dell’esposizione.
    `;

    async function callLLM(systemPrompt) {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
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
        }
      );

      if (!response.ok) {
        throw new Error("Errore LLM");
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
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

  fragments.push(
    "Il racconto mantiene una coerenza formale che non chiarisce le motivazioni."
  );

  if (pressureLevel > 70) {
    fragments.push(
      "La pressione sembra comprimere l’esposizione, riducendo i margini narrativi."
    );
  }

  if (playerModel.stile === "elusivo") {
    fragments.push(
      "Alcune formulazioni limitano l’assunzione diretta di responsabilità."
    );
  }

  if (observedAnchors.length > 0) {
    fragments.push(
      `Alcuni elementi ritornano più volte (${observedAnchors.join(", ")}), senza essere approfonditi.`
    );
  }

  fragments.push(
    "La lettura complessiva dipende dal modo in cui questa esposizione verrà interpretata."
  );

  return fragments.join(" ");
}

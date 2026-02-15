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

    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO in un’esperienza narrativa chiamata FRINGE / LEAK.
Ti rivolgi direttamente al giocatore, usando “tu”.
Osservi postura, controllo e indeterminatezza.
Scrivi 5–7 frasi. Nessuna spiegazione.
      `,
      psicologico: `
Sei un OSSERVATORE ESTERNO.
Osservi difese, giustificazioni, esposizione.
Scrivi 5–7 frasi, tono sobrio.
      `,
      amplificato: `
Sei un OSSERVATORE ESTERNO.
Rendi visibile ciò che è stato evitato.
Scrivi 5–7 frasi, incisive ma contenute.
      `
    };

    const userContext = `
SCENARIO:
${scenario}

CONTESTO:
Responsabile: ${context?.responsabile || "n/d"}
Amico: ${context?.amico || "n/d"}
Partner: ${context?.partner || "n/d"}

MODELLO:
${JSON.stringify(playerModel, null, 2)}

RISPOSTE:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

ANCORE:
${observedAnchors.join(", ")}
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
            temperature: 0.4,
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
   OSSERVAZIONE PROCEDURALE
=========================== */

function proceduralObservation({ pressureLevel, playerModel, observedAnchors }) {
  const fragments = [];

  if (pressureLevel > 70) {
    fragments.push("La pressione ha reso ogni risposta più carica di conseguenze.");
  } else {
    fragments.push("Hai mantenuto una continuità narrativa senza forzature.");
  }

  if (playerModel.stile === "elusivo") {
    fragments.push("Hai ridotto l’esposizione lasciando spazio all’indeterminatezza.");
  }

  if (observedAnchors.length > 0) {
    fragments.push(
      `Alcune formulazioni sono tornate più volte (${observedAnchors.join(", ")}).`
    );
  }

  fragments.push(
    "Non è una questione di verità, ma di come la tua posizione si è resa leggibile."
  );

  return fragments.join(" ");
}

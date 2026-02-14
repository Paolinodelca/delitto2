export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Solo POST consentito" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY mancante" });
    }

    const {
      scenario,
      context,
      playerModel,
      answers
    } = req.body;

    if (!scenario || !playerModel || !answers) {
      return res.status(400).json({ error: "Dati incompleti" });
    }

    /* =========================
       PROMPT VARIANTI
    ========================== */

    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO in un’esperienza narrativa chiamata FRINGE / LEAK.

Non analizzi il sistema.
Non giudichi il soggetto.
Non verifichi i fatti.

Ti rivolgi direttamente al giocatore, usando “tu”.

Restituisci una lettura sobria e contenuta di come il soggetto ha attraversato la situazione.

Osserva:
– cosa viene tenuto sotto controllo
– cosa viene lasciato indeterminato
– che postura emerge sotto pressione

Scrivi un testo compatto (5–7 frasi).
Niente spiegazioni.
È una lettura.
Ed è così che verrà ricordata.
      `,

      psicologico: `
Sei un OSSERVATORE ESTERNO in un’esperienza narrativa chiamata FRINGE / LEAK.

Ti rivolgi direttamente al giocatore, usando “tu”.

Non introduci fatti nuovi.
Non attribuisci intenzioni a terzi.
Non interpreti eventi non esplicitamente dichiarati.

Osservi esclusivamente:
– il modo in cui il soggetto parla di sé
– come gestisce la pressione narrativa
– dove compaiono giustificazioni o difese formali

Evita esempi inventati.
Evita nomi non presenti nel contesto.

Scrivi un testo unitario (5–7 frasi).
È una lettura della postura, non della verità dei fatti.

      `,

      amplificato: `
Sei un OSSERVATORE ESTERNO in un’esperienza narrativa chiamata FRINGE / LEAK.

Ti rivolgi direttamente al giocatore, usando “tu”.

La tua lettura è più incisiva.
Non sei aggressivo, ma non attenui.

Metti in evidenza:
– ambiguità mantenute
– ciò che viene evitato
– il prezzo silenzioso di questa postura

Scrivi un testo compatto (5–7 frasi).
Deve restare addosso, senza alzare la voce.
      `
    };

    const userContext = `
SCENARIO:
${scenario}

CONTESTO RELAZIONALE:
Responsabile: ${context?.responsabile || "n/d"}
Amico: ${context?.amico || "n/d"}
Partner: ${context?.partner || "n/d"}

MODELLO COMPORTAMENTALE:
${JSON.stringify(playerModel, null, 2)}

RISPOSTE DEL SOGGETTO:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}
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

      const data = await response.json();
      if (!response.ok) throw new Error("Errore LLM");

      return data.choices[0].message.content.trim();
    }

    const [fringe, psicologico, amplificato] = await Promise.all([
      callLLM(prompts.fringe),
      callLLM(prompts.psicologico),
      callLLM(prompts.amplificato)
    ]);

    return res.status(200).json({
      osservazioni: {
        fringe,
        psicologico,
        amplificato
      }
    });

  } catch (err) {
  console.error("Errore observe:", err);

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

const {
  scenario,
  context,
  playerModel,
  answers,
  observedAnchors = []
} = req.body;
function proceduralObservation({ pressureLevel, playerModel, observedAnchors }) {
  const fragments = [];

  if (pressureLevel > 70) {
    fragments.push(
      "La pressione accumulata ha reso ogni risposta più carica di conseguenze di quanto apparisse."
    );
  } else {
    fragments.push(
      "Hai mantenuto un controllo sufficiente sul ritmo dell’audizione."
    );
  }

  if (playerModel.difesa === "razionalizzazione") {
    fragments.push(
      "Hai costruito spiegazioni coerenti, orientate a rendere le tue scelte sostenibili."
    );
  }

  if (playerModel.difesa === "indeterminatezza") {
    fragments.push(
      "In più punti hai evitato di fissare una versione definitiva dei fatti."
    );
  }

  if (observedAnchors.length > 0) {
    fragments.push(
      `Alcune formulazioni sono tornate più volte (${observedAnchors.join(", ")}), diventando appigli narrativi.`
    );
  }

  fragments.push(
    "Non è una questione di verità o menzogna, ma di come la tua posizione si è resa abitabile per chi ascolta."
  );

  return fragments.join(" ");
}


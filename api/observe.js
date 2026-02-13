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

Non fai diagnosi.
Non assegni etichette.
Non spieghi il sistema.

Metti in luce le tensioni interne che emergono sotto pressione.

Osserva:
– cosa viene protetto
– dove compare una difesa
– che immagine di sé viene mantenuta

Scrivi un testo unitario (5–7 frasi).
È una lettura psicologica, non una spiegazione.
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
    return res.status(500).json({ error: err.message });
  }
}

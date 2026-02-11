export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Solo POST consentito" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY mancante" });
    }

    const { playerModel, pressureLevel, step, scenario } = req.body;

    if (!playerModel) {
      return res.status(400).json({ error: "playerModel mancante" });
    }

    const systemPrompt = `

Sei un OSSERVATORE ESTERNO in un’esperienza narrativa chiamata FRINGE.

Il tuo compito non è analizzare il sistema,
ma restituire una LETTURA PERSONALE del soggetto osservato.

Parli direttamente al giocatore, usando “tu”.

Non stabilisci colpe.
Non verifichi fatti.
Non spieghi il metodo.

Devi:
- indicare chi viene protetto nelle risposte
- indicare cosa viene sacrificato o lasciato scoperto
- suggerire che immagine del sé emerge sotto pressione

Scrivi una sola lettura compatta (5–7 righe massimo).

È una lettura, non una spiegazione.
È personale, non neutra.
È sobria, ma non impersonale.

Divieti espliciti:
- niente numeri
- niente percentuali
- niente elenchi
- niente ipotesi multiple
- niente linguaggio tecnico o valutativo

`;

    const userPrompt = `

SCENARIO:
${scenario}

CONTESTO RELAZIONALE:
Responsabile: ${context.responsabile}
Amico: ${context.amico}
Partner: ${context.partner}

MODELLO COMPORTAMENTALE:
${JSON.stringify(playerModel, null, 2)}

RISPOSTE DEL SOGGETTO:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

`;

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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.4
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Errore Groq:", data);
      return res.status(500).json(data);
    }

    return res.status(200).json({
      osservazione: data.choices[0].message.content
    });

  } catch (err) {
    console.error("Errore observe:", err);
    return res.status(500).json({ error: err.message });
  }
}

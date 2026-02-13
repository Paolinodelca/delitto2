export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY mancante" });
    }

    const { playerModel, scenarioLabel } = req.body;

    if (!playerModel) {
      return res.status(400).json({ error: "playerModel mancante" });
    }

    const systemPrompt = `
Sei un OSSERVATORE ESTERNO in un’esperienza narrativa chiamata FRINGE.

Parli direttamente al giocatore usando “tu”.

Non analizzi il sistema.
Non spieghi il metodo.
Non ricostruisci i fatti.

Restituisci una LETTURA PERSONALE del soggetto sotto pressione.

Devi:
- indicare chi è stato protetto nelle risposte
- indicare cosa è stato sacrificato o lasciato scoperto
- suggerire che immagine del sé emerge sotto osservazione

Scrivi una sola lettura compatta.
Massimo 5–7 righe.

Divieti assoluti:
- niente numeri
- niente percentuali
- niente elenchi
- niente ipotesi multiple
- niente linguaggio tecnico
- niente spiegazioni
`;

    const userPrompt = `
CONTESTO:
${scenarioLabel || "Audizione interna in contesto aziendale"}

PROFILO COMPORTAMENTALE OSSERVATO:
${JSON.stringify(playerModel, null, 2)}

Restituisci ora la tua lettura.
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
            { role: "system", content: systemPrompt.trim() },
            { role: "user", content: userPrompt.trim() }
          ],
          temperature: 0.6
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Errore Groq:", data);
      return res.status(500).json({ error: "Errore LLM" });
    }

    return res.status(200).json({
      osservazione: data.choices[0].message.content.trim()
    });

  } catch (err) {
    console.error("Errore observe:", err);
    return res.status(500).json({ error: "Errore interno observe" });
  }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Solo POST consentito" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY mancante");

    const { playerModel, pressureLevel, step, scenario } = req.body;

    if (!playerModel) {
      return res.status(400).json({ error: "playerModel mancante" });
    }

    const systemPrompt = `
Sei un OSSERVATORE ESTERNO in un sistema narrativo sperimentale chiamato ${scenario}.

Non parli mai al giocatore.
Non dai giudizi morali.
Non verifichi fatti.

Analizzi SOLO il comportamento osservato.

Produci:
- una LETTURA sintetica (1–2 frasi)
- 2–3 IPOTESI POSSIBILI (non certezze)
- un livello di AFFIDABILITÀ (0–1)

Scrivi in italiano sobrio.
Non usare enfasi.
Non spiegare il tuo metodo.
`;

    const userPrompt = `
STATO OSSERVATO:
pressione=${pressureLevel}
step=${step}

MODELLO DEL GIOCATORE:
${JSON.stringify(playerModel, null, 2)}
`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey
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

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      return res.status(500).json(data);
    }

    res.status(200).json({
      osservazione: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

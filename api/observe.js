module.exports = async function handler(req, res) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY mancante" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Solo POST consentito" });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length < 2) {
      return res.status(400).json({ error: "Risposte insufficienti" });
    }

    const systemPrompt = `
Sei un osservatore cognitivo.

Non giudichi la verità.
Non dai consigli.
Non interpreti intenzioni morali.

Osservi solo come una persona ragiona sotto pressione.

Dato questo scambio di risposte, restituisci SOLO un JSON valido con:

- coerenza: alta | media | bassa
- postura: difensiva | assertiva | evasiva | esplorativa
- segnali_stress: elenco tra
  contraddizione, esitazione, sovragiustificazione, evitamento

Risposte:
1) ${answers[0]}
2) ${answers[1]}

Restituisci SOLO il JSON.
`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: systemPrompt }],
          temperature: 0.2
        })
      }
    );

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      return res.status(500).json({ error: "Errore Groq", details: data });
    }

    const raw = data.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
};

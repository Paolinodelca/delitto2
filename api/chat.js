export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Not allowed" });
  }

  const { message, suspect, memory } = req.body;

  const systemPrompt = `
Sei un personaggio di un gioco investigativo "Delitto in Villa".
Interpreti questo ruolo: ${suspect}.
Hai informazioni rilevanti ma nascondi un segreto.
Rispondi in modo coerente, plausibile, umano.
Non confessare direttamente.
Mantieni continuità narrativa.
`;

  try {
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            ...(memory || []),
            { role: "user", content: message }
          ]
        })
      }
    );

    const data = await groqRes.json();

    if (!data.choices) {
      return res.status(500).json({ error: data });
    }

    res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
